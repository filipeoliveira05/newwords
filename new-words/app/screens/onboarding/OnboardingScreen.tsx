import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { RootStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "@/config/theme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAlertStore } from "@/stores/useAlertStore";
import OnboardingSlide from "../../components/onboarding/OnboardingSlide";
import OnboardingPaginator from "../../components/onboarding/OnboardingPaginator";
import { ImageName } from "@/services/imageService";

interface Slide {
  id: string;
  image: ImageName;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: "1",
    image: "mascotBooks",
    title: "Crie os Seus Conjuntos",
    description:
      "Organize o seu vocabulário em conjuntos personalizados. Adicione palavras, significados e muito mais.",
  },
  {
    id: "2",
    image: "mascotThink",
    title: "Prática Inteligente",
    description:
      "O nosso sistema de Repetição Espaçada mostra-lhe as palavras certas na altura certa para maximizar a sua memorização.",
  },
  {
    id: "3",
    image: "mascotPlayGame",
    title: "Vários Modos de Jogo",
    description:
      "Mantenha a aprendizagem divertida com flashcards, escolha múltipla, escrita e combinação de listas.",
  },
  {
    id: "4",
    image: "mascotTrophy",
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
  navigation: OnboardingScreenNavigationProp; // A prop onComplete é removida
};

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);
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
    if (isCompleting) return;

    setIsCompleting(true);
    // Chama a função do store para atualizar o estado no Supabase.
    // O RootNavigator irá reagir automaticamente à mudança de estado.
    const { error } = await useAuthStore.getState().completeOnboarding();

    if (error) {
      showAlert({
        title: "Erro de Rede",
        message:
          "Não foi possível guardar a sua preferência. Por favor, verifique a sua ligação à internet e tente novamente.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      setIsCompleting(false); // Permite ao utilizador tentar novamente.
    }
    // Se não houver erro, o RootNavigator irá mudar de ecrã, pelo que não é preciso fazer setIsCompleting(false).
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
      <View style={{ flex: 5 }}>
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
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={scrollToNext}
          disabled={isCompleting && currentIndex === slides.length - 1}
        >
          {isCompleting && currentIndex === slides.length - 1 ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <AppText variant="bold" style={styles.buttonText}>
              {currentIndex === slides.length - 1
                ? "Começar a Aprender"
                : "Próximo"}
            </AppText>
          )}
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
