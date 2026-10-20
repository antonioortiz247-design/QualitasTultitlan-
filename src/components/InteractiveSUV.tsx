'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { CarFront, HeartPulse, KeyRound, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type Hotspot = {
  id: string;
  label: string;
  Icon: LucideIcon;
  position: [number, number, number];
};

const hotspots: Hotspot[] = [
  { id: 'materiales', label: 'Daños materiales', Icon: CarFront, position: [-1.25, 0.75, 1.12] },
  { id: 'robo', label: 'Robo total', Icon: KeyRound, position: [1.25, 0.85, -1.05] },
  { id: 'responsabilidad', label: 'Responsabilidad civil', Icon: ShieldCheck, position: [0, 1.62, 0.15] },
  { id: 'medicos', label: 'Gastos médicos', Icon: HeartPulse, position: [1.15, 0.48, 1.05] },
  { id: 'asistencia', label: 'Asistencia vial', Icon: Wrench, position: [-1.15, 0.48, -1.05] },
];

function Wheel({ position }: { position: [number, number, number] }) {
  const rubber = useMemo(() => new THREE.MeshStandardMaterial({ color: '#17191e', roughness: 0.86 }), []);
  const alloy = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9c4ce', metalness: 0.86, roughness: 0.22 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4d5964', metalness: 0.7, roughness: 0.3 }), []);
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow material={rubber}><cylinderGeometry args={[0.37, 0.37, 0.22, 32]} /></mesh>
      <mesh position={[0, 0.118, 0]} material={alloy}><cylinderGeometry args={[0.245, 0.245, 0.018, 12]} /></mesh>
      <mesh position={[0, 0.13, 0]} material={dark}><cylinderGeometry args={[0.105, 0.105, 0.022, 12]} /></mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 5) * 0.16, 0.132, Math.sin(i * Math.PI * 2 / 5) * 0.16]} material={dark}>
          <boxGeometry args={[0.035, 0.025, 0.13]} />
        </mesh>
      ))}
    </group>
  );
}

function SUVBody() {
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f4f6f8', metalness: 0.62, roughness: 0.23, clearcoat: 0.95, clearcoatRoughness: 0.18 }), []);
  const lower = useMemo(() => new THREE.MeshStandardMaterial({ color: '#333b45', metalness: 0.38, roughness: 0.46 }), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#1c303d', metalness: 0.45, roughness: 0.16, transparent: true, opacity: 0.94, clearcoat: 0.9 }), []);
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: '#aebbc5', metalness: 0.92, roughness: 0.18 }), []);
  const aqua = useMemo(() => new THREE.MeshStandardMaterial({ color: '#53c5d1', emissive: '#0096ae', emissiveIntensity: 0.35, metalness: 0.35, roughness: 0.22 }), []);
  const lamp = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#bdefff', emissiveIntensity: 2.2 }), []);
  const rearLamp = useMemo(() => new THREE.MeshStandardMaterial({ color: '#941b80', emissive: '#941b80', emissiveIntensity: 1.2 }), []);

  return (
    <group>
      {/* Lower chassis and sculpted body */}
      <mesh position={[0, 0.67, 0]} castShadow receiveShadow material={paint} scale={[1, 0.75, 1]}>
        <primitive object={new RoundedBoxGeometry(2.15, 0.88, 4.15, 5, 0.18)} attach="geometry" />
      </mesh>
      <mesh position={[0, 0.44, -0.04]} castShadow material={lower}><boxGeometry args={[2.08, 0.28, 3.8]} /></mesh>
      <mesh position={[0, 1.13, -0.15]} castShadow material={paint} scale={[0.92, 0.88, 0.9]}>
        <primitive object={new RoundedBoxGeometry(1.72, 0.9, 2.25, 5, 0.16)} attach="geometry" />
      </mesh>
      {/* Windshield and rear glass */}
      <mesh position={[0, 1.43, 0.83]} rotation={[-0.38, 0, 0]} material={glass}><boxGeometry args={[1.52, 0.055, 0.82]} /></mesh>
      <mesh position={[0, 1.42, -1.18]} rotation={[0.42, 0, 0]} material={glass}><boxGeometry args={[1.48, 0.055, 0.72]} /></mesh>
      {/* Side windows */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.875, 1.4, -0.12]}>
          <mesh rotation={[0, side * 0.08, 0]} material={glass}><boxGeometry args={[0.035, 0.48, 1.72]} /></mesh>
          <mesh position={[side * 0.015, -0.27, 0]} material={chrome}><boxGeometry args={[0.045, 0.035, 1.82]} /></mesh>
          <mesh position={[side * 0.02, -0.02, -0.12]} material={chrome}><boxGeometry args={[0.05, 0.42, 0.025]} /></mesh>
        </group>
      ))}
      {/* Roof rails */}
      {[-0.66, 0.66].map((x) => <mesh key={x} position={[x, 1.91, -0.08]} material={chrome}><boxGeometry args={[0.045, 0.055, 1.7]} /></mesh>)}
      {/* Bumpers, grille, headlights and tail lamps */}
      <mesh position={[0, 0.58, 2.09]} material={lower}><boxGeometry args={[1.78, 0.25, 0.15]} /></mesh>
      <mesh position={[0, 0.77, 2.17]} material={chrome}><boxGeometry args={[0.78, 0.22, 0.035]} /></mesh>
      <mesh position={[0, 0.77, 2.195]} material={lower}><boxGeometry args={[0.58, 0.13, 0.025]} /></mesh>
      {[-0.72, 0.72].map((x) => <mesh key={x} position={[x, 0.94, 2.1]} material={lamp}><boxGeometry args={[0.36, 0.095, 0.055]} /></mesh>)}
      {[-0.74, 0.74].map((x) => <mesh key={x} position={[x, 0.89, -2.08]} material={rearLamp}><boxGeometry args={[0.31, 0.12, 0.07]} /></mesh>)}
      <mesh position={[0, 0.55, -2.08]} material={lower}><boxGeometry args={[1.82, 0.24, 0.15]} /></mesh>
      {/* Door lines, handles, mirrors */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.085, 0.83, -0.1]} material={chrome}><boxGeometry args={[0.025, 0.02, 0.52]} /></mesh>
          <mesh position={[side * 1.05, 1.13, 0.78]} rotation={[0, side * 0.16, 0]} material={paint}><boxGeometry args={[0.2, 0.12, 0.24]} /></mesh>
          <mesh position={[side * 1.14, 1.13, 0.79]} material={glass}><boxGeometry args={[0.045, 0.075, 0.16]} /></mesh>
          <mesh position={[side * 1.05, 0.49, 0.1]} material={chrome}><boxGeometry args={[0.04, 0.025, 2.05]} /></mesh>
        </group>
      ))}
      <Wheel position={[-1.02, 0.39, 1.3]} />
      <Wheel position={[1.02, 0.39, 1.3]} />
      <Wheel position={[-1.02, 0.39, -1.35]} />
      <Wheel position={[1.02, 0.39, -1.35]} />
      <mesh position={[0, 0.24, 0]} material={aqua}><boxGeometry args={[1.4, 0.035, 2.6]} /></mesh>
    </group>
  );
}

export function InteractiveSUV({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="motion-3d-viewer relative z-[1] mt-3 h-[430px] w-full sm:h-[520px] lg:h-[560px]" aria-label="SUV 3D interactiva; arrastra para girar el vehículo">
      <Canvas
        camera={{ position: [4.5, 2.65, 4.9], fov: 39 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#17121c', 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={1.2} />
        <hemisphereLight args={['#ffffff', '#5a6172', 1.2]} />
        <directionalLight position={[5, 8, 5]} intensity={3.1} />
        <directionalLight position={[-5, 4, -4]} intensity={2.2} color="#53c5d1" />
        <pointLight position={[0, 2, 4]} intensity={12} distance={10} color="#941B80" />
        <group position={[0, -0.15, 0]} scale={1.22}>
          <SUVBody />
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
        </group>
        <ContactShadows position={[0, -0.08, 0]} opacity={0.42} scale={8} blur={2.5} far={4} />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.4}
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
