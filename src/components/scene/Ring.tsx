import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RingGeometry } from '@/types/tutorial';

interface RingProps {
  ring: RingGeometry;
  isNew: boolean;
  isHighlighted: boolean;
  material: THREE.MeshStandardMaterial;
  scale: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function Ring({ ring, isNew, isHighlighted, material, scale }: RingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [animationProgress, setAnimationProgress] = useState(isNew ? 0 : 1);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Reset animation when ring becomes new
  useEffect(() => {
    if (isNew) {
      setAnimationProgress(0);
    }
  }, [isNew]);

  // Calculate torus parameters
  const wireRadius = (ring.wireGauge / 2) * scale;
  const innerRadius = (ring.innerDiameter / 2) * scale;
  const outerRadius = (ring.outerDiameter / 2) * scale;
  const ringRadius = (innerRadius + outerRadius) / 2;

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Entrance animation
    if (animationProgress < 1) {
      const newProgress = Math.min(1, animationProgress + delta * 2);
      setAnimationProgress(newProgress);

      const easedProgress = easeOutCubic(newProgress);
      meshRef.current.scale.setScalar(easedProgress);
    }

    // Highlight pulse effect
    if (isHighlighted) {
      setPulsePhase(p => (p + delta * 3) % (Math.PI * 2));
      const pulseScale = 1 + Math.sin(pulsePhase) * 0.05;
      meshRef.current.scale.setScalar(pulseScale);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={ring.position}
      rotation={ring.rotation}
      material={material}
      castShadow
      receiveShadow
      scale={animationProgress < 1 ? easeOutCubic(animationProgress) : 1}
    >
      <torusGeometry args={[ringRadius, wireRadius, 16, 48]} />
    </mesh>
  );
}
