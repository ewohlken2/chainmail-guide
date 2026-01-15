import { useMemo } from 'react';
import * as THREE from 'three';
import { RING_COLORS, HIGHLIGHT_COLOR, MATERIAL_CONFIG } from '@/constants/materials';

interface MaterialCache {
  [key: string]: THREE.MeshStandardMaterial;
}

export function useRingMaterials() {
  const materials = useMemo(() => {
    const cache: MaterialCache = {};

    function getMaterial(colorRole: string, isHighlighted: boolean, isNew: boolean): THREE.MeshStandardMaterial {
      const cacheKey = `${colorRole}-${isHighlighted}-${isNew}`;

      if (cache[cacheKey]) {
        return cache[cacheKey];
      }

      const baseColor = RING_COLORS[colorRole] ?? RING_COLORS.connector;
      const color = isNew ? RING_COLORS.new : baseColor;

      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: MATERIAL_CONFIG.metalness,
        roughness: MATERIAL_CONFIG.roughness,
        envMapIntensity: MATERIAL_CONFIG.envMapIntensity,
        side: THREE.DoubleSide,
      });

      if (isHighlighted) {
        material.emissive = HIGHLIGHT_COLOR;
        material.emissiveIntensity = 0.3;
      }

      cache[cacheKey] = material;
      return material;
    }

    return { getMaterial, cache };
  }, []);

  return materials;
}
