import type { PersistedState, Roadmap } from '../types';

const STORAGE_KEY = 'neuro.state.v1';

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist state', err);
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
  return data as Roadmap;
}
