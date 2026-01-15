import { Environment } from '@react-three/drei';

export function Lighting() {
  return (
    <>
      {/* Key light - main illumination */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light - soften shadows */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.5}
      />

      {/* Rim light - edge definition */}
      <spotLight
        position={[0, 10, -10]}
        intensity={0.8}
        angle={Math.PI / 6}
        penumbra={0.5}
      />

      {/* Ambient light - base illumination */}
      <ambientLight intensity={0.2} />

      {/* Environment map for PBR reflections */}
      <Environment preset="studio" />
    </>
  );
}
