'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { img } from '@/lib/data';
import { Glitter, Twinkle } from './chrome';

type P = { x: number; y: number };
type Strand = { x: number; y: number; r: number; d: number; dx: number; len: number; c: number };

/**
 * where her fringe sits, in % of each photo.
 * cut = where the "after" fringe ends (the brows). ends = the long ends that get cut off.
 */
const FRINGE = {
  d: { w: 1672, h: 941, pos: [60, 30], x0: 50.3, x1: 66.2, top: 17, cut: 27.5,
    ends: [[50.3, 33], [52.5, 35.5], [55, 37], [57.5, 38], [60, 37.6], [62.5, 36.2], [64.5, 34], [66.2, 31]] },
  m: { w: 941, h: 1672, pos: [50, 30], x0: 27, x1: 66, top: 37, cut: 45,
    ends: [[27, 47.5], [31, 50], [36, 51.5], [42, 52.2], [48, 52], [54, 51], [60, 49], [66, 46]] },
};

export default function Cover() {
  const box = useRef<HTMLDivElement>(null);
  const [pts, setPts] = useState<P[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [piece, setPiece] = useState<string | null>(null);
  const [falling, setFalling] = useState(false);
  const [strands, setStrands] = useState<Strand[]>([]);
  const [cur, setCur] = useState<P | null>(null);
  const [fine, setFine] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [geo, setGeo] = useState<null | { x0: number; x1: number; top: number; cut: number; ends: P[] }>(null);

  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine)').matches);
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // map the fringe from photo % to stage % (the photo is object-fit: cover)
  useEffect(() => {
    const calc = () => {
      const el = box.current; if (!el) return;
      const W = el.clientWidth, H = el.clientHeight;
      const f = window.matchMedia('(max-width: 760px)').matches ? FRINGE.m : FRINGE.d;
      const s = Math.max(W / f.w, H / f.h);
      const rw = f.w * s, rh = f.h * s;
      const ox = (W - rw) * (f.pos[0] / 100), oy = (H - rh) * (f.pos[1] / 100);
      const X = (x: number) => ((ox + (x / 100) * rw) / W) * 100;
      const Y = (y: number) => ((oy + (y / 100) * rh) / H) * 100;
      setGeo({ x0: X(f.x0), x1: X(f.x1), top: Y(f.top), cut: Y(f.cut), ends: f.ends.map(([x, y]) => ({ x: X(x), y: Y(y) })) });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const rel = (e: React.PointerEvent): P => {
    const r = box.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  /** cut along the path, but only the fringe: the long ends below the line drop off */
  const doCut = useCallback((path: P[]) => {
    if (!geo) return;
    const { x0, x1, cut, ends } = geo;
    const band = (cut - geo.top) * .45;
    const yAt = (x: number) => {
      const near = path.filter((p) => Math.abs(p.x - x) < (x1 - x0) / 6);
      const y = near.length ? near.reduce((a, p) => a + p.y, 0) / near.length : cut;
      return Math.max(cut - band, Math.min(cut + band * .6, y));
    };
    const steps = 12;
    const topEdge = Array.from({ length: steps + 1 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / steps;
      return { x, y: yAt(x) + (i % 2 ? .35 : -.2) }; // a little jagged, like scissors
    });
    const poly = [...topEdge, ...[...ends].reverse()].map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(', ');
    setPiece(`polygon(${poly})`);
    setStrands(Array.from({ length: 30 }, (_, i) => {
      const p = topEdge[Math.floor((i / 30) * topEdge.length)];
      return { x: p.x + (Math.random() - .5) * 1.5, y: p.y, r: (Math.random() - .5) * 140, d: 1 + Math.random() * .9, dx: (Math.random() - .5) * 60, len: 18 + Math.random() * 40, c: Math.random() };
    }));
    setPts([]);
    requestAnimationFrame(() => requestAnimationFrame(() => setFalling(true)));
  }, [geo]);

  const down = (e: React.PointerEvent) => {
    if (piece || (e.target as HTMLElement).closest('a,button')) return;
    setDrawing(true); setNudge(false);
    setPts([rel(e)]);
  };
  const move = (e: React.PointerEvent) => {
    const p = rel(e);
    setCur(p);
    if (!drawing) return;
    setPts((a) => (a.length && Math.hypot(a[a.length - 1].x - p.x, a[a.length - 1].y - p.y) < .6 ? a : [...a, p]));
  };
  const up = () => {
    if (!drawing) return;
    setDrawing(false);
    if (!geo) return;
    // did the scissors actually go across the fringe?
    const { x0, x1, top } = geo;
    const bottom = Math.max(...geo.ends.map((p) => p.y));
    const inside = pts.filter((p) => p.x >= x0 && p.x <= x1 && p.y >= top - 2 && p.y <= bottom + 2);
    const span = inside.length ? Math.max(...inside.map((p) => p.x)) - Math.min(...inside.map((p) => p.x)) : 0;
    if (span > (x1 - x0) * .5) doCut(pts);
    else { setPts([]); setNudge(true); setTimeout(() => setNudge(false), 2600); }
  };
  const auto = () => geo && doCut([{ x: geo.x0, y: geo.cut }, { x: geo.x1, y: geo.cut }]);
  const reset = () => { setPiece(null); setFalling(false); setPts([]); setStrands([]); };

  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

  return (
    <section className={`cover ${fine && !piece ? 'scissor-cursor' : ''}`} aria-labelledby="cover-title">
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
        <picture className={`layer before ${piece ? 'swap' : ''}`} aria-hidden={!!piece}>
          <source media="(max-width: 760px)" srcSet={img('cover-before-m')} />
          <img src={img('cover-before')} alt="" />
        </picture>
        {piece && (
          <picture className={`layer piece ${falling ? 'fall' : ''}`} style={{ clipPath: piece, transformOrigin: `${geo ? (geo.x0 + geo.x1) / 2 : 50}% ${geo?.cut ?? 30}%` }} aria-hidden>
            <source media="(max-width: 760px)" srcSet={img('cover-before-m')} />
            <img src={img('cover-before')} alt="" />
          </picture>
        )}
        {piece && !reduce && (
          <svg className="strands" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {strands.map((s, i) => (
              <path key={i} d={`M${s.x} ${s.y} q ${s.dx / 60} ${s.len / 14} ${s.dx / 40} ${s.len / 7}`} stroke={s.c > .6 ? '#5a3522' : '#2a1810'} strokeWidth={s.c > .5 ? 1 : .7} vectorEffect="non-scaling-stroke" fill="none"
                style={{ transformOrigin: `${s.x}% ${s.y}%`, ['--r' as string]: `${s.r}deg`, ['--dx' as string]: `${s.dx}px`, animationDuration: `${s.d}s` }} className={falling ? 'drop' : ''} />
            ))}
          </svg>
        )}

        {/* where to cut: a dashed guide right at her brows */}
        {!piece && geo && !drawing && (
          <svg className="guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={`M${geo.x0} ${geo.cut} L${geo.x1} ${geo.cut}`} />
          </svg>
        )}
        {!piece && pts.length > 1 && (
          <svg className="cutline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={d} />
          </svg>
        )}
        {fine && !piece && cur && (
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

        {!piece ? (
          <div className="hint">
            <p className="label" role="status">
              {nudge ? 'almost. go across her fringe, along the dotted line' : <><span aria-hidden>✂ </span>{fine ? 'drag the scissors across her fringe' : 'swipe across her fringe'}</>}
            </p>
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

        {!piece ? <Glitter word="iconic" className="cover-word" /> : <Glitter word="new-cut" className={`cover-word landed ${falling ? 'in' : ''}`} />}
        <Twinkle style={{ left: '12%', top: '62%' }} />
        <Twinkle style={{ left: '84%', top: '58%', animationDelay: '.7s' }} />
        <Twinkle style={{ left: '34%', top: '80%', animationDelay: '1.3s', width: 18, height: 18 }} />

        <a className="pill chrome open-book" href="#lookbook">open the lookbook ↓</a>
      </div>
    </section>
  );
}
