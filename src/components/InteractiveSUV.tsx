'use client';

import { Component, Suspense, useMemo, type ErrorInfo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, Html, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { CarFront, HeartPulse, KeyRound, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

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
  const qualitasLogo = useTexture('/qualitas-logo-blanco.png');
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

      // Segmenta en coordenadas mundiales reales después de aplicar las
      // transformaciones del GLB. Las versiones anteriores usaban ejes locales
      // y por eso dejaban manchas blancas en cofre, fascia y portón trasero.
      const geometry = object.geometry.toNonIndexed();
      object.geometry = geometry;
      const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
      const bodyMask = new Float32Array(positions.count);
      const bounds = vehicleBounds;
      const width = Math.max(vehicleSize.x, 0.001);
      const length = Math.max(vehicleSize.z, 0.001);
      const height = Math.max(vehicleSize.y, 0.001);
      const toWorld = new THREE.Vector3();
      const centerX = (bounds.min.x + bounds.max.x) / 2;

      // Paint all neutral surfaces instead of guessing panel shapes by dimensions.
      // Keep the wheel and lamp regions out of the paint mask.
      for (let i = 0; i < positions.count; i += 3) {
        const world = new THREE.Vector3();
        for (let j = 0; j < 3; j++) {
          toWorld.set(positions.getX(i + j), positions.getY(i + j), positions.getZ(i + j));
          object.localToWorld(toWorld);
          world.add(toWorld);
        }
        world.multiplyScalar(1 / 3);
        const xN = Math.abs(world.x - centerX) / (width * 0.5);
        const hN = (world.y - bounds.min.y) / height;
        const zN = (world.z - bounds.min.z) / length;
        const atFrontOrRear = zN < 0.13 || zN > 0.87;

        // Exclusiones compactas para no dejar sin pintar alas ni fascias.
        const wheelZ = Math.abs(zN - 0.22) < 0.055 || Math.abs(zN - 0.78) < 0.055;
        const wheelZone = xN > 0.91 && wheelZ && hN < 0.27;

        // Protección mínima de los extremos ópticos: las máscaras anteriores
        // cubrían también fascia, salpicadera y portón, dejando parches blancos.
        const lampZone = atFrontOrRear && xN > 0.91 && hN > 0.37 && hN < 0.43;
        const selected = !(wheelZone || lampZone);
        bodyMask[i] = selected ? 1 : 0;
        bodyMask[i + 1] = selected ? 1 : 0;
        bodyMask[i + 2] = selected ? 1 : 0;
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
               float qualitasMaxChannel = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
               float qualitasMinChannel = min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
               float qualitasNeutralPaint = 1.0 - smoothstep(0.08, 0.24, qualitasMaxChannel - qualitasMinChannel);
               float qualitasPaintMask = smoothstep(0.25, 0.8, vQualitasBodyMask) *
                 smoothstep(0.30, 0.55, qualitasTextureBrightness) * qualitasNeutralPaint;
               vec3 qualitasBrandPaint = (vQualitasWorldPosition.y >= ${split})
                 ? vec3(${purpleRGB})
                 : vec3(${aquaRGB});
               diffuseColor.rgb = mix(diffuseColor.rgb, qualitasBrandPaint, qualitasPaintMask);`
            );
        };
        material.customProgramCacheKey = () => 'qualitas-neutral-texture-paint-v8';
        material.needsUpdate = true;
        return material;
      });

      object.material = Array.isArray(object.material) ? updatedMaterials : updatedMaterials[0];
    });

    // Logotipo Quálitas como calcomanía 3D sobre el cofre, independiente de
    // la máscara de pintura para que no altere faros, parrilla ni carrocería.
    const logoMap = qualitasLogo.clone();
    logoMap.colorSpace = THREE.SRGBColorSpace;
    logoMap.needsUpdate = true;
    const logoAspect =
      logoMap.image && logoMap.image.width && logoMap.image.height
        ? logoMap.image.width / logoMap.image.height
        : 3.2;
    // Todas las aplicaciones usan DecalGeometry para adherirse a la superficie
    // real del vehículo, respetando la profundidad y evitando planos flotantes.
    const logoWidth = vehicleSize.x * 0.19; // centrado transversalmente sobre el cofre
    const logoHeight = logoWidth / logoAspect;
    const centerX = (vehicleBounds.min.x + vehicleBounds.max.x) / 2;
    const toWorldNormal = (hit: THREE.Intersection) => {
      if (!(hit.object instanceof THREE.Mesh) || !hit.face) return null;
      return hit.face.normal.clone().applyNormalMatrix(
        new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
      ).normalize();
    };
    const addLogoDecal = (
      hit: THREE.Intersection,
      width: number,
      height: number,
      preferredUp: THREE.Vector3,
      expectedNormal: THREE.Vector3,
      name: string
    ) => {
      if (!(hit.object instanceof THREE.Mesh)) return;
      const normal = toWorldNormal(hit);
      if (!normal) return;
      if (normal.dot(expectedNormal) < 0) normal.negate();

      // Construye una base ortogonal sobre el panel, con la marca en posición legible.
      const up = preferredUp.clone().addScaledVector(normal, -preferredUp.dot(normal)).normalize();
      if (up.lengthSq() < 0.01) return;
      const right = up.clone().cross(normal).normalize();
      const surfaceUp = normal.clone().cross(right).normalize();
      const basis = new THREE.Matrix4().makeBasis(right, surfaceUp, normal);
      const orientation = new THREE.Euler().setFromRotationMatrix(basis);
      const position = hit.point.clone().addScaledVector(normal, 0.003);
      const decalGeometry = new DecalGeometry(
        hit.object,
        position,
        orientation,
        new THREE.Vector3(width, height, 0.04)
      );
      decalGeometry.applyMatrix4(clone.matrixWorld.clone().invert());
      const material = new THREE.MeshBasicMaterial({
        map: logoMap,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        side: THREE.FrontSide,
      });
      const decal = new THREE.Mesh(decalGeometry, material);
      decal.name = name;
      decal.renderOrder = 3;
      clone.add(decal);
    };

    clone.updateMatrixWorld(true);

    // Cofre: frente del Prius = extremo +Z. La parte superior del logo mira
    // hacia el parabrisas, no hacia la defensa.
    const hoodRaycaster = new THREE.Raycaster(
      new THREE.Vector3(centerX, vehicleBounds.max.y + vehicleSize.y, vehicleBounds.min.z + vehicleSize.z * 0.88),
      new THREE.Vector3(0, -1, 0)
    );
    const hoodHit = hoodRaycaster.intersectObject(clone, true).find((hit) => {
      if (!(hit.object instanceof THREE.Mesh)) return false;
      const normal = toWorldNormal(hit);
      const zN = (hit.point.z - vehicleBounds.min.z) / vehicleSize.z;
      const hN = (hit.point.y - vehicleBounds.min.y) / vehicleSize.y;
      return !!normal && normal.y > 0.25 && zN > 0.84 && hN > 0.38;
    });
    if (hoodHit) {
      addLogoDecal(
        hoodHit, logoWidth, logoHeight,
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(0, 1, 0),
        'QualitasHoodDecal'
      );
    }

    // Puertas delanteras: apuntar al centro geométrico aproximado de cada panel,
    // no al borde delantero. La proyección se realiza desde fuera hacia dentro.
    const doorZ = vehicleBounds.min.z + vehicleSize.z * 0.65;
    const doorY = vehicleBounds.min.y + vehicleSize.y * 0.42;
    const doorWidth = vehicleSize.x * 0.115;
    const doorHeight = doorWidth / logoAspect;
    const doorTargets = [
      {
        origin: new THREE.Vector3(vehicleBounds.max.x + vehicleSize.x * 0.5, doorY, doorZ),
        direction: new THREE.Vector3(-1, 0, 0),
        expectedNormal: new THREE.Vector3(1, 0, 0),
        name: 'QualitasFrontRightDoorDecal',
      },
      {
        origin: new THREE.Vector3(vehicleBounds.min.x - vehicleSize.x * 0.5, doorY, doorZ),
        direction: new THREE.Vector3(1, 0, 0),
        expectedNormal: new THREE.Vector3(-1, 0, 0),
        name: 'QualitasFrontLeftDoorDecal',
      },
    ];
    for (const target of doorTargets) {
      const raycaster = new THREE.Raycaster(target.origin, target.direction);
      const hit = raycaster.intersectObject(clone, true).find((candidate) => {
        if (!(candidate.object instanceof THREE.Mesh)) return false;
        const normal = toWorldNormal(candidate);
        const zN = (candidate.point.z - vehicleBounds.min.z) / vehicleSize.z;
        const hN = (candidate.point.y - vehicleBounds.min.y) / vehicleSize.y;
        return !!normal &&
          normal.dot(target.expectedNormal) > 0.18 &&
          zN > 0.48 && zN < 0.80 &&
          hN > 0.25 && hN < 0.62;
      });
      if (hit) {
        addLogoDecal(
          hit, doorWidth, doorHeight,
          new THREE.Vector3(0, 1, 0),
          target.expectedNormal,
          target.name
        );
      }
    }

    // Cajuela/portón trasero: el extremo -Z mira hacia atrás.
    const trunkRaycaster = new THREE.Raycaster(
      new THREE.Vector3(centerX, vehicleBounds.min.y + vehicleSize.y * 0.61, vehicleBounds.min.z - vehicleSize.z * 0.25),
      new THREE.Vector3(0, 0, 1)
    );
    const trunkHit = trunkRaycaster.intersectObject(clone, true).find((hit) => {
      if (!(hit.object instanceof THREE.Mesh)) return false;
      const normal = toWorldNormal(hit);
      const zN = (hit.point.z - vehicleBounds.min.z) / vehicleSize.z;
      const hN = (hit.point.y - vehicleBounds.min.y) / vehicleSize.y;
      const xN = Math.abs(hit.point.x - centerX) / vehicleSize.x;
      return !!normal && normal.z < -0.2 && zN < 0.16 && hN > 0.38 && hN < 0.78 && xN < 0.32;
    });
    if (trunkHit) {
      // Oculta la insignia original “Prius” con una pequeña calcomanía del
      // color de la carrocería, adherida a la superficie de la cajuela.
      const trunkNormal = toWorldNormal(trunkHit);
      if (trunkNormal) {
        const patchPosition = trunkHit.point.clone().addScaledVector(trunkNormal, 0.004);
        const patchUp = new THREE.Vector3(0, 1, 0)
          .addScaledVector(trunkNormal, -trunkNormal.y)
          .normalize();
        const patchRight = patchUp.clone().cross(trunkNormal).normalize();
        const patchSurfaceUp = trunkNormal.clone().cross(patchRight).normalize();
        const patchBasis = new THREE.Matrix4().makeBasis(patchRight, patchSurfaceUp, trunkNormal);
        const patchOrientation = new THREE.Euler().setFromRotationMatrix(patchBasis);
        const patchGeometry = new DecalGeometry(
          trunkHit.object as THREE.Mesh,
          patchPosition,
          patchOrientation,
          new THREE.Vector3(vehicleSize.x * 0.105, vehicleSize.y * 0.035, 0.035)
        );
        patchGeometry.applyMatrix4(clone.matrixWorld.clone().invert());
        const patch = new THREE.Mesh(
          patchGeometry,
          new THREE.MeshBasicMaterial({
            color: '#941B80',
            depthTest: true,
            depthWrite: false,
            toneMapped: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            side: THREE.FrontSide,
          })
        );
        patch.name = 'RemoveOriginalPriusBadge';
        patch.renderOrder = 2;
        clone.add(patch);
      }

      const trunkWidth = vehicleSize.x * 0.15;
      addLogoDecal(
        trunkHit, trunkWidth, trunkWidth / logoAspect,
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, -1),
        'QualitasTrunkDecal'
      );
    }

    return clone;
  }, [scene, qualitasLogo]);

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

