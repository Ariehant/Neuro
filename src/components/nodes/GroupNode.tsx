import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import type { GroupData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';
import { InlineEditable } from '../InlineEditable';

export function GroupNode({ id, data, selected }: NodeProps<MindMapNode & { data: GroupData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.indigo;
  const update = useRoadmapStore((s) => s.updateNodeData);

  return (
    <div
      className={[
        'rounded-lg border-2 border-dashed transition',
        c.bg, c.border,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
      style={{ width: data.width, height: data.height, opacity: 0.7 }}
    >
      <NodeResizer
        minWidth={160}
        minHeight={120}
        isVisible={selected}
        lineClassName="!border-sky-500"
        handleClassName="!bg-sky-500"
        onResize={(_, params) => update(id, { width: params.width, height: params.height })}
      />
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className={`px-3 py-1.5 text-xs font-semibold ${c.text}`}>
        <InlineEditable
          value={data.label}
          onChange={(v) => update(id, { label: v })}
          placeholder="Group label"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
