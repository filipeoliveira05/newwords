import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Icon, { IconName } from "../Icon";
import { theme } from "../../../config/theme";

interface AnimatedTabBarIconProps {
  focused: boolean;
  size: number;
  color: string;
  name: "home" | "library" | "community" | "profile"; // Base names for icons that have outline/filled versions
  profilePictureUrl?: string | null;
}

const AnimatedTabBarIcon: React.FC<AnimatedTabBarIconProps> = ({
  focused,
  size,
  color,
  name,
  profilePictureUrl,
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

  // Estilo animado para a borda do avatar, que aparece quando focado.
  const animatedAvatarBorderStyle = useAnimatedStyle(() => {
    return {
      // Usar a cor de fundo em vez de 'transparent' corrige artefactos de renderização
      // e garante que a forma é sempre perfeitamente circular.
      borderColor: focused ? color : theme.colors.surface,
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

  const isProfileWithPicture = name === "profile" && profilePictureUrl;

  const renderContent = () => {
    // Se for o ícone de perfil e existir uma URL, renderiza a imagem.
    if (isProfileWithPicture) {
      return (
        <Animated.View
          style={[
            styles.avatarContainer,
            { width: size, height: size, borderRadius: size / 2 },
            // Ajuste vertical para alinhar a imagem de perfil com os ícones.
            // A imagem e o ícone têm alinhamentos de base diferentes,
            // pelo que um pequeno ajuste é necessário.
            { transform: [{ translateY: 4 }] },
            animatedAvatarBorderStyle,
          ]}
        >
          <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
        </Animated.View>
      );
    }

    // Caso contrário, renderiza o ícone padrão com animação de fade.
    return (
      <View>
        {/* Ícone de contorno (visível quando não focado) */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedOutlineStyle]}>
          <Icon name={outlineIconName} size={size} color={color} />
        </Animated.View>

        {/* Ícone preenchido (visível quando focado) */}
        <Animated.View style={animatedFilledStyle}>
          <Icon name={filledIconName} size={size} color={color} />
        </Animated.View>
      </View>
    );
  };

  return (
    // O contentor exterior gere o layout (posicionamento)
    <View style={styles.layoutContainer}>
      {/* O contentor interior animado gere a escala */}
      <Animated.View
        style={[styles.animationContainer, animatedContainerStyle]}
      >
        {renderContent()}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: color },
            animatedDotStyle,
            isProfileWithPicture && styles.profileIndicator,
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
    borderRadius: 3,
    marginTop: 4,
  },
  profileIndicator: {
    // Adiciona um espaçamento extra para o indicador quando a foto de perfil é mostrada.
    marginTop: 6,
  },
  avatarContainer: {
    overflow: "hidden",
    borderWidth: 1.8, // Borda para dar destaque quando focado
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});

export default AnimatedTabBarIcon;
