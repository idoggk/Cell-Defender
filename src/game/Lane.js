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
  // Where a friend stops when there is nothing to fight. 0 would park it on
  // the enemy spawn itself.
  holdLine: 0.08,
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

function advanceFoes(lane, dtMs) {
  const line = [...lane.foes].sort((a, b) => b.t - a.t);
  const friend = frontFriend(lane);
  const { contact, spacing } = lane.cfg;

  for (let i = 0; i < line.length; i++) {
    const u = line[i];
    const ceiling = i === 0
      ? (friend === null ? 1 : friend.t - contact)
      : line[i - 1].t - spacing;
    const wanted = u.t + u.speed * (dtMs / 1000);
    // max() against the current position keeps a clamp from shoving a unit
    // backwards once it is already at or past its ceiling.
    u.t = Math.max(u.t, Math.min(wanted, ceiling));
  }
}

function advanceFriends(lane, dtMs) {
  const line = [...lane.friends].sort((a, b) => a.t - b.t);
  const foe = frontFoe(lane);
  const { contact, spacing, holdLine } = lane.cfg;

  for (let i = 0; i < line.length; i++) {
    const u = line[i];
    const floor = i === 0
      ? (foe === null ? holdLine : foe.t + contact)
      : line[i - 1].t + spacing;
    const wanted = u.t - u.speed * (dtMs / 1000);
    u.t = Math.min(u.t, Math.max(wanted, floor));
  }
}

function attackLine(lane, line, front, target, engaged, events) {
  if (target === null) return;
  for (const u of line) {
    const inReach = u.kind === 'ranged'
      ? Math.abs(u.t - target.t) <= u.range
      : (u === front && engaged);
    if (!inReach) continue;
    if (lane.now < u.nextAttackAt) continue;
    u.nextAttackAt = lane.now + u.rateMs;
    target.hp -= u.damage;
    events.attacks.push({ by: u.id, at: target.id, damage: u.damage });
  }
}

function resolveAttacks(lane, events) {
  // Both sides are read before either applies damage, so a duel can kill both
  // duelists on the same frame instead of whichever line resolves first
  // winning every tie.
  const friend = frontFriend(lane);
  const foe = frontFoe(lane);
  const engaged = linesEngaged(lane);
  attackLine(lane, lane.friends, friend, foe, engaged, events);
  attackLine(lane, lane.foes, foe, friend, engaged, events);
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

export function step(lane, dtMs) {
  lane.now += dtMs;
  const events = { attacks: [], deaths: [], leaks: [] };

  // Foes settle before friends so the two front units cannot pass through each
  // other on a long frame: each side clamps against the other's committed
  // position rather than against a stale one.
  advanceFoes(lane, dtMs);
  advanceFriends(lane, dtMs);

  resolveAttacks(lane, events);
  removeDead(lane, events);
  collectLeaks(lane, events);

  return events;
}
