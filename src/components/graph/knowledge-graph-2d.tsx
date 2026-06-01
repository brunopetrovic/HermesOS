'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// Abstract aesthetic node type
function CustomNexusNode({ data, selected }: NodeProps) {
  return (
    <div className={cn(
      "px-4 py-2 rounded-xl border backdrop-blur-md transition-all",
      selected 
        ? "bg-[#1a1d24] border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-105" 
        : "bg-[#0c0e12]/80 border-[#333a47]/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-2 !h-2 !border-none" />
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          selected ? "bg-orange-500/10" : "bg-transparent"
        )}>
          <Icon icon={data.icon as string} className="text-orange-500" width={16} />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{data.type as string}</div>
          <div className="text-sm font-medium text-slate-200">{data.label as string}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-2 !h-2 !border-none" />
    </div>
  );
}

const nodeTypes = {
  nexus: CustomNexusNode,
};

const initialNodes = [
  { id: '1', type: 'nexus', position: { x: 250, y: 50 }, data: { label: 'Strategic Advisor', icon: 'solar:masks-linear', type: 'Persona' } },
  { id: '2', type: 'nexus', position: { x: 100, y: 150 }, data: { label: 'SOUL.md', icon: 'solar:document-text-linear', type: 'Identity' } },
  { id: '3', type: 'nexus', position: { x: 400, y: 150 }, data: { label: 'Web Search', icon: 'solar:global-linear', type: 'Skill' } },
  { id: '4', type: 'nexus', position: { x: 250, y: 250 }, data: { label: 'You', icon: 'solar:user-linear', type: 'Core' } },
];

const initialEdges = [
  { 
    id: 'e1-2', source: '1', target: '2', 
    animated: true, 
    style: { stroke: 'rgba(249, 115, 22, 0.6)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(249, 115, 22, 0.8)' }
  },
  { 
    id: 'e1-3', source: '1', target: '3',
    animated: true,
    style: { stroke: 'rgba(148, 163, 184, 0.6)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(148, 163, 184, 0.8)' }
  },
  { 
    id: 'e4-1', source: '4', target: '1',
    animated: false,
    style: { stroke: 'rgba(249, 115, 22, 0.6)', strokeWidth: 2, strokeDasharray: '5 5' },
  },
];

export function KnowledgeGraph2D() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(249, 115, 22, 0.5)', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full relative" style={{ background: 'transparent' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="nexus-flow"
      >
        <Background gap={24} size={2} color="rgba(249, 115, 22, 0.15)" />
        <Controls className="!bg-[#0c0e12]/80 !border-[#333a47]/40 !backdrop-blur-md !fill-slate-400" />
      </ReactFlow>

      {/* Global override style for the React Flow viewport to integrate with our theme */}
      <style jsx global>{`
        .react-flow__panel.react-flow__controls button {
          background: transparent;
          border-bottom: 1px solid rgba(51, 58, 71, 0.4);
        }
        .react-flow__panel.react-flow__controls button:hover {
          background: rgba(249, 115, 22, 0.1);
          fill: #f97316;
        }
      `}</style>
    </div>
  );
}
