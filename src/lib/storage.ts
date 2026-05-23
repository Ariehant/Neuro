import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { PersistedState, Roadmap } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'neuro.state.v2';
const LEGACY_KEY = 'neuro.state.v1';

export async function loadState(): Promise<PersistedState | null> {
  try {
    const current = await idbGet<PersistedState>(STORAGE_KEY);
    if (current && current.version === 2) return current;

    const legacy = await idbGet<{ roadmaps: Record<string, Roadmap>; activeRoadmapId: string | null }>(LEGACY_KEY);
    if (legacy && legacy.roadmaps) {
      const migrated: PersistedState = {
        version: 2,
        roadmaps: Object.fromEntries(
          Object.entries(legacy.roadmaps).map(([id, r]) => [
            id,
            { ...r, folderId: null, tags: [] } as Roadmap,
          ]),
        ),
        folders: {},
        activeRoadmapId: legacy.activeRoadmapId,
        settings: DEFAULT_SETTINGS,
      };
      await idbSet(STORAGE_KEY, migrated);
      await idbDel(LEGACY_KEY);
      return migrated;
    }

    const localLegacy = localStorage.getItem(LEGACY_KEY);
    if (localLegacy) {
      const parsed = JSON.parse(localLegacy) as { roadmaps: Record<string, Roadmap>; activeRoadmapId: string | null };
      const migrated: PersistedState = {
        version: 2,
        roadmaps: Object.fromEntries(
          Object.entries(parsed.roadmaps ?? {}).map(([id, r]) => [
            id,
            { ...r, folderId: null, tags: [] } as Roadmap,
          ]),
        ),
        folders: {},
        activeRoadmapId: parsed.activeRoadmapId ?? null,
        settings: DEFAULT_SETTINGS,
      };
      await idbSet(STORAGE_KEY, migrated);
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }

    return null;
  } catch (err) {
    console.error('loadState failed', err);
    return null;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  try {
    await idbSet(STORAGE_KEY, state);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded — please export your mind maps and remove old ones.');
    }
    throw err;
  }
}

export function exportRoadmapJson(roadmap: Roadmap): string {
  return JSON.stringify(roadmap, null, 2);
}

export function parseRoadmapJson(text: string): Roadmap {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('Missing nodes/edges arrays');
  }
  return {
    ...data,
    folderId: data.folderId ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
  } as Roadmap;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
