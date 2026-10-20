'use client';

import { useState } from 'react';
import { ArrowDownRight, CarFront, ShieldCheck, KeyRound, HeartPulse, Wrench } from 'lucide-react';

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
                <span className="text-xs font-bold uppercase tracking-[.16em] text-white/55">Vista interactiva · vehículo ilustrativo</span>
                <span className="rounded-full border border-[#53c5d1]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#53c5d1]">3D motion</span>
              </div>
              <div className="motion-car-stage relative mt-5 flex min-h-[260px] items-center justify-center sm:min-h-[340px]" aria-label="Ilustración estilizada de automóvil con puntos interactivos de cobertura">
                <div className="motion-car-aura" aria-hidden="true" />
                <svg viewBox="0 0 720 360" role="img" aria-labelledby="motion-car-title" className="motion-car w-full max-w-[650px]">
                  <title id="motion-car-title">Automóvil estilizado con zonas de cobertura interactivas</title>
                  <defs>
                    <linearGradient id="motionBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="48%" stopColor="#cdd6df"/><stop offset="100%" stopColor="#718096"/></linearGradient>
                    <linearGradient id="motionGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c687a"/><stop offset="100%" stopColor="#14232e"/></linearGradient>
                    <linearGradient id="motionLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#53c5d1"/><stop offset="100%" stopColor="#0096ae"/></linearGradient>
                  </defs>
                  <ellipse cx="360" cy="286" rx="250" ry="26" fill="#0096ae" opacity=".18" />
                  <g className="motion-car-body">
                    <path d="M105 231 L128 193 Q146 175 200 164 L270 103 Q295 84 345 84 L440 91 Q477 95 508 133 L560 166 Q596 177 615 202 L632 236 L621 260 L101 260 Z" fill="url(#motionBody)" stroke="#edf4f7" strokeWidth="3"/>
                    <path d="M225 158 L285 108 Q304 96 342 97 L376 99 L376 158 Z" fill="url(#motionGlass)" stroke="#9aaab6" strokeWidth="2"/>
                    <path d="M390 100 L437 105 Q461 109 482 136 L500 158 L390 158 Z" fill="url(#motionGlass)" stroke="#9aaab6" strokeWidth="2"/>
                    <path d="M384 168 L384 252 M511 168 L540 248" stroke="#8796a4" strokeWidth="3" opacity=".8"/>
                    <path d="M137 205 Q178 185 219 184 L530 184 Q573 188 600 211 L605 228 L132 228 Z" fill="#f8fafc" opacity=".55"/>
                    <path d="M115 231 L151 230 L163 246 L132 250 Q119 247 115 231Z" fill="url(#motionLight)"/>
                    <path d="M578 218 L612 222 L621 238 L585 238Z" fill="#941b80"/>
                    <path d="M185 260 L190 276 L520 276 L532 260" fill="#536273" opacity=".75"/>
                    <circle cx="218" cy="258" r="42" fill="#10151c" stroke="#7f8b97" strokeWidth="5"/>
                    <circle cx="218" cy="258" r="22" fill="#d7e0e7" stroke="#697786" strokeWidth="4"/>
                    <circle cx="218" cy="258" r="8" fill="#778696"/>
                    <circle cx="520" cy="258" r="42" fill="#10151c" stroke="#7f8b97" strokeWidth="5"/>
                    <circle cx="520" cy="258" r="22" fill="#d7e0e7" stroke="#697786" strokeWidth="4"/>
                    <circle cx="520" cy="258" r="8" fill="#778696"/>
                    <path d="M177 212 L190 207 M556 202 L571 209" stroke="#0096ae" strokeWidth="4" strokeLinecap="round"/>
                  </g>
                  <g className="motion-orbit" fill="none" stroke="#53c5d1" strokeWidth="1.5" strokeDasharray="5 8" opacity=".5"><ellipse cx="360" cy="190" rx="278" ry="115"/><ellipse cx="360" cy="190" rx="230" ry="145" transform="rotate(-18 360 190)"/></g>
                </svg>
                {hotspots.map(({ id, short, Icon }, index) => {
                  const positions = [
                    'left-[17%] top-[55%]',
                    'left-[72%] top-[65%]',
                    'left-[49%] top-[24%]',
                    'left-[36%] top-[48%]',
                    'left-[61%] top-[38%]',
                  ];
                  return (
                    <button key={id} type="button" aria-label={short} aria-pressed={active === id} onClick={() => setActive(id)} className={'motion-hotspot absolute z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ' + positions[index] + (active === id ? ' is-active border-[#53c5d1] bg-[#53c5d1] text-[#17121c]' : ' border-white/80 bg-[#941B80] text-white hover:scale-110')}>
                      <Icon size={17} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <div className="relative mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/50">
                <span>Selecciona los puntos para explorar</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#53c5d1]" /> Interactivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
