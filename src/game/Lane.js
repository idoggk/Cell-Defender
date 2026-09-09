/**
 * Pure, headless lane combat. No Phaser, no DOM — a whole battle runs in Node.
 *
 * One axis: t = 0 is the enemy spawn at the top of the corridor, t = 1 is the
 * core at the bottom. Foes walk 0 -> 1. Friends spawn at the pod and walk
 * 1 -> 0. So the front foe is the one with the HIGHEST t, and the front friend
 * the one with the LOWEST.
 */

export const DEFAULTS = {
  // t-distance at which opposing front units stop and duel.
  contact: 0.02,
  // Minimum t-distance between consecutive units in the same line.
  spacing: 0.03,
  // The furthest up the lane friends will advance, chasing or not. This is
  // load-bearing, not cosmetic: because the fight happens wherever the front
  // pair meets, the hold line is what decides where the fight happens — and
  // therefore whether a fixed turret slot can ever reach it. See DESIGN.md.
  holdLine: 0.5,
};

export function createLane(opts = {}) {
  return {
    now: 0,
    cfg: { ...DEFAULTS, ...opts },
    friends: [],
    foes: [],
    leaked: 0,
    nextId: 1,
  };
}

function makeUnit(lane, spec, t) {
  const rateMs = spec.rateMs ?? 1000;
  return {
    id: spec.id ?? `u${lane.nextId++}`,
    type: spec.type ?? 'unit',
    kind: spec.kind === 'ranged' ? 'ranged' : 'melee',
    // Carried through uninterpreted, for presentation. The lane does not care
    // what a variant means; whoever built the spec does.
    variant: spec.variant ?? null,
    t,
    hp: spec.hp,
    maxHp: spec.hp,
    damage: spec.damage,
    rateMs,
    speed: spec.speed,
    range: spec.range ?? 0,
    // Wind-up: a fresh unit waits one full interval before its first swing,
    // rather than attacking the instant it comes into reach.
    nextAttackAt: lane.now + rateMs,
  };
}

export function addFoe(lane, spec) {
  const u = makeUnit(lane, spec, 0);
  lane.foes.push(u);
  return u;
}

export function addFriend(lane, spec) {
  const u = makeUnit(lane, spec, 1);
  lane.friends.push(u);
  return u;
}

export function frontFoe(lane) {
  let front = null;
  for (const u of lane.foes) if (front === null || u.t > front.t) front = u;
  return front;
}

export function frontFriend(lane) {
  let front = null;
  for (const u of lane.friends) if (front === null || u.t < front.t) front = u;
  return front;
}

export function gap(lane) {
  const f = frontFriend(lane);
  const e = frontFoe(lane);
  if (f === null || e === null) return Infinity;
  return f.t - e.t;
}

// The movement clamp parks the front pair exactly `contact` apart, but that
// arithmetic is inexact in binary floating point (a gap of 0.02 lands as
// 0.020000000000000018), so an exact `<=` reports two duelling units as out of
// reach. The tolerance is ~7 orders of magnitude below contact, far too small
// to engage anything that has not actually met.
const CONTACT_EPS = 1e-9;

export function linesEngaged(lane) {
  return gap(lane) <= lane.cfg.contact + CONTACT_EPS;
}

function covers(e, u, side) {
  if (e.side !== 'both' && e.side !== side) return false;
  return u.t >= e.lo && u.t <= e.hi;
}

/**
 * A unit's stat after every effect covering its position. Adds land first,
 * then multipliers — so a +2 and a x1.5 give (base + 2) * 1.5, not base * 1.5 + 2.
 */
export function effectiveStat(effects, u, side, stat) {
  let add = 0;
  let mul = 1;
  for (const e of effects) {
    if (e.mods === null || e.mods === undefined) continue;
    if (!covers(e, u, side)) continue;
    const m = e.mods[stat];
    if (m === undefined) continue;
    if (m.add !== undefined) add += m.add;
    if (m.mul !== undefined) mul *= m.mul;
  }
  return (u[stat] + add) * mul;
}

function healRate(effects, u, side) {
  let rate = 0;
  for (const e of effects) {
    if (e.healPerSec > 0 && covers(e, u, side)) rate += e.healPerSec;
  }
  return rate;
}

function advanceFoes(lane, dtMs, effects) {
  const line = [...lane.foes].sort((a, b) => b.t - a.t);
  const friend = frontFriend(lane);
  const { contact, spacing } = lane.cfg;

  for (let i = 0; i < line.length; i++) {
    const u = line[i];
    const ceiling = i === 0
      ? (friend === null ? 1 : friend.t - contact)
      : line[i - 1].t - spacing;
    const wanted = u.t + effectiveStat(effects, u, 'foes', 'speed') * (dtMs / 1000);
    // max() against the current position keeps a clamp from shoving a unit
    // backwards once it is already at or past its ceiling.
    u.t = Math.max(u.t, Math.min(wanted, ceiling));
  }
}

function advanceFriends(lane, dtMs, effects) {
  const line = [...lane.friends].sort((a, b) => a.t - b.t);
  const foe = frontFoe(lane);
  const { contact, spacing, holdLine } = lane.cfg;

  for (let i = 0; i < line.length; i++) {
    const u = line[i];
    // Friends hold the line rather than charging the spawn: the front friend
    // stops at whichever is lower down the lane, the hold line or contact with
    // the front foe. Without the hold line in this max(), a winning side chases
    // upward indefinitely and walks out of its own turret support.
    const floor = i === 0
      ? Math.max(holdLine, foe === null ? holdLine : foe.t + contact)
      : line[i - 1].t + spacing;
    const wanted = u.t - effectiveStat(effects, u, 'friends', 'speed') * (dtMs / 1000);
    u.t = Math.min(u.t, Math.max(wanted, floor));
  }
}

function attackLine(lane, line, side, front, target, engaged, effects, events) {
  if (target === null) return;
  for (const u of line) {
    const inReach = u.kind === 'ranged'
      ? Math.abs(u.t - target.t) <= effectiveStat(effects, u, side, 'range')
      : (u === front && engaged);
    if (!inReach) continue;
    if (lane.now < u.nextAttackAt) continue;

    const damage = effectiveStat(effects, u, side, 'damage');
    u.nextAttackAt = lane.now + effectiveStat(effects, u, side, 'rateMs');
    target.hp -= damage;
    events.attacks.push({ by: u.id, at: target.id, damage });
  }
}

function resolveAttacks(lane, effects, events) {
  // Both sides are read before either applies damage, so a duel can kill both
  // duelists on the same frame instead of whichever line resolves first
  // winning every tie.
  const friend = frontFriend(lane);
  const foe = frontFoe(lane);
  const engaged = linesEngaged(lane);
  attackLine(lane, lane.friends, 'friends', friend, foe, engaged, effects, events);
  attackLine(lane, lane.foes, 'foes', foe, friend, engaged, effects, events);
}

function applyHealing(lane, effects, dtMs) {
  for (const side of ['friends', 'foes']) {
    for (const u of lane[side]) {
      const rate = healRate(effects, u, side);
      if (rate > 0) u.hp = Math.min(u.maxHp, u.hp + rate * (dtMs / 1000));
    }
  }
}

function removeDead(lane, events) {
  for (const side of ['friends', 'foes']) {
    const alive = [];
    for (const u of lane[side]) {
      if (u.hp <= 0) events.deaths.push({ id: u.id, side, t: u.t });
      else alive.push(u);
    }
    lane[side] = alive;
  }
}

function collectLeaks(lane, events) {
  const held = [];
  for (const u of lane.foes) {
    if (u.t >= 1) {
      lane.leaked += 1;
      events.leaks.push({ id: u.id });
    } else held.push(u);
  }
  lane.foes = held;
}

export function step(lane, dtMs, effects = []) {
  lane.now += dtMs;
  const events = { attacks: [], deaths: [], leaks: [] };

  // Foes settle before friends so the two front units cannot pass through each
  // other on a long frame: each side clamps against the other's committed
  // position rather than against a stale one.
  advanceFoes(lane, dtMs, effects);
  advanceFriends(lane, dtMs, effects);

  // Topped up first, then hit — so healing cannot resurrect something that the
  // same frame's damage already took below zero.
  applyHealing(lane, effects, dtMs);
  resolveAttacks(lane, effects, events);
  removeDead(lane, events);
  collectLeaks(lane, events);

  return events;
}
