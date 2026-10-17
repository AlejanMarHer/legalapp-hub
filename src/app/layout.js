import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import './globals.css';

export const metadata = {
  title: 'LitisApp',
  description: 'Tu ecosistema de cálculo y gestión procesal.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}