// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adiciona a extensão .lottie à lista de assets que o Metro reconhece.
config.resolver.assetExts.push("lottie");

module.exports = config;
