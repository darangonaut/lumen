import { CanvasSource, Container, Graphics, Texture } from 'pixi.js';
import { TILE, Tile, tileAt, type Level, type World } from '@/game/level';
import type { Art } from './art';
import { decorOf, noise as pixelNoise, type PlayerFrame } from './common';

/**
 * Siluetový štýl (v duchu hier Limbo a Badland): popredie je čierne, pozadie farebne žiari
 * a farbu má len to, čo svieti — lampáš, svetlušky, oči tieňov, vatra.
 */
const INK = 0x05060b;
const INK_CSS = '#05060b';
const GLOW = '#fff6c8';
const GOLD = '#ffd35a';
const EMBER = '#ff8a3a';

type Ctx = CanvasRenderingContext2D;

/** Nakreslí sprite cez Canvas 2D v rozlíšení R× (rozmery w×h sú v jednotkách sveta). */
function paint(w: number, h: number, draw: (ctx: Ctx) => void, resolution = 8): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(w * resolution));
  canvas.height = Math.max(1, Math.ceil(h * resolution));
  const ctx = canvas.getContext('2d')!;
  ctx.scale(resolution, resolution);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  draw(ctx);
  const source = new CanvasSource({ resource: canvas, resolution, scaleMode: 'linear' });
  return new Texture({ source });
}

function circle(ctx: Ctx, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, width: number): void {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function glowDot(ctx: Ctx, x: number, y: number, r: number, inner: string, outer: string): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// --- Postavička ---
const LEGS: Record<PlayerFrame, [number, number][]> = {
  idle: [
    [4.7, 0],
    [7.3, 0],
  ],
  run0: [
    [4.6, -1.7],
    [7.4, 1.8],
  ],
  run1: [
    [5.6, -0.3],
    [6.6, 0.4],
  ],
  run2: [
    [4.8, -1],
    [7.2, 1.2],
  ],
  run3: [
    [5.8, 0.3],
    [6.4, -0.4],
  ],
  jump: [
    [4.9, 0.9],
    [7.3, 1.3],
  ],
  fall: [
    [4.2, -1.9],
    [7.8, 1.9],
  ],
};

function player(frame: PlayerFrame | 'breathe'): Texture {
  const breathe = frame === 'breathe';
  const legs = LEGS[breathe ? 'idle' : frame]!;
  const dy = breathe ? 0.45 : 0;
  return paint(14, 17, (ctx) => {
    ctx.fillStyle = INK_CSS;
    ctx.strokeStyle = INK_CSS;
    // Nohy.
    const legEnd = frame === 'jump' ? 14.6 : 15.4;
    for (const [x, lean] of legs) line(ctx, x, 12.6, x + lean, legEnd, 1.35);
    // Plášť (mierne rozšírený, s rozstrapkaným lemom).
    ctx.beginPath();
    ctx.moveTo(3.8, 6.6 + dy);
    ctx.lineTo(8.6, 6.6 + dy);
    ctx.lineTo(9.7, 13.1);
    ctx.lineTo(8.7, 12.6);
    ctx.lineTo(7.6, 13.3);
    ctx.lineTo(6.2, 12.7);
    ctx.lineTo(4.9, 13.3);
    ctx.lineTo(3.7, 12.7);
    ctx.lineTo(2.5, 13.2);
    ctx.closePath();
    ctx.fill();
    // Hlava a kapucňa s cípom vzadu.
    circle(ctx, 6.5, 4.5 + dy, 3.1);
    ctx.beginPath();
    ctx.moveTo(4.2, 2.4 + dy);
    ctx.quadraticCurveTo(1.6, 4.2 + dy, 1.4, 8.2 + dy);
    ctx.lineTo(4.6, 6.6 + dy);
    ctx.closePath();
    ctx.fill();
    // Ruka s lampášom.
    line(ctx, 8.1, 8.4 + dy, 10.7, 9.3 + dy, 1.3);
    line(ctx, 10.9, 9.2 + dy, 11.1, 10.1 + dy, 0.6);
    ctx.fillRect(9.9, 10 + dy, 2.5, 3.6);
    ctx.fillRect(10.2, 9.6 + dy, 1.9, 0.6);
    const g = ctx.createLinearGradient(0, 10.5 + dy, 0, 13.2 + dy);
    g.addColorStop(0, GLOW);
    g.addColorStop(1, GOLD);
    ctx.fillStyle = g;
    ctx.fillRect(10.4, 10.5 + dy, 1.5, 2.6);
    // Oko.
    ctx.fillStyle = '#e8f4ff';
    circle(ctx, 7.9, 4.3 + dy, 0.55);
  });
}

// --- Tiene a mory ---
function shadeBody(ctx: Ctx, frame: number): void {
  circle(ctx, 9, 7, 5.6);
  for (let i = -1; i <= 1; i++) {
    const x = 9 + i * 3;
    const tipX = x + i * 0.8 + Math.sin(frame * 2.1 + i * 1.7) * 1.6;
    const tipY = 15.5 + Math.cos(frame * 1.7 + i) * 1;
    ctx.beginPath();
    ctx.moveTo(x - 2, 9.5);
    ctx.quadraticCurveTo(x - 1.2, 13, tipX, tipY);
    ctx.quadraticCurveTo(x + 1.4, 13, x + 2, 9.5);
    ctx.closePath();
    ctx.fill();
  }
}

function shade(frame: number, burning: boolean): Texture {
  return paint(18, 18, (ctx) => {
    if (burning) {
      ctx.shadowColor = EMBER;
      ctx.shadowBlur = 24;
    }
    ctx.fillStyle = burning ? '#2a1420' : INK_CSS;
    shadeBody(ctx, frame);
  });
}

function eyes(): Texture {
  return paint(18, 18, (ctx) => {
    ctx.shadowColor = '#cfe8ff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#eef8ff';
    for (const x of [6.9, 11.6]) {
      ctx.beginPath();
      ctx.ellipse(x, 6.8, 1.05, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function moth(frame: number): Texture {
  return paint(9, 7, (ctx) => {
    ctx.fillStyle = 'rgba(214,204,178,0.85)';
    const up = frame === 0;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(
        4.5 + side * 2.2,
        up ? 2.6 : 4,
        2.3,
        up ? 1.9 : 1.3,
        side * (up ? 0.5 : 0.15),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = INK_CSS;
    ctx.beginPath();
    ctx.ellipse(4.5, 4.3, 0.9, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// --- Svetlá a predmety ---
function firefly(): Texture {
  return paint(3, 3, (ctx) => glowDot(ctx, 1.5, 1.5, 1.5, '#ffffe8', '#d9f56a'), 12);
}

function spark(): Texture {
  return paint(5, 5, (ctx) => glowDot(ctx, 2.5, 2.5, 2.5, '#fffbe0', GOLD), 10);
}

function crystal(): Texture {
  return paint(9, 11, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 9, 11);
    g.addColorStop(0, '#f0ffff');
    g.addColorStop(0.5, '#8ff0ff');
    g.addColorStop(1, '#2f88b8');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(4.5, 0.4);
    ctx.lineTo(8.5, 4.6);
    ctx.lineTo(4.5, 10.6);
    ctx.lineTo(0.5, 4.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    line(ctx, 0.5, 4.6, 8.5, 4.6, 0.4);
    line(ctx, 4.5, 0.4, 3.2, 4.6, 0.4);
    line(ctx, 3.2, 4.6, 4.5, 10.6, 0.4);
  });
}

function lantern(lit: boolean): Texture {
  return paint(10, 12, (ctx) => {
    ctx.fillStyle = INK_CSS;
    ctx.beginPath();
    ctx.moveTo(3.2, 0.4);
    ctx.lineTo(6.8, 0.4);
    ctx.lineTo(8, 2.1);
    ctx.lineTo(2, 2.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(2.3, 2, 5.4, 6.4);
    ctx.fillRect(3, 8.2, 4, 1);
    ctx.fillRect(4.3, 9, 1.4, 3);
    if (lit) {
      const g = ctx.createLinearGradient(0, 3, 0, 7.4);
      g.addColorStop(0, GLOW);
      g.addColorStop(1, GOLD);
      ctx.fillStyle = g;
    } else ctx.fillStyle = '#1c2232';
    ctx.fillRect(3.3, 3.1, 3.4, 4.3);
  });
}

function post(height: number): Texture {
  return paint(
    4,
    Math.max(1, height),
    (ctx) => {
      ctx.fillStyle = INK_CSS;
      ctx.fillRect(1.2, 0, 1.6, height);
      ctx.fillRect(0.4, height - 1.4, 3.2, 1.4);
    },
    4,
  );
}

function flame(variant: number): Texture {
  return paint(14, 18, (ctx) => {
    const layers: [number, number, string][] = [
      [6.2, 17, EMBER],
      [4.4, 13, GOLD],
      [2.4, 8.5, GLOW],
    ];
    for (const [w, h, color] of layers) {
      const tip = 7 + Math.sin(variant * 2.1 + w) * 1.6;
      const bottom = 17.6;
      const top = bottom - h;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(tip, top);
      ctx.bezierCurveTo(7 + w, top + h * 0.45, 7 + w * 0.95, bottom, 7, bottom);
      ctx.bezierCurveTo(7 - w * 0.95, bottom, 7 - w, top + h * 0.45, tip, top);
      ctx.fill();
    }
  });
}

function campfire(): Texture {
  return paint(24, 10, (ctx) => {
    ctx.fillStyle = INK_CSS;
    ctx.strokeStyle = INK_CSS;
    line(ctx, 4, 9, 15, 4.2, 2.2);
    line(ctx, 16, 9, 6, 4.2, 2.2);
    for (const [x, r] of [
      [1.8, 1.8],
      [5, 1.5],
      [8.5, 1.7],
      [12, 1.4],
      [15.2, 1.8],
      [18.4, 1.5],
    ] as const)
      circle(ctx, x, 10 - r * 0.7, r);
  });
}

function sign(): Texture {
  return paint(14, 16, (ctx) => {
    ctx.fillStyle = INK_CSS;
    ctx.fillRect(6.2, 8, 1.6, 8);
    ctx.beginPath();
    ctx.roundRect(1, 1, 12, 7.6, 1);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(7, 4.8, 1.2, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      line(
        ctx,
        7 + Math.cos(a) * 1.9,
        4.8 + Math.sin(a) * 1.9,
        7 + Math.cos(a) * 2.8,
        4.8 + Math.sin(a) * 2.8,
        0.55,
      );
    }
  });
}

function lightTile(): Texture {
  return paint(TILE, TILE, (ctx) => {
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 20;
    const g = ctx.createLinearGradient(0, 0, 0, 5);
    g.addColorStop(0, GLOW);
    g.addColorStop(1, '#ffcf7a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(0.2, 0.6, 15.6, 4.4, 1.6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,214,140,0.7)';
    for (const [x, len] of [
      [3.5, 2.2],
      [8.5, 3.2],
      [12.5, 1.4],
    ] as const) {
      ctx.beginPath();
      ctx.roundRect(x - 0.5, 4.5, 1, len, 0.5);
      ctx.fill();
    }
  });
}

const WATER = '#0b2a38';

function water(frame: number): Texture {
  return paint(TILE, 4, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(0, 4);
    for (let x = 0; x <= TILE; x += 0.5)
      ctx.lineTo(x, 1.4 + Math.sin(((x + frame * 4) * Math.PI) / 8) * 0.6);
    ctx.lineTo(TILE, 4);
    ctx.closePath();
    ctx.fillStyle = WATER;
    ctx.fill();
    ctx.strokeStyle = '#7fd0e0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let x = 0; x <= TILE; x += 0.5) {
      const y = 1.4 + Math.sin(((x + frame * 4) * Math.PI) / 8) * 0.6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

function crumble(): Texture {
  return paint(TILE, TILE, (ctx) => {
    ctx.fillStyle = '#0e1019';
    ctx.beginPath();
    ctx.roundRect(0.2, 0.2, 15.6, 15.6, 1.2);
    ctx.fill();
    ctx.strokeStyle = '#3c4660';
    ctx.lineWidth = 0.55;
    for (const crack of [
      [4, 0.5, 5, 3.5, 6.2, 6, 5.2, 8.5],
      [11, 0.5, 10.2, 3.8, 11.8, 6.5, 12.6, 9],
      [8, 8.5, 8.8, 11.5, 7.6, 15.5],
      [2, 10, 4, 12.5, 3.5, 15.5],
    ]) {
      ctx.beginPath();
      ctx.moveTo(crack[0]!, crack[1]!);
      for (let i = 2; i < crack.length; i += 2) ctx.lineTo(crack[i]!, crack[i + 1]!);
      ctx.stroke();
    }
  });
}

function moon(): Texture {
  return paint(
    26,
    26,
    (ctx) => {
      glowDot(ctx, 13, 13, 13, 'rgba(230,236,255,0.5)', 'rgba(200,215,255,0.18)');
      ctx.fillStyle = '#e6ecff';
      circle(ctx, 13, 13, 8.5);
      ctx.fillStyle = '#cdd6f2';
      circle(ctx, 10.5, 11, 1.8);
      circle(ctx, 15.5, 15, 1.2);
      circle(ctx, 14.5, 9.5, 0.9);
    },
    6,
  );
}

// --- Pozadie ---
function sky(world: World): Texture {
  return paint(
    320,
    240,
    (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 240);
      const stops =
        world === 'caves'
          ? ['#04070f', '#081628', '#0f3346', '#1d5a68']
          : ['#120c2a', '#2a2350', '#3d5a7c', '#86b0aa'];
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 320, 240);
      // Hviezdy alebo kryštáliky v skale.
      for (let i = 0; i < 70; i++) {
        const x = pixelNoise(i, 1, 201) * 320;
        const y = pixelNoise(i, 2, 201) * 170;
        const r = 0.3 + pixelNoise(i, 3, 201) * 0.6;
        ctx.fillStyle = world === 'caves' ? 'rgba(120,220,230,0.6)' : 'rgba(235,235,255,0.75)';
        circle(ctx, x, y, r);
      }
    },
    3,
  );
}

/**
 * Spodný okraj vrstvy nechá priehľadný: textúra sa opakuje aj zvisle a vyhladzovanie by inak
 * prenieslo plný spodok na horný okraj (tenká čiara cez oblohu). Spodok je mimo obrazovky.
 */
function seamless(ctx: Ctx, w: number, h: number): void {
  ctx.clearRect(0, h - 1.5, w, 1.5);
}

/** Opakovateľný obrys: tvar sa nakreslí aj posunutý o šírku, aby sa okraje napojili. */
function wrapped(width: number, draw: (offset: number) => void): void {
  for (const offset of [-width, 0, width]) draw(offset);
}

function far(world: World): Texture {
  const W = 480;
  const H = 110;
  return paint(
    W,
    H,
    (ctx) => {
      ctx.fillStyle = world === 'caves' ? '#0c1b2b' : '#1a2b44';
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) {
        const a = (x / W) * Math.PI * 2;
        const h =
          world === 'caves'
            ? H * (0.5 + 0.18 * Math.sin(a * 3 + 1) + 0.12 * Math.abs(Math.sin(a * 11 + 2)))
            : H * (0.45 + 0.15 * Math.sin(a * 2 + 1) + 0.08 * Math.sin(a * 5 + 2));
        ctx.lineTo(x, H - h);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      // Hmla pri zemi.
      ctx.globalCompositeOperation = 'source-atop';
      const fog = ctx.createLinearGradient(0, H * 0.4, 0, H);
      fog.addColorStop(0, 'rgba(0,0,0,0)');
      fog.addColorStop(1, world === 'caves' ? 'rgba(40,110,130,0.45)' : 'rgba(110,150,170,0.45)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, W, H);
      seamless(ctx, W, H);
    },
    3,
  );
}

function near(world: World): Texture {
  const W = 400;
  const H = 130;
  return paint(
    W,
    H,
    (ctx) => {
      ctx.fillStyle = world === 'caves' ? '#060d17' : '#0b1322';
      if (world === 'caves') {
        // Stalagmity.
        for (let i = 0; i < 22; i++) {
          const cx = (i + pixelNoise(i, 0, 211) * 0.7) * (W / 22);
          const h = H * (0.3 + pixelNoise(i, 1, 211) * 0.65);
          const w = 4 + pixelNoise(i, 2, 211) * 8;
          wrapped(W, (o) => {
            ctx.beginPath();
            ctx.moveTo(cx + o - w, H);
            ctx.quadraticCurveTo(cx + o - w * 0.3, H - h * 0.5, cx + o, H - h);
            ctx.quadraticCurveTo(cx + o + w * 0.3, H - h * 0.5, cx + o + w, H);
            ctx.fill();
          });
        }
      } else {
        // Smreky a okrúhle koruny listnáčov.
        for (let i = 0; i < 18; i++) {
          const cx = (i + pixelNoise(i, 0, 221) * 0.6) * (W / 18);
          const h = H * (0.55 + pixelNoise(i, 1, 221) * 0.4);
          const round = pixelNoise(i, 3, 221) < 0.3;
          wrapped(W, (o) => {
            const x = cx + o;
            ctx.fillRect(x - 1.2, H - h * 0.55, 2.4, h * 0.55);
            if (round) {
              circle(ctx, x, H - h * 0.75, h * 0.2);
              circle(ctx, x - h * 0.12, H - h * 0.62, h * 0.15);
              circle(ctx, x + h * 0.13, H - h * 0.64, h * 0.16);
              return;
            }
            for (let layer = 0; layer < 4; layer++) {
              const top = H - h + layer * h * 0.17;
              const lw = 4 + layer * 3.4;
              ctx.beginPath();
              ctx.moveTo(x, top);
              ctx.quadraticCurveTo(x + lw * 0.5, top + h * 0.12, x + lw, top + h * 0.24);
              ctx.lineTo(x - lw, top + h * 0.24);
              ctx.quadraticCurveTo(x - lw * 0.5, top + h * 0.12, x, top);
              ctx.fill();
            }
          });
        }
      }
      ctx.fillRect(0, H * 0.9, W, H * 0.1);
      seamless(ctx, W, H);
    },
    3,
  );
}

// --- Terén (PixiJS vektory) ---
function terrain(level: Level): Container {
  const g = new Graphics();
  const caves = level.world === 'caves';
  const ground = (c: number, r: number) => tileAt(level, c, r) === Tile.Ground;

  // Zem po vodorovných úsekoch (s presahom, aby medzi políčkami neboli švy).
  for (let row = 0; row < level.height; row++) {
    let start = -1;
    for (let col = 0; col <= level.width; col++) {
      const is = col < level.width && ground(col, row);
      if (is && start < 0) start = col;
      if (!is && start >= 0) {
        g.rect(start * TILE - 0.3, row * TILE - 0.3, (col - start) * TILE + 0.6, TILE + 0.6).fill(
          INK,
        );
        start = -1;
      }
    }
  }

  for (let row = 0; row < level.height; row++) {
    for (let col = 0; col < level.width; col++) {
      const x0 = col * TILE;
      const y0 = row * TILE;
      const tile = tileAt(level, col, row);
      if (tile === Tile.Ground) {
        if (!ground(col, row - 1) && row > 0) {
          // Nerovný vrch: hrbolčeky a steblá trávy (v jaskyni mach).
          for (let i = 0; i < 3; i++) {
            const bx = x0 + 2 + pixelNoise(col * 3 + i, row, 301) * 12;
            g.ellipse(
              bx,
              y0,
              2 + pixelNoise(col, row * 3 + i, 302) * 3,
              0.8 + pixelNoise(col, i, 303) * 1.2,
            ).fill(INK);
          }
          const blades = caves ? 2 : 6;
          for (let i = 0; i < blades; i++) {
            const bx = x0 + pixelNoise(col * 7 + i, row, 304) * TILE;
            const h = caves
              ? 1 + pixelNoise(col, row * 7 + i, 305) * 1.5
              : 1.5 + pixelNoise(col, row * 7 + i, 305) * 3.5;
            const lean = (pixelNoise(col + i, row, 306) - 0.5) * 2;
            g.poly([bx - 0.7, y0 + 0.5, bx + 0.7, y0 + 0.5, bx + lean, y0 - h]).fill(INK);
          }
        }
        if (
          row + 1 < level.height &&
          !ground(col, row + 1) &&
          tileAt(level, col, row + 1) !== Tile.Water
        ) {
          if (caves) {
            // Krápniky.
            if (pixelNoise(col, row, 307) < 0.6) {
              const cx = x0 + 3 + pixelNoise(col, row, 308) * 10;
              const len = 4 + pixelNoise(col, row, 309) * 10;
              const w = 1.5 + pixelNoise(col, row, 310) * 1.5;
              g.poly([cx - w, y0 + TILE, cx + w, y0 + TILE, cx, y0 + TILE + len]).fill(INK);
            }
          } else {
            // Korienky.
            for (let i = 0; i < 2; i++) {
              const rx = x0 + 3 + pixelNoise(col * 2 + i, row, 311) * 10;
              const len = 2 + pixelNoise(col, row * 2 + i, 312) * 5;
              g.moveTo(rx, y0 + TILE)
                .quadraticCurveTo(rx + 1.5, y0 + TILE + len * 0.6, rx - 0.5, y0 + TILE + len)
                .stroke({ width: 0.7, color: INK });
            }
          }
        }
        for (const side of [-1, 1]) {
          if (ground(col + side, row) || pixelNoise(col, row + side, 313) > 0.4) continue;
          // Výčnelok na boku.
          const sx = side < 0 ? x0 : x0 + TILE;
          g.ellipse(
            sx,
            y0 + 4 + pixelNoise(col, row, 314) * 8,
            1.2,
            2 + pixelNoise(row, col, 315) * 2,
          ).fill(INK);
        }
      } else if (tile === Tile.Ledge) {
        g.roundRect(x0 - 0.2, y0, TILE + 0.4, 3, 0.8).fill(INK);
        if (tileAt(level, col - 1, row) !== Tile.Ledge) g.rect(x0 + 1, y0 + 2, 1, 4).fill(INK);
        if (tileAt(level, col + 1, row) !== Tile.Ledge)
          g.rect(x0 + TILE - 2, y0 + 2, 1, 4).fill(INK);
      } else if (tile === Tile.Thorns) {
        const points: number[] = [x0, y0 + TILE];
        for (let i = 0; i <= 6; i++) {
          const x = x0 + (i / 6) * TILE;
          const peak = 6 + pixelNoise(col * 7 + i, row, 316) * 4;
          points.push(x - 1.3, y0 + TILE - 3, x, y0 + TILE - peak, x + 1.3, y0 + TILE - 3);
        }
        points.push(x0 + TILE, y0 + TILE);
        g.poly(points).fill(INK);
      } else if (tile === Tile.Water) {
        const surface = tileAt(level, col, row - 1) !== Tile.Water;
        g.rect(x0 - 0.2, y0 + (surface ? 3 : 0), TILE + 0.4, surface ? TILE - 3 : TILE).fill({
          color: 0x0b2a38,
          alpha: 0.95,
        });
      }
    }
  }

  // Svietiace hríbiky (farbu majú, lebo svietia).
  for (const d of decorOf(level)) {
    if (d.kind !== 'mushroom') continue;
    g.rect(d.x - 0.3, d.y - 2.4, 0.8, 2.4).fill(INK);
    g.ellipse(d.x + 0.1, d.y - 2.6, 1.8, 1).fill(0x6cf0e0);
  }
  const c = new Container();
  c.addChild(g);
  return c;
}

function dot(color: string, size: number): Texture {
  return paint(
    size,
    size,
    (ctx) => {
      ctx.fillStyle = color;
      circle(ctx, size / 2, size / 2, size / 2);
    },
    8,
  );
}

export const vectorArt: Art = {
  dot,
  darkness: (world) => (world === 'caves' ? 0.7 : 0.6),
  terrain,
  player,
  shade,
  eyes,
  firefly,
  crystal,
  lantern,
  post,
  flame,
  campfire,
  sign,
  lightTile,
  moth,
  spark,
  water,
  crumble,
  moon,
  sky,
  far,
  near,
};
