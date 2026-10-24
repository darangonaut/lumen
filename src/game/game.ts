import { TILE, Tile, tileAt, type Level, type Point, type Sign } from './level';
import { Rng } from './rng';

export interface Input {
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  flare: boolean;
}

export const NO_INPUT: Input = {
  left: false,
  right: false,
  down: false,
  jump: false,
  flare: false,
};

// --- Pohyb (px, s) ---
export const GRAVITY = 1100;
const MAX_FALL = 380;
export const RUN_SPEED = 105;
const GROUND_ACCEL = 1000;
const AIR_ACCEL = 650;
const FRICTION = 1200;
export const JUMP_SPEED = 345;
const JUMP_CUT = 0.45;
const COYOTE = 0.1;
const JUMP_BUFFER = 0.12;
export const PLAYER_W = 8;
export const PLAYER_H = 13;

// --- Svetlo a olej ---
export const OIL_MAX = 100;
export const OIL_DRAIN = 1.2;
export const FLARE_DRAIN = 16;
export const FIREFLY_OIL = 8;
const SHADE_HIT_OIL = 18;
export const LIGHT_RADIUS = 78;
export const FLARE_RADIUS = 150;
export const EMBER_RADIUS = 20;
export const LANTERN_RADIUS = 72;
/** Koľko sekúnd vydrží hráč v úplnej tme (bez oleja), kým ho tma pohltí. */
export const DREAD_LIMIT = 4;
const RESPAWN_DELAY = 1.1;

export type GameEvent =
  | { type: 'jump' }
  | { type: 'land' }
  | { type: 'firefly'; x: number; y: number }
  | { type: 'crystal'; x: number; y: number }
  | { type: 'lantern'; x: number; y: number }
  | { type: 'flare' }
  | { type: 'hurt' }
  | { type: 'shadeDie'; x: number; y: number }
  | { type: 'lunge' }
  | { type: 'died'; cause: 'thorns' | 'fall' | 'dark' }
  | { type: 'respawn' }
  | { type: 'exit' };

export interface Player {
  /** Ľavý horný roh hitboxu. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  invulnerable: number;
}

export interface Shade {
  x: number;
  y: number;
  home: Point;
  vx: number;
  vy: number;
  alive: boolean;
  active: boolean;
  /** 0–1, svetlo ho spaľuje. */
  hp: number;
  state: 'stalk' | 'lunge' | 'recoil';
  timer: number;
  angle: number;
  dirX: number;
  dirY: number;
  /** Práve horí vo svetle (pre efekty). */
  burning: boolean;
}

export interface Pickup extends Point {
  taken: boolean;
}

export interface Lantern extends Point {
  lit: boolean;
}

export interface LightSource extends Point {
  radius: number;
}

export class Game {
  readonly player: Player;
  oil = OIL_MAX;
  /** Aktuálny polomer svetla lampáša (plynule sa mení). */
  radius = LIGHT_RADIUS;
  flaring = false;
  /** Sekundy strávené v úplnej tme. */
  dread = 0;
  time = 0;
  deaths = 0;
  state: 'play' | 'dead' | 'done' = 'play';
  readonly fireflies: Pickup[];
  readonly crystals: Pickup[];
  readonly lanterns: Lantern[];
  readonly shades: Shade[];
  exitLit = false;
  /** Tabuľa, pri ktorej hráč stojí (rada na obrazovke). */
  sign: Sign | null = null;
  private checkpoint: Point;
  private coyote = 0;
  private jumpBuffer = 0;
  private jumpHeld = false;
  private flareHeld = false;
  private deadTimer = 0;
  private rng: Rng;
  private events: GameEvent[] = [];

  constructor(readonly level: Level) {
    this.rng = new Rng(hash(level.id));
    this.checkpoint = { ...level.start };
    this.player = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      invulnerable: 0,
    };
    this.placePlayer(level.start);
    this.fireflies = level.fireflies.map((p) => ({ ...p, taken: false }));
    this.crystals = level.crystals.map((p) => ({ ...p, taken: false }));
    this.lanterns = level.lanterns.map((p) => ({ ...p, lit: false }));
    this.shades = level.shades.map((p) => ({
      x: p.x,
      y: p.y,
      home: { ...p },
      vx: 0,
      vy: 0,
      alive: true,
      active: false,
      hp: 1,
      state: 'stalk',
      timer: 2 + this.rng.next() * 2,
      angle: this.rng.next() * Math.PI * 2,
      dirX: 0,
      dirY: 0,
      burning: false,
    }));
  }

  /** Stred hráča. */
  get center(): Point {
    return { x: this.player.x + PLAYER_W / 2, y: this.player.y + PLAYER_H / 2 };
  }

  /** Poloha plameňa (lampáš v ruke pred hráčom). */
  get lamp(): Point {
    return { x: this.player.x + PLAYER_W / 2 + this.player.facing * 5, y: this.player.y + 6 };
  }

  get fireflyCount(): number {
    return this.fireflies.filter((f) => f.taken).length;
  }

  get crystalCount(): number {
    return this.crystals.filter((c) => c.taken).length;
  }

  /** Všetky svetlá, ktoré odháňajú tiene a zhmotňujú svetelné plošiny. */
  lights(): LightSource[] {
    const lights: LightSource[] = [];
    if (this.state !== 'dead') lights.push({ ...this.lamp, radius: this.radius });
    for (const l of this.lanterns)
      if (l.lit) lights.push({ x: l.x, y: l.y, radius: LANTERN_RADIUS });
    if (this.exitLit) lights.push({ ...this.level.exit, radius: LANTERN_RADIUS * 1.5 });
    return lights;
  }

  /** Je políčko (aspoň jeho časť) vo svetle? */
  isTileLit(col: number, row: number, lights = this.lights()): boolean {
    const x0 = col * TILE;
    const y0 = row * TILE;
    return lights.some((l) => {
      const nx = Math.max(x0, Math.min(l.x, x0 + TILE));
      const ny = Math.max(y0, Math.min(l.y, y0 + TILE));
      return Math.hypot(l.x - nx, l.y - ny) < l.radius * 0.85;
    });
  }

  step(dt: number, input: Input): GameEvent[] {
    this.events = [];
    if (this.state === 'done') return this.events;
    this.time += dt;
    if (this.state === 'dead') {
      this.deadTimer -= dt;
      if (this.deadTimer <= 0) this.respawn();
      this.updateShades(dt);
      return this.events;
    }
    this.updateLight(dt, input);
    this.updatePlayer(dt, input);
    if (this.state === 'play') this.updateShades(dt);
    if (this.state === 'play') this.collect();
    return this.events;
  }

  private updateLight(dt: number, input: Input): void {
    const wantsFlare = input.flare && this.oil > 0;
    if (wantsFlare && !this.flareHeld) this.events.push({ type: 'flare' });
    this.flareHeld = wantsFlare;
    this.flaring = wantsFlare;
    this.oil = Math.max(0, this.oil - (wantsFlare ? FLARE_DRAIN : OIL_DRAIN) * dt);
    const target = this.flaring ? FLARE_RADIUS : baseRadius(this.oil);
    this.radius += (target - this.radius) * Math.min(1, dt * (this.flaring ? 10 : 4));
    if (this.oil <= 0) {
      this.dread += dt;
      if (this.dread >= DREAD_LIMIT) this.die('dark');
    } else {
      this.dread = Math.max(0, this.dread - dt * 3);
    }
  }

  private updatePlayer(dt: number, input: Input): void {
    const p = this.player;
    p.invulnerable = Math.max(0, p.invulnerable - dt);
    const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (move !== 0) {
      p.facing = move > 0 ? 1 : -1;
      const accel = p.onGround ? GROUND_ACCEL : AIR_ACCEL;
      p.vx = approach(p.vx, move * RUN_SPEED, accel * dt);
    } else if (p.onGround) {
      p.vx = approach(p.vx, 0, FRICTION * dt);
    } else {
      p.vx = approach(p.vx, 0, AIR_ACCEL * 0.4 * dt);
    }

    // Skok: odpustenie po zídení z hrany (coyote) a stlačenie tesne pred dopadom (buffer).
    this.coyote = p.onGround ? COYOTE : Math.max(0, this.coyote - dt);
    if (input.jump && !this.jumpHeld) this.jumpBuffer = JUMP_BUFFER;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    if (!input.jump && this.jumpHeld && p.vy < 0) p.vy *= JUMP_CUT;
    this.jumpHeld = input.jump;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      p.vy = -JUMP_SPEED;
      p.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.events.push({ type: 'jump' });
    }

    p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);
    const lights = this.lights();
    this.moveX(p.vx * dt, lights);
    const wasOnGround = p.onGround;
    this.moveY(p.vy * dt, lights, input.down);
    if (p.onGround && !wasOnGround) this.events.push({ type: 'land' });

    if (this.touchesThorns()) this.die('thorns');
    else if (p.y > this.level.height * TILE + 48) this.die('fall');
  }

  /** Pevné políčko pre pohyb; svetelné plošiny, v ktorých hráč už stojí, ho nezaseknú. */
  private solid(col: number, row: number, lights: LightSource[], overlapping: boolean): boolean {
    const tile = tileAt(this.level, col, row);
    if (tile === Tile.Ground) return true;
    if (tile === Tile.Light) return !overlapping && this.isTileLit(col, row, lights);
    return false;
  }

  private moveX(dx: number, lights: LightSource[]): void {
    const p = this.player;
    if (dx === 0) return;
    p.x += dx;
    const top = Math.floor(p.y / TILE);
    const bottom = Math.floor((p.y + PLAYER_H - 0.01) / TILE);
    const col = dx > 0 ? Math.floor((p.x + PLAYER_W - 0.01) / TILE) : Math.floor(p.x / TILE);
    for (let row = top; row <= bottom; row++) {
      if (this.solid(col, row, lights, this.overlapsTileAt(col, row, p.x - dx, p.y))) {
        p.x = dx > 0 ? col * TILE - PLAYER_W : (col + 1) * TILE;
        p.vx = 0;
        return;
      }
    }
  }

  private overlapsTileAt(col: number, row: number, x: number, y: number): boolean {
    return (
      x < (col + 1) * TILE &&
      x + PLAYER_W > col * TILE &&
      y < (row + 1) * TILE &&
      y + PLAYER_H > row * TILE
    );
  }

  private moveY(dy: number, lights: LightSource[], dropThrough: boolean): void {
    const p = this.player;
    const prevY = p.y;
    p.y += dy;
    p.onGround = false;
    const left = Math.floor(p.x / TILE);
    const right = Math.floor((p.x + PLAYER_W - 0.01) / TILE);
    if (dy > 0) {
      const row = Math.floor((p.y + PLAYER_H - 0.01) / TILE);
      const prevBottom = prevY + PLAYER_H;
      for (let col = left; col <= right; col++) {
        const tile = tileAt(this.level, col, row);
        const prevOverlap = this.overlapsTileAt(col, row, p.x, prevY);
        const ledge = tile === Tile.Ledge && !dropThrough && prevBottom <= row * TILE + 0.5;
        if (ledge || this.solid(col, row, lights, prevOverlap)) {
          p.y = row * TILE - PLAYER_H;
          p.vy = 0;
          p.onGround = true;
          return;
        }
      }
    } else if (dy < 0) {
      const row = Math.floor(p.y / TILE);
      for (let col = left; col <= right; col++) {
        if (this.solid(col, row, lights, this.overlapsTileAt(col, row, p.x, prevY))) {
          p.y = (row + 1) * TILE;
          p.vy = 0;
          return;
        }
      }
    }
  }

  private touchesThorns(): boolean {
    const p = this.player;
    const left = Math.floor((p.x + 1) / TILE);
    const right = Math.floor((p.x + PLAYER_W - 1) / TILE);
    const top = Math.floor(p.y / TILE);
    const bottom = Math.floor((p.y + PLAYER_H - 0.01) / TILE);
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (tileAt(this.level, col, row) !== Tile.Thorns) continue;
        // Tŕne zaberajú spodnú časť políčka.
        if (p.y + PLAYER_H > row * TILE + 8) return true;
      }
    }
    return false;
  }

  private updateShades(dt: number): void {
    const c = this.center;
    const lights = this.lights();
    const playerLight = this.state === 'dead' ? 0 : this.radius;
    for (const s of this.shades) {
      if (!s.alive) continue;
      const dx = c.x - s.x;
      const dy = c.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (!s.active) {
        s.active = dist < 220 && this.state === 'play';
        s.timer -= dt;
        s.x = s.home.x + Math.sin(this.time * 1.3 + s.angle) * 6;
        s.y = s.home.y + Math.cos(this.time * 0.9 + s.angle) * 4;
        continue;
      }

      // Svetlo: rozžiarený lampáš a lampy tiene spaľujú.
      s.burning = false;
      for (const [i, l] of lights.entries()) {
        const d = Math.hypot(l.x - s.x, l.y - s.y);
        // Prvé svetlo je lampáš hráča: spaľuje len rozžiarený.
        const isPlayer = i === 0 && this.state !== 'dead';
        const burns = isPlayer ? this.flaring && d < l.radius * 0.9 : d < l.radius * 0.8;
        if (!burns) continue;
        s.burning = true;
        s.hp -= dt * 2.6;
        // Ustupuje od svetla.
        const away = Math.hypot(s.x - l.x, s.y - l.y) || 1;
        s.vx += ((s.x - l.x) / away) * 260 * dt;
        s.vy += ((s.y - l.y) / away) * 260 * dt;
      }
      if (s.hp <= 0) {
        s.alive = false;
        this.events.push({ type: 'shadeDie', x: s.x, y: s.y });
        continue;
      }
      if (!s.burning) s.hp = Math.min(1, s.hp + dt * 0.3);

      const reach = Math.max(32, playerLight) + 14;
      s.timer -= dt;
      if (s.state === 'stalk') {
        // Krúži na okraji svetla a čaká na príležitosť.
        const current = Math.atan2(s.y - c.y, s.x - c.x);
        s.angle = current + dt * 0.6;
        const tx = c.x + Math.cos(s.angle) * reach;
        const ty = c.y + Math.sin(s.angle) * reach * 0.8;
        steer(s, tx, ty, 60, dt);
        if (s.timer <= 0 && dist < reach + 70 && this.state === 'play') {
          s.state = 'lunge';
          s.timer = 0.75;
          s.dirX = dx / dist;
          s.dirY = dy / dist;
          this.events.push({ type: 'lunge' });
        }
      } else if (s.state === 'lunge') {
        const speed = s.burning ? 90 : 160;
        s.vx = s.dirX * speed;
        s.vy = s.dirY * speed;
        if (dist < 10 && this.player.invulnerable <= 0 && this.state === 'play') this.hurt(s);
        else if (s.timer <= 0) this.recoil(s);
      } else {
        steer(s, s.x - dx, s.y - dy, 80, dt);
        if (s.timer <= 0) {
          s.state = 'stalk';
          // V úplnej tme sú tiene odvážnejšie.
          s.timer = this.oil > 0 ? 2.4 + this.rng.next() * 2.2 : 0.8 + this.rng.next();
        }
      }
      // Odpor vzduchu.
      const drag = Math.exp(-dt * 3);
      if (s.state !== 'lunge') {
        s.vx *= drag;
        s.vy *= drag;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
  }

  private recoil(s: Shade): void {
    s.state = 'recoil';
    s.timer = 0.8;
  }

  private hurt(s: Shade): void {
    const p = this.player;
    this.oil = Math.max(0, this.oil - SHADE_HIT_OIL);
    p.invulnerable = 1.2;
    p.vx = Math.sign(p.x + PLAYER_W / 2 - s.x || 1) * 170;
    p.vy = -170;
    p.onGround = false;
    this.events.push({ type: 'hurt' });
    this.recoil(s);
  }

  private collect(): void {
    const c = this.center;
    const near = (pt: Point, r: number) => Math.hypot(pt.x - c.x, pt.y - c.y) < r;
    for (const f of this.fireflies) {
      if (f.taken || !near(f, 13)) continue;
      f.taken = true;
      this.oil = Math.min(OIL_MAX, this.oil + FIREFLY_OIL);
      this.events.push({ type: 'firefly', x: f.x, y: f.y });
    }
    for (const k of this.crystals) {
      if (k.taken || !near(k, 13)) continue;
      k.taken = true;
      this.events.push({ type: 'crystal', x: k.x, y: k.y });
    }
    for (const l of this.lanterns) {
      if (l.lit || Math.abs(l.x - c.x) > 12 || Math.abs(l.y + 10 - c.y) > 22) continue;
      l.lit = true;
      this.checkpoint = { x: l.x, y: l.y };
      this.oil = OIL_MAX;
      this.events.push({ type: 'lantern', x: l.x, y: l.y });
    }
    const exit = this.level.exit;
    if (Math.abs(exit.x - c.x) < 14 && Math.abs(exit.y - c.y) < 40) {
      this.exitLit = true;
      this.state = 'done';
      this.player.vx = 0;
      this.events.push({ type: 'exit' });
    }
    this.sign = this.level.signs.find((s) => near(s, 28)) ?? null;
  }

  private die(cause: 'thorns' | 'fall' | 'dark'): void {
    if (this.state !== 'play') return;
    this.state = 'dead';
    this.deaths++;
    this.deadTimer = RESPAWN_DELAY;
    this.flaring = false;
    this.events.push({ type: 'died', cause });
  }

  private respawn(): void {
    this.state = 'play';
    this.placePlayer(this.checkpoint);
    this.oil = OIL_MAX;
    this.radius = LIGHT_RADIUS;
    this.dread = 0;
    for (const s of this.shades) {
      if (!s.alive) continue;
      s.x = s.home.x;
      s.y = s.home.y;
      s.vx = s.vy = 0;
      s.active = false;
      s.state = 'stalk';
      s.timer = 2 + this.rng.next() * 2;
    }
    this.events.push({ type: 'respawn' });
  }

  private placePlayer(at: Point): void {
    const p = this.player;
    p.x = at.x - PLAYER_W / 2;
    p.y = at.y + TILE / 2 - PLAYER_H;
    p.vx = p.vy = 0;
    p.onGround = false;
    p.invulnerable = 0;
    p.facing = 1;
  }
}

/** Polomer svetla podľa oleja: plný do štvrtiny, potom sa zmenšuje. */
export function baseRadius(oil: number): number {
  if (oil <= 0) return EMBER_RADIUS;
  const f = oil / OIL_MAX;
  if (f >= 0.25) return LIGHT_RADIUS;
  return 34 + (LIGHT_RADIUS - 34) * (f / 0.25);
}

function approach(value: number, target: number, delta: number): number {
  return value < target ? Math.min(target, value + delta) : Math.max(target, value - delta);
}

function steer(s: Shade, tx: number, ty: number, speed: number, dt: number): void {
  const dx = tx - s.x;
  const dy = ty - s.y;
  const d = Math.hypot(dx, dy) || 1;
  const want = Math.min(speed, d * 3);
  s.vx += ((dx / d) * want - s.vx) * Math.min(1, dt * 4);
  s.vy += ((dy / d) * want - s.vy) * Math.min(1, dt * 4);
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
