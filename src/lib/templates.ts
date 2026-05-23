import { nanoid } from 'nanoid';
import type { MindMapEdge, MindMapNode, Roadmap, TopicData } from '../types';

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  build: () => Roadmap;
};

function topic(label: string, x: number, y: number, color: TopicData['color'], description?: string): MindMapNode {
  return {
    id: nanoid(8),
    type: 'topic',
    position: { x, y },
    data: { kind: 'topic', label, color, description } as TopicData,
  };
}

function edge(source: string, target: string): MindMapEdge {
  return { id: nanoid(8), source, target, type: 'smoothstep' };
}

function wrap(title: string, nodes: MindMapNode[], edges: MindMapEdge[], tags: string[] = []): Roadmap {
  const now = Date.now();
  return { id: nanoid(10), title, nodes, edges, folderId: null, tags, createdAt: now, updatedAt: now };
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty canvas',
    build: () => wrap('Untitled mind map', [], []),
  },
  {
    id: 'frontend-roadmap',
    name: 'Frontend roadmap',
    description: 'roadmap.sh-style learning path',
    build: () => {
      const root = topic('Frontend', 0, 0, 'yellow', 'Where to start');
      const html = topic('HTML', 280, -200, 'orange');
      const css = topic('CSS', 280, -60, 'blue');
      const js = topic('JavaScript', 280, 80, 'yellow');
      const react = topic('React', 560, 80, 'blue');
      const state = topic('State management', 840, 0, 'purple');
      const styling = topic('Styling', 840, 160, 'pink');
      const tests = topic('Testing', 560, 240, 'green');
      const deploy = topic('Deploy', 280, 240, 'emerald');
      const nodes = [root, html, css, js, react, state, styling, tests, deploy];
      const edges = [
        edge(root.id, html.id), edge(root.id, css.id), edge(root.id, js.id),
        edge(js.id, react.id), edge(react.id, state.id), edge(react.id, styling.id),
        edge(root.id, tests.id), edge(root.id, deploy.id),
      ];
      return wrap('Frontend roadmap', nodes, edges, ['template', 'roadmap']);
    },
  },
  {
    id: 'project-plan',
    name: 'Project plan',
    description: 'Goal → milestones → tasks',
    build: () => {
      const goal = topic('Project goal', 0, 0, 'indigo', 'Describe the outcome');
      const m1 = topic('Milestone 1', 280, -160, 'blue');
      const m2 = topic('Milestone 2', 280, 0, 'blue');
      const m3 = topic('Milestone 3', 280, 160, 'blue');
      const t1 = topic('Task A', 560, -200, 'green');
      const t2 = topic('Task B', 560, -120, 'green');
      const t3 = topic('Task C', 560, 0, 'green');
      const t4 = topic('Task D', 560, 120, 'green');
      const t5 = topic('Task E', 560, 200, 'green');
      const nodes = [goal, m1, m2, m3, t1, t2, t3, t4, t5];
      const edges = [
        edge(goal.id, m1.id), edge(goal.id, m2.id), edge(goal.id, m3.id),
        edge(m1.id, t1.id), edge(m1.id, t2.id),
        edge(m2.id, t3.id),
        edge(m3.id, t4.id), edge(m3.id, t5.id),
      ];
      return wrap('Project plan', nodes, edges, ['template', 'planning']);
    },
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    description: 'Liked / Learned / Lacked / Longed for',
    build: () => {
      const cols: TopicData['color'][] = ['green', 'blue', 'orange', 'purple'];
      const labels = ['Liked', 'Learned', 'Lacked', 'Longed for'];
      const nodes = labels.map((l, i) => topic(l, i * 280, 0, cols[i]));
      const sticky = labels.flatMap((_, i) =>
        Array.from({ length: 3 }).map((__, j) => ({
          id: nanoid(8),
          type: 'sticky',
          position: { x: i * 280, y: 140 + j * 90 },
          data: { kind: 'sticky', text: '...', color: cols[i] },
        })),
      );
      return wrap('Sprint retro', [...nodes, ...(sticky as MindMapNode[])], [], ['template', 'retro']);
    },
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Central idea with 6 spokes',
    build: () => {
      const center = topic('Big idea', 0, 0, 'rose');
      const spokes = Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return topic(`Idea ${i + 1}`, Math.cos(a) * 320, Math.sin(a) * 220, (['yellow', 'blue', 'green', 'purple', 'pink', 'orange'] as TopicData['color'][])[i]);
      });
      return wrap('Brainstorm', [center, ...spokes], spokes.map((s) => edge(center.id, s.id)), ['template', 'brainstorm']);
    },
  },
  {
    id: 'okrs',
    name: 'OKRs',
    description: 'Objective with 3 key results',
    build: () => {
      const obj = topic('Objective', 0, 0, 'indigo', 'What you want to achieve');
      const krs = ['Key result 1', 'Key result 2', 'Key result 3'].map((l, i) =>
        topic(l, 320, (i - 1) * 180, 'emerald'),
      );
      return wrap('OKRs', [obj, ...krs], krs.map((k) => edge(obj.id, k.id)), ['template', 'okr']);
    },
  },
];
