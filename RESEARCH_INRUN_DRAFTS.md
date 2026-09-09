# Research — in-run drafts, upgrade pools, and a Plants vs Zombies verb catalogue

Completed 2026-09-09. Third and final planned research pass.

Verification caveats up front, because they shape how much weight to put on §1
specifically: Fandom (fandom.com) returned HTTP 402 / blocked fetching throughout,
exactly as in the prior two passes — wherever a Fandom page is the only source for a
number below, it was read via a search-engine snippet, not a primary fetch, and is
marked as such. wiki.gg mirrors (`plantsvszombies.wiki.gg`, `slaythespire.wiki.gg`,
`vampire.survivors.wiki`) fetched cleanly and are the backbone of §§2–4.

---

## 1. Harvest King's mid-run upgrade system — could not be verified as described

**Bottom line: I could not confirm that Harvest King has a "pick 1 of 3" mid-run
draft at all.** This needs to be said plainly rather than papered over, because
`DESIGN.md` currently attributes a specific mechanic — "pod slots spawn fighters
continuously, on a timer... this is the Harvest King model" — to this game, and
that specific claim (continuous spawning of *walking* units from slots) is not
what the available primary text describes.

**What the game is, confirmed:** *Harvest King: Farm TD Strategy* (also listed as
*Harvest King: Farm Defense TD*), developed by **Semruk Games** (Semruk Oyun
Yazılım ve Pazarlama A.Ş., Istanbul, active since 2023) and published/distributed
via **Homa Games**' hybrid-casual pipeline — support email
`harvestking.support@homagames.com` on the official listing. It is real and not
tiny: **1.7M downloads, 4.36★ from ~16,000 ratings**, ~520K downloads in the most
recent 30-day window at time of research (per Google Play listing data surfaced in
search). It is a 2024/2025-era mobile release, small enough that no wiki, no
developer blog post, and no Reddit thread describing its systems in detail could be
found.

**What the app-store description (fetched directly, quoted verbatim) actually
says, mechanic by mechanic:**

| Claimed mechanic | Store-description text |
|---|---|
| Merge | "Merge your crops into powerful defenders, unlock stronger units and more formidable farm defenses." |
| Slot layout | "Position defenders across **rotating farm slots**, plan your tower defense layout, and adapt your strategy to survive every wave." |
| Resource sub-game | "Control your **rotating sprinkler** to keep crops healthy and defenders fueled. Strategic water management adds a puzzle layer..." |
| Between-wave shop | "Between enemy waves, visit the **shop** to buy tiles, unlock upgrades, and **reroll** your build. Customize your farm TD layout and discover powerful new synergies." |
| Wave count | "10 challenging enemy waves with increasing difficulty" |
| Idle | "Your farm keeps working even when you step away." |

**What this does *not* say, and I looked specifically:** nothing in the store
description, nor in any secondary source found, describes defenders as units that
**spawn continuously and walk up a lane to duel enemies** (the Legion TD / Grow
Castle pattern `DESIGN.md` calls "the Harvest King model"). What is actually
documented reads like a more conventional merge-TD: defenders sit in slots
(which *rotate position*, an unusual detail worth noting on its own) and presumably
attack in place, the way a shooting tower would. "Farm TD layout" and "position
defenders" are placement-game language, not movement-game language.

**The closest thing to an in-run "draft" that is documented is the between-wave
shop, and it is a shop, not a Slay-the-Spire-style forced pick:**
buy tiles / upgrades / defenders from a menu, pay an escalating fee to reroll the
menu's contents. That is structurally the **Brotato pattern** (§2 below) — a
shop with paid, uncapped rerolls — not the **level-up-forces-a-choice** pattern
Vampire Survivors and Slay the Spire use. If Harvest King is the intended reference
for Cell Defence's in-run draft, the more accurate genre label is "merge-TD shop,"
and the design questions to import are Brotato's (reroll pricing, guaranteed
early-wave content, synergy weighting), not Slay the Spire's (forced 1-of-3, pity).

**Discrepancies worth flagging on their own:** an early search synthesis reported
"3.8★, 45 ratings" for the App Store listing; a later one (backed by an actual
quoted fetch) reported 1.7M downloads / 16K ratings. The second is better
evidenced and is what's reported above — the first was likely a stale or
region-scoped cache. Multiple secondary sources also disagreed on developer credit
(Semruk Games vs. "developed by Homa") — Homa is a well-documented hybrid-casual
*publisher* that runs a portfolio of small studios' prototypes through its ad-testing
pipeline, so "Semruk-developed, Homa-published" is the most consistent read, but
this wasn't confirmed by a single source stating both roles together.

> **Honest recommendation:** treat "Harvest King" as validating the *shape* —
> merge-based unit upgrading feeding a lane-defense loop, played on a phone, with a
> shop between waves — but do not cite it as a confirmed precedent for the specific
> continuous-spawn-and-walk mechanic. If that detail matters for the design
> rationale, it's worth Ido confirming from his own play session, since hands-on
> experience would reveal live-gameplay behaviour no marketing copy documents.

---

## 2. The general "1-of-3" draft pattern, with real numbers

None of these four games actually share one mechanism — they're four different
answers to the same problem (how do you hand the player build-defining choices
without a shop UI), and the differences are the interesting part.

| Game | Offer size | Picks | Reroll | Skip | Banish | Weighting / pity |
|---|---|---|---|---|---|---|
| **Vampire Survivors** | **3**, sometimes **4** | 1 | Paid meta-unlock, max **5 ranks × 2 uses = 10/run** | Paid meta-unlock, same 10/run cap | Paid meta-unlock, same 10/run cap, **permanent for the run** | Weighted by item rarity; no repeats within one offer; biased toward items you already partly own |
| **Slay the Spire** | **3** | 1 or **0** (Skip) | **None** in base game (a few relics interact, e.g. Singing Bowl trades the reward for +2 Max HP) | Yes, always free | N/A (a separate relic/potion removes a card from your deck, not from the offer) | **60/37/3%** common/uncommon/rare on normal fights; **pity offset** starts at −5%, **+1% per common seen, resets to −5% on any rare seen, capped at +40%**; elite fights **50/40/10%**; boss rewards are **100% rare**; shop cards **54/37/9%** |
| **Hades** | Reported as **3** boons per god visit in multiple community sources (see flag below) | 1 | No reroll of a single offer; **Fated Persuasion** (Hades 2) lets you swap which *god* shows up, a different lever | Yes — just don't take the door | N/A (boons you don't pick are simply not taken; a later, better offer for the same slot overwrites what you're holding) | 4 rarity tiers (Common/Rare/Epic/Heroic); slot-based (Attack/Special/Cast/Dash/Call) so the game won't re-offer a slot you've filled with something better already held; **Trial of the Gods** rooms are a distinct case — **exactly 2 doors, pick 1, each permanently locks in a specific boon** |
| **Brotato** | **4** shop slots | Buy any/all (limited by materials, not a single pick) | **Unlimited**, cost escalates per reroll within a shop visit: `floor(wave×0.75) + floor(wave×0.40)` for the first, `+floor(wave×0.40)` (min 1) each additional; buying out the shop grants one free reroll | N/A (just don't buy) | **Lock** (free, unlimited) keeps one slot fixed across a reroll at its pre-inflation price | **35% weapon / 65% item** baseline; waves 1–2 guarantee exactly 2 weapons + 2 items, waves 3–5 guarantee ≥1 weapon; a chosen weapon has **20%** chance to match a type you own, **15%** to match a class you own, else fully random — a soft pity toward synergy |

Two numbers worth pulling out because they're load-bearing design signals, not
trivia:

- **VS prices Reroll at 10x Skip/Banish (1,000 vs. 100 gold).** Poncle is telling
  you, in pricing, that *controlling which option appears* is worth far more than
  *declining a bad one*. That's a useful precedent for Cell Defence's own draft: a
  cheap "no" (skip/banish) and an expensive "choose again" (reroll) is a deliberate,
  tested asymmetry, not an accident.
- **Slay the Spire's pity system is a state machine you can describe in one
  sentence** (offset −5%, +1%/common, reset on rare, cap +40%) and it's the single
  cleanest "guaranteed eventually, never predictable exactly" pattern in this
  research pass — directly reusable if Cell Defence wants rare Adaptation unlocks to
  feel earned rather than purely random.

---

## 3. What makes an upgrade pool good vs. bad

### The case against "+10% damage"

The generic critique — well-established in design writing, not invented here — is
that **a choice is only interesting if neither option is obviously correct**
(*[Designing Interesting Decisions in Games](https://www.gamedeveloper.com/design/designing-interesting-decisions-in-games-and-when-not-to-)*,
GameDeveloper.com). "+10% damage vs. +12% damage" fails immediately: it's
dominance-solvable, bigger number wins, no read on the board state changes the
answer, and there is nothing to remember about the choice five minutes later.

But the flaw runs deeper than "one option is bigger." Even a *balanced* pair —
"+10% damage" vs. "+10% attack speed" — is still weak, for three separable reasons:

1. **No opportunity cost that costs anything real.** Both options improve the same
   axis (DPS) by the same amount in the average case. The "choice" is a coin flip
   dressed as a decision. A real trade-off costs you something *categorically
   different* from what it grants — power now for power later, single-target for
   AoE, your own safety for tempo.
2. **No interaction with the rest of the build.** Interesting-ness isn't a property
   of the two options in isolation — it's a property of how each one *composes*
   with what you already have. "+10% attack speed" is a very different pick if you
   own an on-hit effect than if you don't; a pool that can't express that
   difference is just reskinned percentages.
3. **No anticipation.** A choice that pays off immediately and identically every
   time is arithmetic. A choice that sets up something bigger *later*, contingent
   on a second choice you haven't made yet, is a story the player tells themselves
   — and that story is most of why deckbuilders are replayable.

Cell Defence's own `CLAUDE.md` already encodes a sharper, testable version of point
1 — "the two options in a slot must not modify the same stat the same way" — which
is exactly the right generalization of "no +10%-vs-+12%," written as an assertion
instead of a vibe. This research pass's job is to hand back *content* that passes
that test, not just restate the test.

### Vampire Survivors' evolution system, in detail

This is the flagship example because it fails none of the three critiques above,
and because its mechanism is fully documented (`vampire.survivors.wiki`).

**The general rule, confirmed:** a weapon evolves when three conditions are all
true simultaneously:

1. The **base weapon is at max level** in your inventory (usually level 8).
2. A specific **counterpart passive item is at its own required level** (often, but
   not always, that passive's own max level).
3. You collect a **Treasure Chest carrying an evolution-type reward** — on most
   stages these only drop from bosses after the run's 10-minute mark (a few stages,
   e.g. Dairy Plant, relax this timing gate).

| Base weapon | Required passive | Evolution | Note |
|---|---|---|---|
| Whip | Hollow Heart | Bloody Tear | |
| Magic Wand | Empty Tome | Holy Wand | |
| Knife | Bracer | Thousand Edge | |
| Fire Wand | Spinach | Hellfire | |
| Lightning Ring | Duplicator | Thunder Loop | |
| Clock Lancet | Silver Ring **and** Gold Ring, both maxed | — | Two-passive requirement, a rarer sub-case |
| Bracelet / Bi-Bracelet | none | — | Evolves on weapon level alone — the rare case with no passive gate at all |

**Unions are a second, distinct tier on top of evolutions:** two already-evolved
weapons merge into one, typically with *no* passive requirement, and — critically —
**freeing an inventory slot** rather than costing one. Peachone + Ebony Wings →
Vandalier is the standard example: both fully leveled, no counterpart passive
needed, and the payoff is that a previously two-slot commitment becomes one slot,
directly solving the scarcity the run's earlier choices created.

**Why this produces "deckbuilding-style anticipation" and a flat-percentage pool
cannot:**

- **It's legible from minute one.** The inventory UI shows every held item's current
  level, so an experienced player can see *exactly* which piece is missing for a
  planned evolution and steer every subsequent level-up choice toward it. The
  tension isn't "what will I get" — it's "will I get the one specific thing I need
  before the run ends."
- **It taxes the whole build, not just one slot.** With 6 weapon + 6 passive slots
  total, committing to level a passive purely to unlock an evolution is a real
  opportunity cost against every other weapon that could have used that slot
  instead. This is the "modifies the same stat the same way" test's positive
  mirror: two evolution targets *do* pull the build in genuinely different
  directions, because each consumes different slots.
- **The payoff is a new verb, not a bigger number.** Holy Wand removes Magic Wand's
  cooldown between casts entirely (a resource deleted, not reduced). Bloody Tear
  adds lifesteal-on-crit. Thunder Loop's bolts persist on the ground after the
  weapon itself would normally despawn its effect and can be walked back over.
  None of these read as "Whip but +30% damage" — each is a materially different
  thing to play around.

> **The transferable design lesson, stated plainly:** an evolution is not a
> reward for having a maxed weapon — it's a **reward for having planned a
> specific pair from early in the run**, verified through a piece of UI (levels
> visible on held items) that lets players *read* their own progress toward it.
> That's the mechanism to imitate, not the specific weapon+passive pairs.

---

## 4. A catalogue of 25+ distinct mechanical verbs from Plants vs Zombies

This is a list of **things plants mechanically do**, evidenced by naming the
plant(s) that exemplify each — not a plant-by-plant list. Every entry below was
verified against `plantsvszombies.wiki.gg` (a non-Fandom mirror that fetched
cleanly throughout this pass) unless marked otherwise. Numbers are PvZ1 unless a
game is specified, since that's where most of these verbs originate.

| # | Verb | What it does | Evidence (plant, real numbers) |
|---|---|---|---|
| 1 | **Contact instakill, single target** | Crushes/detonates on the one zombie that reaches it | Squash (crushes on contact); Potato Mine (large single-hit damage after arming) |
| 2 | **Timed-arm consumable with a telegraph** | Not usable immediately; visibly signals when ready | Potato Mine — **15s arming**, visibly pops up when armed (from prior pass, `RESEARCH_ROSTER_AND_TURRETS.md`) |
| 3 | **Small-area instant nuke, single-use** | Detonates a bounded area once, plant consumed | Cherry Bomb — 3×3 |
| 4 | **Full-lane instant nuke, single-use** | Clears one entire lane instantly | Jalapeno |
| 5 | **Large-area delayed nuke that denies its own tile afterward** | Bigger blast, but leaves the tile unusable and can kill your own supporting plant | Doom-shroom — PvZ1: **7×5** area, **3-minute** unplantable crater, destroys any Lily Pad/Flower Pot/Pumpkin underneath it; PvZ2: 3-stage growth (1,100 → 1,400 → 2,200 dmg, 3×3 → 5×5), only triggers on being eaten, **13.5s** crater |
| 6 | **Screen-wide instant crowd control, single-use** | Affects every enemy on screen at once, not just a local area | Ice-shroom (PvZ1) — freezes **all zombies on screen** ~3s + slow-after; Zomboni and Balloon Zombies immune |
| 7 | **Local slow-on-hit** | Every hit applies a movement debuff | Snow Pea |
| 8 | **Continuous passive area-denial, armor-ignoring** | A standing trap that damages anything that walks over it, bypassing shields | Spikeweed / Spikerock — damages through screen-doors/newspaper shields; also **instantly destroys wheeled units** (Zomboni) |
| 9 | **Multi-stage degrading wall, visible HP-stage art** | HP loss is shown as a cosmetic stage change, not a bar | Wall-nut (**4,000 HP**) → Tall-nut (**8,000 HP**), cracked-art damage states (from prior pass) |
| 10 | **Consumable-charge defender: N uses of an effect, then degrades to a plain wall** | A "course of doses" unit — closest existing analogue to Cell Defence's medicine framing | Chard Guard — **3 leaves = 3 knockbacks**, then degrades into a 1,500 HP wall (from prior pass) |
| 11 | **Eat-and-remove: outright deletion, not damage, with a vulnerability window** | The target isn't reduced to 0 HP — it's removed from play entirely, and the remover is exposed while it happens | Chomper — full removal of one zombie per bite; a chewing window (~42s in the PvZ1 original) leaves Chomper undefended; single tile ahead only |
| 12 | **Environmental instakill tied to specific terrain** | An instant-kill effect that only exists on one terrain type | Tangle Kelp — drags a zombie underwater for an instant kill in the water lane only; deals flat 400 dmg instead against undraggable Gargantuar-class in PvZ2 |
| 13 | **Mind control / conversion of the enemy that interacts with you** | The enemy doesn't die — it switches sides and fights for you | Hypno-shroom — the zombie that eats it fights for the player; a few zombie types (Jalapeno, Troglobite, Healer) keep harmful abilities even while hypnotized |
| 14 | **Active strip/disable of specific enemy equipment** | Removes a named piece of enemy kit, not a generic debuff | Magnet-shroom — pulls buckets, helmets, pogo sticks, pickaxes (Digger Zombie), **10s cooldown** between steals |
| 15 | **Hard immunity to one named enemy delivery method (not a stat check)** | Blocks a specific attack *method*, and is explicitly incomplete against a different method from the same enemy family | Umbrella Leaf — blocks Bungee Zombie steals and Catapult lobs across a 3×3 area; explicitly does **not** block a Gargantuar's thrown Imp |
| 16 | **Projectile transform-on-pass-through** | Converts an ally's plain projectile into an upgraded one as it travels through | Torchwood (PvZ1) — peas passing through ignite: **2x damage + added splash** |
| 17 | **Full-lane instant piercing beam, armor-ignoring** | Hits every enemy in the lane at once, unlimited pierce | Laser Bean (PvZ2) — hits every zombie in lane, pierces Shield/Excavator armor |
| 18 | **Multi-lane simultaneous attack from one unit** | A single placed unit covers more than its own lane | Threepeater — hits the lane above and below simultaneously from one tile |
| 19 | **Bidirectional single-source attack** | Fires both forward and backward at once | Split Pea |
| 20 | **Dual/alternating ammo types from one unit, damage + utility** | Not a flat-damage repeater — a chance-based split between a damage shot and a control shot | Kernel-pult — **75% corn** (damage) / **25% butter** (**5–8s stacking stun**; instantly downs flying zombies) |
| 21 | **Ammo/charge-limited unit requiring active reload** | Cannot fire until the player manually feeds it ammunition | Coconut Cannon (PvZ2) — must be fed coconuts before it can fire |
| 22 | **Terrain modification: unlocks placement on an otherwise-unplantable tile** | Converts terrain type rather than affecting combat directly | Lily Pad (water → plantable), Flower Pot (roof → plantable) |
| 23 | **Conditional/dependent activation** | A unit that does nothing until a separate trigger fires | Coffee Bean — wakes sleeping mushrooms, mandatory for any mushroom on a day level |
| 24 | **Instant board-wide utility clear, non-damage** | A single action that removes/reveals across the whole board at once | Blover — removes **every** Balloon Zombie on screen and clears fog in one action |
| 25 | **Bounded anti-air niche (can hit a threat type most units can't touch, but not all of them)** | A hard counter to one enemy trait that is explicitly *not* universal within that trait | Cactus (PvZ2) — instantly pops standard Balloon Zombie variants; explicitly **cannot** touch Zombie Parrot, Jetpack Zombie, or Bug Zombie |
| 26 | **Multi-target piercing projectile (bounded, not whole-lane)** | Pierces a fixed number of targets — a middle point between single-target and full-lane pierce (#17) | Cactus — pierces **3** zombies |
| 27 | **Passive resource/currency generation from a combat slot** | The unit's output is economy, not damage | Sunflower (core currency), Marigold (secondary coin currency, silver/gold drops) |

That's 27 genuinely distinct verbs, several represented by more than one plant on
purpose (to show the verb generalizes, not to pad the count). A few candidate
verbs (a lane-wide continuous gas-cloud DoT via Fume-shroom; digger/underground
detection) were considered but dropped rather than included on a single
half-remembered detail — consistent with this project's stated preference for an
honest gap over a shaky citation.

---

## 5. Which of these verbs are actually rare in tower defence

This is the section that turns the catalogue into a design opportunity. The
comparison baseline is Kingdom Rush and Bloons TD 6 — both already covered by the
prior two research passes, plus new checks specific to this pass.

| Verb (from §4) | Status in mainstream TD | Evidence |
|---|---|---|
| Slow-on-hit (#7) | **Standard.** Ice/frost towers are close to genre-universal. | General knowledge; corroborated by prior passes' turret-class taxonomy |
| DoT / chip damage (#8, #20-corn) | **Standard.** | Kingdom Rush's Poison Arrows deal "true damage per second" (TV Tropes tower digest) |
| Splash/AoE damage | **Standard.** Mortars, bombs, artillery are a default archetype. | General genre knowledge |
| Stun/root CC | **Standard.** | Kingdom Rush's Wrath of the Forest immobilizes; general genre knowledge |
| Passive economy generation from a "defensive" slot (#27) | **Common, but not universal.** | BTD6's **Banana Farm**: up to 4 banana bunches/round, ~$80/round base, is a first-class tower archetype. Kingdom Rush has **no** equivalent — gold only comes from kills/waves. So: standard in economy-forward TD, absent in pure lane-defense TD like Kingdom Rush. |
| Hard-counter *tag* requiring the right tool (a static type-check, not an action) | **Standard.** | BTD6's camo/lead detection system is the textbook case: Ninja Monkey detects camo by default, Monkey Village/Sub grant it to others, most towers need an upgrade for lead-popping power. This is genre-standard infrastructure. |
| Knockback (#10) | **Exists, but secondary — not genre-standard.** | BTD6 has a formally named **Knockback** status effect (Press/Shove subtypes, **0.5s** duration, non-MOAB bloons pushed backward at 25% speed) — real, but a minor mechanic on a handful of towers/abilities, not a core archetype. No confirmed example found in Kingdom Rush despite a direct search. |
| Multi-stage degrading wall with visible HP-art (#9) | **Uncommon.** | Kingdom Rush's barracks respawn soldiers but doesn't show visual damage stages on them; a cosmetically-staged wall like Wall-nut/Tall-nut is not the genre norm. |
| Terrain modification — unlocks a placement tile (#22) | **Rare.** | Both Kingdom Rush and BTD6 use fixed, non-modifiable tower slots; neither has a mechanic that turns previously-unusable ground into usable ground. |
| **Mind control / conversion of an enemy into an ally (#13)** | **Very rare.** | Direct search for this exact mechanic across TD games turned up essentially nothing in mainstream titles — the closest hits were tiny indie titles (*Edge of Chaos*). Neither Kingdom Rush nor BTD6 has anything like it. |
| Ammo/charge-limited unit requiring active reload (#21) | **Rare in current TD design.** | Modern TD towers overwhelmingly fire on a *cooldown* (infinite ammo), not a depletable pool the player must refill — a meaningfully different resource-management verb. |
| Eat-and-remove: non-damage outright deletion with a vulnerability window (#11) | **Rare.** | TD combat resolution is almost universally HP-and-damage math; a "capture" action that bypasses HP entirely, with a real cost (exposure) attached, is not a genre pattern found in either reference game. |
| Projectile transform-on-pass-through (#16) | **Essentially unique to PvZ.** | No TD parallel found in this research; the closest cousin is a generic "buff aura," which lacks the specific "your own projectile becomes something else as it travels" framing. |
| Active strip/disable of named enemy equipment (#14) | **Rare**, distinct from the common hard-counter *tag* above. | BTD6's camo/lead system checks a static property; it never *removes* an enemy's ability the way Magnet-shroom actively strips a helmet. The active, visible removal framing is not common. |
| Hard immunity to one named delivery method, explicitly incomplete (#15) | **Uncommon** in this specific "blocks the verb, not the unit-type" framing. | Most TD hard-counters gate by enemy *tag* (camo, lead, flying); gating by *attack method* while remaining vulnerable to the same enemy's other attack (Umbrella Leaf vs. Gargantuar's Imp) is a rarer, more granular pattern. |
| Conditional/dependent activation of another unit (#23) | **Rare.** | TD units are near-universally "always on" once placed; a unit that's dead weight until something else triggers it is not a pattern found in either reference game. |
| Bounded anti-air niche (#25) | **Standard.** | Flying-only towers/targeting restrictions are common across the genre (both reference games have flying-specific counters in some form). |

> **The signal, sorted:** mind control/conversion, terrain modification, active
> equipment-strip, ammo/reload limits, eat-and-remove, and projectile-transform are
> the six verbs that are genuinely rare-to-absent in the games this project is
> already benchmarking against. Everything in the "standard" row is worth having
> in the roster for competence, not for differentiation — the game won't feel
> distinctive because it *also* has a slow tower.

---

## Recommendation

### The shape of the in-run draft

**Anchor on Slay the Spire's offer shape, not Brotato's shop, and definitely not
an unverified "Harvest King system."** §1 found no confirmed precedent in Harvest
King for a forced-choice draft — its documented mechanic is a shop with paid
reroll, which is Brotato's pattern, not Vampire Survivors'/Slay the Spire's. Given
Cell Defence already has one shop-shaped decision point (the between-waves turret
re-application beat, `RESEARCH_ROSTER_AND_TURRETS.md`), a *second* shop-shaped
system risks feeling redundant. A forced 1-of-3 (or occasional 1-of-4, per Vampire
Survivors' Luck-scaled bonus offer) at clean trigger points — wave clear, or a
milestone kill count, matching the continuous-spawn model rather than a
level-threshold — gives the run a genuinely different *kind* of decision from the
shop.

**Copy the pricing asymmetry, not the raw numbers.** Vampire Survivors' 10x price
gap between Reroll (1,000g) and Skip/Banish (100g each) is a real, tested design
signal: *declining* a bad option should be cheap or free; *choosing which specific
option shows up* should be expensive and rare. Applied here: **Skip should be free
or near-free** (it's already a real decision — take nothing now vs. bank for later
— not a giveaway), **Banish should be a metered, earnable resource** (removes one
specific option from the pool for the rest of the run, mirroring how VS's Banish
behaves), and **full Reroll should be the rarest/most expensive lever, if it exists
at all.** This also matches the project's own turret-pricing precedent: free
re-application was explicitly rejected there as "a tap-tax with no real decision in
it" — an unlimited-reroll draft risks the identical failure mode.

**Use Slay the Spire's pity shape for rare Adaptation unlocks**, since it's the
cleanest reusable state machine found in this pass: a running offset that nudges
the odds of a rare/legendary option upward the longer you go without seeing one,
resetting the moment you do. It gives "guaranteed eventually, unpredictable
exactly," which is the right feel for something as structurally important as an
Adaptation slot unlocking.

### Which PvZ-derived verbs to prototype first

Given the two hard constraints already locked in `DESIGN.md` — **turrets never
deal damage**, and **rarity gates *when* something unlocks, not how strong it
is** — three verbs from §4/§5 stand out as both high-impact and structurally
compatible, not just thematically nice:

1. **Mind control / conversion (#13) as a turret ability.** This is the standout
   finding of this pass: Hypno-shroom's verb is *mechanically* non-damage — it
   doesn't reduce the target's HP, it flips its allegiance — which means it
   satisfies "turrets never deal damage" **better** than almost anything else on
   the list, while still being effectively lethal to the enemy's push. It is also
   rated "very rare" in §5, so it would read as genuinely novel against Kingdom
   Rush/BTD6 players. The fictional hook writes itself for an immune-system game:
   opsonization/antibody-tagging that turns an infected cell against its own side
   for a short window. Worth a prototype turret in the antihistamine or antibiotic
   class.
2. **Ammo/charge-limited units (#21), reframed as "doses."** This verb is rare in
   TD generally, and it's a near-perfect mechanical restatement of the *fiction*
   already locked in — "turrets are medicine... medicine is inherently temporary."
   Where turret-expiry already handles *duration*, a doses-based unit would handle
   *uses*, and combining the two (an ability with both a wave-based expiry and a
   limited number of triggers within its lifetime) is unexplored territory the
   project hasn't built yet.
3. **Eat-and-remove with a vulnerability window (#11), as a fighter ability, not a
   turret one.** This verb can't go on a turret (it's damage-adjacent, arguably
   *is* damage in the sense that it ends a duel), but it maps unusually well onto
   the lane's existing "both stop and duel until one dies" resolution rule: a rare
   fighter type that wins a duel by removing the enemy outright rather than
   out-damaging it, with a real cost (an exposed window where a *second* enemy
   arriving mid-duel can freely hit it). That's a genuinely different resolution
   shape from every other fighter, not a stat variant of one.

Terrain modification (#22) and projectile-transform (#16) are rated equally rare
and high-opportunity in §5, but both assume a board geometry (plantable-tile grid,
travelling projectiles) that doesn't cleanly map onto Cell Defence's single
vertical corridor and melee-duel resolution — they're worth keeping on a
someday-list rather than a first-prototype list, pending a board redesign that
would make them make sense.

**What not to build:** anything from the "standard" row of the §5 table as a
*differentiator*. Slow, DoT, splash, and stun are all fine to have — the roster
needs functional basics — but none of them will make Cell Defence read as
distinctive next to Kingdom Rush or BTD6, because both of those games already do
all four well.

---

## Unverified / flagged

- **Harvest King's core combat resolution (continuous spawn + walking units +
  duel) could not be confirmed from any primary source.** The official store
  description (quoted directly above) reads as a more conventional
  fixed-position merge-TD; it neither confirms nor explicitly contradicts the
  "Harvest King model" described in `DESIGN.md`. This is the most consequential
  flag in this document, since a whole board mechanic is attributed to this game.
- **Harvest King's publisher/developer credit is inconsistently reported** across
  sources (Semruk Games vs. "developed by Homa") — likely Semruk-developed,
  Homa-published, but not confirmed from one source stating both roles.
- **Harvest King's rating/download figures conflicted across searches** (45
  ratings vs. 1.7M downloads / 16K ratings); the latter is better evidenced (from
  an actual quoted store fetch) and is what's used above.
- **Hades' exact boon-offer count (3) rests on repeated community/Steam-guide
  citation, not a developer-confirmed formula** — multiple independent sources
  say "3," but no primary source spelling out the selection algorithm was found
  in the time available. Similarly, the exact count of core boon slots (4 vs. 5,
  once Call is included) wasn't pinned to a single authoritative source.
- **Vampire Survivors' item-weighting formula** rendered as garbled/lost markup
  in the fetched wiki text; the qualitative claim (weighted by rarity, biased
  toward partially-owned items, no repeats per offer) is confirmed, the precise
  formula is not.
- **Vampire Survivors' Reroll/Skip/Banish charge pool** — whether the "10 at max
  rank" figure is a permanent lifetime pool or refills each run wasn't
  unambiguously confirmed from the fetched text; treated here as per-run, which
  matches how the mechanic is generally described by players, but flagged.
- **Kingdom Rush knockback:** a direct, targeted search found no confirmed example
  of a push/knockback tower ability in Kingdom Rush. Absence of a search result is
  not proof of absence — this is reported as "not found," not "does not exist."
- **PvZ's Fume-shroom** (a continuous gas-cloud DoT, which would have been a good
  28th verb) was considered but deliberately dropped from the catalogue rather
  than included on a single half-remembered, unverified detail.
- Several Bloons TD 6 figures (Knockback's exact status-effect numbers, Banana
  Farm's income figures, camo/lead detection specifics) came from **Fandom-hosted
  pages read via search snippet**, since bloons.fandom.com was unreachable
  directly — same caveat as the prior two passes.

---

## Sources

**Harvest King:** [App Store](https://apps.apple.com/us/app/harvest-king-farm-defense-td/id6752251959) ·
[Google Play](https://play.google.com/store/apps/details?id=com.semruk.harvestking) ·
[APKPure listing (quoted description)](https://apkpure.com/harvest-king-farm-td-strategy/com.semruk.harvestking) ·
[AppBrain / Semruk Games developer page](https://www.appbrain.com/dev/Semruk+Games/)

**Vampire Survivors:** [Level up](https://vampire.survivors.wiki/w/Level_up) ·
[Evolution](https://vampire.survivors.wiki/w/Evolution) ·
[PowerUps](https://vampire.survivors.wiki/w/PowerUps)

**Slay the Spire:** [Card Rewards (Fandom, via search snippet)](https://slay-the-spire.fandom.com/wiki/Card_Rewards) ·
[Singing Bowl](https://slaythespire.wiki.gg/wiki/Singing_Bowl) ·
[ForgottenArbiter — Correlated Randomness in Slay the Spire](https://forgottenarbiter.github.io/Correlated-Randomness/)

**Hades:** [Steam guide — A guide to the Gates](https://steamcommunity.com/sharedfiles/filedetails/?id=1957398535) ·
[Boons — Fextralife](https://hades.wiki.fextralife.com/Boons) ·
[Mirror of Night — Fextralife](https://hades.wiki.fextralife.com/Mirror_of_Night) (reused from `RESEARCH_SPAWN_RATE.md`)

**Brotato:** [Shop — Brotato Wiki](https://brotato.wiki.spellsandguns.com/Shop) ·
[Weapons — Brotato Wiki](https://brotato.wiki.spellsandguns.com/Weapons)

**Design theory:** [Designing Interesting Decisions in Games (And When Not To) — GameDeveloper.com](https://www.gamedeveloper.com/design/designing-interesting-decisions-in-games-and-when-not-to-)

**Plants vs Zombies (all plantsvszombies.wiki.gg):**
[Hypno-shroom](https://plantsvszombies.wiki.gg/wiki/Hypno-shroom) ·
[Magnet-shroom](https://plantsvszombies.wiki.gg/wiki/Magnet-shroom) ·
[Umbrella Leaf](https://plantsvszombies.wiki.gg/wiki/Umbrella_Leaf) ·
[Torchwood](https://plantsvszombies.wiki.gg/wiki/Torchwood) ·
[Laser Bean](https://plantsvszombies.wiki.gg/wiki/Laser_Bean) ·
[Kernel-pult](https://plantsvszombies.wiki.gg/wiki/Kernel-pult) ·
[Doom-shroom](https://plantsvszombies.wiki.gg/wiki/Doom-shroom) ·
[Ice-shroom](https://plantsvszombies.wiki.gg/wiki/Ice-shroom) ·
[Coffee Bean](https://plantsvszombies.wiki.gg/wiki/Coffee_Bean) ·
[Tangle Kelp](https://plantsvszombies.wiki.gg/wiki/Tangle_Kelp) ·
[Chomper](https://plantsvszombies.wiki.gg/wiki/Chomper) ·
[Blover](https://plantsvszombies.wiki.gg/wiki/Blover) ·
[Threepeater](https://plantsvszombies.wiki.gg/wiki/Threepeater) ·
[Spikeweed](https://plantsvszombies.wiki.gg/wiki/Spikeweed) ·
[Lily Pad](https://plantsvszombies.wiki.gg/wiki/Lily_Pad) ·
[Flower Pot](https://plantsvszombies.wiki.gg/wiki/Flower_Pot) ·
[Cactus](https://plantsvszombies.wiki.gg/wiki/Cactus) ·
[Money (Marigold)](https://plantsvszombies.wiki.gg/wiki/Money) ·
[Chard Guard, Gargantuar, Digger Zombie](https://plantsvszombies.wiki.gg/wiki/Chard_Guard) (reused from `RESEARCH_ROSTER_AND_TURRETS.md`)

**Tower defence comparison:** [Knockback (status effect) — Bloons Fandom, via search snippet](https://bloons.fandom.com/wiki/Knockback_(status_effect)) ·
[Banana Farm (BTD6) — Bloons Fandom, via search snippet](https://bloons.fandom.com/wiki/Banana_Farm_(BTD6)) ·
[Camo Detection / Lead-Popping Power — Bloons Fandom, via search snippet](https://bloons.fandom.com/wiki/Camo_Detection) ·
[Kingdom Rush Towers — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Characters/KingdomRushTowers)
