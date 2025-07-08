import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import * as Linking from "expo-linking";
import * as StoreReview from "expo-store-review";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Help">;

const faqs = [
  {
    question: "Como funciona o sistema de níveis e XP?",
    answer:
      "Você ganha XP (Pontos de Experiência) ao praticar palavras e ao adicionar novas palavras aos seus conjuntos. Ao acumular XP suficiente, você sobe de nível.",
  },
  {
    question: "O que significa o nível de maestria?",
    answer:
      "O nível de maestria baseia-se no algoritmo de repetição espaçada. 'Nova' é uma palavra que nunca praticou. 'Em aprendizagem' significa que já a praticou algumas vezes. 'Dominada' indica que acertou consistentemente e que a palavra aparecerá com menos frequência para revisão.",
  },
  {
    question: "Como funcionam os modos de prática?",
    answer:
      "Oferecemos vários modos para manter a aprendizagem interessante: Revisão Clássica (flashcards), Escolha Múltipla, Jogo da Escrita e Combinar Listas. Cada modo testa o seu conhecimento de uma forma diferente.",
  },
  {
    question: "O que é a sessão de prática 'Urgente'?",
    answer:
      "A sessão Urgente seleciona automaticamente as palavras cuja data de revisão, calculada pelo algoritmo, já passou ou está próxima. É a forma mais eficiente de manter o seu vocabulário fresco na memória.",
  },
  {
    question: "O que acontece se eu errar uma palavra?",
    answer:
      "Errar uma palavra diminui o seu fator de facilidade e faz com que ela apareça mais cedo para revisão. Além disso, é possível fazer uma sessão dedicada às palavras que errou previamente.",
  },
  {
    question: "Como funciona a Liga Semanal?",
    answer:
      "A Liga Semanal agrupa utilizadores em divisões (Bronze, Prata, Ouro, etc.). Você compete ao ganhar XP durante a semana. No final da semana, os melhores classificados são promovidos para a liga seguinte, enquanto os últimos são despromovidos.",
  },
];

const AccordionItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.questionContainer} onPress={toggleOpen}>
        <AppText variant="medium" style={styles.questionText}>
          {question}
        </AppText>
        <Ionicons
          name={isOpen ? "chevron-down-outline" : "chevron-forward-outline"}
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
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Ajuda e Suporte",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: { fontFamily: theme.fonts.bold },
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
            <Ionicons
              name="flash-outline"
              size={22}
              color={theme.colors.primary}
              style={styles.tipIcon}
            />
            <AppText style={styles.tipText}>
              Use a prática Urgente diariamente para a máxima eficiência.
            </AppText>
          </View>
          <View style={styles.tipItem}>
            <Ionicons
              name="star-outline"
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
          onPress={handleRateAppPress}
        >
          <Ionicons
            name="star-outline"
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
          onPress={handleContactPress}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={theme.colors.surface}
          />
          <AppText variant="bold" style={styles.contactButtonText}>
            Contactar Suporte
          </AppText>
        </TouchableOpacity>
        {/* Adiciona um espaçamento no final da lista */}
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
    fontSize: theme.fontSizes.base,
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
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    marginRight: 8,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
  },
  answerText: {
    fontSize: theme.fontSizes.sm,
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
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
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
    fontSize: theme.fontSizes.base,
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
  },
  contactButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.base,
    marginLeft: 12,
  },
});

export default HelpScreen;
