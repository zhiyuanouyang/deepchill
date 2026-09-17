import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Indie & Open Source Product Directory',
  description:
    'A curated directory and launchpad for indie makers and open-source developers to showcase projects, boost visibility, and earn SEO backlinks.',
  keywords: [
    'indie makers',
    'open source',
    'developer tools',
    'backlinks',
    'SEO',
    'indie hackers',
    'directory',
    'SaaS',
  ],
  authors: [{ name: 'Deepchill Directory' }],
  openGraph: {
    title: 'Indie & Open Source Product Directory',
    description:
      'A curated directory and launchpad for indie makers and open-source developers to showcase projects, boost visibility, and earn SEO backlinks.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Indie & Open Source Product Directory',
    description:
      'A curated directory and launchpad for indie makers and open-source developers to showcase projects, boost visibility, and earn SEO backlinks.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="min-h-screen antialiased bg-[#f8fafc] text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
