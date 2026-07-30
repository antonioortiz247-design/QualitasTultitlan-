import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { qualitas: { magenta: '#b0007a', purple: '#351044', teal: '#008f8b', ink: '#2f2635' } }, boxShadow: { soft: '0 18px 60px rgba(47,38,53,.10)' } } }, plugins: [] };
export default config;
