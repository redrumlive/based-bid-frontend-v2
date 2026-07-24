import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import AppFooter from './AppFooter';
import MobileActionBar from './MobileActionBar';
import { AppPreferencesProvider } from './AppPreferences';
import AppShell from './AppShell';
import AppTopBar from './AppTopBar';
import { AppToastProvider } from './AppToast';
import ChunkLoadRecovery from './ChunkLoadRecovery';
import ReleaseUpdateModal from './ReleaseUpdateModal';
import { TerminalSidebarProvider } from './TerminalSidebarContext';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
});

export const metadata: Metadata = {
  title: 'based bid',
  description: 'Discover, create, and launch tokens on based bid.',
  icons: {
    icon: [
      {
        url: 'https://www.based.bid/favicon.ico?favicon.3ttdf_seagcqi.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        url: 'https://www.based.bid/icon.png?icon.27dn9yu6429ed.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: {
      url: 'https://www.based.bid/favicon.ico?favicon.3ttdf_seagcqi.ico',
      type: 'image/x-icon',
    },
    apple: {
      url: 'https://www.based.bid/apple-icon.png?apple-icon.0h7ewvd6e0-xt.png',
      sizes: '200x200',
      type: 'image/png',
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-animation="on" data-ambient="on" suppressHydrationWarning className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
      <body>
        <AppPreferencesProvider>
          <AppToastProvider>
            <ChunkLoadRecovery />
            <ReleaseUpdateModal />
            <TerminalSidebarProvider>
              <AppTopBar />
              <AppShell>{children}</AppShell>
              <MobileActionBar />
              <AppFooter />
            </TerminalSidebarProvider>
          </AppToastProvider>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
