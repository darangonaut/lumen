# Lumen

- `src/game/` je čistá logika bez PixiJS a DOM (vynútené ESLintom), testy sú vo `tests/`.
- Levely sú ASCII mapy v `src/game/levels.ts`; legenda znakov je v `src/game/level.ts`.
  Test `tests/levels.test.ts` overuje botom, že sa každý level dá prejsť.
- Pixel art sa kreslí v kóde (`src/render/sprites.ts`, `PixelCanvas`), žiadne obrázky.
- Texty rozhrania len cez `t()` z `src/ui/i18n.ts` (slovenčina a angličtina).
- Myslieť na mobil: dotykové tlačidlá, telefón na šírku, `env(safe-area-inset-*)`.
- Overenie: `npm run typecheck && npm run lint && npm test`.
