export enum NodeType {
  START_END = 'START_END', // Pill shape
  PROCESS = 'PROCESS',     // Rectangle
  DECISION = 'DECISION',   // Diamond
  DATA = 'DATA',           // Parallelogram
  PREPARATION = 'PREPARATION', // Octagon
  SQUARE = 'SQUARE',       // Perfect Box
  CIRCLE = 'CIRCLE'        // Cylinder/Coin
}

export enum EdgeStyle {
  CURVED = 'CURVED',
  STRAIGHT = 'STRAIGHT',
  STEP = 'STEP'
}

export interface NodeData {
  id: string;
  type: NodeType;
  text: string;
  x: number;
  y: number;
  color: string; // Hex code
  width?: number;
  height?: number;
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
  style?: EdgeStyle;
  hasArrow?: boolean;
}

export interface FlowchartState {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface HistoryState {
  past: FlowchartState[];
  present: FlowchartState;
  future: FlowchartState[];
}

// Industry Standard Flowchart Colors (Material Design inspired, professional)
export const NODE_COLORS = {
  PROCESS_BLUE: '#42A5F5',      // Standard Process
  DECISION_ORANGE: '#FFA726',   // Standard Decision
  START_GREEN: '#66BB6A',       // Standard Start/End
  DATA_TEAL: '#26A69A',         // Standard Data
  PREP_YELLOW: '#FFEE58',       // Preparation
  TERMINAL_RED: '#EF5350',      // Error/Terminator alternative
  NEUTRAL_GRAY: '#BDBDBD',      // Comments/Annotations
  PURPLE_ACCENT: '#AB47BC',     // Special Process
  WHITE: '#FFFFFF',             // Clean look
  DARK: '#455A64'               // System/Db
};

export const INITIAL_NODES: NodeData[] = [];

export const INITIAL_EDGES: EdgeData[] = [];