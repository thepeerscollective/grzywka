import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Glitter, Twinkle } from '@/components/chrome';
import { LOOKS, TEAM, img } from '@/lib/data';
import '../../pages.css';

export function generateStaticParams() { return LOOKS.map((l) => ({ slug: l.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = LOOKS.find((x) => x.slug === slug);
  return l ? { title: l.name, description: l.line } : {};
}

export default async function LookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = LOOKS.findIndex((x) => x.slug === slug);
  if (k < 0) notFound();
  const l = LOOKS[k];
  const next = LOOKS[(k + 1) % LOOKS.length];
  const more = [1, 2, 3, 4].map((d) => LOOKS[(k + d * 2 + 1) % LOOKS.length]);
  const who = TEAM.find((t) => t.slug === l.by)!;
  return (
    <>
      <section className="look">
        <div className="look-photo">
          <img className="main" src={img(l.slug)} alt={`${l.name}, front: ${l.line}`} />
          {l.word && <Glitter word={l.word} style={{ left: '5%', bottom: '6%', width: 'clamp(200px, 22vw, 320px)' }} />}
          <Twinkle style={{ right: '10%', top: '16%' }} />
        </div>
        <div className="look-text page-top">
          <p className="label grey">lookbook aw26 · p.{String(4 + k * 2).padStart(2, '0')} · look {k + 1} of {LOOKS.length}</p>
          <h1 className="display look-name">{l.name}</h1>
          <p className="look-line">{l.line}</p>
          <p className="label grey meta"><span>time {l.time}</span><span>from {l.from} zł</span><span>{l.every}</span></p>
          <div className="say">
            <p className="label pink">say this in the chair</p>
            <p>{l.say}</p>
          </div>
          <p className="by">usually cut by <Link href="/prices/#team">{who.name}</Link>, who will also tell you if it suits you. honestly.</p>
          <div className="row">
            <Link className="pill hot" href={`/book/?look=${l.slug}`}>book {l.name}</Link>
            <Link className="pill chrome" href={`/looks/${next.slug}/`}>next look: {next.name} →</Link>
          </div>
          <div className="pair">
            <figure><img src={img(l.slug + '-detail')} alt={`${l.name}, close up: ${l.detail}`} /><figcaption className="label">the detail · {l.detail}</figcaption></figure>
            <figure><img src={img(l.slug + '-back')} alt={`${l.name}, from the back`} loading="lazy" /><figcaption className="label">the back · show your stylist</figcaption></figure>
          </div>
        </div>
      </section>
      <section className="more" aria-labelledby="more-t">
        <h2 id="more-t" className="display">more looks like this</h2>
        <div className="more-grid">
          {more.map((m) => (
            <Link key={m.slug} href={`/looks/${m.slug}/`} className="more-card">
              <span className="ph"><img src={img(m.slug + '-sm')} alt="" loading="lazy" /></span>
              <span className="nm">{m.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
