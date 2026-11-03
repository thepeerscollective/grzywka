'use client';
import { LOOKS, img } from '@/lib/data';

export default function AllLooks() {
  return (
    <section className="all" aria-labelledby="all-t">
      <h2 id="all-t" className="label" style={{ margin: 0 }}>all {LOOKS.length} looks · tap one, the lookbook flips to it</h2>
      <div className="all-grid">
        {LOOKS.map((l, k) => (
          <button key={l.slug} onClick={() => window.dispatchEvent(new CustomEvent('gz-goto', { detail: k }))}>
            <span className="th"><img src={img(l.slug + '-sq')} alt="" loading="lazy" /></span>
            <span className="nm">{l.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
