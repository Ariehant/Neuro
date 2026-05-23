import { useRef } from 'react';
import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import type { ImageData, MindMapNode } from '../../types';
import { useRoadmapStore } from '../../store/roadmapStore';
import { fileToDataUrl } from '../../lib/storage';
import { InlineEditable } from '../InlineEditable';

export function ImageNode({ id, data, selected }: NodeProps<MindMapNode & { data: ImageData }>) {
  const update = useRoadmapStore((s) => s.updateNodeData);
  const fileInput = useRef<HTMLInputElement | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    update(id, { src: dataUrl, alt: file.name });
  }

  return (
    <div
      className={[
        'flex h-full w-full flex-col overflow-hidden rounded-md border bg-white shadow-sm transition dark:bg-slate-900',
        selected ? 'ring-2 ring-sky-500 ring-offset-2' : 'border-slate-300 dark:border-slate-700',
      ].join(' ')}
      style={{ width: data.width ?? 240, height: 'auto' }}
    >
      <NodeResizer minWidth={120} minHeight={80} isVisible={selected} lineClassName="!border-sky-500" handleClassName="!bg-sky-500" />
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-500" />
      {data.src ? (
        <img
          src={data.src}
          alt={data.alt ?? ''}
          draggable={false}
          className="h-auto w-full select-none"
          onDoubleClick={(e) => {
            e.stopPropagation();
            fileInput.current?.click();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInput.current?.click();
          }}
          className="flex aspect-video w-full items-center justify-center bg-slate-100 text-xs text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          Click to upload image
        </button>
      )}
      <div className="px-2 py-1 text-xs italic text-slate-600 dark:text-slate-300">
        <InlineEditable
          value={data.caption ?? ''}
          onChange={(v) => update(id, { caption: v })}
          placeholder="Add caption"
        />
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-500" />
    </div>
  );
}
