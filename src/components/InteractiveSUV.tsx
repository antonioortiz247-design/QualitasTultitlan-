'use client';

import { Component, Suspense, useMemo, type ErrorInfo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { CarFront, HeartPulse, KeyRound, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as THREE from 'three';

// Usa el modelo Toyota Prius subido al propio repositorio para evitar depender de un host externo.
const MODEL_URL = '/models/qualitas-prius.glb';


class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('No se pudo cargar el modelo 3D del SUV:', error, info.componentStack);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type Hotspot = {
  id: string;
  label: string;
  Icon: LucideIcon;
  position: [number, number, number];
};

const hotspots: Hotspot[] = [
  { id: 'materiales', label: 'Daños materiales', Icon: CarFront, position: [-0.9, 0.28, 0.65] },
  { id: 'robo', label: 'Robo total', Icon: KeyRound, position: [0.82, 0.48, -0.62] },
  { id: 'responsabilidad', label: 'Responsabilidad civil', Icon: ShieldCheck, position: [0, 0.82, 0.05] },
  { id: 'medicos', label: 'Gastos médicos', Icon: HeartPulse, position: [0.78, 0.24, 0.58] },
  { id: 'asistencia', label: 'Asistencia vial', Icon: Wrench, position: [-0.72, 0.24, -0.58] },
];

function SUVModel({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    clone.traverse((object) => {
      const name = object.name.toLowerCase();
      // Hide separately named manufacturer marks where the GLB exposes them as objects.
      if (/(logo|emblem|brand|badge|toyota|corolla)/i.test(name)) {
        object.visible = false;
        return;
      }

      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      const bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const materials = Array.isArray(object.material) ? object.material : [object.material];

      const nextMaterials = materials.map((original) => {
        const material = original.clone();
        const materialName = material.name.toLowerCase();
        if (/(logo|emblem|brand|badge|toyota|corolla)/i.test(materialName)) {
          object.visible = false;
          return material;
        }

        if (!(material instanceof THREE.MeshStandardMaterial) || !material.color) return material;

        const c = material.color;
        const likelyPaint = /(paint|body|carrocer|exterior|shell|bonnet|hood|door|fender|bumper|quarter|trunk|boot|side)/i.test(name + ' ' + materialName) ||
          (c.r > 0.62 && c.g > 0.62 && c.b > 0.62 && material.roughness < 0.9);
        const excluded = /(glass|window|windshield|tire|tyre|wheel|rim|rubber|light|lamp|lens|chrome|grille|interior|seat|plastic|black)/i.test(name + ' ' + materialName);
        if (!likelyPaint || excluded) return material;

        // Two-tone Quálitas-inspired wrap: purple on hood/roof/doors and aqua on bumpers/lower body.
        const purplePart = /(hood|bonnet|roof|door|side|quarter|trunk|boot|decklid|body.?upper)/i.test(name + ' ' + materialName);
        const aquaPart = /(bumper|lower|skirt|sill|fender|front.?fascia|rear.?fascia)/i.test(name + ' ' + materialName);
        let paint = purplePart ? '#941B80' : aquaPart ? '#0096AE' : '';

        // If the GLB uses generic mesh names, use its part proportions as a fallback.
        if (!paint) {
          const partLabel = (name + ' ' + materialName);
          if (/(body|carrocer|exterior|shell|paint)/i.test(partLabel)) {
            paint = center.y > bounds.min.y + size.y * 0.58 ? '#941B80' : '#0096AE';
          } else if (c.r > 0.62 && c.g > 0.62 && c.b > 0.62) {
            paint = center.y > bounds.min.y + size.y * 0.58 ? '#941B80' : '#0096AE';
          }
        }

        if (paint) {
          material.color.set(paint);
          material.metalness = Math.max(material.metalness, 0.22);
          material.roughness = Math.min(material.roughness, 0.4);
        }
        return material;
      });

      object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
    });
    return clone;
  }, [scene]);

  return (
    <Bounds fit clip observe margin={1.25}>
      <Center>
        <primitive object={model} />
      </Center>
      {hotspots.map(({ id, label, Icon, position }) => (
        <Html key={id} position={position} center distanceFactor={3} style={{ pointerEvents: 'auto', transform: 'translate3d(0,0,0)' }}>
          <button
            type="button"
            aria-label={label}
            aria-pressed={active === id}
            title={label}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(id);
            }}
            className={'motion-3d-hotspot !h-6 !w-6 !min-h-0 !min-w-0 !max-h-6 !max-w-6 !p-0 !rounded-full flex items-center justify-center shadow-lg ' + (active === id ? 'is-active' : '')}
          >
            <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </Html>
      ))}
    </Bounds>
  );
}

function LoadingVehicle() {
  return (
    <Html center>
      <div className="whitespace-nowrap rounded-xl border border-white/10 bg-[#17121c]/90 px-4 py-3 text-sm font-medium text-white shadow-xl">
        Cargando Toyota Prius 3D…
      </div>
    </Html>
  );
}

function ModelLoadError() {
  return (
    <Html center>
      <div className="max-w-xs rounded-xl border border-white/10 bg-[#17121c]/95 px-4 py-3 text-center text-sm text-white shadow-xl">
        No se pudo cargar el Toyota Prius. Revisa que el archivo <code>/models/qualitas-prius.glb</code> esté disponible.
      </div>
    </Html>
  );
}

export function InteractiveSUV({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="motion-3d-viewer relative z-[1] mt-3 h-[430px] w-full sm:h-[520px] lg:h-[560px]" aria-label="SUV 3D interactiva; arrastra para girar el vehículo">
      <Canvas
        camera={{ position: [4.5, 2.65, 4.9], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#17121c', 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={1.4} />
        <hemisphereLight args={['#ffffff', '#5a6172', 1.2]} />
        <directionalLight position={[5, 8, 5]} intensity={3.2} />
        <directionalLight position={[-5, 4, -4]} intensity={2.1} color="#53c5d1" />
        <pointLight position={[0, 2, 4]} intensity={12} distance={10} color="#941B80" />
        <Suspense fallback={<LoadingVehicle />}>
          <ModelErrorBoundary fallback={<ModelLoadError />}>
            <SUVModel active={active} onSelect={onSelect} />
          </ModelErrorBoundary>
          <ContactShadows position={[0, -0.08, 0]} opacity={0.42} scale={8} blur={2.5} far={4} />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.6}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate
          autoRotateSpeed={0.42}
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

