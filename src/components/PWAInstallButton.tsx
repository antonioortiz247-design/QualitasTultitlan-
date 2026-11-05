'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => console.error('No se pudo registrar la app:', error));
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setHelpOpen(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) {
      setHelpOpen((value) => !value);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  }

  if (installed) return <span className="inline-flex items-center gap-2 rounded-xl border border-[#0096AE]/20 bg-[#0096AE]/10 px-3 py-2 text-sm font-semibold text-[#007b8e]"><Smartphone size={16} /> App instalada</span>;

  return (
    <div className="relative">
      <button type="button" onClick={install} aria-expanded={helpOpen} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#941B80] to-[#0096AE] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-[#941B80]/15 transition hover:-translate-y-0.5">
        <Download size={16} /> Instalar app
      </button>
      {helpOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-white/80 bg-white/95 p-4 text-sm text-slate-700 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-[#941B80]">Agregar a pantalla de inicio</p>
            <button type="button" onClick={() => setHelpOpen(false)} aria-label="Cerrar ayuda" className="rounded-lg p-1 hover:bg-slate-100"><X size={16} /></button>
          </div>
          <p className="mt-2 leading-6">En el menú del navegador, selecciona <strong>Instalar aplicación</strong> o <strong>Agregar a pantalla de inicio</strong>. La opción puede variar según el dispositivo.</p>
        </div>
      )}
    </div>
  );
}
