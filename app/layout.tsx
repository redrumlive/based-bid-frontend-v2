import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import AppFooter from './AppFooter';
import AppTopBar from './AppTopBar';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

export const metadata: Metadata = {
  title: 'Based Bid',
  description: 'Discover, create, and launch tokens on Based Bid.',
  icons: {
    icon: '/brand-icon.svg',
    shortcut: '/brand-icon.svg',
    apple: '/brand-icon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
      <body>
        <AppTopBar />
        {children}
        <AppFooter />
      </body>
    </html>
  );
}
