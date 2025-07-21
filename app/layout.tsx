import './globals.css';
import { SessionProvider } from './providers/SessionProvider';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { Metadata } from 'next';
import ToastContainer from '@/app/components/ToastContainer';

export const metadata: Metadata = {
  title: 'ttabook | Ttabook',
  description: '공간 예약 시스템',
  openGraph: {
    title: 'Ttabook',
    url: 'https://ttabook.vercel.app/',
    images: '/ttabook-basic.png',
    description: '예약을 Ttabook, 간편한 공간 예약 시스템.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          <SessionProvider>
            {children}
            <ToastContainer />
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
