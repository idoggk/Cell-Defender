import test from 'node:test';
import assert from 'node:assert/strict';

import { createLane, addFoe, addFriend, step, effectiveStat } from '../src/game/Lane.js';
import {
  createTurretBank, setTurret, clearTurret, effects, filledSlots, peakStackedHeal,
} from '../src/game/Turrets.js';
import {
  PLACEHOLDER_FOE, PLACEHOLDER_FRIEND, PLACEHOLDER_TURRETS, weakestFoeDps,
} from '../src/data/placeholders.js';

const wholeLane = (over) => ({
  lo: 0, hi: 1, side: 'foes', mods: null, healPerSec: 0, ...over,
});

test('an empty bank emits nothing', () => {
  const bank = createTurretBank();

  assert.equal(bank.slots.length, 6);
  assert.equal(filledSlots(bank), 0);
  assert.equal(effects(bank).length, 0);
});

test('a placed turret reaches a band either side of its own row', () => {
  const bank = createTurretBank({ rows: [0.5], reach: 0.1 });
  setTurret(bank, 0, PLACEHOLDER_TURRETS.barrier);

  const [e] = effects(bank);

  assert.equal(effects(bank).length, 1);
  assert.ok(Math.abs(e.lo - 0.4) < 1e-9);
  assert.ok(Math.abs(e.hi - 0.6) < 1e-9);
  assert.equal(e.side, 'foes');
});

test('clearing a slot removes its effect', () => {
  const bank = createTurretBank({ rows: [0.5] });
  setTurret(bank, 0, PLACEHOLDER_TURRETS.barrier);
  clearTurret(bank, 0);

  assert.equal(effects(bank).length, 0);
});

test('an effect applies only to the side it names', () => {
  const eff = [wholeLane({ side: 'foes', mods: { speed: { mul: 0.5 } } })];
  const u = { t: 0.5, speed: 0.1 };

  assert.equal(effectiveStat(eff, u, 'foes', 'speed'), 0.05);
  assert.equal(effectiveStat(eff, u, 'friends', 'speed'), 0.1);
});

test('an effect applies only inside its band', () => {
  const eff = [wholeLane({ lo: 0.4, hi: 0.6, mods: { speed: { mul: 0.5 } } })];

  assert.equal(effectiveStat(eff, { t: 0.5, speed: 0.1 }, 'foes', 'speed'), 0.05);
  assert.equal(effectiveStat(eff, { t: 0.2, speed: 0.1 }, 'foes', 'speed'), 0.1);
  assert.equal(effectiveStat(eff, { t: 0.9, speed: 0.1 }, 'foes', 'speed'), 0.1);
});

test('adds land before multipliers', () => {
  const eff = [wholeLane({ mods: { damage: { add: 2, mul: 1.5 } } })];

  // (10 + 2) * 1.5, not 10 * 1.5 + 2
  assert.equal(effectiveStat(eff, { t: 0.5, damage: 10 }, 'foes', 'damage'), 18);
});

test('two turrets covering the same unit stack', () => {
  const eff = [
    wholeLane({ mods: { speed: { mul: 0.5 } } }),
    wholeLane({ mods: { speed: { mul: 0.5 } } }),
  ];

  assert.equal(effectiveStat(eff, { t: 0.5, speed: 0.1 }, 'foes', 'speed'), 0.025);
});

test('a barrier gel actually slows a foe walking through the lane', () => {
  const bank = createTurretBank({ rows: [0], reach: 0.2 });
  setTurret(bank, 0, PLACEHOLDER_TURRETS.barrier);

  const slowed = createLane();
  addFoe(slowed, { ...PLACEHOLDER_FOE, speed: 0.1 });
  step(slowed, 1000, effects(bank));

  const free = createLane();
  addFoe(free, { ...PLACEHOLDER_FOE, speed: 0.1 });
  step(free, 1000);

  assert.ok(Math.abs(slowed.foes[0].t - 0.05) < 1e-9);
  assert.ok(Math.abs(free.foes[0].t - 0.1) < 1e-9);
});

test('a painkiller heals a friend standing in it, and never past full', () => {
  const bank = createTurretBank({ rows: [1], reach: 0.2 });
  setTurret(bank, 0, PLACEHOLDER_TURRETS.painkiller);
  const eff = effects(bank);

  const lane = createLane();
  const u = addFriend(lane, { ...PLACEHOLDER_FRIEND, speed: 0 });
  u.hp = 5;

  step(lane, 1000, eff);
  assert.ok(Math.abs(u.hp - (5 + PLACEHOLDER_TURRETS.painkiller.healPerSec)) < 1e-9);

  step(lane, 60000, eff);
  assert.equal(u.hp, u.maxHp, 'healing must cap at full, not overheal');
});

test('healing does not leak across to the other side', () => {
  const bank = createTurretBank({ rows: [0], reach: 0.2 });
  setTurret(bank, 0, PLACEHOLDER_TURRETS.painkiller);

  const lane = createLane();
  const foe = addFoe(lane, { ...PLACEHOLDER_FOE, speed: 0 });
  foe.hp = 5;

  step(lane, 1000, effects(bank));

  assert.equal(foe.hp, 5, 'a friends-only painkiller must not mend a pathogen');
});

// ---------------------------------------------------------------------------
// Design rules. These guard decisions in DESIGN.md, so a content change that
// breaks one fails the build rather than silently changing how the game plays.
// ---------------------------------------------------------------------------

test('DESIGN RULE: healing must lose to the weakest enemy DPS, even fully stacked', () => {
  const bank = createTurretBank();
  const peak = peakStackedHeal(bank, PLACEHOLDER_TURRETS.painkiller);
  const dps = weakestFoeDps();

  assert.ok(
    peak < dps,
    `peak stacked healing ${peak}/s must stay under the weakest foe's ${dps.toFixed(2)}/s `
    + 'or the front line can be stalled for ever',
  );
});

test('DESIGN RULE: no turret deals damage, including as negative healing', () => {
  for (const [id, spec] of Object.entries(PLACEHOLDER_TURRETS)) {
    assert.ok(
      (spec.healPerSec ?? 0) >= 0,
      `${id} heals a negative amount, which is damage wearing a hat`,
    );
  }
});

test('DESIGN RULE: every turret must actually do something', () => {
  for (const [id, spec] of Object.entries(PLACEHOLDER_TURRETS)) {
    const doesSomething = (spec.healPerSec ?? 0) > 0
      || (spec.mods !== undefined && Object.keys(spec.mods).length > 0);
    assert.ok(doesSomething, `${id} has neither a modifier nor healing`);
  }
});

test('DESIGN RULE: every turret must name whom it affects', () => {
  for (const [id, spec] of Object.entries(PLACEHOLDER_TURRETS)) {
    assert.ok(
      ['friends', 'foes', 'both'].includes(spec.side),
      `${id} has an unusable side: ${spec.side}`,
    );
  }
});
