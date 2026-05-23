import { nanoid } from 'nanoid';
import { selectActiveRoadmap, useRoadmapStore } from '../store/roadmapStore';
import type {
  ChecklistData,
  ChecklistItem,
  CodeData,
  GroupData,
  ImageData,
  LinkGroupData,
  LinkItem,
  MarkdownData,
  StickyData,
  TopicData,
} from '../types';
import { ColorPicker } from './ColorPicker';
import { TextStyleEditor } from './TextStyleEditor';
import { EdgeStyleEditor } from './EdgeStyleEditor';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

function kindLabel(k: string) {
  switch (k) {
    case 'topic': return 'Topic block';
    case 'checklist': return 'Checklist';
    case 'linkGroup': return 'Link group';
    case 'sticky': return 'Sticky note';
    case 'image': return 'Image';
    case 'markdown': return 'Markdown';
    case 'code': return 'Code snippet';
    case 'group': return 'Group container';
    default: return k;
  }
}

export function RightSidebar() {
  const roadmap = useRoadmapStore(selectActiveRoadmap);
  const selectedNodeIds = useRoadmapStore((s) => s.selectedNodeIds);
  const selectedEdgeId = useRoadmapStore((s) => s.selectedEdgeId);
  const updateNodeData = useRoadmapStore((s) => s.updateNodeData);
  const updateEdge = useRoadmapStore((s) => s.updateEdge);
  const updateEdgeStyle = useRoadmapStore((s) => s.updateEdgeStyle);
  const setRoadmapTags = useRoadmapStore((s) => s.setRoadmapTags);
  const recolorSelection = useRoadmapStore((s) => s.recolorSelection);

  if (!roadmap) return null;

  // Edge editor
  if (selectedEdgeId) {
    const edge = roadmap.edges.find((e) => e.id === selectedEdgeId);
    if (edge) {
      return (
        <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Edge</div>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <EdgeStyleEditor
              edge={edge}
              onChange={(patch) => updateEdgeStyle(edge.id, patch)}
              onLabelChange={(label) => updateEdge(edge.id, { label })}
            />
          </div>
        </aside>
      );
    }
  }

  // Multi-select: show bulk actions only
  if (selectedNodeIds.length > 1) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {selectedNodeIds.length} nodes selected
          </div>
        </div>
        <div className="space-y-4 px-4 py-4">
          <Field label="Recolor all">
            <ColorPicker value="yellow" onChange={(c) => recolorSelection(c)} />
          </Field>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Move them with arrow keys (with Shift for 10x), delete with ⌫, duplicate with Cmd/Ctrl+D, or copy with Cmd/Ctrl+C.
          </p>
        </div>
      </aside>
    );
  }

  // Single-node editor (or map-level when nothing selected)
  const node = selectedNodeIds.length === 1
    ? roadmap.nodes.find((n) => n.id === selectedNodeIds[0])
    : undefined;

  if (!node) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mind map</div>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <Field label="Tags (comma separated)">
            <input
              defaultValue={roadmap.tags.join(', ')}
              onBlur={(e) =>
                setRoadmapTags(
                  roadmap.id,
                  e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                )
              }
              className={inputClass}
              placeholder="planning, work"
            />
          </Field>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <div className="mb-1 font-semibold">Tips</div>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>Drag blocks from the palette onto the canvas.</li>
              <li>Double-click a node to edit it inline.</li>
              <li>Hold Shift / drag empty space to box-select.</li>
              <li>Press <kbd>?</kbd> to see all shortcuts.</li>
            </ul>
          </div>
        </div>
      </aside>
    );
  }

  const data = node.data;

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Properties</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{kindLabel(data.kind)}</div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {data.kind === 'topic' && <TopicEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'checklist' && <ChecklistEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'linkGroup' && <LinkGroupEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'sticky' && <StickyEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'image' && <ImageEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'markdown' && <MarkdownEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'code' && <CodeEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
        {data.kind === 'group' && <GroupEditor data={data} onChange={(p) => updateNodeData(node.id, p)} />}
      </div>
    </aside>
  );
}

function TopicEditor({ data, onChange }: { data: TopicData; onChange: (p: Partial<TopicData>) => void }) {
  return (
    <>
      <Field label="Title">
        <input value={data.label} onChange={(e) => onChange({ label: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea
          value={data.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </Field>
      <Field label="Color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
      <Field label="Text style"><TextStyleEditor value={data.style} onChange={(style) => onChange({ style })} /></Field>
    </>
  );
}

function StickyEditor({ data, onChange }: { data: StickyData; onChange: (p: Partial<StickyData>) => void }) {
  return (
    <>
      <Field label="Text">
        <textarea
          value={data.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={6}
          className={`${inputClass} resize-none`}
        />
      </Field>
      <Field label="Color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
      <Field label="Text style"><TextStyleEditor value={data.style} onChange={(style) => onChange({ style })} /></Field>
    </>
  );
}

function ChecklistEditor({ data, onChange }: { data: ChecklistData; onChange: (p: Partial<ChecklistData>) => void }) {
  function updateItem(id: string, patch: Partial<ChecklistItem>) {
    onChange({ items: data.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  }
  return (
    <>
      <Field label="Title">
        <input value={data.label} onChange={(e) => onChange({ label: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
      <Field label="Text style"><TextStyleEditor value={data.style} onChange={(style) => onChange({ style })} /></Field>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Items</span>
          <button
            type="button"
            onClick={() => onChange({ items: [...data.items, { id: nanoid(6), label: 'New item', done: false }] })}
            className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
          >+ Add</button>
        </div>
        <ul className="space-y-1.5">
          {data.items.map((it) => (
            <li key={it.id} className="flex items-center gap-1.5">
              <input type="checkbox" checked={it.done} onChange={(e) => updateItem(it.id, { done: e.target.checked })} />
              <input
                value={it.label}
                onChange={(e) => updateItem(it.id, { label: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => onChange({ items: data.items.filter((x) => x.id !== it.id) })}
                className="rounded px-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50"
              >×</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function LinkGroupEditor({ data, onChange }: { data: LinkGroupData; onChange: (p: Partial<LinkGroupData>) => void }) {
  function updateLink(id: string, patch: Partial<LinkItem>) {
    onChange({ links: data.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  }
  return (
    <>
      <Field label="Title">
        <input value={data.label} onChange={(e) => onChange({ label: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
      <Field label="Text style"><TextStyleEditor value={data.style} onChange={(style) => onChange({ style })} /></Field>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Links</span>
          <button
            type="button"
            onClick={() => onChange({ links: [...data.links, { id: nanoid(6), label: 'New link', url: 'https://' }] })}
            className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
          >+ Add</button>
        </div>
        <ul className="space-y-2">
          {data.links.map((l) => (
            <li key={l.id} className="space-y-1 rounded border border-slate-200 p-2 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <input
                  value={l.label}
                  onChange={(e) => updateLink(l.id, { label: e.target.value })}
                  placeholder="Label"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onChange({ links: data.links.filter((x) => x.id !== l.id) })}
                  className="rounded px-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50"
                >×</button>
              </div>
              <input
                value={l.url}
                onChange={(e) => updateLink(l.id, { url: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ImageEditor({ data, onChange }: { data: ImageData; onChange: (p: Partial<ImageData>) => void }) {
  return (
    <>
      <Field label="Alt text">
        <input value={data.alt ?? ''} onChange={(e) => onChange({ alt: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Caption">
        <input value={data.caption ?? ''} onChange={(e) => onChange({ caption: e.target.value })} className={inputClass} />
      </Field>
      <p className="text-xs text-slate-500 dark:text-slate-400">Double-click the image on canvas to replace it. Drag image files onto the canvas to drop them.</p>
    </>
  );
}

function MarkdownEditor({ data, onChange }: { data: MarkdownData; onChange: (p: Partial<MarkdownData>) => void }) {
  return (
    <>
      <Field label="Markdown source">
        <textarea
          value={data.markdown}
          onChange={(e) => onChange({ markdown: e.target.value })}
          rows={10}
          className={`${inputClass} resize-y font-mono text-xs`}
        />
      </Field>
      <Field label="Color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
      <Field label="Text style"><TextStyleEditor value={data.style} onChange={(style) => onChange({ style })} /></Field>
    </>
  );
}

function CodeEditor({ data, onChange }: { data: CodeData; onChange: (p: Partial<CodeData>) => void }) {
  return (
    <>
      <Field label="Language">
        <input value={data.language} onChange={(e) => onChange({ language: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Code">
        <textarea
          value={data.code}
          onChange={(e) => onChange({ code: e.target.value })}
          rows={10}
          spellCheck={false}
          className={`${inputClass} resize-y font-mono text-xs`}
        />
      </Field>
      <Field label="Header color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
    </>
  );
}

function GroupEditor({ data, onChange }: { data: GroupData; onChange: (p: Partial<GroupData>) => void }) {
  return (
    <>
      <Field label="Label">
        <input value={data.label} onChange={(e) => onChange({ label: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Color"><ColorPicker value={data.color} onChange={(color) => onChange({ color })} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Width">
          <input
            type="number"
            min={120}
            value={data.width}
            onChange={(e) => onChange({ width: Number(e.target.value) || 320 })}
            className={inputClass}
          />
        </Field>
        <Field label="Height">
          <input
            type="number"
            min={80}
            value={data.height}
            onChange={(e) => onChange({ height: Number(e.target.value) || 220 })}
            className={inputClass}
          />
        </Field>
      </div>
    </>
  );
}
