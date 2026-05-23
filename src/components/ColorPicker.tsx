import type { NodeColor } from '../types';
import { NODE_COLORS } from '../types';
import { COLOR_MAP } from '../lib/colors';

export function ColorPicker({
  value,
  onChange,
}: {
  value: NodeColor;
  onChange: (c: NodeColor) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {NODE_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-6 w-6 rounded-full border-2 ${COLOR_MAP[c].swatch} ${
            value === c ? 'border-slate-900 dark:border-white' : 'border-white dark:border-slate-700'
          }`}
          title={c}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}
