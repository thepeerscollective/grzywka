'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { img } from '@/lib/data';
import { Glitter, Twinkle } from './chrome';

type P = { x: number; y: number };
type Strand = { x: number; y: number; r: number; d: number; dx: number; len: number; c: number };

/** the cover is the before. drag across with the scissors; the top falls away and the after is underneath. */
export default function Cover() {
  const box = useRef<HTMLDivElement>(null);
  const [pts, setPts] = useState<P[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [cut, setCut] = useState<null | { top: string; bottom: string }>(null);
  const [falling, setFalling] = useState(false);
  const [strands, setStrands] = useState<Strand[]>([]);
  const [cur, setCur] = useState<P | null>(null);
  const [fine, setFine] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine)').matches);
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const rel = (e: React.PointerEvent): P => {
    const r = box.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  const doCut = useCallback((path: P[]) => {
    const s = [...path].sort((a, b) => a.x - b.x);
    // smooth + thin the path a bit
    const line = s.filter((_, i) => i % 2 === 0 || i === s.length - 1);
    const first = line[0], last = line[line.length - 1];
    const edge = [{ x: 0, y: first.y }, ...line, { x: 100, y: last.y }];
    const pts = edge.map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`);
    const top = `polygon(0% 0%, 100% 0%, ${[...pts].reverse().join(', ')})`;
    const bottom = `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`;
    setCut({ top, bottom });
    // strands of hair that drop off the line
    const st: Strand[] = Array.from({ length: 26 }, (_, i) => {
      const p = edge[1 + Math.floor((i / 26) * (edge.length - 2))] ?? first;
      return { x: p.x + (Math.random() - .5) * 6, y: p.y, r: (Math.random() - .5) * 120, d: .9 + Math.random() * .9, dx: (Math.random() - .5) * 40, len: 26 + Math.random() * 50, c: Math.random() };
    });
    setStrands(st);
    requestAnimationFrame(() => requestAnimationFrame(() => setFalling(true)));
  }, []);

  const down = (e: React.PointerEvent) => {
    if (cut || (e.target as HTMLElement).closest('a,button')) return;
    setDrawing(true);
    setPts([rel(e)]);
  };
  const move = (e: React.PointerEvent) => {
    const p = rel(e);
    setCur(p);
    if (!drawing) return;
    setPts((a) => (a.length && Math.hypot(a[a.length - 1].x - p.x, a[a.length - 1].y - p.y) < .8 ? a : [...a, p]));
  };
  const up = () => {
    if (!drawing) return;
    setDrawing(false);
    const xs = pts.map((p) => p.x);
    if (pts.length > 3 && Math.max(...xs) - Math.min(...xs) > 45) doCut(pts);
    else setPts([]);
  };
  const auto = () => doCut(Array.from({ length: 24 }, (_, i) => ({ x: (i / 23) * 100, y: 31 + Math.sin(i * 1.3) * .8 })));
  const reset = () => { setCut(null); setFalling(false); setPts([]); setStrands([]); };

  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

  return (
    <section className={`cover ${fine && !cut ? 'scissor-cursor' : ''}`} aria-labelledby="cover-title">
      <div
        ref={box}
        className="cover-stage"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => { setDrawing(false); setPts([]); }}
        onPointerLeave={() => { setCur(null); if (drawing) up(); }}
      >
        <picture className="layer after">
          <source media="(max-width: 760px)" srcSet={img('cover-after-m')} />
          <img src={img('cover-after')} alt="a girl laughing on a rhinestone flip phone against a hot pink wall, her fringe freshly cut to just above the brows" />
        </picture>
        {!cut && (
          <picture className="layer before">
            <source media="(max-width: 760px)" srcSet={img('cover-before-m')} />
            <img src={img('cover-before')} alt="" />
          </picture>
        )}
        {cut && (
          <>
            <picture className={`layer before piece bottom ${falling ? 'gone' : ''}`} style={{ clipPath: cut.bottom }} aria-hidden>
              <source media="(max-width: 760px)" srcSet={img('cover-before-m')} />
              <img src={img('cover-before')} alt="" />
            </picture>
            <picture className={`layer before piece top ${falling ? 'fall' : ''}`} style={{ clipPath: cut.top }} aria-hidden>
              <source media="(max-width: 760px)" srcSet={img('cover-before-m')} />
              <img src={img('cover-before')} alt="" />
            </picture>
            {!reduce && (
              <svg className="strands" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {strands.map((s, i) => (
                  <path key={i} d={`M${s.x} ${s.y} q ${s.dx / 30} ${s.len / 12} ${s.dx / 20} ${s.len / 6}`} stroke={s.c > .6 ? '#4a2c1c' : '#2a1810'} strokeWidth={s.c > .5 ? .9 : .6} vectorEffect="non-scaling-stroke" fill="none"
                    style={{ transformOrigin: `${s.x}% ${s.y}%`, ['--r' as string]: `${s.r}deg`, ['--dx' as string]: `${s.dx}px`, animationDuration: `${s.d}s` }} className={falling ? 'drop' : ''} />
                ))}
              </svg>
            )}
          </>
        )}

        {/* the drag line */}
        {!cut && pts.length > 1 && (
          <svg className="cutline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={d} />
          </svg>
        )}
        {fine && !cut && cur && (
          <span className={`scissors ${drawing ? 'snip' : ''}`} style={{ left: `${cur.x}%`, top: `${cur.y}%` }} aria-hidden>
            <svg viewBox="0 0 64 64"><defs><linearGradient id="chr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor="#8f95a3" /><stop offset=".6" stopColor="#f3f4f7" /><stop offset="1" stopColor="#a9aebb" /></linearGradient></defs>
              <g className="blade a"><path d="M32 30 L60 18 L58 22 L34 33 Z" fill="url(#chr)" stroke="#555a66" strokeWidth=".8" /><circle cx="14" cy="22" r="9" fill="none" stroke="url(#chr)" strokeWidth="5" /><path d="M21 26 L32 30" stroke="url(#chr)" strokeWidth="5" /></g>
              <g className="blade b"><path d="M32 34 L60 46 L58 42 L34 31 Z" fill="url(#chr)" stroke="#555a66" strokeWidth=".8" /><circle cx="14" cy="42" r="9" fill="none" stroke="url(#chr)" strokeWidth="5" /><path d="M21 38 L32 34" stroke="url(#chr)" strokeWidth="5" /></g>
              <circle cx="32" cy="32" r="2.6" fill="#ff3ea5" /></svg>
          </span>
        )}
      </div>

      <div className="cover-ui">
        <div className="mark">
          <div className="ringwrap">
            <h1 id="cover-title" className="wordmark chrome-text">grzywka</h1>
            <span className="ring" aria-hidden />
          </div>
          <p className="label coverline">lookbook · aw26 · 10 looks · warszawa</p>
        </div>

        {!cut ? (
          <div className="hint">
            <p className="label"><span aria-hidden>✂ </span>{fine ? 'drag across her fringe · cut it' : 'swipe across her fringe · cut it'}</p>
            <button className="pill chrome" onClick={auto}>or cut it for me</button>
          </div>
        ) : (
          <div className={`after-card ${falling ? 'in' : ''}`} role="status">
            <p className="label pink">the fringe · trimmed to the brows</p>
            <p className="display">much better.</p>
            <p>fringe trims between cuts are free, always. walk in, or book ten minutes.</p>
            <div className="row">
              <Link className="pill hot" href="/book/?look=fringe">book a fringe trim</Link>
              <button className="pill chrome" onClick={reset}>grow it back</button>
            </div>
          </div>
        )}

        {!cut ? <Glitter word="iconic" className="cover-word" /> : <Glitter word="new-cut" className={`cover-word landed ${falling ? 'in' : ''}`} />}
        <Twinkle style={{ left: '12%', top: '46%' }} />
        <Twinkle style={{ left: '84%', top: '58%', animationDelay: '.7s' }} />
        <Twinkle style={{ left: '22%', top: '78%', animationDelay: '1.3s', width: 18, height: 18 }} />

        <a className="pill chrome open-book" href="#lookbook">open the lookbook ↓</a>
      </div>
    </section>
  );
}
