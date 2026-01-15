import { useRef, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { RingGeometry } from '@/types/tutorial';
import { RING_COLORS, HIGHLIGHT_COLOR, MATERIAL_CONFIG } from '@/constants/materials';

interface EditableRingProps {
  ring: RingGeometry;
  isSelected: boolean;
  onSelect: (id: string) => void;
  scale?: number;
}

export function EditableRing({ ring, isSelected, onSelect, scale = 1 }: EditableRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate torus parameters
  const wireRadius = (ring.wireGauge / 2) * scale;
  const innerRadius = (ring.innerDiameter / 2) * scale;
  const outerRadius = (ring.outerDiameter / 2) * scale;
  const ringRadius = (innerRadius + outerRadius) / 2;

  // Create material based on selection state
  const material = useMemo(() => {
    const baseColor = RING_COLORS[ring.colorRole] ?? RING_COLORS.connector;

    const mat = new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: MATERIAL_CONFIG.metalness,
      roughness: MATERIAL_CONFIG.roughness,
      envMapIntensity: MATERIAL_CONFIG.envMapIntensity,
      side: THREE.DoubleSide,
    });

    if (isSelected) {
      mat.emissive = HIGHLIGHT_COLOR;
      mat.emissiveIntensity = 0.4;
    }

    return mat;
  }, [ring.colorRole, isSelected]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(ring.id);
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={ring.position}
        rotation={ring.rotation}
        material={material}
        castShadow
        receiveShadow
        onClick={handleClick}
        name={ring.id}
      >
        <torusGeometry args={[ringRadius, wireRadius, 16, 48]} />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh
          position={ring.position}
          rotation={ring.rotation}
        >
          <torusGeometry args={[ringRadius, wireRadius * 1.3, 16, 48]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Export ref accessor for TransformControls
export function getEditableRingRef() {
  return useRef<THREE.Group>(null);
}
