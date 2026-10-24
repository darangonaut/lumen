import type { Container, Texture } from 'pixi.js';
import type { Level, World } from '@/game/level';
import type { PlayerFrame } from './common';

/**
 * Sada kreslenia: všetky textúry a terén. Rozmery textúr sú v jednotkách sveta
 * (políčko = 16), renderer s nimi zaobchádza ako so spritmi.
 */
export interface Art {
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
  /** Okrúhla častica danej farby a priemeru. */
  dot(color: string, size: number): Texture;
  sky(world: World): Texture;
  far(world: World): Texture;
  near(world: World): Texture;
}
