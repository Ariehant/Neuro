import type { TextStyle } from '../types';

export function TextStyleEditor({
  value,
  onChange,
}: {
  value: TextStyle | undefined;
  onChange: (next: TextStyle) => void;
}) {
  const v: TextStyle = value ?? {};
  function patch(p: Partial<TextStyle>) {
    onChange({ ...v, ...p });
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => patch({ bold: !v.bold })}
        className={`h-7 w-7 rounded border text-sm font-bold ${
          v.bold ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200' : 'border-slate-300 dark:border-slate-600'
        }`}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => patch({ italic: !v.italic })}
        className={`h-7 w-7 rounded border text-sm italic ${
          v.italic ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200' : 'border-slate-300 dark:border-slate-600'
        }`}
        title="Italic"
      >
        I
      </button>
      <div className="ml-1 flex overflow-hidden rounded border border-slate-300 dark:border-slate-600">
        {(['left', 'center', 'right'] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => patch({ align: a })}
            className={`h-7 px-1.5 text-xs ${
              v.align === a ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-100' : ''
            }`}
            title={`Align ${a}`}
          >
            {a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={8}
        max={48}
        value={v.fontSize ?? ''}
        placeholder="size"
        onChange={(e) => patch({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
        className="h-7 w-16 rounded border border-slate-300 px-1.5 text-xs outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-800"
      />
    </div>
  );
}
