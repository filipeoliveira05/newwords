/**
 * Barrel file para exportar todos os componentes de slide do resumo semanal.
 * Isto permite importá-los de forma mais limpa no ecrã principal, e.g.:
 * import { IntroSlide, MetricsSlide } from './slides';
 */

// --- Slide 1: Abertura Cativante ---
export { default as IntroSlide } from "./IntroSlide";

// --- Slide 2: O Seu Maior Feito ---
export { default as MainHighlightSlide } from "./MainHighlightSlide";
export type { HighlightData } from "./MainHighlightSlide";

// --- Slide 3: A Força do Hábito ---
export { default as ConsistencyHabitSlide } from "./ConsistencyHabitSlide";
export type { ConsistencyHabitData } from "./ConsistencyHabitSlide";

// --- Slide 4: O Seu Esforço em Números ---
export { default as MetricsSlide } from "./MetricsSlide";

// --- Slide 5: Performance de Elite ---
export { default as PerformanceSlide } from "./PerformanceSlide";

// --- Slide 6: Mergulho Profundo ---
export { default as DeepDiveSlide } from "./DeepDiveSlide";

// --- Slide 7: A Sua Evolução ---
export { default as ComparisonSlide } from "./ComparisonSlide";

// --- Slide 8: Liga Semanal ---
export { default as LeaguePerformanceSlide } from "./LeaguePerformanceSlide";

// --- Slide 9: Partilha ---
export { default as ShareableRecapSlide } from "./ShareableRecapSlide";

// --- Slide 10: Conclusão ---
export { default as FinalSlide } from "./FinalSlide";
