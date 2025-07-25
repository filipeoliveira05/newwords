import React from "react";
import { View, StyleSheet } from "react-native";
import { useAlertStore } from "../../../stores/useAlertStore";
import LevelUpView from "../../components/practice/LevelUpView";

const LevelUpTestScreen = () => {
  const { showAlert } = useAlertStore.getState();

  const handleContinue = () => {
    showAlert({
      title: "Ação de Continuar",
      message: "O botão 'Continuar' foi pressionado.",
      buttons: [{ text: "OK", onPress: () => {} }],
    });
  };

  return (
    <View style={styles.container}>
      <LevelUpView level={10} onContinue={handleContinue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LevelUpTestScreen;
