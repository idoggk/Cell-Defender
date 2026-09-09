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
  timer. This is the Harvest King model.
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
- **In-run power-up draft** (Harvest King style — kill enemies, earn a choice of
  upgrades). This is the one research pass still outstanding; see below.
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

Two of the originally planned research passes are done and committed:

- `RESEARCH_SPAWN_RATE.md` — spawn-rate dial design, safe multiplier bands, real
  immunology behind it, macronutrient meta.
- `RESEARCH_ROSTER_AND_TURRETS.md` — roster/team sizing and the dead-unit problem,
  turret expiry design (folded in above).

**One more pass is planned and not yet done:** in-run power-up drafts (verify how
Harvest King's mid-run upgrade system works; the general 1-of-3 pattern across
Vampire Survivors/Slay the Spire/Hades/Brotato; what makes a draft pool good, e.g.
Vampire Survivors' evolution system; then a catalogue of 25+ distinct mechanical
verbs from Plants vs Zombies — not a plant list, the things plants *do*
mechanically — and which of those are rare in tower defence generally).

The original handoff referenced "four passes" total without naming a fourth topic
anywhere in the surviving docs — worth asking Ido whether one was dropped
intentionally or just never written down.

## Opinions on record (not decisions)

- Two of the six turret slots should ideally change a rule, not scale a number — a
  turret that knocks enemies back up the lane, or briefly stuns, is a decision;
  "+20% damage aura" is arithmetic.
- Build the data architecture for a big roster; ship small; add units slowly. Bloons
  TD 6 does fine with ~23 towers; every extra unit costs art, balance and testing
  forever.
