import { Game, NO_INPUT, PLAYER_H, PLAYER_W } from '@/game/game';
import { TILE, Tile, tileAt } from '@/game/level';

/**
 * Jednoduchý bot: beží doprava a skáče pred stenou, priepasťou a tŕňmi.
 * Overuje len geometriu (olej dopĺňa, tiene vypína). Vráti najďalší stĺpec.
 */
export function botRun(game: Game, seconds = 180): { done: boolean; col: number; deaths: number } {
  const dt = 1 / 60;
  let hold = 0;
  let best = 0;
  for (let t = 0; t < seconds && game.state !== 'done'; t += dt) {
    game.oil = 100;
    for (const s of game.shades) s.alive = false;
    for (const m of game.moths) m.alive = false;
    const p = game.player;
    const front = Math.floor((p.x + PLAYER_W + 4) / TILE);
    const ahead = (d: number) => Math.floor((p.x + PLAYER_W + d) / TILE);
    const feet = Math.floor((p.y + PLAYER_H + 2) / TILE);
    const row = Math.floor((p.y + PLAYER_H - 2) / TILE);
    const level = game.level;
    const solidish = (c: number, r: number) => {
      const tile = tileAt(level, c, r);
      return (
        tile === Tile.Ground ||
        tile === Tile.Ledge ||
        tile === Tile.Crumble ||
        (tile === Tile.Light && game.isTileLit(c, r))
      );
    };
    const wall =
      tileAt(level, front, row) === Tile.Ground ||
      tileAt(level, front, row) === Tile.Crumble ||
      (tileAt(level, front, row) === Tile.Light && game.isTileLit(front, row));
    // Priepasť preskočí; keď je pod hranou nižšia plošina, radšej z hrany zíde (ako hráč).
    const below = (test: (c: number, r: number) => boolean) =>
      [2, 10, 18].some((d) => [0, 1, 2, 3].some((r) => test(ahead(d), feet + r)));
    const lower =
      below((c, r) => r > feet && solidish(c, r) && !solidish(c, r - 1)) &&
      !below((c, r) => tileAt(level, c, r) === Tile.Thorns);
    const gap = !solidish(ahead(2), feet) && !lower;
    const thorns = [2, 6].some((d) => tileAt(level, ahead(d), row) === Tile.Thorns);
    // Plošina vyššie pred ním, na ktorú sa dá vyskočiť.
    let step = false;
    for (let d = 4; d <= 24 && !step; d += 4) {
      for (let r = row - 3; r <= row - 1; r++) {
        if (solidish(ahead(d), r) && !solidish(ahead(d), r - 1)) step = true;
      }
    }
    if (p.onGround && (wall || gap || thorns || step)) hold = 0.65;
    const jump = hold > 0;
    hold -= dt;
    // Preskočil vatru: vráti sa k nej pešo.
    if (p.x > game.level.exit.x + 8 && p.onGround) {
      game.step(dt, { ...NO_INPUT, left: true });
      continue;
    }
    // Vo vzduchu nad plošinou pribrzdí opačnou šípkou, aby ju nepreletel (ako hráč).
    const under = Math.floor((p.x + PLAYER_W / 2) / TILE);
    const brake =
      !p.onGround && p.vy > -40 && [0, 1, 2, 3, 4].some((d) => solidish(under, feet + d));
    game.step(dt, { ...NO_INPUT, right: !brake, left: brake && p.vx > 20, jump });
    best = Math.max(best, Math.floor(p.x / TILE));
  }
  return { done: game.state === 'done', col: best, deaths: game.deaths };
}
