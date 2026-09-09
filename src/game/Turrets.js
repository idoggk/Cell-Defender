/**
 * Medicine turrets: the six slots flanking the corridor. Pure and headless.
 *
 * Turrets never deal damage (DESIGN.md). What they do instead is change the
 * terms of engagement over a BAND of the lane — a reach — by emitting stat
 * modifiers and healing that the lane applies to whoever is standing in it.
 *
 * This module knows nothing about combat; it turns placed turrets into a flat
 * list of effects. The lane knows nothing about turrets; it just applies
 * effects. Neither imports the other.
 */

export const TURRET_DEFAULTS = {
  // Where the three flanking rows sit along the lane. Placeholder positions —
  // the real ones come off the board art once it exists.
  rows: [0.25, 0.5, 0.75],
  // How far along the lane a turret reaches, each way from its own row.
  reach: 0.12,
};

export function createTurretBank(opts = {}) {
  const cfg = { ...TURRET_DEFAULTS, ...opts };
  const slots = [];
  for (const t of cfg.rows) {
    // Left and right of the same row are mechanically identical, because the
    // lane is one-dimensional — the flank is presentation only.
    for (const flank of ['left', 'right']) {
      slots.push({ index: slots.length, t, flank, spec: null });
    }
  }
  return { cfg, slots };
}

export function setTurret(bank, index, spec) {
  const slot = bank.slots[index];
  slot.spec = spec;
  return slot;
}

export function clearTurret(bank, index) {
  return setTurret(bank, index, null);
}

export function filledSlots(bank) {
  return bank.slots.filter((s) => s.spec !== null).length;
}

/** Flatten placed turrets into the effect list the lane consumes. */
export function effects(bank) {
  const out = [];
  for (const slot of bank.slots) {
    if (slot.spec === null) continue;
    const reach = slot.spec.reach ?? bank.cfg.reach;
    out.push({
      slot: slot.index,
      lo: slot.t - reach,
      hi: slot.t + reach,
      side: slot.spec.side,
      mods: slot.spec.mods ?? null,
      healPerSec: slot.spec.healPerSec ?? 0,
    });
  }
  return out;
}

/**
 * The most healing a single unit could ever be standing in, given how this bank
 * is laid out. Used to hold the "healing must lose to enemy DPS" rule, which
 * depends on how far reaches overlap and so cannot be eyeballed from one
 * turret's number.
 */
export function peakStackedHeal(bank, spec, samples = 401) {
  const probe = createTurretBank(bank.cfg);
  for (const slot of probe.slots) slot.spec = spec;
  const list = effects(probe);

  let peak = 0;
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    let sum = 0;
    for (const e of list) if (t >= e.lo && t <= e.hi) sum += e.healPerSec;
    if (sum > peak) peak = sum;
  }
  return peak;
}
