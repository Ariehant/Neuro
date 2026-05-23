import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNode, TopicData } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';
import { InlineEditable } from '../InlineEditable';
import { applyTextStyle } from './textStyle';

export function TopicNode({ id, data, selected }: NodeProps<MindMapNode & { data: TopicData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.yellow;
  const update = useRoadmapStore((s) => s.updateNodeData);
  const style = applyTextStyle(data.style);

  return (
    <div
      className={[
        'min-w-[180px] max-w-[320px] rounded-lg border-2 px-4 py-3 shadow-sm transition',
        c.bg, c.border, c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
      style={style}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <InlineEditable
        value={data.label}
        onChange={(v) => update(id, { label: v })}
        className="text-sm font-semibold leading-snug"
        placeholder="Topic"
      />
      {(data.description || true) && (
        <div className={`mt-1 text-xs leading-snug ${c.accent}`}>
          <InlineEditable
            value={data.description ?? ''}
            onChange={(v) => update(id, { description: v })}
            multiline
            placeholder="Add description (double-click)"
          />
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
