import React, { useMemo } from "react";
import { isMonday } from "date-fns";
import { useUserStore } from "../../../stores/useUserStore";

import WeeklySummaryCard from "./cards/WeeklySummaryCard";
import ChallengingWordsCard from "./cards/ChallengingWordsCard";
import UrgentReviewCard from "./cards/UrgentReviewCard";
import ContinueLearningCard from "./cards/ContinueLearningCard";
import DefaultPracticeCard from "./cards/DefaultPracticeCard";

const DynamicActionCard = () => {
  const {
    weeklySummary,
    challengingWords,
    lastPracticedDeck,
    urgentWordsCount,
  } = useUserStore();

  // useMemo ensures this logic only runs when the underlying data changes.
  const ActionCard = useMemo(() => {
    // Priority 1: Weekly Summary on Mondays
    if (
      isMonday(new Date()) &&
      weeklySummary &&
      weeklySummary.wordsTrained > 0
    ) {
      return <WeeklySummaryCard summary={weeklySummary} />;
    }

    // Priority 2: Challenging Words
    if (challengingWords && challengingWords.length > 0) {
      return <ChallengingWordsCard words={challengingWords} />;
    }

    // Priority 3: Urgent Review
    if (urgentWordsCount > 0) {
      return <UrgentReviewCard count={urgentWordsCount} />;
    }

    // Priority 4: Continue Learning
    if (lastPracticedDeck) {
      return <ContinueLearningCard deck={lastPracticedDeck} />;
    }

    // Fallback: Default Practice Card
    return <DefaultPracticeCard />;
  }, [weeklySummary, challengingWords, urgentWordsCount, lastPracticedDeck]);

  return ActionCard;
};

export default DynamicActionCard;
