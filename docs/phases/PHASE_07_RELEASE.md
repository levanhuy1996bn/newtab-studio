# Phase 7 · Theme Management, Optimization & Publishing

Phụ thuộc Phase 1–6 và mô hình dữ liệu đã ổn định.

1. Xây My Themes, nhiều workspace, lưu nháp tự động, nhân bản, settings và hướng dẫn lần đầu. Liên kết ThemeDocument, preset, asset và workspace bằng ID.
2. Tạo export theme với asset được tham chiếu. Thêm backup gồm dữ liệu cá nhân và thiết lập. Xác thực import và migration, cho xem tóm tắt, hỗ trợ hợp nhất hoặc restore toàn bộ.
3. Triển khai restore có staging, dữ liệu cũ sử dụng được khi thất bại, và xác minh khứ hồi. Kiểm tra tham chiếu bị thiếu và ID trùng.
4. Hoàn thiện locale, bàn phím, trợ năng, hiệu năng, unit/integration tests. Đo cold start và thời gian load ảnh trên máy mục tiêu.
5. Chuẩn bị chính sách riêng tư, danh mục giấy phép, screenshot và ZIP. Thực hiện checklist trong PUBLISHING.md.

Nghiệm thu bằng cài sạch, nâng cấp, nhập/xuất và restore giữa hai profile, chạy offline, rà dữ liệu có ghi đồng bộ ngoài thiết bị và xác minh artifact phát hành.

## Tinh chỉnh New Tab trước khi phát hành · 0.6.1

- Dành khung chính cho wallpaper, đặt điều hướng trong thanh bên trái và mở công cụ tùy chỉnh theo yêu cầu. Widget Trong mờ dùng nền bán trong suốt, giảm làm mờ khi bật Chế độ hiệu năng.
- Tự sắp xếp phân trang theo chiều rộng và chiều cao. Canvas tự do dùng vị trí thiết kế trên desktop, và dùng thẻ ở chiều rộng tối đa 720 px như trước. Có thể cuộn riêng bên trong widget có danh sách dài.
- Background Studio cho đặt lại điểm cắt giữa và chọn Vừa khung. Ảnh nhỏ có thể giữ kích thước gốc khi vừa khung. Tài nguyên mới **Đèn làng sau mưa** thuộc Anime và Hoài niệm.
