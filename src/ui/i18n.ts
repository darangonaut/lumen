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
  worldDone: 'Svet „{world}“ je zachránený! Ďalej: {next}',
  world3: 'Močiare',
  level9: 'Bludičky',
  level10: 'Hubový háj',
  level11: 'Utopené chodníky',
  level12: 'Srdce močiara',
  world4: 'Ľadové štíty',
  level13: 'Prvý sneh',
  level14: 'Zamrznuté jazero',
  level15: 'Cencúľová roklina',
  level16: 'Ľadový hrebeň',
  world5: 'Zabudnutá veža',
  level17: 'Brána',
  level18: 'Mechanizmy',
  level19: 'Schodisko vetra',
  level20: 'Vrchol veže',
  world6: 'Srdce tmy',
  level21: 'Okraj priepasti',
  level22: 'Veľké tiene',
  level23: 'Posledné lampy',
  level24: 'Srdce tmy',
  hintBounce: 'Svietiace huby ťa vymrštia vysoko. Podrž skok a vznášaj sa ďalej.',
  hintIce: 'Ľad šmýka! Rozbieha sa aj zastavuje len pomaly.',
  hintIcicle: 'Cencúle sa odlomia, keď pod nimi prechádzaš. Nezastavuj!',
  hintMover: 'Pohyblivé plošiny ťa odvezú. Počkaj, kým priplávajú.',
  hintBigShade: 'Veľký tieň vydrží tri zásahy. Skoč mu na hlavu alebo hoď iskry!',
  hintBigShadeTouch: 'Veľký tieň vydrží tri zásahy. Skoč mu na hlavu alebo hoď iskry ✸!',
  diedIcicle: 'Cencúľ…',
  diedSwamp: 'Bahno ťa stiahlo…',
  diedAbyss: 'Temná hlbina…',

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
  victoryTitle: 'Svetlo sa vrátilo',
  victoryStory:
    'Malé dievčatko s lampášom prešlo lesom, jaskyňami, močiarmi, ľadom aj vežou. V srdci tmy zapálilo poslednú vatru — a nad svetom po dlhej noci vyšlo slnko.',
  victoryStats: 'Svetlušky {f}/{ft} · Kryštály {c}/{ct} · Pády {d}',
  comingSoon: 'Ďakujeme, že si hral Lumen!',
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
  world3: 'Marshes',
  level9: 'Will-o’-the-Wisps',
  level10: 'Mushroom Grove',
  level11: 'Drowned Paths',
  level12: 'Heart of the Marsh',
  world4: 'Frozen Peaks',
  level13: 'First Snow',
  level14: 'Frozen Lake',
  level15: 'Icicle Gorge',
  level16: 'Ice Ridge',
  world5: 'Forgotten Tower',
  level17: 'The Gate',
  level18: 'Mechanisms',
  level19: 'Stairway of Wind',
  level20: 'Top of the Tower',
  world6: 'Heart of Darkness',
  level21: 'Edge of the Abyss',
  level22: 'Great Shades',
  level23: 'The Last Lamps',
  level24: 'Heart of Darkness',
  hintBounce: 'Glowing mushrooms launch you high. Hold jump to float further.',
  hintIce: 'Ice is slippery! You speed up and stop only slowly.',
  hintIcicle: 'Icicles break off when you pass beneath. Keep moving!',
  hintMover: 'Moving platforms will carry you. Wait for them to float over.',
  hintBigShade: 'A great shade takes three hits. Jump on its head or throw sparks!',
  hintBigShadeTouch: 'A great shade takes three hits. Jump on its head or throw sparks ✸!',
  diedIcicle: 'An icicle…',
  diedSwamp: 'The mire pulled you under…',
  diedAbyss: 'The dark depths…',

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
  victoryTitle: 'The light has returned',
  victoryStory:
    'A little girl with a lantern crossed the forest, the caves, the marshes, the ice and the tower. In the heart of darkness she lit the last fire — and after the long night, the sun rose over the world.',
  victoryStats: 'Fireflies {f}/{ft} · Crystals {c}/{ct} · Falls {d}',
  comingSoon: 'Thank you for playing Lumen!',
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
