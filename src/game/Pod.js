/**
 * Pod slots: the continuous-spawn engine. Pure and headless, like Lane — it
 * emits spawn descriptions and never touches the lane itself.
 *
 * Shape follows RESEARCH_SPAWN_RATE.md: throughput comes from slot COUNT, not
 * from shrinking the interval; every rate source is short-lived and
 * self-correcting; the product of all of them is clamped to a narrow band; and
 * overdriving production degrades unit quality instead of scaling without
 * limit.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const POD_DEFAULTS = {
  slotCount: 6,
  // Research suggested 5-6s. Progression is meant to come from slot count.
  intervalMs: 5500,
  // Fighters a slot can stockpile while it cannot deploy (the marrow reserve).
  reserveMax: 3,
  // Living friends allowed at once — the blood granulocyte pool. Extra rate
  // past this buys faster replacement of casualties, not a bigger army.
  popCap: 12,
  rateMin: 0.5,
  rateMax: 2.0,
  // Left shift: immature cells shipped when release outruns maturation.
  bandStatMul: 0.6,
  // Stockpile rather than pour cells into an empty corridor.
  bankWhenLaneClear: true,
  adrenalineMul: 2.0,
  adrenalineMs: 8000,
  troughMul: 0.6,
  troughMs: 15000,
};

export function createPod(opts = {}) {
  const cfg = { ...POD_DEFAULTS, ...opts };
  return {
    now: 0,
    cfg,
    slots: Array.from({ length: cfg.slotCount }, (_, index) => ({
      index,
      spec: null,
      timerMs: 0,
      reserve: 0,
    })),
    // Named external multipliers — where circulation, fever and hypoxia land
    // once those are designed. Product is clamped, so adding one cannot run away.
    factors: {},
    // Left shift is spread deterministically rather than rolled per spawn, so a
    // run is reproducible and a player never eats an unlucky streak of bands.
    bandDebt: 0,
    // -Infinity, not 0: a window that legitimately starts at time 0 must not
    // read as "never set".
    adrenalineUntil: -Infinity,
    troughUntil: -Infinity,
  };
}

export function setSlot(pod, index, spec) {
  const slot = pod.slots[index];
  slot.spec = spec;
  slot.timerMs = 0;
  slot.reserve = 0;
  return slot;
}

export function clearSlot(pod, index) {
  return setSlot(pod, index, null);
}

export function setFactor(pod, name, value) {
  pod.factors[name] = value;
  return rateMultiplier(pod);
}

export function clearFactor(pod, name) {
  delete pod.factors[name];
  return rateMultiplier(pod);
}

export function adrenalineFactor(pod) {
  if (pod.now < pod.adrenalineUntil) return pod.cfg.adrenalineMul;
  if (pod.now < pod.troughUntil) return pod.cfg.troughMul;
  return 1;
}

export function rateMultiplier(pod) {
  let m = adrenalineFactor(pod);
  for (const v of Object.values(pod.factors)) m *= v;
  return clamp(m, pod.cfg.rateMin, pod.cfg.rateMax);
}

export function intervalMs(pod) {
  return pod.cfg.intervalMs / rateMultiplier(pod);
}

export function reserveTotal(pod) {
  let n = 0;
  for (const slot of pod.slots) n += slot.reserve;
  return n;
}

/** How far into the overdrive band we are, 0..1 — drives left shift. */
function overshoot(pod) {
  const span = pod.cfg.rateMax - 1;
  if (span <= 0) return 0;
  return clamp((rateMultiplier(pod) - 1) / span, 0, 1);
}

function degrade(spec, mul) {
  return { ...spec, variant: 'band', hp: spec.hp * mul, damage: spec.damage * mul };
}

function roomToDeploy(pod, ctx, alreadyThisFrame) {
  if (ctx.livingFriends + alreadyThisFrame >= pod.cfg.popCap) return false;
  if (pod.cfg.bankWhenLaneClear && ctx.laneClear) return false;
  return true;
}

function freshSpawn(pod, slot, os) {
  pod.bandDebt += os;
  if (pod.bandDebt >= 1) {
    pod.bandDebt -= 1;
    return { slot: slot.index, band: true, spec: degrade(slot.spec, pod.cfg.bandStatMul) };
  }
  return { slot: slot.index, band: false, spec: slot.spec };
}

export function step(pod, dtMs, ctx = {}) {
  const info = {
    livingFriends: ctx.livingFriends ?? 0,
    laneClear: ctx.laneClear ?? false,
  };

  pod.now += dtMs;
  const out = { spawns: [], banked: 0 };
  const interval = intervalMs(pod);
  const os = overshoot(pod);

  for (const slot of pod.slots) {
    if (slot.spec === null) continue;
    slot.timerMs += dtMs;

    while (slot.timerMs >= interval) {
      slot.timerMs -= interval;

      if (roomToDeploy(pod, info, out.spawns.length)) {
        out.spawns.push(freshSpawn(pod, slot, os));
      } else if (slot.reserve < pod.cfg.reserveMax) {
        slot.reserve += 1;
        out.banked += 1;
      }
      // A completed cycle with a full reserve is simply lost, which is what
      // caps stockpiling without needing to clamp the timer separately.
    }
  }

  return out;
}

/**
 * Demargination: dump the stockpile and run hot, then pay for it with a trough
 * while the marginated pool refills.
 *
 * Reserve cells are pre-made and mature, so releasing them never produces
 * bands — left shift is what happens when *production* outruns maturation.
 */
export function triggerAdrenaline(pod, ctx = {}) {
  const living = ctx.livingFriends ?? 0;

  pod.adrenalineUntil = pod.now + pod.cfg.adrenalineMs;
  pod.troughUntil = pod.adrenalineUntil + pod.cfg.troughMs;

  const out = { spawns: [] };
  for (const slot of pod.slots) {
    while (slot.reserve > 0 && living + out.spawns.length < pod.cfg.popCap) {
      slot.reserve -= 1;
      out.spawns.push({ slot: slot.index, band: false, spec: slot.spec });
    }
  }
  return out;
}
