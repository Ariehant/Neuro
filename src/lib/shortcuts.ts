import { useEffect } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const store = useRoadmapStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      const editing = isEditableTarget(e.target);
      const key = e.key;

      if (key === 'Escape') {
        if (store.shortcutsOpen) {
          store.setShortcutsOpen(false);
          return;
        }
        if (store.searchOpen) {
          store.setSearchOpen(false);
          return;
        }
        if (store.presentation) {
          store.togglePresentation();
          return;
        }
        if (!editing) store.clearSelection();
        return;
      }

      if (mod && key.toLowerCase() === 'z' && !e.shiftKey) {
        if (editing) return;
        e.preventDefault();
        store.undo();
        return;
      }
      if (mod && (key.toLowerCase() === 'y' || (key.toLowerCase() === 'z' && e.shiftKey))) {
        if (editing) return;
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && key.toLowerCase() === 's') {
        e.preventDefault();
        store.flushSave();
        return;
      }
      if (mod && key.toLowerCase() === 'k') {
        e.preventDefault();
        store.setSearchOpen(true);
        return;
      }
      if (mod && key.toLowerCase() === 'n') {
        if (editing) return;
        e.preventDefault();
        store.createRoadmap();
        return;
      }
      if (mod && key.toLowerCase() === 'a') {
        if (editing) return;
        e.preventDefault();
        store.selectAll();
        return;
      }
      if (mod && key === '.') {
        e.preventDefault();
        store.toggleTheme();
        return;
      }
      if (mod && key.toLowerCase() === 'd' && !editing) {
        e.preventDefault();
        store.duplicateSelection();
        return;
      }
      if (mod && key.toLowerCase() === 'c' && !editing && store.selectedNodeIds.length) {
        e.preventDefault();
        store.copySelection();
        return;
      }
      if (mod && key.toLowerCase() === 'x' && !editing && store.selectedNodeIds.length) {
        e.preventDefault();
        store.cutSelection();
        return;
      }
      if (mod && key.toLowerCase() === 'v' && !editing && store.clipboard) {
        e.preventDefault();
        store.pasteClipboard();
        return;
      }

      if (!editing) {
        if (key === '?' || (key === '/' && e.shiftKey)) {
          e.preventDefault();
          store.setShortcutsOpen(!store.shortcutsOpen);
          return;
        }
        if (key.toLowerCase() === 'f') {
          e.preventDefault();
          store.togglePresentation();
          return;
        }
        if (key.toLowerCase() === 'g') {
          e.preventDefault();
          store.setSettings({ snapToGrid: !store.settings.snapToGrid });
          return;
        }
        if (key === 'Delete' || key === 'Backspace') {
          if (store.selectedNodeIds.length || store.selectedEdgeId) {
            e.preventDefault();
            store.deleteSelection();
          }
          return;
        }
        if (key.startsWith('Arrow') && store.selectedNodeIds.length) {
          e.preventDefault();
          const step = (e.shiftKey ? 10 : 1) * 10;
          const dx = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0;
          const dy = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0;
          const { activeRoadmapId, roadmaps, selectedNodeIds } = store;
          if (!activeRoadmapId) return;
          const rm = roadmaps[activeRoadmapId];
          const idSet = new Set(selectedNodeIds);
          useRoadmapStore.setState({
            roadmaps: {
              ...roadmaps,
              [activeRoadmapId]: {
                ...rm,
                nodes: rm.nodes.map((n) =>
                  idSet.has(n.id) ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n,
                ),
                updatedAt: Date.now(),
              },
            },
          });
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
