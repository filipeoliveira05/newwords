import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { setMetaValue } from "../../../services/storage";
import OnboardingSlide from "../../components/onboarding/OnboardingSlide";
import OnboardingPaginator from "../../components/onboarding/OnboardingPaginator";

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: "1",
    icon: "albums-outline",
    title: "Crie os Seus Conjuntos",
    description:
      "Organize o seu vocabulário em conjuntos personalizados. Adicione palavras, significados e muito mais.",
  },
  {
    id: "2",
    icon: "flash-outline",
    title: "Prática Inteligente",
    description:
      "O nosso sistema de Repetição Espaçada mostra-lhe as palavras certas na altura certa para maximizar a sua memorização.",
  },
  {
    id: "3",
    icon: "game-controller-outline",
    title: "Vários Modos de Jogo",
    description:
      "Mantenha a aprendizagem divertida com flashcards, escolha múltipla, escrita e combinação de listas.",
  },
  {
    id: "4",
    icon: "trophy-outline",
    title: "Suba na Liga",
    description:
      "Ganhe XP com cada resposta correta, suba de nível e compita com outros utilizadores na liga semanal.",
  },
];

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

type Props = {
  navigation: OnboardingScreenNavigationProp;
};

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleCompleteOnboarding = async () => {
    await setMetaValue("has_completed_onboarding", "true");
    // Substitui o ecrã de onboarding pelo da app principal para que o utilizador não possa voltar atrás.
    navigation.replace("MainApp");
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleCompleteOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 3 }}>
        <Animated.FlatList
          ref={slidesRef}
          data={slides}
          renderItem={({ item }) => <OnboardingSlide item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />
      </View>
      <View style={styles.footer}>
        <OnboardingPaginator data={slides} scrollX={scrollX} />
        <TouchableOpacity style={styles.button} onPress={scrollToNext}>
          <AppText variant="bold" style={styles.buttonText}>
            {currentIndex === slides.length - 1
              ? "Começar a Aprender"
              : "Próximo"}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    paddingBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xxl,
  },
});

export default OnboardingScreen;
