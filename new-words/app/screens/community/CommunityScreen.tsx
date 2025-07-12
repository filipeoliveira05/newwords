import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

const CommunityScreen = () => {
  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>
        Comunidade
      </AppText>
      <AppText style={styles.subtitle}>Em breve...</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
});

export default CommunityScreen;

// import React, { useState, useCallback } from "react";
// import { View, StyleSheet, ActivityIndicator } from "react-native";
// import { useNetInfo } from "@react-native-community/netinfo";
// import AppText from "../../components/AppText";
// import { theme } from "../../../config/theme";
// import OfflinePlaceholder from "@/app/components/OfflinePlaceholder";

// const CommunityScreen = () => {
//   const netInfo = useNetInfo();
//   const [isRetrying, setIsRetrying] = useState(false);

//   // Simula uma nova tentativa de carregamento
//   const handleRetry = useCallback(() => {
//     setIsRetrying(true);
//     // Aqui, no futuro, você chamaria a função para carregar os dados da comunidade.
//     // Por agora, apenas simulamos um pequeno atraso.
//     setTimeout(() => {
//       setIsRetrying(false);
//     }, 1500);
//   }, []);

//   // Estado de carregamento inicial ou durante uma nova tentativa
//   if (netInfo.isConnected === null || isRetrying) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//         <AppText style={styles.loadingText}>A ligar à comunidade...</AppText>
//       </View>
//     );
//   }

//   // Estado offline
//   if (netInfo.isConnected === false) {
//     return <OfflinePlaceholder onRetry={handleRetry} />;
//   }

//   // Estado online (conteúdo real da comunidade)
//   return (
//     <View style={styles.container}>
//       <AppText variant="bold" style={styles.title}>
//         Comunidade
//       </AppText>
//       <AppText style={styles.subtitle}>Conteúdo online aparece aqui!</AppText>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: theme.colors.background,
//     padding: 20,
//   },
//   title: {
//     fontSize: theme.fontSizes["4xl"],
//     color: theme.colors.text,
//   },
//   subtitle: {
//     fontSize: theme.fontSizes.lg,
//     color: theme.colors.textSecondary,
//     marginTop: 8,
//     textAlign: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: theme.fontSizes.lg,
//     color: theme.colors.textSecondary,
//   },
// });

// export default CommunityScreen;
