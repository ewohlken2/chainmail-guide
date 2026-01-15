import { useRef, useState, useEffect, useMemo } from 'react';
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

// Animation constants
const OPEN_ARC = Math.PI * 1.75;  // ~315 degrees (visible gap)
const CLOSED_ARC = Math.PI * 2;   // Full circle
const ENTER_SPEED = 2;            // Speed multiplier for enter animation
const CLOSE_SPEED = 3;            // Speed multiplier for closing animation

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function Ring({ ring, isNew, isHighlighted, material, scale }: RingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.TorusGeometry | null>(null);

  // Animation state
  const [enterProgress, setEnterProgress] = useState(isNew ? 0 : 1);
  const [closeProgress, setCloseProgress] = useState(ring.startsOpen && isNew ? 0 : 1);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Determine if this ring should animate open->closed
  const shouldAnimateClose = ring.startsOpen ?? false;

  // Reset animation when ring becomes new
  useEffect(() => {
    if (isNew) {
      setEnterProgress(0);
      if (shouldAnimateClose) {
        setCloseProgress(0);
      }
    }
  }, [isNew, shouldAnimateClose]);

  // Calculate torus parameters
  const wireRadius = (ring.wireGauge / 2) * scale;
  const innerRadius = (ring.innerDiameter / 2) * scale;
  const outerRadius = (ring.outerDiameter / 2) * scale;
  const ringRadius = (innerRadius + outerRadius) / 2;

  // Calculate current arc based on close progress
  const currentArc = useMemo(() => {
    if (!shouldAnimateClose || closeProgress >= 1) {
      return CLOSED_ARC;
    }
    const easedClose = easeInOutQuad(closeProgress);
    return OPEN_ARC + (CLOSED_ARC - OPEN_ARC) * easedClose;
  }, [shouldAnimateClose, closeProgress]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Phase 1: Entrance animation (scale in)
    if (enterProgress < 1) {
      const newEnterProgress = Math.min(1, enterProgress + delta * ENTER_SPEED);
      setEnterProgress(newEnterProgress);

      const easedEnter = easeOutCubic(newEnterProgress);
      meshRef.current.scale.setScalar(easedEnter);
    }
    // Phase 2: Closing animation (after entrance is ~70% complete)
    else if (shouldAnimateClose && closeProgress < 1) {
      const newCloseProgress = Math.min(1, closeProgress + delta * CLOSE_SPEED);
      setCloseProgress(newCloseProgress);
    }

    // Highlight pulse effect (only when fully animated)
    if (isHighlighted && enterProgress >= 1 && closeProgress >= 1) {
      setPulsePhase(p => (p + delta * 3) % (Math.PI * 2));
      const pulseScale = 1 + Math.sin(pulsePhase) * 0.05;
      meshRef.current.scale.setScalar(pulseScale);
    }

    // Update geometry if arc is changing
    if (geometryRef.current && shouldAnimateClose && closeProgress < 1) {
      // Dispose old geometry and create new one with updated arc
      geometryRef.current.dispose();
      geometryRef.current = new THREE.TorusGeometry(ringRadius, wireRadius, 16, 48, currentArc);
      meshRef.current.geometry = geometryRef.current;
    }
  });

  // Create initial geometry
  useEffect(() => {
    if (meshRef.current) {
      const initialArc = shouldAnimateClose && isNew ? OPEN_ARC : CLOSED_ARC;
      geometryRef.current = new THREE.TorusGeometry(ringRadius, wireRadius, 16, 48, initialArc);
      meshRef.current.geometry = geometryRef.current;
    }

    return () => {
      geometryRef.current?.dispose();
    };
  }, [ringRadius, wireRadius, shouldAnimateClose, isNew]);

  // Update geometry when ring changes (but not during animation)
  useEffect(() => {
    if (meshRef.current && geometryRef.current && closeProgress >= 1) {
      geometryRef.current.dispose();
      geometryRef.current = new THREE.TorusGeometry(ringRadius, wireRadius, 16, 48, CLOSED_ARC);
      meshRef.current.geometry = geometryRef.current;
    }
  }, [ringRadius, wireRadius, closeProgress]);

  return (
    <mesh
      ref={meshRef}
      position={ring.position}
      rotation={ring.rotation}
      material={material}
      castShadow
      receiveShadow
      scale={enterProgress < 1 ? easeOutCubic(enterProgress) : 1}
    >
      <torusGeometry args={[ringRadius, wireRadius, 16, 48, currentArc]} />
    </mesh>
  );
}
