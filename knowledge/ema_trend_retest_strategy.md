# EMA Trend Retest Strategy & Glossary

This document defines the strict quantitative constants and rules used by the EMA Trend Retest AI playbook. 

## CALCULATED_SERIES
From the 300 raw OHLCV bars, calculate EMA 36/54/89/150, RSI 14 (or 21), ATR 14, ADX 14, and Volume SMA 20.
Use these calculated series for slope, divergence, Fib, candle validation, and regime filtering.
Use `data_get_study_values` only to verify current indicator values.

## MARKET_REGIME_FILTER
Before applying EMA_RIBBON_VALID_TREND, reject sideways/choppy markets.

No-trade if any of these are true:
- ADX(14) < 18.
- EMA36-EMA150 spread < 0.5 ATR(14).
- EMA36 crosses EMA54 more than 2 times in the last 20 candles.
- The last 20 candles are contained inside a range smaller than 1.5 ATR(14).

If rejected, report:
`Status: No Setup`
`Failed Gate: Regime`
`Reason: Sideways / Low Trend Strength / EMA Compression / Choppy EMA Crosses`

## EMA_RIBBON_VALID_TREND
- **Long valid:** Price closes above EMA 36/54/89/150 and EMA 36 > EMA 54 > EMA 89 > EMA 150.
- **Short valid:** Price closes below EMA 36/54/89/150 and EMA 36 < EMA 54 < EMA 89 < EMA 150.
- **Slope:** EMA 36 and EMA 54 must slope in the trade direction. Slope passes when the EMA current value is higher than its value N bars ago for long, lower for short. Default slope window: last 5 closed bars. Use 10 only when timeframe is high or price is noisy.
- **Invalidation:** Invalid if EMAs are flat, entangled, or repeatedly crossing (e.g., EMA 36 and 89 distance < 0.1% of price).

## EMA_PULLBACK_GRADE
A retest is valid when a candle wick or body touches the zone, but the close must remain on the valid side of EMA 150.
- **A+ (Strong):** Price retests EMA 36 - 54 zone.
- **A (Standard):** Price retests EMA 54 - 89 zone.
- **B (Risky):** Price retests EMA 89 - 150 zone.
- **Invalid Long:** Candle closes completely below EMA 150.
- **Invalid Short:** Candle closes completely above EMA 150.

## IMPULSE_SWING
The impulse swing must be selected in this order:
1. Identify the most recent confirmed structural breakout in the trend direction. A structural breakout is valid only when price closes beyond the prior confirmed pivot high for longs or prior confirmed pivot low for shorts. Wicks alone do not count.
2. For long setups, use the swing low that launched the breakout to the breakout swing high.
3. For short setups, use the swing high that launched the breakout to the breakout swing low.
4. The pullback must occur after that impulse endpoint.
5. Do not use a minor swing formed inside the pullback as the Fib anchor.
6. The impulse must have at least one candle close outside/away from EMA 36 in the trend direction.
7. Use local pivots confirmed by 2-3 candles on both sides (use 5 only for higher timeframe confirmation).

## FIB_DEPTH_RULE
Draw Fibonacci retracement on the `IMPULSE_SWING`.
- **Preferred:** 0.236 - 0.382
- **Acceptable:** 0.5
- **Warning:** Wick into 0.618 or one close beyond 0.5 that immediately reclaims on the next candle.
  - *Long reclaim:* next candle closes back above 0.5.
  - *Short reclaim:* next candle closes back below 0.5.
- **Invalid:** 
  - *Long invalid:* close below 0.618, or two consecutive closes below 0.5.
  - *Short invalid:* close above 0.618, or two consecutive closes above 0.5.

## CONFIRMATION_CANDLE
A confirmation candle must be closed and must react from the tested EMA/Fib reaction zone.

For long:
- Candle must be bullish.
- Lower wick or body must touch the reaction zone.
- Close must reclaim the tested EMA band or close back above the Fib level that price violated.
- If multiple levels were tested, use the highest reclaimed level as the confirmation threshold.

For short:
- Candle must be bearish.
- Upper wick or body must touch the reaction zone.
- Close must reject below the tested EMA band or close back below the Fib level that price violated.
- If multiple levels were tested, use the lowest rejected level as the confirmation threshold.

Valid patterns:
- **Pin bar:** Rejection wick must be at least 2x the candle body.
- **Engulfing:** Current body fully engulfs the previous candle's body.

## ENTRY_MODE
- **Aggressive:** Enter at the `CONFIRMATION_CANDLE` close.
- **Conservative:** 
  - Long trigger: a later candle closes above the confirmation candle high.
  - Short trigger: a later candle closes below the confirmation candle low.
  - Do not use wick-only breaks as conservative triggers.
  - Calculate R:R from the conservative trigger price, not from the confirmation close.
  - If confirmation is valid but the conservative trigger has not closed, report `Pending`.
- *Note:* If the confirmation candle is unusually large (e.g., body > 1.5x average true range (ATR) or average candle body) and causes `RR_GATE` to fail, do not trade.

## SL_RULE
- **Buffer:** 1-2 ticks for liquid futures/stocks, or 0.1 ATR(14) if tick size is unclear.
- **Long:** SL below `CONFIRMATION_CANDLE` low plus buffer, or below pullback swing low.
- **Short:** SL above `CONFIRMATION_CANDLE` high plus buffer, or above pullback swing high.
- Use structure SL (pullback swing extreme) when the confirmation candle is unusually small (e.g., body < 0.5x average true range (ATR) or average candle body) to avoid noise.

## FIB_INVALIDATION_STOP
For active or newly triggered trades, monitor Fib 0.5 as an early invalidation level.
- Long: if a candle closes below Fib 0.5 after entry, tighten risk or exit partial; if two consecutive candles close below Fib 0.5, exit full unless the original SL is already closer.
- Short: if a candle closes above Fib 0.5 after entry, tighten risk or exit partial; if two consecutive candles close above Fib 0.5, exit full unless the original SL is already closer.
- A wick through Fib 0.5 does not invalidate the trade if the candle closes back on the valid side.
- A close beyond Fib 0.618 invalidates the setup and triggers full exit.

## TRAILING_SL_RULE
- Trail SL after every new structural swing breakout (new HH for Longs, LL for Shorts).
- **Long:** Move SL below the low of the most recent pullback's `CONFIRMATION_CANDLE` plus buffer.
- **Short:** Move SL above the high of the most recent pullback's `CONFIRMATION_CANDLE` plus buffer.

## STRUCTURE_TARGET
Use the nearest valid structure level in the trade direction:
- Long: nearest prior pivot high, swing high, or supply/resistance level above entry.
- Short: nearest prior pivot low, swing low, or demand/support level below entry.
- A valid pivot must be confirmed by 2-3 candles on both sides.
- Do not use a farther target if a nearer valid structure level exists.
- If no clean structure target exists inside the analyzed bars, report `Valid Setup but No Trade`.

## RR_GATE
Calculate Risk:Reward using `ENTRY_MODE`, `SL_RULE`, and `STRUCTURE_TARGET`.
- **Minimum R:R:** 1.5
- **Preferred R:R:** 2.0 or higher
- If nearest logical target gives R:R below minimum, status is `Valid Setup but No Trade`. Do not invent farther targets just to pass.

## EXHAUSTION_EXIT
Exit full position when a volume spike and RSI regular divergence occur concurrently on closed candles.
- **Long:** Price makes HH while RSI makes LH.
- **Short:** Price makes LL while RSI makes HL.
- **Volume Spike:** The last closed candle's volume is > 3x the Volume SMA 20.
- Calculate RSI series from the same OHLCV close data using the configured RSI length to identify exact structural RSI peaks/troughs.

## SCALE_OUT_WARNING
Consider scaling out or tightening trailing SL if:
- RSI regular divergence occurs without a volume spike.
- A volume spike occurs exactly into a major HTF resistance/support level.
