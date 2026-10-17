import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import './site.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: { icon: '/brand/favicon-32.png', apple: '/brand/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fafafa',
};

const fontsHref =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap';

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={fontsHref} />
    </head>
    <body>{children}</body>
  </html>
);

export default RootLayout;
