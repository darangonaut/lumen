import { Container, Sprite, Texture } from 'pixi.js';
import type { Level, World } from '@/game/level';
import type { PixelCanvas } from './PixelCanvas';
import {
  C,
  drawCampfire,
  drawCaveBack,
  drawCrumble,
  drawCrystal,
  drawFirefly,
  drawFlame,
  drawLantern,
  drawLightTile,
  drawMoon,
  drawMoth,
  drawPlayer,
  drawPost,
  drawShade,
  drawSign,
  drawSilhouette,
  drawSky,
  drawSpark,
  drawTerrain,
  drawWaterSurface,
  type PlayerFrame,
} from './sprites';

export type ArtStyle = 'pixel' | 'vector';

/**
 * Sada kreslenia: všetky textúry a terén v jednom štýle. Rozmery textúr sú v oboch štýloch
 * rovnaké (v jednotkách sveta), takže renderer s nimi zaobchádza rovnako.
 */
export interface Art {
  readonly style: ArtStyle;
  /** Ostré pixely: polohy sa zaokrúhľujú na celé pixely sveta. */
  readonly snap: boolean;
  /** Sila tmy podľa sveta (0–1). */
  darkness(world: World): number;
  terrain(level: Level): Container;
  player(frame: PlayerFrame | 'breathe'): Texture;
  shade(frame: number, burning: boolean): Texture;
  eyes(): Texture;
  firefly(): Texture;
  crystal(): Texture;
  lantern(lit: boolean): Texture;
  post(height: number): Texture;
  flame(variant: number): Texture;
  campfire(): Texture;
  sign(): Texture;
  lightTile(): Texture;
  moth(frame: number): Texture;
  spark(): Texture;
  water(frame: number): Texture;
  crumble(): Texture;
  moon(): Texture;
  sky(world: World): Texture;
  far(world: World): Texture;
  near(world: World): Texture;
}

export function pixelTexture(pc: PixelCanvas): Texture {
  const t = Texture.from(pc.toCanvas());
  t.source.scaleMode = 'nearest';
  return t;
}

/** Pôvodný pixel art (sprites.ts). */
export const pixelArt: Art = {
  style: 'pixel',
  snap: true,
  darkness: (world) => (world === 'caves' ? 0.95 : 0.92),
  terrain: (level) => {
    const c = new Container();
    c.addChild(new Sprite(pixelTexture(drawTerrain(level))));
    return c;
  },
  player: (frame) =>
    pixelTexture(frame === 'breathe' ? drawPlayer('idle', true) : drawPlayer(frame)),
  shade: (frame, burning) => pixelTexture(drawShade(frame, burning)),
  eyes: () => {
    const pc = drawShade(0);
    // Len oči: ostatné pixely zmaž.
    for (let y = 0; y < pc.height; y++)
      for (let x = 0; x < pc.width; x++) if (pc.get(x, y) !== C.shadeEye) pc.set(x, y, 0, 0);
    return pixelTexture(pc);
  },
  firefly: () => pixelTexture(drawFirefly()),
  crystal: () => pixelTexture(drawCrystal()),
  lantern: (lit) => pixelTexture(drawLantern(lit)),
  post: (height) => pixelTexture(drawPost(height)),
  flame: (variant) => pixelTexture(drawFlame(variant)),
  campfire: () => pixelTexture(drawCampfire()),
  sign: () => pixelTexture(drawSign()),
  lightTile: () => pixelTexture(drawLightTile()),
  moth: (frame) => pixelTexture(drawMoth(frame)),
  spark: () => pixelTexture(drawSpark()),
  water: (frame) => pixelTexture(drawWaterSurface(frame)),
  crumble: () => pixelTexture(drawCrumble()),
  moon: () => pixelTexture(drawMoon()),
  sky: (world) => pixelTexture(world === 'caves' ? drawCaveBack(320, 240) : drawSky(320, 240)),
  far: (world) =>
    pixelTexture(
      world === 'caves'
        ? drawSilhouette(480, 110, 0x111522, 'hills', 3)
        : drawSilhouette(480, 110, C.hill, 'hills', 1),
    ),
  near: (world) =>
    pixelTexture(
      world === 'caves'
        ? drawSilhouette(400, 130, 0x0b0e1a, 'spikes', 4)
        : drawSilhouette(400, 130, C.trees, 'trees', 2),
    ),
};

const STYLE_KEY = 'lumen.style';

export function savedStyle(): ArtStyle {
  try {
    return localStorage.getItem(STYLE_KEY) === 'vector' ? 'vector' : 'pixel';
  } catch {
    return 'pixel';
  }
}

export function saveStyle(style: ArtStyle): void {
  try {
    localStorage.setItem(STYLE_KEY, style);
  } catch {
    // úložisko nedostupné
  }
}
