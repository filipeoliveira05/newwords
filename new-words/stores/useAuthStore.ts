import { create } from "zustand";
import { supabase } from "@/services/supabaseClient";
import { Session, AuthError } from "@supabase/supabase-js";
import { Linking } from "react-native";
import { deleteDatabase, initializeDB, setMetaValue } from "@/services/storage";
import { eventStore } from "./eventStore";

interface AuthState {
  session: Session | null;
  isAuthenticating: boolean;
  isSyncing: boolean; // Novo estado para controlar a sincronização inicial
  hasCompletedOnboarding: boolean; // Novo estado para o onboarding do utilizador
  lastAuthEvent: string | null;
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
  // Ação setLastAuthEvent removida, pois a nova flag a substitui para este fluxo.
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isAuthenticating: true,
  isSyncing: false,
  hasCompletedOnboarding: false,
  lastAuthEvent: null,
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
    supabase.auth.onAuthStateChange((_event, session) => {
      // Adiciona este log para depuração.
      console.log(`[Auth] Evento: ${_event}, Sessão: ${!!session}`);
      set({
        session,
        lastAuthEvent: _event,
        hasCompletedOnboarding:
          session?.user?.user_metadata?.has_completed_onboarding ?? false,
      });
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
    // 1. Termina a sessão no Supabase
    await supabase.auth.signOut();

    // 2. Apaga completamente a base de dados local
    await deleteDatabase();
    await initializeDB(); // Recria as tabelas para um estado limpo

    // 3. Publica um evento para que todos os outros stores se resetem.
    // Isto quebra a dependência circular.
    eventStore.getState().publish("userLoggedOut", {});
    // Garante que todos os estados de autenticação são limpos.
    set({ lastAuthEvent: null, isRecoveringPassword: false });
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
}));
