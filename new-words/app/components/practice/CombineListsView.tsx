import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  withSpring,
  withSequence,
  withDelay,
  interpolateColor,
  interpolate,
} from "react-native-reanimated";
import { usePracticeStore } from "@/stores/usePracticeStore";
import * as hapticService from "@/services/hapticService";
import { shuffle } from "@/utils/arrayUtils";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

interface ListItem {
  id: number;
  text: string;
}

interface Selection {
  id: number;
  index: number;
}

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

// Subcomponente para cada item da lista, com a sua própria lógica de animação.
const AnimatedCombineItem = ({
  text,
  onPress,
  disabled,
  isMatched,
  isIncorrect,
  isSelected,
}: {
  text: string;
  onPress: () => void;
  disabled: boolean;
  isMatched: boolean;
  isIncorrect: boolean;
  isSelected: boolean;
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const fadeProgress = useSharedValue(0); // 0 = not faded (green), 1 = faded (gray)

  // Animação de "pop" para acerto
  useEffect(() => {
    if (isMatched) {
      scale.value = withSequence(withSpring(1.05), withSpring(1));
    }
  }, [isMatched, scale]);

  // Animação de "shake" para erro
  useEffect(() => {
    if (isIncorrect) {
      translateX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isIncorrect, translateX]);

  useEffect(() => {
    if (isMatched) {
      // After a delay, start the animation to fade the item.
      fadeProgress.value = withDelay(800, withTiming(1, { duration: 500 }));
    } else {
      // Reset for the next round.
      fadeProgress.value = withTiming(0, { duration: 0 });
    }
  }, [isMatched, fadeProgress]);

  // A single hook for all animated properties of the item, ensuring synchronization.
  const animatedItemStyle = useAnimatedStyle(() => {
    const transform = [
      { scale: scale.value },
      { translateX: translateX.value },
    ];

    // Default/unselected state
    let backgroundColor = theme.colors.surface;
    let borderColor = theme.colors.border;

    if (isMatched) {
      // Animate from green to gray when matched
      backgroundColor = interpolateColor(
        fadeProgress.value,
        [0, 1],
        [theme.colors.successLight, theme.colors.surface]
      );
      borderColor = interpolateColor(
        fadeProgress.value,
        [0, 1],
        [theme.colors.success, theme.colors.border]
      );
    } else if (isIncorrect) {
      backgroundColor = theme.colors.dangerLight;
      borderColor = theme.colors.danger;
    } else if (isSelected) {
      backgroundColor = theme.colors.primaryLighter;
      borderColor = theme.colors.primary;
    }

    const opacity = isMatched
      ? interpolate(fadeProgress.value, [0, 1], [1, 0.4])
      : 1;

    return { transform, backgroundColor, borderColor, opacity };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = isMatched
      ? interpolateColor(
          fadeProgress.value,
          [0, 1],
          [theme.colors.successDark, theme.colors.textSecondary]
        )
      : theme.colors.text;

    return { color };
  });

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Animated.View style={[styles.item, animatedItemStyle]}>
        <AnimatedAppText
          variant="medium"
          style={[styles.itemText, animatedTextStyle]}
        >
          {text}
        </AnimatedAppText>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function CombineListsView() {
  const currentRoundWords = usePracticeStore(
    (state) => state.currentRoundWords
  );
  const { recordAnswer, completeRound } = usePracticeStore.getState();

  const [shuffledWords, setShuffledWords] = useState<ListItem[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<ListItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<Selection | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<Selection | null>(
    null
  );
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<{
    wordIndex: number;
    meaningIndex: number;
  } | null>(null);

  const containerOpacity = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  useEffect(() => {
    if (currentRoundWords.length > 0) {
      const words = currentRoundWords.map((w) => ({ id: w.id, text: w.name }));
      const meanings = currentRoundWords.map((w) => ({
        id: w.id,
        text: w.meaning,
      }));

      setShuffledWords(shuffle(words));
      setShuffledMeanings(shuffle(meanings));
      setSelectedWord(null);
      setSelectedMeaning(null);
      setMatchedPairs([]);
      setIncorrectPair(null);
      containerOpacity.value = 1; // Reset opacity for new rounds
    }
  }, [currentRoundWords, containerOpacity]);

  const handleWordSelect = (word: ListItem, index: number) => {
    // Não bloqueia a interação se houver um par incorreto,
    // permitindo que o utilizador tente imediatamente outra combinação.
    if (matchedPairs.includes(word.id)) return;

    // Se um par incorreto estiver a ser mostrado, limpa-o ao iniciar uma nova seleção.
    if (incorrectPair) {
      setIncorrectPair(null);
    }

    // Se o utilizador clicar na palavra já selecionada, deseleciona-a.
    if (selectedWord?.id === word.id) {
      setSelectedWord(null);
      return;
    }

    if (selectedMeaning) {
      processMatch(selectedMeaning, word, index, "word");
    } else {
      setSelectedWord({ id: word.id, index });
      setSelectedMeaning(null); // Deselect other type
    }
  };

  const handleMeaningSelect = (meaning: ListItem, index: number) => {
    // Não bloqueia a interação se houver um par incorreto.
    if (matchedPairs.includes(meaning.id)) return;

    // Se um par incorreto estiver a ser mostrado, limpa-o.
    if (incorrectPair) {
      setIncorrectPair(null);
    }

    // Se o utilizador clicar no significado já selecionado, deseleciona-o.
    if (selectedMeaning?.id === meaning.id) {
      setSelectedMeaning(null);
      return;
    }

    if (selectedWord) {
      processMatch(selectedWord, meaning, index, "meaning");
    } else {
      setSelectedMeaning({ id: meaning.id, index });
      setSelectedWord(null); // Deselect other type
    }
  };

  const processMatch = (
    firstSelection: Selection,
    secondItem: ListItem,
    secondItemIndex: number,
    secondItemType: "word" | "meaning"
  ) => {
    const isCorrect = firstSelection.id === secondItem.id;

    // Infer quality: 4 for correct (good), 1 for incorrect.
    const quality = isCorrect ? 4 : 1;
    recordAnswer(firstSelection.id, quality);

    if (isCorrect) {
      hapticService.notificationAsync(
        hapticService.NotificationFeedbackType.Success
      );
      const newMatchedPairs = [...matchedPairs, firstSelection.id];
      setMatchedPairs(newMatchedPairs);

      // Se todos os pares foram combinados, termina a ronda
      if (newMatchedPairs.length === currentRoundWords.length) {
        // Anima o desaparecimento dos cartões antes de transitar
        containerOpacity.value = withTiming(
          0,
          { duration: 400 },
          (finished) => {
            if (finished) {
              // A função `completeRound` precisa de ser chamada no thread de JS
              runOnJS(completeRound)();
            }
          }
        );
      }
    } else {
      hapticService.notificationAsync(
        hapticService.NotificationFeedbackType.Error
      );
      const incorrectPairDetails =
        secondItemType === "meaning"
          ? { wordIndex: firstSelection.index, meaningIndex: secondItemIndex }
          : { wordIndex: secondItemIndex, meaningIndex: firstSelection.index };
      setIncorrectPair(incorrectPairDetails);
      // Limpa o feedback de erro após um curto período para permitir nova tentativa
      setTimeout(() => {
        setIncorrectPair(null);
      }, 600);
    }

    setSelectedWord(null);
    setSelectedMeaning(null);
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <AppText style={styles.instructions}>
        Combine a palavra com o seu significado.
      </AppText>
      <View style={styles.listsContainer}>
        {/* Lista de Palavras */}
        <View style={styles.list}>
          {shuffledWords.map((word, index) => (
            <AnimatedCombineItem
              key={`word-${word.id}`}
              text={word.text}
              disabled={matchedPairs.includes(word.id)}
              isSelected={selectedWord?.index === index}
              isMatched={matchedPairs.includes(word.id)}
              isIncorrect={incorrectPair?.wordIndex === index}
              onPress={() => handleWordSelect(word, index)}
            />
          ))}
        </View>

        {/* Lista de Significados */}
        <View style={styles.list}>
          {shuffledMeanings.map((meaning, index) => (
            <AnimatedCombineItem
              key={`meaning-${meaning.id}`}
              text={meaning.text}
              disabled={matchedPairs.includes(meaning.id)}
              isSelected={selectedMeaning?.index === index}
              isMatched={matchedPairs.includes(meaning.id)}
              isIncorrect={incorrectPair?.meaningIndex === index}
              onPress={() => handleMeaningSelect(meaning, index)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  instructions: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  listsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  list: {
    width: "48%",
  },
  item: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    color: theme.colors.text,
  },
  itemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLighter,
  },
  itemIncorrect: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerLight,
  },
});
