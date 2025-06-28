import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { usePracticeStore } from "@/stores/usePracticeStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function StreakCounter() {
  const streak = usePracticeStore((state) => state.streak);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (streak > 1) {
      // Animação de "pop" quando a streak aumenta
      scale.value = withSequence(withSpring(1.3), withSpring(1));
    }
  }, [streak]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (streak < 3) {
    return null; // Só mostra a streak a partir de 2 respostas certas seguidas
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Ionicons name="flame" size={22} color="#ff9e00" />
      <Text style={styles.streakText}>{streak}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff9e00",
  },
});
