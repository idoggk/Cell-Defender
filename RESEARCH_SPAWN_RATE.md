# Research — spawn rate as a dial, and the macronutrient meta

Completed 2026-09-09. Carried over verbatim from the earlier session's research pass.

Verification caveats are at the bottom and they matter — Fandom blocked the fetcher
throughout, so several figures come from search snippets rather than primary reads,
and four games yielded no usable numbers at all.

---

## 1. What shipped games actually do with production rate

| Game | Baseline production | What modifies it | Realised band |
|---|---|---|---|
| **Clash Royale** | 1 elixir / **2.8 s** | Scripted phase only: 2x at 2:00, 3x in overtime | **1x → 2x → 3x**, symmetric, time-boxed, not player-controlled |
| **Clash Royale, player-owned** | Elixir Collector: 6 cost, **70 s** lifetime, 1 elixir / **8.5 s** | Nothing — it is a fixed card | **+32% gross**, **net +2 elixir (~+8%)**. Nerfed Nov 2016 (lifetime 80→70 s, interval 9.8→8.5 s) |
| **League of Legends** | Wave every **30 s** → 25 s at 14:00 → 20 s at 30:00; minion stats every **90 s** | **Nothing the player controls** — a global clock | **1.0 → 1.5x over 30 minutes**, identical both sides |
| **Kingdom Rush** barracks — *our exact mechanic*: a slot that continuously respawns blockers | Per-barracks respawn timer | Upgrades cut respawn by **flat −2 s** (−3 s Holy Order) | Flat deltas, never multipliers |
| **Warcraft III** | Gold per worker trip | **Upkeep**: >50 food → 70% income, >80 food → **40%** | Explicit **−60% negative feedback** as the army grows |
| **Legion TD 2** | Worker = 50 gold; income is a per-wave trickle | Workers; leak redistribution retuned wave by wave | Devs actively re-tune the snowball curve per wave |

**The pattern is very consistent.** In shipped games the *global* production rate moves
**1.2x–1.5x within a session** from systemic sources, and reaches 2–3x only as a
**scripted, symmetric, time-boxed endgame phase**. A *player-owned, always-on* rate
modifier lands at **+8% to +35%**. **Nobody ships a player-scalable ×3 production rate.**

Rate is the stat designers police hardest, generally: League hard-capped attack speed
at 2.5/sec for ~15 years, raising it to 3.003 only in Feb 2025. Diablo 3 cut *all*
Increased Attack Speed affixes by 50% in patch 1.0.3 because rate crowded out every
other stat.

## 2. Rate is a bad place to put progression — the arithmetic

Lane throughput is roughly **`R × P × L`** (rate × power × how long a fighter survives).
In a stop-and-duel lane **`L` itself rises with `P`** — a stronger fighter wins faster
and survives to the next duel. So a meta granting +33% rate and +20% power delivers
≈ 1.33 × 1.2 × ~1.2 ≈ **1.9x throughput**. Two innocuous-looking numbers spend the
entire safe band. A third multiplicative source leaves no difficulty curve, only a
threshold.

Mitigations with real precedent:

- **Population cap** — the universal fix. StarCraft/AoE 200 supply; Kingdom Rush
  barracks hold exactly 3 soldiers. A cap converts runaway rate into a *replacement*
  rate: once full, extra rate only buys faster replacement of casualties. Self-limiting,
  and it *feels* good under pressure.
- **Upkeep / negative feedback** — Warcraft III's 100% / 70% / 40% income tiers.
- **Soft caps** — standard idle-design advice: turn `100+x` into `100+sqrt(x)`.
- **Cost escalation** — exponential costs holding exponential production in check.
- **Hard clamp** — League's attack-speed ceiling.
- **Quality decay at high rate** — rare in games, but biology hands it to us free. See
  left shift below. This is the best of the lot.

## 3. Real biology, with timescales

### Fast enough to be an in-run dial

- **Demargination.** ~**51% of blood neutrophils are marginated** — stuck to vessel
  walls, not circulating. Catecholamines release them: counts rise **30–120 s** after
  infusion, and exercise causes immediate leukocytosis **with no new production at
  all**. A near-perfect adrenaline button: instant ~2x available cells, zero
  manufacturing, and it necessarily leaves the reserve empty afterwards.
- **Marrow storage-pool release.** Production is **5–10 × 10¹⁰ neutrophils/day**, but
  the marrow holds ~**6 × 10¹¹** — **6–12 days of output sitting pre-made** —
  releasable within hours. A literal stockpile: bank fighters while the lane is quiet,
  dump them when it isn't.
- **Left shift.** When release outruns maturation the marrow ships **immature bands**
  (>5% rise in precursors; a leukemoid reaction is >50 × 10³/µL). **Pushing rate above
  baseline degrades unit quality.** Real, legible, thematically native — and a far
  better diminishing return than an arbitrary soft cap.
- **Circulation.** Cardiac output rest **~5 L/min**, maximal exercise **20–25 L/min**,
  elite **>35–40**. A defensible **~5x** range — the only body system whose real
  dynamic range justifies a large in-game swing.
- **Acute cortisol.** Peak ~4 h, lymphocyte nadir 4–6 h. Mechanistically ~61%
  demargination, ~29% delayed egress, ~10% marrow release. **Steal the paradox:**
  cortisol *raises* neutrophils while *killing* lymphocytes — more cheap units now,
  fewer good units later.
- **Fever.** BMR rises **~10–13% per 1 °C**. A clean "burn fuel for output" toggle.
- **Clonal expansion.** Activated CD8 T cells double every **7–8 h** (as fast as 2–6 h
  initially), >2000-fold in ~7 days. Not a rate dial, but the accurate justification for
  *a specialist that grows stronger the longer one enemy type persists*.

### Too slow or too subtle — do not use for in-run rate

- **Granulopoiesis proper:** post-mitotic marrow transit **4–6 days**.
- **G-CSF / filgrastim:** ANC rise begins **1–2 days** in. Meta layer only.
- **EPO:** reticulocyte maturation ~5.6 days, haemoglobin recovery ~4 weeks.
- **Chemotherapy:** nadir **7–12 days**. A curse modifier, not a dial.
- **Hydration / blood volume:** directionally real but small and slow. **Using it
  would be invention, not biology.**
- **Chronic stress:** Segerstrom & Miller (300+ studies) — acute stressors *upregulate*
  natural immunity; chronic stressors suppress both arms. Real, but operates over weeks.
- **Sleep:** <6 h/night → **4.2x** the odds of catching a cold vs ≥7 h (Prather 2015,
  quarantined rhinovirus challenge). Strong, and strictly a between-run modifier.

## 4. Macronutrients, accurately

**Carbohydrate = throughput.** Activated leukocytes make a Warburg-like switch to
aerobic glycolysis. Neutrophils go further: during the oxidative burst they run a
near-complete pentose cycle, pushing oxidative PPP flux to **>2x the glucose uptake
rate** — beyond any other mammalian cell — yielding up to 6 NADPH per glucose. An
activated immune system costs on the order of **1,600–2,000 kJ/day**. "Carbs → rate"
is accurate, not gamification.

**Protein = building material, with a cliff.** Glutamine is consumed at high rates by
lymphocytes, macrophages and neutrophils and is **conditionally essential during
infection**. Protein-energy malnutrition causes **thymic atrophy**, and **cell-mediated
immunity is hit harder than humoral**. Model protein as *unit quality with a hard
deficiency cliff*, not a smooth linear buff.

**Fat = structure, duration, resolution.** EPA and DHA convert to **specialized
pro-resolving mediators** (resolvins, protectins, maresins) which **restrict neutrophil
migration, drive macrophage clearance of debris, and support repair** — without
immunosuppression. Plus fat-soluble vitamins.

**Where popular nutrition writing overclaims — worth stating plainly.** Omega-3 does not
"boost immunity"; mechanistically it *ends* inflammation, a different verb, and clinical
trials are mixed. Vitamin D is the honest benchmark for effect size: **NNT = 33**, an
absolute reduction of ~2% (42% → 40% of people getting a respiratory infection),
concentrated in the very deficient. **Correcting a deficiency helps; supplementing an
already-fed body mostly does not.**

→ Model macros as **removing penalties** rather than granting escalating buffs. Both
accurate *and* safe from the quadratic trap.

## 5. Out-of-run loadouts

- **Hades' Mirror of Night — the model to copy.** 12 talent slots, each with **two
  mutually exclusive versions**; only one active, but **swapping is free** at the
  mirror. Slots unlock for 5/10/20/30 Chthonic Keys. Two properties do the work:
  every choice has an opportunity cost, so **total power is bounded by slot count, not
  by grind**; and free reconfiguration makes it read as a *loadout*, not a gate.
- **Vampire Survivors PowerUps — additive and deliberately tiny.** Might +5%/rank, max
  **+25%**. Cooldown — *the rate stat* — is capped at **−2.5%/rank, max −5%**, and is
  the most expensive early PowerUp. **Note what Poncle did: the rate stat gets the
  smallest band and the highest price.** Curse (+10% enemy stats/rank) is voluntary
  difficulty — the elegant way to let players push output without breaking the curve.
- **Rogue Legacy manor.** Many small additive upgrades; every purchase raises the cost
  of *all* future upgrades. Wide, shallow, grind-flavoured.
- **Arknights RIIC base.** Deep and well-liked, but it is a *production* meta, never a
  combat-stat meta. It changes how much you get, never how strong you are in a fight.

**Takeaway: exclusive pairs (Hades) bound total power structurally; additive stacks
need per-stat caps to do the same job.** With 10 pod slots and continuous spawning, we
want the structural bound.

## 6. The three-resource question

The count is not the killer — the *sourcing* is. Games ship far more than three and
survive (Ikariam 6 soft currencies; Kingdoms of Camelot 5+1). Ethan Levy's test is the
useful one: *"a well designed currency is one that creates interesting gameplay
interactions or decisions."* Ben Cousins warns about overwhelming players with icons;
Giordano Contestabile counters that gradual introduction fixes that.

The real cost of a third currency is **combinatorics**: three faucets, three sinks,
three drop tables, three balance curves — and it invites farming the bottleneck rather
than making a choice.

> **Carbs/protein/fat as three earned currencies is one too many. As three sliders on
> one budget it is exactly right — and more biologically accurate, since real macros
> are a partition of one energy intake.**

---

## Recommendation

**Circulation and oxygen drive rate in-run. Nutrition is the between-run budget.**

### In-run

1. **Baseline:** each pod slot has its own interval `T` (suggest **5–6 s** base). Rate
   progression comes from **slot count** — linear and cappable — not from shrinking `T`.
2. **Rate sources, all short-lived and self-correcting:**
   - **Adrenaline / demargination** (active): dump the banked reserve — up to **2x for
     ~8 s**, followed by a **−40% trough for ~15 s** while the marginated pool refills.
   - **Marrow reserve** (passive): each slot banks unspawned fighters while the lane is
     clear. The bank is what Adrenaline spends.
   - **Hypoxia** (enemy pressure): lung- or heart-attacking enemies cut rate 20–30%.
     The real 5 → 25 L/min range makes a large swing defensible *here and nowhere else*.
   - **Fever** (toggle): +20–25% rate at a resource or self-damage cost.
   - **Left shift** (the anti-snowball): whenever the net multiplier exceeds 1.0, a
     fraction of spawns arrive as **bands at ~60% stats**, scaling with the overshoot.
     Accurate biology *and* a built-in diminishing return, so we can be generous with
     rate without going quadratic.
3. **Clamp the product of all rate sources to 0.5x–2.0x.** Meta contributes at most
   **~1.25x**; in-run effects the rest; 2.0x reachable only in bursts. That sits exactly
   where shipped games live.
4. **Add a population cap on living fighters** — call it the *blood granulocyte pool*, a
   real named compartment. Every RTS uses this device and it converts overflow rate into
   replacement speed instead of a snowball.
5. **Never let the meta buy both rate and power.**

### The macro meta: one currency, three sliders

Earn **one** resource (Calories). Between runs, allocate a **fixed, zero-sum budget**
across Carbs / Protein / Fat, re-planned freely at no cost. Meta progression grows the
*budget* (say 100 → 160 points across the game) — linear, safe, never multiplying twice.

Each macro drives a **different factor** of `R × P × L`, so no two stack
multiplicatively on the same term:

| Macro | Drives | Band | Grounding |
|---|---|---|---|
| **Carbs** | Spawn interval, burst potency | **0.8x–1.25x rate** | Warburg switch; pentose-cycle NADPH for the oxidative burst |
| **Protein** | Fighter HP + damage | **±20%**, with a **deficiency cliff below ~15%** | Glutamine conditionally essential; PEM → thymic atrophy |
| **Fat** | Duration: turret lifetime, aura and buff duration, regeneration | **±30%** (wider is safe — duration is a weaker multiplier) | Membrane composition; SPMs driving clearance and repair |

Give each macro a **floor (~15 of 100)**; below it apply a real penalty rather than a
smaller bonus. That is accurate — deficiency states are cliffs, not slopes — and it
stops all-in min-maxing.

Because the budget is zero-sum, **max carbs necessarily means low protein**, so the
dangerous `rate × power` product is bounded **structurally rather than by a balance
patch**. That is the Mirror of Night property, obtained with one currency instead of
three.

**One extra hook:** the fat slider is where **turret duration** lives — tying the macro
screen directly to the "turrets are medicine and expire" decision in `DESIGN.md`.
One meta screen, two systems, no new currency.

---

## Verification caveats

Fandom returned HTTP 402 throughout, so Grow Castle, Kingdom Rush, Clash Royale and
Hades-Fandom figures come from search snippets, not primary reads.

**Specifically unverified:** Grow Castle, Age of War, Stick War and Castle Fight spawn
rates — *no usable source exists for any of them, treat as unsourced*; Kingdom Rush base
respawn seconds; Legion TD 2 post-wave-10 worker scaling; Hades' talent count (12 pairs
per guides vs "16" in one extraction); League's first-wave time (wiki says 0:30 spawn
against the community's long-standing 1:05 arrival).

## Sources

**Games:** [CR Elixir](https://clashroyale.fandom.com/wiki/Elixir) ·
[Elixir Collector history](https://liquipedia.net/clashroyale/Elixir_Collector) ·
[LoL Minion](https://wiki.leagueoflegends.com/en-us/Minion) ·
[LoL Attack speed](https://wiki.leagueoflegends.com/en-us/Attack_speed) ·
[WC3 Upkeep](https://liquipedia.net/warcraft/Upkeep) ·
[LTD2 guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1793195628) ·
[KR Footmen Barracks](https://kingdomrushtd.fandom.com/wiki/Footmen_Barracks) ·
[D3 patch 1.0.3](https://www.diablowiki.net/Patch_1.0.3) ·
[Math of Idle Games](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i) ·
[Hades Mirror](https://hades.wiki.fextralife.com/Mirror_of_Night) ·
[VS PowerUps](https://vampire.survivors.wiki/w/PowerUps) ·
[Arknights RIIC](https://gamepress.gg/arknights/core-gameplay/arknights-riic-base-guide) ·
[Currencies confusing players?](https://www.pocketgamer.biz/is-the-rise-of-engagement-focused-in-game-currencies-confusing-player/)

**Biology:** [Neutrophil kinetics](https://pmc.ncbi.nlm.nih.gov/articles/PMC2930213/) ·
[Evaluating leukocytosis](https://www.aafp.org/pubs/afp/issues/2015/1201/p1004.html) ·
[Catecholamine leukocytosis](https://pubmed.ncbi.nlm.nih.gov/8811932/) ·
[Exercise leucocytosis](https://pubmed.ncbi.nlm.nih.gov/1810612/) ·
[Glucocorticoid demargination](https://www.ebmconsult.com/articles/demargination-wbc-glucocorticoids-mechanism-selectin) ·
[Hydrocortisone and the immunome](https://www.nature.com/articles/srep23002) ·
[Filgrastim](https://www.ncbi.nlm.nih.gov/books/NBK559282/) ·
[Cardiac output](https://www.ncbi.nlm.nih.gov/books/NBK470455/) ·
[Physiology, Fever](https://www.ncbi.nlm.nih.gov/books/NBK562334/) ·
[Warburg in immunity](https://www.nature.com/articles/nri3485) ·
[Pentose pathway and the oxidative burst](https://www.nature.com/articles/s42255-022-00550-8) ·
[Glutamine and immunity](https://link.springer.com/content/pdf/10.1007/BF01366922.pdf) ·
[Thymus and undernutrition](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9549110/) ·
[Pro-resolving mediators](https://www.nature.com/articles/nri.2015.4) ·
[Vitamin D IPD meta-analysis](https://www.ncbi.nlm.nih.gov/books/NBK536320/) ·
[Segerstrom & Miller 2004](https://pubmed.ncbi.nlm.nih.gov/15250815/) ·
[Prather 2015, sleep and colds](https://pubmed.ncbi.nlm.nih.gov/26118561/)
