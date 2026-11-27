# Mango New Tab Studio

Chrome Extension Manifest V3 thay thế trang New Tab. Bản 1.1.0 có 51 theme dựng sẵn, Background Studio, Text Editor, Free Canvas, 11 widget, Tự sắp xếp, hiệu ứng và lịch đổi theme. Dữ liệu thiết kế và widget được lưu cục bộ bằng IndexedDB. Giao diện có tiếng Anh và tiếng Việt.

## Chạy trên máy

Yêu cầu Node.js 22.12 trở lên trong dòng 22, hoặc Node.js 24 trở lên, cùng npm. Trong thư mục dự án, chạy:

```bash
npm ci
npm run dev
```

Dùng `npm run test:watch` để tự chạy lại kiểm thử khi sửa mã. Vite in địa chỉ bản xem trước. Bản này dùng localStorage thay cho chrome.storage.local để lưu ngôn ngữ và yêu thích. Cả hai bản dùng IndexedDB cho dữ liệu hình nền, với kho riêng theo origin.

## Cài vào Chrome

1. Chạy `npm run check` để kiểm tra và tạo thư mục `dist/`.
2. Mở `chrome://extensions`, bật **Developer mode**, bấm **Load unpacked** và chọn `dist/`.
3. Mở tab mới. Dùng **Thư viện theme** ở thanh bên trái để duyệt theme, hoặc mở **Tùy chỉnh** để vào các trình chỉnh sửa.
4. Sau mỗi lần build lại, bấm **Reload** trên thẻ extension và mở tab mới.

Trong Background Studio, chọn ảnh có sẵn hoặc tải lên ảnh tĩnh JPG, PNG, WebP tối đa 15 MB và 32 megapixel. Sau khi chỉnh khung hình và màu, bấm **Apply background** để dùng nền ở New Tab. [Nguồn ảnh có sẵn](docs/phases/PHASE_02_BACKGROUND.md#ảnh-đóng-gói)

Trong Text Editor, nhập chữ hoặc chèn lời chào, thơ và châm ngôn từ thư viện. Chọn kiểu chữ, căn lề và đặt khối trên hoặc dưới đồng hồ. Bấm **Apply text** để lưu tối đa 8 khối cho theme. [Nguồn nội dung và giấy phép phông chữ](docs/phases/PHASE_03_TYPOGRAPHY.md)

Trong Visual Editor, chèn hình, khung viền, nhãn dán, ảnh thư viện hoặc chữ. Kéo trực tiếp trên canvas, dùng điểm vuông để đổi kích thước và điểm tròn để xoay. Giữ Shift khi chọn để thao tác nhiều lớp. Bấm **Apply canvas** để lưu và hiển thị trên tab mới. [Các phím tắt canvas](docs/phases/PHASE_04_VISUAL_EDITOR.md#phím-tắt)

Ngay trên New Tab, bấm **Chỉnh tiện ích** ở thanh trái, tick tiện ích muốn hiển thị rồi kéo thẻ đến vị trí mong muốn. Chọn thẻ để chỉnh **Độ đậm nền** hoặc dùng phím mũi tên để di chuyển. Bấm **Lưu** để áp dụng cho theme hiện tại.

Bật **Liên kết nhanh** để lưu trang ngay trên New Tab. **Cài đặt lối tắt** cho phép đổi giữa **Đã lưu**, **Hay truy cập** và **Mới truy cập**. Hai mục lịch sử yêu cầu quyền tùy chọn của Chrome.

Mở **Tiện ích và bố cục** trong Visual Editor để thêm widget hoặc dùng bố cục Tối giản, Công việc hoặc Học tập. Sau khi áp dụng canvas, tương tác với widget trên New Tab. Nút **Xuất bố cục** tải JSON của thiết kế. [Hành vi widget và phạm vi xuất](docs/phases/PHASE_05_WIDGETS.md)

Trong **Bố cục tiện ích trên tab mới**, chọn **Tự sắp xếp**, dùng mũi tên để đổi thứ tự rồi bấm **Áp dụng canvas**. Widget tự xuống hàng theo chiều rộng cửa sổ. Mỗi theme lưu lựa chọn riêng và giữ tọa độ để dùng lại khi chọn **Canvas tự do**.

Chọn **Tùy chỉnh → Hiệu ứng** trên New Tab để chỉnh và xem thử hoạt ảnh của theme đang dùng. Trang này cũng có lịch đổi theme ngày/đêm, khung giờ tùy chỉnh và Chế độ hiệu năng. **Chế độ tập trung** trên New Tab ẩn điều hướng và giữ đồng hồ cùng widget. [Hướng dẫn hiệu ứng và lịch theme](docs/phases/PHASE_06_EFFECTS.md)

Hướng dẫn chính thức của Chrome. [Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

## Theme của tôi và sao lưu

- Chọn **Tùy chỉnh → Theme của tôi** để lưu bản sao, đổi tên, chuyển workspace hoặc xuất theme kèm ảnh.
- Trình chỉnh lưu bản nháp cục bộ. Bấm **Áp dụng** để đưa chỉnh sửa lên New Tab.
- Chọn **Tùy chỉnh → Cài đặt → Nhập và sao lưu** để tải bản sao lưu đầy đủ, nhập thành bản sao hoặc khôi phục toàn bộ sang hồ sơ Chrome khác. [Chi tiết Phase 7](docs/phases/PHASE_07_RELEASE.md)

## Tài liệu

- [Bối cảnh dự án](PROJECT_CONTEXT.md) và [bàn giao giữa các phiên hoặc tài khoản](HANDOVER.md)
- [Quyết định kỹ thuật](DECISIONS.md), [lịch sử phiên bản](CHANGELOG.md), [vấn đề đã biết](KNOWN_ISSUES.md)
- [Bộ wallpaper và nguồn ảnh](docs/WALLPAPERS.md)

- [Đặc tả sản phẩm](docs/PRODUCT_SPEC.md)
- [Kiến trúc](docs/ARCHITECTURE.md), [mô hình dữ liệu](docs/DATA_SCHEMA.md), [hệ thống thiết kế](docs/DESIGN_SYSTEM.md)
- [Lộ trình 9 Phase](ROADMAP.md), [tiến độ](PROGRESS.md)
- [Kiểm thử](docs/TESTING.md), [phát hành](docs/PUBLISHING.md)
- [Hướng dẫn Codex](AGENTS.md), [hướng dẫn Claude Code](CLAUDE.md)
