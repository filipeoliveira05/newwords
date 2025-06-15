import { Text, View, StyleSheet } from "react-native";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text>THIS IS THE STATS PAGE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
