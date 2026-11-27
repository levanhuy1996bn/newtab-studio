# Bàn giao phiên làm việc

## 27/11/2026 · Mô tả Chrome Web Store · 1.1.0

- Phase 7. `docs/chrome-web-store/LISTING.md` có bản mô tả dài EN/VI cập nhật tính năng châm ngôn mỗi ngày và hai nút chuyển câu. Đối chiếu tên, số hình nền và tóm tắt với manifest và metadata EN/VI. Chủ tài khoản dán mô tả vào Store listing của mục hiện có.

## 27/11/2026 · More by the Creator và Daily quote mặc định · 1.1.0

- Phase 1 và 5. `src/CreatorProjects.jsx`, `src/App.jsx` và `src/styles.css` thêm nút More by the Creator ở góc dưới bên trái New Tab. Nút và các liên kết có mũi tên chéo. Bảng giữ nhãn tiếng Anh trong cả hai ngôn ngữ, gồm mục thơ Share Ups and Downs và ba dự án theo ảnh duyệt. 3D Football Manager có biểu tượng quả bóng.
- `src/studioData.js`, `src/studioRepository.js` và `src/preferences.js` cấp widget Daily quote ở góc dưới bên phải cho preset chưa lưu canvas. Bố cục đã lưu, kể cả widget bị ẩn hoặc canvas đã xóa hết lớp, được giữ. New Tab hẹp đặt thẻ mặc định sát mép phải trên hàng cuối.
- `npm run check` đạt 31 bài và build `dist/`. Chrome headless qua `chrome://newtab/` xác minh tên và biểu tượng trong bảng, bốn URL, đóng qua Escape và nhấp bên ngoài, EN/VI, vị trí câu mặc định ở 1366 và 390 px, cùng tùy chọn ẩn lưu qua tab mới. Chủ dự án sẽ đóng lại ZIP 1.1.0.

## 27/11/2026 · Tên Mango và châm ngôn song ngữ · 1.1.0

- Phase 1, 3 và 5. Đổi tên công khai trong `public/manifest.json` và tài liệu Chrome Web Store. `index.html`, `src/App.jsx` và các nhãn EN/VI dùng tên gọn Mango New Tab Studio. Tên rút gọn trong manifest là Mango Studio.
- `src/scriptureQuotes.js` thêm sáu đoạn và cập nhật Mc 7,20–23 theo lời tiếng Việt do người dùng gửi, giữ ID mục cũ. Bảy đoạn có tiếng Anh World English Bible và trích dẫn EN/VI. Widget và thư viện chữ dùng chung 34 châm ngôn.
- `npm run check` đạt 30 bài và build `dist/`. Chrome headless xác minh tên trong manifest, tiêu đề tab, nhãn nút tiện ích và vòng 34 câu trên `chrome://newtab/`, gồm bảy trích dẫn yêu cầu trong cả EN/VI. Nút trước/sau giữ nguyên vị trí với nội dung ngắn và dài, kể cả ở 390 px. Chủ dự án sẽ đóng lại ZIP 1.1.0.

## 27/11/2026 · Điều hướng Châm ngôn mỗi ngày · 1.1.0

- Bỏ hậu tố WEB trên trích dẫn trong widget và thêm nút câu trước, câu tiếp theo bằng EN/VI. Widget mở ở câu của ngày hiện tại. Khi đổi ngày hoặc mở tab mới, widget trở về câu của ngày đó.
- Ghim hai nút vào đáy widget. Thẻ trong bố cục tự sắp xếp và màn hình hẹp có chiều cao ổn định, phần trích dẫn dài cuộn riêng. Mã thay đổi ở `src/Widgets.jsx`, `src/i18n.js` và `src/styles.css`.
- `npm run check` đạt 30 bài. Chrome headless xác minh vòng 28 câu, 20 trích dẫn bỏ hậu tố WEB, chuyển EN/VI, trở về câu của ngày và vị trí nút qua cả 28 câu ở Canvas tự do và thẻ rộng 390 px. Bản build 1.1.0 ở `dist/`, ZIP chờ chủ dự án đóng.

## 27/11/2026 · Vùng kéo widget và ngôn ngữ mặc định · 1.1.0

- New Tab dùng toàn bộ vùng nội dung để kéo và đổi kích thước widget. Các lớp trang trí trên New Tab và khung Visual Editor giữ cách bố trí 16:9. Tọa độ lưu tiếp tục dùng mặt phẳng thiết kế 1.200 × 675.
- Lần cài mới mặc định tiếng Anh. Lựa chọn tiếng Việt đã lưu tiếp tục được đọc. Mã chính ở `src/CanvasScene.jsx`, `src/styles.css`, `src/TabWidgetEditor.jsx`, `src/useCanvasGesture.js` và `src/preferences.js`.
- `npm run check` đạt 30 bài kiểm thử. Chrome headless xác minh kéo tới các mép và lưu qua tab mới, vùng chỉnh sửa hẹp, khung trang trí 16:9 và tiếng Anh trên hồ sơ mới có ngôn ngữ trình duyệt tiếng Việt. Chuyển sang tiếng Việt qua menu giữ được qua tab khác. Bản build ở `dist/`. ZIP chờ chủ dự án đóng lại.

## 27/11/2026 · Chốt phiên bản 1.1.0

- Gộp toàn bộ tính năng hiện tại vào mốc phát hành 1.1.0. Đã đồng bộ `package.json`, `package-lock.json`, `public/manifest.json`, changelog và tài liệu phát hành.
- `npm run check` đạt 30 bài kiểm thử. Chrome headless xác minh manifest 1.1.0 qua `chrome://newtab/`, 51 hình nền, bộ lọc Doraemon EN/VI và áp dụng nền qua hai tab.
- Bản build 1.1.0 ở `dist/`. Chủ dự án sẽ đóng lại ZIP từ mã nguồn hiện tại bằng `npm run package`.

## 27/11/2026 · Wallpaper Doraemon sau Phase 7

- Đã xem bảy ảnh nguồn trong `assets/`, gồm phố dưới chân đồi, cảnh trăng, picnic trên cây và các cảnh phiêu lưu. Ảnh nguồn Doraemon dùng lại tên tệp `img.png` đến `img_6.png` của đợt trước.
- Đã chọn năm bản vẽ ngang 16:9 của ImageGen, thêm vào `public/backgrounds/` và bộ lọc Doraemon trong `src/themeCatalog.js` qua danh mục `src/animeWallpapers.js`. Đã cập nhật mô tả EN/VI và Store Listing theo tổng số 51 ảnh.
- `npm run check` đạt 30 bài kiểm thử qua `npm run package`. Chrome headless trong hồ sơ tạm xác minh bộ lọc EN/VI, ảnh thu nhỏ, xem thử và áp dụng qua hai New Tab. [Tiến độ](PROGRESS.md)
- ImageGen chặn cảnh hòa nhạc ngoài vũ trụ và ngắm trăng trên mái nhà. Hồ sơ Chrome sử dụng hằng ngày chưa được nạp lại trong đợt này.

## 27/11/2026 · Nút NewTab Studio trên thanh công cụ Chrome

- Cấu hình `action.default_icon` dùng icon Xoài thuôn 16/32 px cho nút cạnh thanh địa chỉ. Nút mở trang NewTab Studio bằng `public/open-studio.js`. Favicon của nhãn tab được khai báo trong `index.html`.
- Đã bật và nạp lại tiện ích theo xác nhận của người dùng. Quan sát trực tiếp trên Chrome thấy logo màu vàng cam và lá xanh trên nhãn NewTab Studio và trên nút cạnh thanh địa chỉ. Bấm nút mở đúng trang trong tab riêng.
- `npm run package` đạt 30 bài kiểm thử, kiểm tra Manifest V3. Chrome headless trong hồ sơ tạm xác minh hành vi của nút và hai tệp favicon màu.

## 27/11/2026 · Biển tên Học viện và icon Chrome

- Đã bổ sung hàng chữ đỏ trên cạnh mái hẹp của ảnh Đại lộ dưới mây nhạt, dựa vào ảnh cận cảnh và giữ chữ VWA trên cạnh mái dài. Xuất lại WebP 1600 × 900 và ảnh thu nhỏ 480 × 270.
- Đã tăng độ phủ và độ tương phản màu của mẫu Xoài thuôn, đồng bộ PNG 16/32/48/128 px và khai báo favicon 16/32 px trong `index.html`. Chrome headless xác minh các tệp favicon New Tab có màu vàng cam và xanh lá. Thanh tab của hồ sơ Chrome người dùng chưa được quan sát.
- `npm run check` đạt 30 bài qua `npm run package`. New Tab xác minh xem thử, áp dụng và giữ nền qua tab khác.

## 27/11/2026 · Chữ VWA trên Đại lộ dưới mây nhạt

- Đối chiếu `assets/img_2.png` và khôi phục chữ VWA trên mái tòa nhà cao bên phải. Đã cập nhật ảnh 1600 × 900 và ảnh thu nhỏ 480 × 270 trong `public/backgrounds/`. Giữ ID preset để Thư viện và theme đã lưu dùng ảnh mới.
- `npm run check` đạt 30 bài kiểm thử qua `npm run package`. Chrome New Tab xác minh ảnh thu nhỏ, xem thử, áp dụng và giữ nền khi mở tab mới. Tệp ảnh trong gói thử của mốc này khớp với nguồn đóng gói.

## 27/11/2026 · Thư viện sau Phase 7

- Đã đối chiếu ảnh chụp từ chat cũ và gỡ Trái Đất xanh, Cồn cát sao Hỏa, Vách đá vũ trụ khỏi Thư viện preset. Giữ ID và tài nguyên để theme và lịch đã lưu vẫn hoạt động.
- Thêm bộ lọc Conan với bốn ảnh và bổ sung ba cảnh vũ trụ vào Bầu trời. Mã và ảnh ở `src/themeCatalog.js`, `src/animeWallpapers.js`, `src/spaceWallpapers.js`, `src/background.js` và `public/backgrounds/`.
- Ba ảnh vũ trụ đã xuất WebP 1600 × 900 và ảnh thu nhỏ 480 × 270. `npm run check` đạt 30 bài kiểm thử qua `npm run package`. Chrome headless xác minh bộ lọc EN/VI, preview, áp dụng và giữ ảnh qua hai New Tab. [Tiến độ](PROGRESS.md)
- ImageGen chặn đầu ra Doraemon ở đợt này.

## 26/11/2026 · Bổ sung wallpaper sau Phase 7

| Mục | Trạng thái |
| --- | --- |
| Công việc phiên này | Thêm 13 wallpaper anime, đưa Thư viện lên 46 hình nền, thêm bộ lọc Phong cảnh và gắn nhãn Thiên nhiên theo nội dung |
| Tệp chính | [animeWallpapers.js](src/animeWallpapers.js), [themeCatalog.js](src/themeCatalog.js), [bảng đối chiếu ảnh nguồn](docs/ANIME_WALLPAPERS.md) |
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

> Đọc AGENTS.md, PROJECT_CONTEXT.md, HANDOVER.md và PROGRESS.md. Kiểm tra Git status và mã hiện tại, giữ các thay đổi có sẵn rồi tiếp tục theo yêu cầu của tôi. Mốc bàn giao là bản 1.1.0 đã hoàn thành Phase 1–7, có trình chỉnh widget ngay trên New Tab, Thư viện 51 theme với nhóm Conan và Doraemon, logo Xoài thuôn và bộ Store Listing.

Mỗi tài khoản ChatGPT Business có lịch sử Codex riêng. Tính năng Share của Codex desktop tạo bản chụp chỉ đọc, có thể đính kèm để tham khảo trong chat mới. Quy trình trên dùng mã và tài liệu trong thư mục chung để tiếp tục công việc. [Quyền xem lịch sử Business](https://help.openai.com/en/articles/8798634-managing-data-sharing-and-privacy-in-chatgpt-business) · [Chia sẻ bản chụp Codex](https://learn.chatgpt.com/docs/use-chatgpt#share-a-read-only-snapshot-of-a-codex-thread)
