import { Buffer } from 'buffer';

type GpsCoordinates = { latitude: number; longitude: number };

function readExifGps(buffer: Buffer): GpsCoordinates | null {
  try {
    if (buffer.length < 12 || buffer.readUInt16BE(0) !== 0xffd8) return null;
    let offset = 2;
    while (offset + 4 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > buffer.length) break;
      if (marker === 0xe1 && buffer.toString('ascii', offset + 4, offset + 10) === 'Exif\0\0') {
        const tiff = offset + 10;
        const little = buffer.toString('ascii', tiff, tiff + 2) === 'II';
        const u16 = (p: number) => little ? buffer.readUInt16LE(p) : buffer.readUInt16BE(p);
        const u32 = (p: number) => little ? buffer.readUInt32LE(p) : buffer.readUInt32BE(p);
        if (u16(tiff + 2) !== 42) return null;
        const ifd0 = tiff + u32(tiff + 4);
        const count = u16(ifd0);
        let gpsOffset = 0;
        for (let i = 0; i < count; i++) {
          const entry = ifd0 + 2 + i * 12;
          if (entry + 12 > buffer.length) return null;
          if (u16(entry) === 0x8825) gpsOffset = u32(entry + 8);
        }
        if (!gpsOffset) return null;
        const gpsIfd = tiff + gpsOffset;
        const gpsCount = u16(gpsIfd);
        let latRef = '', lonRef = '', latValues = 0, lonValues = 0;
        for (let i = 0; i < gpsCount; i++) {
          const entry = gpsIfd + 2 + i * 12;
          if (entry + 12 > buffer.length) return null;
          const tag = u16(entry), type = u16(entry + 2), n = u32(entry + 4);
          const valueOffset = n * (type === 5 ? 8 : type === 3 ? 2 : 1) <= 4 ? entry + 8 : tiff + u32(entry + 8);
          if (tag === 1) latRef = buffer.toString('ascii', valueOffset, valueOffset + 1);
          if (tag === 3) lonRef = buffer.toString('ascii', valueOffset, valueOffset + 1);
          if ((tag === 2 || tag === 4) && type === 5 && n >= 3) {
            const values = [0, 1, 2].map(j => {
              const p = valueOffset + j * 8;
              const denominator = u32(p + 4);
              return denominator ? u32(p) / denominator : 0;
            });
            const decimal = values[0] + values[1] / 60 + values[2] / 3600;
            if (tag === 2) latValues = decimal;
            else lonValues = decimal;
          }
        }
        if (!latValues || !lonValues || !['N', 'S'].includes(latRef) || !['E', 'W'].includes(lonRef)) return null;
        return { latitude: Number((latRef === 'S' ? -latValues : latValues).toFixed(7)), longitude: Number((lonRef === 'W' ? -lonValues : lonValues).toFixed(7)) };
      }
      offset += 2 + length;
    }
  } catch { return null; }
  return null;
}

export function extractJpegGps(buffer: Buffer): GpsCoordinates | null {
  return readExifGps(buffer);
}
