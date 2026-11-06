'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { img } from '@/lib/data';

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

/** where the light catches: phone, lips, necklace, clip (photo %) */
const SHINE = {
  d: [[51.97, 36.7, 26], [61.5, 45.8, 18], [62.3, 78.4, 30], [73.6, 21.3, 24], [54.3, 60, 16]],
  m: [[26.7, 49.8, 22], [50.9, 58.6, 16]],
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
  const [geo, setGeo] = useState<null | { x0: number; x1: number; top: number; cut: number; ends: P[]; shine: { x: number; y: number; s: number }[] }>(null);

  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine)').matches);
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // map the fringe from photo % to stage % (the photo is object-fit: cover)
  useEffect(() => {
    const calc = () => {
      const el = box.current; if (!el) return;
      const W = el.clientWidth, H = el.clientHeight;
      const mob = window.matchMedia('(max-width: 760px)').matches;
      const f = mob ? FRINGE.m : FRINGE.d;
      const s = Math.max(W / f.w, H / f.h);
      const rw = f.w * s, rh = f.h * s;
      const ox = (W - rw) * (f.pos[0] / 100), oy = (H - rh) * (f.pos[1] / 100);
      const X = (x: number) => ((ox + (x / 100) * rw) / W) * 100;
      const Y = (y: number) => ((oy + (y / 100) * rh) / H) * 100;
      setGeo({ x0: X(f.x0), x1: X(f.x1), top: Y(f.top), cut: Y(f.cut), ends: f.ends.map(([x, y]) => ({ x: X(x), y: Y(y) })), shine: (mob ? SHINE.m : SHINE.d).map(([x, y, sz]) => ({ x: X(x), y: Y(y), s: sz })) });
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
        {/* the masthead sits behind her, like a real cover */}
        <h1 id="cover-title" className="masthead" aria-label="grzywka, hair salon">grzywka</h1>
        <picture className="layer cut" aria-hidden>
          <source media="(max-width: 760px)" srcSet={img('cover-after-m-cut')} />
          <img src={img('cover-after-cut')} alt="" />
        </picture>
        <picture className={`layer cut before ${piece ? 'swap' : ''}`} aria-hidden>
          <source media="(max-width: 760px)" srcSet={img('cover-before-m-cut')} />
          <img src={img('cover-before-cut')} alt="" />
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

        {/* where to cut: a row of rhinestones right at her brows */}
        {!piece && geo && !drawing && (
          <>
            <span className="stones" style={{ left: `${geo.x0}%`, top: `${geo.cut}%`, width: `${geo.x1 - geo.x0}%` }} aria-hidden />
            <span className="cut-pill" style={{ left: `calc(${geo.x1}% + 10px)`, top: `${geo.cut}%` }} aria-hidden>✦ cut here</span>
          </>
        )}
        {geo?.shine.map((p, k) => (
          <svg key={k} className="shine" viewBox="0 0 20 20" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, animationDelay: `${k * .55}s` }} aria-hidden>
            <path d="M10 0 C10.8 7 13 9.2 20 10 C13 10.8 10.8 13 10 20 C9.2 13 7 10.8 0 10 C7 9.2 9.2 7 10 0 Z" />
          </svg>
        ))}
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
        <p className="label issue">aw26 · the fringe issue · 49 zł</p>

        {!piece ? (
          <div className="lines">
            <p className="bar">cut it yourself</p>
            <p className="howto" role="status">
              {nudge ? 'almost. go across her fringe, along the rhinestones.' : fine ? 'drag the scissors along the rhinestones on her fringe' : 'swipe along the rhinestones on her fringe'}
              {' '}<button className="textbtn" onClick={auto}>or cut it for me</button>
            </p>
            <p className="label kicker">p.04 · 10 cuts for now</p>
            <a className="display feature" href="#lookbook">the wolf{' '}<br />is back</a>
            <p className="bar white">gloss, clips &amp; 2003 bangs</p>
          </div>
        ) : (
          <div className={`lines after-card ${falling ? 'in' : ''}`} role="status">
            <p className="bar">much better.</p>
            <p className="label kicker">the fringe · trimmed to the brows</p>
            <p className="display feature">free trims{' '}<br />between cuts</p>
            <div className="row">
              <Link className="pill hot" href="/book/?look=fringe">book a fringe trim</Link>
              <button className="pill chrome" onClick={reset}>grow it back</button>
            </div>
          </div>
        )}

        <a className="burst" href="#lookbook"><span>10 new<br />cuts!</span></a>
        <a className="label more" href="#lookbook">+ the halo, the curtain<br />&amp; 7 more inside →</a>

        <div className="cta-row">
          <Link className="pill hot big" href="/book/">book a chair ✦</Link>
          <span className="label addr">hoża 51 · warszawa</span>
        </div>
        <div className="barcode" aria-hidden><span className="bc">*AW26*</span><span>aw26 · 49 zł</span></div>
      </div>
    </section>
  );
}
