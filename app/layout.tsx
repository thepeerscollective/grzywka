import type { Metadata, Viewport } from 'next';
import '@fontsource/michroma/400.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource/schibsted-grotesk/500.css';
import '@fontsource/schibsted-grotesk/700.css';
import './globals.css';
import { FlipPhone, Footer, Header, Loader, SparkleTrail } from '@/components/chrome';
import { BASE } from '@/lib/data';

export const metadata: Metadata = {
  metadataBase: new URL('https://thepeerscollective.github.io'),
  title: { default: 'grzywka · hair salon, warszawa', template: '%s · grzywka' },
  description: 'a hair salon on hoża, open till 23:00. ten looks, fringe trims free forever, and a blow-dry for when you decide to go out at 22:00.',
  icons: { icon: `${BASE}/favicon.svg` },
  openGraph: { title: 'grzywka · hair salon, warszawa', description: 'the lookbook. cut the fringe yourself.', images: [`${BASE}/og.jpg`] },
};
export const viewport: Viewport = { themeColor: '#ff3ea5', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">skip to content</a>
        <Loader />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <FlipPhone />
        <SparkleTrail />
      </body>
    </html>
  );
}
