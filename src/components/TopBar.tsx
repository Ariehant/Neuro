import { useRef, useState } from 'react';
import { selectActiveRoadmap, useRoadmapStore } from '../store/roadmapStore';
import { downloadJson, downloadText, exportCanvasPng, exportCanvasSvg } from '../lib/exportPng';
import { exportCanvasPdf } from '../lib/exportPdf';
import { exportRoadmapJson, parseRoadmapJson } from '../lib/storage';
import { markdownToRoadmap } from '../lib/importMarkdown';
import { opmlToRoadmap } from '../lib/importOpml';
import { TemplateGallery } from './TemplateGallery';

function formatTime(ts: number | null) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SaveIndicator() {
  const status = useRoadmapStore((s) => s.saveStatus);
  const lastSavedAt = useRoadmapStore((s) => s.lastSavedAt);
  const label = status === 'saved' ? (lastSavedAt ? `Saved at ${formatTime(lastSavedAt)}` : 'Saved') : 'Saving...';
  return (
    <span
      className={`text-xs ${status === 'saved' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}
      title="Auto-saved to IndexedDB"
    >
      {label}
    </span>
  );
}

function Menu({
  label,
  children,
}: {
  label: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {label}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 min-w-[180px] rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="block w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

export function TopBar() {
  const roadmap = useRoadmapStore(selectActiveRoadmap);
  const renameRoadmap = useRoadmapStore((s) => s.renameRoadmap);
  const importRoadmap = useRoadmapStore((s) => s.importRoadmap);
  const undo = useRoadmapStore((s) => s.undo);
  const redo = useRoadmapStore((s) => s.redo);
  const canUndo = useRoadmapStore((s) => s.canUndo());
  const canRedo = useRoadmapStore((s) => s.canRedo());
  const settings = useRoadmapStore((s) => s.settings);
  const setSettings = useRoadmapStore((s) => s.setSettings);
  const toggleTheme = useRoadmapStore((s) => s.toggleTheme);
  const setShortcutsOpen = useRoadmapStore((s) => s.setShortcutsOpen);
  const togglePresentation = useRoadmapStore((s) => s.togglePresentation);
  const setSearchOpen = useRoadmapStore((s) => s.setSearchOpen);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  if (!roadmap) return null;

  const safe = roadmap.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 40) || 'mindmap';
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#0f172a' : '#f8fafc';

  async function withBusy(label: string, fn: () => Promise<void>) {
    setExporting(label);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      alert(`Failed: ${(err as Error).message}`);
    } finally {
      setExporting(null);
    }
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const name = file.name.toLowerCase();
      if (name.endsWith('.json')) importRoadmap(parseRoadmapJson(text));
      else if (name.endsWith('.md') || name.endsWith('.markdown') || name.endsWith('.txt')) importRoadmap(markdownToRoadmap(text, file.name.replace(/\.[^.]+$/, '')));
      else if (name.endsWith('.opml') || name.endsWith('.xml')) importRoadmap(opmlToRoadmap(text, file.name.replace(/\.[^.]+$/, '')));
      else alert('Unsupported file. Use .json, .md, or .opml.');
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-sky-600 text-white">
          <span className="text-sm font-bold">N</span>
        </div>
        <input
          value={roadmap.title}
          onChange={(e) => renameRoadmap(roadmap.id, e.target.value)}
          className="w-72 rounded border border-transparent bg-transparent px-2 py-1 text-base font-semibold text-slate-900 hover:border-slate-200 focus:border-sky-500 focus:outline-none dark:text-slate-100 dark:hover:border-slate-700"
          placeholder="Untitled mind map"
          aria-label="Mind map title"
        />
        <SaveIndicator />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Undo (Cmd/Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Redo (Cmd/Ctrl+Shift+Z)"
        >
          ↷
        </button>
        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <Menu label="View">
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  setSettings({ snapToGrid: !settings.snapToGrid });
                  close();
                }}
              >
                {settings.snapToGrid ? '✓ ' : ''}Snap to grid
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setSettings({ showMiniMap: !settings.showMiniMap });
                  close();
                }}
              >
                {settings.showMiniMap ? '✓ ' : ''}Show mini-map
              </MenuItem>
              <div className="mx-2 my-1 border-t border-slate-100 dark:border-slate-800" />
              {(['dots', 'lines', 'cross', 'none'] as const).map((b) => (
                <MenuItem
                  key={b}
                  onClick={() => {
                    setSettings({ background: b });
                    close();
                  }}
                >
                  {settings.background === b ? '✓ ' : ''}Background: {b}
                </MenuItem>
              ))}
              <div className="mx-2 my-1 border-t border-slate-100 dark:border-slate-800" />
              <MenuItem
                onClick={() => {
                  toggleTheme();
                  close();
                }}
              >
                Toggle dark mode
              </MenuItem>
              <MenuItem
                onClick={() => {
                  togglePresentation();
                  close();
                }}
              >
                Presentation mode (F)
              </MenuItem>
            </>
          )}
        </Menu>

        <Menu label="Import">
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  fileInput.current?.click();
                  close();
                }}
              >
                From file (.json / .md / .opml)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setTemplatesOpen(true);
                  close();
                }}
              >
                From template…
              </MenuItem>
            </>
          )}
        </Menu>

        <Menu label="Export">
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  close();
                  withBusy('PNG', () => exportCanvasPng(`${safe}.png`, { background: bg }));
                }}
              >
                PNG image
              </MenuItem>
              <MenuItem
                onClick={() => {
                  close();
                  withBusy('SVG', () => exportCanvasSvg(`${safe}.svg`, { background: bg }));
                }}
              >
                SVG vector
              </MenuItem>
              <MenuItem
                onClick={() => {
                  close();
                  withBusy('PDF', () => exportCanvasPdf(`${safe}.pdf`, bg));
                }}
              >
                PDF document
              </MenuItem>
              <MenuItem
                onClick={() => {
                  close();
                  downloadJson(exportRoadmapJson(roadmap!), `${safe}.json`);
                }}
              >
                JSON
              </MenuItem>
              <MenuItem
                onClick={() => {
                  close();
                  downloadText(roadmapToMarkdownOutline(roadmap!), `${safe}.md`, 'text/markdown');
                }}
              >
                Markdown outline
              </MenuItem>
            </>
          )}
        </Menu>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Search (Cmd/Ctrl+K)"
        >
          🔍
        </button>
        <button
          type="button"
          onClick={() => setShortcutsOpen(true)}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Shortcuts (?)"
        >
          ?
        </button>

        {exporting && (
          <span className="text-xs text-slate-500 dark:text-slate-400">Exporting {exporting}…</span>
        )}

        <input
          ref={fileInput}
          type="file"
          accept=".json,.md,.markdown,.opml,.xml,.txt,application/json,text/markdown"
          onChange={onFileChosen}
          className="hidden"
        />
      </div>

      {templatesOpen && <TemplateGallery onClose={() => setTemplatesOpen(false)} />}
    </header>
  );
}

function roadmapToMarkdownOutline(rm: { nodes: any[]; edges: any[]; title: string }): string {
  // Build adjacency, then BFS from roots (nodes with no incoming edge)
  const incoming = new Map<string, number>();
  const childrenOf = new Map<string, string[]>();
  rm.nodes.forEach((n) => incoming.set(n.id, 0));
  rm.edges.forEach((e) => {
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
    childrenOf.set(e.source, [...(childrenOf.get(e.source) ?? []), e.target]);
  });
  const nodeMap = new Map<string, any>(rm.nodes.map((n) => [n.id, n]));
  const out: string[] = [`# ${rm.title}`, ''];

  function labelOf(n: any): string {
    const d = n.data;
    if (!d) return '';
    if (d.kind === 'topic' || d.kind === 'checklist' || d.kind === 'linkGroup' || d.kind === 'group') return d.label;
    if (d.kind === 'sticky') return d.text;
    if (d.kind === 'markdown') return d.markdown.split('\n')[0].replace(/^#+\s*/, '');
    if (d.kind === 'code') return `code:${d.language}`;
    if (d.kind === 'image') return d.caption || d.alt || '[image]';
    return '';
  }

  function walk(id: string, depth: number, visited: Set<string>) {
    if (visited.has(id)) return;
    visited.add(id);
    const n = nodeMap.get(id);
    if (!n) return;
    const prefix = depth === 0 ? '## ' : `${'  '.repeat(depth - 1)}- `;
    out.push(`${prefix}${labelOf(n)}`);
    (childrenOf.get(id) ?? []).forEach((cid) => walk(cid, depth + 1, visited));
  }

  const visited = new Set<string>();
  rm.nodes
    .filter((n) => (incoming.get(n.id) ?? 0) === 0)
    .forEach((n) => walk(n.id, 0, visited));
  // Append orphans
  rm.nodes.forEach((n) => {
    if (!visited.has(n.id)) walk(n.id, 0, visited);
  });

  return out.join('\n');
}
