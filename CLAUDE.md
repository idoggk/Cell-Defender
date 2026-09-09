# Working with Ido on Cell Defence

A tower defence set inside the human body. Solo personal project (not a Superplay
project) by a game economist with a BSc in Computer Science — first game project of
his own. See `DESIGN.md` for the game itself; this file is about *how to work here*.

## How Ido wants to work

- **The economy and balance numbers are his.** Build the mechanism, expose the dials
  clearly, say what you think — but don't quietly tune numbers and move on. Flag the
  trade-off and let him choose.
- **Work with him, not around him.** He wants to be in the design conversation, not
  handed finished decisions.
- **Push to git after every meaningful change.** Sessions crash or get compacted;
  unpushed work is lost work.
- **He generates the art himself** with AI image models. Tell him exactly what's
  needed and where to put it — don't try to generate or source art.
- **If you disagree with a decision, say so once, clearly, with reasoning — then build
  what was asked.** Don't relitigate settled decisions without a new argument.
- He can read code and argue about design. Don't over-explain basics; do explain
  non-obvious trade-offs.

## Research discipline

This project runs design research passes (see `RESEARCH_*.md`) before building
systems those decisions gate.

- **Run one research pass at a time.** Parallel batches have taken sessions down
  before.
- **Write each pass to a committed file the moment it lands.** Results left sitting in
  conversation have been lost to session crashes more than once. A finished pass isn't
  done until it's a committed `RESEARCH_<topic>.md`.

## Working practices that have earned their place

- **Write design principles as executable tests, not doc prose.** "Upgrades should be
  interesting" can't fail; a test can. This has caught real problems before: a rule
  that every unit needs at least one upgrade that changes behaviour (not just a
  number) failed the moment it was written, on units whose entire tree was
  percentages. A rule that the two options in a slot must not modify the same stat the
  same way blocks the "+30% or +40% damage" non-choice. Assert over the *whole* data
  table, not one example, so new content is covered automatically.
- **Keep game logic pure and headless**, separate from any rendering/engine layer, so
  a whole battle can run in Node with no window.
- **Verify in the running app; don't assume.** Several past "fixes" were wrong until
  actually checked in the browser.
- **Declarative data over functions** — modifiers as `{mul, add, set}` objects are
  testable, serialisable and diffable.
- **Analytical balance reports beat frame-by-frame simulation** for answering "how
  does enemy growth compare to defence output" — compute it directly rather than
  simulating.

## Mistakes worth not repeating

- **An internal field disagreeing with your expectation is a hypothesis, not a bug.**
  A past session claimed an engine bug that didn't exist; a side-by-side visual test
  disproved it.
- **A test suite can assert both sides of a contradiction.** One past bug (a squad
  change silently reverting) existed because one function allowed it and another
  repaired it — and tests were written for *both* behaviours, so the suite stayed
  green. When a bug seems impossible, check whether the tests actually agree with each
  other.
- **Falsy-zero breaks throttles and "first time" checks.** `if (lastEventAt && ...)`
  is false when `lastEventAt` is legitimately `0` (e.g. a timer starting at zero).
  Initialise such sentinels to `-Infinity`, not `0`.
- **Async/tween callbacks can dereference fields that get nulled before they fire.**
  Capture the object in a local variable before scheduling the callback.
- **A "control" measurement is only a control if it starts from genuinely fresh
  state.** Leftover state from an earlier manual probe has produced wrong
  measurements before.
- **Don't fight computer vision.** Extracting exact positions (e.g. slot coordinates)
  from art via colour/edge detection has repeatedly failed. Overlaying a labelled
  coordinate grid on the image, reading positions off by eye, then snapping to known
  centres has worked in minutes.

## Environment

- This machine: Windows, work laptop. PowerShell is the primary shell; Git Bash is
  also available — each has its own syntax, don't mix them in one command.
- **No `gh` CLI installed on this machine.** GitHub repo creation needs the web UI (or
  installing `gh`) until that's set up.
- Ido also works on this project from a home computer. The repo (not any cloud file
  sync) is the thing that should be kept in sync between machines — clone/pull/push,
  don't rely on OneDrive or similar for project files.
- This project's folder must **not** live under any OneDrive-synced path. Mixing git
  with cloud file sync is a reliable way to get corrupted `.git` state or confusing
  merge-like conflicts that have nothing to do with git.
