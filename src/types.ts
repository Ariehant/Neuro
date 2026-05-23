import type { Edge, Node } from '@xyflow/react';

export type NodeColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'slate'
  | 'emerald'
  | 'indigo';

export const NODE_COLORS: NodeColor[] = [
  'yellow',
  'blue',
  'green',
  'red',
  'purple',
  'pink',
  'orange',
  'slate',
  'emerald',
  'indigo',
];

export type LinkItem = { id: string; label: string; url: string };
export type ChecklistItem = { id: string; label: string; done: boolean };

export type TopicData = {
  kind: 'topic';
  label: string;
  description?: string;
  color: NodeColor;
};

export type ChecklistData = {
  kind: 'checklist';
  label: string;
  color: NodeColor;
  items: ChecklistItem[];
};

export type LinkGroupData = {
  kind: 'linkGroup';
  label: string;
  color: NodeColor;
  links: LinkItem[];
};

export type StickyData = {
  kind: 'sticky';
  text: string;
  color: NodeColor;
};

export type NodeKind = 'topic' | 'checklist' | 'linkGroup' | 'sticky';

export type AnyNodeData = TopicData | ChecklistData | LinkGroupData | StickyData;

export type MindMapNode = Node<AnyNodeData>;
export type MindMapEdge = Edge;

export type Roadmap = {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  updatedAt: number;
  createdAt: number;
};

export type PersistedState = {
  version: 1;
  roadmaps: Record<string, Roadmap>;
  activeRoadmapId: string | null;
};
