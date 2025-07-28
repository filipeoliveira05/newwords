import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Polygon, Line, Circle } from "react-native-svg";
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

  // Calcula os pontos para o polígono de progresso interior
  const progressPolygonPoints = useMemo(() => {
    return data
      .map((item, i) => {
        const { angle } = points[i];
        const pointRadius = radius * item.progress;
        const x = center + pointRadius * Math.cos(angle);
        const y = center + pointRadius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, points, radius, center]);

  return (
    <View style={styles.container}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
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

        {/* Polígono de progresso */}
        <Polygon
          points={progressPolygonPoints}
          fill={`${theme.colors.primary}33`} // Cor primária com ~20% de opacidade
          stroke={theme.colors.primary}
          strokeWidth="2"
        />

        {/* Pontos de progresso */}
        {data.map((item, i) => {
          const { angle } = points[i];
          const pointRadius = radius * item.progress;
          const x = center + pointRadius * Math.cos(angle);
          const y = center + pointRadius * Math.sin(angle);

          return (
            <Circle
              key={`progress-${i}`}
              cx={x}
              cy={y}
              r="5"
              fill={item.color}
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
