import { gap, linesEngaged } from '../game/Lane.js';
import { rateMultiplier, reserveTotal, setFactor, clearFactor, setSlot } from '../game/Pod.js';
import { setTurret, filledSlots, effects as turretEffects } from '../game/Turrets.js';
import { PLACEHOLDER_TURRETS } from '../data/placeholders.js';

const round = (n) => Math.round(n * 1e4) / 1e4;

/**
 * Dev-only console handle. Guarded by `import.meta.env.DEV` at the call site,
 * so Vite drops the branch and tree-shakes this module out of a production
 * build.
 */
export function attachHarness(scene) {
  const snapshot = (u) => ({
    id: u.id, t: round(u.t), hp: u.hp, kind: u.kind, variant: u.variant,
  });

  const h = {
    scene,
    get lane() {
      return scene.lane;
    },
    get pod() {
      return scene.pod;
    },
    get turrets() {
      return scene.turrets;
    },
    /** All the placeholder turret specs, by name, ready to pass to h.turret(). */
    kit: PLACEHOLDER_TURRETS,
    pause() {
      scene.paused = true;
      return 'paused';
    },
    resume() {
      scene.paused = false;
      return 'running';
    },
    /** Advance the sim by a fixed step and redraw, regardless of frame rate. */
    step(ms = 16, times = 1) {
      for (let i = 0; i < times; i++) scene.advance(ms);
      scene.draw();
      return h.state();
    },
    friend(over) {
      const u = scene.spawnFriend(over);
      scene.draw();
      return snapshot(u);
    },
    ranged(over) {
      const u = scene.spawnRanged(over);
      scene.draw();
      return snapshot(u);
    },
    /** Place a turret. Pass a spec from h.kit, or nothing to clear the slot. */
    turret(index, spec = null) {
      setTurret(scene.turrets, index, spec);
      scene.draw();
      return turretEffects(scene.turrets);
    },
    foe(over) {
      const u = scene.spawnFoe(over);
      scene.draw();
      return snapshot(u);
    },
    auto(on) {
      scene.autoSpawn = on !== false;
      return scene.autoSpawn;
    },
    /** Dump the marrow reserve and run hot; returns how many cells deployed. */
    adrenaline() {
      const n = scene.adrenaline();
      scene.draw();
      return n;
    },
    /** Set or clear a named rate factor — stands in for circulation/fever. */
    factor(name, value) {
      const m = value === undefined ? clearFactor(scene.pod, name) : setFactor(scene.pod, name, value);
      scene.draw();
      return m;
    },
    /** Fill or empty a pod slot. Pass no spec to clear it. */
    slot(index, spec = null) {
      setSlot(scene.pod, index, spec);
      scene.draw();
      return scene.pod.slots[index];
    },
    reset() {
      scene.resetLane();
      scene.draw();
      return h.state();
    },
    /** Force a redraw — the preview pane throttles rAF when it is not visible. */
    render() {
      scene.draw();
    },
    state() {
      const l = scene.lane;
      const p = scene.pod;
      const d = gap(l);
      return {
        now: l.now,
        leaked: l.leaked,
        engaged: linesEngaged(l),
        gap: d === Infinity ? null : round(d),
        rate: round(rateMultiplier(p)),
        reserve: reserveTotal(p),
        podSlots: p.slots.filter((s) => s.spec !== null).length,
        turrets: filledSlots(scene.turrets),
        friends: l.friends.map(snapshot),
        foes: l.foes.map(snapshot),
      };
    },
  };

  window.h = h;
  return h;
}
