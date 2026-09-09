import Phaser from 'phaser';

import { createLane, addFoe, addFriend, step, gap, linesEngaged } from '../game/Lane.js';
import {
  createPod, setSlot, step as podStep, triggerAdrenaline,
  rateMultiplier, reserveTotal,
} from '../game/Pod.js';
import { createTurretBank, setTurret, effects as turretEffects, filledSlots } from '../game/Turrets.js';
import {
  PLACEHOLDER_FOE, PLACEHOLDER_FRIEND, PLACEHOLDER_RANGED, PLACEHOLDER_TURRETS,
} from '../data/placeholders.js';
import { attachHarness } from '../dev/harness.js';

export const VIEW = { w: 540, h: 960 };

const LANE = { x: VIEW.w / 2, top: 96, bottom: 772, width: 156 };

// Placeholder puppets, purely so there is something to watch move. These are
// NOT roster entries and none of these numbers are proposals — the roster is
// still an open question in DESIGN.md.
const AUTO = { foeEveryMs: 2000 };

// Cycled through by the number keys, one key per turret slot.
const TURRET_CYCLE = [
  PLACEHOLDER_TURRETS.barrier,
  PLACEHOLDER_TURRETS.stimulant,
  PLACEHOLDER_TURRETS.painkiller,
  null,
];

// Only some slots filled, so the demo stays roughly contested against the
// placeholder foe timer. Slot unlocking is an open question in DESIGN.md.
const DEMO_FILLED_SLOTS = 3;

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
  foeBand: 0x8a3a37,
  friend: 0x4fc3d9,
  // Left-shift bands read as visibly undercooked rather than as a status icon.
  friendBand: 0x2f6f7d,
  hpTrack: 0x05070a,
  hpFoe: 0xe8a33d,
  hpFriend: 0x8fdc46,
  hit: 0xffffff,
};

const PALETTE = {
  foes: { body: COLOR.foe, band: COLOR.foeBand, hp: COLOR.hpFoe },
  friends: { body: COLOR.friend, band: COLOR.friendBand, hp: COLOR.hpFriend },
};

const TURRET_COLOR = {
  'barrier gel': 0x6f7fd9,
  stimulant: 0xd9a34f,
  painkiller: 0x9fd94f,
};

const FLANK_DX = LANE.width / 2 + 30;

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

    this.add.text(16, VIEW.h - 74,
      '[space] pause  [s] step  [f] melee  [g] ranged  [e] foe\n'
      + '[1-6] cycle turret slot  [x] adrenaline\n'
      + '[a] auto-foes  [r] reset', {
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
    this.pod = createPod();
    for (let i = 0; i < DEMO_FILLED_SLOTS; i++) setSlot(this.pod, i, PLACEHOLDER_FRIEND);
    this.turrets = createTurretBank();
    this.hits = [];
    this.deathMarks = [];
    this.foeTimer = 0;
  }

  bindKeys() {
    const kb = this.input.keyboard;
    kb.on('keydown-SPACE', () => { this.paused = !this.paused; });
    kb.on('keydown-S', () => { if (this.paused) { this.advance(16); this.draw(); } });
    kb.on('keydown-F', () => { this.spawnFriend(); this.draw(); });
    kb.on('keydown-E', () => { this.spawnFoe(); this.draw(); });
    kb.on('keydown-A', () => { this.autoSpawn = !this.autoSpawn; });
    kb.on('keydown-R', () => { this.resetLane(); this.draw(); });
    kb.on('keydown-X', () => { this.adrenaline(); this.draw(); });
    kb.on('keydown-G', () => { this.spawnRanged(); this.draw(); });
    for (let i = 0; i < 6; i++) {
      kb.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'][i]}`, () => {
        this.cycleTurret(i);
        this.draw();
      });
    }
  }

  adrenaline() {
    const out = triggerAdrenaline(this.pod, { livingFriends: this.lane.friends.length });
    for (const s of out.spawns) addFriend(this.lane, s.spec);
    return out.spawns.length;
  }

  spawnFriend(over = {}) {
    return addFriend(this.lane, { ...PLACEHOLDER_FRIEND, ...over });
  }

  spawnRanged(over = {}) {
    return addFriend(this.lane, { ...PLACEHOLDER_RANGED, ...over });
  }

  spawnFoe(over = {}) {
    return addFoe(this.lane, { ...PLACEHOLDER_FOE, ...over });
  }

  /** Step a slot through barrier -> stimulant -> painkiller -> empty. */
  cycleTurret(index) {
    const current = this.turrets.slots[index].spec;
    const at = TURRET_CYCLE.indexOf(current);
    const next = TURRET_CYCLE[(at + 1) % TURRET_CYCLE.length];
    setTurret(this.turrets, index, next);
    return next;
  }

  advance(dtMs) {
    if (this.autoSpawn) {
      this.foeTimer += dtMs;
      if (this.foeTimer >= AUTO.foeEveryMs) {
        this.foeTimer -= AUTO.foeEveryMs;
        this.spawnFoe();
      }
    }

    const pod = podStep(this.pod, dtMs, {
      livingFriends: this.lane.friends.length,
      laneClear: this.lane.foes.length === 0,
    });
    for (const s of pod.spawns) addFriend(this.lane, s.spec);

    const events = step(this.lane, dtMs, turretEffects(this.turrets));
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

    // Which number key drives which turret slot.
    const key = { fontFamily: 'monospace', fontSize: '11px', color: '#6b7790' };
    for (const slot of this.turrets.slots) {
      const x = LANE.x + (slot.flank === 'left' ? -1 : 1) * FLANK_DX;
      this.add.text(x, laneY(slot.t) + 18, String(slot.index + 1), key).setOrigin(0.5);
    }
  }

  drawTurrets(g) {
    const half = LANE.width / 2;
    for (const slot of this.turrets.slots) {
      const y = laneY(slot.t);
      const x = LANE.x + (slot.flank === 'left' ? -1 : 1) * FLANK_DX;

      if (slot.spec === null) {
        g.lineStyle(2, COLOR.edge, 1);
        g.strokeCircle(x, y, 11);
        continue;
      }

      const c = TURRET_COLOR[slot.spec.type] ?? 0xffffff;
      const reach = slot.spec.reach ?? this.turrets.cfg.reach;
      const yLo = laneY(Math.max(0, slot.t - reach));
      const yHi = laneY(Math.min(1, slot.t + reach));

      g.fillStyle(c, 0.1);
      g.fillRect(LANE.x - half, yLo, LANE.width, yHi - yLo);
      g.fillStyle(c, 1);
      g.fillCircle(x, y, 11);
    }
  }

  drawUnit(g, u, pal) {
    const y = laneY(u.t);
    const band = u.variant === 'band';
    const r = band ? UNIT_R - 2 : UNIT_R;

    g.fillStyle(band ? pal.band : pal.body, 1);
    if (u.kind === 'ranged') g.fillRect(LANE.x - r, y - r, r * 2, r * 2);
    else g.fillCircle(LANE.x, y, r);

    const w = 26;
    const frac = Math.max(0, Math.min(1, u.hp / u.maxHp));
    g.fillStyle(COLOR.hpTrack, 0.9);
    g.fillRect(LANE.x - w / 2, y - UNIT_R - 7, w, 3);
    g.fillStyle(pal.hp, 1);
    g.fillRect(LANE.x - w / 2, y - UNIT_R - 7, w * frac, 3);
  }

  draw() {
    const g = this.g;
    const now = this.lane.now;
    const half = LANE.width / 2;
    g.clear();

    this.drawTurrets(g);

    for (const u of this.lane.foes) this.drawUnit(g, u, PALETTE.foes);
    for (const u of this.lane.friends) this.drawUnit(g, u, PALETTE.friends);

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
    const p = this.pod;
    const d = gap(l);
    const bands = l.friends.filter((u) => u.variant === 'band').length;
    return [
      `friends ${String(l.friends.length).padStart(2)}/${p.cfg.popCap}   foes ${String(l.foes.length).padStart(2)}   leaked ${l.leaked}`,
      `gap ${d === Infinity ? '   —' : d.toFixed(3)}   engaged ${linesEngaged(l) ? 'yes' : 'no '}   t+${(l.now / 1000).toFixed(1)}s`,
      `rate x${rateMultiplier(p).toFixed(2)}   reserve ${reserveTotal(p)}   bands ${bands}`,
      `turrets ${filledSlots(this.turrets)}/6   ${this.paused ? 'PAUSED' : 'running'}   auto-foes ${this.autoSpawn ? 'on' : 'off'}`,
    ].join('\n');
  }

  update(_time, delta) {
    if (!this.paused) this.advance(Math.min(delta, MAX_FRAME_MS));
    this.draw();
  }
}
