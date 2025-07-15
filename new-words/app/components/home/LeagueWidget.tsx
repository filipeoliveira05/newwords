import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
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
import { useLeagueStore } from "../../../stores/useLeagueStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../types/navigation";
import { theme } from "../../../config/theme";
import AppText from "../AppText";
import Icon, { IconName } from "../Icon";
import images from "../../../services/imageService";

type LeagueNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "HomeDashboard"
>;

export default function LeagueWidget() {
  const { isLoading, currentLeague, userRank } = useLeagueStore();
  const navigation = useNavigation<LeagueNavigationProp>();

  // --- Animação de Brilho ---
  const translateX = useSharedValue(-100); // Começa fora do ecrã, à esquerda

  useEffect(() => {
    // Inicia uma animação que se repete indefinidamente
    translateX.value = withRepeat(
      // A sequência de animação
      withSequence(
        // 1. Espera 4 segundos e DEPOIS executa a animação de deslize.
        // O withDelay "embrulha" a animação seguinte, corrigindo o erro.
        withDelay(
          4000,
          withTiming(450, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        withTiming(-100, { duration: 0 }) // 3. Reposiciona instantaneamente para a próxima repetição
      ),
      -1 // -1 significa repetir para sempre
    );
  }, [translateX]);

  const animatedShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (isLoading || !currentLeague) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const { promotionZone, demotionZone, groupSize, name, color, icon } =
    currentLeague;

  const isPromotion = userRank > 0 && userRank <= promotionZone;
  const isDemotion = demotionZone > 0 && userRank > groupSize - demotionZone;

  let rankColor = theme.colors.surface;
  let rankDescription = "Posição na Liga";
  let statusIcon: IconName = "remove";
  let statusIconColor = theme.colors.surface; // Cor para o ícone neutro

  if (isPromotion) {
    rankColor = theme.colors.successLight;
    rankDescription = "Em zona de promoção";
    statusIcon = "caretUp";
    statusIconColor = theme.colors.successLight; // Verde para promoção
  } else if (isDemotion) {
    rankColor = theme.colors.dangerLight;
    rankDescription = "Em zona de despromoção";
    statusIcon = "caretDown";
    statusIconColor = theme.colors.dangerLight; // Vermelho para despromoção
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("LeagueDetails")}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, `${color}E6`]} // Usa a cor da liga e uma versão com 90% de opacidade
        style={styles.gradient}
      >
        <View style={styles.leagueInfoContainer}>
          <Icon name={icon} size={36} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.title}>
            Liga {name}
          </AppText>
        </View>

        <View style={styles.rankDisplayContainer}>
          <View style={styles.rankValueContainer}>
            <AppText style={[styles.rankNumber, { color: rankColor }]}>
              {userRank > 0 ? `${userRank}º` : "-"}
            </AppText>
            {/* Só mostra o ícone se o utilizador estiver classificado */}
            {userRank > 0 && (
              <Icon
                name={statusIcon}
                size={48}
                color={statusIconColor}
                style={styles.statusIcon}
              />
            )}
          </View>
          <AppText style={[styles.rankDescription, { color: rankColor }]}>
            {rankDescription}
          </AppText>
        </View>

        <View />
        {/* A mascote variável aparece no canto inferior direito */}
        {isPromotion ? (
          <Image source={images.mascotHappy} style={styles.mascot} />
        ) : isDemotion ? (
          <Image source={images.mascotSad} style={styles.mascot} />
        ) : (
          <Image source={images.mascotNeutral} style={styles.mascot} />
        )}
      </LinearGradient>
      {/* Elemento de brilho que se move por cima */}
      <Animated.View style={[styles.shine, animatedShineStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255, 255, 255, 0.4)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180, // Aumenta a altura para acomodar a mascote
    borderRadius: 16,
    overflow: "hidden", // Garante que o gradiente respeita o borderRadius
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    height: 180, // Altura fixa para o estado de loading
    borderRadius: 16,
  },
  leagueInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.surface,
    marginLeft: 10,
    transform: [{ translateY: -2 }], // Sobe ligeiramente o texto para alinhar com o ícone
  },
  rankDisplayContainer: {
    alignItems: "flex-start", // Alinha os itens à esquerda
    alignSelf: "flex-start", // Garante que o bloco de ranking fica à esquerda
    justifyContent: "center",
    // A View vazia no final do flexbox empurra este container para cima,
    // então um marginTop negativo pode ajudar a centralizar melhor.
    marginTop: -16,
  },
  rankValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 64,
    fontFamily: theme.fonts.bold,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
  rankDescription: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
    marginTop: -4,
    opacity: 0.9,
  },
  mascot: {
    width: 260, // Aumenta o tamanho da mascote
    height: 260,
    resizeMode: "contain",
    position: "absolute",
    bottom: -65, // Posiciona para "sair" um pouco do card
    right: -40,
  },
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80, // Largura do brilho
    height: "100%",
    backgroundColor: "transparent",
    transform: [{ skewX: "-20deg" }], // Inclina o brilho
  },
});
