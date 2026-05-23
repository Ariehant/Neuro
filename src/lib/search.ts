import type { Roadmap } from '../types';

export type SearchHit = {
  roadmapId: string;
  roadmapTitle: string;
  matchType: 'title' | 'tag' | 'node';
  snippet: string;
  nodeId?: string;
};

function textOf(data: any): string {
  if (!data) return '';
  switch (data.kind) {
    case 'topic': return [data.label, data.description ?? ''].join(' ');
    case 'sticky': return data.text ?? '';
    case 'checklist': return [data.label, ...(data.items ?? []).map((i: any) => i.label)].join(' ');
    case 'linkGroup': return [data.label, ...(data.links ?? []).map((l: any) => `${l.label} ${l.url}`)].join(' ');
    case 'markdown': return data.markdown ?? '';
    case 'code': return data.code ?? '';
    case 'group': return data.label ?? '';
    case 'image': return [data.alt, data.caption].filter(Boolean).join(' ');
    default: return '';
  }
}

export function searchAll(query: string, roadmaps: Record<string, Roadmap>): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];

  for (const rm of Object.values(roadmaps)) {
    if (rm.title.toLowerCase().includes(q)) {
      hits.push({ roadmapId: rm.id, roadmapTitle: rm.title, matchType: 'title', snippet: rm.title });
    }
    for (const tag of rm.tags ?? []) {
      if (tag.toLowerCase().includes(q)) {
        hits.push({ roadmapId: rm.id, roadmapTitle: rm.title, matchType: 'tag', snippet: `#${tag}` });
      }
    }
    for (const node of rm.nodes) {
      const text = textOf(node.data);
      const i = text.toLowerCase().indexOf(q);
      if (i >= 0) {
        const start = Math.max(0, i - 20);
        const end = Math.min(text.length, i + q.length + 30);
        const snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
        hits.push({ roadmapId: rm.id, roadmapTitle: rm.title, matchType: 'node', snippet, nodeId: node.id });
      }
    }
  }
  return hits.slice(0, 50);
}
