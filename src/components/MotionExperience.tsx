'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowDownRight, CarFront, ShieldCheck, KeyRound, HeartPulse, Wrench } from 'lucide-react';

const InteractiveSUV = dynamic(() => import('./InteractiveSUV').then((module) => module.InteractiveSUV), { ssr: false, loading: () => <div className="motion-3d-viewer mt-3 min-h-[300px] animate-pulse sm:min-h-[390px]" aria-label="Cargando modelo 3D" /> });

const hotspots = [
  { id: 'materiales', label: 'Daños materiales', short: 'Daños', Icon: CarFront, title: 'Protección para tu vehículo', description: 'Consulta si tu póliza contempla daños materiales y revisa los deducibles, límites y exclusiones aplicables.' },
  { id: 'robo', label: 'Robo total', short: 'Robo total', Icon: KeyRound, title: 'Conoce la cobertura de robo total', description: 'La protección depende de que esta cobertura esté contratada y de las condiciones que aparecen en la póliza.' },
  { id: 'responsabilidad', label: 'Responsabilidad civil', short: 'Responsabilidad civil', Icon: ShieldCheck, title: 'Respaldo frente a terceros', description: 'Revisa el límite de responsabilidad civil y las condiciones de protección por daños a terceros.' },
  { id: 'medicos', label: 'Gastos médicos', short: 'Gastos médicos', Icon: HeartPulse, title: 'Atención a ocupantes', description: 'Los gastos médicos a ocupantes dependen de la suma asegurada, las condiciones y las exclusiones contratadas.' },
  { id: 'asistencia', label: 'Asistencia vial', short: 'Asistencia vial', Icon: Wrench, title: 'Ayuda en el camino', description: 'Los servicios de asistencia pueden tener límites por evento y requisitos específicos en las condiciones de la póliza.' },
];

export function MotionExperience() {
  const [active, setActive] = useState(hotspots[0].id);
  const selected = hotspots.find((item) => item.id === active) ?? hotspots[0];

  return (
    <section id="motion-experience" className="scroll-reveal overflow-hidden bg-[#17121c] px-4 py-16 text-white sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-[#53c5d1]">
              <span className="size-2 rounded-full bg-[#53c5d1] shadow-[0_0_14px_#53c5d1]" /> Quálitas Motion Experience
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Explora tu protección <span className="text-[#53c5d1]">desde otra perspectiva.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              Selecciona un punto del vehículo para conocer información general sobre algunas coberturas. La protección efectiva depende de lo contratado y de las condiciones de la póliza.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {hotspots.map(({ id, label, Icon }) => (
                <button key={id} type="button" aria-pressed={active === id} onClick={() => setActive(id)} className={'focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ' + (active === id ? 'border-[#53c5d1] bg-[#53c5d1] text-[#17121c] shadow-[0_0_24px_rgba(83,197,209,.2)]' : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/40 hover:bg-white/[0.09]')}>
                  <Icon size={16} aria-hidden="true" />{label}
                </button>
              ))}
            </div>
            <div key={selected.id} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 motion-info-panel">
              <p className="text-xs font-bold uppercase tracking-widest text-[#53c5d1]">Explora la cobertura</p>
              <h3 className="mt-2 text-xl font-extrabold">{selected.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{selected.description}</p>
              <a href="#cotizador" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-[#941B80] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110">
                Ir al cotizador <ArrowDownRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="motion-grid absolute inset-0 rounded-[2rem]" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#292130] via-[#201925] to-[#101820] p-4 sm:p-7">
              <div className="absolute -right-16 -top-16 size-56 rounded-full bg-[#941B80]/20 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[#0096AE]/20 blur-3xl" aria-hidden="true" />
              <div className="relative flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[.16em] text-white/55">Vehículo 3D · gira para explorar</span>
                <span className="rounded-full border border-[#53c5d1]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#53c5d1]">Giro 360°</span>
              </div>
              <InteractiveSUV active={active} onSelect={setActive} />
              <div className="relative mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/50">
                <span>Arrastra el vehículo para girarlo</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#53c5d1]" /> Giro táctil y mouse</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
