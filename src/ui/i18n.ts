export type Language = 'sk' | 'en';

const sk = {
  tagline: 'Svet zhasol. Zostal ti lampáš.',
  play: 'Hrať',
  continue: 'Pokračovať: {level}',
  newGame: 'Nová hra',
  newGameConfirm: 'Naozaj? Postup sa zmaže',
  controlsDesktop:
    '← → / A D chôdza · Medzerník / ↑ skok · C / F iskra · Shift / X rozžiariť lampáš · Esc pauza',
  controlsTouch: 'Šípky chôdza · ⤒ skok · ✸ iskra · ✦ rozžiariť lampáš',
  world1: 'Hmlistý les',
  level1: 'Prvé svetlo',
  level2: 'Svetelné mosty',
  level3: 'Tiene',
  level4: 'Srdce lesa',
  world2: 'Zatopené jaskyne',
  level5: 'Kvapľová sieň',
  level6: 'Mory',
  level7: 'Podzemné jazero',
  level8: 'Hlbina',
  worldDone: '{world} je zachránený! Ďalej: {next}',
  hintWater: 'Jaskynná voda je ľadová a hlboká. Nespadni do nej!',
  hintCrumble: 'Popraskané kamene sa pod tebou rozpadnú. Nezastavuj sa na nich!',
  hintMoth: 'Mory letia za svetlom a pijú olej z lampáša. Zažeň ich iskrou (C) alebo rozžiarením!',
  hintMothTouch:
    'Mory letia za svetlom a pijú olej z lampáša. Zažeň ich iskrou ✸ alebo rozžiarením ✦!',
  levelLabel: '{world} {n}/{total}',
  hintMove: 'Šípky alebo A/D na chôdzu, medzerník alebo ↑ na skok.',
  hintFireflies: 'Lampáš pomaly míňa olej. Svetlušky ho dopĺňajú.',
  hintLantern: 'Zapáľ lampu: uloží postup a doplní olej.',
  hintThorns: 'Pozor na tŕne! Preskoč ich.',
  hintExit: 'Na konci každej cesty zapáľ vatru.',
  hintLightPlatform: 'Niektoré plošiny existujú len vo svetle. Svieť si na cestu.',
  hintFlare:
    'Podrž Shift alebo X: lampáš sa rozžiari a ukáže vzdialené plošiny. Míňa však veľa oleja.',
  hintShade:
    'Tiene čakajú, kým zaváhaš. Skoč im na hlavu, hoď iskru (C) alebo rozžiar lampáš (Shift)!',
  hintSafe: 'Pri zapálenej lampe si pred tieňmi v bezpečí.',
  hintFlareTouch: 'Podrž ✦: lampáš sa rozžiari a ukáže vzdialené plošiny. Míňa však veľa oleja.',
  hintShadeTouch: 'Tiene čakajú, kým zaváhaš. Skoč im na hlavu, hoď iskru ✸ alebo podrž ✦!',
  hintMoveTouch: 'Šípky vľavo dole na chôdzu, ⤒ vpravo na skok.',
  oilLow: 'Dochádza olej!',
  darkness: 'Tma sa zatvára…',
  diedThorns: 'Tŕne…',
  diedFall: 'Pád do tmy…',
  diedDark: 'Tma ťa pohltila…',
  diedWater: 'Ľadová voda…',
  levelDone: 'Vatra horí!',
  stats: 'Svetlušky {f}/{ft} · Kryštály {c}/{ct} · Čas {time} · Pády {d}',
  next: 'Ďalej',
  replay: 'Znova',
  victoryTitle: 'Jaskyne sa rozžiarili',
  victoryStory:
    'Les aj jaskyne opäť dýchajú svetlom. Na obzore sa však týči opustená veža a z jej okien sa valí tma…',
  victoryStats: 'Svetlušky {f}/{ft} · Kryštály {c}/{ct} · Pády {d}',
  comingSoon: 'Pokračovanie čoskoro: Opustená veža',
  toMenu: 'Hlavné menu',
  paused: 'Pauza',
  resume: 'Pokračovať',
  restart: 'Začať level znova',
  soundOn: 'Zvuk: zapnutý',
  soundOff: 'Zvuk: vypnutý',
  pausedHint: 'Esc / P pokračuje',
  rotate: 'Otoč telefón na šírku',
  styleToggle: 'Grafika: {style}',
  stylePixel: 'pixel art',
  styleVector: 'siluety',
};

export type Key = keyof typeof sk;

const en: Record<Key, string> = {
  tagline: 'The world went dark. You still have a lantern.',
  play: 'Play',
  continue: 'Continue: {level}',
  newGame: 'New game',
  newGameConfirm: 'Sure? Progress will be lost',
  controlsDesktop:
    '← → / A D move · Space / ↑ jump · C / F spark · Shift / X flare the lantern · Esc pause',
  controlsTouch: 'Arrows move · ⤒ jump · ✸ spark · ✦ flare the lantern',
  world1: 'Misty Forest',
  level1: 'First Light',
  level2: 'Bridges of Light',
  level3: 'Shades',
  level4: 'Heart of the Forest',
  world2: 'Flooded Caves',
  level5: 'Stalactite Hall',
  level6: 'Moths',
  level7: 'Underground Lake',
  level8: 'The Deep',
  worldDone: '{world} is saved! Next: {next}',
  hintWater: 'The cave water is icy and deep. Don’t fall in!',
  hintCrumble: 'Cracked stones crumble beneath you. Keep moving!',
  hintMoth:
    'Moths chase the light and drink your lantern oil. Drive them off with a spark (C) or a flare!',
  hintMothTouch:
    'Moths chase the light and drink your lantern oil. Drive them off with a spark ✸ or a flare ✦!',
  levelLabel: '{world} {n}/{total}',
  hintMove: 'Arrows or A/D to walk, Space or ↑ to jump.',
  hintFireflies: 'Your lantern slowly burns oil. Fireflies refill it.',
  hintLantern: 'Light a lamp: it saves your progress and refills oil.',
  hintThorns: 'Watch out for thorns! Jump over them.',
  hintExit: 'At the end of every path, light the campfire.',
  hintLightPlatform: 'Some platforms only exist in light. Light your way.',
  hintFlare:
    'Hold Shift or X: the lantern flares and reveals distant platforms. It burns a lot of oil.',
  hintShade:
    'Shades wait for you to falter. Jump on their heads, throw a spark (C) or flare the lantern (Shift)!',
  hintSafe: 'Next to a lit lamp you are safe from shades.',
  hintFlareTouch:
    'Hold ✦: the lantern flares and reveals distant platforms. It burns a lot of oil.',
  hintShadeTouch: 'Shades wait for you to falter. Jump on their heads, throw a spark ✸ or hold ✦!',
  hintMoveTouch: 'Arrows at the bottom left to walk, ⤒ on the right to jump.',
  oilLow: 'Running out of oil!',
  darkness: 'The darkness closes in…',
  diedThorns: 'Thorns…',
  diedFall: 'Fell into the dark…',
  diedDark: 'The darkness took you…',
  diedWater: 'Icy water…',
  levelDone: 'The fire is lit!',
  stats: 'Fireflies {f}/{ft} · Crystals {c}/{ct} · Time {time} · Falls {d}',
  next: 'Next',
  replay: 'Replay',
  victoryTitle: 'The caves are aglow',
  victoryStory:
    'The forest and the caves breathe light again. But on the horizon stands an abandoned tower, and darkness pours from its windows…',
  victoryStats: 'Fireflies {f}/{ft} · Crystals {c}/{ct} · Falls {d}',
  comingSoon: 'Coming soon: The Abandoned Tower',
  toMenu: 'Main menu',
  paused: 'Paused',
  resume: 'Resume',
  restart: 'Restart level',
  soundOn: 'Sound: on',
  soundOff: 'Sound: off',
  pausedHint: 'Esc / P resumes',
  rotate: 'Turn your phone sideways',
  styleToggle: 'Graphics: {style}',
  stylePixel: 'pixel art',
  styleVector: 'silhouettes',
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
