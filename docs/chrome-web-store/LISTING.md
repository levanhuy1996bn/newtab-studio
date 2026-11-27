# Mango New Tab Studio Wallpapers & Widgets trên Chrome Web Store

Nội dung để điền Developer Dashboard cho bản 1.1.0. Hình ảnh sử dụng logo **04 · Xoài thuôn**.

## Thông tin gói

| Trường | Nội dung |
| --- | --- |
| Tên trong gói | Mango New Tab Studio Wallpapers & Widgets |
| Gói tiện ích | `newtab-studio-1.1.0.zip` sau khi đóng gói từ mã nguồn hiện tại |
| Ngôn ngữ mặc định | English. Thêm phần mô tả tiếng Việt ở ngôn ngữ Vietnamese. |
| Danh mục đề xuất | Functionality & UI |
| Video quảng cáo | Để trống nếu chưa có video. |

Tên và phần tóm tắt trong gói lấy từ manifest và metadata theo ngôn ngữ. Sao chép phần **Mô tả** vào ô mô tả dài của từng ngôn ngữ. [Hướng dẫn Store Listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) · [Danh mục extension](https://developer.chrome.com/docs/webstore/best-practices#choose-your-extensions-category-well)

## Tiếng Việt

### Tóm tắt trong gói

```text
Tùy chỉnh tab mới với 51 hình nền, tiện ích kéo thả và lối tắt. Không cần tài khoản.
```

### Mô tả

```text
Mở tab mới với hình nền, lối tắt và widget bạn chọn. Tự sắp xếp bố cục để mở trang hay dùng, xem lịch hoặc ghi nhanh ngay trong Chrome.

HÌNH NỀN VÀ BỐ CỤC
• Chọn từ 51 hình nền có sẵn, tải ảnh của bạn lên hoặc tạo trình chiếu. Đặt lịch đổi theme theo ngày và đêm.
• Dùng Canvas tự do để bố trí chữ, ảnh, sticker và widget. Chọn Tự sắp xếp nếu muốn widget tự vừa với cửa sổ.

WIDGET VÀ LỐI TẮT
• Bật đồng hồ, tìm kiếm, lịch, việc cần làm, ghi chú hoặc bộ đếm ngay trên tab mới. Kéo widget đến vị trí bạn muốn, đổi kích thước và chỉnh độ đậm nền kính mờ.
• Đọc châm ngôn mỗi ngày bằng tiếng Anh hoặc tiếng Việt. Dùng hai nút mũi tên để xem câu trước hoặc câu tiếp theo.
• Lưu và sửa lối tắt ngay trên tab mới. Chọn Hay truy cập hoặc Mới truy cập để hiện các trang từ lịch sử Chrome sau khi cấp quyền tùy chọn.
• Bật Chế độ tập trung khi muốn thu gọn giao diện.

THEME CỦA TÔI VÀ SAO LƯU
• Nhân bản theme, lưu bản nháp và sắp xếp thiết kế theo workspace.
• Xuất theme kèm ảnh hoặc tải bản sao lưu đầy đủ để chuyển sang hồ sơ Chrome khác.

Thiết kế và tùy chọn được lưu trong hồ sơ Chrome trên thiết bị. Miễn phí, không cần tài khoản. Có tiếng Việt và tiếng Anh.
```

## English

### Package summary

```text
Customize your new tab with 51 wallpapers, draggable widgets, and shortcuts. No account required.
```

### Store description

```text
Open a new tab with the wallpapers, shortcuts, and widgets you choose. Arrange them around the sites you visit, the notes you keep, or the tasks you want to see.

WALLPAPERS AND LAYOUTS
• Choose from 51 built-in wallpapers, upload your own images, or create a slideshow. Schedule different themes for day and night.
• Arrange text, images, stickers, and widgets on a free canvas. Use Auto Arrange to fit widgets to your window.

WIDGETS AND SHORTCUTS
• Add clocks, search, a calendar, to-dos, notes, or timers right on your new tab. Drag widgets into place, resize them, and adjust the opacity of their glass backgrounds.
• Read a daily quote in English or Vietnamese. Use the arrow buttons to browse previous and next quotes.
• Save and edit shortcuts on the new tab page. Choose Frequently visited or Recently visited to display pages from Chrome history after granting optional access.
• Turn on Focus Mode for a simpler view.

MY THEMES AND BACKUPS
• Duplicate themes, save drafts, and organize your designs into workspaces.
• Export a theme with its images or download a full backup to move your setup to another Chrome profile.

Designs and preferences are stored locally in your Chrome profile. Free to use, with no account required. Available in English and Vietnamese.
```

## Trường Privacy trong Developer Dashboard

### Single purpose

```text
Mango New Tab Studio Wallpapers & Widgets replaces Chrome’s New Tab page with a customizable page. Users can choose a theme, arrange widgets, and personalize the layout and wallpaper of their own New Tab page.
```

### Lý do yêu cầu quyền storage

```text
Mango New Tab Studio Wallpapers & Widgets uses Chrome’s storage permission to keep the user’s extension preferences within the local Chrome profile. These include language, favorite themes, the theme schedule, and focus and performance settings. This lets the extension restore the user’s preferences across New Tab sessions.
```

### Lý do yêu cầu quyền history tùy chọn

```text
Mango New Tab Studio Wallpapers & Widgets requests the optional history permission only when the user selects Frequently visited or Recently visited in the Quick links widget. The widget reads page URLs, titles, and visit metadata from the local Chrome profile to display the selected view. History results are processed on the device and are not stored in the extension database, exported, or transferred to the developer. Manually saved shortcuts work without this permission.
```

### Mã từ xa

No. All executable code is included in the extension package. User-initiated searches and shortcuts open external web pages in Chrome.

### URL chính sách riêng tư

```text
https://gist.github.com/levanhuy1996bn/bacf71a7bbb6f358a9cc332e5ecf9d27
```

Trước khi gửi bản 1.1.0, chủ tài khoản cập nhật Gist bằng chính sách [PRIVACY.md](PRIVACY.md) để cập nhật phần quyền lịch sử tùy chọn và bản sao lưu.

### Khai báo sử dụng dữ liệu và ba ô xác nhận

Thiết kế, ảnh, ghi chú, công việc và tùy chọn được lưu trong hồ sơ Chrome. Extension không có hệ thống phân tích, backend hay đồng bộ của nhà phát triển. Khi người dùng gửi tìm kiếm hoặc mở lối tắt, Chrome điều hướng đến dịch vụ họ chọn. Truy vấn được gửi đến công cụ tìm kiếm đã chọn.

Ba ô trong ảnh là phần xác nhận của chủ tài khoản Developer Dashboard. Đối chiếu chính sách và gói tải lên rồi tự xác nhận các nội dung về bán hoặc chuyển dữ liệu, giới hạn sử dụng theo mục đích duy nhất và không sử dụng dữ liệu cho mục đích tín dụng hoặc cho vay. Bản 1.1.0 khai báo `storage` và quyền tùy chọn `history`. Khi điền khai báo, đối chiếu phần lịch sử duyệt web với cách sử dụng mô tả trong chính sách. [Hướng dẫn điền Privacy](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)

## Tài nguyên hình ảnh

| Vị trí | Tệp |
| --- | --- |
| Biểu tượng 128×128 PNG trong suốt | [Logo 04 · Xoài thuôn](../../public/icons/icon-128.png), trùng biểu tượng trong gói. |
| Screenshot 1280×800 JPEG | [New Tab](screenshots/01-wallpaper-new-tab.jpg), [thư viện](screenshots/02-theme-gallery.jpg), [Visual Editor](screenshots/03-visual-editor.jpg), [widget](screenshots/04-widgets.jpg), [My Themes](my-themes-1.1.jpg). |
| Ô quảng cáo nhỏ 440×280 | [small-promo.png](small-promo.png) |
| Marquee 1400×560 | [marquee.png](marquee.png), tùy chọn. |

Google yêu cầu icon và ít nhất một ảnh chụp màn hình, cho phép tối đa năm ảnh. Tài liệu hình ảnh và hướng dẫn dashboard mô tả khác nhau về việc bắt buộc có ô quảng cáo nhỏ. Bộ này chuẩn bị sẵn cả ô nhỏ. [Quy cách ảnh](https://developer.chrome.com/docs/webstore/images) · [Hướng dẫn Store Listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)

## Distribution và ghi chú review

Tiện ích miễn phí. Chủ tài khoản chọn phạm vi hiển thị và khu vực phát hành trong Dashboard. Dùng bản 1.1.0 cho bộ nội dung này. [Hướng dẫn Distribution](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)

Nếu điền trường **Test instructions**, dùng đoạn sau.

> Install the extension and open a new Chrome tab. Open Theme Gallery from the left rail, preview a theme, and apply it. In Customize, open Background Studio to choose a wallpaper or upload a local image. Use Edit widgets on the left rail to show a widget, drag it into position, and save. Enable Quick links to test Add shortcut. The Frequently visited and Recently visited views ask for optional history access. No account or test credentials are required.
