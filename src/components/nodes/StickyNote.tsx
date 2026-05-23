import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNode, StickyData } from '../../types';
import { COLOR_MAP } from '../../lib/colors';

export function StickyNote({ data, selected }: NodeProps<MindMapNode & { data: StickyData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.yellow;
  return (
    <div
      className={[
        'min-w-[160px] max-w-[260px] rounded-md border px-3 py-2 shadow-sm transition',
        c.bg,
        c.border,
        c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className="whitespace-pre-wrap text-xs leading-snug">{data.text || 'Write a note...'}</div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
