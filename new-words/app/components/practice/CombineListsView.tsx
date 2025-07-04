import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { usePracticeStore } from "@/stores/usePracticeStore";
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
    recordAnswer(firstSelection.id, isCorrect);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const incorrectPairDetails =
        secondItemType === "meaning"
          ? { wordIndex: firstSelection.index, meaningIndex: secondItemIndex }
          : { wordIndex: secondItemIndex, meaningIndex: firstSelection.index };
      setIncorrectPair(incorrectPairDetails);
    }

    setSelectedWord(null);
    setSelectedMeaning(null);
  };

  const getWordStyle = (word: ListItem, index: number) => {
    const itemStyles: any[] = [styles.item];
    if (matchedPairs.includes(word.id)) {
      itemStyles.push(styles.itemCorrect);
    } else if (selectedWord?.index === index) {
      itemStyles.push(styles.itemSelected);
    } else if (incorrectPair?.wordIndex === index) {
      itemStyles.push(styles.itemIncorrect);
    }
    return itemStyles;
  };

  const getMeaningStyle = (meaning: ListItem, index: number) => {
    const itemStyles: any[] = [styles.item];
    if (matchedPairs.includes(meaning.id)) {
      itemStyles.push(styles.itemCorrect);
    } else if (selectedMeaning?.index === index) {
      itemStyles.push(styles.itemSelected);
    } else if (incorrectPair?.meaningIndex === index) {
      itemStyles.push(styles.itemIncorrect);
    }
    return itemStyles;
  };

  const getTextStyle = (id: number) => {
    return matchedPairs.includes(id) ? styles.itemTextCorrect : styles.itemText;
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
            <TouchableOpacity
              key={`word-${word.id}`}
              style={getWordStyle(word, index)}
              onPress={() => handleWordSelect(word, index)}
              disabled={matchedPairs.includes(word.id)}
            >
              <AppText style={getTextStyle(word.id)}>{word.text}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de Significados */}
        <View style={styles.list}>
          {shuffledMeanings.map((meaning, index) => (
            <TouchableOpacity
              key={`meaning-${meaning.id}`}
              style={getMeaningStyle(meaning, index)}
              onPress={() => handleMeaningSelect(meaning, index)}
              disabled={matchedPairs.includes(meaning.id)}
            >
              <AppText style={getTextStyle(meaning.id)}>{meaning.text}</AppText>
            </TouchableOpacity>
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
    fontSize: theme.fontSizes.base,
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
    fontSize: theme.fontSizes.sm,
    textAlign: "center",
    color: theme.colors.textMedium,
  },
  itemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLighter,
  },
  itemCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
    opacity: 0.7,
  },
  itemTextCorrect: {
    fontSize: theme.fontSizes.sm,
    textAlign: "center",
    color: theme.colors.successDark,
    textDecorationLine: "line-through",
  },
  itemIncorrect: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerLight,
  },
});
