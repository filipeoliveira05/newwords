import { AuthError } from "@supabase/supabase-js";

/**
 * Traduz um objeto de erro do Supabase Auth para uma mensagem amigável para o utilizador.
 * @param error O objeto de erro retornado pelo Supabase.
 * @returns Uma string com a mensagem de erro personalizada.
 */
export const getFriendlyAuthErrorMessage = (error: AuthError): string => {
  // Mensagem padrão para erros desconhecidos ou não tratados.
  const defaultMessage =
    "Ocorreu um erro inesperado. Por favor, tente novamente.";

  // Mapeamento de mensagens de erro do Supabase para mensagens personalizadas.
  // Usamos .includes() para ser mais robusto a pequenas alterações no texto do erro.
  if (error.message.includes("User already registered")) {
    return "Já existe uma conta com este endereço de email. Tente fazer login.";
  }
  if (error.message.includes("Invalid login credentials")) {
    return "As suas credenciais estão incorretas. Por favor, verifique e tente novamente.";
  }
  if (error.message.includes("Password should be at least")) {
    // Podemos extrair o número de caracteres se quisermos ser mais específicos no futuro.
    return "A sua palavra-passe deve ter pelo menos 6 caracteres.";
  }
  if (error.message.includes("Email not confirmed")) {
    return "Por favor, confirme o seu email antes de fazer login. Verifique a sua caixa de entrada.";
  }
  if (
    error.message.includes(
      "New password should be different from the old password."
    )
  ) {
    return "A nova palavra-passe deve ser diferente da antiga.";
  }

  // Se o erro não for reconhecido, registamos na consola para depuração
  // e retornamos a mensagem padrão.
  console.warn("Unhandled Supabase Auth Error:", error.message);
  return defaultMessage;
};
