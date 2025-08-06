import React, {
  useLayoutEffect,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ProfileStackParamList } from "../../../types/navigation";
import {
  getAchievementsUnlockedOnDate,
  getPracticeHistoryOnDate,
} from "../../../services/storage";
import { useUserStore } from "../../../stores/useUserStore";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import Icon from "../../components/Icon";
import { Achievement, achievements } from "../../../config/achievements";

type Props = NativeStackScreenProps<ProfileStackParamList, "LevelJourney">;

const MAX_LEVEL_TO_DISPLAY = 50;
const MILESTONE_INTERVAL = 5;

const screenWidth = Dimensions.get("window").width;

// Componente para o Popover
const LevelPopover = ({
  level,
  x,
  y,
  date,
  wordsPracticed,
  unlockedAchievements,
  onClose,
}: {
  level: number;
  x: number;
  y: number;
  date: string;
  wordsPracticed: number;
  unlockedAchievements: Achievement[];
  onClose: () => void;
}) => {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const [popoverHeight, setPopoverHeight] = useState(0);

  useEffect(() => {
    // Animação de entrada com um ligeiro "bounce"
    scale.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.back(1.2)), // Easing com efeito de ressalto
    });
    opacity.value = withTiming(1, { duration: 150 });
  }, [scale, opacity, popoverHeight]);

  const handleClose = () => {
    // Animação de saída
    scale.value = withTiming(0.95, { duration: 150 });
    opacity.value = withTiming(0, { duration: 200 });
    // Chama a função onClose original após a animação para que o componente seja desmontado
    setTimeout(() => {
      runOnJS(onClose)();
    }, 200);
  };

  // Determina se o popover deve aparecer à esquerda ou à direita do ponto de clique
  // para evitar que saia do ecrã.
  const isRightSide = x > screenWidth / 2; // O 'x' agora é o centro do nó.
  const isMilestone = level % MILESTONE_INTERVAL === 0;
  const nodeRadius = isMilestone ? 35 : 30; // Raio do nó de nível
  const popoverOffset = nodeRadius + 10; // Distância do popover ao centro do nó

  const positionStyle = isRightSide
    ? // O popover aparece à esquerda do nó. A posição 'right' é calculada a partir da borda direita do ecrã.
      // Distância da borda direita do ecrã até ao centro do nó + offset.
      { right: screenWidth - x + popoverOffset }
    : // O popover aparece à direita do nó. A posição 'left' é o centro do nó + offset.
      { left: x + popoverOffset };

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Calcula a posição 'top' para centrar o popover verticalmente em relação ao ponto de clique (y).
    // Isto só acontece depois de a altura do popover ser medida.
    const topPosition = y - popoverHeight / 2;
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
      // Renderiza fora do ecrã até a altura ser medida para evitar um "salto" visual.
      top: popoverHeight > 0 ? topPosition : -9999,
    };
  });

  return (
    <Pressable style={styles.popoverOverlay} onPress={handleClose}>
      <Animated.View
        style={[styles.popoverContainer, positionStyle, animatedContainerStyle]}
        onLayout={(event) => {
          // Mede a altura do popover e guarda-a no estado para o cálculo da posição.
          if (popoverHeight === 0) {
            setPopoverHeight(event.nativeEvent.layout.height);
          }
        }}
      >
        {/* Seta de Borda (camada de trás) */}
        <View
          style={[
            styles.popoverArrowBorder,
            isRightSide
              ? styles.popoverArrowBorderRight
              : styles.popoverArrowBorderLeft,
          ]}
        />
        {/* Seta Principal (camada da frente) */}
        <View
          style={[
            styles.popoverArrow,
            isRightSide ? styles.popoverArrowRight : styles.popoverArrowLeft,
          ]}
        />
        <View style={styles.popoverContent}>
          <AppText variant="bold" style={styles.popoverTitle}>
            Nível {level}
          </AppText>
          <AppText style={styles.popoverSubtitle}>Desbloqueado</AppText>
          <View style={styles.popoverSeparator} />
          <View style={styles.popoverDateContainer}>
            <Icon
              name="calendar"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.popoverIcon}
            />
            <AppText style={styles.popoverText}>{date}</AppText>
          </View>

          {(wordsPracticed > 0 || unlockedAchievements.length > 0) && (
            <View style={styles.popoverExtraInfoContainer}>
              <AppText style={styles.popoverExtraInfoTitle}>
                Nesse dia, você também:
              </AppText>
              {wordsPracticed > 0 && (
                <View style={styles.popoverExtraInfoItem}>
                  <Icon
                    name="flashOutline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <AppText style={styles.popoverExtraInfoText}>
                    Praticou {wordsPracticed} palavras
                  </AppText>
                </View>
              )}
              {unlockedAchievements.map((ach) => (
                <View key={ach.id} style={styles.popoverExtraInfoItem}>
                  <Icon name={ach.icon} size={16} color={theme.colors.gold} />
                  <AppText style={styles.popoverExtraInfoText}>
                    Desbloqueou `{ach.title}`
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const LevelNode = ({
  level,
  isUnlocked,
  isCurrent,
  isMilestone,
}: {
  level: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  isMilestone: boolean;
}) => {
  const nodeStyle = [
    styles.node,
    isUnlocked ? styles.nodeUnlocked : styles.nodeLocked,
    isCurrent && styles.nodeCurrent,
    isMilestone && styles.nodeMilestone,
  ];

  const textStyle = [
    styles.nodeText,
    isUnlocked ? styles.nodeTextUnlocked : styles.nodeTextLocked,
    isCurrent && styles.nodeTextCurrent,
  ];

  return (
    <View style={nodeStyle}>
      {isMilestone && isUnlocked ? (
        <Icon name="star" size={24} color={theme.colors.gold} />
      ) : (
        <AppText variant="bold" style={textStyle}>
          {level}
        </AppText>
      )}
    </View>
  );
};

const LevelJourneyScreen = ({ navigation }: Props) => {
  const { level: currentUserLevel, levelUpHistory } = useUserStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const [containerY, setContainerY] = useState(0);
  const nodeLayouts = useRef<{ [key: number]: { y: number } }>({});
  const nodeRefs = useRef(new Map<number, View>());
  const levelUpHistoryMap = new Map(
    levelUpHistory.map((item) => [item.level, item.unlocked_at])
  );
  const [nodePositions, setNodePositions] = useState<{
    [key: number]: { x: number; y: number };
  }>({});

  const [popover, setPopover] = useState<{
    visible: boolean;
    level: number;
    x: number;
    y: number;
    date: string;
    wordsPracticed: number;
    unlockedAchievements: Achievement[];
  } | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Jornada de Níveis",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
    });
  }, [navigation]);

  useEffect(() => {
    // Timeout para garantir que o layout foi calculado antes de fazer scroll
    // e que o onLayout de todos os itens já foi chamado.
    const timer = setTimeout(() => {
      const layout = nodeLayouts.current[currentUserLevel];
      if (layout && scrollViewRef.current) {
        const yOffset = Math.max(0, layout.y - 200);
        scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUserLevel, nodePositions]);

  const { unlockedPath, lockedPath } = useMemo(() => {
    const positions = Object.entries(nodePositions)
      .map(([level, pos]) => ({ level: Number(level), ...pos }))
      .sort((a, b) => a.level - b.level);

    if (positions.length < 2) {
      return { unlockedPath: "", lockedPath: "" };
    }

    // Função para criar um caminho SVG com curvas de Bézier cúbicas
    const createPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return "";

      let d = `M ${points[0].x} ${points[0].y}`; // Ponto inicial

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];

        // A "força" da curva é metade da distância vertical entre os pontos.
        // Isto cria uma curva em "S" simétrica.
        const curveAmount = (currentPoint.y - prevPoint.y) / 2;

        // Ponto de controlo 1: Puxa a curva para baixo a partir do ponto anterior.
        const cp1x = prevPoint.x + 75;
        const cp1y = prevPoint.y + curveAmount;

        // Ponto de controlo 2: Puxa a curva para cima em direção ao ponto atual.
        const cp2x = currentPoint.x + 75;
        const cp2y = currentPoint.y - curveAmount;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`;
      }
      return d; // Retorna o caminho completo com curvas
    };

    // Divide os pontos em desbloqueados e bloqueados
    const unlockedPoints = positions.filter((p) => p.level <= currentUserLevel);
    // O caminho bloqueado começa no último ponto desbloqueado para criar uma conexão suave
    const lockedPoints = positions.filter((p) => p.level >= currentUserLevel);

    return {
      unlockedPath: createPath(unlockedPoints),
      lockedPath: createPath(lockedPoints),
    };
  }, [nodePositions, currentUserLevel]);

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={() => {
        // Mede a posição Y do container principal na tela.
        // Isto é crucial para ajustar as coordenadas do popover,
        // compensando a altura do header da navegação.
        containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setContainerY(pageY);
        });
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => {
          // Fecha o popover se estiver visível quando o utilizador começa a fazer scroll.
          if (popover?.visible) setPopover(null);
        }}
      >
        <View style={styles.header}>
          <AppText variant="bold" style={styles.title}>
            O seu caminho até agora
          </AppText>
          <AppText style={styles.subtitle}>
            Cada nível é um passo em direção ao domínio. Continue a sua jornada!
          </AppText>
        </View>

        <Svg style={StyleSheet.absoluteFill}>
          {/* Caminho para níveis bloqueados */}
          <Path
            d={lockedPath}
            stroke={theme.colors.borderLight}
            strokeWidth="3"
            strokeDasharray="6, 6" // Cria o efeito tracejado
            strokeLinecap="round"
            fill="none" // Previne o preenchimento da área do caminho
          />
          {/* Caminho para níveis desbloqueados */}
          <Path
            d={unlockedPath}
            stroke={theme.colors.primary}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none" // Previne o preenchimento da área do caminho
          />
        </Svg>

        {Array.from({ length: MAX_LEVEL_TO_DISPLAY }).map((_, i) => {
          const level = i + 1;
          const isUnlocked = level <= currentUserLevel;
          const isCurrent = level === currentUserLevel;
          const isMilestone = level % MILESTONE_INTERVAL === 0;
          const isEven = i % 2 === 0;
          // O remendo de fundo tem o tamanho exato do nó para tapar a linha sem criar espaços.
          const backgroundPatchSize = isMilestone ? 70 : 60;

          const achievementMap = new Map(achievements.map((a) => [a.id, a]));

          const handleNodePress = async () => {
            if (isUnlocked && !isCurrent) {
              const unlockedDate = levelUpHistoryMap.get(level);
              const nodeRef = nodeRefs.current.get(level);

              if (unlockedDate && nodeRef) {
                nodeRef.measure(async (x, y, width, height, pageX, pageY) => {
                  const nodeCenterX = pageX + width / 2;
                  const nodeCenterY = pageY + height / 2;

                  const dateObj = new Date(unlockedDate);
                  const formattedDisplayDate = format(
                    dateObj,
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: pt }
                  );
                  const formattedQueryDate = format(dateObj, "yyyy-MM-dd");

                  const [practiceData, achievementIds] = await Promise.all([
                    getPracticeHistoryOnDate(formattedQueryDate),
                    getAchievementsUnlockedOnDate(formattedQueryDate),
                  ]);

                  const unlockedAchievements = achievementIds
                    .map((id) => achievementMap.get(id))
                    .filter((ach): ach is Achievement => !!ach);

                  setPopover({
                    visible: true,
                    level: level,
                    x: nodeCenterX,
                    y: nodeCenterY,
                    date: formattedDisplayDate,
                    wordsPracticed: practiceData?.words_trained ?? 0,
                    unlockedAchievements: unlockedAchievements,
                  });
                });
              }
            }
          };

          return (
            <View
              key={level}
              onLayout={(event) => {
                const { y, width, height } = event.nativeEvent.layout;
                const nodeCenterX = isEven ? width * 0.25 : width * 0.75;
                const nodeCenterY = y + height / 2;

                // Armazena a posição Y no ref para o scroll inicial.
                // A atualização de um ref não causa re-renderização.
                nodeLayouts.current[level] = { y: nodeCenterY };

                // Armazena a posição completa no estado para desenhar o caminho SVG.
                // A condição previne re-renderizações infinitas.
                if (!nodePositions[level]) {
                  setNodePositions((prev) => ({
                    ...prev,
                    [level]: { x: nodeCenterX, y: nodeCenterY },
                  }));
                }
              }}
              style={[
                styles.levelRow,
                { flexDirection: isEven ? "row" : "row-reverse" },
              ]}
            >
              <View style={styles.nodeContainer}>
                {/* Este View funciona como um "remendo" da cor do fundo. */}
                {/* Fica entre a linha do caminho e o nó, escondendo a linha durante a animação de opacidade. */}
                <View
                  ref={(el) => {
                    if (el) nodeRefs.current.set(level, el);
                    else nodeRefs.current.delete(level);
                  }}
                  style={[
                    styles.nodeBackgroundPatch,
                    {
                      width: backgroundPatchSize,
                      height: backgroundPatchSize,
                      borderRadius: backgroundPatchSize / 2,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleNodePress}
                  >
                    <LevelNode
                      level={level}
                      isUnlocked={isUnlocked}
                      isCurrent={isCurrent}
                      isMilestone={isMilestone}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.emptySide} />
            </View>
          );
        })}
      </ScrollView>
      {popover?.visible && (
        <LevelPopover
          level={popover.level}
          x={popover.x}
          // Ajusta a coordenada Y do clique para ser relativa ao container do ecrã,
          // uma vez que o popover é renderizado dentro dele.
          // Isto compensa a altura do header da navegação.
          y={popover.y - containerY}
          date={popover.date}
          wordsPracticed={popover.wordsPracticed}
          unlockedAchievements={popover.unlockedAchievements}
          onClose={() => setPopover(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    // Garante que o SVG absoluto funcione dentro do ScrollView
    position: "relative",
  },
  header: {
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "90%",
  },
  levelRow: {
    height: 100,
    alignItems: "center",
  },
  nodeContainer: {
    width: "50%", // Cada nó ocupa metade da largura
    justifyContent: "center",
    alignItems: "center",
  },
  nodeBackgroundPatch: {
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  emptySide: {
    width: "50%",
  },
  pathUnlocked: {
    borderColor: theme.colors.primary,
  },
  pathLocked: {
    borderStyle: "dashed",
  },
  node: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
  },
  nodeLocked: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderLight,
  },
  nodeUnlocked: {
    backgroundColor: theme.colors.primaryLighter,
    borderColor: theme.colors.primary,
  },
  nodeCurrent: {
    transform: [{ scale: 1.1 }],
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  nodeMilestone: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: theme.colors.gold,
    backgroundColor: theme.colors.goldLighter,
  },
  nodeText: {
    fontSize: theme.fontSizes.xl,
  },
  nodeTextLocked: {
    color: theme.colors.textMuted,
  },
  nodeTextUnlocked: {
    color: theme.colors.primaryDarker,
  },
  nodeTextCurrent: {
    color: theme.colors.surface,
    backgroundColor: theme.colors.primary,
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 30,
  },
  // Popover Styles
  popoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent", // Permite cliques "através" se não for no popover
    zIndex: 10,
  },
  popoverContainer: {
    position: "absolute",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  popoverContent: {
    padding: 16,
    alignItems: "center",
  },
  popoverTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  popoverSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  popoverSeparator: {
    height: 1,
    width: "30%",
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  popoverDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  popoverIcon: {
    marginRight: 8,
  },
  popoverText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
  },
  popoverExtraInfoContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    alignSelf: "stretch",
  },
  popoverExtraInfoTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    marginBottom: 8,
    textAlign: "center",
  },
  popoverExtraInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  popoverExtraInfoText: {
    marginLeft: 8,
    fontSize: theme.fontSizes.sm,
  },
  popoverArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    position: "absolute",
    top: "50%",
    marginTop: -6, // Metade da altura da seta
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  popoverArrowLeft: {
    left: -6,
    borderRightWidth: 6,
    borderRightColor: theme.colors.surface,
  },
  popoverArrowRight: {
    right: -6,
    borderLeftWidth: 6,
    borderLeftColor: theme.colors.surface,
  },
  // Styles for the arrow border
  popoverArrowBorder: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    position: "absolute",
    top: "50%",
    marginTop: -7, // Metade da altura da seta + 1px da borda
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    zIndex: -1, // Fica atrás da seta principal
  },
  popoverArrowBorderLeft: {
    left: -8, // 1px mais para fora que a seta principal
    borderRightWidth: 8,
    borderRightColor: theme.colors.borderLight,
  },
  popoverArrowBorderRight: {
    right: -8, // 1px mais para fora que a seta principal
    borderLeftWidth: 8,
    borderLeftColor: theme.colors.borderLight,
  },
});

export default LevelJourneyScreen;
