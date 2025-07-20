import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { HomeStackParamList } from "../../../types/navigation";
import { theme } from "../../../config/theme";
import AppText from "../../components/AppText";
import Icon, { IconName } from "../../components/Icon";
import images from "../../../services/imageService";
import ProgressSegment from "../../components/home/recap/RecapProgressBar";
import { WeeklySummary } from "../../../services/storage";

type Props = NativeStackScreenProps<HomeStackParamList, "WeeklyRecap">;

// Define a discriminated union for the slide types to help TypeScript
// understand the data structure within the switch statement.
type SlideItem =
  | { id: "intro"; type: "intro" }
  | { id: "metrics"; type: "metrics"; data: WeeklySummary }
  | { id: "highlight"; type: "highlight"; data: WeeklySummary }
  | { id: "final"; type: "final" };

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: IconName;
  value: number;
  label: string;
  color: string;
}) => {
  const animatedNumber = useSharedValue(0);

  useEffect(() => {
    // A animação só começa quando o card está visível
    if (value > 0) {
      animatedNumber.value = withTiming(value, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [value, animatedNumber]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedNumber.value)}`,
    } as any;
  });

  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={32} color={color} />
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        style={[styles.statValue, { color }]}
        animatedProps={animatedProps}
      />
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get("window");

// --- Componentes dos Slides ---

const IntroSlide = () => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      O seu Resumo Semanal
    </AppText>
    <AppText style={styles.subtitle}>
      Parabéns por mais uma semana de progresso!
    </AppText>
    <Image source={images.mascotAmazed} style={styles.mascotImage} />
  </Animated.View>
);

const MetricsSlide = ({ summary }: { summary: WeeklySummary }) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      As suas conquistas
    </AppText>
    <View style={styles.statsContainer}>
      <StatCard
        icon="flash"
        value={summary.wordsTrained}
        label="Palavras Treinadas"
        color={theme.colors.challenge}
      />
      <StatCard
        icon="addCircle"
        value={summary.wordsLearned}
        label="Palavras Adicionadas"
        color={theme.colors.success}
      />
    </View>
  </Animated.View>
);

const HighlightSlide = ({ summary }: { summary: WeeklySummary }) => {
  const hasHighlight = summary.mostTrainedWord || summary.mostChallengingWord;

  if (!hasHighlight) {
    return (
      <Animated.View
        style={styles.slideContent}
        entering={FadeIn.duration(800)}
      >
        <Image source={images.mascotHappy} style={styles.mascotImage} />
        <AppText variant="bold" style={styles.title}>
          Semana Sólida!
        </AppText>
        <AppText style={styles.subtitle}>
          Continuaste a praticar e a progredir. Força!
        </AppText>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
      <AppText variant="bold" style={styles.title}>
        Destaques da Semana
      </AppText>
      <View style={styles.highlightContainer}>
        {summary.mostTrainedWord && (
          <View style={styles.highlightCard}>
            <Icon name="trendingUp" size={28} color={theme.colors.success} />
            <View style={styles.highlightTextContainer}>
              <AppText style={styles.highlightLabel}>Mais Treinada</AppText>
              <AppText variant="bold" style={styles.highlightValue}>
                {summary.mostTrainedWord.name}
              </AppText>
              <AppText style={styles.highlightDetail}>
                {summary.mostTrainedWord.timesTrained} vezes
              </AppText>
            </View>
          </View>
        )}
        {summary.mostChallengingWord && (
          <View style={styles.highlightCard}>
            <Icon name="fitness" size={28} color={theme.colors.challenge} />
            <View style={styles.highlightTextContainer}>
              <AppText style={styles.highlightLabel}>Mais Desafiadora</AppText>
              <AppText variant="bold" style={styles.highlightValue}>
                {summary.mostChallengingWord.name}
              </AppText>
              <AppText style={styles.highlightDetail}>
                {summary.mostChallengingWord.timesIncorrect} erros
              </AppText>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const FinalSlide = ({ onFinish }: { onFinish: () => void }) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <Image source={images.mascotNeutral} style={styles.mascotImage} />
    <AppText variant="bold" style={styles.mascotText}>
      Continue o bom trabalho!
    </AppText>
    <AppText style={styles.mascotSubtext}>
      A consistência é o segredo para a maestria.
    </AppText>
    <TouchableOpacity
      style={styles.doneButton}
      activeOpacity={0.8}
      onPress={onFinish}
    >
      <AppText variant="bold" style={styles.doneButtonText}>
        Continuar
      </AppText>
    </TouchableOpacity>
  </Animated.View>
);

// --- Ecrã Principal ---

const WeeklyRecapScreen = ({ route, navigation }: Props) => {
  const { summary } = route.params;
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const slides = useMemo(
    (): SlideItem[] => [
      { id: "intro", type: "intro" },
      { id: "metrics", type: "metrics", data: summary },
      { id: "highlight", type: "highlight", data: summary },

      { id: "final", type: "final" },
    ],
    [summary]
  );

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const goToNextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleClose(); // Fecha no último slide
    }
  }, [currentIndex, slides.length, handleClose]);

  const goToPreviousSlide = useCallback(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  }, [currentIndex]);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }: { item: SlideItem }) => {
    switch (item.type) {
      case "intro":
        return <IntroSlide />;
      case "metrics":
        return <MetricsSlide summary={item.data} />;
      case "highlight":
        return <HighlightSlide summary={item.data} />;
      case "final":
        return <FinalSlide onFinish={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primaryLighter, theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <ProgressSegment
              key={index}
              isActive={index === currentIndex}
              isCompleted={index < currentIndex}
              onFinish={goToNextSlide}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          activeOpacity={0.8}
          onPress={handleClose}
        >
          <Icon name="close" size={28} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
      />

      {/* Camadas de navegação por toque */}
      <View style={styles.navOverlay}>
        <TouchableOpacity
          style={styles.navArea}
          activeOpacity={0.8}
          onPress={goToPreviousSlide}
        />
        <TouchableOpacity
          style={styles.navArea}
          activeOpacity={0.8}
          onPress={goToNextSlide}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  closeButton: {
    padding: 10,
    marginLeft: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statValue: {
    fontSize: 48,
    marginVertical: 8,
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  highlightContainer: {
    width: "100%",
    marginTop: 20,
  },
  highlightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  highlightLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  highlightValue: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginVertical: 2,
  },
  highlightDetail: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  mascotContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  mascotImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginVertical: 20,
  },
  mascotText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginTop: 16,
  },
  mascotSubtext: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  doneButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
  },
  slideContent: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  navOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  navArea: {
    flex: 1,
  },
});

export default WeeklyRecapScreen;
