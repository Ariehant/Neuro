import { nanoid } from 'nanoid';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LinkGroupData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';
import { InlineEditable } from '../InlineEditable';
import { applyTextStyle } from './textStyle';

export function LinkGroupNode({ id, data, selected }: NodeProps<MindMapNode & { data: LinkGroupData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.green;
  const update = useRoadmapStore((s) => s.updateNodeData);
  const style = applyTextStyle(data.style);

  function patchLinks(next: LinkGroupData['links']) {
    update(id, { links: next } as Partial<LinkGroupData>);
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
          placeholder="Resources"
        />
      </div>
      <ul className="space-y-1 px-3 py-2">
        {data.links.map((l) => (
          <li key={l.id} className="flex items-center gap-1.5 text-xs leading-snug">
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 truncate underline ${c.accent} hover:opacity-80`}
              onClick={(e) => e.stopPropagation()}
              title={l.url}
            >
              {l.label || l.url}
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                patchLinks(data.links.filter((x) => x.id !== l.id));
              }}
              className="opacity-40 hover:opacity-100"
              aria-label="Remove link"
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
              patchLinks([...data.links, { id: nanoid(6), label: 'New link', url: 'https://' }]);
            }}
            className={`text-xs font-medium ${c.accent} hover:underline`}
          >
            + Add link
          </button>
        </li>
      </ul>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
