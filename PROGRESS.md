# Tiến độ

## 2026-11-26 · Widget lối tắt trên New Tab

- Bản 0.6.8 mở rộng Liên kết nhanh thành các ô lối tắt. Thêm, sửa và gỡ trang ngay trên New Tab. Cài đặt widget chọn Đã lưu, Hay truy cập hoặc Mới truy cập. Giữ danh sách từ thiết kế cũ và lưu chỉnh sửa mới trong IndexedDB theo ID widget.
- Lịch sử chỉ được đọc sau khi người dùng chọn nguồn lịch sử và Chrome cấp quyền `history` tùy chọn. Sắp xếp trên thiết bị và cập nhật khi lịch sử thay đổi. Bản đóng gói giữ quyền bắt buộc `storage`.
- `npm run check` đạt 25 bài kiểm thử, build Manifest V3 và [ZIP 0.6.8](newtab-studio-0.6.8.zip) đạt. Chrome 158 xác minh bật widget và thêm, sửa, xóa qua hai New Tab trên bản đóng gói. Bản kiểm thử được cấp quyền lịch sử trong hồ sơ tạm xác minh truy vấn Chrome thật, thứ tự Hay truy cập và Mới truy cập, cập nhật sau khi xóa lịch sử và chuyển về Đã lưu. Hộp thoại xác nhận quyền của Chrome chưa được chấp thuận thủ công trong lần chạy headless.
- Đã cập nhật [mô tả Store và lý do quyền history](docs/chrome-web-store/LISTING.md) cùng [chính sách quyền riêng tư](docs/chrome-web-store/PRIVACY.md). Chủ tài khoản cập nhật bản Gist trước khi gửi v0.6.8. Phase 7 còn quản lý theme và backup/restore.

## 2026-11-26 · Phân loại wallpaper trong Thư viện

- Giữ đủ các bộ lọc. Gắn thêm nhãn theo nội dung ảnh. Thiên nhiên có 21 ảnh, Anime 27 ảnh, Hoài niệm 3 ảnh, Bầu trời 5 ảnh và Tất cả 33 ảnh.
- `npm run check` đạt 24 bài kiểm thử và build Manifest V3. Chrome 158 xác minh số ảnh ở từng bộ lọc, tìm kiếm tiếng Việt không dấu và áp dụng Bờ đá tầng lớp từ Thiên nhiên về New Tab. [ZIP 0.6.7](newtab-studio-0.6.7.zip) đã qua kiểm tra.
- Phase 7 tiếp tục với quản lý theme, backup/restore và Developer Dashboard.

## 2026-11-26 · Chỉnh widget trực tiếp trên New Tab

- Bản 0.6.6 thêm nút **Chỉnh tiện ích** ở thanh trái. Chọn một trong 11 loại, kéo bằng chuột hoặc cảm ứng, dùng phím mũi tên, hoặc chỉnh độ đậm của nền kính mờ. Mặc định nền kính 26%. Ẩn rồi hiện lại giữ ID, vị trí và dữ liệu widget.
- Khi lưu vị trí trên theme Tự sắp xếp, theme chuyển sang Canvas tự do. Thay đổi hiển thị giữ chế độ hiện tại. Ở 390 px, có thể kéo trong trình chỉnh và dùng thẻ phân trang khi đóng trình chỉnh.
- `npm run check` đạt 24 bài kiểm thử và build Manifest V3. Chrome 158 trong hồ sơ tạm xác minh kéo chuột và cảm ứng, di chuyển bằng phím, chỉnh nền, Lưu/Hủy, giữ việc cần làm và ghi chú khi mở tab khác, ẩn và bật lại, giao diện tiếng Việt, cùng chuyển đổi Tự sắp xếp sang Canvas tự do. Kiểm tra lại 33 wallpaper, lịch Dune Walk, năm ảnh Store và [ZIP 0.6.6](newtab-studio-0.6.6.zip).
- Còn lại trong Phase 7 là quản lý theme, backup/restore và thao tác Developer Dashboard. Weather tiếp tục chờ đánh giá nguồn.

## 2026-11-26 · Bộ wallpaper anime từ 22 ảnh tham chiếu

- Vẽ lại 22 ảnh trong `assets/` bằng ImageGen, xuất WebP và thumbnail 480 px, đưa vào nhóm Anime. Thư viện có 33 theme. Ảnh gốc vẫn ở `assets/`. [Bảng đối chiếu ảnh gốc và WebP](docs/ANIME_WALLPAPERS.md)
- `20180324_103009.jpg` tương ứng với Bờ đá tầng lớp. Đã sửa Ánh chiều trên ghềnh đá từ `20180326_143940.jpg`: thân và chân hướng ra trước, mặt nhìn nhẹ sang trái theo ảnh gốc. Đã cập nhật cả wallpaper, thumbnail và bảng xem.
- `npm run check` đạt 24 bài kiểm thử và build MV3. Chrome xác minh 33 theme, bộ lọc Anime có 27 kết quả, hai ảnh được hỏi tải được và ảnh đã sửa phủ khung ở 390 px. Đã chụp lại năm ảnh Store và kiểm tra [ZIP 0.6.5](newtab-studio-0.6.5.zip) chứa 22 wallpaper mới cùng thumbnail.

## 2026-11-26 · Thư viện 11 theme có wallpaper

- Gỡ Dune Walk, Pacific Tide, Moss Valley, Clay Coast, Film Club, Radio Days và Postcard khỏi danh mục chọn mới. ID cũ vẫn đọc được khi có thiết kế hoặc lịch đã lưu.
- Chụp lại năm screenshot Store. Xác minh năm ảnh JPEG 1280×800, hai ảnh quảng cáo đúng kích thước và biểu tượng PNG trong suốt. [LISTING.md](docs/chrome-web-store/LISTING.md) có các khối văn bản riêng cho từng trường mô tả và Privacy.
- `npm run check` đạt 24 bài kiểm thử và build MV3. Chrome xác minh 11 wallpaper và lịch cũ Dune Walk. Đã kiểm tra [ZIP 0.6.4](newtab-studio-0.6.4.zip).

## 2026-11-26 · Thu gọn Thư viện theme

- Bản 0.6.3 gỡ 27 mẫu minh họa được chỉ ra trong hai ảnh khỏi Thư viện, tìm kiếm và bộ chọn lịch mới. Thư viện còn 18 mẫu, gồm 11 wallpaper. Nhóm Tối giản, Trừu tượng và Đêm không còn mẫu hiển thị nên đã bỏ bộ lọc tương ứng.
- Thiết kế và lịch đã lưu vẫn đọc được bằng ID cũ. Lịch ngày/đêm mới mặc định dùng Chuyến tàu ven biển vào buổi tối.
- `npm run check` đạt 24 bài kiểm thử và build Manifest V3. Chrome 158 xác minh đầy đủ 27 mẫu đã gỡ, 11 wallpaper và lịch cũ dùng Midnight Orbit. Đã chụp lại năm ảnh Store, cập nhật [LISTING.md](docs/chrome-web-store/LISTING.md) và kiểm tra [ZIP 0.6.3](newtab-studio-0.6.3.zip).

## 2026-11-26 · Logo đã chọn và nội dung Chrome Web Store

- Bản 0.6.2 dùng logo 04 Xoài thuôn cho icon 16/32/48/128 px, favicon và đầu trang trong trình chỉnh sửa. Tóm tắt EN/VI trong gói đồng bộ với mô tả Store Listing.
- [File điền Developer Dashboard](docs/chrome-web-store/LISTING.md) gom mô tả EN/VI, Privacy, quyền `storage`, khai báo mã từ xa, nguồn ảnh và ghi chú review. Gist do chủ dự án cung cấp trả HTTP 200 khi không đăng nhập và hiển thị chính sách song ngữ.
- `npm run check` đạt 23 bài kiểm thử, Vite build và kiểm tra Manifest V3. Chrome headless xác nhận logo mới và favicon, chụp năm ảnh 1280×800 và tạo lại hai ô quảng cáo. [ZIP 0.6.2](newtab-studio-0.6.2.zip) đã được kiểm tra với manifest ở gốc.

## 2026-11-26 · Vòng hai thiết kế logo

- Thêm mẫu 04 Xoài thuôn, 05 X rỗng và 06 Nét bút. Bảng xem hiển thị các mẫu ở 16, 24 và 32 px trên nền sáng và tối. Đã xác minh cả ba PNG 128×128 có nền trong suốt. [Bảng xem vòng hai](docs/chrome-web-store/logo-preview-v2.png)
- Bộ icon trong extension chờ chọn mẫu. `npm run check` đạt 23 bài kiểm thử và build Manifest V3, Chrome xác nhận New Tab mở được trong hồ sơ tạm.
- Chủ dự án sẽ tự đăng [chính sách riêng tư](docs/chrome-web-store/PRIVACY.md) lên GitHub Gist.

## 2026-11-26 · Logo và bản nháp Chrome Web Store

- Vẽ ba mẫu logo xoài chữ X và xuất SVG cùng PNG trong suốt 128×128. [Bảng xem mẫu](docs/chrome-web-store/logo-preview.png)
- Chụp năm ảnh giao diện thật 1280×800 trong hồ sơ Chrome tạm với dữ liệu mẫu. Xuất ô quảng cáo 440×280 và marquee 1400×560. Xác minh kích thước và định dạng của từng ảnh. `npm run check` đạt 23 bài kiểm thử, Vite build và xác minh Manifest V3.
- [Nội dung Store Listing EN/VI](docs/chrome-web-store/LISTING.md) có mục đích duy nhất và giải trình quyền `storage`. [Chính sách riêng tư EN/VI](docs/chrome-web-store/PRIVACY.md) đã được chuẩn bị để chủ dự án đăng trên GitHub Gist.
- Mẫu logo chờ chọn. Bản build 0.6.1 đang dùng bộ biểu tượng hiện tại.

## 2026-11-26 · Tinh chỉnh New Tab đầu Phase 7

- Bản 0.6.1 gom thao tác vào thanh trái, mở tùy chỉnh theo yêu cầu. Widget Trong mờ dùng nền bán trong suốt. New Tab phân trang widget tự sắp xếp theo diện tích khả dụng. Vị trí Canvas tự do vẫn được đọc từ design đã lưu.
- Background Studio thêm **Phủ khung (cắt viền)**, **Đặt lại khung cắt giữa** và **Vừa khung (giữ toàn ảnh)**. Ảnh mới bắt đầu ở giữa. Vừa khung giữ đúng tỷ lệ và giữ nguyên kích thước ảnh nhỏ. Theme cũ giữ cách phủ trước đó.
- Thêm [Đèn làng sau mưa](docs/WALLPAPERS.md#đèn-làng-sau-mưa), ảnh nguyên bản tạo bằng ImageGen. Gallery có 45 preset và 11 theme dùng wallpaper.
- `npm run check` đạt 23 bài kiểm thử, Vite build và Manifest V3. Chrome headless 158 xác minh không cuộn toàn trang hoặc chồng widget ở 3440×1440, 1366×768, 1024×620, 390×844 và 320×480 với chín widget Tự sắp xếp. Kiểm tra phím Escape, đổi trang giữ nội dung Search nháp, Canvas tự do, Chế độ tập trung, tiếng Việt và việc tải PNG 128×128 rồi lưu Vừa khung qua reload đều đạt.
- Tiện ích kết nối đã nhận diện trang NewTab Studio trong hồ sơ Chrome đang mở. Kiểm thử bản 0.6.1 thực hiện riêng trong hồ sơ tạm.

## 2026-11-26 · Phase 6 hoàn thành

- Bản 0.6.0 mở **Hiệu ứng** từ New Tab và bản xem thử trong thư viện. Mỗi theme có thể lưu tuyết, lá rơi, sao, mưa, hạt, chuyển màu hoặc parallax cho nền, cùng hiệu ứng chữ/widget với tốc độ, cường độ và cách phát. Cấu hình xuất cùng JSON bố cục nếu theme có hiệu ứng.
- Lịch hỗ trợ ngày/đêm và tối đa tám khung theo giờ thiết bị, kể cả qua nửa đêm. Khi trùng, khung đầu tiên được ưu tiên. Ngoài khung dùng Forest Hour mặc định. Áp dụng thủ công khi lịch bật chỉ ưu tiên trong tab hiện tại. Chế độ tập trung và hiệu năng lưu cục bộ theo hồ sơ.
- `npm run check` đạt trên Node 22.23.3 với 22 unit test, Vite build và kiểm tra gói Manifest V3. Bản 0.6.0 sẵn trong `dist/`.
- Chrome headless 158.0.8127.89 chạy trang New Tab thật với **Tự sắp xếp** và **Canvas tự do**. Đã thử bảy hiệu ứng nền, chữ/widget, phát một lần/lặp lại, chế độ tập trung, hiệu năng, mô phỏng `prefers-reduced-motion` và chuyển tab thật để kiểm tra tạm dừng và tiếp tục. Lịch đã qua kiểm tra ranh giới ngày/đêm, nửa đêm, khung trùng, giờ trống, ưu tiên thủ công qua reload và trở lại theo lịch. Đã kiểm tra giao diện EN/VI.
- Mẫu Chrome headless với 64 lớp canvas và 24 hạt trong 2,1 giây ghi nhận 0 lần layout mới, 0,3 ms thực thi script và 37,3 ms task qua CDP. Đây là số đo trên máy hiện tại; Phase 7 tiếp tục đo cold start và tải ảnh.
- Hồi quy hai bố cục đạt ở 3440, 1366, 1024 và 390 px. Bộ Phase 5 xác nhận cả 11 widget, dữ liệu IndexedDB cũ, undo/redo, timer sau khởi động lại, xuất thiết kế và Canvas tự do offline ở 320 px.
- Bước tiếp theo là [Phase 7 · Theme Management, Optimization & Publishing](docs/phases/PHASE_07_RELEASE.md).

## 2026-11-26 · Tự sắp xếp widget theo theme

- Bản 0.5.3 thêm lựa chọn **Tự sắp xếp** trong Visual Editor, thứ tự ưu tiên bằng mũi tên, và xem thử trong editor và thư viện. New Tab xếp các widget hiển thị thành hàng với thứ tự ưu tiên đã lưu. Canvas tự do dùng lại tọa độ, kích thước, góc xoay và thứ tự lớp đã lưu. Chế độ và thứ tự nằm trong `canvas.widgetLayout` của từng theme.
- `npm run check` đạt trên Node 22.23.3 với 20 unit test, Vite build và xác minh gói MV3. Bản mới nằm trong `dist/`.
- Chrome headless 158.0.8127.89 mở New Tab thật bằng extension trong hồ sơ tạm. Cùng một theme có sáu widget hiển thị 5, 4, 3 và 1 widget ở hàng đầu tại 3440×1440, 1366×768, 1024×768 và 390×844. Không thấy tràn ngang. Nền phủ vùng hiển thị và ô Search giữ nội dung nháp cùng focus qua các lần đổi chiều rộng.
- Đã xác minh thứ tự ưu tiên, lớp ẩn, chế độ riêng theo theme, giao diện EN/VI, đồng bộ Todo và Notes giữa hai tab và submit Search với dữ liệu mã hóa qua chặn yêu cầu trước khi gửi. Canvas cũ giữ nguyên ID và hình học sau khi đổi chế độ. Mở lại tab vẫn giữ thiết lập và ghi chú.
- Hồi quy Phase 5 trên Chrome đạt với cả 11 loại widget, preset, undo/redo, nâng IndexedDB v1 lên v2, timer sau khi khởi động lại, xuất thiết kế và Canvas tự do ở 320 px khi offline.
- Bước tiếp theo là Phase 6 · Animation & Advanced Customization.

## 2026-11-26 · Đánh giá feedback SuperStart

- Đối chiếu bố cục, dữ liệu cục bộ và 11 widget với feedback. Ghi đề xuất ưu tiên bố cục thích ứng, chuyển cấu hình giữa máy và tích hợp lịch theo từng bước trong [HANDOVER.md](HANDOVER.md#đánh-giá-feedback--26112026).
- Đợt này chỉ đánh giá và cập nhật tài liệu trên bản 0.5.2.

## 2026-11-26 · Wallpaper phong cảnh, Anime và Hoài niệm

- Bản 0.5.2 bổ sung bảy cảnh ImageGen, gồm đường xuyên rừng, người đứng nhìn từ đỉnh núi và hai cảnh quê Việt xưa. Gallery có 44 preset, ưu tiên 10 preset có wallpaper. Forest Hour và Alpine Air dùng ảnh mới với ID cũ.
- Ảnh và thumbnail WebP đóng gói cục bộ. Xem prompt và từng tệp trong [bộ wallpaper](docs/WALLPAPERS.md).
- `npm run check` đạt 19 unit test và build. Chrome kiểm tra bộ lọc Anime và Hoài niệm, preview, áp dụng toàn khung nhìn, 320 px, offline, dùng lại ảnh từ Background Studio và hồi quy widget.

## 2026-11-26 · Nền New Tab phủ toàn khung nhìn

- Bản 0.5.1 đặt nền phủ viewport phía sau điều hướng, chữ, canvas và widget. Ảnh giữ tỷ lệ và dùng cách hiển thị cover. Công cụ chỉnh sửa tiếp tục dùng khung xem riêng.
- Áp dụng từ thư viện mở ngay New Tab và phục hồi nền tùy chỉnh khi chọn lại theme đã lưu. [Nguồn ảnh và vị trí lưu](docs/phases/PHASE_02_BACKGROUND.md#nguồn-và-vị-trí-lưu-nền)
- `npm run check` đạt 19 unit test và build. Chrome xác nhận phủ viewport cho preset, ảnh, màu đơn, gradient, ở màn hình desktop, ultrawide và 320 px. Kiểm tra chọn lại nền, tải offline, đồng bộ tab và hồi quy widget đã pass.

## 2026-11-26 · Phase 5 hoàn thành

### Đã triển khai

- Bản 0.5.0 có 11 widget EN/VI gồm đồng hồ số/kim, ngày và lời chào, tìm kiếm, liên kết nhanh, lịch, Todo, Notes, châm ngôn mỗi ngày, Pomodoro và đếm ngược.
- Thêm ba bố cục Tối giản, Công việc và Học tập vào Visual Editor. Mỗi lần chèn cấp ID mới và được hoàn tác trong một bước. Khi vùng mặc định bận, thử dời hoặc thu nhỏ cụm widget.
- Canvas giữ cấu hình trình bày. IndexedDB v2 thêm kho widgetData cho Todo, Notes và timer, đồng bộ theo ID lớp qua các tab. New Tab ở màn hình hẹp dồn widget thành thẻ. Tệp JSON xuất ra chứa thiết kế và tham chiếu ảnh.
- Sửa thao tác kéo canvas khi Chrome nhả pointer capture dù con trỏ còn nhấn. Weather là phần tùy chọn và để lại sau khi đánh giá nguồn phù hợp.

### Đã xác minh

- `npm run check` pass trên Node 22.23.3. Mười chín unit test pass, Vite build thành công và gói Manifest V3 vượt kiểm tra.
- Smoke test Chrome headless 158.0.8127.89 kiểm tra New Tab thật, nâng IndexedDB v1 lên v2, giữ canvas cũ, chèn preset, undo, 11 loại widget, kiểm tra HTTP/HTTPS và bắt submit tìm kiếm đã mã hóa trước khi gửi ra mạng.
- Hai tab tạo Todo đồng thời, đồng bộ đánh dấu và Notes. Lịch đổi đúng khi mô phỏng qua nửa đêm, timer giữ mốc đích sau khởi động lại và báo hết giờ. JSON tải xuống giữ cấu hình, tách Todo, Notes và timer. Kiểm tra tải lại offline và bố cục 320 px.
- Chạy lại hồi quy Chrome Phase 1–4 với mất pointer capture có chủ đích khi kéo, hủy pointer và cảm ứng 320 px. `dist/` chứa bản 0.5.0 sẵn sàng để nạp local.

Phase 6 · Animation & Advanced Customization là bước tiếp theo trong [lộ trình](ROADMAP.md).

## 2026-11-26 · Bàn giao trước Phase 5

- Thiết lập [bộ tài liệu bối cảnh](PROJECT_CONTEXT.md) và [hướng dẫn tiếp tục với tài khoản Codex khác](HANDOVER.md). Cập nhật quy tắc làm việc cho Codex và Claude Code.
- Kiểm tra trạng thái thư mục. Chưa có repo Git tại đường dẫn hiện tại. Đã đối chiếu checksum mã nguồn, tài nguyên, test và công cụ build khi bàn giao.
- Chạy lại `npm run check` trên Node 22.23.3. Cả 14 unit test pass, Vite build 0.4.0 thành công và gói Manifest V3 vượt kiểm tra. Kết quả Chrome New Tab của bản 0.4.0 nằm ở mục Phase 4 bên dưới.
- Mốc tiếp tục là Phase 5 · Widgets & Layout Presets. Công việc bàn giao lần này chỉ cập nhật tài liệu.

## 2026-11-26 · Phase 4 hoàn thành

### Đã triển khai

- Bản 0.4.0 thêm Visual Editor EN/VI và Free Canvas 1.200 × 675. Chèn hình chữ nhật, elip, khung viền, sticker/emoji, ảnh từ thư viện và chữ.
- Kéo thả, đổi kích thước và xoay bằng chuột hoặc cảm ứng. Có chọn nhiều, bám lưới, đường căn, căn lớp, nhập tọa độ/kích thước và phím tắt.
- Bảng layer hỗ trợ đổi tên, sắp xếp thứ tự, nhóm/tách nhóm, khóa, ẩn/hiện, nhân bản và xóa. Có menu ngữ cảnh và chế độ xem thử.
- Undo/redo giữ tối đa 80 bước trong phiên chỉnh sửa, mỗi thao tác kéo hoàn tất tạo một bước. IndexedDB lưu canvas theo preset, đọc được dữ liệu Phase 1–3 và bảo vệ ảnh được nền hoặc canvas tham chiếu.

### Đã xác minh

- `npm run check` pass trên Node 22.23.3. Mười bốn unit test pass, Vite build thành công và kiểm tra gói Manifest V3 đạt yêu cầu.
- Chrome headless 158.0.8127.89 với hồ sơ tạm kiểm tra New Tab thật và các luồng Phase 1–3. Đã thử kéo, đổi kích thước, xoay, hủy pointer, dịch bằng phím, undo/redo, nhóm, nhân bản, ẩn/khóa, xếp thứ tự, menu ngữ cảnh và xem thử.
- Canvas đồng bộ qua hai tab sau khi áp dụng, giữ nền và chữ đã lưu, chặn xóa ảnh canvas đang dùng và hiển thị lại offline sau khi khởi động Chrome với cùng hồ sơ. Kiểm tra kéo lớp bằng cảm ứng mô phỏng ở 320 px.
- `dist/` chứa bản 0.4.0 sẵn sàng để nạp local.

Phase 5 · Widgets & Layout Presets là bước tiếp theo trong [lộ trình](docs/ROADMAP.md).

## 2026-11-26 · Phase 3 hoàn thành

### Đã triển khai

- Bản 0.3.0 thêm Text Editor EN/VI từ thanh điều hướng và popup xem thử theme. Thêm, sửa hoặc xóa tối đa tám khối chữ cho mỗi preset, đặt trên hoặc dưới đồng hồ.
- Thư viện có 14 mẫu song ngữ gồm lời chào, thơ và châm ngôn. Có châm ngôn ngẫu nhiên và châm ngôn theo ngày địa phương. Chữ nhập hoặc chèn trực tiếp có thể chỉnh sửa.
- Đóng gói Lora và Noto Sans cùng giấy phép; có tùy chọn đơn cách dùng font hệ thống. Chỉnh cỡ, độ đậm, màu, giãn dòng/ký tự, căn lề, bóng, độ đục và góc xoay. Preview và New Tab dùng cùng renderer.
- Theme document v2 lưu các khối chữ trong IndexedDB. Đọc được bản ghi Phase 2 và giữ phần hình nền hoặc chữ khi cập nhật phần còn lại.

### Đã xác minh

- `npm run check` pass trên Node 22.23.3. Mười unit test pass, build Vite thành công và kiểm tra bundle gồm font, giấy phép và hình nền. Đã kiểm tra điểm mã tiếng Việt trong cả hai font.
- Trên Chrome headless 158.0.8127.89, mở New Tab từ extension, kiểm tra các luồng Phase 1–2 và nâng cấp bản ghi nền Phase 2. Chữ nhiều dòng, ký hiệu HTML dạng văn bản, thơ, châm ngôn và các thiết lập typography hiển thị đúng trong preview rồi đồng bộ qua hai tab sau khi áp dụng.
- Kiểm tra đổi ngôn ngữ châm ngôn theo ngày, chỉnh nền giữ chữ, xóa một khối giữ các khối còn lại, lưu qua khởi động lại Chrome với cùng hồ sơ, tải font offline và ngắt dòng cho 1.200 ký tự ở 320 px. Khối xoay được kiểm tra nằm trong khung.
- `dist/` chứa bản 0.3.0 sẵn sàng để nạp local.

## 2026-11-26 · Phase 2 hoàn thành

### Đã triển khai

- Bản 0.2.0 thêm Background Studio EN/VI. Chỉnh nền gốc, màu đơn, gradient, ảnh hoặc trình chiếu với bản xem trước trực tiếp.
- Thư viện có ba hình nền đóng gói kèm nguồn và khu ảnh cá nhân. Tải lên hoặc kéo thả JPG, PNG, WebP tĩnh tối đa 15 MB và 32 megapixel.
- IndexedDB lưu ảnh gốc, metadata, thumbnail và một nền tùy chỉnh cho mỗi preset. Cập nhật nền và lựa chọn đang dùng trong một transaction. Ảnh đang được dùng trong nền đã lưu được bảo vệ khỏi thao tác xóa.
- Thêm chỉnh khung ảnh bằng vị trí/zoom, độ mờ, độ sáng, tương phản, độ bão hòa, độ đục và lớp phủ. Trình chiếu hỗ trợ sắp thứ tự và tạm dừng khi tab ẩn.
- Giữ khả năng đọc lựa chọn cũ từ Phase 1 và cập nhật nền sau commit qua các tab.

### Đã xác minh

- `npm run check` pass trên Node 22.23.3. Sáu unit test pass, build Vite thành công và kiểm tra asset đóng gói đạt yêu cầu.
- Smoke test Chrome headless 158.0.8127.89 trong hồ sơ tạm. Xác minh New Tab thực sự mở trang extension, đọc lựa chọn Phase 1, hiển thị nền tùy chỉnh và đồng bộ hai tab. Ảnh tải lên và zoom còn sau khi khởi động lại Chrome với cùng hồ sơ và nạp lại extension cùng đường dẫn.
- Kiểm tra tệp hỏng và quá dung lượng, mô phỏng hết quota ở bước ghi thumbnail, xác minh rollback ảnh gốc, chặn xóa ảnh đang dùng và xóa được sau khi thay nền. Kiểm tra thứ tự và tạm dừng slideshow, hiển thị offline, locale vi và chiều rộng 320 px.
- `dist/` chứa bản 0.2.0 sẵn sàng để nạp local.

## 2026-11-26 · Phase 1 hoàn thành

### Đã triển khai

- Tạo 20 tệp tài liệu, gồm hướng dẫn Codex/Claude Code, đặc tả, kiến trúc, thiết kế, dữ liệu, kiểm thử, phát hành và đặc tả 9 Phase.
- Tạo New Tab extension Manifest V3 bằng React, Vite, JavaScript, Tailwind và Zustand. Có đồng hồ, ngày và điều hướng sang Theme Gallery.
- Thêm 36 theme, 6 nhóm, tìm kiếm EN/VI có hoặc không dấu, yêu thích, xem thử, chỉnh màu nền và điểm nhấn, áp dụng theme.
- Lưu và đồng bộ ngôn ngữ, theme đang dùng và yêu thích qua chrome.storage.local. Bản Vite phát triển dùng localStorage. Đóng gói theme, icon và metadata en/vi cục bộ.

### Đã xác minh

- 20 tệp Markdown và toàn bộ liên kết nội bộ được kiểm tra.
- `npm run check` pass trên Node 22.23.3. Ba unit test pass, Vite build thành công và bộ kiểm tra xác nhận manifest MV3, đường dẫn New Tab, bundle, icon, metadata en/vi.
- Smoke test Chrome headless 158.0.8127.89 trong profile tạm. New Tab chạy từ extension, Gallery có 36 theme, bộ lọc/tìm kiếm/yêu thích chạy, Escape trả focus, đóng preview giữ nguyên theme, đổi màu và ngôn ngữ đồng bộ qua hai tab, reload offline giữ tùy chọn, Gallery 320 px không tràn ngang và nút xóa bộ lọc khôi phục kết quả.
- Thư mục `dist/` sẵn sàng cho Load unpacked. Chưa gửi Chrome Web Store.

