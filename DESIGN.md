# Cell Defence — design doc

A **tower defence set inside the human body**. Defenders are immune cells and
nutrients; enemies are pathogens. Inspired by Kingdom Rush, Harvest King (a mobile
TD + cards + merge game) and Legion TD.

This project restarted from scratch on 2026-09-09 — no code carried over from an
earlier prototype. The two research passes below (`RESEARCH_SPAWN_RATE.md`,
`RESEARCH_ROSTER_AND_TURRETS.md`) did carry over: they contain cited numbers that
would be wasteful to re-derive. Their conclusions are folded into this doc.

## The board

```
        ENEMIES SPAWN HERE          <- top of a straight vertical corridor
              |
   [T]        |        [T]          <- 6 turret slots flanking the lane
              |
   [T]        |        [T]              enemies walk DOWN
              |                          fighters walk UP
   [T]        |        [T]
              |
  +-----------------------+
  | O O O O   CORE  O O O |         <- base pod: 9-10 slots + the organ you defend
  |   O O O       O O O   |
  +-----------------------+
```

- **Enemies** spawn at the top and walk down the corridor.
- **Pod slots (9–10)** each hold a unit that **spawns fighters continuously**, on a
  timer. This was attributed to "the Harvest King model," but `RESEARCH_INRUN_DRAFTS.md`
  could not confirm that Harvest King actually works this way — its documented
  mechanic (store description) reads as a fixed-position merge-TD with a between-wave
  shop, closer to Brotato's pattern than to continuous spawn-and-walk. The board
  design here stands on its own regardless; the citation just needs fixing. Worth
  confirming from Ido's own play session if he has hands-on time with the game.
- **Fighters walk UP the lane** and, on contact with an enemy, **both stop and duel**
  until one dies. The front line moves depending on who is winning (Legion TD / Grow
  Castle).
- **Turret slots (6)** flank the lane. **Turrets never deal damage** — they heal,
  buff, slow and crowd-control. That constraint is deliberate: it makes those six
  slots a question about *terms of engagement*, not "which shooter goes here," and
  stops the lane being a pure DPS race.
- **Turrets are medicine** — antibiotics, painkillers, antihistamines, barrier gels.
  Things that are *not* part of the body. That framing matters: medicine is inherently
  temporary, which solves "a slot that never kills feels like a passive tax" in the
  fiction rather than by mechanical patch.
- Reaching the **core** at the bottom is how you lose.

Three organ maps are planned: Bloodstream, Airway, Gut. (Art for these existed in the
discarded prototype; will need to be regenerated or re-extracted.)

## Decisions already made — don't relitigate without a new argument

1. **Merging is a true merge.** Two placed units of the same type and same rank
   combine into one of the next rank, freeing a slot. Cards never upgrade a unit in
   place. Power-ups are a separate system.
2. **Scarcity is what makes it a game.** A hard cap on deployed units is load-bearing —
   without one, simulated play showed the board full and undamaged for the first
   third of a run, with every real decision already made by then. In this design the
   slot count *is* that cap.
3. **Rarity is not a power axis.** Common → Legendary sets *when* a unit's Adaptation
   slots unlock, not how strong it is. Commons unlock earliest, so a starting unit
   never becomes dead weight (borrowed from Rush Royale).
4. **Every unlock is a choice between two.** A single forced unlock is a tax, not a
   decision. Both options stay visible after choosing, so the trade-off is legible.
5. **Healing must lose to enemy DPS.** Any healing effect needs to sit below the
   weakest enemy's melee DPS, so an enemy rebalance breaks the build rather than
   silently enabling an infinite stall. (Precedent: PvZ had to blacklist a healing
   plant from certain partner combos because it could stall zombies forever.)
6. **No second "meter" bar (e.g. a floated "blood pressure" idea).** A meter that
   only drops when you take hits is the health bar wearing a hat. A meter earns its
   place by doing something else: spent on purpose, changing rules rather than
   numbers, or punishing success.
7. **Preparation phase.** Build freely between waves, no timer; press START WAVE and
   the board locks until it's cleared. Power-ups stay usable mid-wave on purpose —
   locking *everything* would leave combat with no input at all.
8. **Turrets never damage; turrets are medicine.** See board section above.

## Roster and turret-expiry decisions (from research, 2026-09-09)

`RESEARCH_ROSTER_AND_TURRETS.md` answered two of the open questions below with real
comparative data. Recorded here as current direction, not yet locked:

- **Target roster: 24 fighters + 10 medicine turrets (34 total).** Team = 6 fighters +
  3 turret types (6 turret slots, each type placeable twice). 34 total keeps balance
  pairs (~561) roughly at what one person can hand-tune without telemetry.
- **Turret classes: 5 classes × 2 units each** — antibiotic (DoT / anti-armour),
  painkiller (ally sustain), antihistamine (cleanse / anti-CC), barrier gel
  (slow/block), stimulant (buff).
- **Launch smaller than the target: 16 fighters + 6 turrets (22)**, built on data
  architecture for 34. Learn which units the meta wants before animating the rest.
- **Unlock pacing:** start below team size (4 fighters + 2 turrets) so early runs have
  zero pick friction; team slot count itself grows 3→4→5→6 across the first ~10 runs
  (a stronger progression beat than growing the bank); then ~1 new unit per 2–3 runs.
- **Turrets do expire — tied to wave boundaries, not a free-running clock.** Duration:
  2 waves, snapped to boundaries (placed mid-wave 3 → expires end of wave 5), never
  less than one full wave. Re-application happens in the between-waves planning beat —
  one decision per wave, not six taps per wave. HP bar drains as the lifetime timer
  (Clash Royale pattern: one readout for both damage and time remaining, no numeric
  countdown). Expiry and destruction share one death event/animation.
- **Pricing discourages spamming one turret ("antibiotic resistance"):** first
  placement 100%; immediate renewal of the same type in the same lane 80%; each
  further consecutive renewal 100%→130%→170%→220%, decaying one step per ~20s the
  type sits unused. Free re-application was explicitly rejected — it produces a
  tap-tax with no real decision in it.
- **Turret destruction (separate from expiry) should be rare, local, and never
  penalised beyond tempo loss** — a destroyed slot re-places at base cost, no
  resistance penalty stacked on top.

## Lane combat model — implemented in `src/game/Lane.js`

Pure and headless: no Phaser, no DOM, a whole battle runs in Node. 12 tests in
`test/lane.test.mjs`, run with `npm test` (zero dependencies — nothing to install).

**The axis.** One number per unit: `t = 0` is the enemy spawn at the top of the
corridor, `t = 1` is the core. Foes walk 0 → 1, friends walk 1 → 0. So the front
foe is the one with the *highest* t and the front friend the one with the *lowest*.

**Rules the model encodes:**

- **Front-line duelling.** The opposing front units close until they are `contact`
  apart, then both stop. Everyone else queues `spacing` behind the unit ahead.
- **Melee needs to be front *and* engaged; ranged only needs a target in
  `range`.** A ranged unit fires over its own front line at an approaching enemy
  before contact — the old prototype got this wrong and ranged units couldn't fire
  until melee contact, which defeated the point of ranged.
- **Damage resolves simultaneously within a frame.** Both sides' attacks are read
  before either applies, so a duel can kill both duellists on the same frame
  rather than whichever line happens to resolve first winning every tie. **This is
  a rule choice, not a technical necessity — say if you'd rather one side win ties.**
- **A fresh unit winds up.** A newly spawned unit waits one full attack interval
  before its first swing instead of hitting the instant it comes into reach.
- **Foes settle before friends each frame**, so the front pair can never pass
  through each other even on a very long frame step. Verified as an invariant
  across frame lengths of 1–1000 ms and speeds spanning 1000×, rather than by
  pinning one hand-found case.
- **A leak is just `t >= 1`.** The model counts leaks and reports them; what a leak
  *costs* (core HP, run loss) is deliberately the caller's business, not the lane's.

**Numbers that are yours, currently placeholders** (all in `DEFAULTS` at the top of
`Lane.js`, in t-units where the whole corridor is 1.0):

| Dial | Placeholder | What it controls |
|---|---|---|
| `contact` | 0.02 | How far apart front units stand while duelling |
| `spacing` | 0.03 | Queue gap between units in the same line |
| `holdLine` | 0.08 | Where a friend stops when there is nothing to fight |

`holdLine` was an open question from the earlier prototype — whether a fighter with
no enemies should walk all the way to `t = 0` and park on the enemy spawn, or hold
short of it. **Currently set to hold short (0.08). Confirm or change.**

## Pod slots — implemented in `src/game/Pod.js`

Pure and headless like the lane; it emits spawn descriptions and never touches
the lane itself. Shape follows `RESEARCH_SPAWN_RATE.md`: throughput comes from
slot **count**, not from shrinking the interval, and every rate source is
short-lived and self-correcting.

**What it does:**

- **Each filled slot spawns on its own timer.** Base interval 5.5s.
- **Marrow reserve.** A slot that *cannot* deploy stockpiles instead, up to
  `reserveMax`. A completed cycle with a full reserve is simply lost, which caps
  stockpiling without a separate clamp.
- **A slot cannot deploy** when the population cap is reached, or (by default)
  when the lane is clear — you stockpile rather than pour cells into an empty
  corridor. That second rule dovetails with the preparation-phase decision:
  pods bank between waves and dump when the wave starts.
- **Adrenaline / demargination** releases the whole stockpile at once and runs at
  2× for 8s, then pays a 0.6× trough for 15s. Released reserve cells are
  **mature, never bands** — left shift is what happens when *production*
  outruns maturation, and the reserve is pre-made.
- **Left shift.** Above 1× production, a share of spawns arrive as bands at 60%
  HP and damage, scaling with how far into the overdrive band you are. Spread
  **deterministically by accumulated debt rather than rolled**, so a run is
  reproducible and a player never eats an unlucky streak.
- **The product of all rate factors is clamped to 0.5×–2.0×.** Circulation,
  fever and hypoxia are not built — all three need something undecided (see
  Open questions) — but they plug into the named-factor map with no refactor.

**Numbers that are yours, currently placeholders** (all in `POD_DEFAULTS`):

| Dial | Placeholder | Notes |
|---|---|---|
| `intervalMs` | 5500 | Research suggested 5–6s |
| `slotCount` | 6 | Board art implies 9–10; unlock pacing undecided |
| `reserveMax` | 3 | Per slot |
| `popCap` | 12 | The blood granulocyte pool — **but see the finding below** |
| `rateMin` / `rateMax` | 0.5 / 2.0 | Straight from the research's safe band |
| `bandStatMul` | 0.6 | Applied to HP and damage; **not** to speed |
| adrenaline | 2.0× / 8s, then 0.6× / 15s | |

### Finding: the lane is a width-1 bottleneck, and the population cap is not the real constraint

A headless replay of the demo matchup (2 minutes, placeholder stats) holds the
front line at mid-lane and leaks nothing — but **enemies accumulate without
bound**, 25 and still climbing at 2 minutes. The cause is structural, not a
tuning error:

**Only the front pair duels, so lane throughput is one duel at a time no matter
how large either army is.** With the placeholder numbers a friend needs 5 hits
at 600ms to kill a 14 HP foe — about **3s per kill, i.e. a hard ceiling of ~0.33
kills/sec** — while foes arrive every 2s. Arrival outruns resolution, so the
queue grows for ever. Friends sat pinned at 10–12 the whole time, meaning the
population cap of 12 was *never the binding constraint*; the single front-line
duel was.

Measured over 180s against a 0.5 foe/sec arrival rate, where 0.5 kills/sec is
the rate needed to hold:

| Setup | Kills/sec | Foes left |
|---|---|---|
| Melee pods, no turrets | 0.31 | 35 |
| Melee pods + 2 barrier gel (slow) | 0.30 | 36 |
| Melee pods + 2 stimulant (damage) | 0.31 | 35 |
| Melee pods + 2 painkiller (heal) | 0.31 | 35 |
| Melee pods + **all six turrets** | 0.30 | 36 |
| **Ranged pods**, no turrets | **0.50** | **0** |
| Ranged pods, 6 slots | 0.50 | 0 |

1. **Ranged fighters are not a nice-to-have, they are the only way to add damage
   to the lane.** A melee unit behind the front line contributes literally
   nothing; ranged units stack additively from behind, and switching pods from
   melee to ranged took throughput from 0.31 to arrival-capped 0.50 (real
   capacity ~1.3/sec). This makes the ranged/melee split a first-order roster
   decision rather than a flavour one.

2. **Turrets, as currently built, contribute almost nothing — and the reason is
   structural, not a tuning miss.** Filling all six slots moved throughput by
   less than the noise. The cause is a feedback loop:

   > **A turret that helps the front line push forward moves the front line out
   > of its own reach.** Support in this geometry is self-cancelling.

   Measured, with three fixed rows at t = 0.25 / 0.50 / 0.75 and reach ±0.12:
   with no turrets the front friend sits at t ≈ 0.37–0.53. A stimulant on the
   0.25 row buffed **1 of 276 swings** — its band is behind the fight. On the
   0.50 row it buffed 48 of 276, and in doing so pushed the line up to t ≈
   0.22–0.36, i.e. out of the band that was helping it. With all six slots
   filled the line was driven to t ≈ 0.03–0.15 and **0 of 270 swings were
   buffed at all**.

   This is the design problem to solve before any turret content is worth
   authoring, and it bears directly on the `holdLine` open question below.
   `holdLine` is not a cosmetic "where does a lone fighter park" detail — **it
   is the dial that decides whether fixed turret slots can function at all.**
   Options, roughly in order of how much they preserve a real spatial decision:

   - **Raise `holdLine` so fighters hold a line instead of charging the spawn.**
     If the fight reliably happens in a known band, turret placement becomes a
     genuine decision and the slots work as designed. Costs nothing — the dial
     already exists.
   - **Anchor reach to the front line** rather than to the slot ("affects the
     engaged pair / front N units"). Solves it completely, but throws away the
     spatial decision the six slots were supposed to be.
   - **Widen reach** until turrets are effectively global auras. Simplest, and
     it makes placement meaningless — probably the worst of the three.

3. **The population cap does not do the anti-snowball job the research assigned
   it** in this lane geometry, because the bottleneck binds first — friends sat
   pinned at 11–12 the whole time while foes accumulated. Keep it as a cheap
   safety rail if you like, but it is not the balancing tool. Wave design has to
   budget total enemy HP against **duel resolution speed**, not army size.

## Open questions — not yet decided

- **Which units are turrets and which are walkers**, concretely. Instinct: turrets =
  heal / strengthen / slow / crowd-control; walkers carry all damage. No roster exists
  yet to assign.
- **Macronutrients** (carbs/protein/fat) as a between-run meta layer. Research
  direction (`RESEARCH_SPAWN_RATE.md` §6): one earned currency, spent as three
  sliders on a fixed zero-sum budget, not three separate currencies. Carbs → spawn
  rate (0.8–1.25×), protein → HP/damage (±20%, deficiency cliff below ~15%), fat →
  duration (±30%, including turret lifetime — ties directly into the turret-expiry
  system above). **Do not build this until the core loop is fun** — it's a meta layer
  on top of a loop that doesn't exist yet.
- **In-run power-up draft — direction proposed, not locked.**
  `RESEARCH_INRUN_DRAFTS.md` recommends anchoring on Slay the Spire's forced 1-of-3
  (or occasional 1-of-4) at wave-clear or milestone-kill triggers, *not* a shop —
  the between-wave turret re-application beat already covers the "shop" decision
  shape, so a second shop-shaped system would be redundant. Pricing should copy
  Vampire Survivors' asymmetry (cheap/free Skip, metered Banish, Reroll rarest/most
  expensive if it exists at all) rather than free rerolling, consistent with the
  turret-pricing rule that free re-application is a tap-tax with no decision in it.
  Rare Adaptation unlocks could use Slay the Spire's pity odds (−5% offset, +1% per
  common seen, resets on rare, capped +40%) for a "guaranteed eventually,
  unpredictable exactly" feel.
- **Slot unlocking generally.** 16 lane slots is a lot to open at wave 1 — presumably
  unlocks over a run or across the meta. Turret team-slot pacing above (3→6) is
  decided; pod-slot pacing is not.
- **Pod slot count per organ: 9 vs 10.** Original art had Gut at 9 pod slots, the
  other two organs at 10. Since art is being regenerated from scratch, this is now a
  free choice rather than something to reconcile — decide deliberately rather than
  defaulting to whatever a new image happens to show.
- **Legendaries:** how they're earned, one per squad or not, whether they cost two
  slots.
- **The energy/economy model for continuous spawning.** Per-wave income assumes a
  discrete prep phase; with continuous spawning the open question is whether you pay
  per fighter, per slot, or not at all.

## Research status

All three research passes originally planned for this restart are done and
committed:

- `RESEARCH_SPAWN_RATE.md` — spawn-rate dial design, safe multiplier bands, real
  immunology behind it, macronutrient meta.
- `RESEARCH_ROSTER_AND_TURRETS.md` — roster/team sizing and the dead-unit problem,
  turret expiry design (folded in above).
- `RESEARCH_INRUN_DRAFTS.md` — in-run draft shape (folded in above), plus a
  catalogue of 27 distinct mechanical verbs from Plants vs Zombies and which of
  them are rare enough in tower defence generally to be worth differentiating on
  (see below). Also the source of the Harvest King citation flag above.

The original handoff referenced "four passes" total without naming a fourth topic
anywhere in the surviving docs — worth asking Ido whether one was dropped
intentionally or just never written down.

### Candidate ability verbs worth prototyping first

From the PvZ verb catalogue, cross-checked against Kingdom Rush/BTD6 for rarity.
Not decided — candidates for the first units built once a roster is scoped:

- **Mind control / conversion as a turret ability.** Mechanically non-damage (it
  flips allegiance rather than reducing HP), so it satisfies "turrets never deal
  damage" better than almost any other option, and it's rated the single rarest
  verb against mainstream TD. Fictional hook: opsonization/antibody-tagging that
  turns an infected cell against its own side for a short window. Candidate for the
  antihistamine or antibiotic turret class.
- **Ammo/charge-limited units, reframed as "doses."** Rare in TD generally, and a
  near-literal restatement of "medicine is inherently temporary" — where turret
  expiry already handles *duration*, this would handle *uses*, and combining both
  (a wave-based expiry AND a limited trigger count within its lifetime) is
  unexplored territory here.
- **Eat-and-remove with a vulnerability window, as a fighter ability (not a
  turret one — this is damage-adjacent).** Maps onto the lane's existing
  stop-and-duel resolution: a rare fighter wins a duel by removing the enemy
  outright rather than out-damaging it, with a real cost (a second enemy arriving
  mid-duel can freely hit it while it's occupied).
- Terrain modification and projectile-transform-on-pass-through are rated equally
  rare/high-opportunity but assume a tile-grid or travelling-projectile board that
  doesn't map cleanly onto the single-corridor lane — parked for a possible future
  board variant rather than a first prototype.

## Opinions on record (not decisions)

- Two of the six turret slots should ideally change a rule, not scale a number — a
  turret that knocks enemies back up the lane, or briefly stuns, is a decision;
  "+20% damage aura" is arithmetic.
- Build the data architecture for a big roster; ship small; add units slowly. Bloons
  TD 6 does fine with ~23 towers; every extra unit costs art, balance and testing
  forever.
