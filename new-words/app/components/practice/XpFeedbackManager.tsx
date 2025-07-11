import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { eventStore } from "../../../stores/eventStore";
import XpFeedback from "./XpFeedback";

interface XpAnimation {
  id: number;
  xp: number;
  xOffset: number; // Para posição aleatória
  yEnd: number;
}

let nextId = 0;

const XpFeedbackManager = () => {
  const [xpAnimations, setXpAnimations] = useState<XpAnimation[]>([]);

  const handleAnimationComplete = useCallback((idToRemove: number) => {
    setXpAnimations((currentAnimations) =>
      currentAnimations.filter((anim) => anim.id !== idToRemove)
    );
  }, []);

  useEffect(() => {
    const unsubscribe = eventStore
      .getState()
      .subscribe<{ xp: number }>("xpUpdated", ({ xp }) => {
        setXpAnimations((currentAnimations) => [
          ...currentAnimations,
          {
            id: nextId++,
            xp,
            xOffset: (Math.random() - 0.5) * 150, // Volatilidade horizontal: -75 a +75
            yEnd: -80 - Math.random() * 40, // Volatilidade vertical: -80 a -120
          },
        ]);
      });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {xpAnimations.map((anim) => (
        <XpFeedback
          key={anim.id}
          xp={anim.xp}
          xOffset={anim.xOffset}
          yEnd={anim.yEnd}
          onAnimationComplete={() => handleAnimationComplete(anim.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Garante que fica por cima de tudo
  },
});

export default XpFeedbackManager;
