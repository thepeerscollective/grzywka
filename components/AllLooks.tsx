import Link from 'next/link';
import { LOOKS, img } from '@/lib/data';

export default function AllLooks() {
  return (
    <section className="all" aria-labelledby="all-t">
      <h2 id="all-t" className="label" style={{ margin: 0 }}>all {LOOKS.length} looks · tap one for the front, detail and back</h2>
      <div className="all-grid">
        {LOOKS.map((l) => (
          <Link key={l.slug} href={`/looks/${l.slug}/`}>
            <span className="th"><img src={img(l.slug + '-sq')} alt="" loading="lazy" /></span>
            <span className="nm">{l.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
