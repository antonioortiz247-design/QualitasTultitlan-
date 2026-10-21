import type { Metadata } from 'next';
import QualitasVehicleViewer from '@/components/QualitasVehicleViewer';

export const metadata: Metadata = {
  title: 'Vehículo 3D Quálitas',
  description: 'Visor interactivo del Toyota Prius con identidad visual de Quálitas.',
  robots: { index: false, follow: false },
};

export default function Vehicle3DPage() {
  return <QualitasVehicleViewer />;
}
