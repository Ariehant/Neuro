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
  AppSettings,
  ChecklistData,
  CodeData,
  EdgeStyle,
  Folder,
  GroupData,
  ImageData,
  LinkGroupData,
  MarkdownData,
  MindMapEdge,
  MindMapNode,
  NodeKind,
  PersistedState,
  Roadmap,
  StickyData,
  TopicData,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { loadState, saveState } from '../lib/storage';

const HISTORY_LIMIT = 50;
const AUTOSAVE_MS = 500;

type HistorySnapshot = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  title: string;
};

type RoadmapHistory = { past: HistorySnapshot[]; future: HistorySnapshot[] };

export type Clipboard = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} | null;

type State = {
  hydrated: boolean;
  roadmaps: Record<string, Roadmap>;
  folders: Record<string, Folder>;
  activeRoadmapId: string | null;
  selectedNodeIds: string[];
  selectedEdgeId: string | null;
  history: Record<string, RoadmapHistory>;
  clipboard: Clipboard;
  saveStatus: 'saved' | 'saving';
  lastSavedAt: number | null;
  settings: AppSettings;
  presentation: boolean;
  shortcutsOpen: boolean;
  searchOpen: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;

  // Roadmaps
  createRoadmap: (title?: string, folderId?: string | null) => string;
  deleteRoadmap: (id: string) => void;
  duplicateRoadmap: (id: string) => string;
  renameRoadmap: (id: string, title: string) => void;
  setActiveRoadmap: (id: string) => void;
  importRoadmap: (roadmap: Roadmap) => string;
  setRoadmapFolder: (id: string, folderId: string | null) => void;
  setRoadmapTags: (id: string, tags: string[]) => void;

  // Folders
  createFolder: (name: string) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  // Canvas
  onNodesChange: (changes: NodeChange<MindMapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<MindMapEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDragStart: () => void;
  addNodeAt: (kind: NodeKind, position: { x: number; y: number }, dataOverride?: Partial<AnyNodeData>) => string;

  // Node/edge mutations
  updateNodeData: (id: string, patch: Partial<AnyNodeData>) => void;
  updateNodeSize: (id: string, size: { width?: number; height?: number }) => void;
  updateEdge: (id: string, patch: Partial<MindMapEdge>) => void;
  updateEdgeStyle: (id: string, style: Partial<EdgeStyle>) => void;

  // Selection
  setSelectedNodes: (ids: string[]) => void;
  toggleSelectNode: (id: string) => void;
  setSelectedEdge: (id: string | null) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Bulk
  deleteSelection: () => void;
  duplicateSelection: () => void;
  copySelection: () => void;
  cutSelection: () => void;
  pasteClipboard: (position?: { x: number; y: number }) => void;
  recolorSelection: (color: import('../types').NodeColor) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Settings
  setSettings: (patch: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  togglePresentation: () => void;
  setShortcutsOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;

  // Save
  flushSave: () => Promise<void>;
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
    case 'image':
      return { kind: 'image', src: '', alt: '', caption: '', width: 240, height: 160 } as ImageData;
    case 'markdown':
      return {
        kind: 'markdown',
        markdown: '## Heading\n\nWrite **markdown** here. _Inline_ formatting, lists, etc.',
        color: 'slate',
      } as MarkdownData;
    case 'code':
      return {
        kind: 'code',
        code: '// Write code here\nconst answer = 42;',
        language: 'javascript',
        color: 'slate',
      } as CodeData;
    case 'group':
      return { kind: 'group', label: 'Group', color: 'indigo', width: 320, height: 220 } as GroupData;
  }
}

function makeEmptyRoadmap(title = 'Untitled mind map'): Roadmap {
  const now = Date.now();
  return {
    id: nanoid(10),
    title,
    nodes: [],
    edges: [],
    folderId: null,
    tags: [],
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
    data: { kind: 'topic', label: 'Start here', description: 'Drop blocks from the left palette, then connect them. Double-click any node to edit inline.', color: 'yellow' },
  };
  return {
    id: nanoid(10),
    title: 'My first mind map',
    nodes: [root],
    edges: [],
    folderId: null,
    tags: ['getting-started'],
    createdAt: now,
    updatedAt: now,
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let dragSnapshotTaken = false;

function persistedFrom(state: State): PersistedState {
  return {
    version: 2,
    roadmaps: state.roadmaps,
    folders: state.folders,
    activeRoadmapId: state.activeRoadmapId,
    settings: state.settings,
  };
}

function scheduleSave(get: () => RoadmapStore) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      await saveState(persistedFrom(get()));
      useRoadmapStore.setState({ saveStatus: 'saved', lastSavedAt: Date.now() });
    } catch (err) {
      console.error('Auto-save failed', err);
    }
  }, AUTOSAVE_MS);
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
  hydrated: false,
  roadmaps: {},
  folders: {},
  activeRoadmapId: null,
  selectedNodeIds: [],
  selectedEdgeId: null,
  history: {},
  clipboard: null,
  saveStatus: 'saved',
  lastSavedAt: null,
  settings: DEFAULT_SETTINGS,
  presentation: false,
  shortcutsOpen: false,
  searchOpen: false,

  hydrate: async () => {
    const persisted = await loadState();
    if (persisted && Object.keys(persisted.roadmaps).length > 0) {
      const activeId =
        persisted.activeRoadmapId && persisted.roadmaps[persisted.activeRoadmapId]
          ? persisted.activeRoadmapId
          : Object.keys(persisted.roadmaps)[0];
      set({
        roadmaps: persisted.roadmaps,
        folders: persisted.folders ?? {},
        settings: { ...DEFAULT_SETTINGS, ...persisted.settings },
        activeRoadmapId: activeId,
        hydrated: true,
        saveStatus: 'saved',
      });
    } else {
      const starter = makeStarterRoadmap();
      set({
        roadmaps: { [starter.id]: starter },
        folders: {},
        activeRoadmapId: starter.id,
        hydrated: true,
        saveStatus: 'saved',
      });
      scheduleSave(get);
    }
  },

  createRoadmap: (title, folderId = null) => {
    const rm = makeEmptyRoadmap(title ?? 'Untitled mind map');
    rm.folderId = folderId ?? null;
    set((s) => ({
      roadmaps: { ...s.roadmaps, [rm.id]: rm },
      activeRoadmapId: rm.id,
      selectedNodeIds: [],
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
        const blank = makeEmptyRoadmap();
        next[blank.id] = blank;
        nextActive = blank.id;
      }
    }
    set({
      roadmaps: next,
      activeRoadmapId: nextActive,
      history: nextHistory,
      selectedNodeIds: [],
      selectedEdgeId: null,
    });
    markDirty(get);
  },

  duplicateRoadmap: (id) => {
    const { roadmaps } = get();
    const orig = roadmaps[id];
    if (!orig) return id;
    const copy: Roadmap = {
      ...orig,
      id: nanoid(10),
      title: `${orig.title} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({
      roadmaps: { ...roadmaps, [copy.id]: copy },
      activeRoadmapId: copy.id,
      selectedNodeIds: [],
      selectedEdgeId: null,
    });
    markDirty(get);
    return copy.id;
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
    set({ activeRoadmapId: id, selectedNodeIds: [], selectedEdgeId: null });
    markDirty(get);
  },

  importRoadmap: (roadmap) => {
    const rm: Roadmap = {
      ...roadmap,
      id: nanoid(10),
      folderId: roadmap.folderId ?? null,
      tags: roadmap.tags ?? [],
      createdAt: roadmap.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({
      roadmaps: { ...s.roadmaps, [rm.id]: rm },
      activeRoadmapId: rm.id,
      selectedNodeIds: [],
      selectedEdgeId: null,
    }));
    markDirty(get);
    return rm.id;
  },

  setRoadmapFolder: (id, folderId) => {
    const { roadmaps } = get();
    const rm = roadmaps[id];
    if (!rm) return;
    set({ roadmaps: { ...roadmaps, [id]: { ...rm, folderId, updatedAt: Date.now() } } });
    markDirty(get);
  },

  setRoadmapTags: (id, tags) => {
    const { roadmaps } = get();
    const rm = roadmaps[id];
    if (!rm) return;
    set({ roadmaps: { ...roadmaps, [id]: { ...rm, tags, updatedAt: Date.now() } } });
    markDirty(get);
  },

  createFolder: (name) => {
    const folder: Folder = { id: nanoid(8), name, createdAt: Date.now() };
    set((s) => ({ folders: { ...s.folders, [folder.id]: folder } }));
    markDirty(get);
    return folder.id;
  },

  renameFolder: (id, name) => {
    const { folders } = get();
    const f = folders[id];
    if (!f) return;
    set({ folders: { ...folders, [id]: { ...f, name } } });
    markDirty(get);
  },

  deleteFolder: (id) => {
    const { folders, roadmaps } = get();
    if (!folders[id]) return;
    const nextFolders = { ...folders };
    delete nextFolders[id];
    const nextRoadmaps = Object.fromEntries(
      Object.entries(roadmaps).map(([rid, r]) => [
        rid,
        r.folderId === id ? { ...r, folderId: null } : r,
      ]),
    );
    set({ folders: nextFolders, roadmaps: nextRoadmaps });
    markDirty(get);
  },

  onNodesChange: (changes) => {
    mutateActiveRoadmap(
      get,
      set,
      (rm) => ({ ...rm, nodes: applyNodeChanges(changes, rm.nodes) }),
      { history: false },
    );

    const selectionChanges = changes.filter((c) => c.type === 'select');
    if (selectionChanges.length > 0) {
      const { roadmaps, activeRoadmapId } = get();
      if (activeRoadmapId) {
        const rm = roadmaps[activeRoadmapId];
        const ids = rm.nodes.filter((n) => n.selected).map((n) => n.id);
        set({ selectedNodeIds: ids });
      }
    }
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
      ) as MindMapEdge[],
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

  addNodeAt: (kind, position, dataOverride) => {
    const { settings } = get();
    const snapped = settings.snapToGrid
      ? {
          x: Math.round(position.x / settings.gridSize) * settings.gridSize,
          y: Math.round(position.y / settings.gridSize) * settings.gridSize,
        }
      : position;
    const baseData = makeDefaultData(kind);
    const data = (dataOverride ? { ...baseData, ...dataOverride } : baseData) as AnyNodeData;
    const node: MindMapNode = {
      id: nanoid(8),
      type: kind,
      position: snapped,
      data,
    };
    mutateActiveRoadmap(get, set, (rm) => ({ ...rm, nodes: [...rm.nodes, node] }));
    set({ selectedNodeIds: [node.id], selectedEdgeId: null });
    return node.id;
  },

  updateNodeData: (id, patch) => {
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: rm.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } as AnyNodeData } : n,
      ),
    }));
  },

  updateNodeSize: (id, size) => {
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: rm.nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              style: { ...n.style, ...size },
              data:
                n.data.kind === 'image' || n.data.kind === 'group'
                  ? ({ ...n.data, ...size } as AnyNodeData)
                  : n.data,
            }
          : n,
      ),
    }));
  },

  updateEdge: (id, patch) => {
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      edges: rm.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  },

  updateEdgeStyle: (id, stylePatch) => {
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      edges: rm.edges.map((e) => {
        if (e.id !== id) return e;
        const merged: EdgeStyle = { ...e.style, ...stylePatch };
        return { ...e, style: merged, type: merged.type ?? e.type, animated: merged.animated ?? e.animated };
      }),
    }));
  },

  setSelectedNodes: (ids) => set({ selectedNodeIds: ids, selectedEdgeId: ids.length ? null : get().selectedEdgeId }),
  toggleSelectNode: (id) =>
    set((s) => ({
      selectedNodeIds: s.selectedNodeIds.includes(id)
        ? s.selectedNodeIds.filter((x) => x !== id)
        : [...s.selectedNodeIds, id],
      selectedEdgeId: null,
    })),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeIds: id ? [] : get().selectedNodeIds }),
  selectAll: () => {
    const { activeRoadmapId, roadmaps } = get();
    if (!activeRoadmapId) return;
    const rm = roadmaps[activeRoadmapId];
    const ids = rm.nodes.map((n) => n.id);
    set({
      selectedNodeIds: ids,
      roadmaps: {
        ...roadmaps,
        [activeRoadmapId]: { ...rm, nodes: rm.nodes.map((n) => ({ ...n, selected: true })) },
      },
    });
  },
  clearSelection: () => {
    const { activeRoadmapId, roadmaps } = get();
    if (activeRoadmapId) {
      const rm = roadmaps[activeRoadmapId];
      set({
        roadmaps: {
          ...roadmaps,
          [activeRoadmapId]: { ...rm, nodes: rm.nodes.map((n) => ({ ...n, selected: false })) },
        },
      });
    }
    set({ selectedNodeIds: [], selectedEdgeId: null });
  },

  deleteSelection: () => {
    const { selectedNodeIds, selectedEdgeId } = get();
    if (selectedNodeIds.length === 0 && !selectedEdgeId) return;
    const idSet = new Set(selectedNodeIds);
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: rm.nodes.filter((n) => !idSet.has(n.id)),
      edges: rm.edges.filter((e) => {
        if (selectedEdgeId && e.id === selectedEdgeId) return false;
        if (idSet.has(e.source) || idSet.has(e.target)) return false;
        return true;
      }),
    }));
    set({ selectedNodeIds: [], selectedEdgeId: null });
  },

  duplicateSelection: () => {
    const { selectedNodeIds, activeRoadmapId, roadmaps } = get();
    if (!activeRoadmapId || selectedNodeIds.length === 0) return;
    const rm = roadmaps[activeRoadmapId];
    const idSet = new Set(selectedNodeIds);
    const idMap = new Map<string, string>();
    const copies: MindMapNode[] = rm.nodes
      .filter((n) => idSet.has(n.id))
      .map((n) => {
        const newId = nanoid(8);
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: false,
        };
      });
    const newEdges: MindMapEdge[] = rm.edges
      .filter((e) => idMap.has(e.source) && idMap.has(e.target))
      .map((e) => ({
        ...e,
        id: nanoid(8),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: false,
      }));
    mutateActiveRoadmap(get, set, (rm2) => ({
      ...rm2,
      nodes: [...rm2.nodes, ...copies],
      edges: [...rm2.edges, ...newEdges],
    }));
    set({ selectedNodeIds: copies.map((n) => n.id) });
  },

  copySelection: () => {
    const { selectedNodeIds, activeRoadmapId, roadmaps } = get();
    if (!activeRoadmapId || selectedNodeIds.length === 0) return;
    const rm = roadmaps[activeRoadmapId];
    const idSet = new Set(selectedNodeIds);
    const nodes = rm.nodes.filter((n) => idSet.has(n.id));
    const edges = rm.edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));
    set({ clipboard: { nodes, edges } });
  },

  cutSelection: () => {
    get().copySelection();
    get().deleteSelection();
  },

  pasteClipboard: (position) => {
    const { clipboard } = get();
    if (!clipboard || clipboard.nodes.length === 0) return;
    const idMap = new Map<string, string>();
    const offset = position ?? { x: 40, y: 40 };
    const minX = Math.min(...clipboard.nodes.map((n) => n.position.x));
    const minY = Math.min(...clipboard.nodes.map((n) => n.position.y));

    const newNodes: MindMapNode[] = clipboard.nodes.map((n) => {
      const newId = nanoid(8);
      idMap.set(n.id, newId);
      const dx = position ? n.position.x - minX : 40;
      const dy = position ? n.position.y - minY : 40;
      return {
        ...n,
        id: newId,
        position: position
          ? { x: offset.x + dx, y: offset.y + dy }
          : { x: n.position.x + dx, y: n.position.y + dy },
        selected: false,
      };
    });
    const newEdges: MindMapEdge[] = clipboard.edges.map((e) => ({
      ...e,
      id: nanoid(8),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: false,
    }));
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: [...rm.nodes, ...newNodes],
      edges: [...rm.edges, ...newEdges],
    }));
    set({ selectedNodeIds: newNodes.map((n) => n.id) });
  },

  recolorSelection: (color) => {
    const { selectedNodeIds } = get();
    if (selectedNodeIds.length === 0) return;
    const idSet = new Set(selectedNodeIds);
    mutateActiveRoadmap(get, set, (rm) => ({
      ...rm,
      nodes: rm.nodes.map((n) =>
        idSet.has(n.id) && 'color' in n.data
          ? ({ ...n, data: { ...n.data, color } as AnyNodeData })
          : n,
      ),
    }));
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

  setSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    markDirty(get);
  },

  toggleTheme: () => {
    set((s) => {
      const next = s.settings.theme === 'dark' ? 'light' : 'dark';
      return { settings: { ...s.settings, theme: next } };
    });
    markDirty(get);
  },

  togglePresentation: () => set((s) => ({ presentation: !s.presentation })),
  setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),

  flushSave: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    try {
      await saveState(persistedFrom(get()));
      set({ saveStatus: 'saved', lastSavedAt: Date.now() });
    } catch (err) {
      console.error('Flush save failed', err);
    }
  },
}));

export function selectActiveRoadmap(s: RoadmapStore): Roadmap | null {
  return s.activeRoadmapId ? s.roadmaps[s.activeRoadmapId] ?? null : null;
}
