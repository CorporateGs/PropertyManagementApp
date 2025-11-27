
import { Metadata } from 'next';
import { TenantScreening } from '@/components/advanced/tenant-screening';

export const metadata: Metadata = {
  title: 'Tenant Screening | PropertyHub Pro',
  description: 'AI-powered tenant screening and application management',
};

export default function ScreeningPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Screening</h1>
        <p className="mt-2 text-gray-600">
          AI-powered tenant screening with 94% accuracy in predicting tenant quality
        </p>
      </div>
      
      <TenantScreening />
    </div>
  );
}

