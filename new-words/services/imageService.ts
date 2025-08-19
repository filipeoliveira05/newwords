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
  mascotSleepBook: require("../assets/images/mascot/mascot_sleep_book.png"),
  mascotSleepSofa: require("../assets/images/mascot/mascot_sleep_sofa.png"),
  mascotSleepFloor: require("../assets/images/mascot/mascot_sleep_floor.png"),
  mascotRun: require("../assets/images/mascot/mascot_run.png"),
  mascotStretch: require("../assets/images/mascot/mascot_stretch.png"),
  mascotStudy: require("../assets/images/mascot/mascot_study.png"),
  mascotYawn: require("../assets/images/mascot/mascot_yawn.png"),
  mascotYawn2: require("../assets/images/mascot/mascot_yawn2.png"),
  mascotWalk: require("../assets/images/mascot/mascot_walk.png"),
  mascotMeditate: require("../assets/images/mascot/mascot_meditate.png"),
  mascotMedal: require("../assets/images/mascot/mascot_medal.png"),
  mascotRocket: require("../assets/images/mascot/mascot_rocket.png"),
  mascotPray: require("../assets/images/mascot/mascot_pray.png"),
  mascotHero: require("../assets/images/mascot/mascot_hero.png"),
  mascotListen: require("../assets/images/mascot/mascot_listen.png"),
  mascotStairs: require("../assets/images/mascot/mascot_stairs.png"),
  mascotCry: require("../assets/images/mascot/mascot_cry.png"),
  mascotWrite: require("../assets/images/mascot/mascot_write.png"),
  mascotBulb: require("../assets/images/mascot/mascot_bulb.png"),
  mascotCelebration: require("../assets/images/mascot/mascot_celebration.png"),
  mascotLove: require("../assets/images/mascot/mascot_love.png"),
  mascotNinjaRed: require("../assets/images/mascot/mascot_ninjaRed.png"),
  mascotNinjaRed2: require("../assets/images/mascot/mascot_ninjaRed2.png"),
  mascotTea: require("../assets/images/mascot/mascot_tea.png"),
  mascotTime: require("../assets/images/mascot/mascot_time.png"),
  mascotMap: require("../assets/images/mascot/mascot_map.png"),
  mascotTalk: require("../assets/images/mascot/mascot_talk.png"),
  mascotProgress: require("../assets/images/mascot/mascot_progress.png"),
  mascotRobot: require("../assets/images/mascot/mascot_robot.png"),
  mascotUnimpressed: require("../assets/images/mascot/mascot_unimpressed.png"),
  mascotWorry: require("../assets/images/mascot/mascot_worry.png"),
  mascotCalendar: require("../assets/images/mascot/mascot_calendar.png"),
  mascotCalendar2: require("../assets/images/mascot/mascot_calendar2.png"),
  mascotChecklist: require("../assets/images/mascot/mascot_checklist.png"),
  mascotMelancholic: require("../assets/images/mascot/mascot_melancholic.png"),
  mascotPillowLaugh: require("../assets/images/mascot/mascot_pillowLaugh.png"),
  mascotPodiumCompleteFirst: require("../assets/images/mascot/mascot_podium_complete_first.png"),
  mascotPodiumCompleteSecond: require("../assets/images/mascot/mascot_podium_complete_second.png"),
  mascotPodiumSimpleThird: require("../assets/images/mascot/mascot_podium_simple_third.png"),
  mascotPodiumCompleteThird: require("../assets/images/mascot/mascot_podium_complete_third.png"),
  mascotWindowSad: require("../assets/images/mascot/mascot_windowSad.png"),
  mascotChip: require("../assets/images/mascot/mascot_chip.png"),
  mascotConstruction: require("../assets/images/mascot/mascot_construction.png"),
  mascotFlag: require("../assets/images/mascot/mascot_flag.png"),
  mascotGear: require("../assets/images/mascot/mascot_gear.png"),
  mascotHi: require("../assets/images/mascot/mascot_hi.png"),
  mascotBeachNet: require("../assets/images/mascot/mascot_beachNet.png"),
  mascotConstructionWarning: require("../assets/images/mascot/mascot_constructionWarning.png"),
  mascotAstronaut: require("../assets/images/mascot/mascot_astronaut.png"),
  mascotBooks2: require("../assets/images/mascot/mascot_books2.png"),
  mascotBooks: require("../assets/images/mascot/mascot_books.png"), // Onboarding 1
  mascotThink: require("../assets/images/mascot/mascot_think.png"), // Onboarding 2
  mascotPlayGame: require("../assets/images/mascot/mascot_play_game.png"), // Onboarding 3
  mascotPlayCubes: require("../assets/images/mascot/mascot_play_cubes.png"),
  mascotTrophy: require("../assets/images/mascot/mascot_trophy.png"), // Onboarding 4
  mascotTrophy2: require("../assets/images/mascot/mascot_trophy2.png"),

  // Inspiration / To Improve
  // mascotChef: require("../assets/images/mascot/inspiration/mascot_chef.png"),
  // mascotPodium2: require("../assets/images/mascot/inspiration/mascot_podium2.png"),
  // mascotWrite2: require("../assets/images/mascot/inspiration/mascot_write2.png"),
  // mascotWrite3: require("../assets/images/mascot/inspiration/mascot_write3.png"),
  // mascotNinjaBlack: require("../assets/images/mascot/inspiration/mascot_ninjaBlack.png"),
  // mascotMapAmazed: require("../assets/images/mascot/inspiration/mascot_map_amazed.png"),
  // mascotPodiumSimpleThird2: require("../assets/images/mascot/inspiration/mascot_podium_simple_third2.png"),
  // mascotPodiumCompleteSecond2: require("../assets/images/mascot/inspiration/mascot_podium_complete_second2.png"),

  // --- Ícones da Aplicação ---
  appIcon: require("../assets/images/app_icon.png"),
  appIconBlue: require("../assets/images/app_iconBlue.png"),
  appIconCircle: require("../assets/images/app_iconCircle.png"),
  appMascotName: require("../assets/images/app_mascotName.png"),
  splashScreen: require("../assets/images/splashScreen_vertical.png"),
  splashScreenDark: require("../assets/images/splashScreenDark_vertical.png"),
  splashScreenBlue: require("../assets/images/splashScreenBlue_vertical.png"),
  splashScreenHorizontal: require("../assets/images/splashScreen_horizontal.png"),
  appName: require("../assets/images/app_name.png"),
} as const;

/**
 * Um tipo que representa os nomes válidos para todas as imagens geridas pelo imageService.
 * Isto fornece segurança de tipo e autocompletar ao usar imagens em componentes.
 */
export type ImageName = keyof typeof images;

export default images;
