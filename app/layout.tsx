import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import AppFooter from './AppFooter';
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
    <html lang="en" data-animation="on" data-ambient="on" suppressHydrationWarning className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
      <body>
        <AppPreferencesProvider>
          <AppToastProvider>
            <ChunkLoadRecovery />
            <ReleaseUpdateModal />
            <TerminalSidebarProvider>
              <AppTopBar />
              <AppShell>{children}</AppShell>
              <AppFooter />
            </TerminalSidebarProvider>
          </AppToastProvider>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
