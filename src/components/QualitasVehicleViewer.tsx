'use client';

import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/models/qualitas-prius.glb';
const LOGO_URL = '/qualitas-logo-blanco.png';

function BrandedCar() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const mesh = object;
      const name = (mesh.name + ' ' + (Array.isArray(mesh.material) ? mesh.material.map(m => m.name).join(' ') : mesh.material?.name || '')).toLowerCase();
      // Keep glass, tyres, lights and interior materials unchanged.
      if (/glass|window|windshield|tire|tyre|wheel|rim|light|lamp|headlight|tail.?light|interior|seat|chrome|mirror|license|plate|rubber/.test(name)) return;
      if (/body|paint|car.?paint|exterior|door|hood|bonnet|fender|bumper|trunk|bodywork|shell/.test(name)) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mesh.material = materials.map((material) => {
          const copy = material.clone();
          if ('color' in copy) {
            (copy as THREE.MeshStandardMaterial).color.set('#0096AE');
            (copy as THREE.MeshStandardMaterial).metalness = 0.32;
            (copy as THREE.MeshStandardMaterial).roughness = 0.3;
          }
          return copy;
        });
      }
    });
    return clone;
  }, [scene]);

  return (
    <Bounds fit clip observe margin={1.15}>
      <Center>
        <primitive object={model} />
      </Center>
    </Bounds>
  );
}

function Loader() {
  const { progress } = useProgress();
  return <Html center><div className="rounded-2xl bg-white/95 px-5 py-3 text-sm font-medium text-slate-700 shadow-xl">{progress < 100 ? `Cargando vehículo… ${Math.round(progress)}%` : 'Preparando vista…'}</div></Html>;
}

function VehicleError() {
  return <Html center><div className="max-w-xs rounded-2xl bg-white p-5 text-center text-sm text-slate-700 shadow-xl">No se pudo cargar el modelo. Comprueba que el archivo <code>public/models/qualitas-prius.glb</code> esté disponible.</div></Html>;
}

export default function QualitasVehicleViewer() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [view, setView] = useState<'front' | 'side' | 'rear'>('front');
  const cameraPositions = {
    front: [4.5, 2.2, 5.2] as [number, number, number],
    side: [0.2, 1.8, 6.4] as [number, number, number],
    rear: [-5.2, 2.1, -4.2] as [number, number, number],
  };
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#24212a]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#941B80] to-[#0096AE] text-xl font-bold text-white">Q</div>
          <div>
            <p className="font-semibold tracking-tight">Quálitas · Vehículo de activación</p>
            <p className="text-sm text-slate-500">Prototipo 3D interactivo · Toyota Prius</p>
          </div>
          <a href="/" className="ml-auto rounded-full border border-slate-200 px-4 py-2 text-sm font-medium transition hover:border-[#0096AE]">Volver al sitio</a>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-8">
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-gradient-to-br from-white via-[#edf3f5] to-[#e4e9ee] shadow-sm">
          <div className="flex items-center justify-between gap-3 px-5 pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0096AE]">Branding corporativo</p>
              <h1 className="mt-1 text-xl font-semibold sm:text-2xl">Toyota Prius Quálitas</h1>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-slate-600">3D · GLB</span>
          </div>
          <div className="h-[54vh] min-h-[360px] max-h-[650px] sm:h-[620px]">
            <Canvas key={view} camera={{ position: cameraPositions[view], fov: 36 }} dpr={[1, 1.5]} shadows gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
              <color attach="background" args={['#edf2f4']} />
              <ambientLight intensity={1.5} />
              <hemisphereLight args={['#ffffff', '#687681', 1.4]} />
              <directionalLight position={[5, 8, 6]} intensity={3} castShadow />
              <directionalLight position={[-5, 4, -4]} intensity={2} color="#0096AE" />
              <pointLight position={[0, 3, 4]} intensity={8} color="#941B80" />
              <Suspense fallback={<Loader />}>
                <BrandedCar />
                <ContactShadows position={[0, -0.12, 0]} opacity={0.28} scale={10} blur={2.5} far={5} />
              </Suspense>
              <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={11} minPolarAngle={0.25} maxPolarAngle={Math.PI / 2.02} autoRotate={autoRotate} autoRotateSpeed={0.45} enableDamping dampingFactor={0.07} />
            </Canvas>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-black/5 bg-white/70 p-4">
            {([['front', '3/4 frontal'], ['side', 'Lateral'], ['rear', 'Trasera']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setView(key)} className={'rounded-full px-4 py-2.5 text-sm font-medium transition ' + (view === key ? 'bg-[#941B80] text-white' : 'border border-slate-200 bg-white hover:border-[#0096AE]')}>{label}</button>
            ))}
            <button onClick={() => setAutoRotate(v => !v)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-[#0096AE]">{autoRotate ? 'Pausar giro' : 'Activar giro'}</button>
          </div>
        </div>
        <aside className="space-y-4">
          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Identidad visual</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Concepto de rotulación integral para vehículo de activación. La geometría original del modelo se conserva.</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-full bg-[#941B80]" />Morado</span>
              <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-full bg-[#0096AE]" />Aqua</span>
              <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-full border border-slate-300 bg-white" />Blanco</span>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f7f8fa] p-4">
              <img src={LOGO_URL} alt="Logotipo oficial de Quálitas Compañía de Seguros" className="h-auto w-full object-contain" />
            </div>
          </section>
          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Controles</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Arrastra para girar el vehículo.</li>
              <li>• Pellizca para acercar o alejar en móvil.</li>
              <li>• Usa las vistas para orientar la cámara.</li>
            </ul>
          </section>
          <p className="px-1 text-xs leading-5 text-slate-500">Prototipo de visualización. La aplicación final de logotipos como calcomanías sobre las superficies de puertas, cofre y cajuela requiere ajuste de coordenadas y validación visual sobre la malla.</p>
        </aside>
      </section>
    </main>
  );
}
