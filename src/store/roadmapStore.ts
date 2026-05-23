import { create } from 'zustand';
import { nanoid } from 'nanoid';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import type {
  AnyNodeData,
  ChecklistData,
  LinkGroupData,
  MindMapEdge,
  MindMapNode,
  NodeKind,
  PersistedState,
  Roadmap,
  StickyData,
  TopicData,
} from '../types';
import { loadState, saveState } from '../lib/storage';

type HistorySnapshot = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  title: string;
};

type RoadmapHistory = {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
};

const HISTORY_LIMIT = 50;

type State = {
  roadmaps: Record<string, Roadmap>;
  activeRoadmapId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  history: Record<string, RoadmapHistory>;
  saveStatus: 'saved' | 'saving' | 'dirty';
  lastSavedAt: number | null;
};

type Actions = {
  hydrate: () => void;
  createRoadmap: (title?: string) => string;
  deleteRoadmap: (id: string) => void;
  renameRoadmap: (id: string, title: string) => void;
  setActiveRoadmap: (id: string) => void;
  importRoadmap: (roadmap: Roadmap) => string;

  onNodesChange: (changes: NodeChange<MindMapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<MindMapEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDragStart: () => void;

  addNodeAt: (kind: NodeKind, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, patch: Partial<AnyNodeData>) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  flushSave: () => void;
};

export type RoadmapStore = State & Actions;

function makeDefaultData(kind: NodeKind): AnyNodeData {
  switch (kind) {
    case 'topic':
      return { kind: 'topic', label: 'New topic', description: '', color: 'yellow' } as TopicData;
    case 'checklist':
      return {
        kind: 'checklist',
        label: 'Checklist',
        color: 'blue',
        items: [
          { id: nanoid(6), label: 'First step', done: false },
          { id: nanoid(6), label: 'Second step', done: false },
        ],
      } as ChecklistData;
    case 'linkGroup':
      return {
        kind: 'linkGroup',
        label: 'Resources',
        color: 'green',
        links: [{ id: nanoid(6), label: 'Example', url: 'https://example.com' }],
      } as LinkGroupData;
    case 'sticky':
      return { kind: 'sticky', text: 'Write a note...', color: 'yellow' } as StickyData;
  }
}

function makeEmptyRoadmap(title = 'Untitled mind map'): Roadmap {
  const now = Date.now();
  return {
    id: nanoid(10),
    title,
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  };
}

function makeStarterRoadmap(): Roadmap {
  const now = Date.now();
  const root: MindMapNode = {
    id: nanoid(8),
    type: 'topic',
    position: { x: 0, y: 0 },
    data: { kind: 'topic', label: 'Start here', description: 'Drop nodes from the left palette.', color: 'yellow' },
  };
  return {
    id: nanoid(10),
    title: 'My first mind map',
    nodes: [root],
    edges: [],
    createdAt: now,
    updatedAt: now,
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let dragSnapshotTaken = false;

function scheduleSave(get: () => RoadmapStore) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { roadmaps, activeRoadmapId } = get();
    const persisted: PersistedState = { version: 1, roadmaps, activeRoadmapId };
    saveState(persisted);
    useRoadmapStore.setState({ saveStatus: 'saved', lastSavedAt: Date.now() });
  }, 600);
}

function markDirty(get: () => RoadmapStore) {
  useRoadmapStore.setState({ saveStatus: 'saving' });
  scheduleSave(get);
}

function snapshotOf(rm: Roadmap): HistorySnapshot {
  return { nodes: rm.nodes, edges: rm.edges, title: rm.title };
}

function pushHistory(get: () => RoadmapStore, set: (partial: Partial<State>) => void) {
  const { activeRoadmapId, roadmaps, history } = get();
  if (!activeRoadmapId) return;
  const rm = roadmaps[activeRoadmapId];
  if (!rm) return;
  const current = history[activeRoadmapId] ?? { past: [], future: [] };
  const past = [...current.past, snapshotOf(rm)];
  if (past.length > HISTORY_LIMIT) past.shift();
  set({ history: { ...history, [activeRoadmapId]: { past, future: [] } } });
}

function mutateActiveRoadmap(
  get: () => RoadmapStore,
  set: (partial: Partial<State>) => void,
  mutator: (rm: Roadmap) => Roadmap,
  options: { history?: boolean } = { history: true },
) {
  const { activeRoadmapId, roadmaps } = get();
  if (!activeRoadmapId) return;
  const rm = roadmaps[activeRoadmapId];
  if (!rm) return;
  if (options.history) pushHistory(get, set);
  const updated = { ...mutator(rm), updatedAt: Date.now() };
  set({ roadmaps: { ...roadmaps, [activeRoadmapId]: updated } });
  markDirty(get);
}

export const useRoadmapStore = create<RoadmapStore>((set, get) => ({
  roadmaps: {},
  activeRoadmapId: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  history: {},
  saveStatus: 'saved',
  lastSavedAt: null,

  hydrate: () => {
    const persisted = loadState();
    if (persisted && Object.keys(persisted.roadmaps).length > 0) {
      const activeId =
        persisted.activeRoadmapId && persisted.roadmaps[persisted.activeRoadmapId]
          ? persisted.activeRoadmapId
          : Object.keys(persisted.roadmaps)[0];
      set({ roadmaps: persisted.roadmaps, activeRoadmapId: activeId, saveStatus: 'saved' });
    } else {
      const starter = makeStarterRoadmap();
      set({
        roadmaps: { [starter.id]: starter },
        activeRoadmapId: starter.id,
        saveStatus: 'saved',
      });
      scheduleSave(get);
    }
  },

  createRoadmap: (title) => {
    const rm = makeEmptyRoadmap(title ?? 'Untitled mind map');
    set((s) => ({
      roadmaps: { ...s.roadmaps, [rm.id]: rm },
      activeRoadmapId: rm.id,
      selectedNodeId: null,
      selectedEdgeId: null,
    }));
    markDirty(get);
    return rm.id;
  },

  deleteRoadmap: (id) => {
    const { roadmaps, activeRoadmapId, history } = get();
    if (!roadmaps[id]) return;
    const next = { ...roadmaps };
    delete next[id];
    const nextHistory = { ...history };
    delete nextHistory[id];
    let nextActive = activeRoadmapId;
    if (activeRoadmapId === id) {
      const remaining = Object.keys(next);
      nextActive = remaining[0] ?? null;
      if (!nextActive) {
        const starter = makeEmptyRoadmap();
        next[starter.id] = starter;
        nextActive = starter.id;
      }
    }
    set({
      roadmaps: next,
      activeRoadmapId: nextActive,
      history: nextHistory,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
    markDirty(get);
  },

  renameRoadmap: (id, title) => {
    const { roadmaps } = get();
    const rm = roadmaps[id];
    if (!rm) return;
    set({ roadmaps: { ...roadmaps, [id]: { ...rm, title, updatedAt: Date.now() } } });
    markDirty(get);
  },

  setActiveRoadmap: (id) => {
    if (!get().roadmaps[id]) return;
    set({ activeRoadmapId: id, selectedNodeId: null, selectedEdgeId: null });
    markDirty(get);
  },

  importRoadmap: (roadmap) => {
    const rm: Roadmap = {
      ...roadmap,
      id: nanoid(10),
      createdAt: roadmap.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({
      roadmaps: { ...s.roadmaps, [rm.id]: rm },
      activeRoadmapId: rm.id,
      selectedNodeId: null,
      selectedEdgeId: null,
    }));
    markDirty(get);
    return rm.id;
  },

  onNodesChange: (changes) => {
    mutateActiveRoadmap(
      get,
      set,
      (rm) => ({ ...rm, nodes: applyNodeChanges(changes, rm.nodes) }),
      { history: false },
    );
  },

  onEdgesChange: (changes) => {
    mutateActiveRoadmap(
      get,
      set,
      (rm) => ({ ...rm, edges: applyEdgeChanges(changes, rm.edges) }),
      { history: false },
    );
  },

  onConnect: (connection) => {
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      edges: addEdge(
        { ...connection, id: nanoid(8), type: 'smoothstep', animated: false },
        rm.edges,
      ),
    }));
  },

  onNodeDragStart: () => {
    if (dragSnapshotTaken) return;
    dragSnapshotTaken = true;
    pushHistory(get, set);
    setTimeout(() => {
      dragSnapshotTaken = false;
    }, 50);
  },

  addNodeAt: (kind, position) => {
    const node: MindMapNode = {
      id: nanoid(8),
      type: kind,
      position,
      data: makeDefaultData(kind),
    };
    mutateActiveRoadmap(get, set, (rm) => ({ ...rm, nodes: [...rm.nodes, node] }));
    set({ selectedNodeId: node.id, selectedEdgeId: null });
  },

  updateNodeData: (id, patch) => {
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: rm.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } as AnyNodeData } : n,
      ),
    }));
  },

  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: id ? null : get().selectedEdgeId }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: id ? null : get().selectedNodeId }),

  deleteSelection: () => {
    const { selectedNodeId, selectedEdgeId } = get();
    if (!selectedNodeId && !selectedEdgeId) return;
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: selectedNodeId ? rm.nodes.filter((n) => n.id !== selectedNodeId) : rm.nodes,
      edges: rm.edges.filter((e) => {
        if (selectedEdgeId && e.id === selectedEdgeId) return false;
        if (selectedNodeId && (e.source === selectedNodeId || e.target === selectedNodeId)) return false;
        return true;
      }),
    }));
    set({ selectedNodeId: null, selectedEdgeId: null });
  },

  duplicateSelection: () => {
    const { selectedNodeId, roadmaps, activeRoadmapId } = get();
    if (!selectedNodeId || !activeRoadmapId) return;
    const rm = roadmaps[activeRoadmapId];
    const original = rm.nodes.find((n) => n.id === selectedNodeId);
    if (!original) return;
    const copy: MindMapNode = {
      ...original,
      id: nanoid(8),
      position: { x: original.position.x + 40, y: original.position.y + 40 },
      selected: false,
    };
    mutateActiveRoadmap(get, set, (rm2) => ({ ...rm2, nodes: [...rm2.nodes, copy] }));
    set({ selectedNodeId: copy.id });
  },

  undo: () => {
    const { activeRoadmapId, roadmaps, history } = get();
    if (!activeRoadmapId) return;
    const h = history[activeRoadmapId];
    if (!h || h.past.length === 0) return;
    const rm = roadmaps[activeRoadmapId];
    const previous = h.past[h.past.length - 1];
    const newPast = h.past.slice(0, -1);
    const newFuture = [snapshotOf(rm), ...h.future];
    const updated: Roadmap = { ...rm, ...previous, updatedAt: Date.now() };
    set({
      roadmaps: { ...roadmaps, [activeRoadmapId]: updated },
      history: { ...history, [activeRoadmapId]: { past: newPast, future: newFuture } },
    });
    markDirty(get);
  },

  redo: () => {
    const { activeRoadmapId, roadmaps, history } = get();
    if (!activeRoadmapId) return;
    const h = history[activeRoadmapId];
    if (!h || h.future.length === 0) return;
    const rm = roadmaps[activeRoadmapId];
    const next = h.future[0];
    const newFuture = h.future.slice(1);
    const newPast = [...h.past, snapshotOf(rm)];
    const updated: Roadmap = { ...rm, ...next, updatedAt: Date.now() };
    set({
      roadmaps: { ...roadmaps, [activeRoadmapId]: updated },
      history: { ...history, [activeRoadmapId]: { past: newPast, future: newFuture } },
    });
    markDirty(get);
  },

  canUndo: () => {
    const { activeRoadmapId, history } = get();
    if (!activeRoadmapId) return false;
    return (history[activeRoadmapId]?.past.length ?? 0) > 0;
  },

  canRedo: () => {
    const { activeRoadmapId, history } = get();
    if (!activeRoadmapId) return false;
    return (history[activeRoadmapId]?.future.length ?? 0) > 0;
  },

  flushSave: () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    const { roadmaps, activeRoadmapId } = get();
    saveState({ version: 1, roadmaps, activeRoadmapId });
    set({ saveStatus: 'saved', lastSavedAt: Date.now() });
  },
}));

export function selectActiveRoadmap(s: RoadmapStore): Roadmap | null {
  return s.activeRoadmapId ? s.roadmaps[s.activeRoadmapId] ?? null : null;
}
