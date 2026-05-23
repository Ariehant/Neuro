import { useState } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import { TEMPLATES } from '../lib/templates';

export function TemplateGallery({ onClose }: { onClose: () => void }) {
  const importRoadmap = useRoadmapStore((s) => s.importRoadmap);
  const [selected, setSelected] = useState<string | null>(null);

  function pick(id: string) {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    importRoadmap(t.build());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New from template</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              onDoubleClick={() => pick(t.id)}
              className={`rounded-lg border p-4 text-left transition ${
                selected === t.id
                  ? 'border-sky-500 ring-2 ring-sky-200 dark:ring-sky-900'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && pick(selected)}
            className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
