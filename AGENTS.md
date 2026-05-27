# TradingView MCP - Codex Instructions

This repository provides MCP tools for reading and controlling a live TradingView Desktop chart through CDP on port `9222`.

Use these instructions when working in this repo or when helping a user operate the TradingView MCP server.

## Tool Selection

### Current Chart State

When the user asks what is on the chart right now:

1. Use `chart_get_state` to read the symbol, timeframe, chart type, indicators, and entity IDs.
2. Use `data_get_study_values` to read current numeric values from visible indicators such as RSI, MACD, Bollinger Bands, EMAs, and similar studies.
3. Use `quote_get` for the latest price, OHLC, and volume snapshot.

Call `chart_get_state` once at the start of a task and reuse returned entity IDs. Entity IDs are session-specific and must not be cached across sessions.

### Pine Drawings And Indicator Objects

Custom Pine indicators often draw with `line.new()`, `label.new()`, `table.new()`, and `box.new()`. Normal indicator-value tools do not expose those objects.

Use these tools when the user asks about visible levels, labels, boxes, or tables:

1. `data_get_pine_lines` for horizontal price levels drawn by indicators.
2. `data_get_pine_labels` for text annotations with prices.
3. `data_get_pine_tables` for table data formatted as rows.
4. `data_get_pine_boxes` for price zones or ranges as `{ high, low }` pairs.

Always pass `study_filter` when the target indicator is known.

### Price Data

- Use `data_get_ohlcv` with `summary: true` for compact price action summaries.
- Use `data_get_ohlcv` without summary only when individual bars are needed, and cap `count`.
- Use `quote_get` for a single latest price snapshot.

Default OHLCV request sizes:

- `count: 20` for quick checks.
- `count: 100` for deeper analysis.
- `count: 500` only when specifically needed.

### Full Chart Analysis

For a full chart report, gather context in this order:

1. `quote_get` for current price.
2. `data_get_study_values` for visible indicator readings.
3. `data_get_pine_lines` for key price levels from custom indicators.
4. `data_get_pine_labels` for labeled levels and context.
5. `data_get_pine_tables` for session stats or analytics dashboards.
6. `data_get_ohlcv` with `summary: true` for price action.
7. `capture_screenshot` for visual confirmation.

When screenshots are available, prefer them for visual context instead of pulling large raw datasets.

### Changing The Chart

Use these tools for chart control:

- `chart_set_symbol` to switch ticker, for example `AAPL`, `ES1!`, or `NYMEX:CL1!`.
- `chart_set_timeframe` to switch resolution, for example `1`, `5`, `15`, `60`, `D`, or `W`.
- `chart_set_type` to switch chart style.
- `chart_manage_indicator` to add or remove studies.
- `chart_scroll_to_date` to jump to an ISO date.
- `chart_set_visible_range` to zoom to an exact date range using Unix timestamps.

When adding indicators, use full TradingView study names:

- `Relative Strength Index`, not `RSI`
- `Moving Average Exponential`, not `EMA`
- `Moving Average`, not `SMA`
- `Bollinger Bands`, not `BB`

### Pine Script Development

For Pine Script work:

1. Use `pine_set_source` to inject code into the editor.
2. Use `pine_smart_compile` to compile and detect errors.
3. Use `pine_get_errors` to read compilation errors.
4. Use `pine_get_console` to read `log.info()` output.
5. Use `pine_save` when the user asks to save to TradingView cloud.
6. Use `pine_new` to create a blank indicator, strategy, or library.
7. Use `pine_open` to load a saved script by name.

Avoid `pine_get_source` on complex scripts unless you need to edit the current source. It can return very large payloads.

### Replay Practice

For TradingView replay:

1. `replay_start` with a date such as `2025-03-01`.
2. `replay_step` to advance one bar.
3. `replay_autoplay` to auto-advance.
4. `replay_trade` with `action: "buy"`, `"sell"`, or `"close"`.
5. `replay_status` to inspect position, P&L, and replay date.
6. `replay_stop` to return to realtime.

### Multi-Symbol Screening

Use `batch_run` for repeated work across symbols, for example:

- `symbols: ["ES1!", "NQ1!", "YM1!"]`
- `action: "screenshot"` or `action: "get_ohlcv"`

### Drawing

Use drawing tools to annotate the chart:

- `draw_shape` for `horizontal_line`, `trend_line`, `rectangle`, or `text`.
- `draw_list` to inspect existing drawings.
- `draw_remove_one` to remove a drawing by ID.
- `draw_clear` to remove all drawings.

### Alerts

- `alert_create` for price alerts.
- `alert_list` to inspect active alerts.
- `alert_delete` to remove alerts.

Supported conditions include `crossing`, `greater_than`, and `less_than`.

### UI Navigation

- `ui_open_panel` to open or close panels such as Pine Editor, Strategy Tester, watchlist, alerts, or trading.
- `ui_click` to click UI elements by aria-label, text, or data-name.
- `layout_switch` to load a saved layout.
- `ui_fullscreen` to toggle fullscreen.
- `capture_screenshot` to capture `full`, `chart`, or `strategy_tester` regions.

### Launch And Health

If TradingView is not running:

1. Use `tv_launch` to detect and launch TradingView with CDP.
2. Use `tv_health_check` to verify the connection.

Do not read chart data until the connection is healthy.

## Context Management

MCP tools can return large payloads. Keep context tight:

1. Always use `summary: true` on `data_get_ohlcv` unless individual bars are required.
2. Always use `study_filter` on Pine drawing tools when the relevant indicator is known.
3. Never use `verbose: true` unless the user specifically asks for raw drawing data, IDs, or colors.
4. Avoid `pine_get_source` on complex scripts unless editing is required.
5. Avoid `data_get_indicator` on protected or encrypted indicators. Use `data_get_study_values` for current values.
6. Prefer `capture_screenshot` for visual context.
7. Call `chart_get_state` once at the start and reuse entity IDs.
8. Cap OHLCV requests.

Approximate compact output sizes:

| Tool | Typical Output |
| --- | --- |
| `quote_get` | ~200 bytes |
| `data_get_study_values` | ~500 bytes |
| `data_get_pine_lines` | ~1-3 KB per study |
| `data_get_pine_labels` | ~2-5 KB per study |
| `data_get_pine_tables` | ~1-4 KB per study |
| `data_get_pine_boxes` | ~1-2 KB per study |
| `data_get_ohlcv` with summary | ~500 bytes |
| `data_get_ohlcv` with 100 bars | ~8 KB |
| `capture_screenshot` | Returns a file path, not image data |

## Tool Conventions

- Tools return objects shaped like `{ success: true/false, ... }`.
- Entity IDs from `chart_get_state` are session-specific.
- Pine indicators must be visible on the chart for Pine graphics tools to read their drawings.
- `chart_manage_indicator` requires full indicator names.
- Screenshots are saved to `screenshots/` with timestamps.
- OHLCV responses are capped at 500 bars.
- Trade responses are capped at 20 trades per request.
- Pine labels are capped at 50 per study by default unless `max_labels` is provided.

## Architecture

```text
Codex <-> MCP Server (stdio) <-> CDP (localhost:9222) <-> TradingView Desktop (Electron)
```

Pine graphics are read from TradingView internals, including:

```text
study._graphics._primitivesCollection.dwglines.get('lines').get(false)._primitivesDataById
```

## Skills
When a task matches one of these workflows, read the corresponding SKILL.md for step-by-step instructions:
- Chart analysis → `skills/chart-analysis/SKILL.md`
- Liquidity analysis → `skills/liquidity-smart-money/SKILL.md`
- MACD trading → `skills/macd-trading/SKILL.md`
- Multi-symbol scan → `skills/multi-symbol-scan/SKILL.md`
- Pine development → `skills/pine-develop/SKILL.md`
- Replay practice → `skills/replay-practice/SKILL.md`
- Strategy report → `skills/strategy-report/SKILL.md`

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **tradingview-mcp** (1335 symbols, 2385 relationships, 86 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/tradingview-mcp/context` | Codebase overview, check index freshness |
| `gitnexus://repo/tradingview-mcp/clusters` | All functional areas |
| `gitnexus://repo/tradingview-mcp/processes` | All execution flows |
| `gitnexus://repo/tradingview-mcp/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
