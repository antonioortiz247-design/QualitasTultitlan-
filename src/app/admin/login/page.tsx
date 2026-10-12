'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LockKeyhole } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }), cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
      router.replace('/admin');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 flex items-center justify-center">
    <section className="w-full max-w-md rounded-3xl border border-[#e4e5e9] bg-white p-7 shadow-sm sm:p-9">
      <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#941b80]/10 text-[#941b80]"><ShieldCheck size={30}/></div>
      <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#0096ae]">Quálitas Tultitlán</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#25232a]">Panel privado</h1>
      <p className="mt-2 text-sm leading-6 text-[#62616a]">Ingresa con la contraseña de administrador para gestionar las solicitudes.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label htmlFor="admin-password" className="block text-sm font-medium text-[#25232a]">Contraseña de administrador</label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62616a]" size={18}/>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={12} maxLength={256} className="w-full rounded-xl border border-[#d8d9df] py-3 pl-10 pr-3 outline-none focus:border-[#941b80] focus:ring-2 focus:ring-[#941b80]/15" placeholder="Ingresa tu contraseña"/>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-[#941b80] px-4 py-3 font-semibold text-white transition hover:bg-[#7e176d] disabled:opacity-60">{loading ? 'Verificando…' : 'Entrar al panel'}</button>
      </form>
      <a href="/" className="mt-6 inline-block text-sm font-medium text-[#62616a] hover:text-[#941b80]">← Volver al sitio</a>
    </section>
  </main>;
}
