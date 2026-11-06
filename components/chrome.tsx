'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ADDRESS, HOURS, PHONE, TEL, img } from '@/lib/data';

/** a white four-point sparkle, the same one as on the cover */
export const STAR_URI = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="#fff" d="M10 0C10.8 7 13 9.2 20 10C13 10.8 10.8 13 10 20C9.2 13 7 10.8 0 10C7 9.2 9.2 7 10 0Z"/></svg>')}`;

const NAV = [['/#lookbook', 'lookbook'], ['/prices/', 'prices'], ['/prices/#team', 'the team'], ['/book/', 'book']] as const;

export function Header() {
  const path = usePathname();
  const home = path === '/';
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  return (
    <header className={`header ${home ? 'on-photo' : ''} ${path.startsWith('/looks/') ? 'logo-light' : ''} ${open ? 'open' : ''}`}>
      <Link href="/" className="logo" aria-label="grzywka, home">grzywka</Link>
      <nav id="nav" aria-label="main">
        {NAV.map(([h, l]) => (
          <Link key={l} href={h} onClick={() => setOpen(false)} aria-current={(h === '/prices/' && path === '/prices/') || (h === '/book/' && path === '/book/') ? 'page' : undefined}>{l}</Link>
        ))}
      </nav>
      <button className="pill chrome menu-btn" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'close' : 'menu'}</button>
    </header>
  );
}

export function FlipPhone() {
  const [mobile, setMobile] = useState(false);
  const [away, setAway] = useState(false);
  const path = usePathname();
  useEffect(() => { setMobile(window.matchMedia('(pointer: coarse)').matches); }, []);
  // the cover already has its own button + barcode in that corner
  useEffect(() => {
    const c = document.querySelector('.cover');
    if (!c) { setAway(false); return; }
    const io = new IntersectionObserver(([e]) => setAway(e.intersectionRatio > .35), { threshold: [0, .35, 1] });
    io.observe(c);
    return () => io.disconnect();
  }, [path]);
  const inner = (
    <>
      <span className="glow" aria-hidden />
      <img src={img('flip-phone')} alt="" width={64} height={96} />
      <span className="label">call the salon</span>
    </>
  );
  return mobile
    ? <a href={TEL} className={`flip ${away ? 'away' : ''}`} aria-label={`call the salon, ${PHONE}`}>{inner}</a>
    : <Link href="/book/#call" className={`flip ${away ? 'away' : ''}`} aria-label={`call the salon, ${PHONE}`}>{inner}</Link>;
}

export function Loader() {
  const [state, setState] = useState<'on' | 'out' | 'gone'>('on');
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('gz-seen') === '1'; sessionStorage.setItem('gz-seen', '1'); } catch {}
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduce) { setState('gone'); return; }
    const a = setTimeout(() => setState('out'), 1300);
    const b = setTimeout(() => setState('gone'), 1850);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (state === 'gone') return null;
  return (
    <div className={`loader ${state === 'out' ? 'out' : ''}`} aria-hidden>
      <img src={img('silhouette')} alt="" width={520} height={520} />
      <span className="label">grzywka · loading the looks</span>
    </div>
  );
}

/** tiny rhinestones that follow the mouse. max 6 on screen. */
export function SparkleTrail() {
  const last = useRef(0);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const src = STAR_URI;
    const move = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last.current < 70) return;
      last.current = now;
      if (document.querySelectorAll('.trail').length >= 6) return;
      const i = document.createElement('img');
      i.src = src; i.className = 'trail'; i.alt = '';
      i.style.left = e.clientX + 'px'; i.style.top = e.clientY + 'px';
      document.body.appendChild(i);
      setTimeout(() => i.remove(), 720);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return null;
}

export function Footer() {
  return (
    <footer className="footer">
      <p className="big chrome-text" aria-hidden>grzywka</p>
      <div className="row">
        <p style={{ margin: 0 }}>{ADDRESS}<br />{HOURS}<br /><a href={TEL}>{PHONE}</a></p>
        <nav className="links" aria-label="footer">
          <Link className="pill chrome" href="/book/">book</Link>
          <Link className="pill chrome" href="/prices/">prices</Link>
          <Link className="pill chrome" href="/prices/#team">the team</Link>
          <a className="pill chrome" href="https://instagram.com/" target="_blank" rel="noreferrer">instagram</a>
        </nav>
      </div>
      <p className="small">concept site · not a real salon · all photos made for this concept · <Link href="/legal/" className="small">legal + accessibility</Link></p>
    </footer>
  );
}

export function Twinkle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg className="twinkle" viewBox="0 0 20 20" style={style} aria-hidden>
      <path d="M10 0C10.8 7 13 9.2 20 10C13 10.8 10.8 13 10 20C9.2 13 7 10.8 0 10C7 9.2 9.2 7 10 0Z" />
    </svg>
  );
}
