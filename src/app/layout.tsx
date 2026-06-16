import type { Metadata } from 'next';
import { Providers } from '@/components/layout/providers';
import { AdScriptInjector } from '@/components/admin/ad-script-injector';
import './globals.css';

export const metadata: Metadata = {
  title: 'BranchBoard – Visual Version Control',
  description:
    'Collaborative whiteboard with Git-like branching, merging, and visual diff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <AdScriptInjector />
        </Providers>
      </body>
    </html>
  );
}