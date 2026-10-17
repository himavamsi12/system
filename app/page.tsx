import type { Metadata } from 'next';
import Script from 'next/script';
import { html } from './content';
import './page.css';

export const metadata: Metadata = {
  title: "Concept Lab",
  description: "12 animated 3D explainers, one for every core system design topic, scene by scene.",
  
  openGraph: { title: "Concept Lab", description: "12 animated 3D explainers, one for every core system design topic, scene by scene.", type: 'website' },
};

const Page = () => (
  <>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    <Script src="/legacy/notes.js" strategy="afterInteractive" />
    <Script src="/legacy/videos.js" strategy="afterInteractive" />
  </>
);

export default Page;
