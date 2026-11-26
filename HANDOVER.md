# Bàn giao phiên làm việc

**Mốc 26/11/2026 · NewTab Studio 0.6.8 · Hoàn tất Phase 1–6 và chuẩn bị Store Listing trong Phase 7.**

| Mục | Trạng thái |
| --- | --- |
| Công việc phiên này | Liên kết nhanh dạng ô, thêm/sửa/gỡ từ New Tab và hai nguồn lịch sử Chrome tùy chọn |
| Tệp cập nhật | [Shortcuts.jsx](src/Shortcuts.jsx), renderer, widget model, CSS, dịch EN/VI, manifest, kiểm thử và [tài liệu Chrome Web Store](docs/chrome-web-store/LISTING.md) |
| Mã sản phẩm | 0.6.8 ở `dist/` và [ZIP](newtab-studio-0.6.8.zip) |
| Việc tiếp theo | Chủ tài khoản cập nhật [chính sách quyền riêng tư](docs/chrome-web-store/PRIVACY.md) trên Gist và điền Developer Dashboard. Phase 7 còn quản lý theme và backup/restore |
| Kiểm tra | 25 bài kiểm thử, build, Manifest V3 và ZIP đạt. Chrome 158 xác minh thao tác lối tắt giữa hai tab. Hai chế độ lịch sử chạy với API thật trong hồ sơ tạm có quyền. Xem [PROGRESS.md](PROGRESS.md) |
| Điểm cần lưu ý | Hộp thoại cấp quyền của Chrome chưa được chấp thuận thủ công khi chạy headless. Thư mục chưa có Git. Weather chờ đánh giá nguồn. [Vấn đề đã biết](KNOWN_ISSUES.md) |

## Tiếp tục từ Phase 7

1. Đọc [đặc tả Phase 7](docs/phases/PHASE_07_RELEASE.md) và [mô hình dữ liệu](docs/DATA_SCHEMA.md). Đối chiếu [lớp dữ liệu](src/studioRepository.js), [tùy chọn](src/preferences.js) và [xuất bố cục](src/layoutExport.js).
2. Ưu tiên backup/restore đầy đủ kèm ảnh. Kiểm thử dữ liệu theme v1–v5, hai chế độ canvas, widget cá nhân, lịch và tùy chọn hiệu năng/tập trung. Lựa chọn thủ công của tab thuộc phiên. Đo cold start và tải ảnh khi tối ưu trước phát hành.
3. Sau mỗi mốc quan trọng, ghi lại việc đã làm, tệp thay đổi, kết quả kiểm tra, lỗi còn mở và bước tiếp theo trong tệp này. Các kết quả đã hoàn tất đi vào [PROGRESS.md](PROGRESS.md), thay đổi phiên bản vào [CHANGELOG.md](CHANGELOG.md).

## Đánh giá feedback · 26/11/2026

1. **Bố cục widget thích ứng.** Đã triển khai ở 0.5.3. Visual Editor lưu `canvas.widgetLayout` theo theme, gồm chế độ và thứ tự ưu tiên riêng. New Tab tự xuống hàng ở mọi chiều rộng khi chọn Tự sắp xếp. Các theme cũ dùng Canvas tự do với cách chuyển thành thẻ ở 720 px trở xuống. Cả hai chế độ đã qua hồi quy với hiệu ứng Phase 6.
2. **Chuyển và đồng bộ cấu hình.** Phase 7 đã dự kiến backup/restore với ảnh và dữ liệu cá nhân. Thử nghiệm riêng tính năng đồng bộ tùy chọn nhẹ qua Chrome Sync sau khi có quy tắc xử lý thay đổi từ hai máy. Phạm vi ban đầu là ngôn ngữ, yêu thích, preset và bố cục gọn dùng ảnh có sẵn. [Hạn mức Chrome Storage Sync](https://developer.chrome.com/docs/extensions/reference/api/storage#storage_areas)
3. **Lịch và ứng dụng bên ngoài.** Đề xuất widget lịch 7 ngày, đọc tệp `.ics` cục bộ trước. Nếu cần lịch tự cập nhật, thử Google Calendar đọc lịch với quyền tối thiểu rồi đánh giá Outlook qua Microsoft Graph. Chọn tích hợp Notes/Todo dựa trên ứng dụng người dùng dùng thường xuyên. [Google Calendar Export](https://support.google.com/calendar/answer/37111) · [Google Calendar OAuth](https://developers.google.com/workspace/calendar/api/auth) · [Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/calendar-list-events?view=graph-rest-1.0)

## Chuyển sang tài khoản Codex còn lại

1. Lưu công việc và dừng phiên đang sửa cùng thư mục. Chuyển sang tài khoản có quyền làm việc với dự án.
2. Trong Codex, mở đúng thư mục `/Users/user/Sites/theme-studio`, tạo chat mới và chọn môi trường **Local** để làm trực tiếp trên thư mục. [Môi trường Codex](https://learn.chatgpt.com/docs/environments/modes)
3. Dán lời nhắn dưới đây và thêm yêu cầu bạn muốn thực hiện.

> Đọc AGENTS.md, PROJECT_CONTEXT.md, HANDOVER.md và PROGRESS.md. Kiểm tra Git status và mã hiện tại, giữ các thay đổi có sẵn rồi tiếp tục theo yêu cầu của tôi. Mốc bàn giao là bản 0.6.8 đã hoàn thành Phase 1–6, có trình chỉnh widget ngay trên New Tab, Thư viện 33 theme, logo Xoài thuôn và bộ Store Listing. Đọc docs/phases/PHASE_07_RELEASE.md trước khi triển khai phần còn lại.

Mỗi tài khoản ChatGPT Business có lịch sử Codex riêng. Tính năng Share của Codex desktop tạo bản chụp chỉ đọc, có thể đính kèm để tham khảo trong chat mới. Quy trình trên dùng mã và tài liệu trong thư mục chung để tiếp tục công việc. [Quyền xem lịch sử Business](https://help.openai.com/en/articles/8798634-managing-data-sharing-and-privacy-in-chatgpt-business) · [Chia sẻ bản chụp Codex](https://learn.chatgpt.com/docs/use-chatgpt#share-a-read-only-snapshot-of-a-codex-thread)
