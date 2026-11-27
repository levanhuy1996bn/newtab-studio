# Vấn đề và giới hạn đã biết

| Mục | Trạng thái và ảnh hưởng |
| --- | --- |
| Git | Dự án dùng nhánh `develop`. Khi bàn giao, so sánh thay đổi với [HANDOVER.md](HANDOVER.md). |
| Dữ liệu Chrome | Dữ liệu IndexedDB và tùy chọn gắn với hồ sơ Chrome hiện tại. Từ 1.1.0, dùng Nhập và sao lưu để chuyển dữ liệu. Tệp chuyển tối đa 160 MiB. |
| Khoảng trống ngoài vùng kéo widget | Đã xử lý ở 1.1.0. Vùng kéo phủ hết phần nội dung New Tab bên cạnh thanh công cụ. |
| Nút chuyển châm ngôn nhảy theo độ dài câu | Đã xử lý ở 1.1.0. Hai nút nằm ở đáy widget và phần nội dung dài cuộn riêng. |
| Bản nháp | Các trình chỉnh nền, chữ, canvas và hiệu ứng giữ bản nháp cục bộ. Lịch sử undo/redo vẫn thuộc phiên hiện tại. |
| Dữ liệu widget | Ghi chú được lưu bằng nút **Lưu**. Hai lần lưu cùng ghi chú dùng nội dung lần ghi sau. Sau khi xóa một lớp, bản ghi cá nhân của ID đó được giữ cục bộ để hỗ trợ vòng đời thiết kế. |
| Bộ lọc Thiên nhiên | Đã sửa từ 0.6.7. Ảnh phong cảnh anime được gắn thêm nhãn Thiên nhiên và mục này tăng từ 2 lên 21 ảnh. |
| Ảnh Doraemon | Bản 1.1.0 có năm ảnh trong nhóm Doraemon. ImageGen chặn hai ảnh nguồn còn lại, gồm hòa nhạc ngoài vũ trụ và ngắm trăng trên mái nhà. |
| Biển tên Học viện trên wallpaper | Đã khôi phục cả chữ VWA xanh và hàng chữ đỏ trên hai cạnh mái trong ảnh Đại lộ dưới mây nhạt và ảnh thu nhỏ của bản 1.1.0. |
| Biểu tượng Chrome hiển thị xám | Đã xác minh logo màu trên nhãn NewTab Studio và nút cạnh thanh địa chỉ sau khi bật và nạp lại tiện ích 1.1.0 trong hồ sơ Chrome người dùng. |
| Đồng hồ kim có thanh cuộn | Đã xử lý ở 1.1.0. Mặt đồng hồ vừa với khung và tắt cuộn ngang/dọc ở Canvas tự do và chế độ thẻ hẹp. |
| Weather | Widget thời tiết là phần tùy chọn và hiện để lại cho đánh giá nguồn, điều khoản và quyền riêng tư. [Đặc tả Phase 5](docs/phases/PHASE_05_WIDGETS.md) |
| Phạm vi QA | Smoke test Phase 1–5 đã chạy trên Chrome headless với hồ sơ tạm. Phạm vi kiểm tra và kết quả theo từng mốc nằm trong PROGRESS.md. |

Ghi lỗi mới kèm cách tái hiện, ảnh hưởng và trạng thái sửa. [Tiến độ](PROGRESS.md) · [Bàn giao](HANDOVER.md)
