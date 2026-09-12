// Counts complete rise-and-return cycles, not rope rotations.
export class JumpCounter {
  constructor() { this.reset(); }
  reset() { this.count = 0; this.recalibrate(); }
  recalibrate() { this.samples = []; this.base = null; this.air = false; this.last = -Infinity; this.previous = null; }
  update(y, time, threshold = 0.015) {
    if (!Number.isFinite(y)) { this.recalibrate(); return false; }
    if (this.previous !== null && time - this.previous > 300) this.recalibrate();
    this.previous = time;
    if (this.base === null) {
      this.samples.push({ y, time });
      if (time - this.samples[0].time < 2000) return false;
      const values = this.samples.map(s => s.y).sort((a,b) => a-b);
      if (values.at(-1) - values[0] > threshold) { this.samples = []; return false; }
      this.base = values[Math.floor(values.length / 2)];
      return false;
    }
    const rise = this.base - y;
    if (!this.air && rise > threshold && time - this.last > 200) { this.air = true; this.takeoff = time; }
    if (this.air && time - this.takeoff > 1000) { this.recalibrate(); return false; }
    if (this.air && rise < threshold * 0.35) {
      this.air = false;
      if (time - this.takeoff >= 60) { this.count++; this.last = time; return true; }
    }
    if (!this.air && Math.abs(rise) < threshold * 0.4) this.base += (y - this.base) * 0.015;
    return false;
  }
}
