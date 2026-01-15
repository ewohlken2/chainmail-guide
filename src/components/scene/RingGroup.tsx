import { Ring } from './Ring';
import { useRingMaterials } from '@/hooks/useRingMaterials';
import type { RingGeometry } from '@/types/tutorial';

interface RingGroupProps {
  allRings: RingGeometry[];
  visibleRingIds: string[];
  newRingIds: string[];
  highlightedRingIds: string[];
  scale: number;
}

export function RingGroup({
  allRings,
  visibleRingIds,
  newRingIds,
  highlightedRingIds,
  scale,
}: RingGroupProps) {
  const { getMaterial } = useRingMaterials();

  const visibleRings = allRings.filter(ring => visibleRingIds.includes(ring.id));

  return (
    <group>
      {visibleRings.map(ring => {
        const isNew = newRingIds.includes(ring.id);
        const isHighlighted = highlightedRingIds.includes(ring.id);
        const material = getMaterial(ring.colorRole, isHighlighted, isNew);

        return (
          <Ring
            key={ring.id}
            ring={ring}
            isNew={isNew}
            isHighlighted={isHighlighted}
            material={material}
            scale={scale}
          />
        );
      })}
    </group>
  );
}
