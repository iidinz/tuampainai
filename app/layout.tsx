import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TuamPaiNai — ท่วมไปไหน',
  description:
    'การประเมินหลังคาเรือนที่ได้รับผลกระทบจากน้ำท่วมในหาดใหญ่ ด้วยภาพ SAR และ Building Footprints',
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
