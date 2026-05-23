import { MarkerType } from '@xyflow/react';
import type { EdgeStyle, MindMapEdge } from '../types';

export function EdgeStyleEditor({
  edge,
  onChange,
  onLabelChange,
}: {
  edge: MindMapEdge;
  onChange: (patch: Partial<EdgeStyle> & Partial<MindMapEdge>) => void;
  onLabelChange: (label: string) => void;
}) {
  const s: EdgeStyle = edge.style ?? {};
  return (
    <div className="space-y-3">
      <Field label="Label">
        <input
          value={edge.label ?? ''}
          onChange={(e) => onLabelChange(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-800"
          placeholder="No label"
        />
      </Field>
      <Field label="Type">
        <select
          value={s.type ?? edge.type ?? 'smoothstep'}
          onChange={(e) => onChange({ type: e.target.value as EdgeStyle['type'] })}
          className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="default">Default (bezier)</option>
          <option value="straight">Straight</option>
          <option value="step">Step</option>
          <option value="smoothstep">Smooth step</option>
        </select>
      </Field>
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.animated ?? edge.animated ?? false}
            onChange={(e) => onChange({ animated: e.target.checked })}
          />
          Animated
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.dashed ?? false}
            onChange={(e) => onChange({ dashed: e.target.checked })}
          />
          Dashed
        </label>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.arrowEnd ?? true}
            onChange={(e) =>
              onChange({
                arrowEnd: e.target.checked,
                markerEnd: e.target.checked ? { type: MarkerType.ArrowClosed, color: s.color ?? '#475569' } : undefined,
              })
            }
          />
          Arrow end
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.arrowStart ?? false}
            onChange={(e) =>
              onChange({
                arrowStart: e.target.checked,
                markerStart: e.target.checked ? { type: MarkerType.ArrowClosed, color: s.color ?? '#475569' } : undefined,
              })
            }
          />
          Arrow start
        </label>
      </div>
      <Field label="Stroke width">
        <input
          type="range"
          min={1}
          max={8}
          step={0.5}
          value={s.strokeWidth ?? 1.5}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
          className="w-full"
        />
      </Field>
      <Field label="Color">
        <input
          type="color"
          value={s.color ?? '#475569'}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-8 w-full cursor-pointer rounded border border-slate-300 dark:border-slate-600"
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
