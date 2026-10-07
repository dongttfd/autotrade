# Chiến Lược Parabolic SAR + MACD + EMA 200

## Tổng Quan

Chiến lược kết hợp 3 chỉ báo: EMA 200, Parabolic SAR và MACD. Tất cả sử dụng cài đặt mặc định.

- **EMA 200**: Xác định xu hướng dài hạn (bộ lọc hướng giao dịch).
- **Parabolic SAR**: Xác nhận xu hướng ngắn hạn và làm mốc đặt stop-loss.
- **MACD**: Tín hiệu vào lệnh chính (giao cắt đường MACD và đường tín hiệu).

---

## Vai Trò Từng Chỉ Báo

### EMA 200 — Bộ Lọc Xu Hướng

- Giá **trên** EMA 200 → chỉ tìm lệnh **MUA**.
- Giá **dưới** EMA 200 → chỉ tìm lệnh **BÁN**.

### MACD — Tín Hiệu Vào Lệnh

- Cài đặt: mặc định (12, 26, 9).
- Gồm 3 thành phần:
  - **Đường MACD** (xanh dương): phản ứng nhanh với giá.
  - **Đường tín hiệu** (cam): phản ứng chậm, dùng lọc nhiễu.
  - **Histogram**: thể hiện khoảng cách giữa 2 đường. Xanh lá = MACD trên tín hiệu, đỏ = MACD dưới tín hiệu.
- **Mẹo**: Khi 2 đường quá gần nhau khó phân biệt, nhìn màu histogram để xác định hướng giao cắt.

### Parabolic SAR — Xác Nhận Xu Hướng & Stop-Loss

- Cài đặt: mặc định.
- Chấm **dưới** nến → xu hướng tăng.
- Chấm **trên** nến → xu hướng giảm.
- **Lưu ý**: Parabolic SAR hoạt động kém khi thị trường đi ngang (sideway), tạo nhiều tín hiệu sai. Vì vậy không dùng đơn lẻ mà chỉ dùng để xác nhận.

---

## Điều Kiện Vào Lệnh

### Lệnh MUA

Tất cả các điều kiện sau phải thỏa đồng thời:

1. Giá nằm **trên** EMA 200.
2. Đường MACD **cắt lên trên** đường tín hiệu.
3. Parabolic SAR nằm **dưới** nến.

> Nếu khi MACD giao cắt mà Parabolic SAR vẫn nằm trên nến → **chờ** cho đến khi chấm SAR chuyển xuống dưới nến, đồng thời MACD vẫn duy trì giao cắt lên.

### Lệnh BÁN

Tất cả các điều kiện sau phải thỏa đồng thời:

1. Giá nằm **dưới** EMA 200.
2. Đường MACD **cắt xuống dưới** đường tín hiệu.
3. Parabolic SAR nằm **trên** nến.

---

## Quản Lý Lệnh

| Hạng mục | Quy tắc |
|---|---|
| **Stop-loss** | Đặt tại vị trí chấm Parabolic SAR tại thời điểm vào lệnh |
| **Take-profit** | Tỷ lệ rủi ro:lợi nhuận = 1:1 (khoảng cách TP = khoảng cách SL) |

---

## Tóm Tắt Quy Trình

```
1. Kiểm tra vị trí giá so với EMA 200 → xác định hướng giao dịch
2. Chờ MACD giao cắt theo đúng hướng
3. Xác nhận Parabolic SAR đúng vị trí (dưới nến = mua, trên nến = bán)
4. Vào lệnh khi cả 3 điều kiện thỏa mãn
5. Stop-loss = vị trí Parabolic SAR
6. Take-profit = tỷ lệ 1:1
```