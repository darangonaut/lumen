import { TILE, Tile, tileAt, type Level, type World } from '@/game/level';
import { PixelCanvas, pixelNoise, shade, type Rgb } from './PixelCanvas';

/** Paleta nočného lesa. */
export const C = {
  ink: 0x07060d,
  outline: 0x0b0912,
  sky0: 0x0a0c22,
  sky1: 0x1b1540,
  moon: 0xdfe6ff,
  hill: 0x141b36,
  trees: 0x0d1128,
  soil: 0x2b2238,
  soilDark: 0x211a2c,
  soilSpot: 0x352b45,
  stone: 0x463d58,
  grass: 0x3f8a5e,
  grassDark: 0x2b6247,
  grassLight: 0x63b87a,
  wood: 0x7a5636,
  woodLight: 0x9c7446,
  woodDark: 0x4e3523,
  thorn: 0x55304a,
  thornTip: 0xc497b0,
  cloak: 0x3d5590,
  cloakDark: 0x283862,
  skin: 0xf2d2aa,
  boots: 0x3b2a22,
  brass: 0x9a7438,
  flame: 0xffd35a,
  flameHot: 0xfff6c8,
  flameRed: 0xff8a3a,
  firefly: 0xd9f56a,
  crystal: 0x8ff0ff,
  crystalDark: 0x2f88b8,
  lightTile: 0xffe9a8,
  shade: 0x120b1f,
  shadeInner: 0x2a1a44,
  shadeEye: 0xe4f4ff,
  mushroom: 0x6cf0e0,
};

/** Farby terénu podľa sveta. */
interface TerrainPalette {
  soil: Rgb;
  soilDark: Rgb;
  soilSpot: Rgb;
  stone: Rgb;
  grass: Rgb;
  grassDark: Rgb;
  grassLight: Rgb;
}

const TERRAIN: Record<World, TerrainPalette> = {
  forest: {
    soil: C.soil,
    soilDark: C.soilDark,
    soilSpot: C.soilSpot,
    stone: C.stone,
    grass: C.grass,
    grassDark: C.grassDark,
    grassLight: C.grassLight,
  },
  // Jaskyne: modrošedá skala, navrchu tyrkysový mach.
  caves: {
    soil: 0x262a3e,
    soilDark: 0x1a1d2c,
    soilSpot: 0x30364c,
    stone: 0x4a5270,
    grass: 0x2f7a78,
    grassDark: 0x22585a,
    grassLight: 0x58b8a8,
  },
};

let pal: TerrainPalette = TERRAIN.forest;

/** Zem: trávnatý vrch, hlina so skvrnami a kameňmi, tmavé okraje. */
function drawGroundTile(pc: PixelCanvas, level: Level, col: number, row: number): void {
  const x0 = col * TILE;
  const y0 = row * TILE;
  const ground = (c: number, r: number) => tileAt(level, c, r) === Tile.Ground;
  const topOpen = !ground(col, row - 1);
  const leftOpen = !ground(col - 1, row);
  const rightOpen = !ground(col + 1, row);
  const bottomOpen = row + 1 < level.height && !ground(col, row + 1);
  // Hlbšie vrstvy tmavnú.
  let depth = 0;
  while (depth < 4 && ground(col, row - depth - 1)) depth++;
  const base = shade(pal.soil, 1 - depth * 0.08);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = pixelNoise(x0 + x, y0 + y, 7);
      let color: Rgb = base;
      if (n < 0.06) color = shade(pal.soilSpot, 1 - depth * 0.08);
      else if (n > 0.97) color = pal.soilDark;
      pc.set(x0 + x, y0 + y, color);
    }
  }
  // Kamene.
  if (pixelNoise(col, row, 3) < 0.35) {
    const sx = x0 + 3 + Math.floor(pixelNoise(col, row, 4) * 8);
    const sy = y0 + 5 + Math.floor(pixelNoise(col, row, 5) * 7);
    pc.fillRect(sx, sy, 3, 2, pal.stone);
    pc.set(sx, sy, shade(pal.stone, 1.25));
    pc.fillRect(sx, sy + 2, 3, 1, pal.soilDark);
  }
  if (leftOpen) for (let y = 0; y < TILE; y++) pc.set(x0, y0 + y, pal.soilDark);
  if (rightOpen) for (let y = 0; y < TILE; y++) pc.set(x0 + TILE - 1, y0 + y, pal.soilDark);
  if (bottomOpen) {
    pc.fillRect(x0, y0 + TILE - 2, TILE, 2, pal.soilDark);
    if (level.world === 'caves') {
      // Krápniky: úzke trojuholníky visiace zo stropu.
      if (pixelNoise(col, row, 13) < 0.55) {
        const cx = x0 + 3 + Math.floor(pixelNoise(col, row, 14) * 10);
        const len = 4 + Math.floor(pixelNoise(col, row, 15) * 9);
        for (let i = 0; i < len; i++) {
          const w = Math.max(0, Math.floor((1 - i / len) * 2.5));
          for (let dx = -w; dx <= w; dx++)
            pc.set(cx + dx, y0 + TILE + i, dx === -w ? pal.soilDark : pal.soilSpot);
        }
      }
    } else {
      // Visiace korienky.
      for (let x = 1; x < TILE; x += 3) {
        const len = Math.floor(pixelNoise(x0 + x, y0, 9) * 4);
        for (let i = 0; i < len; i++) pc.set(x0 + x, y0 + TILE + i, pal.soilDark);
      }
    }
  }
  if (topOpen) {
    for (let x = 0; x < TILE; x++) {
      const n = pixelNoise(x0 + x, y0, 11);
      const h = 3 + (n < 0.3 ? 1 : 0);
      for (let y = 0; y < h; y++)
        pc.set(x0 + x, y0 + y, y === 0 ? pal.grassLight : y < 2 ? pal.grass : pal.grassDark);
      // Stebielka nad hranou.
      if (n > 0.72) pc.set(x0 + x, y0 - 1, pal.grass);
      if (n > 0.9) pc.set(x0 + x, y0 - 2, pal.grassDark);
    }
    if (leftOpen) pc.set(x0, y0 + 3, pal.grassDark);
    if (rightOpen) pc.set(x0 + TILE - 1, y0 + 3, pal.grassDark);
  }
}

function drawLedge(pc: PixelCanvas, col: number, row: number, level: Level): void {
  const x0 = col * TILE;
  const y0 = row * TILE;
  pc.fillRect(x0, y0, TILE, 4, C.wood);
  pc.fillRect(x0, y0, TILE, 1, C.woodLight);
  pc.fillRect(x0, y0 + 4, TILE, 1, C.woodDark);
  for (let x = 0; x < TILE; x++)
    if (pixelNoise(x0 + x, y0, 21) < 0.15) pc.set(x0 + x, y0 + 2, C.woodDark);
  // Spoje dosiek a laná na koncoch.
  if ((col + row) % 2 === 0) pc.fillRect(x0 + 7, y0, 1, 4, C.woodDark);
  const left = tileAt(level, col - 1, row) !== Tile.Ledge;
  const right = tileAt(level, col + 1, row) !== Tile.Ledge;
  if (left) pc.fillRect(x0 + 1, y0 + 5, 1, 4, C.woodDark);
  if (right) pc.fillRect(x0 + TILE - 2, y0 + 5, 1, 4, C.woodDark);
}

function drawThorns(pc: PixelCanvas, col: number, row: number): void {
  const x0 = col * TILE;
  const y0 = row * TILE;
  for (let x = 0; x < TILE; x++) {
    const h = 5 + Math.floor(pixelNoise(x0 + x, y0, 31) * 5);
    for (let y = 0; y < h; y++) pc.set(x0 + x, y0 + TILE - 1 - y, y > h - 2 ? C.thornTip : C.thorn);
  }
  // Ostne trčiace do strán.
  for (let i = 0; i < 4; i++) {
    const x = x0 + 2 + i * 4;
    const y = y0 + 9 + (i % 2) * 2;
    pc.set(x - 1, y, C.thornTip);
    pc.set(x + 1, y - 1, C.thornTip);
  }
}

export interface Decor {
  kind: 'mushroom' | 'flower' | 'tuft';
  x: number;
  y: number;
}

/** Miesta na hríbiky a kvietky (svietiace hríbiky sú aj malé svetlá). */
export function decorOf(level: Level): Decor[] {
  const out: Decor[] = [];
  for (let row = 1; row < level.height; row++) {
    for (let col = 0; col < level.width; col++) {
      if (tileAt(level, col, row) !== Tile.Ground || tileAt(level, col, row - 1) !== Tile.Empty)
        continue;
      const n = pixelNoise(col, row, 41);
      const x = col * TILE + 3 + Math.floor(pixelNoise(col, row, 42) * 10);
      const y = row * TILE;
      const caves = level.world === 'caves';
      if (n < (caves ? 0.16 : 0.07)) out.push({ kind: 'mushroom', x, y });
      else if (!caves && n < 0.16) out.push({ kind: 'flower', x, y });
      else if (n < 0.4) out.push({ kind: 'tuft', x, y });
    }
  }
  return out;
}

/** Celý terén levelu do jedného plátna (svetelné plošiny zvlášť). */
export function drawTerrain(level: Level): PixelCanvas {
  const pc = new PixelCanvas(level.width * TILE, level.height * TILE);
  pal = TERRAIN[level.world];
  for (let row = 0; row < level.height; row++) {
    for (let col = 0; col < level.width; col++) {
      const tile = level.tiles[row * level.width + col];
      if (tile === Tile.Ground) drawGroundTile(pc, level, col, row);
      else if (tile === Tile.Water) drawWater(pc, level, col, row);
      else if (tile === Tile.Ledge) drawLedge(pc, col, row, level);
      else if (tile === Tile.Thorns) drawThorns(pc, col, row);
    }
  }
  for (const d of decorOf(level)) {
    if (d.kind === 'mushroom') {
      pc.fillRect(d.x, d.y - 2, 1, 2, 0xd8e4e0);
      pc.fillRect(d.x - 1, d.y - 4, 3, 2, C.mushroom);
      pc.set(d.x, d.y - 4, 0xd8fffa);
    } else if (d.kind === 'flower') {
      pc.fillRect(d.x, d.y - 3, 1, 3, C.grassDark);
      pc.set(d.x, d.y - 4, 0xe08ad8);
      pc.set(d.x - 1, d.y - 4, 0xb05aa8);
      pc.set(d.x + 1, d.y - 4, 0xb05aa8);
    } else {
      pc.set(d.x, d.y - 2, pal.grass);
      pc.set(d.x + 1, d.y - 3, pal.grassLight);
      pc.set(d.x + 2, d.y - 2, pal.grass);
      pc.set(d.x + 1, d.y - 1, pal.grassDark);
    }
  }
  return pc;
}

const WATER_DEEP = 0x0a1e38;
const WATER = 0x12345a;
export const WATER_LIGHT = 0x6ab0d8;

/** Voda: tmavomodrá hĺbka, hladinu vlní renderer. */
function drawWater(pc: PixelCanvas, level: Level, col: number, row: number): void {
  const x0 = col * TILE;
  const y0 = row * TILE;
  const surface = tileAt(level, col, row - 1) !== Tile.Water;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const depth = surface ? y / TILE : 1;
      const n = pixelNoise(x0 + x, y0 + y, 17);
      let c = depth < 0.3 ? WATER : WATER_DEEP;
      if (n < 0.03) c = shade(WATER, 1.3);
      if (surface && y < 3) continue; // hladinu kreslí renderer (vlní sa)
      pc.set(x0 + x, y0 + y, c);
    }
  }
}

/** Hladina vody (dve fázy vlnenia), 16×4. */
export function drawWaterSurface(frame: number): PixelCanvas {
  const pc = new PixelCanvas(TILE, 4);
  for (let x = 0; x < TILE; x++) {
    const wave = Math.sin((x + frame * 4) * (Math.PI / 8)) > 0.3 ? 0 : 1;
    pc.set(x, wave, WATER_LIGHT);
    for (let y = wave + 1; y < 4; y++) pc.set(x, y, WATER);
  }
  return pc;
}

/** Drobiaci sa kameň: popraskaná skala. */
export function drawCrumble(): PixelCanvas {
  const pc = new PixelCanvas(TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = pixelNoise(x, y, 101);
      pc.set(x, y, y < 2 ? 0x7a7a94 : n < 0.1 ? 0x3a3a52 : 0x5a5a74);
    }
  }
  // Praskliny.
  for (const [x, y] of [
    [4, 2],
    [5, 3],
    [5, 4],
    [6, 5],
    [6, 6],
    [5, 7],
    [11, 3],
    [10, 4],
    [10, 5],
    [11, 6],
    [12, 7],
    [8, 9],
    [8, 10],
    [9, 11],
    [3, 11],
    [4, 12],
    [4, 13],
    [13, 11],
    [12, 12],
  ] as const)
    pc.set(x, y, 0x24243a);
  pc.fillRect(0, TILE - 1, TILE, 1, 0x2a2a40);
  return pc;
}

/** Mora: svetlé krídla, tmavé telo; dve polohy krídel. */
export function drawMoth(frame: number): PixelCanvas {
  const pc = new PixelCanvas(9, 7);
  const rows =
    frame === 0
      ? ['ww.....ww', 'wwwb.bwww', '.wwbbbww.', '...bbb...', '....b....']
      : ['.........', '.ww...ww.', 'wwwbbbwww', '.wwbbbww.', '....b....'];
  pc.stamp(0, 1, rows, { w: 0xe8dcc0, b: 0x5a4a3a });
  return pc;
}

/** Iskra: malé žeravé jadro. */
export function drawSpark(): PixelCanvas {
  const pc = new PixelCanvas(5, 5);
  pc.stamp(0, 0, ['..y..', '.yWy.', 'yWWWy', '.yWy.', '..y..'], { y: C.flame, W: C.flameHot });
  return pc;
}

/** Jaskynné pozadie: tma s občasnými kryštálikmi. */
export function drawCaveBack(width: number, height: number): PixelCanvas {
  const pc = new PixelCanvas(width, height);
  for (let y = 0; y < height; y++) {
    const t = y / height;
    const base =
      (Math.round(7 + 6 * t) << 16) | (Math.round(8 + 9 * t) << 8) | Math.round(15 + 16 * t);
    for (let x = 0; x < width; x++) {
      const n = pixelNoise(x, y, 111);
      pc.set(x, y, n > 0.998 ? 0x4a8a9a : n > 0.994 ? 0x1e3040 : base);
    }
  }
  return pc;
}

/** Svetelná plošina: zlatistý kryštálový kameň. */
export function drawLightTile(): PixelCanvas {
  const pc = new PixelCanvas(TILE, TILE);
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = pixelNoise(x, y, 51);
      const c =
        y === 0 ? C.flameHot : y < 3 ? C.lightTile : shade(C.lightTile, 0.75 - (y - 3) * 0.1);
      pc.set(x, y, n < 0.1 ? shade(c, 0.85) : c);
    }
  }
  // Kvapky svetla dole.
  for (const [x, len] of [
    [3, 2],
    [8, 3],
    [12, 1],
  ] as const) {
    for (let i = 0; i < len; i++) pc.set(x, 6 + i, shade(C.lightTile, 0.6));
  }
  return pc;
}

const PLAYER_TOP = [
  '...cccc.....',
  '..cccccc....',
  '.cccssss....',
  '.ccsseses...',
  '.ccssssss...',
  '..ccccc.....',
  '.dccccccs...',
  '.dcccccc.l..',
  '.dccccc.byb.',
  '.dccccc.bwb.',
  '..ccccc.bbb.',
];

const PLAYER_LEGS: Record<string, string[]> = {
  idle: ['..dcccd.....', '..dd.dd.....', '..oo.oo.....'],
  run0: ['..dcccd.....', '.dd...dd....', '.oo....oo...'],
  run1: ['..dcccd.....', '...ddd......', '...ooo......'],
  run2: ['..dcccd.....', '..dd.dd.....', '..oo..oo....'],
  run3: ['..dcccd.....', '...ddd......', '...ooo......'],
  jump: ['..dcccd.....', '..ddddd.....', '..oo..oo....'],
  fall: ['..dcccd.....', '.dd...dd....', 'oo.....oo...'],
};

export type PlayerFrame = keyof typeof PLAYER_LEGS;
export const PLAYER_FRAMES = Object.keys(PLAYER_LEGS) as PlayerFrame[];

/** Postavička v kapucni s lampášom (otočená doprava). */
export function drawPlayer(frame: PlayerFrame, breathe = false): PixelCanvas {
  const pc = new PixelCanvas(14, 17);
  const palette = {
    c: C.cloak,
    d: C.cloakDark,
    s: C.skin,
    e: C.outline,
    l: C.brass,
    b: C.brass,
    y: C.flame,
    w: C.flameHot,
    o: C.boots,
  };
  const top = breathe ? PLAYER_TOP.map((r, i) => (i === 0 ? '............' : r)) : PLAYER_TOP;
  pc.stamp(1, breathe ? 2 : 1, top, palette);
  pc.stamp(1, 12, PLAYER_LEGS[frame]!, palette);
  pc.outline(C.outline);
  return pc;
}

/** Tieň: rozstrapkaný chuchvalec tmy s dvoma očami. */
export function drawShade(frame: number, burning = false): PixelCanvas {
  const pc = new PixelCanvas(18, 18);
  const cx = 9;
  const cy = 7;
  for (let y = 0; y < 18; y++) {
    for (let x = 0; x < 18; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      // Hlava je kruh, dole sa rozpadá na cáry.
      const body = dx * dx + dy * dy < 30;
      const tail =
        dy > 0 &&
        dy < 10 - Math.abs(dx) * 0.6 &&
        pixelNoise(x, y + frame * 5, 61) < 0.75 - dy * 0.06;
      if (!body && !tail) continue;
      const inner = dx * dx + dy * dy < 12;
      pc.set(x, y, burning ? (inner ? 0x5a3a6a : 0x3a2440) : inner ? C.shadeInner : C.shade);
    }
  }
  const eye = burning ? 0xffb070 : C.shadeEye;
  pc.fillRect(6, 6, 2, 2, eye);
  pc.fillRect(11, 6, 2, 2, eye);
  return pc;
}

export function drawFirefly(): PixelCanvas {
  const pc = new PixelCanvas(3, 3);
  pc.set(1, 0, C.firefly);
  pc.set(0, 1, C.firefly);
  pc.set(2, 1, C.firefly);
  pc.set(1, 2, C.firefly);
  pc.set(1, 1, 0xffffe0);
  return pc;
}

export function drawCrystal(): PixelCanvas {
  const pc = new PixelCanvas(9, 11);
  pc.stamp(
    0,
    0,
    [
      '....w....',
      '...wcc...',
      '..wccdc..',
      '.wccdccd.',
      'wccdcccdd',
      '.ccdccdd.',
      '..cdcdd..',
      '...cdd...',
      '....d....',
    ],
    { w: 0xffffff, c: C.crystal, d: C.crystalDark },
  );
  pc.outline(C.outline);
  return pc;
}

/** Lampa na stĺpe (bez stĺpa — ten kreslí renderer podľa výšky). */
export function drawLantern(lit: boolean): PixelCanvas {
  const pc = new PixelCanvas(10, 12);
  const glass = lit ? C.flame : 0x2a2a3a;
  const core = lit ? C.flameHot : 0x3a3a4c;
  pc.stamp(
    0,
    0,
    [
      '...bbbb...',
      '..bbbbbb..',
      '..b....b..',
      '..bggggb..',
      '..bgwwgb..',
      '..bgwwgb..',
      '..bggggb..',
      '..bbbbbb..',
      '...bbbb...',
      '....bb....',
      '....bb....',
      '....bb....',
    ],
    { b: C.brass, g: glass, w: core },
  );
  pc.outline(C.outline);
  return pc;
}

export function drawPost(height: number): PixelCanvas {
  const pc = new PixelCanvas(4, Math.max(1, height));
  for (let y = 0; y < height; y++) {
    pc.set(1, y, C.woodDark);
    pc.set(2, y, y % 5 === 0 ? C.woodDark : C.wood);
  }
  return pc;
}

/** Vatra: kamene a polená; plamene sú zvlášť. */
export function drawCampfire(): PixelCanvas {
  const pc = new PixelCanvas(24, 10);
  pc.stamp(
    0,
    0,
    [
      '........ww..ww.........',
      '.......wwwwwww.........',
      '....wwwwwwwwwwww.......',
      '..ssWwwwwwwwwwwwss.....',
      '.sSSssWWWWWWsssSSs.....',
      'sSSSSSssssssSSSSSSs....',
    ],
    { w: C.woodDark, W: C.wood, s: C.stone, S: shade(C.stone, 0.7) },
  );
  return pc;
}

export function drawFlame(variant: number): PixelCanvas {
  const pc = new PixelCanvas(14, 18);
  for (let y = 0; y < 18; y++) {
    for (let x = 0; x < 14; x++) {
      const dx = (x - 7 + 0.5) / 7;
      const t = y / 18; // 0 hore, 1 dole
      const width = Math.sin(t * Math.PI * 0.9) * (0.6 + t * 0.5);
      const wob = Math.sin(y * 0.9 + variant * 2.1) * 0.12;
      const d = Math.abs(dx - wob * (1 - t));
      if (d > width) continue;
      if (pixelNoise(x, y, 71 + variant) < 0.12 && t < 0.4) continue;
      const k = d / Math.max(0.01, width);
      pc.set(x, y, k < 0.35 && t > 0.35 ? C.flameHot : k < 0.7 ? C.flame : C.flameRed);
    }
  }
  return pc;
}

export function drawSign(): PixelCanvas {
  const pc = new PixelCanvas(14, 16);
  pc.fillRect(6, 8, 2, 8, C.woodDark);
  pc.fillRect(1, 1, 12, 8, C.wood);
  pc.fillRect(1, 1, 12, 1, C.woodLight);
  pc.fillRect(1, 8, 12, 1, C.woodDark);
  // Vyrytý symbol svetla.
  pc.stamp(4, 2, ['..y..', '.yyy.', 'yy.yy', '.yyy.', '..y..'], { y: C.flame });
  pc.outline(C.outline);
  return pc;
}

/** Pozadie: hviezdne nebo s prechodom (jedna obrazovka, opakuje sa). */
export function drawSky(width: number, height: number): PixelCanvas {
  const pc = new PixelCanvas(width, height);
  for (let y = 0; y < height; y++) {
    const t = y / height;
    const r = Math.round(0x0a + (0x1b - 0x0a) * t);
    const g = Math.round(0x0c + (0x15 - 0x0c) * t);
    const b = Math.round(0x22 + (0x40 - 0x22) * t);
    for (let x = 0; x < width; x++) {
      const n = pixelNoise(x, y, 81);
      // Jemný dithering medzi pásmami.
      const d = pixelNoise(x, y, 82) < 0.5 ? 0 : 1;
      let color = ((r + d) << 16) | ((g + d) << 8) | (b + d);
      if (n > 0.9975 && t < 0.7) color = 0xd8dcff;
      else if (n > 0.995 && t < 0.7) color = 0x6a6ca0;
      pc.set(x, y, color);
    }
  }
  return pc;
}

export function drawMoon(): PixelCanvas {
  const pc = new PixelCanvas(26, 26);
  for (let y = 0; y < 26; y++) {
    for (let x = 0; x < 26; x++) {
      const d = Math.hypot(x - 12.5, y - 12.5);
      if (d > 12) continue;
      const crater = pixelNoise(Math.floor(x / 3), Math.floor(y / 3), 91) < 0.2;
      pc.set(x, y, d > 11 ? 0xb8c0e8 : crater ? 0xc4ccf0 : C.moon);
    }
  }
  return pc;
}

/** Siluety kopcov alebo stromov, opakovateľné vodorovne. */
export function drawSilhouette(
  width: number,
  height: number,
  color: Rgb,
  kind: 'hills' | 'trees' | 'spikes',
  seed: number,
): PixelCanvas {
  const pc = new PixelCanvas(width, height);
  if (kind === 'spikes') {
    // Stalagmity: úzke špicaté veže.
    const count = Math.floor(width / 18);
    for (let i = 0; i < count; i++) {
      const cx = Math.floor((i + pixelNoise(i, 0, seed) * 0.7) * (width / count));
      const h = height * (0.3 + pixelNoise(i, 1, seed) * 0.65);
      const w = 4 + Math.floor(pixelNoise(i, 2, seed) * 7);
      for (let y = 0; y < h; y++) {
        const half = Math.floor((y / h) * w);
        for (let x = -half; x <= half; x++)
          pc.set((((cx + x) % width) + width) % width, Math.floor(height - h + y), color);
      }
    }
    for (let y = Math.floor(height * 0.9); y < height; y++)
      for (let x = 0; x < width; x++) pc.set(x, y, color);
    return pc;
  }
  if (kind === 'hills') {
    for (let x = 0; x < width; x++) {
      const a = (x / width) * Math.PI * 2;
      const h = height * (0.45 + 0.18 * Math.sin(a * 2 + seed) + 0.1 * Math.sin(a * 5 + seed * 2));
      for (let y = Math.floor(height - h); y < height; y++) pc.set(x, y, color);
    }
    return pc;
  }
  const trees = Math.floor(width / 22);
  for (let i = 0; i < trees; i++) {
    const cx = Math.floor((i + pixelNoise(i, 0, seed) * 0.6) * (width / trees));
    const h = height * (0.55 + pixelNoise(i, 1, seed) * 0.4);
    const top = height - h;
    // Kmeň.
    pc.fillRect(cx - 1, Math.floor(top + h * 0.4), 3, Math.ceil(h * 0.6), color);
    // Smrek z trojuholníkov.
    for (let layer = 0; layer < 4; layer++) {
      const ly = top + layer * h * 0.16;
      const lw = 4 + layer * 3;
      for (let y = 0; y < h * 0.22; y++) {
        const w = Math.floor((y / (h * 0.22)) * lw);
        for (let x = -w; x <= w; x++) {
          const px = (((cx + x) % width) + width) % width;
          pc.set(px, Math.floor(ly + y), color);
        }
      }
    }
  }
  for (let y = Math.floor(height * 0.92); y < height; y++)
    for (let x = 0; x < width; x++) pc.set(x, y, color);
  return pc;
}

/** Mäkký kruhový prechod pre svetlá (biely, priehľadnosť klesá k okraju). */
export function lightCanvas(size: number, inner = 0.3): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    (size / 2) * inner,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function dot(color: Rgb, w = 1, h = 1): PixelCanvas {
  const pc = new PixelCanvas(w, h);
  pc.fillRect(0, 0, w, h, color);
  return pc;
}
