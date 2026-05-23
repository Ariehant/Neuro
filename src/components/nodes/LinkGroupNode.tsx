import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LinkGroupData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';

export function LinkGroupNode({ data, selected }: NodeProps<MindMapNode & { data: LinkGroupData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.green;
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
        {data.label || 'Resources'}
      </div>
      <ul className="space-y-1 px-3 py-2">
        {data.links.map((l) => (
          <li key={l.id} className="text-xs leading-snug">
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${c.accent} hover:opacity-80`}
              onClick={(e) => e.stopPropagation()}
            >
              {l.label || l.url}
            </a>
          </li>
        ))}
        {data.links.length === 0 && (
          <li className={`text-xs italic ${c.accent}`}>No links yet</li>
        )}
      </ul>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
