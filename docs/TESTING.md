# Kiểm thử

`npm run check` chạy unit test bằng Node, build Vite và xác minh cấu trúc dist. Bộ unit test Phase 1 kiểm tra catalog, tìm kiếm có dấu tiếng Việt, khôi phục cấu hình lỗi và chuẩn hóa màu. Build check xác minh manifest MV3, New Tab entry, đường dẫn icon và bundle.

## Smoke test Phase 1

| Luồng | Kết quả mong đợi |
| --- | --- |
| Cài dist và mở New Tab | Trang của extension hiển thị theme đang dùng |
| Mở Theme Gallery | 36 theme, 6 nhóm, bộ lọc và số kết quả đúng |
| Tìm từ khóa tiếng Việt không dấu | Tên có dấu tương ứng xuất hiện |
| Đổi ngôn ngữ, tải lại | Giao diện và ngày giờ theo ngôn ngữ đã lưu |
| Bật yêu thích, lọc rồi bỏ chọn | Danh sách và trạng thái cập nhật, có thông báo khi rỗng |
| Chọn theme, đóng preview | New Tab giữ màu cũ |
| Sửa màu, áp dụng, mở tab tiếp theo | New Tab hiển thị theme và màu đã lưu |
| Áp dụng ở một tab và xem tab khác | Hai tab đọc cùng lựa chọn đã commit |
| Thao tác Tab, Enter, Escape | Nút có focus rõ, dialog đóng và trả focus |
| Mở ở 320 px và ngắt mạng | Giao diện co giãn, theme và điều hướng vẫn chạy |

## Các Phase sau

- Phase 5–6 thử con trỏ, bàn phím, lịch qua nửa đêm, thay đổi viewport và reduced motion.
- Phase 7 thêm fixture migration, restore có dữ liệu cũ, bundle thiếu asset, ghi hỏng giữa chừng và báo cáo hiệu năng. So sánh cùng profile máy, ghi browser/version, số lần chạy và p50/p95.

## Smoke test Phase 2

| Luồng | Kết quả mong đợi |
| --- | --- |
| Mở New Tab với lưu trữ Phase 1 | Preset cũ và bảng màu giữ nguyên ở lần mở đầu |
| Đổi màu đơn, gradient, ảnh, trình chiếu | Xem thử trực tiếp và tab khác cập nhật sau khi áp dụng |
| Tải JPG, PNG hoặc WebP | Thư viện có thumbnail, IndexedDB giữ ảnh gốc và metadata |
| Thử tệp hỏng, quá 15 MB hoặc mô phỏng hết quota | Giao diện báo lỗi. Store ảnh và thumbnail giữ nhất quán |
| Chỉnh khung, bộ lọc và lớp phủ | Tham số được giữ khi mở tab hoặc Chrome lại |
| Xóa ảnh đã dùng rồi thay nền và xóa lại | Lần đầu bị chặn. Lần sau xóa được dữ liệu ảnh gốc và thumbnail |
| Đổi thứ tự và thời lượng trình chiếu | Thứ tự lưu đúng và trình chiếu dừng khi tab ẩn |
| Chạy offline và thu hẹp xuống 320 px | Ảnh hiển thị và giao diện không tràn ngang |

## Smoke test Phase 3

| Luồng | Kết quả mong đợi |
| --- | --- |
| Nhập chữ tiếng Việt nhiều dòng có ký hiệu HTML | Xuống dòng và ký tự giữ nguyên, ký hiệu được hiển thị dạng văn bản |
| Chèn thơ, lời chào hoặc châm ngôn | Thêm khối theo nhóm và áp dụng kiểu chữ dựng sẵn |
| Chỉnh kiểu chữ, độ đậm, màu, giãn dòng, căn lề, bóng và góc | Preview và New Tab dùng cùng tham số |
| Chèn châm ngôn mỗi ngày rồi đổi ngôn ngữ | Câu đổi ngôn ngữ theo giao diện, ổn định trong ngày địa phương |
| Mở bản ghi Phase 2 rồi áp dụng chữ, tiếp đó chỉnh nền | Nền cũ và khối chữ được giữ qua hai lần ghi |
| Mở lại Chrome và ngắt mạng | Font cục bộ và các khối chữ đã áp dụng vẫn tải được |
| Nhập 1.200 ký tự ở 320 px | Dòng tự xuống hàng, chiều rộng trang không tràn |

## Smoke test Phase 4

| Luồng | Kết quả mong đợi |
| --- | --- |
| Kéo, đổi kích thước và xoay lớp | Layer theo chuột trên mặt phẳng thiết kế, một lần thả tạo một bước undo |
| Hủy pointer khi đang kéo | Hình trở về vị trí ban đầu, không có thay đổi trong lịch sử |
| Chọn nhiều bằng Shift, nhóm, tách nhóm và nhân bản | Undo/redo khôi phục quan hệ nhóm cùng thứ tự |
| Khóa, ẩn, đổi thứ tự, đổi tên và menu ngữ cảnh | Canvas, bảng layer và New Tab phản ánh trạng thái sau khi áp dụng |
| Mở bản ghi có nền và chữ, sau đó áp dụng canvas | Nội dung Phase 2–3 vẫn hiện và canvas đồng bộ sang tab khác |
| Xóa ảnh đang được canvas tham chiếu | Thư viện báo ảnh đang dùng và giữ dữ liệu |
| Xem thử, tải lại ngoại tuyến và mở ở 320 px | Đúng thứ tự lớp, kích thước, góc, hình và khung bố cục. New Tab ẩn điều khiển chỉnh sửa |

## Smoke test Phase 5

| Luồng | Kết quả mong đợi |
| --- | --- |
| Mở New Tab có IndexedDB v1 và canvas cũ | Nâng lên v2, lớp Phase 4 và đồng hồ mặc định vẫn hiện |
| Chèn preset và hoàn tác | Cả bố cục thêm/xóa trong một bước, lớp cũ giữ nguyên |
| Thêm liên kết, đổi công cụ tìm kiếm | Chỉ chấp nhận HTTP/HTTPS, truy vấn được mã hóa khi gửi |
| Thêm Todo ở hai tab và lưu Notes | Thay đổi đồng bộ và hai mục tạo đồng thời vẫn tồn tại |
| Chuyển từ 31/12 sang 1/1 | Lịch tự cập nhật ngày được đánh dấu |
| Mở lại Chrome khi timer đang chạy | Mốc đích được giữ, kết quả dựa vào thời gian đã trôi qua |
| Xuất JSON, tải offline và mở ở 320 px | JSON chỉ chứa bố cục. Widget xếp thành thẻ và tiếp tục đọc dữ liệu local |

## Phase 7 · Kiểm tra giữa hai hồ sơ Chrome

1. Ở hồ sơ nguồn, tải lên một ảnh và áp dụng. Lưu theme vào một workspace, thêm widget ghi chú và tạo một bản nháp nền chưa áp dụng.
2. Xuất theme từ **Theme của tôi** và tải backup từ **Cài đặt → Nhập và sao lưu**. Trong hồ sơ đích, nhập theme và kiểm tra ảnh đi kèm. Nhập backup thành bản sao và đối chiếu theme, ảnh và widget. Kiểm tra dữ liệu cũ vẫn ở đó.
3. Chọn khôi phục đầy đủ để kiểm tra theme đang dùng, workspace, bản nháp, ghi chú, ảnh và tùy chọn. Mở tab mới trong hồ sơ đích và thử lại khi offline. Kiểm tra tệp ảnh sai hash báo lỗi trước khi nhập. Giả lập lỗi ghi trong transaction và xác minh dữ liệu cũ còn nguyên trước khi thử lại.
