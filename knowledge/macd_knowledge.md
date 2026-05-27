# MACD — Hiểu Biết Toàn Diện & Chiến Thuật Giao Dịch Hiệu Quả

> [!WARNING]
> **This is background knowledge, NOT trading instructions.** This file explains general MACD theory and common strategies. When operating under the `macd-trading` skill, the SKILL.md rules override everything here. Specifically: crossover alone is NEVER a valid entry under the skill — divergence or Zero Line Rejection is required. Do not use strategies from this file as entry rules without passing the Divergence Gate or ZLR Gate defined in SKILL.md.

---

## 1. MACD Là Gì?

**MACD (Moving Average Convergence Divergence)** — Đường trung bình hội tụ phân kỳ — là một chỉ báo **momentum theo xu hướng** được Gerald Appel phát triển vào cuối thập niên 1970. MACD đo lường mối quan hệ giữa hai đường trung bình động lũy thừa (EMA) của giá, giúp trader nhận diện:

- **Hướng xu hướng** (trend direction)
- **Sức mạnh xu hướng** (trend strength)
- **Điểm đảo chiều tiềm năng** (potential reversals)
- **Động lượng** (momentum)

> [!NOTE]
> MACD thuộc nhóm **lagging indicator** (chỉ báo trễ) vì toàn bộ thành phần đều tính từ dữ liệu giá quá khứ (EMA). Tuy nhiên, **histogram** cung cấp tín hiệu **cảnh báo sớm (early warning)** — nó phản ánh sự thay đổi tốc độ hội tụ/phân kỳ giữa hai đường EMA, cho phép trader nhận ra momentum đang suy yếu *trước khi* crossover xảy ra. Đây không phải "leading" theo nghĩa tuyệt đối, mà là "sớm hơn" so với các tín hiệu khác của chính MACD.

---

## 2. Cấu Tạo & Công Thức

### 2.1 Ba thành phần chính

| Thành phần | Công thức | Ý nghĩa |
|---|---|---|
| **MACD Line** | `EMA(12) − EMA(26)` | Đo khoảng cách giữa EMA nhanh và EMA chậm |
| **Signal Line** | `EMA(9) của MACD Line` | Đường tín hiệu — làm mượt MACD Line |
| **Histogram** | `MACD Line − Signal Line` | Trực quan hóa khoảng cách giữa hai đường |

### 2.2 Tham số mặc định: `(12, 26, 9)`

- **12**: Chu kỳ EMA nhanh (fast EMA) — ≈ 2.5 tuần giao dịch, phản ứng nhanh với giá
- **26**: Chu kỳ EMA chậm (slow EMA) — ≈ 5 tuần giao dịch, đại diện xu hướng trung hạn
- **9**: Chu kỳ EMA của Signal Line — ≈ gần 2 tuần, làm mượt MACD

> [!NOTE]
> **Lịch sử tham số:** Gerald Appel phát triển MACD cuối thập niên 1970 trên thị trường chứng khoán Mỹ (NYSE, 5 ngày/tuần). Bộ (12, 26, 9) được Appel lựa chọn dựa trên sự kết hợp giữa **trực giác về chu kỳ thị trường** và **kiểm nghiệm thực tế (empirical testing)** trên nhiều bộ tham số khác nhau. Lưu ý: 26 ngày giao dịch ≈ 5 tuần (không phải "1 tháng" như nhiều nguồn ghi sai — 1 tháng thực tế chỉ có ~21-22 ngày giao dịch). Ngày nay, bộ (12, 26, 9) vẫn hiệu quả trên hầu hết thị trường nhờ tính **tự hoàn thành (self-fulfilling)** — đông đảo trader dùng cùng tham số tạo ra các vùng phản ứng chung. Với thị trường 24/7 như Crypto, một số trader điều chỉnh nhẹ (ví dụ `10, 21, 9`) để phù hợp hơn.

### 2.3 Cách tính chi tiết

```
Bước 1: EMA_fast = EMA(Close, 12)
Bước 2: EMA_slow = EMA(Close, 26)
Bước 3: MACD_Line = EMA_fast − EMA_slow
Bước 4: Signal_Line = EMA(MACD_Line, 9)
Bước 5: Histogram = MACD_Line − Signal_Line
```

> [!TIP]
> **Tùy chỉnh tham số theo trading style:**
> - Scalping/Intraday: `(5, 13, 1)` hoặc `(8, 17, 9)` — phản ứng nhanh hơn
> - Swing trading: `(12, 26, 9)` — mặc định, cân bằng
> - Position trading: `(19, 39, 9)` hoặc `(24, 52, 9)` — lọc nhiễu tốt hơn

### 2.4 Tùy chỉnh tham số theo loại tài sản

**Crypto (24/7):** `(10, 21, 9)` phù hợp — thị trường liên tục, biến động cao, không có gap qua đêm. Tham số nhanh bắt momentum tốt.

**Cổ phiếu:** Có phiên giao dịch cố định, gap qua đêm, chịu ảnh hưởng tin tức/earnings. `10/21/9` dùng được với mã liquid/momentum, nhưng dễ nhiễu ở mã chậm hoặc sideway.

| Loại cổ phiếu | MACD phù hợp | Ghi chú |
|---|---|---|
| Large-cap momentum (AAPL, NVDA, TSLA) | `(10, 21, 9)` | Thanh khoản cao, trend rõ |
| Cổ phiếu tăng trưởng biến động mạnh | `(10, 21, 9)` | Phản ứng nhanh phù hợp |
| Cổ phiếu phòng thủ / dividend (KO, JNJ) | `(12, 26, 9)` hoặc `(21, 55, 9)` | Di chuyển chậm, cần lọc nhiễu |
| Penny/small-cap thanh khoản thấp | `(12, 26, 9)` + lọc volume rất chặt | Nhiễu cao, false signal nhiều |

**Theo timeframe (cổ phiếu):**

| Timeframe | Khuyến nghị | Lý do |
|---|---|---|
| ≤ 1H (intraday/momentum) | `(10, 21, 9)` cho mã liquid | Bắt momentum ngắn hạn, tránh vùng ADX < 20 |
| 4H | `(12, 26, 9)` ổn định hơn | Gap qua đêm ít ảnh hưởng, trend rõ hơn |
| D (swing trading) | `(12, 26, 9)` trước, so sánh `(10, 21, 9)` | Mặc định cân bằng, đáng tin trên đa số mã |

> [!IMPORTANT]
> **Bộ lọc bổ sung cho cổ phiếu:**
> - **Volume filter**: Chỉ trade mã có volume trung bình > 500K/ngày
> - **Relative strength**: So sánh với SPY/QQQ — chỉ long cổ phiếu mạnh hơn benchmark, short cổ phiếu yếu hơn
> - **Earnings**: Tránh mở vị thế mới 2-3 ngày trước báo cáo earnings (gap risk)
> - **EMA 50/200**: Bắt buộc dùng làm trend filter (đã có trong SKILL.md Step 3d)

## 3. Cách Đọc Tín Hiệu MACD

### 3.1 Đường Zero Line (Đường 0)

Zero Line là **trục trung tâm** của MACD, đại diện cho điểm mà EMA(12) = EMA(26):

| Vị trí MACD | Ý nghĩa |
|---|---|
| MACD > 0 | EMA nhanh **trên** EMA chậm → xu hướng **tăng** |
| MACD < 0 | EMA nhanh **dưới** EMA chậm → xu hướng **giảm** |
| MACD cắt lên 0 | Chuyển từ bearish sang bullish |
| MACD cắt xuống 0 | Chuyển từ bullish sang bearish |

> [!WARNING]
> **Choppy Market Signal:** Khi cả MACD Line và Signal Line **xoắn vào nhau và dao động sát Zero Line** trong thời gian dài, đó là dấu hiệu thị trường **sideway biên độ hẹp (choppy)**. Trong trạng thái này, mọi tín hiệu crossover đều **không đáng tin cậy** — tạo ra hàng loạt false signals liên tiếp. Hãy đứng ngoài hoặc dùng ADX < 20 để xác nhận thị trường không có xu hướng.

### 3.2 Crossover (Giao cắt)

#### Bullish Crossover (Tín hiệu mua)
- MACD Line **cắt lên trên** Signal Line
- Histogram chuyển từ âm sang dương
- **Mạnh nhất** khi xảy ra dưới Zero Line (vùng MACD thấp tương đối)

#### Bearish Crossover (Tín hiệu bán)
- MACD Line **cắt xuống dưới** Signal Line
- Histogram chuyển từ dương sang âm
- **Mạnh nhất** khi xảy ra trên Zero Line (vùng MACD cao tương đối)

### 3.3 Histogram — "Nhịp thở" của momentum

Histogram là **công cụ mạnh nhất** trong MACD nhưng thường bị bỏ qua:

| Trạng thái Histogram | Ý nghĩa |
|---|---|
| Histogram tăng (cột xanh cao dần) | Momentum tăng đang **mạnh lên** |
| Histogram giảm (cột xanh thấp dần) | Momentum tăng đang **suy yếu** |
| Histogram giảm (cột đỏ dài dần) | Momentum giảm đang **mạnh lên** |
| Histogram tăng (cột đỏ ngắn dần) | Momentum giảm đang **suy yếu** |

> [!IMPORTANT]
> **Quy tắc vàng:** Histogram đổi hướng (từ tăng sang giảm hoặc ngược lại) **TRƯỚC** khi crossover xảy ra. Đây là tín hiệu sớm nhất mà MACD cung cấp.

### 3.4 Divergence (Phân kỳ)

Divergence là tín hiệu **có giá trị nhất** của MACD, báo hiệu **momentum** của xu hướng hiện tại đang suy yếu:

#### Bullish Divergence (Phân kỳ tăng)
- **Giá**: Tạo đáy thấp hơn (lower low)
- **MACD**: Tạo đáy cao hơn (higher low)
- **Ý nghĩa**: Lực bán đang cạn kiệt → tiềm năng đảo chiều tăng

#### Bearish Divergence (Phân kỳ giảm)
- **Giá**: Tạo đỉnh cao hơn (higher high)
- **MACD**: Tạo đỉnh thấp hơn (lower high)
- **Ý nghĩa**: Lực mua đang suy yếu → tiềm năng đảo chiều giảm

#### Hidden Divergence (Phân kỳ ẩn) — Tín hiệu tiếp diễn xu hướng

| Loại | Giá | MACD | Ý nghĩa |
|---|---|---|---|
| Hidden Bullish | Higher low | Lower low | Xu hướng tăng **tiếp diễn** |
| Hidden Bearish | Lower high | Higher high | Xu hướng giảm **tiếp diễn** |

> [!WARNING]
> **Divergence ≠ Đảo chiều chắc chắn.** Divergence chỉ cho thấy **momentum đang giảm dần**, KHÔNG đảm bảo giá sẽ đảo chiều. Sau divergence, có 3 kịch bản có thể xảy ra:
> 1. **Đảo chiều (Reversal)** — giá quay đầu hoàn toàn
> 2. **Tích lũy (Consolidation)** — giá đi ngang trước khi chọn hướng
> 3. **Tiếp tục xu hướng cũ** — với biên độ và tốc độ chậm hơn
>
> Luôn chờ **confirmation** từ price action hoặc chỉ báo khác trước khi vào lệnh. Divergence trên timeframe lớn (4H, D) đáng tin hơn đáng kể so với timeframe nhỏ.

---

## 4. Chiến Thuật Giao Dịch MACD Hiệu Quả

### 4.1 Chiến thuật #1: MACD Crossover + Trend Filter

> [!CAUTION]
> **Under the `macd-trading` skill, crossover + trend filter alone is NOT sufficient for entry.** Divergence (Step 4) or Zero Line Rejection must be confirmed first. This section is background theory only.

**Nguyên tắc:** Chỉ giao dịch crossover **theo hướng xu hướng chính**.

#### Setup:
1. Xác định xu hướng bằng **EMA 200** hoặc **EMA 50**
2. Chỉ **mua** khi giá trên EMA 200 VÀ MACD bullish crossover
3. Chỉ **bán** khi giá dưới EMA 200 VÀ MACD bearish crossover

*(Quy tắc vào lệnh cụ thể không trình bày ở đây — xem SKILL.md cho entry framework chính thức.)*

#### Ưu điểm:
- Lọc được phần lớn tín hiệu giả trong sideway
- Tỷ lệ win rate cao hơn crossover đơn thuần

#### Nhược điểm:
- Bỏ lỡ các đảo chiều lớn (vì chờ EMA 200 xác nhận)

---

### 4.2 Chiến thuật #2: MACD Histogram Reversal

**Nguyên tắc:** Sử dụng histogram để bắt điểm **momentum đảo chiều sớm**.

#### Setup:
1. Tìm histogram đạt **extreme** (cực đại hoặc cực tiểu)
2. Chờ histogram bắt đầu **co lại** (shrinking)
3. Vào lệnh khi histogram đổi chiều rõ ràng

*(Quy tắc vào lệnh cụ thể không trình bày ở đây — xem SKILL.md cho entry framework chính thức.)*

> [!TIP]
> Chiến thuật này vào lệnh **sớm hơn** crossover 3-5 nến, cho entry tốt hơn nhưng rủi ro cao hơn. Kết hợp với **volume tăng** để tăng độ tin cậy. Setup mạnh nhất là khi đồng thời xuất hiện **Histogram Divergence** (giá tạo đáy mới sâu hơn nhưng cột đỏ histogram lại cạn hơn nhịp trước) — đây là khái niệm Alexander Elder nhấn mạnh là tín hiệu mạnh nhất trong cả MACD.

---

### 4.3 Chiến thuật #3: MACD Divergence Trading

**Nguyên tắc:** Giao dịch dựa trên phân kỳ giữa giá và MACD.

#### Setup Bullish Divergence:
```
Bước 1: Xác định downtrend rõ ràng
Bước 2: Giá tạo lower low
Bước 3: MACD tạo higher low (phân kỳ tăng)
Bước 4: Chờ CONFIRMATION:
  - Bullish crossover trên MACD
  - HOẶC break trendline giảm trên giá
  - HOẶC nến đảo chiều (hammer, morning star)
Bước 5: Entry sau confirmation
Stop-loss: Dưới lower low + khoảng đệm (1 ATR hoặc 1-2% giá) để tránh stop-hunt
Take-profit: Resistance gần nhất hoặc R:R 1:2.5
```

#### Tăng độ tin cậy:
- Divergence trên **timeframe lớn** (4H, D) đáng tin hơn 1H, 15m
- **Double divergence** (2 lần divergence liên tiếp) cực kỳ mạnh
- Divergence tại **vùng support/resistance** quan trọng → tín hiệu mạnh nhất
- Kiểm tra divergence trên **cả MACD Line lẫn Histogram** — histogram divergence thường xuất hiện **sớm hơn vài nến** so với MACD Line, cho điểm entry tối ưu hơn

---

### 4.4 Chiến thuật #4: Zero Line Rejection

**Nguyên tắc:** Sử dụng Zero Line như vùng **support/resistance** cho MACD.

#### Setup (Uptrend):
```
Điều kiện:
  ✅ MACD đang trong vùng dương (uptrend confirmed)
  ✅ MACD pullback về gần Zero Line nhưng KHÔNG cắt xuống
  ✅ MACD bật lên từ vùng Zero Line
  ✅ Histogram chuyển từ giảm sang tăng

Entry: Khi MACD bật khỏi Zero Line + bullish crossover
Stop-loss: Dưới swing low tương ứng
Take-profit: Khi MACD đạt mức cao tương đương đỉnh trước
```

#### Ý nghĩa:
- Zero Line rejection cho thấy xu hướng chính **vẫn còn mạnh**
- Pullback chỉ là điều chỉnh tạm thời → cơ hội mua giá tốt trong uptrend

---

### 4.5 Chiến thuật #5: Multi-Timeframe MACD

**Nguyên tắc:** Kết hợp MACD từ nhiều khung thời gian để lọc tín hiệu.

#### Setup:
```
Timeframe cao (D hoặc 4H): Xác định xu hướng chính
  → MACD > 0 = Bullish bias
  → MACD < 0 = Bearish bias

Timeframe thấp (1H hoặc 15m): Tìm điểm entry
  → Bullish crossover (khi bias cao là bullish)
  → Bearish crossover (khi bias cao là bearish)
```

#### Quy tắc:
1. **Chỉ giao dịch theo hướng timeframe cao**
2. Timeframe thấp chỉ dùng để **tinh chỉnh entry**
3. Nếu hai timeframe **mâu thuẫn** → đứng ngoài

> [!TIP]
> Tỷ lệ timeframe lý tưởng: **4:1 đến 6:1**
> - D → 4H hoặc 1H
> - 4H → 1H hoặc 15m
> - 1H → 15m hoặc 5m

---

## 5. Kết Hợp MACD Với Các Chỉ Báo Khác

> [!CAUTION]
> **Background theory only.** The combination strategies below describe general MACD usage patterns. Under the `macd-trading` skill, none of these combinations alone qualify as an entry — all entries must pass the Divergence Gate or ZLR Gate defined in SKILL.md.

### 5.1 MACD + RSI

> [!CAUTION]
> **Under the `macd-trading` skill, "Strong Buy" requires divergence confirmation, not just crossover below zero.** The table below is simplified theory — crossover entries alone do not qualify.

| Tín hiệu | MACD | RSI | Ý nghĩa (background only) |
|---|---|---|---|
| Strong Buy | Bullish crossover dưới 0 | RSI < 30 (oversold) | Momentum mua mạnh nhất |
| Buy | Bullish crossover | RSI tăng từ 30-50 | Momentum mua |
| Strong Sell | Bearish crossover trên 0 | RSI > 70 (overbought) | Momentum bán mạnh nhất |
| Sell | Bearish crossover | RSI giảm từ 70-50 | Momentum bán |
| **MACD-RSI Divergence Confluence** | MACD divergence | RSI divergence | Tín hiệu **cực mạnh** |

### 5.2 MACD + Bollinger Bands

- **Bullish context**: MACD bullish crossover + giá chạm/phá Bollinger Band dưới
- **Bearish context**: MACD bearish crossover + giá chạm/phá Bollinger Band trên
- **Squeeze**: Bollinger Bands co hẹp + MACD histogram gần zero → chuẩn bị breakout lớn

### 5.3 MACD + Volume

- Crossover + **volume tăng** = tín hiệu mạnh, đáng tin
- Crossover + **volume giảm** = tín hiệu yếu, có thể là false signal
- Divergence + **volume spike** = xác nhận đảo chiều mạnh

### 5.4 MACD + Support/Resistance

- MACD crossover tại vùng **S/R quan trọng** → tín hiệu có giá trị cao
- Divergence tại vùng S/R → tín hiệu đảo chiều **đáng tin nhất**
- Breakout S/R + MACD momentum tăng → xác nhận breakout thật

---

## 6. Sai Lầm Phổ Biến Khi Sử Dụng MACD

> [!CAUTION]
> ### Những sai lầm cần tránh:

### ❌ Sai lầm #1: Giao dịch crossover trong sideway
- MACD tạo ra **rất nhiều tín hiệu giả** khi thị trường đi ngang
- **Giải pháp**: Kết hợp ADX > 25 để xác nhận có xu hướng trước khi trade crossover

### ❌ Sai lầm #2: Dùng MACD như chỉ báo overbought/oversold
- MACD **KHÔNG có vùng cố định** cho overbought/oversold (khác RSI)
- MACD có thể tiếp tục tăng/giảm mạnh mà không giới hạn
- **Giải pháp**: So sánh MACD hiện tại với **lịch sử của chính nó** trên cùng asset

### ❌ Sai lầm #3: Bỏ qua xu hướng chính
- Mua khi bullish crossover nhưng xu hướng chính vẫn giảm → rủi ro cao
- **Giải pháp**: Luôn xác định trend trên timeframe cao hơn trước

### ❌ Sai lầm #4: Vào lệnh ngay khi thấy divergence
- Divergence có thể kéo dài nhiều nến trước khi giá thực sự đảo chiều
- **Giải pháp**: Luôn chờ confirmation từ price action

### ❌ Sai lầm #5: Dùng cùng tham số cho mọi asset
- Crypto volatile hơn stock → cần tham số khác
- **Giải pháp**: Backtest tham số MACD trên từng asset cụ thể

---

## 7. Quản Lý Rủi Ro Khi Giao Dịch Với MACD

### 7.1 Position Sizing

```
Rủi ro tối đa mỗi lệnh: 1-2% tài khoản
Số lệnh mở đồng thời: Tối đa 3-5
Tổng rủi ro danh mục: Không quá 6-10%
```

### 7.2 Stop-Loss

| Chiến thuật | Vị trí Stop-Loss |
|---|---|
| Crossover | Dưới/trên swing low/high gần nhất |
| Divergence | Dưới/trên extreme point của divergence |
| Histogram reversal | Dưới/trên nến tín hiệu |
| Zero Line rejection | Dưới/trên vùng Zero Line bounce |

### 7.3 Take-Profit

- **R:R tối thiểu 1:2** — Luôn đảm bảo reward gấp đôi risk
- **Trailing stop** — Di chuyển SL theo xu hướng khi lệnh có lãi
- **Partial close** — Chốt 50% tại R:R 1:1, để 50% chạy với trailing stop
- **MACD exit signal** — Đóng lệnh khi MACD cho tín hiệu ngược chiều

---

## 8. Checklist Giao Dịch MACD

Trước mỗi lệnh, kiểm tra:

```
□ Xu hướng chính (timeframe cao) đã xác định?
□ MACD tín hiệu cùng hướng xu hướng chính?
□ Có confirmation từ price action?
□ Volume có hỗ trợ tín hiệu?
□ Không giao dịch trong sideway (ADX > 25)?
□ Risk:Reward tối thiểu 1:2?
□ Position size ≤ 2% tài khoản?
□ Stop-loss đã đặt trước khi vào lệnh?
□ Không có tin tức quan trọng sắp ra?
□ Tâm lý ổn định, không revenge trade?
```

---

## 9. Tóm Tắt

| Khía cạnh | Tóm tắt |
|---|---|
| **Bản chất** | Chỉ báo momentum + trend following |
| **Tín hiệu mạnh nhất** | Divergence tại vùng S/R quan trọng |
| **Tín hiệu phổ biến nhất** | Crossover (nhưng nhiều false signal) |
| **Tín hiệu sớm nhất** | Histogram reversal |
| **Kết hợp tốt nhất** | RSI, Volume, Bollinger Bands, S/R |
| **Điểm yếu lớn nhất** | Lagging + false signals trong sideway |
| **Timeframe tốt nhất** | 4H, D (swing); 15m-1H kết hợp multi-TF |
| **Tham số mặc định** | (12, 26, 9) — phù hợp đa số trường hợp |

> [!IMPORTANT]
> **MACD là công cụ, không phải hệ thống hoàn chỉnh.** Không có chỉ báo nào đúng 100%. Kết hợp MACD với price action, volume, quản lý rủi ro, và kỷ luật giao dịch mới tạo nên lợi thế thực sự trên thị trường.
