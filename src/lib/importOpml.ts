import { nanoid } from 'nanoid';
import type { MindMapEdge, MindMapNode, Roadmap, TopicData } from '../types';

export function opmlToRoadmap(text: string, fallbackTitle = 'Imported from OPML'): Roadmap {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('OPML parse error');

  const titleEl = doc.querySelector('head > title');
  const title = titleEl?.textContent?.trim() || fallbackTitle;
  const body = doc.querySelector('body');
  if (!body) throw new Error('OPML is missing <body>');

  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  const COLORS: TopicData['color'][] = ['yellow', 'blue', 'green', 'purple', 'pink', 'orange', 'teal'];
  const COL_WIDTH = 280;
  const ROW_HEIGHT = 110;
  let leafY = 0;

  function walk(el: Element, parentId: string | null, depth: number): string | null {
    const text = el.getAttribute('text') ?? el.getAttribute('title') ?? '';
    if (!text) return null;
    const id = nanoid(8);
    const children = Array.from(el.querySelectorAll(':scope > outline'));
    let y: number;
    if (children.length > 0) {
      const childIds: string[] = [];
      for (const c of children) {
        const cid = walk(c, id, depth + 1);
        if (cid) childIds.push(cid);
      }
      if (childIds.length === 0) {
        y = leafY * ROW_HEIGHT;
        leafY += 1;
      } else {
        const ys = childIds.map((cid) => nodes.find((n) => n.id === cid)!.position.y);
        y = (Math.min(...ys) + Math.max(...ys)) / 2;
      }
    } else {
      y = leafY * ROW_HEIGHT;
      leafY += 1;
    }
    nodes.push({
      id,
      type: 'topic',
      position: { x: depth * COL_WIDTH, y },
      data: { kind: 'topic', label: text, color: COLORS[depth % COLORS.length] } as TopicData,
    });
    if (parentId) edges.push({ id: nanoid(8), source: parentId, target: id, type: 'smoothstep' });
    return id;
  }

  Array.from(body.querySelectorAll(':scope > outline')).forEach((root) => walk(root, null, 0));

  const now = Date.now();
  return {
    id: nanoid(10),
    title,
    nodes,
    edges,
    folderId: null,
    tags: ['imported'],
    createdAt: now,
    updatedAt: now,
  };
}
