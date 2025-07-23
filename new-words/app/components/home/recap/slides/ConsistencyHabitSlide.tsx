import React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import Icon, { IconName } from "../../../Icon";

const { width: screenWidth } = Dimensions.get("window");

export interface ConsistencyHabitData {
  practiceDays: boolean[];
  unlockedAchievements: { icon: IconName; name: string }[];
}

const PracticeDaysChart = ({ days }: { days: boolean[] }) => {
  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <View style={styles.practiceDaysContainer}>
      {days.map((practiced, index) => (
        <Animated.View
          key={index}
          style={styles.dayContainer}
          entering={FadeIn.delay(100 + index * 150)}
        >
          <View
            style={[styles.dayCircle, practiced && styles.dayCirclePracticed]}
          >
            {practiced && (
              <Icon name="checkmark" size={24} color={theme.colors.surface} />
            )}
          </View>
          <AppText style={styles.dayLabel}>{dayLabels[index]}</AppText>
        </Animated.View>
      ))}
    </View>
  );
};

interface ConsistencyHabitSlideProps {
  data: ConsistencyHabitData;
}

const ConsistencyHabitSlide = ({ data }: ConsistencyHabitSlideProps) => (
  <Animated.View
    style={styles.scrollableSlideContainer}
    entering={FadeIn.duration(800)}
  >
    <AppText variant="bold" style={styles.title}>
      Consistência é a Chave.
    </AppText>

    <AppText style={styles.subtitle}>Dias de prática na semana</AppText>
    <PracticeDaysChart days={data.practiceDays} />

    {data.unlockedAchievements.length > 0 && (
      <View style={styles.achievementsSection}>
        <AppText style={[styles.subtitle, { marginTop: 40 }]}>
          Conquistas Desbloqueadas
        </AppText>
        <ScrollView
          style={styles.achievementsScrollView}
          contentContainerStyle={styles.achievementsContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {data.unlockedAchievements.map((ach, index) => (
            <Animated.View
              key={ach.name}
              style={styles.achievementItem}
              entering={FadeInUp.delay(300 + index * 200).springify()}
            >
              <View style={styles.achievementIconContainer}>
                <Icon name={ach.icon} size={32} color={theme.colors.gold} />
              </View>
              <AppText style={styles.achievementName} numberOfLines={2}>
                {ach.name}
              </AppText>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    )}
  </Animated.View>
);

const styles = StyleSheet.create({
  scrollableSlideContainer: {
    width: screenWidth,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80, // Space for header and progress bar
    paddingBottom: 20,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  practiceDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  dayCirclePracticed: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  achievementsSection: {
    flex: 1, // Allows ScrollView to take remaining space
    width: "100%",
    alignItems: "center",
  },
  achievementsScrollView: {
    width: "100%",
    marginTop: 20,
  },
  achievementsContentContainer: {
    alignItems: "center",
    paddingBottom: 20, // Padding at the bottom of the scroll
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: "90%",
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.goldLighter,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    flex: 1, // Allow text to wrap
  },
});

export default ConsistencyHabitSlide;
