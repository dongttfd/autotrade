---
name: ema-trend-retest
description: EMA Ribbon Retest & Fibonacci Bounce — A compact decision-tree playbook using glossary constants for trend, pullback, Fib, confirmation, R:R, and exits.
---

# EMA Trend Retest & Fib Bounce Playbook

You are acting as a professional trader. 
**CRITICAL INSTRUCTION:** Before applying this skill, you MUST read `knowledge/ema_trend_retest_strategy.md`. Do not infer definitions from memory. This skill strictly uses constants defined in that glossary file.

## Step 1: Setup & Data

1. If the user requested a specific symbol or timeframe, use `chart_set_symbol` and/or `chart_set_timeframe`. Otherwise analyze the current chart.
2. Use `chart_get_state` once to record symbol, timeframe, existing indicators, and chart context.
3. Use `data_get_ohlcv` with `summary: false`, `count: 300`.
4. Calculate EMA 36/54/89/150, RSI 14, ATR 14, ADX 14, and Volume SMA 20 from raw OHLCV. Use calculated OHLCV series as the source of truth for all gates, including trend, pullback, Fib, confirmation, R:R, and exits.
5. Use `data_get_study_values` only as an optional sanity check when matching visual studies already exist.
6. Add EMA/RSI/Volume studies only if the user requests chart annotation or visual confirmation. Do not depend on visual studies for calculations.

*For every gate, record: `status`, `pass/fail`, `direction`, `evidence`, and `reason`. Use these records in the final report.*

### Status Decision Matrix

- Regime rejected -> `No Setup`, `Failed Gate: Regime`, `Reason: Sideways/Choppy/Low ADX`
- Trend invalid -> `No Setup`, `Failed Gate: Trend`
- Trend valid but no EMA retest -> `No Setup`, `Failed Gate: None`, `Reason: Waiting for Pullback`
- Pullback invalid -> `No Setup`, `Failed Gate: Pullback`
- No clean impulse swing -> `No Setup`, `Failed Gate: Fib`, `Reason: No Clean Impulse Swing`
- Fib invalid -> `No Setup`, `Failed Gate: Fib`
- Price in EMA/Fib zone but no closed confirmation -> `Pending`, `Failed Gate: None`, `Reason: Waiting for Confirmation`
- Price leaves or invalidates the EMA/Fib zone without confirmation -> `No Setup`, `Failed Gate: Confirmation`
- Confirmation valid but no clean target -> `Valid Setup but No Trade`, `Failed Gate: R:R`
- Confirmation valid but R:R < 1.5 -> `Valid Setup but No Trade`, `Failed Gate: R:R`
- Confirmation valid, Aggressive entry selected, and R:R passes -> `Valid Trade`, `Failed Gate: None`
- Confirmation valid, Conservative entry selected, but trigger not closed -> `Pending`, `Failed Gate: None`, `Reason: Waiting for Conservative Trigger`
- Confirmation valid, Conservative entry selected, trigger closed, and R:R passes -> `Valid Trade`, `Failed Gate: None`
- User provides open position -> `Active Trade`, `Failed Gate: None`
- Active trade hits target, Fib hard invalidation, or exhaustion exit -> `Exit Triggered`, `Failed Gate: None`

## Step 2: Gate 0 - Market Regime Filter
Apply `MARKET_REGIME_FILTER`. Map result using the Status Decision Matrix.

## Step 3: Gate A - Trend Regime
Apply `EMA_RIBBON_VALID_TREND`. Map result using the Status Decision Matrix.

## Step 4: Gate B - Pullback Quality
Classify pullback using `EMA_PULLBACK_GRADE`. Map result using the Status Decision Matrix.

## Step 5: Gate C - Fibonacci Validation
Identify swing using `IMPULSE_SWING` and validate depth using `FIB_DEPTH_RULE`. Map result using the Status Decision Matrix.

## Step 6: Gate D - Confirmation
Require `CONFIRMATION_CANDLE`. Map result using the Status Decision Matrix.

## Step 7: Gate E - Trade Plan & R:R
Calculate setup using `ENTRY_MODE`, `SL_RULE`, `STRUCTURE_TARGET`, and `RR_GATE`. Map result using the Status Decision Matrix.

## Step 8: Trade Management
- **New Valid Trade:** Report entry, SL, target, R:R, Fib 0.5 invalidation, Fib 0.618 hard invalidation, and future trailing rule. Do not evaluate active-trade exits, exhaustion, scale-out, or trailing SL unless the user confirms the position is already open or asks to manage an active trade.
- **Existing Active Trade:** Apply active-trade management rules (`FIB_INVALIDATION_STOP`, `EXHAUSTION_EXIT`, `SCALE_OUT_WARNING`). Use `Status: Active Trade` only when the user provides an existing entry/position or explicitly asks to manage an open trade.

## Step 9: Chart Annotation & Reporting

Before adding annotations:
1. Use `draw_list` to record existing drawings.
2. Add only temporary drawings required by the current status.
3. Track every new drawing ID for cleanup.

Annotation rules:
- For a **Valid Trade**, draw `horizontal_line` shapes for Entry, SL, and Target.
- For an **Active Trade** or **Exit Triggered**, annotate current SL, target/exit level, and trailing level if available.
- For **Pending**, draw the EMA/Fib reaction zone or the required trigger level if clearly defined.
- For **No Setup** / **Valid Setup but No Trade**, do not annotate.

`capture_screenshot` — Capture screenshot only when annotations were added or the user requests visual confirmation.
**Cleanup**: Use `draw_remove_one` to remove temporary annotations unless the user asked to keep them. Remove newly created temporary visual indicators if applicable.

### Report Template

Pullback Grade equals `EMA_PULLBACK_GRADE` only. Do not upgrade or downgrade it using Fib, confirmation, or R:R.

```markdown
## EMA Trend Retest Playbook: [Symbol] — [Timeframe]
**Status:** [No Setup / Pending / Valid Trade / Active Trade / Exit Triggered / Valid Setup but No Trade]
**Failed Gate:** [None / Regime / Trend / Pullback / Fib / Confirmation / R:R]
*(Use None when no gate has failed or the trade exited normally.)*
**Bias:** [Long / Short / Neutral]
**Pullback Grade:** [A+ / A / B / N/A]
**Reason:** [Short explanation]
**Next Trigger:** [Condition that would change the status]
**Invalidation:** [Level or condition that invalidates the setup, or N/A]

### Gate Check
- **Regime:** [Pass/Fail] - [Evidence]
- **Trend:** [Pass/Fail] - [Evidence]
- **Pullback:** [Pass/Fail/Waiting] - [Evidence]
- **Fib:** [Pass/Fail/N/A] - [Evidence]
- **Confirmation:** [Pass/Fail/Pending/N/A] - [Evidence]
- **R:R:** [Pass/Fail/N/A] - [Evidence]

### 1. Context & Setup
- **Market Regime:** [Trending / Sideways / Choppy / Low ADX] - [Evidence]
- **Trend State:** [e.g., Valid Ribbon, slope confirmed]
- **EMA Pullback:** [Grade / Reason if waiting]
- **Fibonacci Depth:** [e.g., 0.382 / Warning: 0.618 touched]

### 2. Execution & Risk
*(Use "N/A" for Entry/SL/Target/R:R unless status is Valid Trade, Active Trade, Exit Triggered, or Valid Setup but No Trade)*
- **Confirmation:** [e.g., Bullish Engulfing, reclaimed zone]
- **Entry Mode:** [Aggressive / Conservative] - [Price]
- **Stop Loss:** [Price]
- **Fib 0.5 Invalidation:** [Price / N/A]
- **Fib 0.618 Hard Invalidation:** [Price / N/A]
- **Target:** [Price]
- **R:R Ratio:** [Ratio]

### Management
- **Fib Stop State:** [Valid / Warning / Hard Exit / N/A]
- **Exit State:** [None / Warning / Scale Out / Full Exit]
- [e.g., Monitoring for EXHAUSTION_EXIT, Trailing SL at...]
```
