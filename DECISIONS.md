# Quyết định kỹ thuật

| Phạm vi | Quyết định và lý do |
| --- | --- |
| Đóng gói | React, Vite, JavaScript, Tailwind và Manifest V3. Vite tạo asset với đường dẫn tương đối để `dist/` chạy từ origin extension. Logic, font và tài nguyên đi kèm được đóng gói cục bộ. |
| Tên hiển thị | Mango New Tab Studio Wallpapers & Widgets là tên công khai. Nhãn tab và giao diện dùng Mango New Tab Studio. Chrome có tên rút gọn Mango Studio. Tên gói kỹ thuật và khóa lưu trữ giữ nguyên để dùng lại quy trình đóng gói và đọc dữ liệu đã có. |
| Biểu tượng Chrome | Nhãn tab và nút cạnh thanh địa chỉ cùng dùng PNG 16/32 px. Nút mở trang Mango New Tab Studio trong tab mới qua service worker MV3. |
| CSP của tiện ích | Các trang extension tải script và kết nối ở origin của tiện ích. Ảnh nền tải lên dùng URL `blob:`. Tìm kiếm và lối tắt điều hướng Chrome tới địa chỉ người dùng chọn. |
| Phạm vi miễn phí | Phase 1–7 theo hướng local-first, sử dụng ngoại tuyến, có giao diện EN/VI. Cloud, AI và thương mại hóa thuộc lộ trình Phase 8–9. |
| Phân chia lưu trữ | `chrome.storage.local` lưu ngôn ngữ và yêu thích. Giao diện dùng tiếng Anh khi chưa có lựa chọn hợp lệ. Bản Vite dùng `localStorage` cho các mục này. IndexedDB lưu theme đang dùng, hình nền, ảnh, chữ và canvas. Lựa chọn Phase 1 vẫn được đọc làm fallback. |
| Tính nhất quán | Repository ghi các phần của theme và lựa chọn đang dùng cùng transaction. Cập nhật nền, chữ hoặc canvas giữ các phần khác. BroadcastChannel báo thay đổi giữa tab sau khi ghi. Asset đang được nền hoặc canvas tham chiếu được bảo vệ khỏi thao tác xóa. |
| Bố cục | `ThemeScene` dùng lại renderer ở New Tab và các trình chỉnh sửa. Khối typography có vị trí trên/dưới đồng hồ. Các lớp lưu tọa độ thiết kế 1.200 × 675. Widget Canvas tự do trên New Tab dùng chiều rộng và chiều cao của vùng nội dung. Visual Editor và các lớp trang trí trên New Tab vẫn hiển thị trong khung 16:9. Lịch sử undo/redo thuộc phiên chỉnh sửa. |
| New Tab toàn khung nhìn | Nền nằm dưới thanh điều hướng, chữ và widget, phủ viewport khi mở tab và khi cuộn. Công cụ và preview trong editor giữ khung riêng. Khi áp dụng từ thư viện, mở màn New Tab và phục hồi nền tùy chỉnh của theme đã lưu. |
| Theme ảnh | ID preset cũ vẫn giữ nguyên. Preset có wallpaper đóng gói dùng ảnh thu nhỏ ở gallery và ảnh đầy đủ trong New Tab. Tọa độ lấy nét theo preset giúp cảnh giữ chủ thể khi ảnh được cắt cho màn hình dọc. [Nguồn wallpaper](docs/WALLPAPERS.md) |
| Bộ lọc thư viện | Giữ danh mục chính cho nhãn trên thẻ. Anime chỉ phong cách minh họa. Phong cảnh bao gồm các khung cảnh rộng, có cả đô thị. Thiên nhiên dựa trên nội dung chính. Conan và Doraemon là nhãn phụ theo bộ ảnh. Các nhóm này có thể giao nhau. |
| Mẫu gỡ khỏi thư viện | Giữ ID trong bản tra cứu để đọc thiết kế và lịch cũ. Danh mục, tìm kiếm, yêu thích và lựa chọn lịch mới chỉ hiện các mẫu đang được cung cấp. |
| Sao lưu và khôi phục | JSON v1 chứa ảnh Base64 và SHA-256. Giải mã, tạo thumbnail và xác thực tham chiếu trước khi ghi. Khôi phục dữ liệu và tùy chọn chờ đồng bộ trong cùng transaction IndexedDB. |
| Tương thích | IndexedDB nâng lên v2 để thêm `widgetData`, theme document đọc được các bản v1–v4. Cơ chế nâng phiên bản kho và phiên bản bản ghi được theo dõi riêng. |
| Widget | Theme lưu cấu hình trình bày. Kho riêng lưu Todo, Notes và timer theo ID lớp. Cập nhật Todo đọc trạng thái mới nhất trong transaction, timer lưu mốc đích và dồn thẻ widget sang luồng bên dưới khung nền ở viewport hẹp. |
| Daily quote mặc định | Preset thiếu trường canvas nhận một widget có ID ổn định ở góc dưới phải. Ghi lại canvas khi người dùng chỉnh, kể cả khi đã xóa hết lớp. Theme cá nhân sao chép bố cục hiện có của theme nguồn. Giữ phiên bản schema. |
| Liên kết tác giả | Nút mở bảng ở New Tab và dùng tiếng Anh theo quyết định của chủ dự án. Bốn địa chỉ được đóng gói cục bộ và mở trong tab riêng khi người dùng chọn. |
| Lối tắt | Dùng IndexedDB theo ID widget. Thiết kế cũ dùng liên kết đã lưu trong cấu hình cho tới lần chỉnh trực tiếp đầu tiên. Lịch sử Chrome chỉ được đọc trong chế độ người dùng chọn sau khi cấp quyền và kết quả chỉ giữ trong bộ nhớ. Biểu tượng dùng chữ cái theo tên miền. |
| Đồng hồ và phông widget | Mặt đồng hồ dựng từ CSS và giờ địa phương. Các lựa chọn hiển thị lưu trong cấu hình widget. Be Vietnam Pro và Lora được đóng gói cục bộ. |
| Tự sắp xếp widget | `canvas.widgetLayout` lưu chế độ và danh sách ID ưu tiên theo theme. CSS cho thẻ xuống hàng trên New Tab. Canvas tự do dùng tọa độ và thứ tự lớp đã lưu. Bản ghi cũ mặc định dùng Canvas tự do. |
| Chỉnh widget trên New Tab | Dùng mặt phẳng và thao tác kéo có sẵn. Mỗi lần lưu áp dụng các thay đổi widget lên canvas mới nhất trong transaction; ẩn/hiện giữ nguyên ID. Mức đậm nền kính mặc định 26%, độc lập với opacity toàn lớp. |
| New Tab tối giản | Thanh trái mở công cụ chỉnh sửa khi cần. Tự sắp xếp và chế độ thẻ ở màn hẹp dùng phân trang để giữ nội dung trong khung nhìn. Chỉnh sửa và Gallery dùng vùng cuộn riêng của từng trang. |
| Khung ảnh | Ảnh cũ mặc định giữ chế độ phủ và vị trí đã lưu. Ảnh mới bắt đầu ở giữa và zoom 100%. Chế độ vừa khung dùng `scale-down` để giữ trọn ảnh và giữ nguyên kích thước ảnh nhỏ. |
| Hiệu ứng | Theme document v5 lưu hiệu ứng nền, chữ và widget. Tab ẩn tạm dừng hoạt ảnh. Giảm chuyển động của hệ thống và Chế độ hiệu năng tắt hiệu ứng trang trí. |
| Lịch theme | Giờ thiết bị xác định khung đang dùng. Khung đầu tiên khớp được ưu tiên. Lựa chọn thủ công trong tab có ưu tiên cao nhất khi bật lịch và được lưu trong `sessionStorage`. Giữ lựa chọn toàn hồ sơ cho chế độ tắt lịch. |
| Xuất bố cục | Xuất JSON thiết kế và tham chiếu ảnh. Dữ liệu riêng của widget thuộc kho khác. Tệp ảnh và backup/restore thuộc Phase 7. |
| Bàn giao | Mã nguồn và tệp Markdown trong thư mục dự án là nguồn tiếp tục giữa các phiên. `docs/ROADMAP.md` giữ lộ trình chính và `ROADMAP.md` ở gốc dẫn đến đó. |

[Kiến trúc](docs/ARCHITECTURE.md) · [Mô hình dữ liệu](docs/DATA_SCHEMA.md) · [Bàn giao](HANDOVER.md)
