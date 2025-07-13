import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Word } from "../types/database";
import { IconName } from "../app/components/Icon";
import { theme } from "../config/theme";

export type SortCriterion =
  | "createdAt"
  | "isFavorite"
  | "masteryLevel"
  | "timesTrained"
  | "timesCorrect"
  | "timesIncorrect"
  | "lastAnswerCorrect"
  | "lastTrained"
  | "name";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  criterion: SortCriterion;
  direction: SortDirection;
}

export const sortOptions: {
  label: string;
  criterion: SortCriterion;
  direction: SortDirection;
}[] = [
  { label: "Favoritos Primeiro", criterion: "isFavorite", direction: "desc" },
  {
    label: "Data de Criação (Mais Recentes)",
    criterion: "createdAt",
    direction: "desc",
  },
  {
    label: "Data de Criação (Mais Antigas)",
    criterion: "createdAt",
    direction: "asc",
  },
  { label: "Ordem Alfabética (A-Z)", criterion: "name", direction: "asc" },
  { label: "Ordem Alfabética (Z-A)", criterion: "name", direction: "desc" },
  {
    label: "Nível (Ascendente)",
    criterion: "masteryLevel",
    direction: "asc",
  },
  {
    label: "Nível (Descendente)",
    criterion: "masteryLevel",
    direction: "desc",
  },
  {
    label: "Vezes Praticadas (Menos)",
    criterion: "timesTrained",
    direction: "asc",
  },
  {
    label: "Vezes Praticadas (Mais)",
    criterion: "timesTrained",
    direction: "desc",
  },
  {
    label: "Respostas Corretas (Mais)",
    criterion: "timesCorrect",
    direction: "desc",
  },
  {
    label: "Respostas Incorretas (Mais)",
    criterion: "timesIncorrect",
    direction: "desc",
  },
  {
    label: "Última Resposta (Erradas primeiro)",
    criterion: "lastAnswerCorrect",
    direction: "asc",
  },
  {
    label: "Última Resposta (Certas primeiro)",
    criterion: "lastAnswerCorrect",
    direction: "desc",
  },
  {
    label: "Última Prática (Mais Recente)",
    criterion: "lastTrained",
    direction: "desc",
  },
  {
    label: "Última Prática (Mais Antiga)",
    criterion: "lastTrained",
    direction: "asc",
  },
];

export const useWordSorting = (wordsToSort: Word[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    criterion: "createdAt",
    direction: "desc",
  });

  const sortedWords = useMemo(() => {
    const wordsToDisplay = [...wordsToSort];
    const { criterion, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;
    const masteryMap = { new: 1, learning: 2, mastered: 3 };

    wordsToDisplay.sort((wordA, wordB) => {
      let comparison = 0;
      switch (criterion) {
        case "isFavorite":
          comparison = (wordB.isFavorite ?? 0) - (wordA.isFavorite ?? 0);
          break;
        case "name":
          comparison = wordA.name.localeCompare(wordB.name) * dir;
          break;
        case "masteryLevel":
          comparison =
            (masteryMap[wordA.masteryLevel] - masteryMap[wordB.masteryLevel]) *
            dir;
          break;
        case "createdAt":
          comparison =
            (new Date(wordA.createdAt).getTime() -
              new Date(wordB.createdAt).getTime()) *
            dir;
          break;
        case "lastTrained":
          const dateA = wordA.lastTrained
            ? new Date(wordA.lastTrained).getTime()
            : 0;
          const dateB = wordB.lastTrained
            ? new Date(wordB.lastTrained).getTime()
            : 0;
          comparison = (dateA - dateB) * dir;
          break;
        case "lastAnswerCorrect":
          const answerA = wordA.lastAnswerCorrect ?? -1;
          const answerB = wordB.lastAnswerCorrect ?? -1;
          comparison = (answerA - answerB) * dir;
          break;
        case "timesTrained":
        case "timesCorrect":
        case "timesIncorrect":
          const valA = (wordA as any)[criterion] ?? 0;
          const valB = (wordB as any)[criterion] ?? 0;
          comparison = (valA - valB) * dir;
          break;
      }

      if (comparison === 0 && criterion !== "name") {
        return wordA.name.localeCompare(wordB.name);
      }

      return comparison;
    });

    return wordsToDisplay;
  }, [wordsToSort, sortConfig]);

  return { sortedWords, sortConfig, setSortConfig };
};

export const getDisplayDataForWord = (
  word: Word,
  criterion: SortCriterion
): {
  value?: string | number;
  label?: string;
  displayIcon?: { name: IconName; color: string };
} => {
  const formatNullableDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    try {
      return format(parseISO(dateString), "dd MMM", { locale: pt });
    } catch (e) {
      console.error("Data com formato nulo.", e);
      return "Inválida";
    }
  };

  switch (criterion) {
    case "timesTrained":
      return { value: word.timesTrained, label: "vezes" };
    case "timesCorrect":
      return { value: word.timesCorrect, label: "certas" };
    case "timesIncorrect":
      return { value: word.timesIncorrect, label: "erradas" };
    case "masteryLevel":
      return {};
    case "lastTrained":
      return {
        value: formatNullableDate(word.lastTrained),
        label: "últ. prática",
      };
    case "createdAt":
      return { value: formatNullableDate(word.createdAt), label: "criação" };
    case "lastAnswerCorrect":
      if (word.lastAnswerCorrect === null)
        return { value: "N/A", label: "últ. resp." };
      return {
        displayIcon: {
          name:
            word.lastAnswerCorrect === 1 ? "checkmarkCircle" : "closeCircle",
          color:
            word.lastAnswerCorrect === 1
              ? theme.colors.success
              : theme.colors.danger,
        },
        label: "últ. resp.",
      };
    default:
      return {};
  }
};
