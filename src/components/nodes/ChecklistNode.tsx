import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ChecklistData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';

export function ChecklistNode({ id, data, selected }: NodeProps<MindMapNode & { data: ChecklistData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.blue;
  const updateNodeData = useRoadmapStore((s) => s.updateNodeData);

  function toggle(itemId: string) {
    const items = data.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it));
    updateNodeData(id, { items } as Partial<ChecklistData>);
  }

  return (
    <div
      className={[
        'min-w-[220px] max-w-[320px] rounded-lg border-2 shadow-sm transition',
        c.bg,
        c.border,
        c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className="border-b border-black/10 px-3 py-2 text-sm font-semibold">
        {data.label || 'Checklist'}
      </div>
      <ul className="space-y-1 px-3 py-2">
        {data.items.map((it) => (
          <li key={it.id} className="flex items-start gap-2 text-xs leading-snug">
            <input
              type="checkbox"
              className="mt-0.5 cursor-pointer accent-current"
              checked={it.done}
              onChange={() => toggle(it.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className={it.done ? 'opacity-60 line-through' : ''}>{it.label}</span>
          </li>
        ))}
        {data.items.length === 0 && (
          <li className={`text-xs italic ${c.accent}`}>No items yet</li>
        )}
      </ul>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
