import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { useAlertStore, AlertButton } from "@/stores/useAlertStore";

const CustomAlert = () => {
  const { isVisible, title, message, buttons, hideAlert } = useAlertStore();
  const [isRendered, setIsRendered] = useState(false);
  const progress = useSharedValue(0); // Um valor de 0 a 1 para controlar as animações

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
  }, [isVisible, buttons]);

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
  }, [isVisible, isRendered]);

  const handleButtonPress = (button: AlertButton) => {
    // Primeiro executa a ação, depois fecha o modal.
    button.onPress();
    hideAlert();
  };

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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleButtonPress(button)}
              >
                <Text
                  style={[styles.buttonText, getButtonTextStyle(button.style)]}
                >
                  {button.text}
                </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  container: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingTop: 24, // Padding superior
    alignItems: "center",
    overflow: "hidden", // Garante que o borderRadius se aplica aos filhos
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 24, // Padding para o texto não colar às bordas
  },
  message: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 24, // Padding para o texto não colar às bordas
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  buttonTextDefault: {
    color: "#4F8EF7",
  },
  buttonTextDestructive: {
    color: "#ef4444",
  },
  buttonSeparator: {
    width: 1,
    backgroundColor: "#e9ecef",
  },
});
