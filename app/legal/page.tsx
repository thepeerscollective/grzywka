import type { Metadata } from 'next';
import '../pages.css';

export const metadata: Metadata = { title: 'legal + accessibility' };

export default function Legal() {
  return (
    <section className="plain">
      <h1 className="display">the small print</h1>
      <p>grzywka is a concept website made as a portfolio piece. it is not a real salon: nothing can be booked, nobody will call you back, and the address is only there to make the map pin look right. every photo was made for this concept.</p>
      <h2 className="label pink">privacy</h2>
      <p>the booking form doesn’t send anything anywhere. we keep one tiny flag in your browser so the loading screen only shows once per visit. no tracking, no cookies.</p>
      <h2 id="accessibility" className="label pink">accessibility</h2>
      <p>the fun bits all have a plain way in. cut the fringe with the “cut it for me” button, blow-dry by holding space on the hold button, flip the lookbook with the arrow buttons or the all looks strip. with reduced motion turned on, the loading screen, sparkles and falling hair are switched off. if something doesn’t work for you, tell us.</p>
    </section>
  );
}
