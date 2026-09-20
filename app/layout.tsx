import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

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

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('deepchill_theme');
      var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased bg-[#f8fafc] text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-250">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
