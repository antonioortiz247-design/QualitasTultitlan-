import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CatalogRow = {
  c?: string;
  v?: string;
  r?: string;
  b?: string;
  t?: string;
  d?: string;
  y?: string[];
  s?: string;
};

let cachedCatalog: CatalogRow[] | null = null;

async function getCatalog(): Promise<CatalogRow[]> {
  if (cachedCatalog) return cachedCatalog;
  const filePath = path.join(process.cwd(), 'public', 'data', 'vehicle-catalog.json.gz');
  const file = await readFile(filePath);
  const content = file[0] === 0x1f && file[1] === 0x8b
    ? gunzipSync(file).toString('utf8')
    : file.toString('utf8');
  const parsed: unknown = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error('El catálogo no tiene el formato esperado.');
  cachedCatalog = parsed as CatalogRow[];
  return cachedCatalog;
}

export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get('q') || '').trim().toLocaleLowerCase('es-MX');
  if (term.length < 2) return NextResponse.json({ vehicles: [] });

  try {
    const catalog = await getCatalog();
    const words = term.split(/\s+/).filter(Boolean);
    const matches = catalog
      .map((row) => {
        const brand = row.b || row.r || '';
        const type = row.t || '';
        const description = row.d || '';
        const haystack = [brand, type, description, ...(row.y || [])].join(' ').toLocaleLowerCase('es-MX');
        const score = words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
        return { row, brand, type, description, score };
      })
      .filter((item) => item.score === words.length)
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.type.localeCompare(b.type))
      .slice(0, 15)
      .map(({ row, brand, type, description }) => ({
        cate: row.c || '',
        cve: row.v || '',
        brandCode: row.r || '',
        brand,
        type,
        description,
        years: Array.isArray(row.y) ? row.y.map(String) : [],
      }));
    return NextResponse.json({ vehicles: matches }, { headers: { 'Cache-Control': 'private, max-age=30' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar el catálogo.' }, { status: 500 });
  }
}
