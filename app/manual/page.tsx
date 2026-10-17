import type { Metadata } from 'next';
import Script from 'next/script';
import { html } from './content';
import './page.css';

export const metadata: Metadata = {
  title: "Field Manual · Concept Lab",
  description: "The 12 building blocks of system design with diagrams, tools, failure modes and interview questions.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23d9531e'/%3E%3Cpath d='M16 6l9 5v10l-9 5-9-5V11z M7 11l9 5 9-5 M16 16v10' fill='none' stroke='white' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E" },
  openGraph: { title: "Field Manual · Concept Lab", description: "The 12 building blocks of system design with diagrams, tools, failure modes and interview questions.", type: 'website' },
};

const Page = () => (
  <>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    <Script src="/legacy/manual.js" strategy="afterInteractive" />
  </>
);

export default Page;
