import Link from 'next/link';
import Cover from '@/components/Cover';
import Lookbook from '@/components/Lookbook';
import BlowDry from '@/components/BlowDry';
import AllLooks from '@/components/AllLooks';
import { Twinkle } from '@/components/chrome';
import { ADDRESS, HOURS, PHONE, TEAM, TEL, img } from '@/lib/data';
import './home.css';

export default function Home() {
  return (
    <>
      <Cover />
      <Lookbook />
      <BlowDry />
      <AllLooks />
      <section className="team-strip" aria-labelledby="team-t">
        <h2 id="team-t" className="display">the girls with the scissors</h2>
        <div className="team-grid">
          {TEAM.map((t) => (
            <Link key={t.slug} href="/prices/#team" className="team-card">
              <span className="ph" style={{ display: 'block' }}><img src={img(t.slug)} alt={`${t.name}, ${t.role}`} loading="lazy" /></span>
              <span className="nm" style={{ display: 'block' }}>{t.name}</span>
              <span className="label">{t.role} · favourite: the {t.fav}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="findus" aria-labelledby="find-t">
        <div className="ph">
          <img className="main" src={img('shopfront')} alt="the salon at night, a pink neon grzywka sign in the window and a girl on a flip phone outside" loading="lazy" />
          <Twinkle style={{ right: '14%', top: '20%' }} />
        </div>
        <div className="tx">
          <p className="label pink">find us</p>
          <h2 id="find-t" className="display">open late, on hoża.</h2>
          <p>{ADDRESS}</p>
          <p>{HOURS}</p>
          <p><a href={TEL}>{PHONE}</a></p>
          <div className="row">
            <Link className="pill hot" href="/book/">book a look</Link>
            <a className="pill chrome" href="https://maps.google.com/?q=Ho%C5%BCa%2051%2C%20Warszawa" target="_blank" rel="noreferrer">directions</a>
          </div>
        </div>
      </section>
    </>
  );
}
