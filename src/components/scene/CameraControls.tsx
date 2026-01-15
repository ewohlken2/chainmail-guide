import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ORBIT_CONTROLS_CONFIG } from '@/constants/camera';

interface CameraControlsProps {
  target?: [number, number, number];
  initialPosition?: [number, number, number];
}

export function CameraControls({ target, initialPosition }: CameraControlsProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (initialPosition) {
      camera.position.set(...initialPosition);
    }
  }, [camera, initialPosition]);

  useEffect(() => {
    if (controlsRef.current && target) {
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
    }
  }, [target]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={ORBIT_CONTROLS_CONFIG.enableDamping}
      dampingFactor={ORBIT_CONTROLS_CONFIG.dampingFactor}
      minDistance={ORBIT_CONTROLS_CONFIG.minDistance}
      maxDistance={ORBIT_CONTROLS_CONFIG.maxDistance}
      minPolarAngle={ORBIT_CONTROLS_CONFIG.minPolarAngle}
      maxPolarAngle={ORBIT_CONTROLS_CONFIG.maxPolarAngle}
      enablePan={ORBIT_CONTROLS_CONFIG.enablePan}
      panSpeed={ORBIT_CONTROLS_CONFIG.panSpeed}
      rotateSpeed={ORBIT_CONTROLS_CONFIG.rotateSpeed}
      zoomSpeed={ORBIT_CONTROLS_CONFIG.zoomSpeed}
    />
  );
}
