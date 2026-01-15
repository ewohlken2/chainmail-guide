import { useRef, useEffect, useState, MutableRefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { TransformControls, OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { EditableRing } from './EditableRing';
import { Lighting } from './Lighting';
import type { RingGeometry } from '@/types/tutorial';
import type { TransformMode } from '@/hooks/useEditorState';

interface EditorSceneProps {
  rings: RingGeometry[];
  selectedRingId: string | null;
  transformMode: TransformMode;
  onSelectRing: (id: string | null) => void;
  onTransformChange: (id: string, position: [number, number, number], rotation: [number, number, number]) => void;
}

// Inner component that has access to Three.js context
function EditorContent({
  rings,
  selectedRingId,
  transformMode,
  onSelectRing,
  onTransformChange,
}: EditorSceneProps) {
  const selectedMeshRef = useRef<THREE.Mesh | null>(null) as MutableRefObject<THREE.Mesh | null>;
  const [isDragging, setIsDragging] = useState(false);
  const [, forceUpdate] = useState(0);
  const { scene } = useThree();

  // Find the selected ring mesh in the scene
  useEffect(() => {
    if (selectedRingId) {
      const mesh = scene.getObjectByName(selectedRingId) as THREE.Mesh | undefined;
      selectedMeshRef.current = mesh ?? null;
    } else {
      selectedMeshRef.current = null;
    }
    forceUpdate(n => n + 1);
  }, [selectedRingId, scene, rings]);

  // Handle transform changes
  const handleTransformChange = () => {
    if (selectedMeshRef.current && selectedRingId) {
      const position = selectedMeshRef.current.position.toArray() as [number, number, number];
      const rotation = selectedMeshRef.current.rotation.toArray().slice(0, 3) as [number, number, number];
      onTransformChange(selectedRingId, position, rotation);
    }
  };

  // Click on empty space to deselect
  const handlePointerMissed = () => {
    if (!isDragging) {
      onSelectRing(null);
    }
  };

  return (
    <>
      <Lighting />

      {/* Grid for reference */}
      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#3a3a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a5a8a"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        position={[0, -0.5, 0]}
      />

      {/* Camera controls */}
      <OrbitControls
        enabled={!isDragging}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />

      {/* Transform controls for selected ring */}
      {selectedMeshRef.current && selectedRingId && (
        <TransformControls
          object={selectedMeshRef.current}
          mode={transformMode}
          size={0.7}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => {
            setIsDragging(false);
            handleTransformChange();
          }}
          onChange={handleTransformChange}
        />
      )}

      {/* Render all rings */}
      <group onPointerMissed={handlePointerMissed}>
        {rings.map(ring => (
          <EditableRing
            key={ring.id}
            ring={ring}
            isSelected={ring.id === selectedRingId}
            onSelect={onSelectRing}
          />
        ))}
      </group>

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
}

export function EditorScene(props: EditorSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [3, 3, 5],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
    >
      <color attach="background" args={['#1a1a2e']} />
      <EditorContent {...props} />
    </Canvas>
  );
}
