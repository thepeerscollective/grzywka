import type { Metadata } from 'next';
import Link from 'next/link';
import { Twinkle } from '@/components/chrome';
import { LOOKS, PRICES, TEAM, img } from '@/lib/data';
import '../pages.css';

export const metadata: Metadata = { title: 'prices + the team', description: 'cuts from 180 zł, fringe trims free forever, open till 23:00. and the three people with the scissors.' };

export default function Prices() {
  return (
    <>
      <section className="prices page-top">
        <div className="price-list">
          <h1 className="display">the price list</h1>
          <p className="intro">no surprises at the till. the price is the price, the fringe trim is free, the coffee is free, the gossip is free.</p>
          {PRICES.map((g) => (
            <div key={g.group} className="pgroup">
              <h2 className="label pink">{g.group}</h2>
              <ul>
                {g.rows.map(([n, p]) => (
                  <li key={n}><span className="pn">{n}</span><span className="label">{p}</span></li>
                ))}
              </ul>
            </div>
          ))}
          <p className="small">long or very thick hair can take longer, we’ll tell you before we start. you pay in the chair, card or cash.</p>
        </div>
        <div className="price-photo">
          <div className="frame">
            <img src={img('prices')} alt="a girl lying on white sheets in a rhinestone gel face mask, long pink nails over one eye" />
            <Twinkle style={{ right: '8%', top: '6%' }} />
            <span className="star-burst" aria-hidden><span><small>always</small>free<br />fringe<br />trims</span></span>
          </div>
        </div>
      </section>
      <section id="team" className="team" aria-labelledby="team-h">
        <h2 id="team-h" className="display">the girls with the scissors</h2>
        <div className="team-cols">
          {TEAM.map((t) => (
            <article key={t.slug} className="member">
              <div className="ph"><img src={img(t.slug)} alt={`${t.name}, ${t.role}`} loading="lazy" /></div>
              <div className="mrow">
                <h3 className="display">{t.name}</h3>
                <Link className="pill chrome" href={`/book/?with=${t.slug}`}>book with {t.name}</Link>
              </div>
              <p className="label">{t.role} · favourite: <Link href={`/looks/${t.fav}/`}>the {t.fav}</Link></p>
              <p>{t.line}</p>
              <p className="label cuts">cuts: {LOOKS.filter((l) => l.by === t.slug).map((l) => l.name).join(' · ')}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
