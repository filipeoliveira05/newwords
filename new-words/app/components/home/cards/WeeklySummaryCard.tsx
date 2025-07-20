import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { WeeklySummary } from "../../../../services/storage";
import { HomeStackParamList } from "../../../../types/navigation";
import Icon from "../../Icon";

type Props = {
  summary: WeeklySummary;
};

const WeeklySummaryCard = ({ summary }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  // --- Animação de Brilho ---
  const translateX = useSharedValue(-100);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withDelay(
          4000, // Inicia a animação após 4 segundos
          withTiming(450, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        withTiming(-100, { duration: 0 })
      ),
      -1
    );
  }, [translateX]);

  const animatedShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    navigation.navigate("WeeklyRecap", { summary });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        // Usamos um gradiente dourado para um aspeto premium
        colors={[theme.colors.gold, "#FFC107"]}
        style={styles.card}
      >
        <Icon name="podium" size={32} color={theme.colors.surface} />
        <View style={styles.textContainer}>
          <AppText variant="bold" style={styles.title}>
            O seu resumo semanal chegou!
          </AppText>
          <AppText style={styles.subtitle}>
            Veja o seu progresso e as suas conquistas.
          </AppText>
        </View>
        <Icon name="forward" size={24} color={theme.colors.surface} />
      </LinearGradient>
      {/* O elemento de brilho foi movido para aqui, para ser irmão do gradiente. */}
      <Animated.View style={[styles.shine, animatedShineStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255, 255, 255, 0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden", // Essencial para a animação de brilho
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: { fontSize: theme.fontSizes.xl, color: theme.colors.surface },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.surface,
    marginTop: 4,
    opacity: 0.9,
  },
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80,
    height: "100%",
    backgroundColor: "transparent",
    transform: [{ skewX: "-20deg" }],
  },
});

export default WeeklySummaryCard;
