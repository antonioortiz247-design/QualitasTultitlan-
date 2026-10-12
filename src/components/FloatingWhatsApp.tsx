'use client';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { whatsappMessages } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
export function FloatingWhatsApp(){const[show,setShow]=useState(false);useEffect(()=>{const f=()=>setShow(scrollY>220);addEventListener('scroll',f,{passive:true});f();return()=>removeEventListener('scroll',f)},[]);return show?<a aria-label="Contactar por WhatsApp al 55 8566 7261" onClick={()=>trackEvent('whatsapp_click',{placement:'floating'})} href={buildWhatsAppUrl(whatsappMessages.general)} className="focus-ring fixed bottom-5 right-4 z-40 grid size-14 place-items-center rounded-full bg-qualitas-aqua text-white shadow-lg md:bottom-7 md:right-7"><MessageCircle/></a>:null}
