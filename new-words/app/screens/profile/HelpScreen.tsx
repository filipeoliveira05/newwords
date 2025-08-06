import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";
import * as StoreReview from "expo-store-review";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import * as hapticService from "../../../services/hapticService";
import { useUserStore } from "../../../stores/useUserStore";
import { seedLevelUpHistory } from "../../../services/storage";
import { useNotificationStore } from "../../../stores/useNotificationStore";
import { AchievementRank } from "../../../config/achievements";
import Icon, { IconName } from "@/app/components/Icon";

type Props = NativeStackScreenProps<ProfileStackParamList, "Help">;

const faqs = [
  {
    question: "Como funciona o sistema de níveis e XP?",
    answer: (
      <>
        Você ganha <AppText variant="bold">XP (Pontos de Experiência)</AppText>{" "}
        ao praticar e ao adicionar novas palavras. Ao acumular XP suficiente,
        você sobe de nível.
      </>
    ),
  },
  {
    question: "O que significa o nível de maestria?",
    answer: (
      <>
        Baseia-se no algoritmo de repetição espaçada.{" "}
        <AppText variant="bold">Nova</AppText> é uma palavra que nunca praticou.{" "}
        <AppText variant="bold">Em aprendizagem</AppText> significa que já a
        praticou algumas vezes. <AppText variant="bold">Dominada</AppText>{" "}
        indica que acertou consistentemente e que a palavra aparecerá com menos
        frequência para revisão.
      </>
    ),
  },
  {
    question: "Como funcionam os modos de prática?",
    answer: (
      <>
        Oferecemos vários modos para manter a aprendizagem interessante:{" "}
        <AppText variant="bold">Revisão Clássica</AppText> (flashcards),{" "}
        <AppText variant="bold">Escolha Múltipla</AppText>,{" "}
        <AppText variant="bold">Jogo da Escrita</AppText> e{" "}
        <AppText variant="bold">Combinar Listas</AppText>. Cada modo testa o seu
        conhecimento de uma forma diferente.
      </>
    ),
  },
  {
    question: "O que é a sessão de prática Urgente?",
    answer: (
      <>
        A sessão <AppText variant="bold">Urgente</AppText> seleciona
        automaticamente as palavras cuja data de revisão, calculada pelo
        algoritmo, já passou ou está próxima. É a forma mais eficiente de manter
        o seu vocabulário fresco na memória.
      </>
    ),
  },
  {
    question: "O que acontece se eu errar uma palavra?",
    answer: (
      <>
        <AppText variant="bold">Errar uma palavra</AppText> diminui o seu fator
        de facilidade e faz com que ela apareça mais cedo para revisão. Além
        disso, é possível fazer uma sessão dedicada às palavras que errou
        previamente.
      </>
    ),
  },
  {
    question: "Como funciona a Liga Semanal?",
    answer: (
      <>
        A <AppText variant="bold">Liga Semanal</AppText> agrupa utilizadores em
        divisões (Bronze, Prata, Ouro, etc.). Você compete ao ganhar{" "}
        <AppText variant="bold">XP</AppText> durante a semana. No final da
        semana, os melhores classificados são{" "}
        <AppText variant="bold">promovidos</AppText> para a liga seguinte,
        enquanto os últimos são <AppText variant="bold">despromovidos</AppText>.
      </>
    ),
  },
];

// Tipos locais para os dados de teste, para clareza.
interface TestAchievement {
  icon: IconName;
  title: string;
  description: string;
  rank?: AchievementRank;
}

interface TestGoal {
  id: string;
  title: string;
  icon: IconName;
}

const testAchievements: TestAchievement[] = [
  {
    icon: "ribbon",
    title: "Caçador de Conquistas",
    description: "Desbloqueou 5 outras conquistas.",
    rank: "Bronze",
  },
  {
    icon: "flameFilled",
    title: "Sequência Divina",
    description: "Atingiu uma sequência de 100 acertos.",
    rank: "Diamond",
  },
  {
    icon: "school",
    title: "Domínio Inicial",
    description: "Dominou a sua primeira palavra. Continue assim!",
  },
  {
    icon: "calendar",
    title: "Lenda Anual",
    description: "Praticou por 365 dias seguidos.",
    rank: "Legendary",
  },
  {
    icon: "flash",
    title: "Vórtice de Palavras",
    description: "Treinou 150 palavras num único dia.",
    rank: "Master",
  },
  {
    icon: "barbell",
    title: "Guerreiro do Fim de Semana",
    description: "Praticou durante um fim de semana.",
    rank: "Silver",
  },
];

const testGoals: TestGoal[] = [
  {
    id: "train_10_words",
    title: "Treina 10 palavras",
    icon: "barbell",
  },
  {
    id: "add_5_words",
    title: "Adiciona 5 palavras",
    icon: "addCircle",
  },
  {
    id: "perfect_round",
    title: "Completa uma ronda perfeita",
    icon: "star",
  },
];
const AccordionItem = ({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    hapticService.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.questionContainer}
        activeOpacity={0.8}
        onPress={toggleOpen}
      >
        <AppText variant="medium" style={styles.questionText}>
          {question}
        </AppText>
        <Icon
          name={isOpen ? "down" : "forward"}
          size={22}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.answerContainer}>
          <AppText style={styles.answerText}>{answer}</AppText>
        </View>
      )}
    </View>
  );
};

const HelpScreen = ({ navigation }: Props) => {
  const [testAchievementIndex, setTestAchievementIndex] = useState(0);
  const [testGoalIndex, setTestGoalIndex] = useState(0);
  const { addNotification } = useNotificationStore();
  const { fetchUserStats } = useUserStore.getState();

  const handleTestLevelUp = () => {
    addNotification({
      id: `test-levelup-${Date.now()}`,
      type: "levelUp",
      title: "Nível 10",
      newLevel: 10,
      icon: "swapVertical",
    });
  };

  const handleTestAchievementUnlocked = () => {
    const achievement = testAchievements[testAchievementIndex];
    addNotification({
      id: `test-ach-${achievement.title.replace(/\s/g, "")}-${Date.now()}`,
      type: "achievement",
      title: achievement.title,
      subtitle: achievement.description,
      icon: achievement.icon,
      rank: achievement.rank,
    });
    setTestAchievementIndex(
      (prevIndex) => (prevIndex + 1) % testAchievements.length
    );
  };

  const handleTestDailyGoalCompleted = () => {
    const goal = testGoals[testGoalIndex];
    addNotification({
      id: goal.id,
      type: "dailyGoal",
      title: goal.title,
      icon: goal.icon,
    });
    setTestGoalIndex((prevIndex) => (prevIndex + 1) % testGoals.length);
  };

  const handleTestLevelUpScreen = () => {
    navigation.navigate("LevelUpTest" as any); // Usamos 'as any' para o teste, mas o tipo deve ser adicionado
  };

  const handleSeedTestData = async () => {
    try {
      await seedLevelUpHistory();
      await fetchUserStats(); // Recarrega os dados no store
      Toast.show({
        type: "success",
        text1: "Dados de teste inseridos!",
        text2: "O histórico de níveis foi populado.",
      });
    } catch (e) {
      console.error(e);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Ajuda e Suporte",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
    });
  }, [navigation]);

  const handleContactPress = () => {
    Linking.openURL(
      "mailto:suporte@exemplo.com?subject=Ajuda%20-%20NewWords%20App"
    );
  };

  const handleRateAppPress = async () => {
    // Verifica se o dispositivo suporta o pop-up de avaliação nativo.
    if (await StoreReview.isAvailableAsync()) {
      // Dispara o pedido. O próprio sistema operativo (iOS/Android) decide se e quando o deve mostrar,
      // para evitar que o utilizador seja incomodado repetidamente.
      StoreReview.requestReview();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Perguntas Frequentes
        </AppText>
        <View style={styles.card}>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Dicas Rápidas
        </AppText>
        <View style={styles.card}>
          <View style={styles.tipItem}>
            <Icon
              name="flashOutline"
              size={22}
              color={theme.colors.primary}
              style={styles.tipIcon}
            />
            <AppText style={styles.tipText}>
              Use a prática Urgente diariamente para a máxima eficiência.
            </AppText>
          </View>
          <View style={styles.tipItem}>
            <Icon
              name="starOutline"
              size={22}
              color={theme.colors.favorite}
              style={styles.tipIcon}
            />
            <AppText style={styles.tipText}>
              Marque palavras como favoritas para as encontrar e praticar
              facilmente.
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Gosta da Aplicação?
        </AppText>
        <TouchableOpacity
          style={styles.cardButton}
          activeOpacity={0.8}
          onPress={handleRateAppPress}
        >
          <Icon
            name="starOutline"
            size={22}
            color={theme.colors.favorite}
            style={styles.cardButtonIcon}
          />
          <AppText variant="medium" style={styles.cardButtonText}>
            Avaliar na Loja
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Precisa de mais ajuda?
        </AppText>
        <TouchableOpacity
          style={styles.contactButton}
          activeOpacity={0.8}
          onPress={handleContactPress}
        >
          <Icon name="mail" size={22} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.contactButtonText}>
            Contactar Suporte
          </AppText>
        </TouchableOpacity>
        {/* Adiciona um espaçamento no final da lista */}
        <View style={{ height: 20 }} />
      </View>

      {/* Secção de Ferramentas de Desenvolvimento (Apenas para teste) */}
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Ferramentas de Teste
        </AppText>
        <TouchableOpacity
          style={styles.contactButton}
          activeOpacity={0.8}
          onPress={handleTestLevelUp}
        >
          <Icon name="bug" size={22} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.contactButtonText}>
            Testar Toast de Level Up
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          activeOpacity={0.8}
          onPress={handleTestAchievementUnlocked}
        >
          <Icon name="bug" size={22} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.contactButtonText}>
            Testar Toast de Conquista
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          activeOpacity={0.8}
          onPress={handleTestDailyGoalCompleted}
        >
          <Icon name="bug" size={22} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.contactButtonText}>
            Testar Toast de Meta Diária
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, { marginTop: 12 }]}
          activeOpacity={0.8}
          onPress={handleTestLevelUpScreen}
        >
          <Icon name="bug" size={22} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.contactButtonText}>
            Testar Ecrã de Level Up
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, { marginTop: 12 }]}
          activeOpacity={0.8}
          onPress={handleSeedTestData}
        >
          <Icon name="bug" size={22} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.contactButtonText}>
            Testar Histórico de Níveis
          </AppText>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginRight: 8,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
  },
  answerText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tipIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMedium,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  cardButtonIcon: {
    marginRight: 16,
  },
  cardButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  contactButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
    marginLeft: 12,
  },
});

export default HelpScreen;
