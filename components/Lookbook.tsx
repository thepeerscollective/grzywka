'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LOOKS, img } from '@/lib/data';

const N = LOOKS.length;
const pad = (n: number) => String(n).padStart(2, '0');

export default function Lookbook() {
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [desk, setDesk] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px) and (min-height: 600px)');
    const f = () => setDesk(mq.matches);
    f(); mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);

  // desktop: vertical scroll flips the pages sideways
  useEffect(() => {
    if (!desk) { if (track.current) { track.current.style.transform = ''; [...track.current.children].forEach((c) => ((c as HTMLElement).style.transform = '')); } return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const s = scroller.current, t = track.current;
      if (!s || !t) return;
      const r = s.getBoundingClientRect();
      const span = s.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      const pos = p * (N - 1);
      t.style.transform = `translateX(${-pos * 100}%)`;
      if (!reduce) [...t.children].forEach((c, k) => {
        const o = Math.max(-1, Math.min(1, k - pos));
        (c as HTMLElement).style.transform = `perspective(1800px) rotateY(${o * -9}deg) scale(${1 - Math.abs(o) * .05})`;
      });
      setI(Math.round(pos));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [desk]);

  // mobile: native swipe
  const onTrackScroll = () => {
    if (desk || !track.current) return;
    setI(Math.round(track.current.scrollLeft / track.current.clientWidth));
  };

  const go = useCallback((k: number) => {
    k = Math.max(0, Math.min(N - 1, k));
    const s = scroller.current, t = track.current;
    if (!s || !t) return;
    if (desk) {
      const top = s.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (k / (N - 1)) * (s.offsetHeight - window.innerHeight) + 1, behavior: 'smooth' });
    } else {
      s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      t.scrollTo({ left: k * t.clientWidth, behavior: 'smooth' });
    }
  }, [desk]);

  useEffect(() => {
    const f = (e: Event) => go((e as CustomEvent<number>).detail);
    window.addEventListener('gz-goto', f);
    return () => window.removeEventListener('gz-goto', f);
  }, [go]);

  return (
    <section id="lookbook" className="lookbook" aria-roledescription="carousel" aria-label="the lookbook">
      <div ref={scroller} className="lb-scroller" style={{ height: desk ? `${N * 100}vh` : undefined }}>
        <div className="lb-sticky">
          <div className="lb-head">
            <p className="label" style={{ margin: 0 }}>the looks · {desk ? 'scroll to flip' : 'swipe'} · <span aria-live="polite">{pad(i + 1)} / {pad(N)}</span></p>
            <div className="arrows">
              <button className="pill chrome" onClick={() => go(i - 1)} disabled={i === 0} aria-label="previous look">←</button>
              <button className="pill chrome" onClick={() => go(i + 1)} disabled={i === N - 1} aria-label="next look">→</button>
            </div>
          </div>
          <div ref={track} className="lb-track" onScroll={onTrackScroll}>
            {LOOKS.map((l, k) => (
              <article key={l.slug} className={`spread ${k % 2 ? 'mirror' : ''}`} aria-roledescription="slide" aria-label={`${k + 1} of ${N}: ${l.name}`}>
                <div className="sp-photo">
                  <img className="main" src={img(l.slug)} alt={`${l.name}: ${l.line}`} loading={k < 2 ? 'eager' : 'lazy'} />
                </div>
                <div className="sp-page">
                  <p className="label folio">lookbook aw26 · p.{pad(4 + k * 2)}</p>
                  <figure className="sp-detail" style={{ margin: 0 }}>
                    <img src={img(l.slug + '-detail')} alt={`close up: ${l.detail}`} loading="lazy" />
                    <figcaption className="label">{l.detail}</figcaption>
                  </figure>
                  <h2 className={`display sp-name ${l.name.length > 10 ? 'long' : ''}`}><Link href={`/looks/${l.slug}/`}>{l.name}</Link></h2>
                  <p className="sp-line">{l.line}</p>
                  <p className="label sp-meta"><span>time {l.time}</span><span>from {l.from} zł</span><span>{l.every}</span></p>
                  <div className="sp-cta">
                    <Link className="pill hot" href={`/book/?look=${l.slug}`}>book {l.name}</Link>
                    <Link className="pill chrome" href={`/looks/${l.slug}/`}>front, detail, back →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
