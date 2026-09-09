import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createPod, setSlot, clearSlot, setFactor, step, triggerAdrenaline,
  rateMultiplier, intervalMs, reserveTotal, adrenalineFactor, POD_DEFAULTS,
} from '../src/game/Pod.js';

const SPEC = { hp: 10, damage: 2, rateMs: 600, speed: 0.08 };

// A pod that always deploys, so timing tests are not confounded by gating.
function openPod(over = {}) {
  const pod = createPod({
    slotCount: 1,
    intervalMs: 1000,
    popCap: 999,
    bankWhenLaneClear: false,
    ...over,
  });
  for (let i = 0; i < pod.slots.length; i++) setSlot(pod, i, SPEC);
  return pod;
}

const busy = { livingFriends: 0, laneClear: false };

test('a slot spawns on its interval and not before', () => {
  const pod = openPod();

  assert.equal(step(pod, 999, busy).spawns.length, 0);
  assert.equal(step(pod, 1, busy).spawns.length, 1);
});

test('an empty slot never spawns', () => {
  const pod = openPod();
  clearSlot(pod, 0);

  assert.equal(step(pod, 10000, busy).spawns.length, 0);
});

test('throughput scales with slot count, not with a shorter interval', () => {
  const pod = openPod({ slotCount: 3 });

  const ev = step(pod, 3000, busy);

  assert.equal(ev.spawns.length, 9);
  assert.equal(intervalMs(pod), 1000, 'the base interval itself must not move');
});

test('a rate factor shortens the interval', () => {
  const pod = openPod({ rateMax: 4 });
  setFactor(pod, 'test', 2);

  assert.equal(intervalMs(pod), 500);
  assert.equal(step(pod, 1000, busy).spawns.length, 2);
});

test('the product of rate factors is clamped to the safe band', () => {
  const pod = openPod();

  setFactor(pod, 'a', 10);
  assert.equal(rateMultiplier(pod), POD_DEFAULTS.rateMax);

  setFactor(pod, 'a', 0.001);
  assert.equal(rateMultiplier(pod), POD_DEFAULTS.rateMin);

  setFactor(pod, 'a', 1.5);
  setFactor(pod, 'b', 1.5);
  assert.equal(rateMultiplier(pod), POD_DEFAULTS.rateMax, 'stacked factors cannot exceed the cap');
});

test('the population cap stops deployment and banks instead', () => {
  const pod = openPod({ popCap: 2, reserveMax: 5 });

  const ev = step(pod, 1000, { livingFriends: 2, laneClear: false });

  assert.equal(ev.spawns.length, 0);
  assert.equal(ev.banked, 1);
  assert.equal(reserveTotal(pod), 1);
});

test('the reserve stops growing at reserveMax', () => {
  const pod = openPod({ popCap: 0, reserveMax: 2 });

  step(pod, 10000, { livingFriends: 0, laneClear: false });

  assert.equal(reserveTotal(pod), 2, 'a blocked slot must not stockpile without limit');
});

test('a clear lane banks, and pressure deploys', () => {
  const pod = openPod({ bankWhenLaneClear: true, reserveMax: 5 });

  const quiet = step(pod, 2000, { livingFriends: 0, laneClear: true });
  assert.equal(quiet.spawns.length, 0);
  assert.equal(reserveTotal(pod), 2);

  const pressed = step(pod, 1000, busy);
  assert.equal(pressed.spawns.length, 1);
});

test('adrenaline dumps the reserve and runs hot, then pays a trough', () => {
  const pod = openPod({ reserveMax: 3, bankWhenLaneClear: true });
  step(pod, 3000, { livingFriends: 0, laneClear: true });
  assert.equal(reserveTotal(pod), 3);

  const dump = triggerAdrenaline(pod, { livingFriends: 0 });

  assert.equal(dump.spawns.length, 3);
  assert.equal(reserveTotal(pod), 0);
  assert.equal(dump.spawns.some((s) => s.band), false, 'banked cells are mature, not bands');
  assert.equal(adrenalineFactor(pod), POD_DEFAULTS.adrenalineMul);

  step(pod, POD_DEFAULTS.adrenalineMs, busy);
  assert.equal(adrenalineFactor(pod), POD_DEFAULTS.troughMul, 'the burst must be paid for');

  step(pod, POD_DEFAULTS.troughMs, busy);
  assert.equal(adrenalineFactor(pod), 1, 'and then recover');
});

test('adrenaline cannot dump past the population cap', () => {
  const pod = openPod({ slotCount: 4, popCap: 3, reserveMax: 2, bankWhenLaneClear: true });
  step(pod, 4000, { livingFriends: 0, laneClear: true });
  assert.equal(reserveTotal(pod), 8, 'four slots stockpiled to their limit');

  const dump = triggerAdrenaline(pod, { livingFriends: 1 });

  assert.equal(dump.spawns.length, 2, 'only up to the cap may be released');
});

test('no left shift while production is at or below baseline', () => {
  const pod = openPod();

  const ev = step(pod, 20000, busy);

  assert.ok(ev.spawns.length > 0);
  assert.equal(ev.spawns.some((s) => s.band), false);
});

test('left shift degrades a share of spawns in proportion to the overshoot', () => {
  // intervalMs 1500 at 1.5x lands the effective interval on exactly 1000ms,
  // and rateMax 2 puts the overshoot at exactly half.
  const pod = openPod({ intervalMs: 1500, rateMax: 2 });
  setFactor(pod, 'test', 1.5);

  const ev = step(pod, 10000, busy);

  assert.equal(ev.spawns.length, 10);
  assert.equal(ev.spawns.filter((s) => s.band).length, 5);
});

test('a band arrives at reduced stats and is labelled for presentation', () => {
  const pod = openPod({ intervalMs: 1500, rateMax: 2 });
  setFactor(pod, 'test', 1.5);

  const band = step(pod, 10000, busy).spawns.find((s) => s.band);

  assert.ok(band);
  assert.equal(band.spec.hp, SPEC.hp * POD_DEFAULTS.bandStatMul);
  assert.equal(band.spec.damage, SPEC.damage * POD_DEFAULTS.bandStatMul);
  assert.equal(band.spec.variant, 'band');
});

test('left shift never mutates the slot spec it degrades', () => {
  const pod = openPod({ intervalMs: 1500, rateMax: 2 });
  setFactor(pod, 'test', 1.5);

  step(pod, 10000, busy);

  assert.equal(SPEC.hp, 10);
  assert.equal(pod.slots[0].spec.hp, 10);
});

// No RNG anywhere in the pod: left shift is spread by accumulated debt rather
// than rolled, so a run can be replayed and a balance report is reproducible.
test('stepping the same pod the same way gives the same result', () => {
  const runOnce = () => {
    const pod = openPod({ slotCount: 3, intervalMs: 1500, rateMax: 2 });
    setFactor(pod, 'test', 1.5);
    const seen = [];
    for (let i = 0; i < 40; i++) {
      for (const s of step(pod, 250, busy).spawns) seen.push(`${s.slot}:${s.band ? 'band' : 'full'}`);
    }
    return seen;
  };

  assert.deepEqual(runOnce(), runOnce());
});
