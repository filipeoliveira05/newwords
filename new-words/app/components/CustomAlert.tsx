import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, BackHandler } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { useAlertStore, AlertButton } from "@/stores/useAlertStore";
import AppText from "./AppText";
import { theme } from "../../config/theme";

const CustomAlert = () => {
  const { isVisible, title, message, buttons, hideAlert } = useAlertStore();
  const [isRendered, setIsRendered] = useState(false);
  const progress = useSharedValue(0); // Um valor de 0 a 1 para controlar as animações

  const handleButtonPress = useCallback(
    (button: AlertButton) => {
      // Primeiro executa a ação, depois fecha o modal.
      button.onPress();
      hideAlert();
    },
    [hideAlert]
  );

  // Efeito para lidar com o botão de voltar do hardware no Android.
  // Quando o alerta está visível, o botão de voltar deve agir como um "cancelar".
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        // Encontra se existe um botão de "cancelar" e aciona-o.
        const cancelButton = buttons.find((b) => b.style === "cancel");
        if (cancelButton) {
          handleButtonPress(cancelButton);
        }
        // Previne o comportamento padrão (sair da aplicação/ecrã).
        return true;
      }
      // Se o alerta não estiver visível, permite a ação de voltar padrão.
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isVisible, buttons, handleButtonPress]);

  // Estilo animado para o overlay, controla o fade-in/out
  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
    };
  });

  // Estilo animado para o container do alerta (a caixa branca)
  const animatedContainerStyle = useAnimatedStyle(() => {
    // A caixa aparece com um ligeiro zoom-out para um efeito mais suave
    const scale = interpolate(progress.value, [0, 1], [1.05, 1]);
    return {
      transform: [{ scale }],
    };
  });

  // Efeito para controlar a montagem e as animações
  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      // Anima a opacidade e a escala ao mesmo tempo
      progress.value = withTiming(1, { duration: 250 });
    } else if (isRendered) {
      // Se não for para estar visível, mas ainda estiver renderizado, faz fade-out
      progress.value = withTiming(0, { duration: 200 }, (finished) => {
        // Quando a animação termina, remove o componente da árvore
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
    }
  }, [isVisible, isRendered, progress]);

  const getButtonTextStyle = (style?: AlertButton["style"]) => {
    if (style === "destructive") {
      return styles.buttonTextDestructive;
    }
    return styles.buttonTextDefault;
  };

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <AppText variant="bold" style={styles.title}>
          {title}
        </AppText>
        <AppText style={styles.message}>{message}</AppText>
        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => handleButtonPress(button)}
              >
                <AppText
                  variant="bold"
                  style={[styles.buttonText, getButtonTextStyle(button.style)]}
                >
                  {button.text}
                </AppText>
              </TouchableOpacity>
              {index < buttons.length - 1 && (
                <View style={styles.buttonSeparator} />
              )}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  container: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingTop: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  title: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  message: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { fontSize: theme.fontSizes.lg },
  buttonTextDefault: {
    color: theme.colors.primary,
  },
  buttonTextDestructive: {
    color: theme.colors.danger,
  },
  buttonSeparator: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
});
