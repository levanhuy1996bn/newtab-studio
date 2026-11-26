# Quyết định kỹ thuật

| Phạm vi | Quyết định và lý do |
| --- | --- |
| Đóng gói | React, Vite, JavaScript, Tailwind và Manifest V3. Vite tạo asset với đường dẫn tương đối để `dist/` chạy từ origin extension. Logic, font và tài nguyên đi kèm được đóng gói cục bộ. |
| Phạm vi miễn phí | Phase 1–7 theo hướng local-first, sử dụng ngoại tuyến, có giao diện EN/VI. Cloud, AI và thương mại hóa thuộc lộ trình Phase 8–9. |
| Phân chia lưu trữ | `chrome.storage.local` lưu ngôn ngữ và yêu thích. Bản Vite dùng `localStorage` cho các mục này. IndexedDB lưu theme đang dùng, hình nền, ảnh, chữ và canvas. Lựa chọn Phase 1 vẫn được đọc làm fallback. |
| Tính nhất quán | Repository ghi các phần của theme và lựa chọn đang dùng cùng transaction. Cập nhật nền, chữ hoặc canvas giữ các phần khác. BroadcastChannel báo thay đổi giữa tab sau khi ghi. Asset đang được nền hoặc canvas tham chiếu được bảo vệ khỏi thao tác xóa. |
| Bố cục | `ThemeScene` dùng lại renderer ở New Tab và các trình chỉnh sửa. Khối typography có vị trí trên/dưới đồng hồ. Canvas có mặt phẳng 1.200 × 675, lớp lưu tọa độ thiết kế, co theo viewport. Lịch sử undo/redo thuộc phiên chỉnh sửa. |
| New Tab toàn khung nhìn | Nền nằm dưới thanh điều hướng, chữ và widget, phủ viewport khi mở tab và khi cuộn. Công cụ và preview trong editor giữ khung riêng. Khi áp dụng từ thư viện, mở màn New Tab và phục hồi nền tùy chỉnh của theme đã lưu. |
| Theme ảnh | ID preset cũ vẫn giữ nguyên. Preset có wallpaper đóng gói dùng ảnh thu nhỏ ở gallery và ảnh đầy đủ trong New Tab. Tọa độ lấy nét theo preset giúp cảnh giữ chủ thể khi ảnh được cắt cho màn hình dọc. [Nguồn wallpaper](docs/WALLPAPERS.md) |
| Bộ lọc thư viện | Giữ danh mục chính cho nhãn trên thẻ. Nhãn phụ thể hiện chủ đề ảnh, để một wallpaper có thể xuất hiện trong cả nhóm nội dung và nhóm phong cách. |
| Mẫu gỡ khỏi thư viện | Giữ ID trong bản tra cứu để đọc thiết kế và lịch cũ. Danh mục, tìm kiếm, yêu thích và lựa chọn lịch mới chỉ hiện các mẫu đang được cung cấp. |
| Tương thích | IndexedDB nâng lên v2 để thêm `widgetData`, theme document đọc được các bản v1–v4. Cơ chế nâng phiên bản kho và phiên bản bản ghi được theo dõi riêng. |
| Widget | Theme lưu cấu hình trình bày. Kho riêng lưu Todo, Notes và timer theo ID lớp. Cập nhật Todo đọc trạng thái mới nhất trong transaction, timer lưu mốc đích và dồn thẻ widget sang luồng bên dưới khung nền ở viewport hẹp. |
| Lối tắt | Dùng IndexedDB theo ID widget. Thiết kế cũ dùng liên kết đã lưu trong cấu hình cho tới lần chỉnh trực tiếp đầu tiên. Lịch sử Chrome chỉ được đọc trong chế độ người dùng chọn sau khi cấp quyền và kết quả chỉ giữ trong bộ nhớ. Biểu tượng dùng chữ cái theo tên miền. |
| Tự sắp xếp widget | `canvas.widgetLayout` lưu chế độ và danh sách ID ưu tiên theo theme. CSS cho thẻ xuống hàng trên New Tab. Canvas tự do dùng tọa độ và thứ tự lớp đã lưu. Bản ghi cũ mặc định dùng Canvas tự do. |
| Chỉnh widget trên New Tab | Dùng mặt phẳng và thao tác kéo có sẵn. Mỗi lần lưu áp dụng các thay đổi widget lên canvas mới nhất trong transaction; ẩn/hiện giữ nguyên ID. Mức đậm nền kính mặc định 26%, độc lập với opacity toàn lớp. |
| New Tab tối giản | Thanh trái mở công cụ chỉnh sửa khi cần. Tự sắp xếp và chế độ thẻ ở màn hẹp dùng phân trang để giữ nội dung trong khung nhìn. Chỉnh sửa và Gallery dùng vùng cuộn riêng của từng trang. |
| Khung ảnh | Ảnh cũ mặc định giữ chế độ phủ và vị trí đã lưu. Ảnh mới bắt đầu ở giữa và zoom 100%. Chế độ vừa khung dùng `scale-down` để giữ trọn ảnh và giữ nguyên kích thước ảnh nhỏ. |
| Hiệu ứng | Theme document v5 lưu hiệu ứng nền, chữ và widget. Tab ẩn tạm dừng hoạt ảnh. Giảm chuyển động của hệ thống và Chế độ hiệu năng tắt hiệu ứng trang trí. |
| Lịch theme | Giờ thiết bị xác định khung đang dùng. Khung đầu tiên khớp được ưu tiên. Lựa chọn thủ công trong tab có ưu tiên cao nhất khi bật lịch và được lưu trong `sessionStorage`. Giữ lựa chọn toàn hồ sơ cho chế độ tắt lịch. |
| Xuất bố cục | Xuất JSON thiết kế và tham chiếu ảnh. Dữ liệu riêng của widget thuộc kho khác. Tệp ảnh và backup/restore thuộc Phase 7. |
| Bàn giao | Mã nguồn và tệp Markdown trong thư mục dự án là nguồn tiếp tục giữa các phiên. `docs/ROADMAP.md` giữ lộ trình chính và `ROADMAP.md` ở gốc dẫn đến đó. |

[Kiến trúc](docs/ARCHITECTURE.md) · [Mô hình dữ liệu](docs/DATA_SCHEMA.md) · [Bàn giao](HANDOVER.md)
