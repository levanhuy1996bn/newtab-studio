# Bàn giao phiên làm việc

## 27/11/2026 · Bản 1.1.4 · Wallpaper Doraemon sau Phase 7

- Đã xem bảy ảnh nguồn trong `assets/`, gồm phố dưới chân đồi, cảnh trăng, picnic trên cây và các cảnh phiêu lưu. Ảnh nguồn Doraemon dùng lại tên tệp `img.png` đến `img_6.png` của đợt trước.
- Đã chọn năm bản vẽ ngang 16:9 của ImageGen, thêm vào `public/backgrounds/` và bộ lọc Doraemon trong `src/themeCatalog.js` qua danh mục `src/animeWallpapers.js`. Đã cập nhật mô tả EN/VI và Store Listing theo tổng số 51 ảnh.
- `npm run check` đạt 30 bài kiểm thử qua `npm run package`. Chrome headless trong hồ sơ tạm xác minh bộ lọc EN/VI, ảnh thu nhỏ, xem thử và áp dụng qua hai New Tab. [Tiến độ](PROGRESS.md) · [ZIP 1.1.4](newtab-studio-1.1.4.zip)
- ImageGen chặn cảnh hòa nhạc ngoài vũ trụ và ngắm trăng trên mái nhà. Bản 1.1.4 nằm ở `dist/` và ZIP cục bộ. Hồ sơ Chrome sử dụng hằng ngày chưa được nạp lại trong đợt này.

## 27/11/2026 · Bản 1.1.3 · Nút NewTab Studio trên thanh công cụ Chrome

- Cấu hình `action.default_icon` dùng icon Xoài thuôn 16/32 px cho nút cạnh thanh địa chỉ. Nút mở trang NewTab Studio bằng `public/open-studio.js`. Favicon của nhãn tab được khai báo trong `index.html`.
- Đã bật và nạp lại tiện ích theo xác nhận của người dùng. Quan sát trực tiếp trên Chrome thấy logo màu vàng cam và lá xanh trên nhãn NewTab Studio và trên nút cạnh thanh địa chỉ. Bấm nút mở đúng trang trong tab riêng.
- `npm run package` đạt 30 bài kiểm thử, kiểm tra Manifest V3 và tạo [ZIP 1.1.3](newtab-studio-1.1.3.zip). Chrome headless trong hồ sơ tạm xác minh hành vi của nút và hai tệp favicon màu.

## 27/11/2026 · Bản 1.1.3 · Biển tên Học viện và icon Chrome

- Đã bổ sung hàng chữ đỏ trên cạnh mái hẹp của ảnh Đại lộ dưới mây nhạt, dựa vào ảnh cận cảnh và giữ chữ VWA trên cạnh mái dài. Xuất lại WebP 1600 × 900 và ảnh thu nhỏ 480 × 270.
- Đã tăng độ phủ và độ tương phản màu của mẫu Xoài thuôn, đồng bộ PNG 16/32/48/128 px và khai báo favicon 16/32 px trong `index.html`. Chrome headless xác minh các tệp favicon New Tab có màu vàng cam và xanh lá. Thanh tab của hồ sơ Chrome người dùng chưa được quan sát.
- `npm run check` đạt 30 bài qua `npm run package`. New Tab xác minh xem thử, áp dụng và giữ nền qua tab khác. [ZIP 1.1.3 đã cập nhật](newtab-studio-1.1.3.zip)

## 27/11/2026 · Bản 1.1.3 · Chữ VWA trên Đại lộ dưới mây nhạt

- Đối chiếu `assets/img_2.png` và khôi phục chữ VWA trên mái tòa nhà cao bên phải. Đã cập nhật ảnh 1600 × 900 và ảnh thu nhỏ 480 × 270 trong `public/backgrounds/`. Giữ ID preset để Thư viện và theme đã lưu dùng ảnh mới.
- `npm run check` đạt 30 bài kiểm thử qua `npm run package`. Chrome New Tab xác minh ảnh thu nhỏ, xem thử, áp dụng và giữ nền khi mở tab mới. Tệp ảnh trong `dist/` và [ZIP 1.1.3](newtab-studio-1.1.3.zip) khớp với nguồn đóng gói. Bản ZIP sẵn cục bộ cho lần phát hành tiếp theo.

## 27/11/2026 · Bản 1.1.3 · Thư viện sau Phase 7

- Đã đối chiếu ảnh chụp từ chat cũ và gỡ Trái Đất xanh, Cồn cát sao Hỏa, Vách đá vũ trụ khỏi Thư viện preset. Giữ ID và tài nguyên để theme và lịch đã lưu vẫn hoạt động.
- Thêm bộ lọc Conan với bốn ảnh và bổ sung ba cảnh vũ trụ vào Bầu trời. Mã và ảnh ở `src/themeCatalog.js`, `src/animeWallpapers.js`, `src/spaceWallpapers.js`, `src/background.js` và `public/backgrounds/`.
- Ba ảnh vũ trụ đã xuất WebP 1600 × 900 và ảnh thu nhỏ 480 × 270. `npm run check` đạt 30 bài kiểm thử qua `npm run package`. Chrome headless xác minh bộ lọc EN/VI, preview, áp dụng và giữ ảnh qua hai New Tab. [Tiến độ](PROGRESS.md) · [ZIP 1.1.3](newtab-studio-1.1.3.zip)
- ImageGen chặn đầu ra Doraemon. Bản 1.1.3 ở `dist/` và ZIP cục bộ. Chủ tài khoản dùng [Store Listing](docs/chrome-web-store/LISTING.md) khi gửi phát hành.

## 26/11/2026 · Bản 1.1.2 · Bổ sung wallpaper sau Phase 7

| Mục | Trạng thái |
| --- | --- |
| Công việc phiên này | Thêm 13 wallpaper anime, đưa Thư viện lên 46 hình nền, thêm bộ lọc Phong cảnh và gắn nhãn Thiên nhiên theo nội dung |
| Tệp chính | [animeWallpapers.js](src/animeWallpapers.js), [themeCatalog.js](src/themeCatalog.js), [bảng đối chiếu ảnh nguồn](docs/ANIME_WALLPAPERS.md) |
| Mã sản phẩm | [ZIP 1.1.2](newtab-studio-1.1.2.zip) |
| Kiểm tra | 30 bài kiểm thử đạt. Chrome xác minh bộ lọc EN/VI, preview, áp dụng wallpaper và giữ ảnh khi mở tab khác. [PROGRESS.md](PROGRESS.md) |
| Việc tiếp theo | ImageGen không xuất cảnh Doraemon. Chủ tài khoản rà tài nguyên, cập nhật [Store Listing](docs/chrome-web-store/LISTING.md) và gửi ZIP khi phát hành. Phase 8–9 dành cho hoạch định. |

## Đánh giá feedback · 26/11/2026

1. **Bố cục widget thích ứng.** Đã triển khai ở 0.5.3. Visual Editor lưu `canvas.widgetLayout` theo theme, gồm chế độ và thứ tự ưu tiên riêng. New Tab tự xuống hàng ở mọi chiều rộng khi chọn Tự sắp xếp. Các theme cũ dùng Canvas tự do với cách chuyển thành thẻ ở 720 px trở xuống. Cả hai chế độ đã qua hồi quy với hiệu ứng Phase 6.
2. **Chuyển và đồng bộ cấu hình.** Phase 7 đã dự kiến backup/restore với ảnh và dữ liệu cá nhân. Thử nghiệm riêng tính năng đồng bộ tùy chọn nhẹ qua Chrome Sync sau khi có quy tắc xử lý thay đổi từ hai máy. Phạm vi ban đầu là ngôn ngữ, yêu thích, preset và bố cục gọn dùng ảnh có sẵn. [Hạn mức Chrome Storage Sync](https://developer.chrome.com/docs/extensions/reference/api/storage#storage_areas)
3. **Lịch và ứng dụng bên ngoài.** Đề xuất widget lịch 7 ngày, đọc tệp `.ics` cục bộ trước. Nếu cần lịch tự cập nhật, thử Google Calendar đọc lịch với quyền tối thiểu rồi đánh giá Outlook qua Microsoft Graph. Chọn tích hợp Notes/Todo dựa trên ứng dụng người dùng dùng thường xuyên. [Google Calendar Export](https://support.google.com/calendar/answer/37111) · [Google Calendar OAuth](https://developers.google.com/workspace/calendar/api/auth) · [Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/calendar-list-events?view=graph-rest-1.0)

## Chuyển sang tài khoản Codex còn lại

1. Lưu công việc và dừng phiên đang sửa cùng thư mục. Chuyển sang tài khoản có quyền làm việc với dự án.
2. Trong Codex, mở đúng thư mục `/Users/user/Sites/theme-studio`, tạo chat mới và chọn môi trường **Local** để làm trực tiếp trên thư mục. [Môi trường Codex](https://learn.chatgpt.com/docs/environments/modes)
3. Dán lời nhắn dưới đây và thêm yêu cầu bạn muốn thực hiện.

> Đọc AGENTS.md, PROJECT_CONTEXT.md, HANDOVER.md và PROGRESS.md. Kiểm tra Git status và mã hiện tại, giữ các thay đổi có sẵn rồi tiếp tục theo yêu cầu của tôi. Mốc bàn giao là bản 1.1.4 đã hoàn thành Phase 1–7, có trình chỉnh widget ngay trên New Tab, Thư viện 51 theme với nhóm Conan và Doraemon, logo Xoài thuôn và bộ Store Listing.

Mỗi tài khoản ChatGPT Business có lịch sử Codex riêng. Tính năng Share của Codex desktop tạo bản chụp chỉ đọc, có thể đính kèm để tham khảo trong chat mới. Quy trình trên dùng mã và tài liệu trong thư mục chung để tiếp tục công việc. [Quyền xem lịch sử Business](https://help.openai.com/en/articles/8798634-managing-data-sharing-and-privacy-in-chatgpt-business) · [Chia sẻ bản chụp Codex](https://learn.chatgpt.com/docs/use-chatgpt#share-a-read-only-snapshot-of-a-codex-thread)
