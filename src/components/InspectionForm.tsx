'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { Camera, CarFront, CheckCircle2, Bike, ArrowLeft, LoaderCircle, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

const purple = '#941B80';
const aqua = '#0096AE';
const MAX_PHOTOS = 5;

function preserveJpegExif(source: Uint8Array, compressed: Uint8Array): Uint8Array {
  // JPEG EXIF lives in an APP1 segment immediately after the SOI marker.
  if (source.length < 4 || source[0] !== 0xff || source[1] !== 0xd8) return compressed;
  let offset = 2;
  let exifSegment: Uint8Array | null = null;
  while (offset + 4 < source.length && source[offset] === 0xff) {
    const marker = source[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = (source[offset + 2] << 8) | source[offset + 3];
    if (length < 2 || offset + 2 + length > source.length) break;
    if (marker === 0xe1 && length >= 8 &&
        source[offset + 4] === 0x45 && source[offset + 5] === 0x78 &&
        source[offset + 6] === 0x69 && source[offset + 7] === 0x66 &&
        source[offset + 8] === 0 && source[offset + 9] === 0) {
      exifSegment = source.slice(offset, offset + 2 + length);
      break;
    }
    offset += 2 + length;
  }
  if (!exifSegment || compressed.length < 2 || compressed[0] !== 0xff || compressed[1] !== 0xd8) return compressed;

  // The canvas output is already physically oriented. Reset EXIF Orientation to 1
  // to prevent compatible viewers from rotating the compressed image a second time.
  const tiff = 10;
  if (exifSegment.length > tiff + 8) {
    const little = exifSegment[tiff] === 0x49 && exifSegment[tiff + 1] === 0x49;
    const read16 = (p: number) => little ? exifSegment![p] | (exifSegment![p + 1] << 8) : (exifSegment![p] << 8) | exifSegment![p + 1];
    const read32 = (p: number) => little
      ? (exifSegment![p] | (exifSegment![p + 1] << 8) | (exifSegment![p + 2] << 16) | (exifSegment![p + 3] << 24)) >>> 0
      : ((exifSegment![p] << 24) | (exifSegment![p + 1] << 16) | (exifSegment![p + 2] << 8) | exifSegment![p + 3]) >>> 0;
    const write16 = (p: number, value: number) => {
      if (little) { exifSegment![p] = value & 255; exifSegment![p + 1] = value >> 8; }
      else { exifSegment![p] = value >> 8; exifSegment![p + 1] = value & 255; }
    };
    const ifdOffset = read32(tiff + 4);
    const ifd = tiff + ifdOffset;
    if (ifd + 2 <= exifSegment.length) {
      const count = read16(ifd);
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > exifSegment.length) break;
        if (read16(entry) === 0x0112 && read16(entry + 2) === 3 && read32(entry + 4) >= 1) {
          write16(entry + 8, 1);
          break;
        }
      }
    }
  }
  const output = new Uint8Array(compressed.length + exifSegment.length);
  output.set(compressed.subarray(0, 2), 0);
  output.set(exifSegment, 2);
  output.set(compressed.subarray(2), 2 + exifSegment.length);
  return output;
}

async function compressPhoto(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Usa fotografías JPG, PNG o WebP.');
  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo procesar una fotografía.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo comprimir una fotografía.')), 'image/jpeg', 0.8));
    const compressed = new Uint8Array(await blob.arrayBuffer());
    const withExif = preserveJpegExif(originalBytes, compressed);
    const baseName = file.name.includes('.') ? file.name.split('.').slice(0, -1).join('.') : file.name;
    const fileBuffer = new ArrayBuffer(withExif.byteLength);
    new Uint8Array(fileBuffer).set(withExif);
    return new File([fileBuffer], baseName + '.jpg', { type: 'image/jpeg', lastModified: file.lastModified || Date.now() });
  } finally { URL.revokeObjectURL(objectUrl); }
}

export default function InspectionForm() {
  const [busy, setBusy] = useState(false);
  const [folio, setFolio] = useState('');
  const [error, setError] = useState('');
  const [vehicleType, setVehicleType] = useState('Automóvil');
  const [files, setFiles] = useState<File[]>([]);
  const [compressionBusy, setCompressionBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('tipoVehiculo', vehicleType);
    files.forEach((file) => data.append('fotos', file));
    try {
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }));
          data.set('ubicacion', JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }));
        } catch {
          // La ubicación es opcional: si se deniega, la solicitud continúa sin coordenadas.
        }
      }
      const response = await fetch('/api/vehicle-inspections', { method: 'POST', body: data, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la inspección.');
      setFolio(result.folio || 'Recibida');
      form.reset();
      setFiles([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error al enviar los datos.');
    } finally {
      setBusy(false);
    }
  }

  const inputClass = 'mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#0096ae] focus:ring-4 focus:ring-[#0096ae]/10';
  const labelClass = 'block text-sm font-semibold text-slate-700';

  if (folio) return <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900"><section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0096ae]/10 text-[#0096ae]"><CheckCircle2 size={34}/></div><p className="mt-5 text-sm font-bold uppercase tracking-widest text-[#0096ae]">Solicitud recibida</p><h1 className="mt-2 text-3xl font-bold">Gracias por enviar tus datos</h1><p className="mt-3 text-slate-600">Tu folio de seguimiento es:</p><p className="mt-2 rounded-xl bg-slate-50 p-4 text-xl font-bold text-[#941b80]">{folio}</p><p className="mt-4 text-sm leading-6 text-slate-600">La recepción no significa que la inspección esté aprobada ni garantiza la emisión de una póliza. El personal revisará la información y se comunicará contigo si necesita aclaraciones.</p><a className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl px-5 font-bold text-white" style={{background:purple}} href="/">Volver al sitio</a></section></main>;

  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-7 text-slate-900 sm:py-12">
    <div className="mx-auto max-w-3xl">
      <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#941b80]"><ArrowLeft size={16}/> Volver al sitio</a>
      <header className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-9">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#941b80]/5 p-1"><Image src="/Q-morado.png" alt="Q de Quálitas" width={48} height={48} className="h-full w-full object-contain" priority /></div><div><p className="text-xs font-bold uppercase tracking-widest" style={{color:aqua}}>{siteConfig.businessName}</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Inspección vehicular</h1></div></div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Completa tus datos y adjunta fotografías claras de tu unidad. Esta es una herramienta de recepción y seguimiento de nuestra oficina; no sustituye una inspección oficial ni confirma la aceptación del riesgo por parte de la aseguradora.</p>
      </header>
      <form onSubmit={submit} className="mt-5 space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <section><h2 className="text-lg font-bold">1. Datos de contacto</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Nombre completo<input className={inputClass} name="nombre" required maxLength={150} autoComplete="name" placeholder="Nombre y apellidos"/></label>
          <label className={labelClass}>WhatsApp / teléfono<input className={inputClass} name="telefono" type="tel" required minLength={10} maxLength={20} autoComplete="tel" placeholder="10 dígitos"/></label>
          <label className={labelClass}>Correo electrónico<input className={inputClass} name="correo" type="email" required maxLength={254} autoComplete="email" placeholder="correo@ejemplo.com"/></label>
        </div></section>
        <div className="h-px bg-slate-100"/>
        <section><h2 className="text-lg font-bold">2. Datos del vehículo</h2><div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={()=>setVehicleType('Automóvil')} className={'flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-bold '+(vehicleType==='Automóvil'?'border-[#941b80] bg-[#941b80]/5 text-[#941b80]':'border-slate-200 text-slate-600')}><CarFront size={19}/> Automóvil</button>
          <button type="button" onClick={()=>setVehicleType('Motocicleta')} className={'flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-bold '+(vehicleType==='Motocicleta'?'border-[#941b80] bg-[#941b80]/5 text-[#941b80]':'border-slate-200 text-slate-600')}><Bike size={19}/> Motocicleta</button>
        </div><div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Marca<input className={inputClass} name="marca" required maxLength={80} placeholder="Ej. Nissan"/></label>
          <label className={labelClass}>Modelo / submarca<input className={inputClass} name="modelo" required maxLength={100} placeholder="Ej. Versa"/></label>
          <label className={labelClass}>Año<input className={inputClass} name="anio" type="number" required min="1980" max={new Date().getFullYear()+1} placeholder="2024"/></label>
          <label className={labelClass}>Placas (si cuenta con ellas)<input className={inputClass} name="placas" maxLength={20} placeholder="Placas"/></label>
          <label className={labelClass}>Color<input className={inputClass} name="color" maxLength={40} placeholder="Color de la unidad"/></label>
          <label className={labelClass}>Número de serie / VIN (opcional)<input className={inputClass} name="numeroSerie" maxLength={40} placeholder="Número de serie si te lo solicitan"/></label>
        </div></section>
        <div className="h-px bg-slate-100"/>
        <section><h2 className="text-lg font-bold">3. Fotografías de la unidad</h2><p className="mt-1 text-sm leading-6 text-slate-600">Adjunta hasta 5 fotos. En celular puedes tomar una fotografía con la cámara o elegir imágenes de tu galería. Las imágenes se comprimen antes de enviarse. En fotografías JPG se conservan los metadatos EXIF disponibles, incluida la información GPS si la cámara la registró.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0096ae]/60 bg-[#0096ae]/[0.03] px-4 py-5 text-center transition hover:bg-[#0096ae]/[0.08]"><Camera size={30} style={{color:aqua}}/><span className="mt-2 font-bold">Tomar fotografía</span><span className="mt-1 text-xs text-slate-500">Abrir cámara del celular</span><input className="sr-only" type="file" accept="image/*" capture="environment" onChange={async (e)=>{const input=e.currentTarget;const chosen=Array.from(input.files||[]);if(files.length+chosen.length>MAX_PHOTOS){setError('Puedes adjuntar máximo 5 fotografías en total.');input.value='';return;}setError('');setCompressionBusy(true);try{setFiles(current=>current);const optimized=await Promise.all(chosen.map(compressPhoto));setFiles(current=>[...current,...optimized].slice(0,MAX_PHOTOS));}catch(err){setError(err instanceof Error?err.message:'No se pudieron preparar las fotografías.');}finally{setCompressionBusy(false);input.value='';}}}/></label><label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-4 py-5 text-center transition hover:border-[#941b80] hover:bg-[#941b80]/[0.03]"><Camera size={30} style={{color:purple}}/><span className="mt-2 font-bold">Elegir de la galería</span><span className="mt-1 text-xs text-slate-500">Seleccionar fotos existentes</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={async (e)=>{const input=e.currentTarget;const chosen=Array.from(input.files||[]);if(files.length+chosen.length>MAX_PHOTOS){setError('Puedes adjuntar máximo 5 fotografías en total.');input.value='';return;}setError('');setCompressionBusy(true);try{const optimized=await Promise.all(chosen.map(compressPhoto));setFiles(current=>[...current,...optimized].slice(0,MAX_PHOTOS));}catch(err){setError(err instanceof Error?err.message:'No se pudieron preparar las fotografías.');}finally{setCompressionBusy(false);input.value='';}}}/></label></div><p className="mt-2 text-xs text-slate-500">Puedes combinar fotos tomadas al momento con imágenes de la galería. Máximo 5 archivos, optimizados para ahorrar almacenamiento.</p>
        {compressionBusy&&<p className="mt-3 text-sm font-semibold text-[#007b8e]">Preparando fotografías…</p>}{files.length>0&&<ul className="mt-3 space-y-2">{files.map((file,index)=><li key={file.name+index} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="truncate">{file.name}</span><span className="shrink-0 text-slate-500">{(file.size/1024/1024).toFixed(1)} MB</span></li>)}</ul>}</section>
        <label className={labelClass}>Observaciones o daños preexistentes<textarea className={inputClass+' min-h-24 py-3'} name="observaciones" maxLength={1500} placeholder="Describe daños visibles o comentarios relevantes."/></label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input className="mt-1 h-4 w-4 shrink-0 accent-[#941b80]" type="checkbox" name="privacidad" required/><span>Acepto el tratamiento de mis datos para gestionar esta solicitud y declaro haber consultado el <a className="font-semibold underline" style={{color:purple}} href="/aviso-privacidad" target="_blank">aviso de privacidad</a>.</span></label>
        {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy||compressionBusy} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white transition hover:brightness-95 disabled:opacity-60" style={{background:purple}}>{busy?<><LoaderCircle className="animate-spin" size={19}/> Enviando solicitud…</>:<><ShieldCheck size={19}/> Enviar inspección</>}</button>
        <p className="text-center text-xs leading-5 text-slate-500">Los archivos se almacenan en un espacio privado y solo se consultan por personal autorizado.</p>
      </form>
    </div>
  </main>;
}
