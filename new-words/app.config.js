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
    icon: "./assets/images/mascot/mascot_happy3.png",
    scheme: "newwords",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
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
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
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
    },
  },
};
