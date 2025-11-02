
'use client';

import { I18nProvider } from '@/lib/i18n/context';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </I18nProvider>
  );
}

