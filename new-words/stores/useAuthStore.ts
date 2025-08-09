import { create } from "zustand";
import { supabase } from "@/services/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { deleteDatabase, initializeDB } from "@/services/storage";
import { eventStore } from "./eventStore";

interface AuthState {
  session: Session | null;
  isAuthenticating: boolean;
  isSyncing: boolean; // Novo estado para controlar a sincronização inicial
  initialize: () => Promise<void>;
  signInWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    metadata: { firstName: string; lastName: string }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setIsSyncing: (isSyncing: boolean) => void; // Nova action para controlar o estado
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticating: true,
  isSyncing: false,

  initialize: async () => {
    // 1. Tenta obter a sessão ativa quando a app arranca
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, isAuthenticating: false });

    // 2. Ouve alterações no estado de autenticação (login, logout, etc.)
    // O Supabase trata da persistência da sessão no AsyncStorage automaticamente.
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // O onAuthStateChange irá atualizar o estado da sessão automaticamente
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

  signOut: async () => {
    // 1. Termina a sessão no Supabase
    await supabase.auth.signOut();

    // 2. Apaga completamente a base de dados local
    await deleteDatabase();
    await initializeDB(); // Recria as tabelas para um estado limpo

    // 3. Publica um evento para que todos os outros stores se resetem.
    // Isto quebra a dependência circular.
    eventStore.getState().publish("userLoggedOut", {});
  },

  setIsSyncing: (isSyncing) => {
    set({ isSyncing });
  },
}));
