import { nanoid } from 'nanoid';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ChecklistData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';
import { InlineEditable } from '../InlineEditable';
import { applyTextStyle } from './textStyle';

export function ChecklistNode({ id, data, selected }: NodeProps<MindMapNode & { data: ChecklistData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.blue;
  const update = useRoadmapStore((s) => s.updateNodeData);
  const style = applyTextStyle(data.style);

  function patchItems(next: ChecklistData['items']) {
    update(id, { items: next } as Partial<ChecklistData>);
  }

  return (
    <div
      className={[
        'min-w-[220px] max-w-[340px] rounded-lg border-2 shadow-sm transition',
        c.bg, c.border, c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
      style={style}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className="border-b border-black/10 px-3 py-2 text-sm font-semibold dark:border-white/10">
        <InlineEditable
          value={data.label}
          onChange={(v) => update(id, { label: v })}
          placeholder="Checklist"
        />
      </div>
      <ul className="space-y-1 px-3 py-2">
        {data.items.map((it) => (
          <li key={it.id} className="flex items-start gap-2 text-xs leading-snug">
            <input
              type="checkbox"
              className="mt-0.5 cursor-pointer accent-current"
              checked={it.done}
              onChange={() => patchItems(data.items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
              onClick={(e) => e.stopPropagation()}
            />
            <div className={`flex-1 ${it.done ? 'opacity-60 line-through' : ''}`}>
              <InlineEditable
                value={it.label}
                onChange={(v) => patchItems(data.items.map((x) => (x.id === it.id ? { ...x, label: v } : x)))}
                placeholder="Item"
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                patchItems(data.items.filter((x) => x.id !== it.id));
              }}
              className="opacity-40 hover:opacity-100"
              aria-label="Remove item"
            >
              ×
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              patchItems([...data.items, { id: nanoid(6), label: 'New item', done: false }]);
            }}
            className={`text-xs font-medium ${c.accent} hover:underline`}
          >
            + Add item
          </button>
        </li>
      </ul>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
