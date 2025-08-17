import { differenceInDays } from "date-fns";
import { DailyGoal } from "@/config/dailyGoals";
import { PracticeHistory } from "@/types/database";
// --- Helper Functions & Data ---

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// --- Message Templates ---

const firstSessionTemplates = [
  "Bem-vindo ao início da tua jornada, {name}! Cada palavra é uma conquista.",
  "A primeira sessão é sempre especial. Bora deixar a curiosidade guiar-te, {name}!",
  "Estás prestes a abrir as portas de um novo mundo, {name}!",
];

const longPauseTemplates = [
  "Sentimos a tua falta, {name}! Vamos retomar de onde paraste?",
  "O mais importante é voltar. Que bom ter-te de volta, {name}!",
  "As palavras estavam com saudades tuas, {name}!",
];

const streakMilestoneTemplates = [
  "🔥 {consecutiveDays} dias seguidos! A tua consistência é impressionante, {name}!",
  "Estás a criar um hábito poderoso. Já vais com {consecutiveDays} dias seguidos!",
  "{consecutiveDays} dias de treino! Quem te para, {name}?",
];

const allGoalsDoneTemplates = [
  "Objetivos do dia completados! Missão cumprida, {name}!",
  "Mais um check na tua lista de vitórias hoje, {name}!",
  "Boa! Cumpriste as tuas metas diárias, e com estilo!",
];

const highVolumePracticeTemplates = [
  "Treinaste {numWords} palavras hoje. Que dedicação, {name}!",
  "Foi uma verdadeira maratona de vocabulário. Excelente trabalho!",
  "{numWords} palavras praticadas hoje! Estás a jogar em modo avançado.",
];

const masteredWordsMilestoneTemplates = [
  "Já dominaste {totalMasteredWords} palavras. Estás a construir um vocabulário imbatível!",
  "O teu dicionário interno está a crescer rápido, {name}!",
  "{totalMasteredWords} palavras memorizadas. És imparável!",
];

const returningUserTemplates = [
  "Que bom te ver por aqui, {name}!",
  "De volta à ação, {name}!",
  "Continue o bom trabalho, {name}!",
  "Cada sessão conta, {name}. Vamos em frente!",
  "A prática leva à perfeição, {name}. Vamos lá!",
  "Mais um dia, mais progresso, {name}!",
  "Vamos manter o ritmo, {name}!",
];

const genericTemplates = [
  "Olá, {name}!",
  "O que vamos treinar hoje, {name}?",
  "Vamos a isso, {name}!",
  "Hora de expandir o vocabulário, {name}!",
  "Vamos aprender algo novo hoje, {name}?",
  "Tudo a postos para uma sessão, {name}?",
  "Bora praticar, {name}!",
  "Que tal aprender umas palavras novas, {name}?",
];

// --- Rule Engine ---

export interface WelcomeMessageContext {
  user: { firstName?: string | null } | null;
  lastPracticeDate: string | null;
  totalWords: number;
  dailyGoals: (DailyGoal & { current: number })[];
  consecutiveDays: number;
  todaysPractice: PracticeHistory | null;
  wordsMastered: number;
}

interface WelcomeMessageRule {
  condition: (context: WelcomeMessageContext) => boolean;
  getMessage: (context: WelcomeMessageContext) => string;
}

const rules: WelcomeMessageRule[] = [
  // Priority 1: First Session Ever
  {
    condition: ({ lastPracticeDate, totalWords }) =>
      !lastPracticeDate && totalWords < 5,
    getMessage: ({ user }) =>
      getRandomItem(firstSessionTemplates).replace("{name}", user!.firstName!),
  },
  // Priority 2: Return After Long Pause
  {
    condition: ({ lastPracticeDate }) => {
      const daysSinceLastPractice = lastPracticeDate
        ? differenceInDays(new Date(), new Date(lastPracticeDate))
        : 0;
      return daysSinceLastPractice > 5;
    },
    getMessage: ({ user }) =>
      getRandomItem(longPauseTemplates).replace("{name}", user!.firstName!),
  },
  // Priority 3: All Daily Goals Completed
  {
    condition: ({ dailyGoals }) =>
      dailyGoals.length > 0 && dailyGoals.every((g) => g.current >= g.target),
    getMessage: ({ user }) =>
      getRandomItem(allGoalsDoneTemplates).replace("{name}", user!.firstName!),
  },
  // Priority 4: Streak Milestones
  {
    condition: ({ consecutiveDays }) =>
      [3, 5, 7, 10, 15, 20, 30, 50, 100].includes(consecutiveDays),
    getMessage: ({ consecutiveDays, user }) =>
      getRandomItem(streakMilestoneTemplates)
        .replace("{consecutiveDays}", consecutiveDays.toString())
        .replace("{name}", user!.firstName!),
  },
  // Priority 5: High Volume Practice Today
  {
    condition: ({ todaysPractice }) =>
      (todaysPractice?.words_trained ?? 0) >= 50,
    getMessage: ({ todaysPractice, user }) =>
      getRandomItem(highVolumePracticeTemplates)
        .replace("{numWords}", (todaysPractice?.words_trained ?? 0).toString())
        .replace("{name}", user!.firstName!),
  },
  // Priority 6: Mastered Words Milestones
  {
    condition: ({ wordsMastered }) =>
      [10, 25, 50, 100, 200, 500].includes(wordsMastered),
    getMessage: ({ wordsMastered, user }) =>
      getRandomItem(masteredWordsMilestoneTemplates)
        .replace("{totalMasteredWords}", wordsMastered.toString())
        .replace("{name}", user!.firstName!),
  },
  // Fallback: Regular returning user or generic
  {
    condition: () => true, // This will always match if no other rule does
    getMessage: ({ consecutiveDays, user }) => {
      const templates =
        consecutiveDays >= 2
          ? [...returningUserTemplates, ...genericTemplates]
          : genericTemplates;
      return getRandomItem(templates).replace("{name}", user!.firstName!);
    },
  },
];

export const getPersonalizedWelcomeMessage = (
  context: WelcomeMessageContext
): string => {
  if (!context.user?.firstName) {
    return "Bem-vindo(a)!";
  }

  // Encontra a primeira regra que corresponde ao contexto e retorna a sua mensagem.
  const matchingRule = rules.find((rule) => rule.condition(context));

  return matchingRule ? matchingRule.getMessage(context) : "Olá!";
};
