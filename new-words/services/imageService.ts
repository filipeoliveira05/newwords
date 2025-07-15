/**
 * Um serviço centralizado para gerir e aceder a recursos de imagem estáticos.
 * Esta abordagem garante que todos os caminhos de imagem são geridos num único local,
 * facilitando a atualização de recursos e prevenindo importações duplicadas.
 *
 * O uso de `as const` permite que o TypeScript infira os literais de string exatos para as chaves,
 * possibilitando uma verificação de tipo forte com o tipo `ImageName`.
 */
const images = {
  // --- Mascotes ---
  mascotHappy: require("../assets/images/mascot/mascot_happy3.png"),
  mascotNeutral: require("../assets/images/mascot/mascot_neutral.png"),
  mascotSad: require("../assets/images/mascot/mascot_sad.png"),
  mascotConfused: require("../assets/images/mascot/mascot_confused.png"),
  mascotBored: require("../assets/images/mascot/mascot_bored.png"),
  mascotSleep: require("../assets/images/mascot/mascot_sleep.png"),

  // --- Ícones da Aplicação ---
  appIcon: require("../assets/images/adaptive-icon.png"),
  splashIcon: require("../assets/images/splash-icon.png"),

  // --- Ilustrações para estados da UI (placeholders) ---
  // emptyStateDecks: require('../assets/images/illustrations/empty_decks.png'),
  // onboardingWelcome: require('../assets/images/illustrations/welcome.png'),
} as const;

/**
 * Um tipo que representa os nomes válidos para todas as imagens geridas pelo imageService.
 * Isto fornece segurança de tipo e autocompletar ao usar imagens em componentes.
 */
export type ImageName = keyof typeof images;

export default images;
