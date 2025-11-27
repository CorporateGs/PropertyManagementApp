import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import AppLayout from "@/components/layout/app-layout";
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AppLayout>
              {children}
            </AppLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
