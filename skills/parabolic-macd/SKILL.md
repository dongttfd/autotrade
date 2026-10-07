---
name: parabolic-macd
description: Parabolic SAR + MACD + EMA 200 — Chiến lược giao dịch 3 chỉ báo kết hợp bộ lọc xu hướng EMA 200, tín hiệu vào lệnh MACD crossover, và xác nhận hướng Parabolic SAR với quản lý rủi ro 1:1.
---

# Parabolic SAR + MACD + EMA 200 Playbook

Bạn đóng vai một trader chuyên nghiệp. Chiến lược này kết hợp 3 chỉ báo để lọc xu hướng, xác nhận tín hiệu và vào lệnh chính xác. Tất cả chỉ báo sử dụng cài đặt mặc định. Không bao giờ vào lệnh khi thiếu bất kỳ điều kiện nào.

**QUAN TRỌNG:** Đọc `knowledge/parabolic_macd.md` để hiểu vai trò từng chỉ báo trước khi thực thi.

## Step 1: Chuẩn Bị & Thu Thập Dữ Liệu

1. `chart_set_symbol` — Chuyển sang symbol được yêu cầu (bỏ qua nếu phân tích chart hiện tại).
2. `chart_set_timeframe` — Đặt timeframe được yêu cầu (bỏ qua nếu giữ nguyên).
3. `chart_manage_indicator` — Thêm 3 chỉ báo:
   - `"Moving Average Exponential"` (length: 200)
   - `"Parabolic SAR"`
   - `"MACD"`
4. `chart_get_state` — Xác nhận symbol, timeframe, và lấy entity IDs cho các chỉ báo.
5. `indicator_set_inputs` — Cấu hình EMA length = **200**. MACD và Parabolic SAR giữ mặc định.
6. `quote_get` — Lấy giá hiện tại.
7. `data_get_study_values` — Lấy giá trị hiện tại của:
   - EMA 200
   - MACD Line, Signal Line, Histogram
   - Parabolic SAR
8. `data_get_ohlcv` với `summary: false`, `count: 20` — Lấy 20 nến gần nhất (dùng cho sideway detection ở Gate A).

## Step 2: Gate A — Bộ Lọc Xu Hướng (EMA 200)

So sánh giá hiện tại với EMA 200:

| Điều kiện | Hướng giao dịch | Hành động |
|---|---|---|
| Giá **trên** EMA 200 | Chỉ tìm lệnh **LONG** | Tiếp tục Gate B |
| Giá **dưới** EMA 200 | Chỉ tìm lệnh **SHORT** | Tiếp tục Gate B |
| Giá **cắt qua** EMA 200 liên tục | **Không giao dịch** | Dừng, báo cáo `No Setup` |

**Kiểm tra sideway:** Dùng 20 nến từ `data_get_ohlcv` ở Step 1. Đếm số lần giá close chuyển từ trên → dưới hoặc dưới → trên EMA 200. Nếu ≥ 3 lần cắt trong 20 nến → sideway, báo `No Setup`.

## Step 3: Gate B — Tín Hiệu Vào Lệnh (MACD Crossover)

Kiểm tra giao cắt MACD theo đúng hướng đã xác định ở Gate A:

- **LONG:** Đường MACD cắt **lên trên** đường Signal.
- **SHORT:** Đường MACD cắt **xuống dưới** đường Signal.

**Cách xác nhận giao cắt từ `data_get_study_values`:**
1. **LONG hợp lệ:** MACD Line > Signal Line VÀ Histogram > 0 VÀ Histogram có giá trị nhỏ (gần 0) → giao cắt vừa xảy ra gần đây.
2. **SHORT hợp lệ:** MACD Line < Signal Line VÀ Histogram < 0 VÀ Histogram có giá trị nhỏ (gần 0) → giao cắt vừa xảy ra gần đây.
3. Nếu |Histogram| lớn → giao cắt đã xảy ra từ lâu, tín hiệu cũ → `No Setup`.
4. Nếu MACD và Signal cùng hướng với Gate A nhưng chưa giao cắt (Histogram ngược dấu) → `No Setup`.

**Mẹo:** Histogram càng nhỏ (vừa đổi dấu) = crossover càng mới = tín hiệu càng tươi.

## Step 4: Gate C — Xác Nhận Xu Hướng (Parabolic SAR)

Kiểm tra vị trí chấm Parabolic SAR:

- **LONG:** Chấm SAR phải nằm **dưới** nến hiện tại.
- **SHORT:** Chấm SAR phải nằm **trên** nến hiện tại.

**Xử lý trường hợp chờ:**
Nếu MACD đã giao cắt đúng hướng nhưng Parabolic SAR chưa đúng vị trí:
- Trạng thái = `Pending`
- Chờ SAR chuyển sang đúng vị trí.
- Khi SAR đúng vị trí, kiểm tra lại MACD vẫn duy trì giao cắt (Histogram vẫn đúng màu).
- Nếu MACD đã đảo chiều trước khi SAR chuyển → `No Setup`, bỏ qua tín hiệu.

## Step 5: Lập Kế Hoạch Giao Dịch

Khi cả 3 gate đều pass:

### Entry
- Vào lệnh tại giá đóng cửa của nến xác nhận (nến mà cả 3 điều kiện thỏa mãn đồng thời).

### Stop-Loss
- Đặt SL tại vị trí chấm Parabolic SAR **tại thời điểm vào lệnh**.
- LONG: SL = giá trị SAR (dưới nến).
- SHORT: SL = giá trị SAR (trên nến).

### Take-Profit
- Tỷ lệ R:R = **1:1**.
- TP = Entry ± |Entry − SL|
  - LONG: TP = Entry + (Entry − SL)
  - SHORT: TP = Entry − (SL − Entry)

### Kiểm Tra R:R
- Nếu khoảng cách SL quá lớn so với biến động bình thường (ATR) → cảnh báo rủi ro cao.
- Nếu TP nằm tại vùng kháng cự/hỗ trợ mạnh trước khi đạt 1:1 → cảnh báo trong báo cáo.

## Step 6: Trạng Thái Quyết Định

| Kết quả | Trạng thái | Hành động |
|---|---|---|
| Cả 3 gate pass | `Valid Trade` | Vào lệnh, vẽ annotation |
| Gate A + B pass, Gate C chưa pass | `Pending` | Chờ SAR, báo cáo điều kiện chờ |
| Bất kỳ gate nào fail | `No Setup` | Không vào lệnh |
| Giá sideway quanh EMA 200 | `No Setup — Sideway` | Không giao dịch |

## Step 7: Annotation & Báo Cáo

### Annotation
1. `draw_list` — Ghi nhận các drawing hiện có.
2. Vẽ annotation theo trạng thái:
   - **Valid Trade:** `draw_shape` — 3 đường `horizontal_line`:
     - Entry (màu xanh dương, text: `"Entry [giá]"`)
     - SL (màu đỏ, text: `"SL [giá]"`)
     - TP (màu xanh lá, text: `"TP [giá]"`)
   - **Pending:** Vẽ mức giá cần theo dõi (EMA 200 hoặc SAR trigger).
   - **No Setup:** Không vẽ gì.
3. `capture_screenshot` — Chụp chart đã annotate.

### Report Template

```markdown
## Parabolic SAR + MACD Playbook: [Symbol] — [Timeframe]
**Trạng thái:** [No Setup / Pending / Valid Trade]
**Hướng:** [Long / Short / Không xác định]
**Lý do:** [Giải thích ngắn]

### Gate Check
- **Gate A (EMA 200):** [Pass/Fail] — Giá [trên/dưới] EMA 200 ([giá] vs [EMA])
- **Gate B (MACD):** [Pass/Fail] — MACD [cắt lên/cắt xuống/chưa giao cắt], Histogram [xanh/đỏ/đang chuyển]
- **Gate C (Parabolic SAR):** [Pass/Fail/Pending] — SAR [dưới/trên] nến tại [giá trị SAR]

### Kế Hoạch Giao Dịch
*(Chỉ điền khi trạng thái = Valid Trade)*
- **Entry:** [Giá]
- **Stop-Loss:** [Giá] (vị trí Parabolic SAR)
- **Take-Profit:** [Giá] (R:R 1:1)
- **Khoảng cách SL:** [số pip/điểm]
- **R:R:** 1:1

### Cảnh Báo
- [Ví dụ: SAR quá xa → SL lớn, Sideway gần EMA 200, Volume thấp, ...]

### Điều Kiện Tiếp Theo
- [Điều kiện cần xảy ra để trạng thái thay đổi, hoặc "Không có — đã sẵn sàng vào lệnh"]
```

## Cleanup

- `chart_manage_indicator` với action `"remove"` — Xóa các chỉ báo đã thêm ở Step 1.
- `draw_remove_one` — Xóa các drawing tạm đã vẽ. Không dùng `draw_clear`.
