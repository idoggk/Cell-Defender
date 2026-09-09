import Phaser from 'phaser';

import { createLane, addFoe, addFriend, step, gap, linesEngaged } from '../game/Lane.js';
import { attachHarness } from '../dev/harness.js';

export const VIEW = { w: 540, h: 960 };

const LANE = { x: VIEW.w / 2, top: 96, bottom: 772, width: 156 };

// Placeholder puppets, purely so there is something to watch move. These are
// NOT roster entries and none of these numbers are proposals — the roster is
// still an open question in DESIGN.md.
const DEMO_FOE = { hp: 14, damage: 3, rateMs: 700, speed: 0.06 };
const DEMO_FRIEND = { hp: 14, damage: 3, rateMs: 600, speed: 0.08 };
const AUTO = { foeEveryMs: 2000, friendEveryMs: 2000 };

// A frame longer than this is a stall (tab switch, breakpoint), not real time.
// The lane model is crossing-safe at any dt, so this is about sim fidelity.
const MAX_FRAME_MS = 50;

const HIT_MS = 90;
const DEATH_MS = 260;
const UNIT_R = 9;

const COLOR = {
  corridor: 0x141a26,
  edge: 0x2b3752,
  spawn: 0x4a1f28,
  core: 0x18333d,
  foe: 0xd9534f,
  friend: 0x4fc3d9,
  hpTrack: 0x05070a,
  hpFoe: 0xe8a33d,
  hpFriend: 0x8fdc46,
  hit: 0xffffff,
};

const laneY = (t) => LANE.top + t * (LANE.bottom - LANE.top);

export default class LaneScene extends Phaser.Scene {
  constructor() {
    super('Lane');
  }

  create() {
    this.paused = false;
    this.autoSpawn = true;
    this.resetLane();

    this.drawBoard();
    this.g = this.add.graphics();

    this.readout = this.add.text(16, 16, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#c9d4e4',
      lineSpacing: 3,
    });

    this.add.text(16, VIEW.h - 58,
      '[space] pause   [s] step   [f] friend   [e] foe\n[a] auto-spawn   [r] reset', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#5d6b82',
        lineSpacing: 3,
      });

    this.bindKeys();
    this.draw();

    if (import.meta.env.DEV) attachHarness(this);
  }

  resetLane() {
    this.lane = createLane();
    this.hits = [];
    this.deathMarks = [];
    this.foeTimer = 0;
    this.friendTimer = 0;
  }

  bindKeys() {
    const kb = this.input.keyboard;
    kb.on('keydown-SPACE', () => { this.paused = !this.paused; });
    kb.on('keydown-S', () => { if (this.paused) { this.advance(16); this.draw(); } });
    kb.on('keydown-F', () => { this.spawnFriend(); this.draw(); });
    kb.on('keydown-E', () => { this.spawnFoe(); this.draw(); });
    kb.on('keydown-A', () => { this.autoSpawn = !this.autoSpawn; });
    kb.on('keydown-R', () => { this.resetLane(); this.draw(); });
  }

  spawnFriend(over = {}) {
    return addFriend(this.lane, { ...DEMO_FRIEND, ...over });
  }

  spawnFoe(over = {}) {
    return addFoe(this.lane, { ...DEMO_FOE, ...over });
  }

  advance(dtMs) {
    if (this.autoSpawn) {
      this.foeTimer += dtMs;
      if (this.foeTimer >= AUTO.foeEveryMs) {
        this.foeTimer -= AUTO.foeEveryMs;
        this.spawnFoe();
      }
      this.friendTimer += dtMs;
      if (this.friendTimer >= AUTO.friendEveryMs) {
        this.friendTimer -= AUTO.friendEveryMs;
        this.spawnFriend();
      }
    }

    const events = step(this.lane, dtMs);
    const now = this.lane.now;

    // Attacks name ids, not positions, and a target can die in the same frame
    // it is hit — so death events (which carry t) backfill the ones that left.
    const at = new Map();
    for (const u of this.lane.friends) at.set(u.id, u.t);
    for (const u of this.lane.foes) at.set(u.id, u.t);
    for (const d of events.deaths) at.set(d.id, d.t);

    for (const a of events.attacks) {
      const t = at.get(a.at);
      if (t === undefined) continue;
      this.hits.push({ y: laneY(t), until: now + HIT_MS });
    }
    for (const d of events.deaths) {
      this.deathMarks.push({ y: laneY(d.t), side: d.side, until: now + DEATH_MS });
    }

    this.hits = this.hits.filter((h) => h.until > now);
    this.deathMarks = this.deathMarks.filter((m) => m.until > now);
  }

  drawBoard() {
    const g = this.add.graphics();
    const half = LANE.width / 2;

    g.fillStyle(COLOR.spawn, 0.55);
    g.fillRect(LANE.x - half, 0, LANE.width, LANE.top);

    g.fillStyle(COLOR.corridor, 1);
    g.fillRect(LANE.x - half, LANE.top, LANE.width, LANE.bottom - LANE.top);

    g.fillStyle(COLOR.core, 0.8);
    g.fillRect(LANE.x - half - 46, LANE.bottom, LANE.width + 92, VIEW.h - LANE.bottom - 70);

    g.lineStyle(2, COLOR.edge, 1);
    g.strokeRect(LANE.x - half, LANE.top, LANE.width, LANE.bottom - LANE.top);

    const label = { fontFamily: 'monospace', fontSize: '12px', color: '#8f9cb3' };
    this.add.text(LANE.x, LANE.top - 22, 'PATHOGENS  t=0', label).setOrigin(0.5);
    this.add.text(LANE.x, LANE.bottom + 26, 'CORE  t=1', label).setOrigin(0.5);
  }

  drawUnit(g, u, body, hpFill) {
    const y = laneY(u.t);

    g.fillStyle(body, 1);
    if (u.kind === 'ranged') g.fillRect(LANE.x - UNIT_R, y - UNIT_R, UNIT_R * 2, UNIT_R * 2);
    else g.fillCircle(LANE.x, y, UNIT_R);

    const w = 26;
    const frac = Math.max(0, Math.min(1, u.hp / u.maxHp));
    g.fillStyle(COLOR.hpTrack, 0.9);
    g.fillRect(LANE.x - w / 2, y - UNIT_R - 7, w, 3);
    g.fillStyle(hpFill, 1);
    g.fillRect(LANE.x - w / 2, y - UNIT_R - 7, w * frac, 3);
  }

  draw() {
    const g = this.g;
    const now = this.lane.now;
    const half = LANE.width / 2;
    g.clear();

    for (const u of this.lane.foes) this.drawUnit(g, u, COLOR.foe, COLOR.hpFoe);
    for (const u of this.lane.friends) this.drawUnit(g, u, COLOR.friend, COLOR.hpFriend);

    for (const h of this.hits) {
      g.lineStyle(2, COLOR.hit, Math.max(0, (h.until - now) / HIT_MS) * 0.8);
      g.lineBetween(LANE.x - half + 4, h.y, LANE.x + half - 4, h.y);
    }

    for (const m of this.deathMarks) {
      const life = Math.max(0, (m.until - now) / DEATH_MS);
      g.lineStyle(2, m.side === 'foes' ? COLOR.foe : COLOR.friend, life * 0.9);
      g.strokeCircle(LANE.x, m.y, UNIT_R + (1 - life) * 16);
    }

    this.readout.setText(this.readoutText());
  }

  readoutText() {
    const l = this.lane;
    const d = gap(l);
    return [
      `friends ${String(l.friends.length).padStart(2)}   foes ${String(l.foes.length).padStart(2)}   leaked ${l.leaked}`,
      `gap ${d === Infinity ? '   —' : d.toFixed(3)}   engaged ${linesEngaged(l) ? 'yes' : 'no '}   t+${(l.now / 1000).toFixed(1)}s`,
      `${this.paused ? 'PAUSED' : 'running'}   auto-spawn ${this.autoSpawn ? 'on' : 'off'}`,
    ].join('\n');
  }

  update(_time, delta) {
    if (!this.paused) this.advance(Math.min(delta, MAX_FRAME_MS));
    this.draw();
  }
}
