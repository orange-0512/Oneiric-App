import 'dotenv/config';

export default {
  expo: {
    name: "Oneiric",
    slug: "oneiric-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#bfb4dc"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.oneiric.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#bfb4dc"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      HUGGINGFACE_API_TOKEN: process.env.HUGGINGFACE_API_TOKEN,
    },
    plugins: [
      "expo-font"
    ]
  }
};
