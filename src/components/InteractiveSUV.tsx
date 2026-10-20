'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, ContactShadows, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { CarFront, HeartPulse, KeyRound, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as THREE from 'three';

const MODEL_URL = 'https://www.innerscene.com/api/library/suv-dc972cab/download';

type Hotspot = {
  id: string;
  label: string;
  Icon: LucideIcon;
  position: [number, number, number];
};

const hotspots: Hotspot[] = [
  { id: 'materiales', label: 'Daños materiales', Icon: CarFront, position: [-1.5, 0.65, 1.35] },
  { id: 'robo', label: 'Robo total', Icon: KeyRound, position: [1.2, 0.8, -1.3] },
  { id: 'responsabilidad', label: 'Responsabilidad civil', Icon: ShieldCheck, position: [0, 1.65, 0.15] },
  { id: 'medicos', label: 'Gastos médicos', Icon: HeartPulse, position: [1.25, 0.45, 1.1] },
  { id: 'asistencia', label: 'Asistencia vial', Icon: Wrench, position: [-1.25, 0.5, -1.1] },
];

function SUVModel({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    });
    return clone;
  }, [scene]);

  return (
    <>
      <Center>
        <primitive object={model} scale={0.92} />
      </Center>
      {hotspots.map(({ id, label, Icon, position }) => (
        <Html key={id} position={position} center distanceFactor={7} style={{ pointerEvents: 'auto' }}>
          <button
            type="button"
            aria-label={label}
            aria-pressed={active === id}
            title={label}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(id);
            }}
            className={'motion-3d-hotspot ' + (active === id ? 'is-active' : '')}
          >
            <Icon size={17} aria-hidden="true" />
          </button>
        </Html>
      ))}
    </>
  );
}

function LoadingVehicle() {
  return (
    <mesh position={[0, 0.7, 0]}>
      <boxGeometry args={[1.7, 0.8, 3.2]} />
      <meshStandardMaterial color="#e5e7eb" metalness={0.55} roughness={0.25} />
    </mesh>
  );
}

export function InteractiveSUV({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="motion-3d-viewer relative z-[1] mt-3 min-h-[300px] w-full sm:min-h-[390px]" aria-label="SUV 3D interactiva; arrastra para girar el vehículo">
      <Canvas
        camera={{ position: [6.4, 3.4, 6.8], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#17121c', 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={1.5} />
        <hemisphereLight args={['#ffffff', '#5a6172', 1.4]} />
        <directionalLight position={[5, 8, 5]} intensity={3.1} castShadow />
        <directionalLight position={[-5, 4, -4]} intensity={2.2} color="#53c5d1" />
        <pointLight position={[0, 2, 4]} intensity={20} distance={10} color="#941B80" />
        <Suspense fallback={<LoadingVehicle />}>
          <SUVModel active={active} onSelect={onSelect} />
          <ContactShadows position={[0, -0.12, 0]} opacity={0.38} scale={8} blur={2.5} far={4} />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.6}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate
          autoRotateSpeed={0.55}
          enableDamping
          dampingFactor={0.075}
          rotateSpeed={0.7}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white/65 backdrop-blur-sm">
        Arrastra para girar · toca los puntos para explorar
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
