import type { Edge, Node } from '@xyflow/react';

export type NodeColor =
  | 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'pink'
  | 'orange' | 'slate' | 'emerald' | 'indigo' | 'teal' | 'rose';

export const NODE_COLORS: NodeColor[] = [
  'yellow', 'blue', 'green', 'red', 'purple', 'pink',
  'orange', 'slate', 'emerald', 'indigo', 'teal', 'rose',
];

export type TextStyle = {
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
};

export type LinkItem = { id: string; label: string; url: string };
export type ChecklistItem = { id: string; label: string; done: boolean };

export type TopicData = {
  kind: 'topic';
  label: string;
  description?: string;
  color: NodeColor;
  style?: TextStyle;
};

export type ChecklistData = {
  kind: 'checklist';
  label: string;
  color: NodeColor;
  items: ChecklistItem[];
  style?: TextStyle;
};

export type LinkGroupData = {
  kind: 'linkGroup';
  label: string;
  color: NodeColor;
  links: LinkItem[];
  style?: TextStyle;
};

export type StickyData = {
  kind: 'sticky';
  text: string;
  color: NodeColor;
  style?: TextStyle;
};

export type ImageData = {
  kind: 'image';
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type MarkdownData = {
  kind: 'markdown';
  markdown: string;
  color: NodeColor;
  style?: TextStyle;
};

export type CodeData = {
  kind: 'code';
  code: string;
  language: string;
  color: NodeColor;
};

export type GroupData = {
  kind: 'group';
  label: string;
  color: NodeColor;
  width: number;
  height: number;
};

export type NodeKind =
  | 'topic' | 'checklist' | 'linkGroup' | 'sticky'
  | 'image' | 'markdown' | 'code' | 'group';

export type AnyNodeData =
  | TopicData | ChecklistData | LinkGroupData | StickyData
  | ImageData | MarkdownData | CodeData | GroupData;

export type MindMapNode = Node<AnyNodeData>;

export type EdgeStyle = {
  type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';
  animated?: boolean;
  dashed?: boolean;
  strokeWidth?: number;
  color?: string;
  arrowEnd?: boolean;
  arrowStart?: boolean;
};

export type MindMapEdge = Edge & { label?: string; style?: EdgeStyle };

export type Roadmap = {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  folderId: string | null;
  tags: string[];
  updatedAt: number;
  createdAt: number;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  snapToGrid: boolean;
  gridSize: number;
  showMiniMap: boolean;
  background: 'dots' | 'lines' | 'cross' | 'none';
};

export type PersistedState = {
  version: 2;
  roadmaps: Record<string, Roadmap>;
  folders: Record<string, Folder>;
  activeRoadmapId: string | null;
  settings: AppSettings;
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  snapToGrid: false,
  gridSize: 20,
  showMiniMap: true,
  background: 'dots',
};
