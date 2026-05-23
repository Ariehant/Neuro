import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MarkdownData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';
import { renderMarkdown } from '../../lib/markdown';
import { applyTextStyle } from './textStyle';

export function MarkdownNode({ id, data, selected }: NodeProps<MindMapNode & { data: MarkdownData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.slate;
  const update = useRoadmapStore((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  const style = applyTextStyle(data.style);

  return (
    <div
      className={[
        'min-w-[260px] max-w-[420px] rounded-lg border-2 shadow-sm transition',
        c.bg, c.border, c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
      style={style}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-1.5 text-xs dark:border-white/10">
        <span className={`font-semibold ${c.accent}`}>Markdown</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing((v) => !v);
          }}
          className={`text-xs font-medium ${c.accent} hover:underline`}
        >
          {editing ? 'Preview' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <textarea
          value={data.markdown}
          onChange={(e) => update(id, { markdown: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="h-48 w-full resize-none bg-transparent px-3 py-2 font-mono text-xs outline-none"
        />
      ) : (
        <div
          className="prose prose-sm max-w-none px-3 py-2 dark:prose-invert"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.markdown) }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        />
      )}
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
