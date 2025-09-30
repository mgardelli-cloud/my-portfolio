import type React from "react"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Marco Gardelli - Portfolio',
  description: 'senior Technical Specialist in Industrial Automation and Traceability',
  keywords: ['Industrial Automation', 'Traceability', 'Auto-ID', 'RFID', 'Print & Apply'],
  authors: [{ name: 'Marco Gardelli' }],
  creator: 'Marco Gardelli',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'Marco Gardelli - Portfolio',
    description: 'senior Technical Specialist in Industrial Automation and Traceability',
    siteName: 'Marco Gardelli',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marco Gardelli - Portfolio',
    description: 'senior Technical Specialist in Industrial Automation and Traceability',
    creator: '@yourtwitter',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
