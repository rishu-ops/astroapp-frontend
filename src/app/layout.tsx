import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NakshatraChat — Talk to Expert Astrologers Online',
  description: 'Connect with India\'s top verified astrologers for real-time chat consultations. Get guidance on love, career, health & life.',
  keywords: ['astrology', 'astrologer chat', 'online jyotish', 'kundli', 'horoscope', 'nakshatra'],
  openGraph: {
    title: 'NakshatraChat — Talk to Expert Astrologers Online',
    description: 'India\'s most trusted astrology platform. Chat with verified astrologers 24/7.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
