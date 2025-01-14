import { HintSection } from "../hints/HintModal";

type OSWindows =
  | "World Structures"
  | "Settings"
  | "Military"
  | "Trade"
  | "Construction"
  | "Assistant"
  | "Quests"
  | "Social"
  | "BattleSimulation";

export interface OSInterface {
  onClick: () => void;
  show: boolean;
  title: string;
  children: React.ReactNode;
  height?: string;
  width?: string;
  hintSection?: HintSection;
}

export interface ExpandableOSInterface extends OSInterface {
  expandedContent?: React.ReactNode;
  expandedWidth?: string;
  isExpanded?: boolean;
  minHeight?: string;
}

export const worldStructures: OSWindows = "World Structures";
export const settings: OSWindows = "Settings";
export const military: OSWindows = "Military";
export const trade: OSWindows = "Trade";
export const construction: OSWindows = "Construction";
export const quests: OSWindows = "Quests";
export const social: OSWindows = "Social";
export const battleSimulation: OSWindows = "BattleSimulation";
