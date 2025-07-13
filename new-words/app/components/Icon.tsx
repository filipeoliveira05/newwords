import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";

// 1. Define as bibliotecas de ícones disponíveis
const iconLibraries = {
  feather: Feather,
  ionicons: Ionicons,
};

// 2. Define o mapa centralizado de ícones (Single Source of Truth)
// Para alterar um ícone em toda a aplicação, basta alterar aqui.
// `as const` é crucial para que o TypeScript infira os tipos literais.
export const iconMap = {
  // Navigation
  home: { name: "home", library: "ionicons" },
  homeOutline: { name: "home-outline", library: "ionicons" },
  decks: { name: "layers", library: "ionicons" },
  decksOutline: { name: "layers-outline", library: "ionicons" },
  practice: { name: "zap", library: "feather" },
  community: { name: "globe", library: "ionicons" },
  communityOutline: { name: "globe-outline", library: "ionicons" },
  stats: { name: "stats-chart", library: "ionicons" },
  statsOutline: { name: "stats-chart-outline", library: "ionicons" },
  profile: { name: "person", library: "ionicons" },
  profileOutline: { name: "person-outline", library: "ionicons" },
  back: { name: "arrow-back", library: "ionicons" },
  forward: { name: "chevron-forward", library: "ionicons" },
  down: { name: "chevron-down-outline", library: "ionicons" },
  up: { name: "chevron-up-outline", library: "ionicons" },
  open: { name: "open-outline", library: "ionicons" },
  close: { name: "close", library: "ionicons" },
  add: { name: "add", library: "ionicons" },
  addCircle: { name: "add-circle-outline", library: "ionicons" },
  edit: { name: "create-outline", library: "ionicons" },
  search: { name: "search-outline", library: "ionicons" },
  searchCircle: { name: "search-circle-outline", library: "ionicons" },
  closeCircle: { name: "close-circle", library: "ionicons" },
  scan: { name: "scan", library: "ionicons" },
  swapVertical: { name: "swap-vertical-outline", library: "ionicons" },
  ellipsis: { name: "ellipsis-vertical", library: "ionicons" },

  // General UI
  bookmark: { name: "bookmark-outline", library: "ionicons" },
  flash: { name: "flash", library: "ionicons" },
  flashOutline: { name: "flash-outline", library: "ionicons" },
  flame: { name: "flame-outline", library: "ionicons" },
  leaf: { name: "leaf-outline", library: "ionicons" },
  fileTrayStacked: { name: "file-tray-stacked-outline", library: "ionicons" },
  bonfire: { name: "bonfire-outline", library: "ionicons" },
  star: { name: "star", library: "ionicons" },
  starOutline: { name: "star-outline", library: "ionicons" },
  checkmarkCircle: { name: "checkmark-circle", library: "ionicons" },
  checkmarkCircleOutline: {
    name: "checkmark-circle-outline",
    library: "ionicons",
  },
  checkmarkDoneCircle: {
    name: "checkmark-done-circle-outline",
    library: "ionicons",
  },
  checkmarkDoneCircleFilled: {
    name: "checkmark-done-circle",
    library: "ionicons",
  },
  calendar: { name: "calendar-outline", library: "ionicons" },
  podium: { name: "podium-outline", library: "ionicons" },
  alarm: { name: "alarm-outline", library: "ionicons" },
  alertCircle: { name: "alert-circle-outline", library: "ionicons" },
  fitness: { name: "fitness-outline", library: "ionicons" },
  mail: { name: "mail-outline", library: "ionicons" },
  bulb: { name: "bulb-outline", library: "ionicons" },
  gameController: { name: "game-controller-outline", library: "ionicons" },
  volume: { name: "volume-medium-outline", library: "ionicons" },
  eye: { name: "eye-outline", library: "ionicons" },
  trash: { name: "trash-outline", library: "ionicons" },
  lock: { name: "lock-closed", library: "ionicons" },
  time: { name: "time-outline", library: "ionicons" },
  caretUp: { name: "caret-up", library: "ionicons" },
  caretDown: { name: "caret-down", library: "ionicons" },
  person: { name: "person-outline", library: "ionicons" },
  removeCircle: { name: "remove-circle-outline", library: "ionicons" },
  text: { name: "text-outline", library: "ionicons" },
  chat: { name: "chatbox-ellipses-outline", library: "ionicons" },

  cloudOffline: { name: "cloud-offline-outline", library: "ionicons" },
  // Practice & Learning
  school: { name: "school-outline", library: "ionicons" },
  trendingUp: { name: "trending-up-outline", library: "ionicons" },
  albums: { name: "albums-outline", library: "ionicons" },
  list: { name: "list-outline", library: "ionicons" },
  pencil: { name: "pencil-outline", library: "ionicons" },
  gitCompare: { name: "git-compare-outline", library: "ionicons" },
  documentText: { name: "document-text-outline", library: "ionicons" },

  // Achievements & Stats
  trophy: { name: "trophy-outline", library: "ionicons" },
  medal: { name: "medal-outline", library: "ionicons" },
  trophyFilled: { name: "trophy", library: "ionicons" },
  diamondFilled: { name: "diamond", library: "ionicons" },
  ribbonFilled: { name: "ribbon", library: "ionicons" },
  flameFilled: { name: "flame", library: "ionicons" },
  ribbon: { name: "ribbon-outline", library: "ionicons" },
  diamond: { name: "diamond-outline", library: "ionicons" },
  barbell: { name: "barbell-outline", library: "ionicons" },
  walk: { name: "walk-outline", library: "ionicons" },
  shieldCheckmark: { name: "shield-checkmark-outline", library: "ionicons" },
  archive: { name: "archive-outline", library: "ionicons" },
  library: { name: "library", library: "ionicons" },
  libraryOutline: { name: "library-outline", library: "ionicons" },
  book: { name: "book-outline", library: "ionicons" },
  shield: { name: "shield", library: "ionicons" },
  shieldOutline: { name: "shield-outline", library: "ionicons" },
  shieldHalf: { name: "shield-half-outline", library: "ionicons" },
  personCircle: { name: "person-circle-outline", library: "ionicons" },
  settings: { name: "cog-outline", library: "ionicons" },
  helpBuoy: { name: "help-buoy-outline", library: "ionicons" },
  logout: { name: "log-out-outline", library: "ionicons" },
} as const;

// 3. Define os tipos para as props do componente
export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// 4. Cria o componente genérico Icon
const Icon = ({ name, size = 24, color = "black", style }: IconProps) => {
  const iconDetails = iconMap[name];

  if (!iconDetails) {
    const FallbackIcon = iconLibraries.feather;
    return (
      <FallbackIcon
        name="help-circle"
        size={size}
        color={color}
        style={style}
      />
    );
  }

  const IconComponent = iconLibraries[iconDetails.library];
  return (
    <IconComponent
      name={iconDetails.name as any}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default Icon;
