# MACD Divergence Detection Rules

> [!IMPORTANT]
> This file is the detailed reference for divergence detection under the `macd-trading` skill. The SKILL.md workflow references this file for deep implementation details. All rules here are subordinate to SKILL.md — if there is any conflict, SKILL.md wins.

---

## 1. What Divergence IS and IS NOT

### Divergence IS:
A structural disagreement between **price swing points** and **MACD values at those same points**. It requires:
1. At least **two comparable swing points** on price (two swing lows or two swing highs)
2. Reading MACD values at those swing points
3. Finding that price and MACD moved in **opposite directions** between the two points

### Divergence is NOT:
- ❌ A MACD crossover (MACD crossing Signal line)
- ❌ MACD being below zero
- ❌ MACD crossing the zero line
- ❌ Histogram changing direction
- ❌ MACD being "near zero" or "oversold"
- ❌ A single bar's MACD value being low or high

These are all **single-point observations**. Divergence is a **two-point comparison**.

---

## 2. The Four Types of Divergence

### 2a. Regular Bullish Divergence (Reversal Signal)

```
Price:  Swing Low 1 = $100  →  Swing Low 2 = $95   (LOWER low)
MACD:  At Low 1    = -5.2   →  At Low 2    = -3.1   (HIGHER low)

Price went LOWER, MACD went HIGHER → structures DISAGREE → ✅ Regular Bullish Divergence
```

**Meaning:** Selling pressure is exhausting. Price made a new low but momentum (MACD) didn't confirm it — the bears are losing steam.

**Best when:** MACD is in the Near Zero zone (ratio < 30%) or at a key support level.

### 2b. Regular Bearish Divergence (Reversal Signal)

```
Price:  Swing High 1 = $200  →  Swing High 2 = $210  (HIGHER high)
MACD:  At High 1     = +4.8  →  At High 2     = +3.0  (LOWER high)

Price went HIGHER, MACD went LOWER → structures DISAGREE → ✅ Regular Bearish Divergence
```

**Meaning:** Buying pressure is weakening. Price made a new high but momentum didn't follow.

### 2c. Hidden Bullish Divergence (Continuation Signal)

```
Price:  Swing Low 1 = $100  →  Swing Low 2 = $105  (HIGHER low)
MACD:  At Low 1    = -2.0   →  At Low 2    = -3.5   (LOWER low)

Price went HIGHER, MACD went LOWER → structures DISAGREE → ✅ Hidden Bullish Divergence
```

**Meaning:** The uptrend is intact. Price held a higher low (buyers defended), but MACD reset deeper — this is the trend "reloading" for the next move up.

**HIGHEST PRIORITY on timeframes ≤ 1H.** Hidden divergence catches pullback entries at optimal prices in strong trends.

### 2d. Hidden Bearish Divergence (Continuation Signal)

```
Price:  Swing High 1 = $200  →  Swing High 2 = $195  (LOWER high)
MACD:  At High 1     = +3.0  →  At High 2     = +4.0  (HIGHER high)

Price went LOWER, MACD went HIGHER → structures DISAGREE → ✅ Hidden Bearish Divergence
```

**Meaning:** The downtrend is intact despite a MACD bounce.

---

## 3. Pivot Detection — The Anchor Rule

### 3a. Core Principle

**Price pivots are the primary anchor.** Detect swing highs and swing lows on the PRICE chart. Then read MACD values at those pivot bars.

Do NOT require MACD to independently form its own pivots. MACD is a smoothed derivative of price — its extremes often lag by 1-3 bars.

### 3b. Detecting Price Pivots

A **swing low** (pivot low) is a bar whose low is lower than the lows of N bars before it and N bars after it.

A **swing high** (pivot high) is a bar whose high is higher than the highs of N bars before it and N bars after it.

**Recommended N values by timeframe:**
| Timeframe | Pivot Length (N) | Lookback for 2nd pivot |
|-----------|-----------------|----------------------|
| 5m - 15m  | 3-5 bars        | 20-50 bars           |
| 1H        | 5-10 bars       | 30-80 bars           |
| 4H        | 5-10 bars       | 40-100 bars          |
| Daily     | 5-10 bars       | 50-150 bars          |

In Pine Script: `ta.pivotlow(low, N, N)` and `ta.pivothigh(high, N, N)`.

### 3c. Reading MACD at Pivot Bars — The ±3 Bar Tolerance

MACD is calculated from EMAs — it inherently lags price. When price hits an exact swing low, MACD may still be declining for 1-3 more bars before it bottoms out.

**Rule:** At each price pivot bar, read the MACD value at that bar. **Also** check MACD values within a ±3 bar window around the pivot. Use the **most extreme MACD value** (lowest for swing lows, highest for swing highs) within that window.

```
Example — Price pivot low at bar 40:

Bar:    37     38     39    [40]    41     42     43
Price:  99     97     96    [95]    97     99    101     ← Bar 40 is the price pivot low
MACD:  -3.8   -4.1   -4.4  [-4.3]  -4.6   -4.2  -3.7   ← MACD at bar 40 = -4.3
                                                          ← But MACD bottoms at bar 41 = -4.6

Use MACD = -4.6 (the most extreme value in the ±3 window)
```

**Why this matters:** Without the tolerance window, you might read MACD = -4.3 at bar 40 instead of -4.6 at bar 41. This could cause a false divergence signal (or miss a real one).

---

## 4. Pine Script Pseudocode for Divergence Detection

```pine
//@version=6
// Divergence Detection Pseudocode — NOT a complete strategy

PIVOT_LEN = 5
TOLERANCE = 3

// Step 1: Detect price pivots
pivot_low  = ta.pivotlow(low, PIVOT_LEN, PIVOT_LEN)
pivot_high = ta.pivothigh(high, PIVOT_LEN, PIVOT_LEN)

// Step 2: When a pivot low is found, read MACD in the tolerance window
// Note: ta.pivotlow returns the value PIVOT_LEN bars ago (it needs N future bars to confirm)
if not na(pivot_low)
    pivot_bar = bar_index - PIVOT_LEN  // the actual pivot bar
    
    // Read MACD at pivot bar and ±TOLERANCE, take the lowest
    macd_at_pivot = lowest_macd_in_window(pivot_bar, TOLERANCE)
    price_at_pivot = low[PIVOT_LEN]
    
    // Compare with previous pivot
    if not na(prev_pivot_price) and not na(prev_pivot_macd)
        // Regular Bullish: price lower low, MACD higher low
        if price_at_pivot < prev_pivot_price and macd_at_pivot > prev_pivot_macd
            regular_bull_div = true
        
        // Hidden Bullish: price higher low, MACD lower low
        if price_at_pivot > prev_pivot_price and macd_at_pivot < prev_pivot_macd
            hidden_bull_div = true
    
    // Store for next comparison
    prev_pivot_price := price_at_pivot
    prev_pivot_macd  := macd_at_pivot
```

**Important implementation notes:**
- `ta.pivotlow()` confirms a pivot only after PIVOT_LEN bars have passed — the detection is delayed
- Store the most recent two pivots (both price and MACD) to compare
- Check both MACD Line divergence AND Histogram divergence
- Same logic applies for swing highs (bearish divergence), using `ta.pivothigh` and highest MACD

> [!WARNING]
> **Repaint / Confirmation Delay:** `ta.pivotlow(low, N, N)` requires N future bars to close before confirming the pivot exists. This means:
> - A pivot at bar 40 with N=5 is only confirmed at bar 45
> - Any divergence signal based on that pivot is also delayed by N bars
> - Do NOT assume a pivot exists in real-time before confirmation bars close
> - In backtesting, TradingView handles this correctly (no future leak). But in live trading, your entry will be N bars after the actual pivot — factor this into stop-loss and entry price calculations.
> - If you use `ta.pivotlow(low, N, 0)` (zero right bars) to get faster detection, the pivot can REPAINT — it may appear and then disappear on the next bar. This creates false signals in live trading.

---

## 5. Zero Line Rejection (ZLR) — Detailed Rules

### 5a. What ZLR IS

ZLR occurs when MACD approaches the zero line but **fails to cross it** and turns back in the original trend direction.

### 5b. Quantitative Definition

**Bullish ZLR criteria:**
1. MACD was positive (above zero) for the prior trend.
2. MACD decreased toward zero visibly (pulled back).
3. MACD remained positive (did NOT cross below zero).
4. MACD turned back upward (slope became positive).
5. Price is above BOTH EMA 50 and EMA 200 (strong bullish structure).

**Bearish ZLR criteria (mirror of above):**
1. MACD was negative (below zero) for the prior trend.
2. MACD decreased toward zero visibly.
3. MACD remained negative (did NOT cross above zero).
4. MACD turned back downward.
5. Price is below BOTH EMA 50 and EMA 200.

### 5c. Valid vs Invalid ZLR Examples

**✅ Valid Bullish ZLR:**
```
Bar:    1     5     10    15    20    25
MACD:  +3.2  +2.1  +0.8  +0.3  +0.6  +1.4
                          ↑ Near zero, stays positive, bounces back
Price > EMA50 ✅, Price > EMA200 ✅
```

**❌ Invalid — Zero Line CROSS (not rejection):**
```
Bar:    1     5     10    15    20    25
MACD:  +2.0  +0.8  -0.2  -0.5  +0.3  +1.1
                    ↑ CROSSED below zero — this is NOT a rejection
```

**❌ Invalid — Sideways noise:**
```
Bar:    1     5     10    15    20    25
MACD:  +0.1  -0.1  +0.2  -0.05 +0.1  +0.15
All values near zero, no clear trend direction — this is chop, not ZLR
```

**❌ Invalid — Missing EMA conditions:**
```
Bar:    1     5     10    15    20    25
MACD:  +2.5  +1.2  +0.4  +0.8  +1.5  +2.0
Looks like ZLR shape ✅
But Price is < EMA200 ❌ — market is not trending enough to qualify
```

> [!NOTE]
> **Cross-reference:** The overall entry gate combining MACD + confluence is in SKILL.md Step 4.

---

## 6. Divergence Quality Checklist

| Factor | Higher Quality | Lower Quality |
|--------|---------------|---------------|
| Timeframe | 4H, Daily | 5m, 15m |
| Type | Double divergence (2 consecutive) | Single |
| Location | At major S/R level | In open space |
| Components | Both MACD Line + Histogram | Only one |
| Subtype | Hidden div aligned with HTF trend | Regular div against trend |
| MACD State | Visually near zero | Visually extended |
| Separation | Pivots 15-50 bars apart | Pivots < 5 bars or > 100 bars apart |

> **Cross-reference:** This quality checklist is used during SKILL.md Step 4 (Entry Trigger Gate) to rate the strength of detected divergence.

---

## 7. Common AI Mistakes When Implementing Divergence

### Mistake 1: Single-point check instead of two-point comparison
```
WRONG:  if macdLine < 0 → "bearish divergence detected"
RIGHT:  if price_low_2 < price_low_1 AND macd_low_2 > macd_low_1 → "regular bullish divergence"
```

### Mistake 2: Using crossover as divergence proxy
```
WRONG:  if ta.crossover(macdLine, signalLine) and macdLine < 0 → "bullish divergence"
RIGHT:  Crossover may CONFIRM divergence, but crossover alone is NOT divergence
```

### Mistake 3: Requiring MACD to form independent pivots
```
WRONG:  Find pivot on price AND find separate pivot on MACD, then match
RIGHT:  Find pivot on price, read MACD at that bar (±3 tolerance), compare two readings
```

### Mistake 4: Confusing ZLR with zero line cross
```
WRONG:  MACD goes from -1.0 to +0.5 → "zero line rejection"
RIGHT:  ZLR means MACD FAILED to cross zero and bounced back
```

### Mistake 5: No minimum separation between pivots
```
WRONG:  Comparing bar 38 and bar 40 (only 2 bars apart) — this is noise
RIGHT:  Pivots should be at least 10-15 bars apart for meaningful divergence on 1H
```

---

## 8. Pine Script Backtesting Checklist

When implementing divergence detection in Pine Script for backtesting, verify:

- [ ] Code uses `ta.pivotlow()` / `ta.pivothigh()` or equivalent to detect swing points on PRICE
- [ ] Code reads MACD value at pivot bars (with ±3 bar tolerance), NOT just current bar value
- [ ] Entry logic requires divergence comparison between two pivots, not just crossover or MACD position
- [ ] Pivot confirmation delay (N bars) is accounted for — no future data leak
- [ ] Minimum pivot separation enforced (≥ 10-15 bars on 1H, adjust for other TFs)

See Section 4 above for the full pseudocode implementation.
