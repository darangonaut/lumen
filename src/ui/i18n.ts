export type Language = 'sk' | 'en';

const sk = {
  tagline: 'Svet zhasol. Zostal ti lampáš.',
  play: 'Hrať',
  continue: 'Pokračovať: {level}',
  controlsDesktop: '← → / A D chôdza · Medzerník / ↑ skok · Shift / X rozžiariť lampáš · Esc pauza',
  controlsTouch: 'Šípky chôdza · ⤒ skok · ✦ rozžiariť lampáš',
  world1: 'Hmlistý les',
  level1: 'Prvé svetlo',
  level2: 'Svetelné mosty',
  level3: 'Tiene',
  level4: 'Srdce lesa',
  levelLabel: '{world} {n}/{total}',
  hintMove: 'Šípky alebo A/D na chôdzu, medzerník alebo ↑ na skok.',
  hintFireflies: 'Lampáš pomaly míňa olej. Svetlušky ho dopĺňajú.',
  hintLantern: 'Zapáľ lampu: uloží postup a doplní olej.',
  hintThorns: 'Pozor na tŕne! Preskoč ich.',
  hintExit: 'Na konci každej cesty zapáľ vatru.',
  hintLightPlatform: 'Niektoré plošiny existujú len vo svetle. Svieť si na cestu.',
  hintFlare:
    'Podrž Shift alebo X: lampáš sa rozžiari a ukáže vzdialené plošiny. Míňa však veľa oleja.',
  hintShade: 'Tiene sa boja svetla, no čakajú, kým zaváhaš. Rozžiar lampáš a spáľ ich!',
  hintSafe: 'Pri zapálenej lampe si pred tieňmi v bezpečí.',
  hintFlareTouch: 'Podrž ✦: lampáš sa rozžiari a ukáže vzdialené plošiny. Míňa však veľa oleja.',
  hintShadeTouch: 'Tiene sa boja svetla, no čakajú, kým zaváhaš. Podrž ✦ a spáľ ich!',
  hintMoveTouch: 'Šípky vľavo dole na chôdzu, ⤒ vpravo na skok.',
  oilLow: 'Dochádza olej!',
  darkness: 'Tma sa zatvára…',
  diedThorns: 'Tŕne…',
  diedFall: 'Pád do tmy…',
  diedDark: 'Tma ťa pohltila…',
  levelDone: 'Vatra horí!',
  stats: 'Svetlušky {f}/{ft} · Kryštály {c}/{ct} · Čas {time} · Pády {d}',
  next: 'Ďalej',
  replay: 'Znova',
  victoryTitle: 'Les sa prebúdza',
  victoryStory:
    'Vatra v srdci lesa vzbĺkla a hmla ustúpila. Ďaleko za kopcami sa však tma stále valí zatopenými jaskyňami…',
  victoryStats: 'Svetlušky {f}/{ft} · Kryštály {c}/{ct} · Pády {d}',
  comingSoon: 'Pokračovanie čoskoro: Zatopené jaskyne',
  toMenu: 'Hlavné menu',
  paused: 'Pauza',
  resume: 'Pokračovať',
  restart: 'Začať level znova',
  soundOn: 'Zvuk: zapnutý',
  soundOff: 'Zvuk: vypnutý',
  pausedHint: 'Esc / P pokračuje',
  rotate: 'Otoč telefón na šírku',
};

export type Key = keyof typeof sk;

const en: Record<Key, string> = {
  tagline: 'The world went dark. You still have a lantern.',
  play: 'Play',
  continue: 'Continue: {level}',
  controlsDesktop: '← → / A D move · Space / ↑ jump · Shift / X flare the lantern · Esc pause',
  controlsTouch: 'Arrows move · ⤒ jump · ✦ flare the lantern',
  world1: 'Misty Forest',
  level1: 'First Light',
  level2: 'Bridges of Light',
  level3: 'Shades',
  level4: 'Heart of the Forest',
  levelLabel: '{world} {n}/{total}',
  hintMove: 'Arrows or A/D to walk, Space or ↑ to jump.',
  hintFireflies: 'Your lantern slowly burns oil. Fireflies refill it.',
  hintLantern: 'Light a lamp: it saves your progress and refills oil.',
  hintThorns: 'Watch out for thorns! Jump over them.',
  hintExit: 'At the end of every path, light the campfire.',
  hintLightPlatform: 'Some platforms only exist in light. Light your way.',
  hintFlare:
    'Hold Shift or X: the lantern flares and reveals distant platforms. It burns a lot of oil.',
  hintShade: 'Shades fear light, but they wait for you to falter. Flare the lantern to burn them!',
  hintSafe: 'Next to a lit lamp you are safe from shades.',
  hintFlareTouch:
    'Hold ✦: the lantern flares and reveals distant platforms. It burns a lot of oil.',
  hintShadeTouch: 'Shades fear light, but they wait for you to falter. Hold ✦ to burn them!',
  hintMoveTouch: 'Arrows at the bottom left to walk, ⤒ on the right to jump.',
  oilLow: 'Running out of oil!',
  darkness: 'The darkness closes in…',
  diedThorns: 'Thorns…',
  diedFall: 'Fell into the dark…',
  diedDark: 'The darkness took you…',
  levelDone: 'The fire is lit!',
  stats: 'Fireflies {f}/{ft} · Crystals {c}/{ct} · Time {time} · Falls {d}',
  next: 'Next',
  replay: 'Replay',
  victoryTitle: 'The forest awakens',
  victoryStory:
    'The fire in the heart of the forest blazed up and the mist retreated. But far beyond the hills, darkness still rolls through the flooded caves…',
  victoryStats: 'Fireflies {f}/{ft} · Crystals {c}/{ct} · Falls {d}',
  comingSoon: 'Coming soon: Flooded Caves',
  toMenu: 'Main menu',
  paused: 'Paused',
  resume: 'Resume',
  restart: 'Restart level',
  soundOn: 'Sound: on',
  soundOff: 'Sound: off',
  pausedHint: 'Esc / P resumes',
  rotate: 'Turn your phone sideways',
};

const STRINGS: Record<Language, Record<Key, string>> = { sk, en };
const LANG_KEY = 'lumen.lang';

let language: Language = detect();

function detect(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'sk' || saved === 'en') return saved;
  } catch {
    // úložisko nedostupné
  }
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('sk') || nav.startsWith('cs') ? 'sk' : 'en';
}

export function getLanguage(): Language {
  return language;
}

export function setLanguage(lang: Language): void {
  language = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // úložisko nedostupné
  }
}

export function hasKey(key: string): key is Key {
  return key in sk;
}

export function t(key: Key, params: Record<string, string | number> = {}): string {
  return STRINGS[language][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(params[name] ?? ''),
  );
}
