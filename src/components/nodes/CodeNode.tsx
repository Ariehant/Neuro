import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CodeData, MindMapNode } from '../../types';
import { COLOR_MAP } from '../../lib/colors';
import { useRoadmapStore } from '../../store/roadmapStore';

const LANGUAGES = ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c', 'cpp', 'bash', 'sql', 'html', 'css', 'json', 'yaml', 'markdown'];

export function CodeNode({ id, data, selected }: NodeProps<MindMapNode & { data: CodeData }>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.slate;
  const update = useRoadmapStore((s) => s.updateNodeData);

  return (
    <div
      className={[
        'min-w-[280px] max-w-[480px] rounded-lg border-2 shadow-sm transition',
        c.bg, c.border, c.text,
        selected ? `ring-2 ring-offset-2 ${c.ring}` : '',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-1.5 text-xs dark:border-white/10">
        <select
          value={data.language}
          onChange={(e) => update(id, { language: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={`bg-transparent text-xs font-medium ${c.accent} outline-none`}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l} className="bg-white text-slate-900">{l}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(data.code).catch(() => {});
          }}
          className={`text-xs ${c.accent} hover:underline`}
        >
          Copy
        </button>
      </div>
      <textarea
        value={data.code}
        onChange={(e) => update(id, { code: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        spellCheck={false}
        className="block min-h-[100px] w-full resize-y bg-slate-900/90 px-3 py-2 font-mono text-xs text-slate-100 outline-none"
      />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
