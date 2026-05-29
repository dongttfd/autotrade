---
name: macd-trading
description: MACD analysis and trading — A professional trigger-first playbook combining market regime filters, divergence/ZLR setups, confirmation triggers, and strict risk invalidation.
---

# MACD Trading Playbook

You are acting as a professional trader performing MACD-based technical analysis. This playbook strictly evaluates market context before hunting for setups. Crossovers alone are never traded. Valid entry requires either a confirmed MACD divergence or a valid Zero Line Rejection.

## Step 1: Setup & Data

1. `chart_set_symbol` — Switch to the requested symbol.
2. `chart_set_timeframe` — Set to the **entry timeframe**.
3. `chart_manage_indicator` — Add studies: `"MACD"`, `"Moving Average Exponential"` ×2, `"Relative Strength Index"`.
4. `chart_get_state` — Verify symbol, timeframe, and capture entity IDs (needed for the next step).
5. `indicator_set_inputs` — Using entity IDs from the previous step, configure the two EMAs to length **50** and **200**. Configure MACD to:
   - Crypto: Fast **10**, Slow **21**, Signal **9**
   - Stocks: Fast **12**, Slow **26**, Signal **9**
6. `chart_get_state` — Confirm inputs are applied.
7. `data_get_study_values` — Get current MACD Line, Signal, Histogram, and RSI.
8. `data_get_ohlcv` with `count: 300` — Fetch recent price action (needed to evaluate EMA 200 and long-term momentum).
   *Crucial: Do NOT use `data_get_indicator` to fetch historical MACD series. You must calculate from close prices using selected MACD settings; if insufficient data, mark unconfirmed.*

## Step 2: Market Regime Filter & No Trade Conditions

MACD is highly unreliable in choppy/sideways markets. Evaluate the current timeframe regime.

**No Trade Conditions (STOP and report "No Setup" if ANY are true):**
- ❌ **Flat MAs:** EMA 50 and EMA 200 are flat or tightly entangled.
- ❌ **Zero Line Hugging:** MACD Line and Signal Line are tightly twisting around the zero line for multiple bars.
- ❌ **Chop/Range:** Price is oscillating in a tight, directionless range.
- ❌ **Poor Location:** A divergence pivot forms completely in the middle of a range, far from any boundary.
- ❌ **Low Volume:** Volume or liquidity is exceptionally low.

## Step 3: Higher Timeframe (HTF) Bias

1. **Switch to HTF** (e.g., if entry is 15m, go to 1H or 4H).
2. `data_get_study_values` — Fetch the current HTF values (MACD and EMA 200). If EMA 200 is missing or ambiguous, pull `data_get_ohlcv` (count: 300) to calculate it.
3. `quote_get` (or `data_get_ohlcv` `count: 1`, `summary: true`) — Fetch the latest close price to compare against the EMA 200.
4. Evaluate the HTF Trend:
   - **Bullish HTF:** Price > EMA 200 & MACD > 0
   - **Bearish HTF:** Price < EMA 200 & MACD < 0
5. **Return to Entry Timeframe.**

Determine the **Trend State** of the entry timeframe based on HTF alignment:
- `Trend`: Aligned with HTF (Best for all setups).
- `Pullback in trend`: Temporarily against HTF, but HTF is strong (Best for Hidden Div / ZLR).
- `Counter-trend`: Trading against the HTF (Scalp only, reduce expectations, ignore Hidden Div).

## Step 4: Entry Trigger Gate (Path A or Path B)

To proceed, the chart MUST present one of the following valid setups.

### Path A: MACD Divergence
Identify price swing highs/lows (pivots) from the recent 100 bars within the 300-bar dataset. Compare MACD values at those exact pivot bars. Divergence is not a signal by itself; it must pass the **Quality Filter**:
- **Regular Bullish (Reversal):** Lower Low in price, Higher Low in MACD. *Must occur at major Support or a liquidity sweep.*
- **Regular Bearish (Reversal):** Higher High in price, Lower High in MACD. *Must occur at major Resistance or a liquidity sweep.*
- **Hidden Bullish (Continuation):** Higher Low in price, Lower Low in MACD. *Must occur in a clear uptrend.*
- **Hidden Bearish (Continuation):** Lower High in price, Higher High in MACD. *Must occur in a clear downtrend.*

*Note: Pivots too close together (< 5 bars) are noise. Pivots too far apart (> 80 bars) lack momentum connection.*

### Path B: Zero Line Rejection (ZLR)
ZLR is a trend continuation setup. It requires all of the following:
1. **Prior Trend:** MACD was clearly trending > 0 (Bullish) or < 0 (Bearish).
2. **Trend Alignment:** Price must be on the correct side of BOTH EMA 50 and EMA 200.
3. **Pullback:** MACD pulls back visibly toward the zero line.
4. **Rejection:** MACD bounces back *without crossing* the zero line.
5. **Expansion:** Histogram begins expanding back in the direction of the trend.

## Step 5: Confirmation

Both Divergence and ZLR require confirmation. Ensure at least one **Required Trigger** is present:

**Required Triggers (Need at least one):**
- **Candle Trigger:** Price closes above the high of the pivot low candle (Bullish) or below the low of the pivot high candle (Bearish).
- **MACD Trigger:** MACD Line crosses the Signal Line in the trade direction *after* divergence forms or after ZLR rejection begins.
- **Histogram Trigger:** Histogram transitions from contracting to expanding in the trade direction.

**Optional Confluence:**
- **RSI Confirmation:** RSI agrees with the momentum or shows its own divergence.

If the trigger is missing, the setup is **pending**.

## Step 6: Invalidation & Risk Management

Do NOT randomly place stops just to achieve a 1:2 Risk:Reward ratio.

1. **Logical Invalidation (Stop Loss):**
   - **Longs:** SL must be placed strictly below the pivot low or the support structure that created the setup. (Trade is invalid if price closes below this point).
   - **Shorts:** SL must be placed strictly above the pivot high or the resistance structure. (Trade is invalid if price closes above this point).
2. **Target (Take Profit):**
   - TP must be at the nearest *logical* Support/Resistance level.
3. **R:R Gate:** Calculate `R:R = |Entry − TP| / |Entry − SL|`. 
   - If the nearest logical TP does not yield an R:R ≥ 2.0, **DO NOT TRADE**. Abandon the setup. Do not widen the TP unrealistically.
4. **Position Sizing:** Maximum 2% risk per trade.

## Step 7: Report Template

1. `draw_shape` — For a **Valid Trade**, draw 3 `horizontal_line` shapes for Entry, SL, and TP levels with `text` labels. For **Pending**, annotate the trigger level only. For **No Setup**, do not annotate.
2. `capture_screenshot` — Capture the final annotated setup.

```
## MACD Playbook: [Symbol] — [Timeframe]
**Status:** [No Setup / Pending / Valid Trade / No Trade due to R:R]

### 1. Market Regime & Bias
- **HTF ([TF]):** [Bullish / Bearish]
- **Current TF:** [Trend / Pullback / Counter-trend]
- **Regime:** [Clean trending / Volatile / Chop] (MAs and price action status)

### 2. Setup Location & Trigger
- **Path:** [Divergence / Zero Line Rejection]
- **Details:** [e.g., Regular Bullish Divergence at major Support / ZLR in strong uptrend].
- **Confirmation:** [e.g., MACD bullish cross + Candle closed above pivot].

### 3. Invalidation & Risk
- **Entry:** [Price]
- **Invalidation (SL):** [Price] — [Reason: e.g., below pivot low].
- **Target (TP1):** [Price] — [Reason: e.g., nearest structural resistance].
- **R:R Ratio:** [Ratio] (Must be ≥ 2.0)

### Warnings
- [e.g., Setup is counter-trend, News upcoming, etc.]
```

## Cleanup
- `chart_manage_indicator` with action `"remove"` for studies added in Step 1.
- `draw_remove_one` to clean up ONLY the temporary drawings you created. Do not use `draw_clear`.
