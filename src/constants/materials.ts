import * as THREE from 'three';

export const RING_COLORS: Record<string, THREE.Color> = {
  seed: new THREE.Color('#FFD700'),
  connector: new THREE.Color('#C0C0C0'),
  new: new THREE.Color('#B87333'),
  bronze: new THREE.Color('#CD7F32'),
  steel: new THREE.Color('#71797E'),
};

export const HIGHLIGHT_COLOR = new THREE.Color('#4169E1');

export const MATERIAL_CONFIG = {
  metalness: 0.9,
  roughness: 0.2,
  envMapIntensity: 1.0,
};
