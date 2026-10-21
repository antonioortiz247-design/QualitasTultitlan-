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
    const vehicleBounds = new THREE.Box3().setFromObject(clone);
    const vehicleSize = vehicleBounds.getSize(new THREE.Vector3());
    const vehicleCenterY = vehicleBounds.getCenter(new THREE.Vector3()).y;
    const splitHeight = vehicleBounds.min.y + vehicleSize.y * 0.43;
    // Center moves the GLB to the origin at render time; compensate for that shift in the shader.
    const centeredSplitHeight = splitHeight - vehicleCenterY;

    clone.traverse((object) => {
      const name = object.name.toLowerCase();
      if (/(logo|emblem|brand|badge|toyota|corolla)/i.test(name)) {
        object.visible = false;
        return;
      }
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const geometryBounds = new THREE.Box3().setFromObject(object);
      const geometrySize = geometryBounds.getSize(new THREE.Vector3());

      // Separate materials such as glass, rubber, wheels, lights and trim stay untouched.
      const updatedMaterials = materials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();
        const materialName = material.name.toLowerCase();
        if (/(logo|emblem|brand|badge|toyota|corolla)/i.test(materialName)) {
          object.visible = false;
          return material;
        }
        if (!(material instanceof THREE.MeshStandardMaterial)) return material;

        const partLabel = name + ' ' + materialName;
        const excluded = /(glass|window|windshield|windscreen|tire|tyre|wheel|rim|alloy|hubcap|spoke|rubber|brake|caliper|rotor|disc|light|lamp|lens|chrome|silver|metal|grille|interior|seat|plastic|black|mirror|trim|handle|dashboard|steering|logo|emblem|badge|exhaust)/i.test(partLabel);
        // Preserve the earlier body-paint selection; exclude only recognizable non-body details.
        if (excluded) return material;

        const c = material.color;
        const explicitPaint = /(paint|body|carrocer|exterior|shell|bonnet|hood|door|fender|bumper|quarter|trunk|boot|side|roof)/i.test(partLabel);
        const neutralPaint = c.r > 0.62 && c.g > 0.62 && c.b > 0.62 && material.roughness < 0.95;
        if (!explicitPaint && !neutralPaint) return material;

        // Shader-based world-height mask creates a truly straight split independent of mesh triangles.
        // Only neutral/body-paint materials reach this branch; glass, wheels, trim and lights are excluded above.
        const purple = new THREE.Color('#941B80');
        const aqua = new THREE.Color('#0096AE');
        const purpleRGB = `${purple.r.toFixed(6)}, ${purple.g.toFixed(6)}, ${purple.b.toFixed(6)}`;
        const aquaRGB = `${aqua.r.toFixed(6)}, ${aqua.g.toFixed(6)}, ${aqua.b.toFixed(6)}`;
        const split = centeredSplitHeight.toFixed(6);

        material.color.set('#ffffff');
        material.vertexColors = false;
        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vQualitasWorldPosition;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvQualitasWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');

          shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vQualitasWorldPosition;')
            .replace(
              '#include <color_fragment>',
              `#include <color_fragment>
               diffuseColor.rgb = (vQualitasWorldPosition.y >= ${split})
                 ? vec3(${purpleRGB})
                 : vec3(${aquaRGB});`
            );
        };
        material.customProgramCacheKey = () => 'qualitas-two-tone-horizontal-split-v1';
        material.needsUpdate = true;
        material.metalness = Math.max(material.metalness, 0.18);
        material.roughness = Math.min(material.roughness, 0.48);
        return material;
      });

      object.material = Array.isArray(object.material) ? updatedMaterials : updatedMaterials[0];
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

