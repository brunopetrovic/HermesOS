'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

// Sample data for the 3D graph (could be shared with 2D)
const nodesData = [
  { id: '1', label: 'Persona Studio', color: '#f97316', group: 'feature' }, // orange-500
  { id: '2', label: 'Knowledge Graph', color: '#fb923c', group: 'feature' }, // orange-400
  { id: '3', label: 'SOUL.md', color: '#fdba74', group: 'identity' }, // orange-300
  { id: '4', label: 'Skills Db', color: '#94a3b8', group: 'core' }, // slate-400
  { id: '5', label: 'Hermes Engine', color: '#f97316', group: 'core' }, // orange-500
  { id: '6', label: 'Command Bar', color: '#cbd5e1', group: 'feature' }, // slate-300
];

const linksData = [
  { source: 4, target: 3 },
  { source: 4, target: 5 },
  { source: 4, target: 1 },
  { source: 0, target: 2 },
  { source: 1, target: 4 },
  { source: 0, target: 5 },
];

function Node({ position, color, label, isCentral = false }: { position: [number, number, number], color: string, label: string, isCentral?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
      // Gentle floating
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[isCentral ? 0.8 : 0.5, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={hovered ? 2 : 0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Halo effect */}
      <mesh>
        <sphereGeometry args={[isCentral ? 1.0 : 0.7, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
      </mesh>

      {/* Label */}
      <Html position={[0, isCentral ? -1.2 : -0.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-2 py-1 rounded bg-[#0c0e12]/80 border ${hovered ? 'border-orange-400 scale-110' : 'border-[#333a47]/40'} backdrop-blur-md text-[10px] font-bold tracking-wider text-slate-200 whitespace-nowrap transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function GraphConnections() {
  // Compute fixed positions for the demo layout
  const positions = useMemo(() => {
    const pos = [];
    // 0: Persona
    pos.push([3, 1, 0]);
    // 1: Graph
    pos.push([-3, -1, 1]);
    // 2: SOUL.md
    pos.push([2, 3, -1]);
    // 3: Skills Db
    pos.push([-2, 2, -2]);
    // 4: Hermes
    pos.push([0, 0, 0]); // Central item
    // 5: Command Bar
    pos.push([0, -3, 2]);

    return pos;
  }, []);

  return (
    <group>
      {/* Nodes */}
      {nodesData.map((node, i) => (
        <Node 
          key={node.id} 
          position={positions[i] as [number, number, number]} 
          color={node.color} 
          label={node.label}
          isCentral={i === 4}
        />
      ))}
      
      {/* Edges */}
      {linksData.map((link, i) => {
        const start = new THREE.Vector3(...positions[link.source]!);
        const end = new THREE.Vector3(...positions[link.target]!);
        
        // Connect them with a line
        const points = [start, end];
        
        return (
          <Line
            key={`link-${i}`}
            points={points}
            color="#f97316"
            lineWidth={1}
            transparent
            opacity={0.4}
          />
        );
      })}
    </group>
  );
}

export function KnowledgeGraph3D() {
  return (
    <div className="w-full h-full bg-transparent absolute inset-0 cursor-move">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        {/* Environment */}
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fb923c" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#64748b" />
        <fog attach="fog" args={['#0a0c0f', 5, 20]} />
        
        {/* Stars/Particles */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* The network */}
        <GraphConnections />
        
        {/* Interaction */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          autoRotate 
          autoRotateSpeed={0.5} 
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}
