import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import AppText from "../AppText";
import Icon from "../Icon";
import { theme } from "../../../config/theme";

interface CommunityDeckCardProps {
  title: string;
  authorName: string;
  wordCount: number;
  upvotes: number;
  category: string;
  onPress: () => void;
  onAddPress: (event: GestureResponderEvent) => void;
}

const CommunityDeckCard = ({
  title,
  authorName,
  wordCount,
  upvotes,
  category,
  onPress,
  onAddPress,
}: CommunityDeckCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <AppText style={styles.categoryText}>{category}</AppText>
        </View>
        <View style={styles.upvoteContainer}>
          <Icon name="caretUp" size={18} color={theme.colors.success} />
          <AppText variant="bold" style={styles.upvoteText}>
            {upvotes}
          </AppText>
        </View>
      </View>
      <AppText variant="bold" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.author}>por {authorName}</AppText>
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Icon name="list" size={16} color={theme.colors.textSecondary} />
          <AppText style={styles.statText}>{wordCount} palavras</AppText>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Icon name="add" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLighter,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: theme.colors.primaryDarker,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
  },
  upvoteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  upvoteText: {
    color: theme.colors.success,
    marginLeft: 4,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: 4,
  },
  author: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primaryLighter,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommunityDeckCard;
