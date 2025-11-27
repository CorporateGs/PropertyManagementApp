
import { Metadata } from 'next';
import { TenantPortal } from '@/components/advanced/tenant-portal';

export const metadata: Metadata = {
  title: 'Tenant Portal | PropertyHub Pro',
  description: 'Tenant self-service portal',
};

export default function TenantPortalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TenantPortal />
    </div>
  );
}

