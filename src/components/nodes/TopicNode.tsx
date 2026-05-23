import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNode, TopicData } from '../../types';
import { COLOR_MAP } from '../../lib/colors';

export function TopicNode({ data, selected }: NodeProps<MindMapNode & { data: TopicData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.yellow;
  return (
    <div
      className={[
        'min-w-[180px] max-w-[280px] rounded-lg border-2 px-4 py-3 shadow-sm transition',
        c.bg,
        c.border,
        c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className="text-sm font-semibold leading-snug">{data.label || 'Topic'}</div>
      {data.description && (
        <div className={`mt-1 text-xs leading-snug ${c.accent}`}>{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
