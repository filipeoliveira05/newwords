// app.config.js

const APP_VARIANT = process.env.APP_VARIANT;
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE;

const name = APP_VARIANT === "development" ? "New Words (Dev)" : "New Words";
const androidPackage = ANDROID_PACKAGE || "com.filipeoliveira05.newwords";

// O seu projectId, retirado do seu ficheiro original.
const EAS_PROJECT_ID = "31a840aa-1dac-4e82-8160-8e34659b8c26";

module.exports = {
  expo: {
    name: name,
    slug: "new-words",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/mascot/app_icon2.png", // <-- NOVO ÍCONE PRINCIPAL
    // O 'scheme' deve ser dinâmico e corresponder ao package name da aplicação.
    // Isto garante que o deep link (ex: com.filipeoliveira05.newwords.dev://)
    // é único e seguro, cumprindo as políticas do Google OAuth.
    scheme: androidPackage,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/mascot/app_icon2.png", // <-- NOVO ÍCONE ADAPTATIVO
        backgroundColor: "#ffffffff", // <-- NOVA COR DE FUNDO (EXEMPLO)
      },
      edgeToEdgeEnabled: true,
      package: androidPackage,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: "appVersion",
    },

    plugins: [
      "expo-dev-client",
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/mascot/app_splashIcon.png", // <-- NOVA IMAGEM DE SPLASH
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffffff", // <-- NOVA COR DE FUNDO (EXEMPLO)
        },
      ],
      "expo-sqlite",
      "sentry-expo",
      "expo-audio",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        // O projectId continua aqui para referência do EAS.
        projectId: EAS_PROJECT_ID,
      },
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      googleIOSClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    },
  },
};
