export const BASE = process.env.NEXT_PUBLIC_BASE ?? '';
export const img = (n: string) => `${BASE}/img/${n}.webp`;
export const media = (n: string) => `${BASE}/media/${n}`;

export const ADDRESS = 'ul. hoża 51, warszawa';
export const HOURS = 'tue–sat 11–23 · sun 12–18';
export const PHONE = '+48 22 100 20 26';
export const TEL = 'tel:+48221002026';

export type Look = {
  slug: string;
  name: string;
  line: string;
  time: string;
  every: string;
  from: number;
  say: string;
  detail: string;
  by: 'kasia' | 'ola' | 'bartek';
};

/** mixed on purpose: no two of the same girl in a row, nobody parked at the end */
export const LOOKS: Look[] = [
  { slug: 'wolf', name: 'the wolf', line: 'shaggy on top, long at the back, a fringe with opinions. for people who air-dry and lie about it.', time: '75 min', every: 'every 6–8 weeks', from: 240, say: '“the wolf. keep the back long, choppy curtain fringe split in the middle, no thinning scissors.”', detail: 'the fringe, split in the middle', by: 'bartek' },
  { slug: 'halo', name: 'the halo', line: 'a big round afro, picked out soft. shaped, never cut short. the fringe coils get their own appointment.', time: '90 min', every: 'every 8–10 weeks', from: 220, say: '“the halo. shape it round, keep my length, define the coils at the front, no heat.”', detail: 'the coils at the edge', by: 'kasia' },
  { slug: 'curtain', name: 'the curtain', line: 'the 2003 one. it’s back. a long fringe from the middle and big flipped-out ends.', time: '75 min', every: 'every 6–8 weeks', from: 220, say: '“curtain fringe from the middle to my cheekbones, long layers, blow-dry the ends out big.”', detail: 'the curtain and one big curl', by: 'kasia' },
  { slug: 'butterfly', name: 'the butterfly', line: 'short layers round the face, all the length underneath. looks done when it isn’t.', time: '90 min', every: 'every 8 weeks', from: 260, say: '“butterfly layers starting at my chin, keep the length, flip the ends out.”', detail: 'the face-framing layers', by: 'bartek' },
  { slug: 'bixie', name: 'the bixie', line: 'half bob, half pixie. glossy, soft at the nape, and it grows out kind.', time: '60 min', every: 'every 5–6 weeks', from: 200, say: '“bixie, short at the nape, wispy side fringe, keep the honey ends.”', detail: 'the side fringe and the ends', by: 'kasia' },
  { slug: 'micro', name: 'the micro', line: 'very short, very high, very on purpose. a fringe for people who mean it.', time: '45 min', every: 'fringe trim every 3 weeks', from: 180, say: '“micro fringe two fingers above my brows, slightly uneven, sleek chin bob.”', detail: 'the micro fringe', by: 'kasia' },
  { slug: 'goddess', name: 'the goddess', line: 'knotless, waist length, curls left out, a few honey strands. bring snacks.', time: '6 h', every: 'lasts 6–8 weeks', from: 650, say: '“knotless goddess braids, waist length, medium, curls left out, honey strands mixed in.”', detail: 'the curly ends and the cuffs', by: 'ola' },
  { slug: 'shag', name: 'the shag', line: 'a 70s shag for curls, cut dry, curl by curl. the fringe falls to your lashes.', time: '90 min', every: 'every 8–10 weeks', from: 260, say: '“curly shag, cut dry, lots of short layers on top, curly fringe to my lashes.”', detail: 'the curly fringe', by: 'bartek' },
  { slug: 'bleach', name: 'the bleach', line: 'platinum with the roots left on purpose, and a blunt fringe right at the brows.', time: '4 h', every: 'toner every 6 weeks', from: 790, say: '“platinum, leave two centimetres of roots, blunt fringe at the eyebrows.”', detail: 'the blunt fringe and the roots', by: 'ola' },
  { slug: 'bob', name: 'the bob', line: 'chin length, glossy, the ends turned under and a side fringe you can hide behind.', time: '60 min', every: 'every 6 weeks', from: 200, say: '“chin bob, ends turned under, long side fringe I can tuck behind my ear.”', detail: 'the side fringe over one eye', by: 'bartek' },
];
export const look = (slug: string) => LOOKS.find((l) => l.slug === slug)!;

export const PRICES: { group: string; rows: [string, string][] }[] = [
  { group: 'cuts', rows: [['short', '180 zł'], ['medium', '220 zł'], ['long', '260 zł'], ['fringe trim between cuts', 'free, always']] },
  { group: 'colour', rows: [['roots', '320 zł'], ['all over', '420 zł'], ['bleach + tone', 'from 690 zł'], ['a toner, just because', '160 zł']] },
  { group: 'braids + curls', rows: [['knotless, shoulder length', '450 zł'], ['goddess, waist length', '650 zł'], ['curly cut, dry', '260 zł']] },
  { group: 'glam', rows: [['blow-dry', '120 zł'], ['an event', '250 zł'], ['the 22:00 fix', '90 zł']] },
];

export const TEAM = [
  { slug: 'kasia', name: 'kasia', role: 'owner · cuts since 2014', fav: 'micro', line: 'opened grzywka because nobody would cut her a fringe high enough. still the only one allowed near a micro.' },
  { slug: 'ola', name: 'ola', role: 'colour, bleach + braids', fav: 'bleach', line: 'pink since 2019. will talk you into platinum, then braid it for six hours with the playlist on.' },
  { slug: 'bartek', name: 'bartek', role: 'shags, wolves, blow-dries', fav: 'wolf', line: 'sings into the hair dryer. cuts the wolf like he invented it. maybe he did.' },
] as const;
