import Link from 'next/link';
import { ReactNode } from 'react';
export function ButtonLink({href,children,variant='primary',onClickLabel}:{href:string;children:ReactNode;variant?:'primary'|'secondary'|'light';onClickLabel?:string}){
 const cls=variant==='primary'?'bg-[#b0007a] text-white hover:bg-[#920067]':variant==='light'?'bg-white text-[#b0007a] hover:bg-white/90':'border border-[#008f8b] text-[#008f8b] hover:bg-[#e9fbfa]';
 return <Link data-event={onClickLabel} className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition ${cls}`} href={href}>{children}</Link>;
}
