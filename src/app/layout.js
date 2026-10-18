import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: 'LitisApp | Ecosistema legal inteligente',
  description:
    'Tu ecosistema de cálculo y gestión procesal: liquidador de intereses, abonos masivos y reportes PDF para abogados en Colombia.',
};

export const viewport = {
  themeColor: '#050b18',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
