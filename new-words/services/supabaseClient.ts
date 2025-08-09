import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Obtém as credenciais do Supabase a partir das variáveis de ambiente.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "As credenciais do Supabase (URL e Anon Key) devem ser definidas nas variáveis de ambiente."
  );
}

// Inicializa o cliente Supabase, configurando-o para usar o AsyncStorage
// para persistir a sessão do utilizador de forma segura no dispositivo.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Esta opção DEVE ser true para que o fluxo de recuperação de palavra-passe
    // (e outros fluxos de OAuth, como login com Google) funcione corretamente.
    // Permite que o Supabase leia o token de acesso do URL quando a app é aberta por um deep link.
    detectSessionInUrl: true,
  },
});
