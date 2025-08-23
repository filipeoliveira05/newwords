import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { theme } from "../../../config/theme";

interface OnboardingPaginatorProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
}

const Dot = ({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const { width } = useWindowDimensions();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedDotStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [10, 25, 10],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );
    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const OnboardingPaginator: React.FC<OnboardingPaginatorProps> = ({
  data,
  scrollX,
}) => {
  return (
    <View style={styles.container}>
      {data.map((_, i) => (
        <Dot key={i.toString()} index={i} scrollX={scrollX} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
    marginHorizontal: 8,
  },
});

export default OnboardingPaginator;
