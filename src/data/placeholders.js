/**
 * Placeholder content — puppets so the systems have something to chew on.
 *
 * NONE of this is roster. The real roster (24 fighters + 10 turrets across five
 * medicine classes) is still an open question in DESIGN.md, and every number
 * here is Ido's to set. This file exists so the fake content sits in one
 * obvious place to delete, and so design-rule tests can import the same specs
 * the scene runs on.
 */

export const PLACEHOLDER_FOE = { type: 'pathogen', hp: 14, damage: 3, rateMs: 700, speed: 0.06 };

export const PLACEHOLDER_FRIEND = { type: 'phagocyte', hp: 14, damage: 3, rateMs: 600, speed: 0.08 };

export const PLACEHOLDER_RANGED = {
  type: 'antibody', kind: 'ranged', hp: 9, damage: 2, rateMs: 900, speed: 0.07, range: 0.22,
};

// One stand-in per effect shape the lane can apply, not per medicine class.
export const PLACEHOLDER_TURRETS = {
  barrier: { type: 'barrier gel', side: 'foes', mods: { speed: { mul: 0.5 } } },
  stimulant: { type: 'stimulant', side: 'friends', mods: { damage: { mul: 1.25 } } },
  painkiller: { type: 'painkiller', side: 'friends', healPerSec: 1.5 },
};

/** Melee DPS of the weakest foe — the ceiling healing has to stay under. */
export function weakestFoeDps() {
  return PLACEHOLDER_FOE.damage / (PLACEHOLDER_FOE.rateMs / 1000);
}
