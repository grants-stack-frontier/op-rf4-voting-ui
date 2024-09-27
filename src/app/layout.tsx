import { BallotProvider } from '@/components/ballot/provider';
import { BallotRound5Provider } from '@/components/ballot/provider5';
import { BudgetProvider } from '@/components/budget/provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import '@rainbow-me/rainbowkit/styles.css';
import { Inter } from 'next/font/google';
import { ClientLayout } from './client-layout';
import './globals.css';
import { metadata } from './layout-metadata';
import { Provider } from './providers';

export { metadata };

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon-32x32.png" sizes="any" />
      <body
        className={cn(
          'min-h-screen bg-background antialiased',
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            <BallotRound5Provider>
              <BallotProvider>
                <BudgetProvider>
                  <ClientLayout>{children}</ClientLayout>
                </BudgetProvider>
              </BallotProvider>
            </BallotRound5Provider>
          </Provider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
