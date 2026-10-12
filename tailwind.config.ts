import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { qualitas: { purple: '#941B80', aqua: '#0096AE', ink: '#25232A', muted: '#62616A', surface: '#F7F8FA', border: '#E4E5E9' } }, boxShadow: { soft: '0 18px 60px rgba(47,38,53,.10)' } } }, plugins: [] };
export default config;
