import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

// Desativa os avisos de "strict mode" da Reanimated.
// Isto é útil para cenários específicos, como a alteração dinâmica de snapPoints,
// onde o aviso de desempenho não é crítico para a funcionalidade desejada.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
