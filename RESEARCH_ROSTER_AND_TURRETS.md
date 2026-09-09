# Research — roster size, and whether medicine-turrets should expire

Completed 2026-09-09. Carried over verbatim from the earlier session's research pass.
Verification caveats at the bottom.

---

# Part A — large rosters, small teams

## 1. Roster vs team size, real numbers

| Game | Roster | Into a match | Ratio |
|---|---|---|---|
| **Clash Royale** | ~120 cards | **8** + 1 tower troop; max 2 evolutions, 2 champions | 15:1 |
| **Arknights** | **429** operators | **12**-operator squad; 4 saved squads | 36:1 |
| **PvZ 2** | **188** plants | **7** seed slots, **8** max | 24:1 |
| **Bloons TD 6** | **25** towers, 17 heroes | Unlimited towers, **1 hero** | ~1:1 |
| **Legion TD 2** | ~**180** fighters | Ranked draft: offered **10**, pick **6** | 30:1 nominal, **1.7:1 effective** |
| **Rush Royale** | ~32 units | **5** + 1 hero | 6:1 |
| **Grow Castle** | **41** heroes | **12** slots (13th paid) | 3:1 |

> **The single most transferable fact: no game here ever grew its team size.** Rosters
> grew 3–10x; slot counts are frozen at launch. Team size is the difficulty and UX
> contract; roster is the monetisation and novelty surface.

## 2. How bloat is actually avoided

- **Combinatorial identity instead of unit count (BTD6).** 25 towers × 3 upgrade paths,
  with "only two paths, and only one past tier 2". Roster of 25, design space of
  thousands of legal builds, each tower one readable silhouette. **The highest-leverage
  pattern for a solo dev: depth from rules, not from asset count.**
- **Class + archetype taxonomy (Arknights).** 8 classes split into named archetypes with
  hard-coded stat conventions — every Executor Specialist has an 18s redeploy against
  the standard 70s. The archetype tells you the role before you read the kit.
- **Slot-type restrictions (Clash Royale).** ≤2 evolutions, ≤2 champions, exactly 1
  tower troop. New-content pressure lands on the restricted slots, so power creep
  doesn't leak into all 8.
- **Rotating availability by draft, not by patch (Legion TD 2).** Same roster every
  patch, a different puzzle every game. **The cheapest possible way to make a fixed
  roster feel large.**
- **Rebalance cadence.** Supercell ships monthly. The Elixir Collector line is a clean
  worked example of tuning *tempo* while holding *total value* constant.

*No Ninja Kiwi or Ironhide statement of an explicit "every tower is uniquely best at one
thing" rule could be found. Treat that principle as folklore, not a citable quote.*

## 3. The dead-unit problem — what the data says

- **Clash Royale (115 cards tracked):** The Log **27%** usage, Arrows **26%**, Hog Rider
  **18%**. But Cannon Cart has the **best win rate in the game — 56% — on 4% usage**,
  and Mirror is worst at 42%. **Usage and win rate are almost decoupled:** low usage is
  deck-slot opportunity cost, not weakness.
- **Arknights:** tier lists cover roughly **70 meta-relevant operators out of 429** —
  under a quarter. Named power-creep casualties: Exusiai and W displaced by Wiš'adel.

**What kills a unit:** strict power creep; redundancy with a cheaper unit; opportunity
cost in a fixed-slot deck (a good unit with no slot is a dead unit); a counter becoming
ubiquitous.

**Fixes that shipped:** monthly rebalancing; *Evolutions*, giving ancient commons a new
ceiling without new cards; reworks that change the *value shape* rather than the numbers.

## 4. Team-picking UI at scale

Arknights is the reference implementation for 400 units on a phone:

- **4 named, saved squads of 12**, editable from home or the pre-mission screen.
- Sort by acquisition date, trust, HP, ATK, DEF, RES, redeploy time, block count, attack
  speed.
- **The sorted stat is overlaid onto the operator portrait**, so you compare without
  opening anything. *Steal this outright.*
- Filter by class / archetype / rarity, class ribbon on the card.

Clash Royale outsources the "recommended team" problem to the community with shareable
**deck-copy links** — one tap to import.

**The real complaint isn't choosing, it's investment gating:** players "may have the team
they want to use but feel completely stuck because they don't have enough characters at
the right promotion level." Secondary: no filter for "units I've actually levelled".

## 5. The honest case against a large roster

**Take this seriously — it's the strongest argument in the document.**

- **Balancing cost is superlinear.** Interactions scale ~n²/2. **24 units = 276 pairs.
  40 = 780. 80 = 3,160.** You are one person with no telemetry.
- **Existence proofs go the other way.** BTD6 ships **25** towers and is one of the
  highest-grossing premium mobile games ever. Kingdom Rush ships **four** tower
  archetypes per game.
- **Solo-dev evidence.** Core Defense (solo, ~8 months): $20,186 first Steam week, ~$50k
  by the writeup. The stated lesson was avoiding the "complexity monster" in favour of
  "simple but highly replayable and strategically diverse."
- **Art is the hard cost.** Walking fighters need idle, walk, attack, death, hit-react.
  40 units → **200 animation states**; 20 units → 100. That difference is months.
- **The dead-unit data argues against you.** If Arknights, with a 100+ person pipeline,
  keeps only ~70 of 429 relevant, a solo dev shipping 60 is shipping ~45 nobody uses —
  and still has to draw, animate, balance and QA all 60.
- **Large-roster games don't monetise roster size.** They monetise acquisition friction
  and upgrade depth. Same collection dopamine from 24 units with deep trees, at a third
  the cost.

**Counter-counter:** a pre-run team pick does need enough bank to be a real decision —
but the threshold is lower than people assume. **Legion TD 2 proves 10 options is enough
for a decade-old competitive game.**

---

# Part B — expiring and destructible turrets

## 6. Temporary defences, real durations

**Clash Royale: every building has a Lifetime, and the health bar *is* the timer.**
Buildings lose HP every second even when unattacked. **There is no separate countdown
UI** — one bar shows damage taken and time remaining together. *This is the best single
UX decision in the entire research set.*

| Card | Elixir | Lifetime |
|---|---|---|
| Cannon | 3 | **30s** |
| Mortar | 4 | **30s** |
| Tombstone | 3 | **40s** (spawns skeletons every 2.9s; **4 on death**) |
| Tesla | 4 | **40s** |
| Bomb Tower | 5 | **40s** |
| Inferno Tower | 5 | **40s** |
| X-Bow | 6 | **40s** |
| Furnace | 5 | **50s** |
| Goblin Hut | 5 | **60s** |
| Elixir Collector | 6 | **86s** (was 65s) |

**Expiry behaviour: the building dies exactly as if killed** — same animation, and
death-spawns still fire. **Expiry and destruction are the same event.** One code path,
one player mental model.

**PvZ:**
- **Potato Mine:** 25 sun, **15s arming**, ~1,800 damage, single use. *The arming
  animation is the warning* — it visibly pops up when ready.
- **Cherry Bomb / Jalapeno / Squash:** instant, single use, ~1,800 damage.
- **Degradation stages:** Wall-nut **4,000 HP**, Tall-nut **8,000 HP**, with visible
  cracked art so damage state reads without a bar.
- **Chard Guard:** 75 sun, **3 leaves = 3 knockbacks**, then degrades into a 1,500 HP
  wall. **The closest existing analogue to "a course of medicine with N doses."**

**Arknights redeploy timers:** base **70s**, Executor Specialists **18s**, Merchant 25s,
1★ operators 200s. "Fleeting" summons have a limited lifespan and cannot be attacked.

## 7. Why lifetime works

**Flagged: no Supercell developer statement explaining building lifetime exists in any
reachable source.** What follows is analysis of the patch record, not a quote.

The record is conclusive about *how they use it*. Across three Elixir Collector reworks
Supercell held **total output constant while changing tempo** (lifetime +32% alongside
production interval +33%). The intent that reveals:

> **A lifetime turns a placement from a permanent asset into a fixed-size package of
> value.** Once lifetime × rate is a constant, the card's power is one number you
> control, and the placement becomes a *timing* decision rather than an *accumulation*
> decision.

Three problems it solves, in order:

1. **It caps accumulation.** On a finite board, permanent defences only ever increase;
   whoever survives early wins by default. Lifetime makes the board decay to neutral, so
   a lead must be spent, not banked.
2. **It gives the attacker a free counter: patience.** A permanent tower needs a spell.
   A 40-second one can be answered by waiting 40 seconds — counterplay that costs
   nothing but tempo, which keeps poorer players in the game.
3. **It forces re-investment, creating windows.** Every re-placement is resource not
   spent on offence. **The defender's own defence is what opens them up.**

## 8. Enemies that destroy defences

**PvZ is the reference text:**
- **Gargantuar:** 3,000 HP, **instantly crushes** the plant it reaches. Warning: huge
  silhouette, slow walk, telegraphed hammer wind-up.
- **Zomboni:** crushes plants *and* leaves an ice trail you cannot plant on. The denial
  is worse than the destruction, and temporary.
- **Bungee Zombie:** descends and **steals a plant outright**. Warning: a targeting
  reticle on the doomed tile *before it drops*.
- **Digger Zombie:** tunnels under your line. Counters are *specific plants* — Split Pea
  shoots backwards, Magnet-shroom strips his pickaxe.

> The PvZ pattern: destruction is **always telegraphed, always local (one tile), always
> answerable by a named counter-unit, and repairable at normal cost.** It converts
> destruction into a *deck-building* problem, not a *reflex* problem.

**Kingdom Rush — Umbra** destroys towers outright; standard guidance is to **hold
1,000–2,000 gold in reserve to rebuild**. The game tells you to budget for it.

**They Are Billions — the cautionary tale.** Infected buildings must be *completely*
repaired to function. Players found "it costs more gold to repair most buildings, making
it better to delete the building for the 50% return and then rebuild", and describe an
"all or nothing failure situation" where "you can potentially survive a heavy attack but
fail because you simply can't repair."

**The rules that fall out:**
1. Telegraph **on the tile**, not in a HUD corner.
2. Loss must be **local and bounded** — one turret, never a cascade.
3. **Rebuild cost ≤ first build cost.** If repair ≥ rebuild, players demolish and your
   repair system is a two-click tax.
4. Give the destroyer a **named counter** in the roster — the answer is "bring X", not
   "react faster".

## 9. Diminishing returns / resistance

- **World of Warcraft — the canonical implementation.** Seven categories (stuns,
  silences, roots, disorients…). Within a category on one target: **100% → 50% → 25% →
  immune**, on a ~16–18s window.
- **Dota 2.** Status Resistance stacks **multiplicatively**, i.e. with diminishing
  returns. Patch **7.34** split out Slow Resistance as a separate stat.
- **League — the negative case.** Riot has **never** shipped DR on hard CC despite a
  decade of requests. Instead: Tenacity, plus a hard floor of **0.3s** below which CC
  cannot be reduced, plus a carve-out list tenacity doesn't touch.
- **Plague Inc.** Its "Drug Resistance" raises **infectivity in rich countries** and
  **does not affect cure research at all**. Worth knowing before assuming the biology
  maps to the obvious mechanic.

**Is it fun?** Split, informatively. Players endorse DR *in principle* — LoL forums have
asked for years. But WoW players hate *that* implementation, and the named failure is
comps whose CCs **don't share a DR category**, letting them "lock out a person for 15–20
seconds."

> **DR is loved when the categories are few and legible, hated when the player can't
> predict which effects share a bucket.** Ship **3–4 named categories, visibly tracked
> on the enemy** — never a hidden per-ability counter.

## 10. When expiry becomes a chore

- **Rust base decay.** Upkeep — **10% of build cost per 24 hours**. It works
  mechanically, but turns the game into an attendance obligation. **Decay that requires
  *maintenance* rather than *decisions* is a subscription, not a mechanic.**
- **They Are Billions repair** — covered above; the "repair" verb generated clicks and
  no decision.
- **The generic failure:** a timer whose correct response is always identical is a
  metronome, not a mechanic.

**Five tests — a lifetime is good only if it passes all five:**

1. **Re-placement is a choice, not a reflex.** There's a cost, and spending it must
   sometimes be wrong. CR passes (3 elixir not spent on offence). Rust fails.
2. **Expiry is the terms of the deal, not a punishment.** The player *bought* 30 seconds.
   A framing problem, solved by making the HP bar the timer — you watch what you bought
   get consumed.
3. **The cadence is slower than the attention loop.** If you re-place more often than you
   make a strategic decision, it's busywork. **Do this arithmetic first.**
4. **Expiry is legible on the object.** No corner-of-screen timer.
5. **Expiry never cascades.** One thing ends; nothing else breaks because it ended.

---

# Recommendations

## (a) Roster and team size

**Ship 24 fighters + 10 medicine turrets = 34. Team = 6 fighters + 3 turret types.**

- **34 total = 561 balance pairs.** At 50 it's 1,225; at 80 it's 3,160. **561 is roughly
  the ceiling one person can hand-tune without telemetry** — this is the binding
  constraint and the number to hold if something has to give.
- **6-of-24 (4:1)** sits near **Legion TD 2's effective ratio**, not Clash Royale's 15:1
  or Arknights' 36:1 — those are underwritten by 100+ person studios.
- **6 fighters against ~10 pod slots** means fighters repeat in the lane, which is what
  you want: each pick's identity becomes legible over a run.
- **3 turret types across 6 slots** (each placeable twice). Six *distinct* support
  effects on screen at once is unreadable on a phone.
- **10 turrets = 2 per medicine class:** antibiotic (damage-over-time / anti-armour),
  painkiller (ally sustain), antihistamine (cleanse / anti-CC), barrier gel (slow /
  block), stimulant (buff). Two per class gives a real choice within a class and an
  obvious UI tag.

**Launch smaller than you build: 16 fighters + 6 turrets (22)**, with the data
architecture for 34. You'd rather learn which 8 fighters the meta wants *before*
animating the last 8.

**Unlock pacing:**
- Session 1: **4 fighters + 2 turrets** — below team size, so the first runs have zero
  pick friction and the team screen teaches itself.
- **Team slots grow 3 → 4 → 5 → 6 across the first ~10 runs.** Growing the slot count is
  a stronger progression beat than growing the bank, and it's free.
- Then ~**1 new unit per 2–3 runs**; full launch set owned by ~**run 40**.
- Post-launch: 1 per month, alternating fighter/turret, reaching 34 in a year.

**Free depth multiplier:** add a **Legion TD 2-style draft** (offer 10, pick 6, one
reroll) after launch. Zero art cost, reuses the whole roster, different puzzle every run.
**Highest ROI feature on this list.**

## (b) Should medicine-turrets expire?

**Yes — but tie expiry to wave boundaries, not a free-running clock.** This is the most
important recommendation here.

Run the arithmetic that kills naive versions: **6 slots on independent 60-second timers
is one re-placement every 10 seconds, forever.** That's Rust's upkeep with extra steps.
The fix is to make the course of medicine end when the *wave* ends.

**Spec:**

- **Duration: 2 waves**, snapped to wave boundaries. Placed mid-wave 3 → expires at the
  end of wave 5. **Never less than one full wave** — that's the line between tension and
  chore. That sits at the long end of Clash Royale's 30–60s spread, correctly: CR's
  decision cycle is ~5–10s, yours is a wave.
- **Re-application happens in the between-waves planning beat**, where the player is
  already deciding. **One decision per wave, not six taps per wave.** This single change
  is what makes expiry read as strategy rather than maintenance.
- **Warning: copy Clash Royale exactly.** The turret's HP bar drains over its lifetime,
  so damage and time remaining are one readout. Add an art stage change at ~25%
  remaining (the pill bottle visibly emptying) and a soft chime at a wave-end where a
  course will lapse. **No numeric countdown anywhere.**
- **Expiry and destruction share one death event and animation.** An expiring painkiller
  should still emit its final heal pulse, the way Tombstone still spawns its skeletons.

**Pricing — build antibiotic resistance into the economy:**

| Event | Cost |
|---|---|
| First placement of a type | **100%** |
| Immediate renewal, same type, same lane | **80%** — "finishing the course" |
| Each further consecutive renewal | **100% → 130% → 170% → 220%** |

The multiplier decays one step per ~20s that the type is out of play.

This is the rare case where fiction and maths agree: finishing a course is cheap, leaning
on one antibiotic forever is expensive. And it solves the actual design problem —**it
makes the optimal play a rotation across your three turrets rather than spamming the best
one**, which is exactly what stops the support slot feeling like a tax.

**Do not make re-application free.** Free re-placement is the one option guaranteed to
produce a tap-tax with no decision in it.

**Keep destruction separate and rare.** One or two "resistant strain" enemies per run
that walk to a turret and consume it, with a Bungee-style reticle on the target several
seconds before impact. **Critically: a destroyed slot re-places at base cost with no
resistance penalty.** The punishment is the tempo loss and the unsupported wave — never a
repair bill. They Are Billions proves what happens otherwise.

**If you ship resistance on enemies too:** three named categories visibly tracked on the
healthbar (*slowed*, *suppressed*, *sedated*), WoW's 100/50/25/immune ladder on a ~15s
window.

---

## Unverified / flagged

- **No Supercell statement on why buildings have lifetime** exists in any reachable
  source. Section 7 is analysis of the patch record, not a quote.
- No Ninja Kiwi / Ironhide statement of a "unique niche per tower" rule.
- Inferno Tower lifetime: wiki says 40s, one summary said 30s. 40s is better sourced.
- Random Dice roster (~100) rests on a single NamuWiki snippet that could not be
  re-fetched.
- Orcs Must Die 3 trap charges/destruction: **not verified**.
- PvZ Wall-nut / Tall-nut art-stage HP thresholds: not verified from a primary source.

## Sources

**Rosters:** [CR balance notes](https://supercell.com/en/games/clashroyale/blog/release-notes/balance-changes-april-2022/) ·
[CR card DB](https://www.clashroyaledeckbuilder.net/clash-royale-cards) ·
[RoyaleTracker tier list](https://royaletracker.gg/guides/clash-royale-card-tier-list) ·
[Arknights Operator](https://arknights.wiki.gg/wiki/Operator) ·
[Arknights UI](https://arknights.wiki.gg/wiki/User_interface) ·
[PvZ Seed slot](https://plantsvszombies.wiki.gg/wiki/Seed_slot) ·
[BTD6](https://www.bloonswiki.com/Bloons_TD_6) ·
[LTD2 Mastermind](https://beta.legiontd2.com/mastermind/) ·
[Grow Castle Heroes](https://grow-castle.fandom.com/wiki/Heroes) ·
[Core Defense solo-dev case study](https://newsletter.gamediscover.co/p/case-study-making-core-defense-a)

**Turrets:** [CR Cannon](https://clashroyale.wiki/resources/cards/common/cannon/) ·
[Tombstone](https://clashroyale.wiki/resources/cards/rare/tombstone/) ·
[Inferno Tower](https://clashroyale.wiki/resources/cards/rare/inferno-tower/) ·
[PvZ Chard Guard](https://plantsvszombies.wiki.gg/wiki/Chard_Guard) ·
[PvZ Gargantuar](https://plantsvszombies.wiki.gg/wiki/Gargantuar_(PvZ)) ·
[PvZ Digger Zombie](https://plantsvszombies.wiki.gg/wiki/Digger_Zombie_(PvZ)) ·
[Arknights redeploy](https://arknights.wiki.gg/wiki/Attribute/Redeployment_time) ·
[KR Umbra](https://kingdomrushtd.fandom.com/wiki/Umbra) ·
[They Are Billions buildings](https://they-are-billions.fandom.com/wiki/Buildings) ·
[WoW diminishing returns](https://maxroll.gg/wow/resources/crowd-control-diminishing-returns) ·
[Dota 2 Status Resistance](https://liquipedia.net/dota2/Status_Resistance) ·
[LoL Crowd control](https://wiki.leagueoflegends.com/en-us/Crowd_control) ·
[Plague Inc Drug Resistance](https://plagueinc.wiki.gg/wiki/Drug_Resistance) ·
[Rust decay & upkeep](https://xgamingserver.com/blog/rust-decay-and-upkeep-guide/)
