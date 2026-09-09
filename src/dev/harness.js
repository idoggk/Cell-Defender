import { gap, linesEngaged } from '../game/Lane.js';

const round = (n) => Math.round(n * 1e4) / 1e4;

/**
 * Dev-only console handle. Guarded by `import.meta.env.DEV` at the call site,
 * so Vite drops the branch and tree-shakes this module out of a production
 * build.
 */
export function attachHarness(scene) {
  const snapshot = (u) => ({ id: u.id, t: round(u.t), hp: u.hp, kind: u.kind });

  const h = {
    scene,
    get lane() {
      return scene.lane;
    },
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
    foe(over) {
      const u = scene.spawnFoe(over);
      scene.draw();
      return snapshot(u);
    },
    auto(on) {
      scene.autoSpawn = on !== false;
      return scene.autoSpawn;
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
      const d = gap(l);
      return {
        now: l.now,
        leaked: l.leaked,
        engaged: linesEngaged(l),
        gap: d === Infinity ? null : round(d),
        friends: l.friends.map(snapshot),
        foes: l.foes.map(snapshot),
      };
    },
  };

  window.h = h;
  return h;
}
