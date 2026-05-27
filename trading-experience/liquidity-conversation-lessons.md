# Liquidity Practice Notes

Date: 2026-05-22

This file stores practical lessons from applying the liquidity workflow in live chart discussion. It is not a replacement for the method and should not repeat the core theory.

## How To Use

- Treat these notes as operating reminders.
- Use examples only as references, not fixed rules.
- If a note conflicts with the main liquidity method, follow the main method.

## Lessons

### Validate Before Promoting A Zone

Do not call a zone "primary entry" just because it looks clean on the entry timeframe.

Check first:

- Is the zone confirmed by the higher-timeframe range?
- Is price in a reasonable premium/discount location?
- Has the zone been tested by sweep, reclaim, or clear rejection?

Example: a daily zone around `18,450 - 18,750` looked useful at first, but after checking the weekly range it was better treated as a secondary area. The cleaner entry was lower, closer to sell-side liquidity.

### Separate Entry Logic From Runner Management

After TP1 is hit, stop thinking like the trade is still at entry.

The question changes from:

- "Where is the setup valid?"

to:

- "How much profit should be protected while leaving room for the next liquidity target?"

Use separate stop types:

- Tight stop: protects profit, easier to get swept.
- Structure stop: gives more room, returns more unrealized profit if hit.
- Invalidation stop: the level where the idea is no longer valid.

Example: after a crypto long passed TP1, a tight stop under `2.194` protected profit, while a structure stop under `2.182` gave more room for TP2/TP3.

### Always Label The Purpose Of SL

Avoid giving one stop-loss number without explaining its job.

Better format:

- If protecting profit is the priority: use the tight stop.
- If holding for the next liquidity target is the priority: use the structure stop.
- If this level breaks: the trade idea is invalid.

This helps avoid confusion between "I want to stay in" and "I want to lock profit."

### Keep Execution Charts Clean

A planning chart can contain more context. An execution chart should be minimal.

Prefer showing only:

- the active range or equilibrium if it affects the decision,
- the main entry zone,
- invalidation,
- the main liquidity targets.

Remove secondary candidate zones if they make the chart harder to act on.

### Be Careful With Chart State

Do not read OHLCV immediately in parallel with a symbol or timeframe change. The chart may still be on the old state.

Safer sequence:

1. Set symbol.
2. Set timeframe.
3. Verify chart state.
4. Read OHLCV.
5. Analyze or draw.

### Confirm The Data Source

For crypto, spot and futures can show different quality of candles. If spot data looks stale or thin, cross-check futures before making live trade-management decisions.

Always state whether the analysis is based on:

- spot,
- futures,
- TradingView exchange data.

### Correct A Plan Explicitly

If a later check weakens an earlier idea, say so directly.

Use language like:

- "This zone is downgraded to secondary."
- "This is no longer the best entry after checking the higher timeframe."
- "The plan changed because the premise changed."

That is cleaner than silently replacing the level.

## Tooling Note

`draw list` and `draw clear` may fail in this repo because some functions in `src/core/drawing.js` reference chart helpers that are not imported. Direct chart API calls worked as a temporary workaround.

