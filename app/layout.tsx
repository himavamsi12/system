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
  <html lang="en" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('sd-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-theme-toggle]');if(!b)return;var v=b.getAttribute('data-theme-toggle'),r=document.documentElement;if(v==='flip')v=r.dataset.theme==='dark'?'light':'dark';r.dataset.theme=v;try{localStorage.setItem('sd-theme',v)}catch(x){}})})();" }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={fontsHref} />
    </head>
    <body>{children}</body>
  </html>
);

export default RootLayout;
