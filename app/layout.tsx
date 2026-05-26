import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const siteTitle = 'TuamPaiNai — ท่วมไปไหน';
const siteDescription =
  'ระบบแผนที่ติดตามและวิเคราะห์พื้นที่น้ำท่วมจากข้อมูลดาวเทียม SAR พร้อมชั้นข้อมูลภูมิสารสนเทศประกอบการสำรวจพื้นที่';

export const metadata: Metadata = {
  metadataBase: new URL('https://tuampainai.vercel.app'),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: '/',
    siteName: 'TuamPaiNai',
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
