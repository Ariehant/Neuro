import { useCallback, useMemo, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRoadmapStore, selectActiveRoadmap } from '../store/roadmapStore';
import type { MindMapEdge, MindMapNode, NodeKind } from '../types';
import { TopicNode } from './nodes/TopicNode';
import { ChecklistNode } from './nodes/ChecklistNode';
import { LinkGroupNode } from './nodes/LinkGroupNode';
import { StickyNote } from './nodes/StickyNote';

const nodeTypes = {
  topic: TopicNode,
  checklist: ChecklistNode,
  linkGroup: LinkGroupNode,
  sticky: StickyNote,
};

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const roadmap = useRoadmapStore(selectActiveRoadmap);
  const onNodesChange = useRoadmapStore((s) => s.onNodesChange);
  const onEdgesChange = useRoadmapStore((s) => s.onEdgesChange);
  const onConnect = useRoadmapStore((s) => s.onConnect);
  const onNodeDragStart = useRoadmapStore((s) => s.onNodeDragStart);
  const addNodeAt = useRoadmapStore((s) => s.addNodeAt);
  const setSelectedNode = useRoadmapStore((s) => s.setSelectedNode);
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
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNodeAt(kind, position);
    },
    [screenToFlowPosition, addNodeAt],
  );

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
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
        onPaneClick={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-left"
          pannable
          zoomable
          nodeColor={(n: Node) => {
            const data = n.data as { color?: string };
            return data?.color ? `var(--mini-${data.color}, #cbd5e1)` : '#cbd5e1';
          }}
        />
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
