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
    // Compensa el centrado que aplica <Center> al modelo en el Canvas.
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

      // El GLB tiene una sola malla/material. Creamos una máscara por vértice
      // usando los ejes locales reales: X=ancho, Y=largo, Z=alto (alto = -Z en mundo).
      const geometry = object.geometry.toNonIndexed();
      object.geometry = geometry;
      const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
      const normals = geometry.getAttribute('normal') as THREE.BufferAttribute;
      const bodyMask = new Float32Array(positions.count);

      const smoothRange = (value: number, low: number, high: number, feather: number) => {
        const lower = THREE.MathUtils.smoothstep(value, low - feather, low + feather);
        const upper = 1 - THREE.MathUtils.smoothstep(value, high - feather, high + feather);
        return lower * upper;
      };

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i); // ancho
        const y = positions.getY(i); // altura: glTF usa Y-up
        const z = positions.getZ(i); // largo: frente positivo, parte trasera negativo

        // Paneles laterales y salpicaderas. La banda vertical evita teñir techo,
        // cristales y componentes del interior que comparten el material del GLB.
        const sideBody =
          Math.abs(x) > 0.135 &&
          smoothRange(y, 0.055, 0.275, 0.025) > 0.25 &&
          Math.abs(z) < 0.555;

        // Superficies horizontales: techo, cofre y portón trasero.
        // La textura de los cristales permanece protegida por su luminosidad.
        const roof =
          y > 0.285 &&
          Math.abs(x) < 0.255 &&
          z > -0.36 && z < 0.30;
        const hood =
          y > 0.115 &&
          Math.abs(x) < 0.255 &&
          z > 0.28 && z < 0.555;
        const rearHatch =
          y > 0.12 &&
          Math.abs(x) < 0.245 &&
          z < -0.43 && z > -0.595;

        // Parachoques de los extremos, manteniendo fuera las áreas de faros
        // delanteros y calaveras traseras para conservar sus colores originales.
        const frontBumper =
          z > 0.505 && y > 0.015 && y < 0.135 && Math.abs(x) < 0.255;
        const rearBumper =
          z < -0.555 && y > 0.015 && y < 0.13 && Math.abs(x) < 0.25;
        const lampZone =
          Math.abs(x) > 0.105 &&
          y > 0.075 && y < 0.235 &&
          (z > 0.425 || z < -0.475);

        // Protección circular de los cuatro pasos de rueda (coordenadas X/Y,
        // centrados en cada extremo del eje longitudinal Z).
        const wheelZone =
          Math.abs(x) > 0.15 &&
          [ -0.385, 0.345 ].some((wheelZ) =>
            ((z - wheelZ) / 0.105) ** 2 + ((y - 0.105) / 0.09) ** 2 < 1.2
          );

        const candidate = sideBody || roof || hood || rearHatch || frontBumper || rearBumper;
        bodyMask[i] = candidate && !wheelZone && !lampZone ? 1 : 0;
      }
      geometry.setAttribute('qualitasBodyMask', new THREE.BufferAttribute(bodyMask, 1));

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const updatedMaterials = materials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();
        const materialName = material.name.toLowerCase();
        if (/(logo|emblem|brand|badge|toyota|corolla)/i.test(materialName)) {
          object.visible = false;
          return material;
        }
        if (!(material instanceof THREE.MeshStandardMaterial)) return material;

        const purple = new THREE.Color('#941B80');
        const aqua = new THREE.Color('#0096AE');
        const purpleRGB = `${purple.r.toFixed(6)}, ${purple.g.toFixed(6)}, ${purple.b.toFixed(6)}`;
        const aquaRGB = `${aqua.r.toFixed(6)}, ${aqua.g.toFixed(6)}, ${aqua.b.toFixed(6)}`;
        const split = centeredSplitHeight.toFixed(6);

        // El mapa original sigue activo. Solo se reemplaza el color de las caras
        // marcadas como carrocería; los píxeles oscuros de cristales y detalles
        // conservan su textura original.
        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader
            .replace(
              '#include <common>',
              '#include <common>\nattribute float qualitasBodyMask;\nvarying float vQualitasBodyMask;\nvarying vec3 vQualitasWorldPosition;'
            )
            .replace(
              '#include <begin_vertex>',
              '#include <begin_vertex>\nvQualitasBodyMask = qualitasBodyMask;\nvQualitasWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;'
            );

          shader.fragmentShader = shader.fragmentShader
            .replace(
              '#include <common>',
              '#include <common>\nvarying float vQualitasBodyMask;\nvarying vec3 vQualitasWorldPosition;'
            )
            .replace(
              '#include <color_fragment>',
              `#include <color_fragment>
               float qualitasTextureBrightness = (diffuseColor.r + diffuseColor.g + diffuseColor.b) / 3.0;
               float qualitasPaintMask = smoothstep(0.25, 0.8, vQualitasBodyMask) *
                 smoothstep(0.24, 0.42, qualitasTextureBrightness);
               vec3 qualitasBrandPaint = (vQualitasWorldPosition.y >= ${split})
                 ? vec3(${purpleRGB})
                 : vec3(${aquaRGB});
               diffuseColor.rgb = mix(diffuseColor.rgb, qualitasBrandPaint, qualitasPaintMask);`
            );
        };
        material.customProgramCacheKey = () => 'qualitas-selective-body-segmentation-v5';
        material.needsUpdate = true;
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

