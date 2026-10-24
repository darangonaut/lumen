import { describe, expect, it } from 'vitest';
import {
  DREAD_LIMIT,
  Game,
  NO_INPUT,
  OIL_MAX,
  PLAYER_H,
  baseRadius,
  type Input,
} from '@/game/game';
import { TILE, Tile, parseLevel, type LevelDef } from '@/game/level';
import { LEVELS } from '@/game/levels';

const DT = 1 / 60;

function make(rows: string[], hints?: string[]): Game {
  const def: LevelDef = { id: 'test', name: 'test', rows, hints };
  return new Game(parseLevel(def));
}

function run(game: Game, seconds: number, input: Partial<Input> = {}) {
  const events = [];
  for (let t = 0; t < seconds; t += DT) events.push(...game.step(DT, { ...NO_INPUT, ...input }));
  return events;
}

const FLAT = ['                    ', ' P                 E', '####################'];

describe('levely', () => {
  it('všetky sa dajú načítať a majú štart, vatru a svetlušky', () => {
    for (const def of LEVELS) {
      const level = parseLevel(def);
      expect(level.fireflies.length).toBeGreaterThan(3);
      expect(level.exit.x).toBeGreaterThan(level.start.x);
    }
  });

  it('lampy stoja nad zemou (stĺp má kam dopadnúť)', () => {
    for (const def of LEVELS) {
      const level = parseLevel(def);
      for (const l of level.lanterns) {
        const col = Math.floor(l.x / TILE);
        let row = Math.floor(l.y / TILE) + 1;
        while (row < level.height && level.tiles[row * level.width + col] !== Tile.Ground) row++;
        expect(row, `${def.id} lampa na stĺpci ${col}`).toBeLessThan(level.height);
      }
    }
  });

  it('neznámy znak je chyba', () => {
    expect(() => make([' P x E', '######'])).toThrow();
  });
});

describe('pohyb', () => {
  it('hráč dopadne na zem a chodí', () => {
    const game = make(FLAT);
    run(game, 0.5);
    expect(game.player.onGround).toBe(true);
    expect(game.player.y + PLAYER_H).toBeCloseTo(2 * TILE);
    const x = game.player.x;
    run(game, 0.5, { right: true });
    expect(game.player.x).toBeGreaterThan(x + 30);
  });

  it('skok vyskočí aspoň tri políčka', () => {
    const game = make(FLAT);
    run(game, 0.5);
    const ground = game.player.y;
    let top = ground;
    game.step(DT, { ...NO_INPUT, jump: true });
    for (let i = 0; i < 60; i++) {
      game.step(DT, { ...NO_INPUT, jump: true });
      top = Math.min(top, game.player.y);
    }
    expect(ground - top).toBeGreaterThan(3 * TILE);
  });

  it('stena zastaví hráča', () => {
    const game = make(['      ', ' P  # E', '#######']);
    run(game, 2, { right: true });
    expect(game.player.x + 8).toBeLessThanOrEqual(4 * TILE);
  });

  it('pád do priepasti zabije a hráč sa vráti na štart', () => {
    const game = make([' P      E', '##    ###']);
    const events = run(game, 3, { right: true });
    expect(events.some((e) => e.type === 'died')).toBe(true);
    expect(game.deaths).toBeGreaterThan(0);
  });
});

describe('svetlo', () => {
  it('svetelná plošina drží len vo svetle', () => {
    const game = make([' P               E', '##=====###########']);
    run(game, 0.5);
    expect(game.isTileLit(3, 1)).toBe(true);
    expect(game.isTileLit(16, 0)).toBe(false);
    run(game, 1, { right: true });
    expect(game.state).toBe('play');
    expect(game.deaths).toBe(0);
  });

  it('olej sa míňa, svetluška ho dopĺňa a tma nakoniec zabije', () => {
    const game = make([' P f            E', '#################']);
    run(game, 1);
    expect(game.oil).toBeLessThan(OIL_MAX);
    game.oil = 50;
    run(game, 0.6, { right: true });
    expect(game.fireflyCount).toBe(1);
    expect(game.oil).toBeGreaterThan(55);
    game.oil = 0.01;
    const events = run(game, DREAD_LIMIT + 0.5);
    expect(events).toContainEqual({ type: 'died', cause: 'dark' });
  });

  it('svetlo slabne až pri poslednej štvrtine oleja', () => {
    expect(baseRadius(OIL_MAX)).toBe(baseRadius(OIL_MAX * 0.3));
    expect(baseRadius(OIL_MAX * 0.1)).toBeLessThan(baseRadius(OIL_MAX * 0.3));
    expect(baseRadius(0)).toBeLessThan(baseRadius(1));
  });

  it('rozžiarenie míňa olej rýchlejšie', () => {
    const a = make(FLAT);
    const b = make(FLAT);
    run(a, 1);
    run(b, 1, { flare: true });
    expect(b.oil).toBeLessThan(a.oil - 10);
    expect(b.radius).toBeGreaterThan(a.radius);
  });

  it('lampa je checkpoint a doplní olej', () => {
    const game = make([' P  L        E', '##############']);
    game.oil = 30;
    const events = run(game, 1, { right: true });
    expect(events.some((e) => e.type === 'lantern')).toBe(true);
    expect(game.oil).toBeGreaterThan(90);
  });

  it('rozžiarený lampáš spáli tieň', () => {
    const game = make(['      s      ', ' P          E', '#############']);
    run(game, 0.3);
    expect(game.shades[0]!.alive).toBe(true);
    const events = run(game, 3, { flare: true });
    expect(events.some((e) => e.type === 'shadeDie')).toBe(true);
  });

  it('tieň v tme zraní a ukradne olej', () => {
    const game = make(['    s       ', ' P         E', '############']);
    let hurt = false;
    for (let t = 0; t < 15 && !hurt; t += DT) {
      game.oil = 60;
      hurt = game.step(DT, NO_INPUT).some((e) => e.type === 'hurt');
    }
    expect(hurt).toBe(true);
  });
});

describe('cieľ', () => {
  it('dotyk vatry dokončí level', () => {
    const game = make(FLAT);
    const events = run(game, 5, { right: true });
    expect(events.some((e) => e.type === 'exit')).toBe(true);
    expect(game.state).toBe('done');
  });

  it('tabuľa ukáže radu', () => {
    const game = make([' P1    E', '########'], ['hintMove']);
    run(game, 0.3);
    expect(game.sign?.hint).toBe('hintMove');
  });
});

describe('uloženie', () => {
  it('odomkne ďalší level a drží najlepšie skóre', async () => {
    const { parseSave, recordLevel } = await import('@/game/save');
    let save = parseSave(null);
    save = recordLevel(save, 0, 'a', 5, 1);
    save = recordLevel(save, 0, 'a', 3, 0);
    expect(save.unlocked).toBe(1);
    expect(save.best.a).toEqual({ fireflies: 5, crystals: 1 });
    expect(parseSave(JSON.stringify(save))).toEqual(save);
    expect(parseSave('nezmysel').unlocked).toBe(0);
  });
});
