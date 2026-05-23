import { nanoid } from 'nanoid';
import { selectActiveRoadmap, useRoadmapStore } from '../store/roadmapStore';
import type {
  ChecklistData,
  ChecklistItem,
  LinkGroupData,
  LinkItem,
  NodeColor,
  StickyData,
  TopicData,
} from '../types';
import { COLOR_MAP } from '../lib/colors';
import { NODE_COLORS } from '../types';

function ColorPicker({
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
            value === c ? 'border-slate-900' : 'border-white'
          }`}
          title={c}
        />
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function RightSidebar() {
  const roadmap = useRoadmapStore(selectActiveRoadmap);
  const selectedNodeId = useRoadmapStore((s) => s.selectedNodeId);
  const updateNodeData = useRoadmapStore((s) => s.updateNodeData);

  const node = roadmap?.nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Properties
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">
          Select a node to edit its properties, or drag a new block from the left.
        </div>
      </aside>
    );
  }

  const data = node.data;

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Properties</div>
        <div className="mt-1 text-sm text-slate-500">{kindLabel(data.kind)}</div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {data.kind === 'topic' && (
          <TopicEditor
            data={data}
            onChange={(patch) => updateNodeData(node.id, patch)}
          />
        )}
        {data.kind === 'checklist' && (
          <ChecklistEditor
            data={data}
            onChange={(patch) => updateNodeData(node.id, patch)}
          />
        )}
        {data.kind === 'linkGroup' && (
          <LinkGroupEditor
            data={data}
            onChange={(patch) => updateNodeData(node.id, patch)}
          />
        )}
        {data.kind === 'sticky' && (
          <StickyEditor
            data={data}
            onChange={(patch) => updateNodeData(node.id, patch)}
          />
        )}
      </div>
    </aside>
  );
}

function kindLabel(k: string) {
  switch (k) {
    case 'topic':
      return 'Topic block';
    case 'checklist':
      return 'Checklist';
    case 'linkGroup':
      return 'Link group';
    case 'sticky':
      return 'Sticky note';
    default:
      return k;
  }
}

function TopicEditor({
  data,
  onChange,
}: {
  data: TopicData;
  onChange: (patch: Partial<TopicData>) => void;
}) {
  return (
    <>
      <Field label="Title">
        <input
          value={data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={data.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full resize-none rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
        />
      </Field>
      <Field label="Color">
        <ColorPicker value={data.color} onChange={(color) => onChange({ color })} />
      </Field>
    </>
  );
}

function ChecklistEditor({
  data,
  onChange,
}: {
  data: ChecklistData;
  onChange: (patch: Partial<ChecklistData>) => void;
}) {
  function updateItem(id: string, patch: Partial<ChecklistItem>) {
    onChange({ items: data.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  }
  function removeItem(id: string) {
    onChange({ items: data.items.filter((it) => it.id !== id) });
  }
  function addItem() {
    onChange({ items: [...data.items, { id: nanoid(6), label: 'New item', done: false }] });
  }
  return (
    <>
      <Field label="Title">
        <input
          value={data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
        />
      </Field>
      <Field label="Color">
        <ColorPicker value={data.color} onChange={(color) => onChange({ color })} />
      </Field>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Items</span>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-medium text-sky-700 hover:underline"
          >
            + Add
          </button>
        </div>
        <ul className="space-y-1.5">
          {data.items.map((it) => (
            <li key={it.id} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={it.done}
                onChange={(e) => updateItem(it.id, { done: e.target.checked })}
              />
              <input
                value={it.label}
                onChange={(e) => updateItem(it.id, { label: e.target.value })}
                className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="rounded px-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700"
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function LinkGroupEditor({
  data,
  onChange,
}: {
  data: LinkGroupData;
  onChange: (patch: Partial<LinkGroupData>) => void;
}) {
  function updateLink(id: string, patch: Partial<LinkItem>) {
    onChange({ links: data.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  }
  function removeLink(id: string) {
    onChange({ links: data.links.filter((l) => l.id !== id) });
  }
  function addLink() {
    onChange({ links: [...data.links, { id: nanoid(6), label: 'New link', url: 'https://' }] });
  }
  return (
    <>
      <Field label="Title">
        <input
          value={data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
        />
      </Field>
      <Field label="Color">
        <ColorPicker value={data.color} onChange={(color) => onChange({ color })} />
      </Field>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Links</span>
          <button
            type="button"
            onClick={addLink}
            className="text-xs font-medium text-sky-700 hover:underline"
          >
            + Add
          </button>
        </div>
        <ul className="space-y-2">
          {data.links.map((l) => (
            <li key={l.id} className="space-y-1 rounded border border-slate-200 p-2">
              <div className="flex items-center gap-1.5">
                <input
                  value={l.label}
                  onChange={(e) => updateLink(l.id, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeLink(l.id)}
                  className="rounded px-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700"
                  title="Remove"
                >
                  ×
                </button>
              </div>
              <input
                value={l.url}
                onChange={(e) => updateLink(l.id, { url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded border border-slate-300 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function StickyEditor({
  data,
  onChange,
}: {
  data: StickyData;
  onChange: (patch: Partial<StickyData>) => void;
}) {
  return (
    <>
      <Field label="Text">
        <textarea
          value={data.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={6}
          className="w-full resize-none rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
        />
      </Field>
      <Field label="Color">
        <ColorPicker value={data.color} onChange={(color) => onChange({ color })} />
      </Field>
    </>
  );
}
