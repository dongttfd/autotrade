---
name: liquidity-smart-money
description: Analyze liquidity on a chart — identify the trading range, map internal/external liquidity, read dynamic liquidity flow, and detect liquidity sweeps. Use when the user wants Smart Money / ICT-style liquidity analysis.
---

# Liquidity Smart Money

You are performing a Smart Money liquidity analysis on a TradingView chart. This skill implements 4 advanced liquidity hacks that work together as a complete framework.

## Key Principles (Read First)

These rules override everything else. Violating any of them invalidates the analysis.

1. **Never identify a trading range on the entry timeframe.** Always zoom out 1–2 timeframes higher.
2. **A BOS is only valid if price pulled back past Fibonacci 50% into the opposite zone before the breakout.** If it didn't, the breakout is false and the range is invalid.
3. **A trading range is only confirmed when price breaks past the nearest internal swing point — the inducement (a level that traps early entries to generate liquidity) — on the expansion side** after the BOS expansion completes.
4. **Internal liquidity is fuel, not the final target.** Smart money uses internal liquidity to power moves toward external liquidity.
5. **External liquidity sweeps have the highest probability.** Internal swing high/low sweeps are generally low-probability traps — see Step 5c for exception criteria.
6. **High-quality sweeps happen around session opens** (London, New York) when volume is highest.

---

## Experience Memory

Before analyzing or managing a setup, check whether this repo contains notes under `trading-experience/*.md`.

Use those notes only as operating reminders from prior live work:
- execution mistakes and corrections
- trade-management refinements
- data-source caveats
- chart annotation preferences

Do not let experience notes override the Key Principles. If an experience note conflicts with the core liquidity method, follow the core method and mention the conflict.

---

## Preflight

Run this before Step 1 when repo access is available:

1. `rg --files trading-experience` — find local experience notes if the directory exists
2. Read only notes that match the current task:
   - entry planning
   - SL/TP management
   - chart drawing
   - data-source validation
3. Confirm the analysis data source when relevant:
   - spot
   - futures
   - TradingView exchange data
4. If spot crypto candles appear unreliable (identical closes, volume below 20% of the 20-bar average, or unusually wide spread), cross-check futures data before making live trade-management calls.

---

## Step 1: Set Up the Chart

Prepare the chart for higher-timeframe structure analysis.

1. `chart_set_symbol` — switch to the requested symbol
2. `chart_set_timeframe` — set to the **higher timeframe** (NOT the entry TF):

| Entry TF | Zoom Out To |
|----------|-------------|
| M1       | M15         |
| M5       | M15 / M30 / H1 |
| M15      | H1 / H4     |
| H1       | H4 / Daily   |

3. `chart_get_state` — verify the symbol and timeframe actually changed before reading data
4. `data_get_ohlcv` with `summary: true` — get an overview of recent price action
5. `capture_screenshot` — capture the zoomed-out view for reference

Do not read OHLCV in parallel with a just-issued symbol or timeframe change. Wait for the chart state to confirm first.

---

## Step 2: Identify the Trading Range

Find the valid trading range before analyzing anything else. This is the foundation of the entire analysis.

### 2a. Find the Most Recent Valid BOS

1. `data_get_ohlcv` — pull enough bars to see recent swing structure (count: 100–200)
2. Look for the most recent **BOS** — where price broke above a previous swing high (bullish) or below a previous swing low (bearish)
3. **Validate the BOS:**
   - Draw Fibonacci across the impulse move
   - Check: did price pull back **past the 50% level into the opposite zone** before the breakout? (Bullish → discount. Bearish → premium.)
   - If YES → valid BOS. If NO → false breakout, skip this and look further back.

### 2b. Confirm the Range Boundaries

Once a valid BOS is found:
- **Range bottom** = the swing low that started the valid impulse
- **Range top** = confirmed when price breaks below the nearest **internal low in the premium zone** (the inducement). That swing high becomes the upper boundary.
- For a **bearish BOS**, mirror the logic: top = impulse swing high, bottom confirmed after inducement break in the discount zone.

### 2c. Draw the Range

1. `draw_shape` with `horizontal_line` — mark the range top (swing high)
2. `draw_shape` with `horizontal_line` — mark the range bottom (swing low)
3. `draw_shape` with `rectangle` — shade the full trading range area
4. `capture_screenshot` — document the identified range

---

## Step 3: Map Internal and External Liquidity

With the trading range established, identify where liquidity sits.

### 3a. External Liquidity (Outside the Range)

External liquidity exists **above the range top** and **below the range bottom**. These are the highest-probability targets.

- **Buy-Side Liquidity** = above swing highs — stop losses of short positions and buy-stop orders cluster here
- **Sell-Side Liquidity** = below swing lows — stop losses of long positions and sell-stop orders cluster here

Mark these zones:
1. `draw_shape` with `horizontal_line` — mark external liquidity above the range top
2. `draw_shape` with `horizontal_line` — mark external liquidity below the range bottom

### 3b. Internal Liquidity (Inside the Range)

Internal liquidity exists within the trading range. Look for all of these:

1. `data_get_pine_lines` — check for key levels drawn by indicators
2. `data_get_pine_labels` — look for labeled levels (FVG, OB, etc.)
3. `data_get_pine_boxes` — find price zones / imbalance areas

Internal liquidity forms include:
- **Fair Value Gaps (FVG)** — imbalance zones left by fast price moves
- **Internal swing highs / lows** — minor highs and lows within the range
- **Volume imbalances** — areas of one-sided volume
- **Trend lines** inside the range
- **Consolidation zones** within the range

Mark the most significant internal liquidity areas with `draw_shape`.

---

## Step 4: Read Dynamic Liquidity Flow

Determine which direction price is likely heading by reading how price interacts with internal liquidity. This is the most critical analytical step.

### 4a. Check FVG Reaction (Direction Signal)

Price's reaction to Fair Value Gaps inside the range reveals the next target:

**Scenario A — Bullish signal:**
- Price touches a FVG and **respects it** (especially the midpoint)
- Price shows **rejection** (wick / reversal candle) bouncing upward
- → Price is likely heading toward **External Buy-Side Liquidity** (above range top)

**Scenario B — Bearish signal:**
- Price **punches through** the FVG without significant reaction
- The FVG becomes an **Inverse Value Gap** (role reversal — now acts as resistance)
- If price then pulls back to the Inverse Gap, respects its midpoint, and shows rejection downward
- → Price is likely heading toward **External Sell-Side Liquidity** (below range bottom)

### 4b. Check for Efficient Price Action

**When internal liquidity has been consumed** (all significant FVGs filled, no untouched internal swing points between price and external target, recent candles show balanced overlapping bodies):
- Price moves **directly between Buy-Side and Sell-Side external liquidity**
- It alternates between sweeping highs and sweeping lows
- This continues until a new imbalance (FVG) or inducement forms, restoring the internal→external cycle

### 4c. Document the Flow

1. `capture_screenshot` — capture the current price action state
2. Annotate the direction of the liquidity flow with `draw_shape` (trend_line or text)
3. State clearly: "Price is currently targeting [Buy-Side / Sell-Side] External Liquidity because [reasoning]"

---

## Step 5: Detect Liquidity Sweeps

A liquidity sweep is the highest-conviction trade signal in this framework.

### What Is a Sweep

Price breaks above/below a key level, triggers the stops and pending orders there, then **immediately closes back inside the range** and reverses toward the opposite liquidity.

### 5a. Check for External Sweeps (High Probability)

1. `quote_get` — get current price
2. `data_get_ohlcv` — check recent bars for wicks beyond range boundaries
3. Look for: price spiked above range top (or below range bottom), then closed back inside

**If a Buy-Side sweep occurred** (wick above range top, close back inside):
- → Expect reversal toward Sell-Side Liquidity (range bottom and below)

**If a Sell-Side sweep occurred** (wick below range bottom, close back inside):
- → Expect reversal toward Buy-Side Liquidity (range top and above)

### 5b. Session Context Matters

The best sweeps occur around major session opens:
- **Asian session (00:00–08:00 UTC)** — low volume, price typically consolidates into a tight range. This range becomes the liquidity target for London open.
- **London open (08:00 UTC)** — price often fakes above/below the Asian session range, then reverses
- **New York open (13:30 UTC)** — price often sweeps London's high/low, then drives in the real direction

Pattern: NY open pushes above London high → sweeps Buy-Side → reverses hard → takes out London low → continues in the true planned direction.

For crypto: session logic applies to BTC/ETH (institutional volume follows the same hours). Less reliable for low-cap altcoins.

### 5c. Internal Sweeps (Low Probability — Use Caution)

Sweeps of internal swing highs/lows are generally traps. **Exception:** an internal sweep becomes tradeable when:
- It occurs right before price reaches an **untouched FVG or Order Block** on the opposite side
- It aligns with the higher-timeframe trend direction
- In this case, the internal liquidity acts as fuel for a strong move toward external liquidity

Mark any detected sweeps with `draw_shape` and `capture_screenshot`.

---

## Step 6: Report

Synthesize everything into a clear analysis.

1. `capture_screenshot` — final annotated chart
2. `draw_list` — review all annotations placed

If `draw_list` or `draw_clear` fails, state the failure and continue with screenshot-based verification.

### Report Structure

```
## Liquidity Analysis: [Symbol] — [Timeframe]

### Trading Range
- Range: [bottom] – [top]
- BOS validation: [describe the valid BOS and Fib pullback]

### Liquidity Map
- **External Buy-Side:** [levels above range]
- **External Sell-Side:** [levels below range]
- **Internal:** [FVGs, internal highs/lows, consolidation zones]

### Dynamic Flow
- Current flow direction: [Buy-Side / Sell-Side]
- Evidence: [FVG reaction / Inverse Gap / clean PA]

### Sweep Status
- Recent sweeps detected: [Yes/No — describe]
- Session context: [London / NY / Asian range]

### Bias & Targets
- **Bias:** [Bullish / Bearish] — [reasoning]
- **Primary target:** [specific external liquidity level]
- **Invalidation:** [what would flip the bias]
```

---

## Trade Management Additions

Use this section when the user asks about managing an existing position, especially after TP1.

After TP1 is reached, stop treating the trade as an entry setup. Switch to runner management:

- **Tight stop:** protects profit but is easier to sweep
- **Structure stop:** gives the trade more room toward the next liquidity target
- **Invalidation stop:** the level where the original idea is no longer valid

Do not provide a single SL number without stating its purpose. Use this response shape:

- "If protecting profit is the priority: [tight stop]."
- "If holding for the next liquidity target is the priority: [structure stop]."
- "If this level breaks: [invalidation]."

When drawing an execution chart, keep annotations minimal:

- active range or equilibrium only if it affects the decision
- primary entry zone
- invalidation
- main liquidity targets

Avoid drawing every candidate level unless the user asks for full context.

---

## Glossary
See `knowledge/liquidity_terms.md` in the repo root for all term definitions used in this workflow.
