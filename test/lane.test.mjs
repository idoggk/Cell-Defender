import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createLane, addFoe, addFriend, step,
  frontFoe, frontFriend, gap, linesEngaged, DEFAULTS,
} from '../src/game/Lane.js';

const EPS = 1e-9;

// Immortal, harmless bodies — for tests about movement rather than combat.
const wall = (over = {}) => ({ hp: 1e9, damage: 0, rateMs: 1000, speed: 0.1, ...over });
const unit = (over = {}) => ({ hp: 10, damage: 1, rateMs: 1000, speed: 0.1, ...over });

function run(lane, steps, dtMs = 16) {
  const all = { attacks: [], deaths: [], leaks: [] };
  for (let i = 0; i < steps; i++) {
    const ev = step(lane, dtMs);
    all.attacks.push(...ev.attacks);
    all.deaths.push(...ev.deaths);
    all.leaks.push(...ev.leaks);
  }
  return all;
}

test('a lone foe walks the lane and leaks', () => {
  const lane = createLane();
  addFoe(lane, unit({ speed: 0.5 }));

  const ev = run(lane, 200);

  assert.equal(ev.leaks.length, 1);
  assert.equal(lane.leaked, 1);
  assert.equal(lane.foes.length, 0);
});

test('several foes each leak, counted individually', () => {
  const lane = createLane();
  for (let i = 0; i < 3; i++) addFoe(lane, unit({ speed: 0.5 }));

  run(lane, 400);

  assert.equal(lane.leaked, 3);
  assert.equal(lane.foes.length, 0);
});

test('a lone friend walks up and holds short of the enemy spawn', () => {
  const lane = createLane();
  addFriend(lane, unit({ speed: 0.5 }));

  run(lane, 300);

  assert.equal(lane.friends.length, 1);
  assert.ok(Math.abs(lane.friends[0].t - DEFAULTS.holdLine) < EPS);
});

test('a friend will not chase a foe past the hold line', () => {
  const lane = createLane();
  // A foe that sits still above the hold line: the friend must come up to the
  // line and wait there rather than walking up to meet it.
  const foe = addFoe(lane, wall({ speed: 0 }));
  addFriend(lane, wall({ speed: 0.5 }));

  run(lane, 400);

  assert.ok(Math.abs(frontFriend(lane).t - DEFAULTS.holdLine) < EPS);
  assert.equal(foe.t, 0, 'the stationary foe should not have been reached');
  assert.equal(linesEngaged(lane), false, 'holding the line is not engagement');
});

test('a duel resolves to the stronger unit', () => {
  const lane = createLane();
  addFoe(lane, unit({ hp: 10, damage: 1 }));
  addFriend(lane, unit({ hp: 30, damage: 5 }));

  run(lane, 2000);

  assert.equal(lane.foes.length, 0);
  assert.equal(lane.friends.length, 1);
  assert.ok(lane.friends[0].hp < 30, 'the winner should have taken damage');
});

test('engaged units stop and hold the front line', () => {
  const lane = createLane();
  addFoe(lane, wall());
  addFriend(lane, wall());

  run(lane, 400);
  assert.equal(linesEngaged(lane), true);

  const foeT = frontFoe(lane).t;
  const friendT = frontFriend(lane).t;
  assert.ok(Math.abs(gap(lane) - DEFAULTS.contact) < EPS);

  run(lane, 100);

  assert.equal(frontFoe(lane).t, foeT, 'an engaged foe must not creep forward');
  assert.equal(frontFriend(lane).t, friendT, 'an engaged friend must not creep forward');
  assert.equal(lane.leaked, 0);
});

test('units behind the front line queue at spacing', () => {
  const lane = createLane();
  addFoe(lane, wall({ speed: 0 }));
  for (let i = 0; i < 3; i++) addFriend(lane, wall({ speed: 0.5 }));

  run(lane, 600);

  const ts = lane.friends.map((u) => u.t).sort((a, b) => a - b);
  assert.equal(ts.length, 3);
  for (let i = 1; i < ts.length; i++) {
    assert.ok(
      ts[i] - ts[i - 1] >= DEFAULTS.spacing - EPS,
      `friends ${i - 1} and ${i} are closer than spacing: ${ts[i] - ts[i - 1]}`,
    );
  }
});

test('a ranged friend fires before the lines are engaged', () => {
  const lane = createLane();
  const foe = addFoe(lane, wall({ speed: 0, hp: 100 }));
  addFriend(lane, unit({ kind: 'ranged', range: 1, speed: 0, damage: 3, rateMs: 100 }));

  assert.equal(linesEngaged(lane), false, 'precondition: the lines must not be in contact');

  const ev = step(lane, 100);

  assert.equal(ev.attacks.length, 1);
  assert.ok(foe.hp < 100, 'a ranged unit must not have to wait for melee contact');
});

test('a melee unit behind the front line does not attack', () => {
  const lane = createLane();
  // The foe has to walk down to the hold line, since friends no longer chase.
  addFoe(lane, wall({ speed: 0.1 }));
  const lead = addFriend(lane, wall({ speed: 0.5, damage: 1, rateMs: 100 }));
  const rear = addFriend(lane, wall({ speed: 0.5, damage: 1, rateMs: 100 }));

  const ev = run(lane, 600);

  assert.ok(
    ev.attacks.some((a) => a.by === lead.id),
    'precondition: the front unit should be landing hits',
  );
  assert.equal(
    ev.attacks.some((a) => a.by === rear.id),
    false,
    'a melee unit that is not the front unit must not attack',
  );
});

test('rateMs throttles attacks', () => {
  const lane = createLane();
  addFoe(lane, wall({ speed: 0 }));
  addFriend(lane, unit({ kind: 'ranged', range: 1, speed: 0, damage: 1, rateMs: 1000 }));

  const ev = run(lane, 25, 100);

  assert.equal(ev.attacks.length, 2, 'one swing per rateMs, not one per frame');
});

test('a fresh unit does not attack instantly', () => {
  const lane = createLane();
  addFoe(lane, wall({ speed: 0 }));
  addFriend(lane, unit({ kind: 'ranged', range: 1, speed: 0, damage: 1, rateMs: 500 }));

  assert.equal(step(lane, 1).attacks.length, 0, 'a unit must wind up before its first swing');
  assert.equal(step(lane, 499).attacks.length, 1);
});

test('dead units are removed and reported', () => {
  const lane = createLane();
  const foe = addFoe(lane, wall({ speed: 0, hp: 1 }));
  addFriend(lane, unit({ kind: 'ranged', range: 1, speed: 0, damage: 10, rateMs: 100 }));

  const ev = step(lane, 100);

  assert.equal(ev.deaths.length, 1);
  assert.equal(ev.deaths[0].id, foe.id);
  assert.equal(ev.deaths[0].side, 'foes');
  assert.equal(lane.foes.length, 0);
});

// The generalised form of a bug the old prototype shipped: engagement was
// evaluated before movement, so one long frame could carry the two front units
// straight through each other. Assert the invariant across frame lengths and
// speeds rather than pinning the single case that was found by hand.
test('the lines can never pass through each other, at any frame length', () => {
  for (const dtMs of [1, 16, 33, 100, 250, 1000]) {
    for (const speed of [0.05, 0.5, 5, 50]) {
      const lane = createLane();
      addFoe(lane, wall({ speed }));
      addFriend(lane, wall({ speed }));

      for (let i = 0; i < 50; i++) {
        step(lane, dtMs);
        const e = frontFoe(lane);
        const f = frontFriend(lane);
        assert.ok(e !== null && f !== null, `a body vanished at dt=${dtMs} speed=${speed}`);
        assert.ok(
          e.t < f.t,
          `foe walked past friend at dt=${dtMs} speed=${speed}: ${e.t} >= ${f.t}`,
        );
        assert.ok(
          gap(lane) >= lane.cfg.contact - EPS,
          `closer than contact at dt=${dtMs} speed=${speed}: ${gap(lane)}`,
        );
      }

      assert.equal(lane.leaked, 0, `a foe leaked past a living blocker at dt=${dtMs}`);
    }
  }
});
