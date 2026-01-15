export const DEFAULT_CAMERA = {
  position: [0, 5, 10] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000,
};

export const ORBIT_CONTROLS_CONFIG = {
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 2,
  maxDistance: 50,
  minPolarAngle: 0.1,
  maxPolarAngle: Math.PI * 0.9,
  enablePan: true,
  panSpeed: 0.5,
  rotateSpeed: 0.5,
  zoomSpeed: 0.5,
};
