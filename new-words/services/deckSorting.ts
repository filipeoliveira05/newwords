import { useState, useMemo } from "react";
import { Deck } from "../types/database";

/**
 * Extends the base Deck type with calculated statistics needed for sorting.
 * These stats are expected to be computed and passed to the sorting hook.
 */
export interface DeckWithStats extends Deck {
  wordCount: number;
  masteredCount: number;
}

export type DeckSortCriterion = "createdAt" | "title" | "difficulty";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  criterion: DeckSortCriterion;
  direction: SortDirection;
}

export const deckSortOptions: {
  label: string;
  criterion: DeckSortCriterion;
  direction: SortDirection;
}[] = [
  {
    label: "Data de Criação (Mais Antigas)",
    criterion: "createdAt",
    direction: "asc",
  },
  {
    label: "Data de Criação (Mais Recentes)",
    criterion: "createdAt",
    direction: "desc",
  },
  {
    label: "Ordem Alfabética (A-Z)",
    criterion: "title",
    direction: "asc",
  },
  {
    label: "Ordem Alfabética (Z-A)",
    criterion: "title",
    direction: "desc",
  },
  {
    label: "Mais Difíceis",
    criterion: "difficulty",
    direction: "desc",
  },
];

export const useDeckSorting = (decksToSort: DeckWithStats[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    criterion: "createdAt",
    direction: "desc",
  });

  const sortedDecks = useMemo(() => {
    const decksToDisplay = [...decksToSort];
    const { criterion, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;

    decksToDisplay.sort((deckA, deckB) => {
      let comparison = 0;
      switch (criterion) {
        case "title":
          comparison = deckA.title.localeCompare(deckB.title) * dir;
          break;
        case "createdAt":
          comparison =
            (new Date(deckA.createdAt).getTime() -
              new Date(deckB.createdAt).getTime()) *
            dir;
          break;
        case "difficulty":
          const difficultyA =
            deckA.wordCount > 0
              ? (deckA.wordCount - deckA.masteredCount) / deckA.wordCount
              : 0;
          const difficultyB =
            deckB.wordCount > 0
              ? (deckB.wordCount - deckB.masteredCount) / deckB.wordCount
              : 0;
          comparison = (difficultyA - difficultyB) * dir;
          break;
      }

      if (comparison === 0 && criterion !== "title") {
        return deckA.title.localeCompare(deckB.title);
      }
      return comparison;
    });

    return decksToDisplay;
  }, [decksToSort, sortConfig]);

  return { sortedDecks, sortConfig, setSortConfig };
};
