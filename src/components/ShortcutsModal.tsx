import { useRoadmapStore } from '../store/roadmapStore';

const ROWS: Array<{ keys: string; label: string }> = [
  { keys: 'Cmd/Ctrl + Z', label: 'Undo' },
  { keys: 'Cmd/Ctrl + Shift + Z  ·  Cmd/Ctrl + Y', label: 'Redo' },
  { keys: 'Cmd/Ctrl + S', label: 'Force save' },
  { keys: 'Cmd/Ctrl + C / X / V', label: 'Copy / Cut / Paste nodes' },
  { keys: 'Cmd/Ctrl + D', label: 'Duplicate selection' },
  { keys: 'Cmd/Ctrl + A', label: 'Select all on current map' },
  { keys: 'Cmd/Ctrl + K', label: 'Open search' },
  { keys: 'Cmd/Ctrl + N', label: 'New mind map' },
  { keys: 'Cmd/Ctrl + .', label: 'Toggle dark mode' },
  { keys: 'Delete / Backspace', label: 'Delete selection' },
  { keys: 'Arrow keys', label: 'Move selection (Shift = 10x)' },
  { keys: 'Tab', label: 'Cycle through nodes' },
  { keys: 'Enter', label: 'Edit selected node' },
  { keys: 'F', label: 'Toggle presentation mode' },
  { keys: 'G', label: 'Toggle grid snap' },
  { keys: '?', label: 'Show this shortcuts list' },
  { keys: 'Esc', label: 'Clear selection / close dialog' },
];

export function ShortcutsModal() {
  const open = useRoadmapStore((s) => s.shortcutsOpen);
  const setOpen = useRoadmapStore((s) => s.setShortcutsOpen);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shortcuts-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {ROWS.map((r) => (
            <li key={r.keys} className="flex items-center justify-between gap-4 py-1.5 text-sm">
              <span className="text-slate-700 dark:text-slate-200">{r.label}</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {r.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
