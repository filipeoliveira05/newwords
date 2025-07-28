import React, { useMemo } from "react";
import { useUserStore } from "../../../stores/useUserStore";

import ChallengingWordsCard from "./cards/ChallengingWordsCard";
import UrgentReviewCard from "./cards/UrgentReviewCard";
import DefaultPracticeCard from "./cards/DefaultPracticeCard";

const DynamicActionCard = () => {
  const { challengingWords, urgentWordsCount } = useUserStore();

  // useMemo ensures this logic only runs when the underlying data changes.
  const ActionCard = useMemo(() => {
    // Priority 1: Urgent Review
    if (urgentWordsCount > 0) {
      return <UrgentReviewCard count={urgentWordsCount} />;
    }

    // Priority 2: Challenging Words
    if (challengingWords && challengingWords.length > 0) {
      return <ChallengingWordsCard words={challengingWords} />;
    }

    // Fallback: Default Practice Card
    return <DefaultPracticeCard />;
  }, [challengingWords, urgentWordsCount]);

  return ActionCard;
};

export default DynamicActionCard;
