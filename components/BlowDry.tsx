'use client';
import { useEffect, useRef, useState } from 'react';
import { img, media } from '@/lib/data';
import { Glitter, Twinkle } from './chrome';

const LOOP_FROM = 2.1;

/** hold anywhere on the section: the hair blows, glitter flies. let go and it settles back. */
export default function BlowDry() {
  const sec = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [hold, setHold] = useState(false);
  const holding = useRef(false);

  useEffect(() => {
    holding.current = hold;
    const v = vid.current;
    if (!v) return;
    if (hold) { v.playbackRate = 1; v.play().catch(() => {}); } else v.pause();
  }, [hold]);

  useEffect(() => {
    let raf = 0, last = performance.now(), spawnT = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const v = vid.current;
      if (v && v.duration) {
        if (holding.current) {
          if (v.currentTime > v.duration - .15) v.currentTime = LOOP_FROM;
          spawnT += dt;
          if (!reduce && spawnT > .08) { spawnT = 0; spawn(); }
        } else if (v.currentTime > 0) {
          v.currentTime = Math.max(0, v.currentTime - dt * 1.6);
        }
        if (bar.current) bar.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const spawn = () => {
    const s = sec.current, v = vid.current;
    if (!s || !v || s.querySelectorAll('.bd-particle').length > 40) return;
    const sr = s.getBoundingClientRect(), vr = v.getBoundingClientRect();
    const p = document.createElement('img');
    p.src = img('sparkle'); p.alt = ''; p.className = 'bd-particle';
    const x0 = vr.left - sr.left + vr.width * (.25 + Math.random() * .5);
    const y0 = vr.top - sr.top + vr.height * (.15 + Math.random() * .35);
    p.style.left = x0 + 'px'; p.style.top = y0 + 'px';
    p.style.setProperty('--x', `${120 + Math.random() * 380}px`);
    p.style.setProperty('--y', `${-80 - Math.random() * 260}px`);
    p.style.setProperty('--t', `${1.2 + Math.random() * 1.2}s`);
    const sz = 8 + Math.random() * 18; p.style.width = p.style.height = sz + 'px';
    s.appendChild(p);
    setTimeout(() => p.remove(), 2600);
  };

  const start = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    if (e.pointerType !== 'mouse') (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setHold(true);
  };
  const stop = () => setHold(false);

  return (
    <section
      ref={sec}
      className="blowdry"
      aria-labelledby="bd-title"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="grid">
        <div className="bd-video">
          <video ref={vid} poster={media('blowdry.jpg')} muted playsInline preload="auto" aria-label="a blonde girl on a white fluffy bed, her hair blowing up and sideways in a hair dryer, glitter in the air">
            <source src={media('blowdry.webm')} type="video/webm" />
            <source src={media('blowdry.mp4')} type="video/mp4" />
          </video>
          <span className="meter" aria-hidden><i ref={bar} /></span>
          <Glitter word="blow-dry" />
        </div>
        <div>
          <p className="label">★ the 22:00 blow-dry · 120 zł</p>
          <h2 id="bd-title" className="display">blow-dry</h2>
          <p>open till 23:00 because nobody decides to go out at 17:00. come in flat, leave like this. hold anywhere here, the hair goes, the glitter goes. let go and it settles back down.</p>
          <button
            className="pill chrome hold"
            aria-pressed={hold}
            onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); setHold(true); } }}
            onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') setHold(false); }}
            onBlur={stop}
          >
            {hold ? 'keep holding…' : 'hold to blow-dry'}
          </button>
        </div>
      </div>
      <Twinkle style={{ right: '8%', top: '12%' }} />
      <Twinkle style={{ right: '30%', top: '8%', animationDelay: '.8s', width: 18, height: 18 }} />
    </section>
  );
}
