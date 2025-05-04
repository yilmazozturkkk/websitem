import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Keep Inter font
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const inter = Inter({ subsets: ['latin'] }); // Use Inter font

export const metadata: Metadata = {
  title: 'DietAI - Akıllı Diyet Asistanınız', // Update title to Turkish
  description: 'Yapay zeka destekli akıllı diyet asistanınız', // Update description to Turkish
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}

