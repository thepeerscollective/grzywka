'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Glitter, Twinkle } from '@/components/chrome';
import { LOOKS, PHONE, TEAM, TEL, img } from '@/lib/data';

type Opt = { slug: string; name: string; short: string; time: string; from: string; pic: string };
const OPTIONS: Opt[] = [
  ...LOOKS.map((l) => ({ slug: l.slug, name: l.name, short: l.name.replace('the ', ''), time: l.time, from: `from ${l.from} zł`, pic: l.slug })),
  { slug: 'fringe', name: 'a fringe trim', short: 'fringe', time: '10 min', from: 'free', pic: 'micro-detail' },
  { slug: 'blow-dry', name: 'a blow-dry', short: 'gorgeous', time: '40 min', from: '120 zł', pic: 'bleach' },
];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const LONG = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export default function BookForm() {
  const [look, setLook] = useState('wolf');
  const [who, setWho] = useState('anyone');
  const [days, setDays] = useState<{ v: string; label: string; long: string; sun: boolean }[]>([]);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get('look'); if (l && OPTIONS.some((o) => o.slug === l)) setLook(l);
    const w = q.get('with'); if (w && TEAM.some((t) => t.slug === w)) setWho(w);
    const out: typeof days = [];
    const d = new Date(); d.setHours(12);
    while (out.length < 10) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 1) continue; // closed mondays
      out.push({ v: d.toISOString().slice(0, 10), label: `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`, long: LONG[d.getDay()], sun: d.getDay() === 0 });
    }
    setDays(out); setDay(out[0].v);
  }, []);

  const sel = OPTIONS.find((o) => o.slug === look)!;
  const dd = days.find((x) => x.v === day);
  const times = useMemo(() => {
    const [a, b] = dd?.sun ? [12, 17] : [11, 22];
    const t: string[] = [];
    for (let h = a; h <= b; h++) { t.push(`${h}:00`); if (h < b) t.push(`${h}:30`); }
    return t;
  }, [dd]);
  useEffect(() => { if (!times.includes(time)) setTime(times[Math.min(8, times.length - 1)]); }, [times, time]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (!name.trim()) er.name = 'we need a name to shout across the salon.';
    if (phone.replace(/\D/g, '').length < 9) er.phone = 'a phone number with at least 9 digits, so we can text you.';
    setErr(er);
    if (Object.keys(er).length) { document.getElementById(er.name ? 'f-name' : 'f-phone')?.focus(); return; }
    setDone(true);
    document.getElementById('book-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <section className="book page-top">
        <form className="book-form" onSubmit={submit} noValidate>
          <h1 className="display">book a look</h1>
          <fieldset className="looks-pick">
            <legend className="label">which look · <span className="pink">{sel.name}</span></legend>
            <div className="picks">
              {OPTIONS.map((o) => (
                <label key={o.slug} className={look === o.slug ? 'on' : ''}>
                  <input type="radio" name="look" value={o.slug} checked={look === o.slug} onChange={() => { setLook(o.slug); setDone(false); }} className="sr" />
                  <img src={img(o.pic === o.slug ? o.slug + '-sm' : o.pic)} alt="" loading="lazy" />
                  <span>{o.name}</span>
                </label>
              ))}
            </div>
            <p className="label grey">{sel.time} · {sel.from}</p>
          </fieldset>
          <div className="f">
            <label className="label" htmlFor="f-with">with</label>
            <select id="f-with" value={who} onChange={(e) => setWho(e.target.value)}>
              <option value="anyone">anyone, surprise me</option>
              {TEAM.map((t) => <option key={t.slug} value={t.slug}>{t.name} · {t.role}</option>)}
            </select>
          </div>
          <div className="two">
            <div className="f">
              <label className="label" htmlFor="f-day">day</label>
              <select id="f-day" value={day} onChange={(e) => setDay(e.target.value)}>
                {days.map((x) => <option key={x.v} value={x.v}>{x.label}</option>)}
              </select>
            </div>
            <div className="f">
              <label className="label" htmlFor="f-time">time</label>
              <select id="f-time" value={time} onChange={(e) => setTime(e.target.value)}>
                {times.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="two">
            <div className="f">
              <label className="label" htmlFor="f-name">first name</label>
              <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" aria-invalid={!!err.name} aria-describedby={err.name ? 'e-name' : undefined} />
              {err.name && <p id="e-name" className="err">{err.name}</p>}
            </div>
            <div className="f">
              <label className="label" htmlFor="f-phone">phone</label>
              <input id="f-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-invalid={!!err.phone} aria-describedby={err.phone ? 'e-phone' : undefined} />
              {err.phone && <p id="e-phone" className="err">{err.phone}</p>}
            </div>
          </div>
          <button className="pill hot submit" type="submit">book {sel.name}</button>
          <p className="small">you pay in the chair. cancel up to 24h before. this is a concept site, so nothing actually gets booked.</p>
        </form>

        <div id="book-card" className={`book-card ${done ? 'done' : ''}`} aria-live="polite">
          <img className="main" key={sel.pic} src={img(sel.pic === sel.slug ? sel.slug : sel.pic)} alt={`${sel.name}, the photo you picked`} />
          <Twinkle style={{ right: '7%', top: '5%' }} />
          {done && <Glitter word="book-it" className="booked-word" />}
          <p className="display see">
            {done ? <>see you {dd?.long}, {sel.short}.</> : <>{sel.name}.</>}
          </p>
          {done && <p className="label conf">{dd?.label} · {time} · with {who === 'anyone' ? 'whoever’s free' : who} · we’ll text {phone}</p>}
        </div>
      </section>

      <section id="call" className="call">
        <div className="ph">
          <img src={img('phone-girl')} alt="a girl holding a rhinestone flip phone right up to the camera" loading="lazy" />
          <Glitter word="call-me" style={{ left: '6%', bottom: '6%', width: '62%' }} />
        </div>
        <div className="tx">
          <p className="label pink">or the old way</p>
          <h2 className="display">call the salon</h2>
          <p>kasia picks up between cuts. if it rings out, she’s holding scissors. try again in ten.</p>
          <a className="pill hot" href={TEL}>{PHONE}</a>
          <p className="small"><Link href="/prices/">see the prices first</Link></p>
        </div>
      </section>
    </>
  );
}
