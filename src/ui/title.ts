/** Logo LUMEN: písmená v tme, ktoré osvetľuje hojdajúci sa lampáš, okolo poletujú svetlušky. */
const FONT: Record<string, string[]> = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
};

const W = 128;
const H = 64;
const SCALE = 3;

export class TitleScene {
  private ctx: CanvasRenderingContext2D;
  private letters: HTMLCanvasElement;
  private running = false;
  private start = performance.now();
  private flies = Array.from({ length: 9 }, (_, i) => ({
    seed: i * 1.7,
    x: Math.random() * W,
    y: Math.random() * H,
  }));

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = W;
    canvas.height = H;
    this.ctx = canvas.getContext('2d')!;
    this.letters = document.createElement('canvas');
    this.letters.width = W;
    this.letters.height = H;
    const lc = this.letters.getContext('2d')!;
    const word = 'LUMEN';
    const letterW = 5 * SCALE;
    const gap = 4;
    const total = word.length * letterW + (word.length - 1) * gap;
    const x0 = Math.floor((W - total) / 2);
    const y0 = 30;
    [...word].forEach((ch, i) => {
      FONT[ch]!.forEach((row, ry) => {
        [...row].forEach((bit, rx) => {
          if (bit !== '1') return;
          const x = x0 + i * (letterW + gap) + rx * SCALE;
          const y = y0 + ry * SCALE;
          lc.fillStyle = '#f4e2b0';
          lc.fillRect(x, y, SCALE, SCALE);
          lc.fillStyle = '#c99a4a';
          lc.fillRect(x, y + SCALE - 1, SCALE, 1);
        });
      });
    });
  }

  run(): void {
    if (this.running) return;
    this.running = true;
    const frame = () => {
      if (!this.running) return;
      this.draw((performance.now() - this.start) / 1000);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
  }

  private draw(t: number): void {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    // Lampáš na šnúre sa hojdá nad nápisom.
    const angle = Math.sin(t * 1.1) * 0.9;
    const pivot = { x: W / 2, y: -6 };
    const lx = pivot.x + Math.sin(angle) * 34;
    const ly = pivot.y + Math.cos(angle) * 30;
    const flicker = 1 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.1) * 0.03;
    const radius = 46 * flicker;

    // Tmavé písmená, potom svetlo len na nich (source-atop).
    ctx.drawImage(this.letters, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(20,16,36,0.88)';
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, radius);
    g.addColorStop(0, 'rgba(255,240,190,1)');
    g.addColorStop(0.5, 'rgba(255,190,100,0.6)');
    g.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Šnúra, lampáš a jeho žiara.
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#4a3a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pivot.x, 0);
    ctx.lineTo(lx, ly - 3);
    ctx.stroke();
    const halo = ctx.createRadialGradient(lx, ly + 2, 0, lx, ly + 2, 16);
    halo.addColorStop(0, 'rgba(255,200,110,0.45)');
    halo.addColorStop(1, 'rgba(255,200,110,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(lx - 16, ly - 14, 32, 32);
    const px = Math.round(lx);
    const py = Math.round(ly);
    ctx.fillStyle = '#9a7438';
    ctx.fillRect(px - 2, py - 3, 5, 1);
    ctx.fillRect(px - 2, py + 4, 5, 1);
    ctx.fillRect(px - 2, py - 2, 1, 6);
    ctx.fillRect(px + 2, py - 2, 1, 6);
    ctx.fillStyle = '#ffd35a';
    ctx.fillRect(px - 1, py - 2, 3, 6);
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(px, py, 1, 3);

    // Svetlušky.
    for (const f of this.flies) {
      f.x += Math.sin(t * 0.7 + f.seed) * 0.15;
      f.y += Math.cos(t * 0.5 + f.seed * 2) * 0.1;
      const a = 0.5 + Math.sin(t * 4 + f.seed * 3) * 0.5;
      ctx.fillStyle = `rgba(217,245,106,${a.toFixed(2)})`;
      ctx.fillRect(Math.round(f.x) % W, Math.round(f.y) % H, 1, 1);
    }
  }
}
