import { useCallback, useMemo, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { selectActiveRoadmap, useRoadmapStore } from '../store/roadmapStore';
import type { MindMapEdge, MindMapNode, NodeKind } from '../types';
import { COLOR_MAP } from '../lib/colors';
import { TopicNode } from './nodes/TopicNode';
import { ChecklistNode } from './nodes/ChecklistNode';
import { LinkGroupNode } from './nodes/LinkGroupNode';
import { StickyNote } from './nodes/StickyNote';
import { ImageNode } from './nodes/ImageNode';
import { MarkdownNode } from './nodes/MarkdownNode';
import { CodeNode } from './nodes/CodeNode';
import { GroupNode } from './nodes/GroupNode';

const nodeTypes = {
  topic: TopicNode,
  checklist: ChecklistNode,
  linkGroup: LinkGroupNode,
  sticky: StickyNote,
  image: ImageNode,
  markdown: MarkdownNode,
  code: CodeNode,
  group: GroupNode,
};

function backgroundVariant(b: 'dots' | 'lines' | 'cross' | 'none'): BackgroundVariant | null {
  if (b === 'dots') return BackgroundVariant.Dots;
  if (b === 'lines') return BackgroundVariant.Lines;
  if (b === 'cross') return BackgroundVariant.Cross;
  return null;
}

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const roadmap = useRoadmapStore(selectActiveRoadmap);
  const settings = useRoadmapStore((s) => s.settings);
  const presentation = useRoadmapStore((s) => s.presentation);
  const onNodesChange = useRoadmapStore((s) => s.onNodesChange);
  const onEdgesChange = useRoadmapStore((s) => s.onEdgesChange);
  const onConnect = useRoadmapStore((s) => s.onConnect);
  const onNodeDragStart = useRoadmapStore((s) => s.onNodeDragStart);
  const addNodeAt = useRoadmapStore((s) => s.addNodeAt);
  const setSelectedNodes = useRoadmapStore((s) => s.setSelectedNodes);
  const setSelectedEdge = useRoadmapStore((s) => s.setSelectedEdge);

  const nodes = useMemo<MindMapNode[]>(() => roadmap?.nodes ?? [], [roadmap?.nodes]);
  const edges = useMemo<MindMapEdge[]>(() => roadmap?.edges ?? [], [roadmap?.edges]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData('application/x-neuro-node') as NodeKind;
      if (kind) {
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        addNodeAt(kind, position);
        return;
      }
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
          addNodeAt('image', position, { src: String(reader.result), alt: file.name });
        };
        reader.readAsDataURL(file);
      }
    },
    [screenToFlowPosition, addNodeAt],
  );

  const bgVariant = backgroundVariant(settings.background);

  return (
    <div ref={wrapperRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow<MindMapNode, MindMapEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onSelectionChange={({ nodes: sel }) => {
          setSelectedNodes(sel.map((n) => n.id));
        }}
        onNodeClick={(_, node: Node) => setSelectedNodes([node.id])}
        onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
        onPaneClick={() => {
          setSelectedNodes([]);
          setSelectedEdge(null);
        }}
        snapToGrid={settings.snapToGrid}
        snapGrid={[settings.gridSize, settings.gridSize]}
        selectionMode={SelectionMode.Partial}
        selectionOnDrag
        panOnDrag={[1, 2]}
        multiSelectionKeyCode={['Meta', 'Shift', 'Control']}
        deleteKeyCode={null}
        elementsSelectable={!presentation}
        nodesDraggable={!presentation}
        nodesConnectable={!presentation}
        edgesReconnectable={!presentation}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        {bgVariant !== null && (
          <Background variant={bgVariant} gap={settings.gridSize} size={1} color="currentColor" className="text-slate-300 dark:text-slate-700" />
        )}
        {!presentation && <Controls position="bottom-right" showInteractive={false} className="!bg-white dark:!bg-slate-800 dark:!border-slate-700 [&_button]:dark:!bg-slate-800 [&_button]:dark:!border-slate-700 [&_button]:dark:!text-slate-200" />}
        {settings.showMiniMap && !presentation && (
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeStrokeWidth={3}
            nodeColor={(n) => {
              const data = n.data as { color?: keyof typeof COLOR_MAP };
              return data?.color ? COLOR_MAP[data.color].miniMap : '#cbd5e1';
            }}
            className="!bg-white !border !border-slate-200 dark:!bg-slate-800 dark:!border-slate-700"
          />
        )}
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
