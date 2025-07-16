import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from './providers/SessionProvider';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ttabook | Ttabook',
  description: '공간 예약 시스템',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
