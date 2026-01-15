import { Canvas } from '@react-three/fiber';
import { Lighting } from './Lighting';
import { CameraControls } from './CameraControls';
import { RingGroup } from './RingGroup';
import type { ChainmailTutorial } from '@/types/tutorial';
import * as THREE from 'three';

interface ChainmailSceneProps {
  tutorial: ChainmailTutorial;
  visibleRingIds: string[];
  newRingIds: string[];
  highlightedRingIds: string[];
}

export function ChainmailScene({
  tutorial,
  visibleRingIds,
  newRingIds,
  highlightedRingIds,
}: ChainmailSceneProps) {
  const { defaultCamera, rings, scale } = tutorial;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: defaultCamera.position,
        fov: defaultCamera.fov,
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

      <Lighting />

      <CameraControls
        target={defaultCamera.target}
        initialPosition={defaultCamera.position}
      />

      <RingGroup
        allRings={rings}
        visibleRingIds={visibleRingIds}
        newRingIds={newRingIds}
        highlightedRingIds={highlightedRingIds}
        scale={scale}
      />

      {/* Ground plane for shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </Canvas>
  );
}
