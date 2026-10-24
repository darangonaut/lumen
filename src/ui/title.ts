/**
 * Úvodná scéna v siluetovom štýle: súmrak, kopce a smreky, na kopci postavička s lampášom,
 * okolo poletujú svetlušky a v lese občas zažmurkajú oči tieňa.
 */
const INK = '#05060b';

function rand(i: number, seed: number): number {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export class TitleScene {
  private ctx: CanvasRenderingContext2D;
  private backdrop = document.createElement('canvas');
  private running = false;
  private start = performance.now();
  private w = 0;
  private h = 0;
  private dpr = 1;
  private flies = Array.from({ length: 16 }, (_, i) => ({
    x: rand(i, 1),
    y: 0.45 + rand(i, 2) * 0.4,
    seed: rand(i, 3) * 10,
  }));

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    window.addEventListener('resize', () => {
      if (this.running) this.layout();
    });
  }

  run(): void {
    if (this.running) return;
    this.running = true;
    this.layout();
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

  /** Miesto, kde stojí postavička (hrebeň kopca), a jej mierka. */
  private hero(): { x: number; y: number; s: number } {
    const s = Math.max(2.5, Math.min(this.h / 110, this.w / 140));
    const x = this.w * 0.2;
    return { x, y: this.hillY(x), s };
  }

  private hillY(x: number): number {
    const t = x / this.w;
    return this.h * (0.86 - 0.1 * Math.exp(-(((t - 0.2) / 0.2) ** 2)) + 0.02 * Math.sin(t * 9));
  }

  private layout(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth || window.innerWidth;
    this.h = this.canvas.clientHeight || window.innerHeight;
    for (const c of [this.canvas, this.backdrop]) {
      c.width = Math.round(this.w * this.dpr);
      c.height = Math.round(this.h * this.dpr);
    }
    this.paintBackdrop();
  }

  /** Statické vrstvy: nebo, mesiac, kopce, stromy a kopec v popredí. */
  private paintBackdrop(): void {
    const ctx = this.backdrop.getContext('2d')!;
    const { w, h } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0b0820');
    sky.addColorStop(0.45, '#251f4a');
    sky.addColorStop(0.78, '#3c5a7c');
    sky.addColorStop(1, '#86b0aa');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(235,235,255,${(0.25 + rand(i, 5) * 0.6).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(rand(i, 6) * w, rand(i, 7) * h * 0.6, 0.4 + rand(i, 8) * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // Mesiac so žiarou.
    const mx = w * 0.8;
    const my = h * 0.2;
    const mr = Math.min(w, h) * 0.05;
    const halo = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 5);
    halo.addColorStop(0, 'rgba(220,228,255,0.35)');
    halo.addColorStop(1, 'rgba(220,228,255,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
    ctx.fillStyle = '#e6ecff';
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // Vzdialené kopce s hmlou.
    ctx.fillStyle = '#1a2b44';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      ctx.lineTo(x, h * (0.66 - 0.07 * Math.sin(t * 5 + 1) - 0.04 * Math.sin(t * 13 + 2)));
    }
    ctx.lineTo(w, h);
    ctx.fill();
    const fog = ctx.createLinearGradient(0, h * 0.6, 0, h);
    fog.addColorStop(0, 'rgba(120,160,175,0)');
    fog.addColorStop(1, 'rgba(120,160,175,0.35)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Smreky.
    ctx.fillStyle = '#0b1322';
    const trees = Math.ceil(w / 50);
    for (let i = 0; i < trees; i++) {
      const x = (i + rand(i, 9) * 0.7) * (w / trees);
      const th = h * (0.16 + rand(i, 10) * 0.18);
      const base = h * 0.82;
      ctx.fillRect(x - 1.5, base - th * 0.5, 3, th * 0.5 + h * 0.1);
      for (let l = 0; l < 4; l++) {
        const top = base - th + l * th * 0.17;
        const lw = th * (0.08 + l * 0.06);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.quadraticCurveTo(x + lw * 0.5, top + th * 0.12, x + lw, top + th * 0.24);
        ctx.lineTo(x - lw, top + th * 0.24);
        ctx.quadraticCurveTo(x - lw * 0.5, top + th * 0.12, x, top);
        ctx.fill();
      }
    }

    // Kopec v popredí so steblami trávy.
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 3) ctx.lineTo(x, this.hillY(x));
    ctx.lineTo(w, h);
    ctx.fill();
    for (let i = 0; i < w / 4; i++) {
      const x = rand(i, 11) * w;
      const y = this.hillY(x) + 1;
      const bh = 3 + rand(i, 12) * 9;
      const lean = (rand(i, 13) - 0.5) * 6;
      ctx.beginPath();
      ctx.moveTo(x - 1.2, y);
      ctx.lineTo(x + 1.2, y);
      ctx.lineTo(x + lean, y - bh);
      ctx.fill();
    }
  }

  private draw(t: number): void {
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.backdrop, 0, 0);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const { x, y, s } = this.hero();
    const flicker = 1 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.1) * 0.03;
    const dy = Math.sin(t * 1.4) * 0.3;
    // Lampáš v ruke (súradnice postavičky 0–14 × 0–17, nohy na y = 15.4).
    const lx = x + (11.15 - 7) * s;
    const ly = y + (11.8 - 15.4 + dy) * s;

    // Teplá žiara lampáša.
    const r = 60 * s * flicker;
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
    glow.addColorStop(0, 'rgba(255,220,140,0.5)');
    glow.addColorStop(0.3, 'rgba(255,170,80,0.2)');
    glow.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
    ctx.globalCompositeOperation = 'source-over';

    this.drawHero(ctx, x, y, s, t, dy);

    // Oči tieňa v lese vpravo občas zažmurkajú.
    const cycle = t % 8;
    if (cycle > 2 && cycle < 6 && !(cycle > 3.6 && cycle < 3.75)) {
      const ex = w * 0.7;
      const ey = h * 0.74;
      const a = Math.min(1, (cycle - 2) * 2, (6 - cycle) * 2);
      const es = s * 0.7;
      ctx.fillStyle = `rgba(238,248,255,${(a * 0.9).toFixed(2)})`;
      ctx.shadowColor = '#cfe8ff';
      ctx.shadowBlur = 8;
      for (const dx of [-2.4, 2.4]) {
        ctx.beginPath();
        ctx.ellipse(ex + dx * es, ey, 1.05 * es, 0.8 * es, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // Svetlušky.
    for (const f of this.flies) {
      const fx = (f.x + Math.sin(t * 0.3 + f.seed) * 0.03) * w;
      const fy = (f.y + Math.cos(t * 0.4 + f.seed * 2) * 0.03) * h;
      const a = 0.35 + Math.sin(t * 2.5 + f.seed * 3) * 0.35;
      if (a <= 0.02) continue;
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8);
      g.addColorStop(0, `rgba(240,255,170,${a.toFixed(2)})`);
      g.addColorStop(1, 'rgba(217,245,106,0)');
      ctx.fillStyle = g;
      ctx.fillRect(fx - 8, fy - 8, 16, 16);
    }
  }

  /** Postavička v kapucni (ten istý tvar ako v hre); s = mierka. */
  private drawHero(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    t: number,
    dy: number,
  ): void {
    ctx.save();
    ctx.translate(x - 7 * s, y - 15.4 * s);
    ctx.scale(s, s);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.35;
    for (const legX of [4.7, 7.3]) {
      ctx.beginPath();
      ctx.moveTo(legX, 12.6);
      ctx.lineTo(legX, 15.4);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(3.8, 6.6 + dy);
    ctx.lineTo(8.6, 6.6 + dy);
    ctx.lineTo(9.7, 13.1);
    ctx.lineTo(7.6, 13.3);
    ctx.lineTo(6.2, 12.7);
    ctx.lineTo(4.9, 13.3);
    ctx.lineTo(2.5, 13.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6.5, 4.5 + dy, 3.1, 0, Math.PI * 2);
    ctx.fill();
    // Cíp kapucne veje vo vetre.
    const wave = Math.sin(t * 2) * 0.6;
    ctx.beginPath();
    ctx.moveTo(4.2, 2.4 + dy);
    ctx.quadraticCurveTo(1.6 + wave, 4.2 + dy, 1 + wave, 8.4 + dy);
    ctx.lineTo(4.6, 6.6 + dy);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(8.1, 8.4 + dy);
    ctx.lineTo(10.7, 9.3 + dy);
    ctx.stroke();
    ctx.fillRect(9.9, 10 + dy, 2.5, 3.6);
    const glass = ctx.createLinearGradient(0, 10.5 + dy, 0, 13.1 + dy);
    glass.addColorStop(0, '#fff6c8');
    glass.addColorStop(1, '#ffd35a');
    ctx.fillStyle = glass;
    ctx.fillRect(10.4, 10.5 + dy, 1.5, 2.6);
    ctx.fillStyle = '#e8f4ff';
    ctx.beginPath();
    ctx.arc(7.9, 4.3 + dy, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
