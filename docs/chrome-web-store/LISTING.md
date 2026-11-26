# NewTab Studio trên Chrome Web Store

Nội dung để điền Developer Dashboard cho bản 0.6.8. Hình ảnh sử dụng logo **04 · Xoài thuôn**.

## Thông tin gói

| Trường | Nội dung |
| --- | --- |
| Tên trong gói | NewTab Studio |
| Gói tiện ích | [newtab-studio-0.6.8.zip](../../newtab-studio-0.6.8.zip) |
| Ngôn ngữ mặc định | English. Thêm phần mô tả tiếng Việt ở ngôn ngữ Vietnamese. |
| Danh mục đề xuất | Functionality & UI |
| Video quảng cáo | Để trống nếu chưa có video. |

Tên và phần tóm tắt trong gói lấy từ manifest và metadata theo ngôn ngữ. Sao chép phần **Mô tả** vào ô mô tả dài của từng ngôn ngữ. [Hướng dẫn Store Listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) · [Danh mục extension](https://developer.chrome.com/docs/webstore/best-practices#choose-your-extensions-category-well)

## Tiếng Việt

### Tóm tắt trong gói

```text
Cá nhân hóa tab mới của Chrome với hình nền, tiện ích và bố cục do bạn thiết kế.
```

### Mô tả

```text
NewTab Studio thay thế trang tab mới của Chrome bằng một không gian bạn có thể tự thiết kế. Chọn một trong 33 theme có hình nền dựng sẵn hoặc tải ảnh của bạn lên rồi sắp xếp các tiện ích theo cách bạn muốn.

• Chọn theme từ thư viện, căn ảnh theo khung hoặc tạo trình chiếu.
• Thêm chữ, câu trích dẫn, ảnh và sticker. Dùng Canvas tự do để bố trí từng lớp.
• Chọn tiện ích ngay trên New Tab, từ đồng hồ và tìm kiếm đến lịch, việc cần làm, ghi chú và bộ đếm. Kéo tiện ích vào vị trí mong muốn hoặc dùng Tự sắp xếp. Chỉnh độ đậm của nền kính mờ cho từng thẻ.
• Lưu lối tắt ngay trên New Tab hoặc hiện các trang hay truy cập và mới truy cập từ lịch sử Chrome sau khi cấp quyền.
• Đặt lịch đổi theme ngày và đêm, chỉnh hiệu ứng hoặc bật chế độ tập trung.

Thiết kế và tùy chọn được lưu trong hồ sơ Chrome trên thiết bị. Miễn phí, không cần tài khoản. Hỗ trợ tiếng Việt và tiếng Anh.
```

## English

### Package summary

```text
Make your Chrome New Tab your own with wallpapers, widgets, and custom layouts.
```

### Store description

```text
NewTab Studio replaces Chrome’s New Tab page with a space you can design. Choose from 33 built-in wallpaper themes, upload your own wallpaper, or keep your New Tab simple and let the image fill the screen.

• Browse theme presets, choose how an image fits, or set up a slideshow.
• Add text, quotes, images, and stickers. Arrange layers on a free canvas.
• Choose widgets right on New Tab, from clocks and search to calendar, to-dos, notes, and timers. Drag them into place or use Auto Arrange, and adjust the opacity of each glass card.
• Save shortcuts on New Tab or show frequently and recently visited pages from Chrome history with your permission.
• Schedule day and night themes, add visual effects, or switch to Focus Mode.

Your designs and preferences are stored locally in your Chrome profile. Free to use, with no account required. Available in English and Vietnamese.
```

## Trường Privacy trong Developer Dashboard

### Single purpose

```text
NewTab Studio replaces Chrome’s New Tab page with a customizable page. Users can choose a theme, arrange widgets, and personalize the layout and wallpaper of their own New Tab page.
```

### Lý do yêu cầu quyền storage

```text
NewTab Studio uses Chrome’s storage permission to keep the user’s extension preferences within the local Chrome profile. These include language, favorite themes, the theme schedule, and focus and performance settings. This lets the extension restore the user’s preferences across New Tab sessions.
```

### Lý do yêu cầu quyền history tùy chọn

```text
NewTab Studio requests the optional history permission only when the user selects Frequently visited or Recently visited in the Quick links widget. The widget reads page URLs, titles, and visit metadata from the local Chrome profile to display the selected view. History results are processed on the device and are not stored in the extension database, exported, or transferred to the developer. Manually saved shortcuts work without this permission.
```

### Mã từ xa

No. All executable code is included in the extension package. User-initiated searches and shortcuts open external web pages in Chrome.

### URL chính sách riêng tư

```text
https://gist.github.com/levanhuy1996bn/bacf71a7bbb6f358a9cc332e5ecf9d27
```

Trước khi gửi bản 0.6.8, chủ tài khoản cập nhật Gist bằng chính sách [PRIVACY.md](PRIVACY.md) để bổ sung phần quyền lịch sử tùy chọn.

### Khai báo sử dụng dữ liệu và ba ô xác nhận

Thiết kế, ảnh, ghi chú, công việc và tùy chọn được lưu trong hồ sơ Chrome. Extension không có hệ thống phân tích, backend hay đồng bộ của nhà phát triển. Khi người dùng gửi tìm kiếm hoặc mở lối tắt, Chrome điều hướng đến dịch vụ họ chọn. Truy vấn được gửi đến công cụ tìm kiếm đã chọn.

Ba ô trong ảnh là phần xác nhận của chủ tài khoản Developer Dashboard. Đối chiếu chính sách và gói tải lên rồi tự xác nhận các nội dung về bán hoặc chuyển dữ liệu, giới hạn sử dụng theo mục đích duy nhất và không sử dụng dữ liệu cho mục đích tín dụng hoặc cho vay. Bản 0.6.8 khai báo `storage` và quyền tùy chọn `history`. Khi điền khai báo, đối chiếu phần lịch sử duyệt web với cách sử dụng mô tả trong chính sách. [Hướng dẫn điền Privacy](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)

## Tài nguyên hình ảnh

| Vị trí | Tệp |
| --- | --- |
| Biểu tượng 128×128 PNG trong suốt | [Logo 04 · Xoài thuôn](../../public/icons/icon-128.png), trùng biểu tượng trong gói. |
| Screenshot 1280×800 JPEG | [New Tab](screenshots/01-wallpaper-new-tab.jpg), [thư viện](screenshots/02-theme-gallery.jpg), [Visual Editor](screenshots/03-visual-editor.jpg), [widget](screenshots/04-widgets.jpg), [chỉnh nền](screenshots/05-background-studio.jpg). |
| Ô quảng cáo nhỏ 440×280 | [small-promo.png](small-promo.png) |
| Marquee 1400×560 | [marquee.png](marquee.png), tùy chọn. |

Google yêu cầu icon và ít nhất một ảnh chụp màn hình, cho phép tối đa năm ảnh. Tài liệu hình ảnh và hướng dẫn dashboard mô tả khác nhau về việc bắt buộc có ô quảng cáo nhỏ. Bộ này chuẩn bị sẵn cả ô nhỏ. [Quy cách ảnh](https://developer.chrome.com/docs/webstore/images) · [Hướng dẫn Store Listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)

## Distribution và ghi chú review

Tiện ích miễn phí. Chủ tài khoản chọn phạm vi hiển thị và khu vực phát hành trong Dashboard. Dùng bản 0.6.8 cho bộ nội dung này. [Hướng dẫn Distribution](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)

Nếu điền trường **Test instructions**, dùng đoạn sau.

> Install the extension and open a new Chrome tab. Open Theme Gallery from the left rail, preview a theme, and apply it. In Customize, open Background Studio to choose a wallpaper or upload a local image. Use Edit widgets on the left rail to show a widget, drag it into position, and save. Enable Quick links to test Add shortcut. The Frequently visited and Recently visited views ask for optional history access. No account or test credentials are required.
