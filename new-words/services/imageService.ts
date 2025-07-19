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
  mascotAmazed: require("../assets/images/mascot/mascot_amazed.png"),
  mascotNeutral: require("../assets/images/mascot/mascot_neutral.png"),
  mascotSad: require("../assets/images/mascot/mascot_sad.png"),
  mascotHappy: require("../assets/images/mascot/mascot_happy.png"),
  mascotMad: require("../assets/images/mascot/mascot_mad.png"),
  mascotConfused: require("../assets/images/mascot/mascot_confused.png"),
  mascotBored: require("../assets/images/mascot/mascot_bored.png"),
  mascotSleep: require("../assets/images/mascot/mascot_sleep.png"),
  mascotRun: require("../assets/images/mascot/mascot_run.png"),
  mascotStretch: require("../assets/images/mascot/mascot_stretch.png"),
  mascotStudy: require("../assets/images/mascot/mascot_study.png"),
  mascotYawn: require("../assets/images/mascot/mascot_yawn.png"),
  mascotBooks: require("../assets/images/mascot/mascot_books.png"), // Onboarding 1
  mascotThink: require("../assets/images/mascot/mascot_think.png"), // Onboarding 2
  mascotPlay: require("../assets/images/mascot/mascot_play.png"), // Onboarding 3
  mascotTrophy: require("../assets/images/mascot/mascot_trophy.png"), // Onboarding 4
  mascotTrophy2: require("../assets/images/mascot/mascot_trophy2.png"),

  // --- Ícones da Aplicação ---
  appIcon: require("../assets/images/mascot/mascot_study.png"),
  splashIcon: require("../assets/images/mascot/mascot_study.png"),
} as const;

/**
 * Um tipo que representa os nomes válidos para todas as imagens geridas pelo imageService.
 * Isto fornece segurança de tipo e autocompletar ao usar imagens em componentes.
 */
export type ImageName = keyof typeof images;

export default images;
