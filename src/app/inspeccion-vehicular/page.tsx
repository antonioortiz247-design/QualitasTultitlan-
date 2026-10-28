import type { Metadata } from 'next';
import InspectionForm from '@/components/InspectionForm';

export const metadata: Metadata = {
  title: 'Inspección vehicular',
  description: 'Envía la información y las fotografías de tu automóvil o motocicleta para revisión de inspección vehicular.',
  robots: { index: false, follow: false },
};

export default function InspectionPage() {
  return <InspectionForm />;
}
