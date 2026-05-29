---
name: liquidity-smart-money
description: Analyze liquidity on a chart — identify the trading range, map internal/external liquidity, read dynamic liquidity flow, and detect liquidity sweeps. Use when the user wants Smart Money / ICT-style liquidity analysis.
---

# Liquidity Smart Money

You are performing a Smart Money liquidity analysis on a TradingView chart. This skill implements 4 advanced liquidity hacks that work together as a complete framework.

## Key Principles (Read First)

These rules override everything else. If these conditions cannot be verified, state your uncertainty in the report and do not promote the setup.

1. **Never identify a trading range on the entry timeframe.** Always zoom out 1–2 timeframes higher.
2. **A BOS is only valid if price pulled back past Fibonacci 50% into the opposite zone within the impulse setup before accepting the BOS as valid.** If it didn't, the breakout is false and the range is invalid.
3. **A trading range is confirmed only after the expansion swing is followed by an inducement break, as defined in Step 2b.**
4. **Internal liquidity is fuel, not the final target.** Smart money uses internal liquidity to power moves toward external liquidity.
5. **External liquidity sweeps are preferred over internal sweeps.** Internal swing high/low sweeps are generally low-probability traps — see Step 5c for exception criteria.
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

### 2a. Find the Active Valid BOS / Dealing Range

1. `data_get_ohlcv` — pull enough bars to see recent swing structure (count: 100–200)
2. Look for the **BOS** — where price broke above a previous swing high (bullish) or below a previous swing low (bearish). If multiple valid BOS exist, prioritize the HTF dealing range that currently contains price and has obvious external liquidity (avoid picking a tiny intraday range just because it's "most recent"). Report nested ranges if there is a conflict.
3. **Validate the BOS:**
   - Calculate/mark the 50% level across the impulse move to measure the retracement:
     - Bullish: anchor from impulse origin low to expansion high (broken structure high).
     - Bearish: anchor from impulse origin high to expansion low (broken structure low).
   - Check: did price pull back **past the 50% level into the opposite zone within the impulse setup before accepting the BOS as valid.** (Bullish → discount. Bearish → premium.)
   - If YES → valid BOS. If NO → false breakout, skip this and look further back.

### 2b. Confirm the Range Boundaries

Once a valid BOS is found, explicitly define the boundaries based on direction:

**For a Bullish BOS Range:**
- **Lower Boundary:** The swing low that originated the impulse.
- **Upper Boundary:** The swing high of the expansion. This boundary is *only confirmed* after price breaks below the nearest internal low (inducement) in the premium zone.

**For a Bearish BOS Range:**
- **Upper Boundary:** The swing high that originated the impulse.
- **Lower Boundary:** The swing low of the expansion. This boundary is *only confirmed* after price breaks above the nearest internal high (inducement) in the discount zone.

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

Prioritize marking these specific External Liquidity pools (If insufficient data to identify these levels, report them as unavailable/uncertain):
1. Range boundaries (Range Top / Range Bottom)
2. Previous Day/Week Highs and Lows (PDH/PDL, PWH/PWL)
3. Session Extremes (Asia/London/NY Highs and Lows)
4. Equal Highs (EQH) and Equal Lows (EQL)

Use `draw_shape` with `horizontal_line` to mark the most obvious external liquidity targets.

### 3b. Internal Liquidity (Inside the Range)

Internal liquidity exists within the trading range. FVG and OB identification should adapt to available data:

- **If custom indicators are visible:**
  *(When the target indicator is known, always pass `study_filter`)*
  1. `data_get_pine_lines` — check for key levels drawn by indicators
  2. `data_get_pine_labels` — look for labeled levels (FVG, OB, etc.)
  3. `data_get_pine_boxes` — find price zones / imbalance areas
- **If no custom indicators are present:** Do not fail. Identify FVG/OB visually via `capture_screenshot` or structurally via `data_get_ohlcv`.
  - *For OHLCV-based FVG:* Use a 3-candle imbalance.
    - **Bullish FVG:** candle 1 high < candle 3 low.
    - **Bearish FVG:** candle 1 low > candle 3 high.

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

Price's reaction to Fair Value Gaps inside the range reveals the next target. **CRITICAL RULE:** Always classify FVG direction, location relative to premium/discount, and whether it aligns with HTF range before using it as bias evidence. A FVG stuck in the middle of a range is just an internal draw, not strong directional bias.

**Scenario A — Bullish Continuation/Reversal:**
- Price pulls back into a **Bullish FVG located in the Discount zone**.
- Price shows **rejection** (wick / reversal candle) bouncing upward.
- → Bias aligns upward toward **External Buy-Side Liquidity**.

**Scenario B — Bearish Continuation/Reversal:**
- Price pulls up into a **Bearish FVG located in the Premium zone**.
- Price shows **rejection** (wick / reversal candle) bouncing downward.
- → Bias aligns downward toward **External Sell-Side Liquidity**.

**Scenario C — Inverse FVG (Trend Shift):**
- Price **punches through** an FVG without significant reaction (e.g., a Bullish FVG is violated downwards).
- The FVG becomes an **Inverse Value Gap** (role reversal — now acts as resistance).
- Pullbacks to this Inverse Gap that show rejection confirm the shift in direction.

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

Price breaks above/below a key level, triggers the stops and pending orders there, then closes back inside. **CRITICAL:** Do not treat a wick beyond liquidity as a trade signal unless price reclaims the level AND shows displacement or a Market Structure Shift (MSS) back inside. Otherwise, it might just be a breakout or price accepting outside the range.

### 5a. Check for External Sweeps (High Probability)

1. `quote_get` — get current price
2. `data_get_ohlcv` — check recent bars for wicks beyond external liquidity
3. Look for the sweep + reclaim + displacement confirmation.

**If a confirmed Buy-Side sweep occurred** (wick above liquidity, close back inside, strong bearish displacement/MSS):
- → Expect reversal toward Sell-Side Liquidity (range bottom and below).

**If a confirmed Sell-Side sweep occurred** (wick below liquidity, close back inside, strong bullish displacement/MSS):
- → Expect reversal toward Buy-Side Liquidity (range top and above).

### 5b. Session Context Matters

The best sweeps occur around major session opens (use exchange/session calendar when available; otherwise approximate, as DST shifts these times):
- **Asian session (approx. 00:00–08:00 UTC)** — low volume, price typically consolidates into a tight range. This range becomes the liquidity target for London open.
- **London open (approx. 08:00 UTC)** — price often fakes above/below the Asian session range, then reverses
- **New York open (approx. 13:30–14:30 UTC)** — price often sweeps London's high/low, then drives in the real direction

Pattern: NY open pushes above London high → sweeps Buy-Side → reverses hard → takes out London low → continues in the confirmed direction.

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

1. `capture_screenshot` — capture final screenshot when annotations were added or visual confirmation is requested.
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
- **Confidence:** [High / Medium / Low] — [state what is unconfirmed or what would confirm next]
- **Bias:** [Bullish / Bearish / Neutral] — [reasoning]
- **Primary target:** [specific external liquidity level]
- **Invalidation:** [what would flip the bias]

### Setup Status & Entry
- **Status:** [Waiting / Active / Invalidated / No-Trade]
- **Entry Trigger:** [e.g., waiting for sweep + reclaim + displacement / MSS / FVG retest]
- **No-Trade Conditions:** [e.g., range unconfirmed, price stuck mid-range, no displacement, upcoming high-impact news]
```

---

## Trade Management Additions

*Note: For detailed trade management rules, refer to `trading-experience/liquidity-conversation-lessons.md`. Keep responses concise.*

When managing an existing position after TP1:
- State SL choices clearly by purpose: "Tight stop for profit protection", "Structure stop for next target", or "Invalidation stop".
- Keep execution chart annotations minimal (entry, invalidation, main targets).

---

## Glossary
See `knowledge/liquidity_terms.md` in the repo root for all term definitions used in this workflow.
