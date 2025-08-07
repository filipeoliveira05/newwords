import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Polygon,
  Line,
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { theme } from "../../../config/theme";
import Icon, { IconName } from "../Icon";

export type RadarDataPoint = {
  id: string;
  label: string;
  icon: IconName;
  progress: number; // Valor entre 0 e 1
  color: string;
};

type Props = {
  data: RadarDataPoint[];
  size: number;
};

const MINIMUM_PROGRESS = 0.05; // 5% de progresso mínimo para visualização

const AchievementRadarChart = ({ data, size }: Props) => {
  // Aumenta o raio para que o gráfico ocupe mais espaço, já que não há rótulos.
  const radius = size / 2.8;
  const center = size / 2;

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2; // Começa no topo
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x, y, angle };
    });
  }, [data, center, radius]);

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Calcula as coordenadas dos pontos de progresso para reutilização.
  const progressPoints = useMemo(() => {
    return data.map((item, i) => {
      const { angle } = points[i];
      // Garante um progresso mínimo para que o polígono seja sempre visível
      const effectiveProgress = Math.max(item.progress, MINIMUM_PROGRESS);
      const pointRadius = radius * effectiveProgress;
      const x = center + pointRadius * Math.cos(angle);
      const y = center + pointRadius * Math.sin(angle);
      return { x, y };
    });
  }, [data, points, radius, center]);

  // Cria a string de pontos para o polígono a partir das coordenadas calculadas.
  const progressPolygonPoints = progressPoints
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <View style={styles.container}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="progressGradient" cx="50%" cy="50%" r="50%">
            <Stop
              offset="0%"
              stopColor={theme.colors.primary}
              stopOpacity="0.4"
            />
            <Stop
              offset="100%"
              stopColor={theme.colors.primaryLighter}
              stopOpacity="0.1"
            />
          </RadialGradient>
        </Defs>
        {/* Polígono de fundo */}
        <Polygon
          points={polygonPoints}
          fill={theme.colors.background}
          stroke={theme.colors.border}
          strokeWidth="1"
        />

        {/* Linhas do centro para os vértices (spokes) */}
        {points.map((p, i) => (
          <Line
            key={`line-${i}`}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke={theme.colors.borderLight}
            strokeWidth="1"
          />
        ))}

        {/* Polígono de progresso (apenas o preenchimento com gradiente) */}
        <Polygon points={progressPolygonPoints} fill="url(#progressGradient)" />

        {/* Contorno do progresso (linhas coloridas) */}
        {progressPoints.map((point, i) => {
          const nextPoint = progressPoints[(i + 1) % progressPoints.length];
          return (
            <Line
              key={`progress-line-${i}`}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke={data[i].color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Pontos de progresso (desenhados por cima das linhas) */}
        {progressPoints.map((point, i) => {
          return (
            <Circle
              key={`progress-point-${i}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={data[i].color}
              stroke={theme.colors.surface}
              strokeWidth="1.5"
            />
          );
        })}
      </Svg>

      {/* Ícones nos vértices (renderizados como Views absolutas sobre o SVG) */}
      {points.map((p, i) => {
        const item = data[i];
        const iconSize = 24;
        const padding = 20; // Distância do polígono para o ícone

        // Raio para o centro do ícone
        const iconRadius = radius + padding;
        const iconX = center + iconRadius * Math.cos(p.angle) - iconSize / 2;
        const iconY = center + iconRadius * Math.sin(p.angle) - iconSize / 2;

        return (
          <View
            key={`icon-view-${i}`}
            style={[
              styles.iconWrapper,
              {
                left: iconX,
                top: iconY,
                width: iconSize,
                height: iconSize,
              },
            ]}
          >
            <Icon name={item.icon} size={iconSize} color={item.color} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AchievementRadarChart;
