---
name: macd-trading
description: MACD analysis and trading — divergence-first entry framework with multi-timeframe bias, MACD zone filtering, confluence confirmation, and risk-managed trade execution. Use when the user wants MACD-based technical analysis or trade setups.
---

# MACD Trading Workflow

You are performing MACD-based technical analysis and generating trade setups on a TradingView chart. This skill uses a **divergence-first framework**: divergence is the necessary condition to enter any trade. Crossovers alone are never sufficient.

## Key Principles (Read First)

These rules override everything else. Violating any of them invalidates the analysis.

1. **Divergence is the NECESSARY condition.** Divergence = comparing TWO price swing points against MACD at those same bars; price makes a new extreme but MACD does NOT. Crossover, MACD < 0, or zero line cross is NOT divergence. The only exception is Zero Line Rejection (Path B).
2. **MACD near Zero Line = best entries.** Use percentile-based zone classification (Step 3c) — never raw max.
3. **Never trade crossovers in a sideway market.** Confirm trend with EMA 200 direction AND ADX > 25.
4. **Histogram reversal is the earliest signal.** Histogram contracting = momentum weakening, even before crossover.
5. **Divergence ≠ guaranteed reversal.** Wait for sufficient conditions (Step 5) before entering.
6. **Multi-timeframe alignment is mandatory.** If timeframes conflict, stand aside.
7. **Minimum Risk:Reward is 1:2.**
8. **Maximum 2% risk per trade.**

---

## ⛔ CRITICAL MISTAKES — These Invalidate Your Analysis

**These are NOT divergence:**
- ❌ MACD crossover (MACD crossing Signal line)
- ❌ MACD below/above zero
- ❌ MACD crossing the zero line
- ❌ Histogram turning positive/negative
- ❌ MACD "near zero" or "in oversold zone" — MACD has no fixed overbought/oversold levels

**Valid entry requires at least one of:**
- **Path A — Divergence:** Two price pivots compared against MACD at those bars; structures disagree.
- **Path B — Zero Line Rejection:** MACD approaches zero without crossing, bounces back. Requires ADX > 25, price on correct side of both EMA 50 and EMA 200. Full criteria: `knowledge/macd_divergence_rules.md` Section 5.

If your analysis enters on crossover alone, MACD < 0, or any condition that does not match Path A or Path B — it is WRONG.

---

## Step 1: Set Up the Chart

1. `chart_set_symbol` — switch to the requested symbol
2. `chart_set_timeframe` — set to the **entry timeframe**
3. `chart_get_state` — verify symbol and timeframe, save entity IDs
4. `chart_manage_indicator` — add studies (use full names):
   - `"MACD"`, `"Moving Average Exponential"` ×2 (EMA 200 + EMA 50), `"Relative Strength Index"`, `"Average Directional Index"`, `"Average True Range"`
5. `indicator_set_inputs` — EMA lengths **200** and **50**, MACD parameters by asset type:

   | Asset Type | MACD Parameters | When to Use |
   |---|---|---|
   | **Crypto** | Fast **10**, Slow **21**, Signal **9** | Default for 24/7 markets |
   | **Stocks — momentum/liquid** (AAPL, NVDA, TSLA) | Fast **10**, Slow **21**, Signal **9** | Intraday ≤ 1H on high-volume names |
   | **Stocks — general/swing** | Fast **12**, Slow **26**, Signal **9** | Default for 4H/D timeframes, defensive/low-vol names |

   > If unsure, use `(12, 26, 9)` for stocks and `(10, 21, 9)` for crypto. Full parameter guide: `knowledge/macd_knowledge.md` Section 2.4.

6. `chart_get_state` — re-read to capture all entity IDs
7. `capture_screenshot` — initial overview

Do not proceed until all indicators are confirmed visible.

---

## Step 2: Multi-Timeframe Trend Identification

### 2a. Switch to Higher Timeframe (4:1 to 6:1 ratio)

| Entry TF | Higher TF |
|----------|-----------|
| 5m       | 15m / 30m |
| 15m      | 1H / 4H   |
| 1H       | 4H / D    |
| 4H       | D / W     |
| D        | W         |

1. `chart_set_timeframe` → higher TF
2. `chart_get_state` — confirm

### 2b. Read Higher-Timeframe Bias

1. `data_get_study_values` — MACD current values on higher TF
2. `data_get_indicator` — MACD entity ID, count `5` — last 5 bars of MACD/Signal/Histogram on HTF to determine histogram direction (expanding vs contracting). Compare the last 2-3 histogram values.
   - **Fallback:** If `data_get_indicator` unavailable, use `data_get_ohlcv` count `30` on HTF and compute MACD using Step 1 parameters for the last 5 bars.
3. `data_get_ohlcv` with `summary: true`
4. Record bias:

| Condition | Bias |
|-----------|------|
| MACD > 0 AND Histogram[-1] > Histogram[-2] > 0 | **Strong Bullish** |
| MACD > 0 AND Histogram[-1] < Histogram[-2] | **Weakening Bullish** |
| MACD < 0 AND Histogram[-1] < Histogram[-2] < 0 | **Strong Bearish** |
| MACD < 0 AND Histogram[-1] > Histogram[-2] | **Weakening Bearish** |
| MACD near 0, tangled with Signal | **No Clear Bias — stand aside** |

> `Histogram[-1]` = most recent bar, `Histogram[-2]` = previous bar. "Expanding" means absolute value increasing; "Contracting" means absolute value decreasing.

5. Note whether price is above or below EMA 200

### 2c. Return to Entry Timeframe

1. `chart_set_timeframe` → entry TF
2. `chart_get_state` — confirm

---

## Step 3: Read MACD Signals & Zone Classification

### 3a. Get Current Values

1. `data_get_study_values` — MACD Line, Signal Line, Histogram (value + direction)
2. `data_get_ohlcv` with count `50` — recent price action
3. `data_get_indicator` — MACD entity ID, count matching Step 4a lookback (5m–1H → `100`, 4H → `150`, D/W → `200`) — historical MACD values for zone classification (Step 3c) AND divergence detection (Step 4b). Use a single request here; do NOT re-request in Step 4.
   - **Fallback:** If indicator history unavailable, use `data_get_ohlcv` with count = lookback + 30 buffer (to seed EMA warmup) and compute full MACD using the parameters selected in Step 1 (e.g., `10/21/9` for crypto, `12/26/9` for stocks):
     ```
     MACD_Line = EMA(close, Fast) − EMA(close, Slow)
     Signal    = EMA(MACD_Line, Signal_period)
     Histogram = MACD_Line − Signal
     ```
     All three components are needed for zone classification, histogram direction, and divergence checks.

### 3b. Classify the Current State

**Crossover:** Has a bullish/bearish crossover just occurred? Are the lines converging?

**Histogram:** Green growing → bullish strengthening. Green shrinking → fading. Red growing → bearish strengthening. Red shrinking → fading. Direction change precedes crossover by 3-5 bars.

**Zero Line Position:** MACD > 0 = bullish structure. MACD < 0 = bearish structure.

**Zero Line Rejection (ZLR):** MACD magnitude decreases from ratio > 30% toward zero, enters Near Zero zone without crossing, then turns back. This is the ONLY entry without divergence. Requires: ADX > 25, price on correct side of both EMA 50 and EMA 200, histogram re-expanding. Full criteria and examples: `knowledge/macd_divergence_rules.md` Section 5.

### 3c. MACD Zone Classification

Use percentile-based reference (avoids outlier distortion):

```
reference = percentile_90(|MACD|, last 100 bars)
current_ratio = |current MACD| / reference
```

Do NOT use `max(|MACD|)`. Fallback: `median(|MACD|, 100 bars) × 2`

| Zone | Ratio | Entry Quality | Required Confluence |
|------|-------|---------------|---------------------|
| **Near Zero** | < 30% | ⭐ Optimal | ≥ 2/5 |
| **Mid Range** | 30-60% | Standard | ≥ 3/5 |
| **Extended** | > 60% | ⚠️ Late entry | ≥ 4/5 or skip |

### 3d. Validate Against Trend Filter (Dual EMA)

| Condition | Trend State | Action |
|-----------|-------------|--------|
| Price > EMA 50 AND Price > EMA 200 | **Strong Bullish** | Only bullish setups, full conviction |
| Price > EMA 50 BUT Price < EMA 200 | **Early Bullish / Recovery** | Bullish OK, reduce size 50% |
| Price < EMA 50 BUT Price > EMA 200 | **Bullish Pullback** | Bullish only if Hidden Div present |
| Price < EMA 50 AND Price < EMA 200 | **Strong Bearish** | Only bearish setups, full conviction |

EMA 200 alone is too slow — EMA 50 catches intermediate shifts 10-20 bars earlier. If MACD conflicts with both EMAs, reduce conviction.

### 3e. ADX Gate

1. `data_get_study_values` — read ADX value

| ADX Level | Rules |
|-----------|-------|
| **< 20** (sideway) | Regular div only at major S/R (confluence must include S/R = 2 pts). Hidden div discouraged. ZLR invalid. No crossover trades. |
| **20-25** (weak) | Reduce conviction, require extra confluence |
| **> 25** (trending) | All signal types valid |
| **> 45 rising** | Trade WITH trend only, tight SL |
| **> 45 declining** | Do NOT open new trades — wait for divergence or pullback |

---

## Step 4: Divergence Gate (MANDATORY)

### 4a. Pull Sufficient Data

`data_get_ohlcv` — bar count by timeframe: 5m–1H → `100`, 4H → `150`, D/W → `200`

### 4b. Scan for Divergence

**Anchor rule:** Detect pivots on PRICE (swing lows/highs). Read MACD value at each pivot bar ±3 bars tolerance. Price pivots are the primary anchor — do NOT require MACD to form independent pivots.

| Type | Price | MACD | Signal |
|------|-------|------|--------|
| **Regular Bullish** | Lower low | Higher low | Reversal up — selling exhausting |
| **Regular Bearish** | Higher high | Lower high | Reversal down — buying weakening |
| **Hidden Bullish** ⭐ | Higher low | Lower low | Continuation up — trend reloading |
| **Hidden Bearish** ⭐ | Lower high | Higher high | Continuation down |

⭐ Hidden divergence is **highest priority** on TF ≤ 1H — catches pullback entries at optimal prices.

Check on **both MACD Line and Histogram**. Both diverging = strongest signal. For detailed examples, numeric walkthroughs, pivot detection, and Pine pseudocode, see `knowledge/macd_divergence_rules.md`.

### 4c. Gate Decision

```
DIVERGENCE FOUND?
  YES → Proceed to Step 5. Record: type, subtype, components, quality.
  NO  → Is there a Zero Line Rejection?
          (ADX > 25, price on correct side of both EMAs, histogram re-expanding)
          YES → Proceed to Step 5 (reduced conviction, need ≥ 3/5)
          NO  → STOP — No valid entry. Report "No Setup."
```

---

## Step 5: Confluence & Sufficient Conditions

### 5a. Check Each Factor (Weighted)

**S/R Level (Weight: ⭐⭐ — most important):**
1. `data_get_pine_lines` + `data_get_pine_labels` — key levels from custom indicators
2. **Fallback (no custom S/R indicator on chart):** Derive S/R from OHLCV data already fetched in Step 3a:
   - **Support:** lowest swing low(s) within the last 50 bars (use pivot detection with N=5)
   - **Resistance:** highest swing high(s) within the last 50 bars
   - Also check: round numbers, EMA 200 / EMA 50 as dynamic S/R
3. Divergence at major S/R, demand/supply zone, or liquidity sweep → **2 points**, else 0

**Volume (Weight: ⭐⭐):**
From OHLCV data already fetched:
- Calculate `SMA_vol_20 = average(volume, last 20 bars)`
- **Volume spike** = `current bar volume >= 1.5 × SMA_vol_20` → **1 point**
- Alternative: current bar volume is in the **top 20%** of the last 50 bars → **1 point**
- Neither condition met → 0

**EMA Trend Alignment (Weight: ⭐):**
Already checked in Step 3d. Price on correct side of both EMAs → **1 point**, else 0

**RSI (Weight: ⭐):**
1. `data_get_study_values` — read RSI
2. RSI confirms (oversold for longs, overbought for shorts, or RSI divergence) → **1 point**, else 0

### 5b. Confluence Score (Max 5)

| Factor | Weight | Score |
|--------|--------|-------|
| S/R Level | ⭐⭐ | 0 or **2** |
| Volume spike | ⭐⭐ | 0 or **1** |
| EMA 50+200 alignment | ⭐ | 0 or **1** |
| RSI confirmation | ⭐ | 0 or **1** |
| **Total** | | **/5** |

### 5c. S/R + Volume Override

```
If S/R level (2 pts) + Volume spike (1 pt) → total ≥ 3/5 → "Strong Setup"
→ RSI and EMA confluence not required for confluence score.
→ Score still must pass zone threshold in Step 5d (e.g., Extended needs ≥ 4/5 — override score of 3 does NOT pass).
→ This override applies ONLY to confluence scoring (Step 5).
  It does NOT override: Divergence/ZLR Gate (P0), HTF Alignment (P1),
  ADX restrictions (P2), or Risk Management rules (Step 6b).
```

### 5d. Entry Gate

| MACD Zone | Required Confluence | Action |
|-----------|---------------------|--------|
| Near Zero (< 30%) | ≥ 2/5 | ✅ Enter |
| Mid Range (30-60%) | ≥ 3/5 | ✅ Enter |
| Extended (> 60%) | ≥ 4/5 | ✅ Enter (careful) |
| Extended (> 60%) | < 4/5 | ❌ Skip |
| Any zone | ≤ 1/5 | ❌ Skip |

---

## ⚠️ MANDATORY GATE — Do Not Proceed Without Passing

Proceed to Step 6 ONLY if at least one path is satisfied:

**Path A — Divergence (primary):**
- [ ] Two price pivots (swing lows or highs) identified
- [ ] MACD values compared at those pivot bars (±3 bar tolerance)
- [ ] Price and MACD structures disagree
- [ ] Higher timeframe bias does not conflict

**Path B — Zero Line Rejection (exception):**
- [ ] MACD was previously at ratio > 30%, decreased toward zero, entered Near Zero zone
- [ ] MACD did NOT cross zero, turned away from zero
- [ ] ADX > 25, price on correct side of BOTH EMA 50 and EMA 200
- [ ] Histogram re-expanded after the bounce
- [ ] Higher timeframe bias does not conflict

**If neither path passes → STOP. Report "No Setup."**

---

## Step 6: Trade Setup & Risk Management

Only reach this step if the Mandatory Gate is passed.

**R:R Gate (Hard):** Calculate `R:R = |Entry − TP1| / |Entry − SL|`. TP1 = nearest S/R level, measured move, or Fibonacci target. If **R:R < 2.0 → No Trade** — report "Insufficient R:R." Trailing stop may exceed TP1, but the initial target must qualify.

### 6a. Strategy by Divergence Type

**Reversal (Regular Divergence):**
- Entry: after confirmation (crossover, trendline break, or reversal candle)
- SL: below/above divergence extreme + 1 ATR buffer
- TP: Trailing Stop (1.2–1.5× ATR), exit on opposite MACD signal

**Continuation (Hidden Divergence):**
- Requires: price on correct side of EMA 200, confluence meets zone threshold
- Entry: crossover candle close in trend direction
- SL: below/above pullback swing + 1 ATR buffer
- TP: Trailing Stop (1.2–1.5× ATR)

**Continuation (Zero Line Rejection):**
- Requires: ADX > 25, price on correct side of both EMAs, confluence ≥ 3/5
- Entry: MACD turns away from zero + crossover
- SL: below/above bounce area swing
- TP: Trailing Stop (1.2–1.5× ATR)

### 6b. Risk Management

```
Position sizing: ≤ 2% account risk per trade
Max simultaneous: 3-5 positions | Total portfolio risk: ≤ 6-10%

Stop-loss (all include 1 ATR buffer):
  Reversal     → below/above divergence extreme
  Continuation → below/above pullback swing
  ZLR          → below/above bounce area

Trailing Stop (mandatory on TF ≤ 1H):
  Long:  Trail SL = max(prev Trail SL, close - 1.5 × ATR)
  Short: Trail SL = min(prev Trail SL, close + 1.5 × ATR)

Histogram Exit (partial close — timeframe-aware):
  ≤ 15m: 5 consecutive contracting bars → close 30%, trail 70%
  ≥ 1H:  3 consecutive contracting bars → close 50%, trail 50%
  Rationale: shorter TFs have more noise, need longer contraction to confirm
```

### 6c. Annotate the Chart

1. `draw_shape` — Entry (green), Stop-Loss (red), Trailing Stop ref (blue) horizontal lines
2. `draw_shape` with `text` — label each level
3. `capture_screenshot` — complete trade setup

---

## Step 7: Report

1. `capture_screenshot` — final annotated chart
2. `draw_list` — review annotations

```
## MACD Analysis: [Symbol] — [Timeframe]

### Multi-Timeframe Bias
- Higher TF ([TF]): [bias] | MACD: [value] | Histogram: [direction]
- Entry TF: [aligned/conflicting]

### MACD State
- MACD: [value] — [position vs Signal and Zero]
- Histogram: [value] [direction] | Zone: [zone] ([ratio]%)
- ADX: [value] — [trending/sideway/exhausted]
- EMA 50: [above/below] | EMA 200: [above/below] → [trend state]

### Divergence Gate: [PASSED / FAILED]
- Type: [Regular/Hidden] [Bullish/Bearish] | Components: [Line/Histogram/Both]
- Quality: [High/Medium/Low] | Confirmation: [present/pending/none]

### Confluence Score: [X/5] | Required: [Y/5]
| Factor | Weight | Status | Detail |
|--------|--------|--------|--------|
| S/R Level | ⭐⭐ (0 or 2) | [✅/❌] | [detail] |
| Volume | ⭐⭐ (0 or 1) | [✅/❌] | [detail] |
| EMA 50+200 | ⭐ (0 or 1) | [✅/❌] | [trend state] |
| RSI | ⭐ (0 or 1) | [✅/❌] | RSI = [value] |
| Override? | — | [YES/NO] | S/R(2)+Vol(1)=3pts, subject to zone threshold |

### Trade Setup
- **Strategy:** [Reversal / Continuation / ZLR]
- **Bias:** [Long / Short / No Trade]
- **Entry:** [price] | **SL:** [price] ([risk]) | **TP1:** [price] | **R:R:** [ratio] | **Trail:** 1.5× ATR
- **Position Size:** ≤ 2% equity

### Warnings
- [conflicts, low confluence, pending confirmations, news]
```

---

## Cleanup

If indicators were added that the user didn't request to keep:
- `chart_manage_indicator` with action `"remove"` and entity_id from Step 1
- `draw_clear` to remove temporary drawings

---

## Quick Reference

| Strategy | Divergence Required | Best For | Risk |
|----------|---------------------|----------|------|
| Reversal (Regular Div) | ✅ Yes | Reversals at extremes | Medium |
| Continuation (Hidden Div) | ✅ Yes | Pullback entries in trends | Low |
| Zero Line Rejection | ❌ Exception (ADX>25, dual EMA) | Strong trend continuation | Low |

| Zone | Ratio | Min Confluence | Quality |
|------|-------|----------------|---------|
| Near Zero | < 30% | 2/5 | ⭐ Best |
| Mid Range | 30-60% | 3/5 | Standard |
| Extended | > 60% | 4/5 | ⚠️ Risky |

| Factor | Weight | Why |
|--------|--------|-----|
| S/R Level | 2 pts | Price reacts to structure, not indicators |
| Volume | 1 pt | Confirms real participation |
| EMA 50+200 | 1 pt | Objective trend direction filter |
| RSI | 1 pt | Supplementary momentum confirmation |

### Priority Hierarchy (conflict resolution)

| Priority | Check | Rule |
|----------|-------|------|
| **P0** | Divergence / ZLR Gate | Must pass Path A or Path B. No exceptions. |
| **P1** | HTF Alignment | Must not conflict → no trade. |
| **P2** | ADX | < 20 → only Regular Div at S/R. > 25 → all valid. |
| **P3** | EMA 50 + 200 | Determines direction and conviction level. |
| **P4** | RSI | Supplementary. Never overrides P0-P3. |

### Histogram Exit Reference

| Timeframe | Contracting Bars | Action |
|-----------|-----------------|--------|
| ≤ 15m | 5 consecutive | Close 30%, trail 70% |
| ≥ 1H | 3 consecutive | Close 50%, trail 50% |

When rules conflict, higher priority wins. Example: Divergence found (P0 ✅) but HTF conflicts (P1 ❌) → no trade.

---

## Glossary

See `knowledge/macd_terms.md` for term definitions.
See `knowledge/macd_knowledge.md` for MACD theory background. Note: that file describes general MACD concepts including basic crossover strategies. Under THIS skill, crossover alone is never a valid entry — only divergence (Path A) or Zero Line Rejection (Path B) qualify.
See `knowledge/macd_divergence_rules.md` for detailed divergence detection logic, numeric examples, pivot detection, ZLR criteria, and Pine Script pseudocode.
