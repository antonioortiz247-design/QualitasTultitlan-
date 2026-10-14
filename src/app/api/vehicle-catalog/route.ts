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
  const params = request.nextUrl.searchParams;
  const action = params.get('action') || 'search';
  const normalizeSearch = (value: unknown) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\\s+/g, ' ');
  const term = normalizeSearch(params.get('q'));
  const brandFilter = (params.get('brand') || '').trim().toLocaleLowerCase('es-MX');
  const yearFilter = params.get('year') || '';
  const modelFilter = (params.get('model') || '').trim().toLocaleLowerCase('es-MX');
  const subbrandFilter = (params.get('subbrand') || '').trim().toLocaleLowerCase('es-MX');

  try {
    const catalog = await getCatalog();
    const filtered = catalog.filter((row) => {
      const brand = (row.b || row.r || '').trim().toLocaleLowerCase('es-MX');
      const model = (row.t || '').trim().toLocaleLowerCase('es-MX');
      const subbrand = (row.s || '').trim().toLocaleLowerCase('es-MX');
      const years = Array.isArray(row.y) ? row.y.map(String) : [];
      return (!brandFilter || brand === brandFilter) &&
        (!yearFilter || years.includes(yearFilter)) &&
        (!modelFilter || model === modelFilter) &&
        (!subbrandFilter || subbrand === subbrandFilter);
    });

    const unique = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es-MX', { numeric: true }));
    if (action === 'years') {
      return NextResponse.json({ years: unique(filtered.flatMap((row) => (row.y || []).map(String))).sort((a, b) => Number(b) - Number(a)) });
    }
    if (action === 'models') {
      return NextResponse.json({ models: unique(filtered.map((row) => row.t || '')) });
    }
    if (action === 'subbrands') {
      return NextResponse.json({ subbrands: unique(filtered.map((row) => row.s || '')) });
    }
    if (action === 'versions') {
      const versions = filtered.map((row) => ({
        cate: row.c || '',
        cve: row.v || '',
        brandCode: row.r || '',
        brand: row.b || row.r || '',
        type: row.t || '',
        description: row.d || '',
        subbrand: row.s || '',
        years: Array.isArray(row.y) ? row.y.map(String) : [],
      })).filter((item) => item.description || item.cve);
      return NextResponse.json({ versions: versions.slice(0, 200) });
    }

    if (term.length < 2) return NextResponse.json({ vehicles: [] });
    const words = term.split(/\\s+/).filter(Boolean);
    const matches = catalog
      .map((row) => {
        const brand = row.b || row.r || '';
        const type = row.t || '';
        const description = row.d || '';
        const haystack = [brand, type, description, row.s || '', ...(row.y || [])].join(' ').toLocaleLowerCase('es-MX');
        const score = words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
        return { row, brand, type, description, score };
      })
      .filter((item) => item.score === words.length)
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.type.localeCompare(b.type))
      .slice(0, 30)
      .map(({ row, brand, type, description }) => ({
        cate: row.c || '', cve: row.v || '', brandCode: row.r || '',
        brand, type, description, subbrand: row.s || '',
        years: Array.isArray(row.y) ? row.y.map(String) : [],
      }));
    return NextResponse.json({ vehicles: matches }, { headers: { 'Cache-Control': 'private, max-age=30' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar el catálogo.' }, { status: 500 });
  }
}
