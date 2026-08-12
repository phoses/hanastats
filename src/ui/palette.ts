/**
 * Rotating accent tones used to tell games apart at a glance. The class names
 * are written out in full because Tailwind only generates classes it can see in
 * the source.
 */
export interface AccentTone {
  text: string;
  dot: string;
  soft: string;
  edge: string;
}

export const accentTones: AccentTone[] = [
  { text: 'tw:text-violet-300', dot: 'tw:bg-violet-400', soft: 'tw:bg-violet-400/15', edge: 'tw:border-l-violet-400' },
  { text: 'tw:text-cyan-300', dot: 'tw:bg-cyan-400', soft: 'tw:bg-cyan-400/15', edge: 'tw:border-l-cyan-400' },
  { text: 'tw:text-emerald-300', dot: 'tw:bg-emerald-400', soft: 'tw:bg-emerald-400/15', edge: 'tw:border-l-emerald-400' },
  { text: 'tw:text-amber-300', dot: 'tw:bg-amber-400', soft: 'tw:bg-amber-400/15', edge: 'tw:border-l-amber-400' },
  { text: 'tw:text-pink-300', dot: 'tw:bg-pink-400', soft: 'tw:bg-pink-400/15', edge: 'tw:border-l-pink-400' },
  { text: 'tw:text-sky-300', dot: 'tw:bg-sky-400', soft: 'tw:bg-sky-400/15', edge: 'tw:border-l-sky-400' },
  { text: 'tw:text-lime-300', dot: 'tw:bg-lime-400', soft: 'tw:bg-lime-400/15', edge: 'tw:border-l-lime-400' },
  { text: 'tw:text-fuchsia-300', dot: 'tw:bg-fuchsia-400', soft: 'tw:bg-fuchsia-400/15', edge: 'tw:border-l-fuchsia-400' },
];

/** Same id always maps to the same tone, without needing stored colors. */
export function toneFor(id: string | undefined | null): AccentTone {
  if (!id) {
    return accentTones[0];
  }

  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index) * (index + 1)) % 9973;
  }

  return accentTones[hash % accentTones.length];
}

/** Podium colours for the first three rows of the default standings order. */
export const medalTextClasses = ['tw:text-amber-300', 'tw:text-slate-200', 'tw:text-orange-300'];
