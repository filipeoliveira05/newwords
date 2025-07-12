import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Icon, { IconName } from "../Icon";

interface AnimatedTabBarIconProps {
  focused: boolean;
  size: number;
  color: string;
  name: "home" | "decks" | "community" | "profile"; // Base names for icons that have outline/filled versions
}

const AnimatedTabBarIcon: React.FC<AnimatedTabBarIconProps> = ({
  focused,
  size,
  color,
  name,
}) => {
  // Shared values para controlar a animação
  const progress = useSharedValue(0); // 0 = not focused, 1 = focused

  // Dispara a animação sempre que o estado 'focused' muda
  useEffect(() => {
    const animationConfig = {
      duration: 200, // Duração da animação em milissegundos
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Curva de easing para suavidade
    };
    progress.value = withTiming(focused ? 1 : 0, animationConfig);
  }, [focused, progress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = 1 + progress.value * 0.1; // Anima a escala de 1 para 1.1
    return {
      transform: [{ scale }],
    };
  });

  const animatedOutlineStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const animatedFilledStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: progress.value }],
    };
  });

  // Constrói os nomes dos ícones de contorno e preenchido
  const outlineIconName = `${name}Outline` as IconName;
  const filledIconName = name as IconName;

  return (
    // O contentor exterior gere o layout (posicionamento)
    <View style={styles.layoutContainer}>
      {/* O contentor interior animado gere a escala */}
      <Animated.View
        style={[styles.animationContainer, animatedContainerStyle]}
      >
        <View>
          {/* Ícone de contorno (visível quando não focado) */}
          <Animated.View
            style={[StyleSheet.absoluteFill, animatedOutlineStyle]}
          >
            <Icon name={outlineIconName} size={size} color={color} />
          </Animated.View>

          {/* Ícone preenchido (visível quando focado) */}
          <Animated.View style={animatedFilledStyle}>
            <Icon name={filledIconName} size={size} color={color} />
          </Animated.View>
        </View>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: color },
            animatedDotStyle,
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 8, // Empurra o conteúdo para baixo sem afetar a animação de escala
  },
  animationContainer: {
    alignItems: "center",
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});

export default AnimatedTabBarIcon;
