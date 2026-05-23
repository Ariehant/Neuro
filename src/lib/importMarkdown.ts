import { nanoid } from 'nanoid';
import type { MindMapEdge, MindMapNode, Roadmap, TopicData } from '../types';

type OutlineNode = { title: string; depth: number; children: OutlineNode[] };

function parseOutline(text: string): OutlineNode[] {
  const lines = text.split(/\r?\n/);
  const roots: OutlineNode[] = [];
  const stack: OutlineNode[] = [];

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;

    let depth: number;
    let title: string;

    const heading = rawLine.match(/^(#{1,6})\s+(.+)$/);
    const bullet = rawLine.match(/^(\s*)([-*+])\s+(.+)$/);

    if (heading) {
      depth = heading[1].length;
      title = heading[2].trim();
    } else if (bullet) {
      depth = Math.floor(bullet[1].length / 2) + 7;
      title = bullet[3].trim();
    } else {
      continue;
    }

    const node: OutlineNode = { title, depth, children: [] };
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  return roots;
}

export function markdownToRoadmap(text: string, title = 'Imported from Markdown'): Roadmap {
  const roots = parseOutline(text);
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  const COLORS: TopicData['color'][] = ['yellow', 'blue', 'green', 'purple', 'pink', 'orange', 'teal'];
  const COL_WIDTH = 280;
  const ROW_HEIGHT = 110;
  let leafY = 0;

  function layout(o: OutlineNode, parentId: string | null, depth: number): string {
    const id = nanoid(8);
    const hasChildren = o.children.length > 0;
    let yPos: number;
    if (hasChildren) {
      const childIds = o.children.map((c) => layout(c, id, depth + 1));
      const childYs = childIds.map((cid) => nodes.find((n) => n.id === cid)!.position.y);
      yPos = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    } else {
      yPos = leafY * ROW_HEIGHT;
      leafY += 1;
    }
    nodes.push({
      id,
      type: 'topic',
      position: { x: depth * COL_WIDTH, y: yPos },
      data: { kind: 'topic', label: o.title, color: COLORS[depth % COLORS.length] } as TopicData,
    });
    if (parentId) {
      edges.push({ id: nanoid(8), source: parentId, target: id, type: 'smoothstep' });
    }
    return id;
  }

  roots.forEach((root) => layout(root, null, 0));

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
