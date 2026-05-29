# Giải nghĩa thuật ngữ MACD

| Thuật ngữ | Nghĩa tiếng Việt | Giải thích ngắn |
|---|---|---|
| MACD (Moving Average Convergence Divergence) | Đường trung bình hội tụ phân kỳ | Chỉ báo momentum + trend following, đo mối quan hệ giữa hai EMA của giá. Phát triển bởi Gerald Appel cuối thập niên 1970. |
| MACD Line | Đường MACD chính | `EMA(12) − EMA(26)`. Đo khoảng cách giữa EMA nhanh và EMA chậm. Khi dương → EMA nhanh trên EMA chậm → xu hướng tăng. |
| Signal Line | Đường tín hiệu | `EMA(9) của MACD Line`. Làm mượt MACD Line, dùng để phát hiện crossover. |
| Histogram | Biểu đồ cột | `MACD Line − Signal Line`. Trực quan hóa khoảng cách giữa hai đường. Đổi hướng trước crossover 3-5 nến — tín hiệu sớm nhất của MACD. |
| Zero Line | Đường 0 / Trục trung tâm | Mốc mà EMA(12) = EMA(26). MACD > 0 = xu hướng tăng, MACD < 0 = xu hướng giảm. |
| Bullish Crossover | Cắt lên — tín hiệu mua | MACD Line cắt lên trên Signal Line. Histogram chuyển từ âm sang dương. Mạnh nhất khi xảy ra dưới Zero Line. |
| Bearish Crossover | Cắt xuống — tín hiệu bán | MACD Line cắt xuống dưới Signal Line. Histogram chuyển từ dương sang âm. Mạnh nhất khi xảy ra trên Zero Line. |
| Regular Bullish Divergence | Phân kỳ tăng thường | Giá tạo lower low nhưng MACD tạo higher low. Lực bán đang cạn kiệt → tiềm năng đảo chiều tăng. |
| Regular Bearish Divergence | Phân kỳ giảm thường | Giá tạo higher high nhưng MACD tạo lower high. Lực mua đang suy yếu → tiềm năng đảo chiều giảm. |
| Hidden Bullish Divergence | Phân kỳ ẩn tăng | Giá tạo higher low nhưng MACD tạo lower low. Xu hướng tăng tiếp diễn. |
| Hidden Bearish Divergence | Phân kỳ ẩn giảm | Giá tạo lower high nhưng MACD tạo higher high. Xu hướng giảm tiếp diễn. |
| Double Divergence | Phân kỳ kép | Hai lần divergence liên tiếp. Tín hiệu cực mạnh, đặc biệt tại vùng S/R. |
| Histogram Reversal | Histogram đổi hướng | Histogram chuyển từ tăng sang giảm (hoặc ngược lại). Là tín hiệu sớm nhất MACD cung cấp, xuất hiện trước crossover. |
| Zero Line Rejection | Bật từ Zero Line | MACD pullback về gần Zero Line nhưng không cắt qua, rồi bật lại theo hướng cũ. Cho thấy xu hướng chính vẫn mạnh. |
| Histogram Expanding | Histogram mở rộng | Các cột histogram ngày càng dài hơn → momentum đang tăng mạnh theo hướng hiện tại. |
| Histogram Contracting | Histogram co lại | Các cột histogram ngày càng ngắn hơn → momentum đang suy yếu, cảnh báo sớm trước khi crossover xảy ra. |
| Confluence | Hội tụ tín hiệu | Nhiều chỉ báo hoặc yếu tố phân tích cùng xác nhận một hướng giao dịch. Càng nhiều confluence → tín hiệu càng đáng tin. |
| EMA (Exponential Moving Average) | Đường trung bình động lũy thừa | Trung bình giá có trọng số, dữ liệu gần nhất được ưu tiên hơn. EMA 200 dùng làm trend filter chính. |
| EMA 200 | EMA chu kỳ 200 | Đường trung bình dài hạn dùng để xác định xu hướng chính. Giá > EMA 200 = bullish bias, giá < EMA 200 = bearish bias. |
| RSI (Relative Strength Index) | Chỉ số sức mạnh tương đối | Chỉ báo momentum có biên (0-100). RSI < 30 = oversold, RSI > 70 = overbought. Kết hợp với MACD để tăng confluence. |
| MACD-RSI Divergence Confluence | Phân kỳ hội tụ MACD + RSI | Khi cả MACD và RSI đều cho divergence cùng hướng. Tín hiệu có conviction cao nhất. Khác với Double Divergence (2 lần divergence liên tiếp trên cùng indicator). |
| R:R (Risk:Reward) | Tỷ lệ rủi ro / lợi nhuận | Tỷ lệ giữa khoảng cách đến stop-loss (risk) và khoảng cách đến take-profit (reward). Tối thiểu 1:2 cho mỗi lệnh. |
| ATR (Average True Range) | Biên độ dao động trung bình | Đo mức biến động giá trung bình, dùng để tính buffer cho stop-loss nhằm tránh bị stop-hunt. |
| Trailing Stop | Dừng lỗ di động | Stop-loss được di chuyển theo hướng có lợi khi lệnh đang lãi, khóa lợi nhuận trong khi vẫn cho giá chạy. |
| Partial Close | Chốt lời một phần | Đóng một phần vị thế (thường 50%) tại TP1, giữ phần còn lại chạy với trailing stop. |
| Choppy Market | Thị trường xoắn / sideway | Thị trường không có xu hướng rõ, giá dao động hẹp. MACD tạo nhiều false signal trong trạng thái này. |
| ADX (Average Directional Index) | Chỉ số hướng trung bình | Đo sức mạnh xu hướng. ADX > 25 = có xu hướng (crossover đáng tin), ADX < 20 = sideway (tránh giao dịch crossover). |
| False Signal | Tín hiệu giả | Tín hiệu MACD không dẫn đến di chuyển giá có ý nghĩa. Phổ biến nhất trong sideway. |
| Confirmation | Xác nhận | Bằng chứng bổ sung từ price action hoặc chỉ báo khác trước khi vào lệnh. Bắt buộc đối với divergence. |
| Lagging Indicator | Chỉ báo trễ | Chỉ báo tính từ dữ liệu quá khứ, phản ứng chậm hơn giá. MACD là lagging indicator, nhưng histogram cung cấp early warning. |
| Self-fulfilling | Tự hoàn thành | Hiệu ứng khi đông đảo trader dùng cùng tham số (12, 26, 9), tạo vùng phản ứng chung trên thị trường. |
| Multi-Timeframe Analysis | Phân tích đa khung thời gian | Kiểm tra MACD trên timeframe cao để xác định bias, rồi dùng timeframe thấp để tìm entry. Tỷ lệ TF lý tưởng: 4:1 đến 6:1. |
| Stop-Hunt | Quét stop-loss | Giá di chuyển tạm thời qua một mức giá để kích hoạt stop-loss của trader, rồi quay đầu. Buffer 1 ATR trên SL giúp tránh bị quét. |
