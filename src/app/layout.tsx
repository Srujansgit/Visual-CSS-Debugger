import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';

import '@/styles/globals.css';

const fontSans = Work_Sans({
  subsets: ['latin'],
  preload: true,
});

export const metadata: Metadata = {
  title: 'VisualCSS',
  description: 'A Live Code Editor to visualize HTML/CSS development.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    title: 'VisualCSS',
    description: 'A Live Code Editor to visualize HTML/CSS development.',
    url: 'https://visualcss.abhigyantrips.dev',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.className} bg-background m-0 h-screen w-screen overflow-hidden p-0`}
      >
        {children}
      </body>
    </html>
  );
}
