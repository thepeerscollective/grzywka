'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ADDRESS, HOURS, PHONE, TEL, img } from '@/lib/data';

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
  useEffect(() => { setMobile(window.matchMedia('(pointer: coarse)').matches); }, []);
  const inner = (
    <>
      <span className="glow" aria-hidden />
      <img src={img('flip-phone')} alt="" width={64} height={96} />
      <span className="label">call the salon</span>
    </>
  );
  return mobile
    ? <a href={TEL} className="flip" aria-label={`call the salon, ${PHONE}`}>{inner}</a>
    : <Link href="/book/#call" className="flip" aria-label={`call the salon, ${PHONE}`}>{inner}</Link>;
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
    const src = img('sparkle');
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
  return <img src={img('sparkle')} alt="" className="twinkle" style={style} />;
}
