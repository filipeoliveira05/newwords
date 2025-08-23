import { create } from "zustand";
import { supabase } from "@/services/supabaseClient";
import { Session, AuthError } from "@supabase/supabase-js";
import { Linking } from "react-native";
import { deleteDatabase, initializeDB, setMetaValue } from "@/services/storage";
import {
  clearLastSyncTimestamp,
  getLastLoggedInUserId,
  setLastLoggedInUserId,
} from "@/services/syncState";
import { synchronize } from "@/services/syncService";
import { useNotificationStore } from "./useNotificationStore";
import { eventStore } from "./eventStore";

interface AuthState {
  session: Session | null;
  isAuthenticating: boolean;
  isSyncing: boolean; // Novo estado para controlar a sincronização inicial
  hasCompletedOnboarding: boolean; // Novo estado para o onboarding do utilizador
  lastAuthEvent: string | null;
  isManuallySyncing: boolean;
  isRecoveringPassword: boolean;
  initialize: () => Promise<void>;
  signInWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ error: AuthError | null }>;
  // A função signInWithGoogle é removida.
  // A lógica de autenticação com Google passa a ser gerida pelo LoginScreen com expo-auth-session,
  // que depois chama esta função para validar o token.
  signInWithIdToken: (idToken: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    metadata: { firstName: string; lastName: string }
  ) => Promise<{ error: AuthError | null }>;
  updateUserPassword: (
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (
    email: string
  ) => Promise<{ error: AuthError | null }>;
  completeOnboarding: () => Promise<{ error: AuthError | null }>;
  setIsSyncing: (isSyncing: boolean) => void; // Nova action para controlar o estado
  runAutomaticSync: () => Promise<void>;
  manualSync: () => Promise<void>;
  // Ação setLastAuthEvent removida, pois a nova flag a substitui para este fluxo.
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isAuthenticating: true,
  isSyncing: false,
  hasCompletedOnboarding: false,
  lastAuthEvent: null,
  isManuallySyncing: false,
  isRecoveringPassword: false,

  initialize: async () => {
    // 1. Tenta obter a sessão ativa quando a app arranca
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      session,
      isAuthenticating: false,
      hasCompletedOnboarding:
        session?.user?.user_metadata?.has_completed_onboarding ?? false,
    });

    // 2. Ouve alterações no estado de autenticação (login, logout, etc.)
    // O Supabase trata da persistência da sessão no AsyncStorage automaticamente.
    supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(`[Auth] Evento: ${_event}, Sessão: ${!!session?.user?.id}`);

      // --- Lógica de Troca de Utilizador ---
      if (_event === "SIGNED_IN" && session) {
        const lastUserId = await getLastLoggedInUserId();
        const newUserId = session.user.id;

        if (lastUserId && lastUserId !== newUserId) {
          console.log(
            "[Auth] Detetada troca de utilizador. A limpar dados locais..."
          );
          // Apaga a base de dados do utilizador anterior.
          await deleteDatabase();
          // Limpa o timestamp de sincronização para forçar um full pull.
          await clearLastSyncTimestamp();
          // Recria as tabelas para um estado limpo.
          await initializeDB();
          // Publica um evento para que todos os outros stores se resetem.
          eventStore.getState().publish("userLoggedOut", {});
        }
        // Guarda o ID do novo utilizador.
        await setLastLoggedInUserId(newUserId);
      }

      // --- Lógica de Sincronização de Perfil ---
      // Esta função garante que os dados do perfil do provedor (ex: Google) ou do registo por email
      // são sincronizados para a nossa base de dados local e para os metadados do Supabase,
      // garantindo uma UI reativa e consistente.
      const syncUserProfile = async (session: Session) => {
        const { user_metadata } = session.user;
        // Caso 1: Login com provedor (ex: Google) que fornece 'full_name' mas não 'first_name'
        if (user_metadata.full_name && !user_metadata.first_name) {
          console.log(
            "[Auth] A sincronizar perfil do provedor pela primeira vez..."
          );
          const nameParts = user_metadata.full_name.split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // 1. Atualiza os metadados no Supabase Auth para persistir.
          await supabase.auth.updateUser({
            data: {
              first_name: firstName,
              last_name: lastName,
              profile_picture_url: user_metadata.avatar_url,
              // Garante que o onboarding é marcado como completo para novos utilizadores do Google.
              has_completed_onboarding: true,
            },
          });

          // 2. Atualiza a base de dados local para a UI reagir imediatamente.
          await Promise.all([
            setMetaValue("first_name", firstName),
            setMetaValue("last_name", lastName),
            setMetaValue("email", user_metadata.email || ""),
            setMetaValue("profile_picture_url", user_metadata.avatar_url || ""),
            setMetaValue("profile_picture_path", ""), // Limpa o caminho do avatar personalizado
          ]);

          // 3. Notifica o resto da app que o perfil foi atualizado.
          eventStore.getState().publish("userProfileUpdated", {});
        }
        // Caso 2: Registo com email/pass, onde os metadados já existem
        // Isto garante que os dados locais são atualizados imediatamente,
        // sem esperar pelo sync completo, para uma melhor UX.
        else if (user_metadata.first_name) {
          console.log(
            "[Auth] A sincronizar perfil de email/pass para a DB local..."
          );
          await Promise.all([
            setMetaValue("first_name", user_metadata.first_name),
            setMetaValue("last_name", user_metadata.last_name || ""),
            setMetaValue("email", session.user.email || ""),
          ]);
          eventStore.getState().publish("userProfileUpdated", {});
        }
      };

      // --- Lógica de Estado da Sessão e Sincronização Inicial ---
      set({
        session,
        lastAuthEvent: _event,
        hasCompletedOnboarding:
          session?.user?.user_metadata?.has_completed_onboarding ?? false,
      });

      // A orquestração da sincronização inicial acontece aqui.
      if ((_event === "SIGNED_IN" || _event === "INITIAL_SESSION") && session) {
        console.log(
          "[Auth] Sessão válida detetada. A preparar para sincronizar."
        );
        // 1. Garante que os dados do perfil (ex: Google) são guardados localmente PRIMEIRO.
        await syncUserProfile(session);

        // 2. Dispara a sincronização automática.
        // Agora, quando a sincronização correr, os dados locais já estarão corretos.
        console.log(
          "[Auth] Perfil pronto. A iniciar sincronização automática."
        );
        get().runAutomaticSync();
      }
    });

    // 3. Lida com deep links para resolver a condição de corrida.
    // Isto garante que o onAuthStateChange já está a ouvir antes de processarmos o URL.
    const handleDeepLink = (url: string | null) => {
      if (!url) {
        return;
      }

      const fragment = url.split("#")[1];
      if (!fragment) {
        return;
      }

      const params = new URLSearchParams(fragment);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      // Se tivermos tokens de acesso, é um redirecionamento de autenticação.
      if (accessToken && refreshToken) {
        if (type === "recovery") {
          // É um link de recuperação de palavra-passe
          console.log(
            "[Auth] A definir sessão a partir do deep link de recuperação..."
          );
          set({ isRecoveringPassword: true });
        } else {
          // É um login OAuth (Google, etc.)
          console.log("[Auth] A definir sessão a partir do deep link OAuth...");
        }
        // Define a sessão manualmente para garantir que o onAuthStateChange é disparado.
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    };

    // Verifica se a app foi aberta por um link (arranque a frio)
    Linking.getInitialURL().then(handleDeepLink);

    // Ouve por novos links enquanto a app está aberta
    Linking.addEventListener("url", (event) => handleDeepLink(event.url));
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // O onAuthStateChange irá atualizar o estado da sessão automaticamente
    return { error };
  },

  signInWithIdToken: async (idToken: string) => {
    // Usa o id_token obtido do Google para fazer login no Supabase de forma segura.
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    // O onAuthStateChange tratará da atualização do estado da sessão.
    return { error };
  },

  signUpWithEmail: async (email, password, metadata) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.firstName.trim(),
          last_name: metadata.lastName.trim(),
          // Garante que o onboarding é marcado como completo para novos utilizadores de email/pass.
          has_completed_onboarding: true,
        },
      },
    });
    // O onAuthStateChange irá atualizar o estado da sessão automaticamente
    return { error };
  },

  updateUserPassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },

  signOut: async () => {
    const { session } = get();
    // 1. Tenta uma sincronização final antes de fazer logout.
    // Não bloqueia o logout se falhar (e.g., offline).
    if (session?.user) {
      try {
        console.log("[Auth] A realizar sincronização final antes do logout...");
        await synchronize(session.user.id);
      } catch (err) {
        console.error(
          "[Auth] Sincronização final falhou, mas a continuar com o logout:",
          err
        );
      }
    }

    // 2. Termina a sessão no Supabase, o que irá disparar o onAuthStateChange
    await supabase.auth.signOut();

    // 3. Publica um evento para que todos os outros stores limpem o seu estado em memória.
    // A base de dados local NÃO é apagada aqui.
    eventStore.getState().publish("userLoggedOut", {});
    // 4. Garante que o estado local da store de autenticação é limpo.
    set({ isRecoveringPassword: false });
  },

  sendPasswordResetEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Para produção, o ideal é configurar um deep link para a sua aplicação.
      // Ex: redirectTo: 'newwords://auth/update-password'
      // Durante o desenvolvimento, o Supabase usará o "Site URL" definido no seu painel
      // de autenticação como base.
    });

    return { error };
  },

  completeOnboarding: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.updateUser({
      data: { has_completed_onboarding: true },
    });
    if (!error && user) {
      // Atualiza também o valor na base de dados local para consistência.
      await setMetaValue("has_completed_onboarding", "true");
      set({ hasCompletedOnboarding: true });
    }
    return { error };
  },

  setIsSyncing: (isSyncing) => {
    set({ isSyncing });
  },

  runAutomaticSync: async () => {
    const { session, isSyncing, setIsSyncing } = get();
    if (isSyncing) {
      console.log("Automatic Sync: Already in progress. Skipping.");
      return;
    }
    if (!session?.user) {
      console.log("Automatic Sync: No user session, skipping.");
      return;
    }

    setIsSyncing(true);
    try {
      await synchronize(session.user.id);
    } catch (error) {
      console.error("Automatic sync failed:", error);
      // Opcional: notificar sobre falha automática
    } finally {
      setIsSyncing(false);
    }
  },

  manualSync: async () => {
    const { session, isManuallySyncing, setIsSyncing } = get();
    if (isManuallySyncing) {
      console.log("Manual Sync: Already in progress. Skipping.");
      return;
    }
    if (!session?.user) {
      console.error("Manual Sync: No user session found.");
      useNotificationStore.getState().addNotification({
        id: `sync-error-nouser-${Date.now()}`,
        type: "error",
        icon: "cloudOffline",
        title: "Erro de Sincronização",
        subtitle: "Não foi encontrada uma sessão de utilizador ativa.",
      });
      return;
    }

    set({ isManuallySyncing: true }); // Controla o spinner do botão
    setIsSyncing(true); // Controla o loading global, se houver
    try {
      const success = await synchronize(session.user.id);
      if (success) {
        useNotificationStore.getState().addNotification({
          id: `sync-success-${Date.now()}`,
          type: "generic",
          icon: "cloudDone",
          title: "Sincronização Concluída",
          subtitle: "Os seus dados estão seguros na nuvem.",
        });
      } else {
        throw new Error("A sincronização falhou ou foi ignorada.");
      }
    } catch (error) {
      useNotificationStore.getState().addNotification({
        id: `sync-error-${Date.now()}`,
        type: "error",
        icon: "cloudOffline",
        title: "Falha na Sincronização",
        subtitle: "Verifique a sua ligação à internet e tente novamente.",
      });
      console.log("Falha na sincronização manual: ", error);
    } finally {
      set({ isManuallySyncing: false });
      setIsSyncing(false);
    }
  },
}));
