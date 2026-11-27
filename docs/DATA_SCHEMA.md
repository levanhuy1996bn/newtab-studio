# Mô hình dữ liệu

## Tùy chọn Chrome và dữ liệu Phase 1

| Khóa | Kiểu | Giá trị mặc định |
| --- | --- | --- |
| `nts.language` | `en\|vi` | `en` khi chưa có lựa chọn hợp lệ |
| `nts.activeTheme` | `{ version: 1, themeId: string, overrides: null \| { base: string, accent: string } }` | Dữ liệu Phase 1 được đọc trước lần áp dụng đầu tiên trên Phase 2 |
| `nts.favorite.<themeId>` | boolean | false |

Màu tùy chỉnh dùng `#RRGGBB`, ID phải tồn tại trong catalog. Mỗi theme có tên en/vi, nhóm, họa tiết và ba màu `[base, mid, accent]`. Giá trị lỗi hoặc schema lạ có fallback lúc đọc. ID preset phải ổn định qua cập nhật. Site preview dùng cùng tên khóa riêng trong localStorage.

## Phase 2 · IndexedDB v1

Database `newtab-studio` có bốn store, dùng keyPath `id`.

| Store | Bản ghi |
| --- | --- |
| `studioSettings` | `{ id: "activeTheme", version: 1, themeId, overrides, useBackground }` |
| `themes` | `{ id: themeId, schemaVersion: 1, background, updatedAt }`, một nền đã lưu trên mỗi preset |
| `assets` | `{ id, name, kind: "upload", mime, bytes, width, height, createdAt, blob }` |
| `assetPreviews` | Metadata tương ứng và `thumbnail`, ảnh WebP cạnh dài tối đa 320 px |

- `background` là `solid | gradient | image | slideshow`. Nền gốc được biểu diễn bằng việc xóa bản ghi nền của preset khi áp dụng kiểu `preset`.
- Gradient lưu 2 màu và góc. Ảnh lưu vị trí, zoom, blur, các filter, opacity ảnh và màu/opacity lớp phủ. Slideshow lưu các tham số chung, thứ tự tối đa 12 ảnh và khoảng 2–120 giây. Vị trí Phase 2 dùng phần trăm 0–100.
- ID ảnh tải lên có tiền tố `asset:`. ID ảnh đóng gói có tiền tố `bundled:` và tra trong catalog trong bundle.
- Lựa chọn đang dùng và nền tùy chỉnh được ghi cùng transaction. Kho `themes` lưu nền khi chuyển sang preset khác. Xóa ảnh bị chặn khi nền đã lưu còn dùng ảnh. Bản nháp trong phiên được kiểm tra lại khi áp dụng.

## Phase 3 · Theme document v2

Store `themes` lưu `{ id, schemaVersion: 2, background, textLayers, updatedAt }`. `background` có thể là null khi dùng nền gốc. `textLayers` chứa tối đa tám khối, giữ thứ tự chèn trong mỗi vị trí trên hoặc dưới đồng hồ.

- Khối chữ có `id, type: "text", mode, text, entryId, font, color, alignment, placement, shadow, size, weight, lineHeight, spacing, opacity, rotation`.
- `fixed` lưu tối đa 1.200 đơn vị UTF-16 dạng plain text và khóa mẫu tùy chọn. `daily` giữ chế độ, còn nội dung được chọn từ thư viện theo ngày địa phương và ngôn ngữ.
- Khối rỗng bị loại khi áp dụng. Các giá trị font, màu và số được chuẩn hóa về danh sách và khoảng hỗ trợ.
- Đọc bản ghi v1 với `textLayers: []`. Khi lưu, transaction giữ nền hoặc chữ hiện tại nếu người dùng đang cập nhật phần còn lại. `useBackground` tiếp tục xác định có dùng nền tùy chỉnh hay không.

## Phase 4 · Theme document v3

`canvas: { layers: CanvasLayer[] }` mở rộng document v2. Mặt phẳng 1.200 × 675 px có gốc tọa độ trên trái. Mảng giữ thứ tự từ dưới lên trên, tối đa 64 lớp.

- Lớp có `id, type, name, x, y, width, height, rotation, opacity, locked, hidden, groupId, props`. Kích thước tối thiểu 24 px, rotation biểu diễn theo độ và opacity 0–100. Phần hình vượt mặt phẳng được cắt khi dựng.
- `type` nhận `rect, ellipse, frame, sticker, image, text`. Frame có `stroke`, sticker có `symbol`, image có `assetId`, text có `text, font, size`. Mỗi lớp có màu, trừ lớp ảnh dùng hình gốc.
- `groupId` có tối thiểu hai thành viên. Nhân bản tạo ID lớp và ID nhóm mới, giữ quan hệ giữa các lớp được nhân bản.
- Bản ghi cũ của preset thiếu canvas nhận lớp Daily quote mặc định khi đọc để hiển thị. Giữ canvas đã lưu, kể cả mảng lớp rỗng. Các phần nền, chữ và canvas vẫn tách riêng trong document.

## Phase 5 · IndexedDB v2 và theme document v4

- Layer canvas `type: "widget"` có `props.kind`, `props.config`, `props.surface` và `props.color`. Theme có widget được ghi với schemaVersion 4. Bản ghi v1–v3 tiếp tục đọc được.
- Từ 0.6.6, mỗi lớp widget có thể lưu `props.surfaceOpacity` từ 0 đến 100. Giá trị mặc định là 26. Giá trị điều khiển màu nền kính trên New Tab và tách riêng khỏi `layer.opacity`. Bản ghi cũ dùng mặc định khi đọc, giữ nguyên phiên bản IndexedDB.
- Từ 0.5.3, `canvas.widgetLayout` là trường tùy chọn trong document v4 và JSON xuất bố cục. `mode` nhận `free` hoặc `auto`. `order` chứa ID lớp widget theo thứ tự ưu tiên, bỏ trùng và ID không còn trong canvas. Widget chưa xếp được nối theo thứ tự layer. Bản ghi thiếu trường này dùng Canvas tự do. IndexedDB tiếp tục dùng v2.
- Kho mới `widgetData` lưu `{ id, kind, value }` theo ID layer, tách khỏi `themes`. Todo lưu `tasks: [{ id, text, done }]`. Notes lưu `text`. Timer lưu `deadline` theo epoch mili giây, `remaining` khi tạm dừng và `phase` cho Pomodoro.
- Từ 0.6.8, `widgetData` hỗ trợ `kind: "links"` với `source: "manual" | "frequent" | "recent"` và `links: null | [{ url, label }]`. `null` dùng danh sách đã lưu trong cấu hình canvas, còn `[]` là danh sách người dùng đã xóa hết. Lối tắt chỉnh trên New Tab nằm trong kho cá nhân. Kết quả lịch sử không ghi vào IndexedDB hoặc JSON. Giữ IndexedDB v2.
- `newtab-studio.layout` v1 chỉ xuất cấu hình theme, chữ, canvas và tham chiếu tài nguyên. Backup riêng sẽ xác định cách gom nội dung cá nhân cùng asset tại Phase 7.

## Phase 6 · Theme document v5

- `effects` có `backdrop`, `text`, `widget`, `speed`, `strength` và `finish`. Bản ghi v1–v4 hoặc bản ghi thiếu cấu hình được đọc với hiệu ứng tắt. IndexedDB tiếp tục dùng v2. Tệp xuất bố cục v1 có trường `effects` tùy chọn.
- `nts.schedule`, `nts.focusMode` và `nts.performanceMode` nằm trong `chrome.storage.local`. Lựa chọn thủ công khi bật lịch nằm trong `sessionStorage` của tab và chỉ ghi thiết kế vào IndexedDB nếu chỉnh theme. Lựa chọn toàn hồ sơ lưu ở `studioSettings` theo cách hiện tại.

## Phase 7 · IndexedDB v3 và bản thiết kế cá nhân

- V3 bổ sung `workspaces` và `drafts` trong lần mở đầu tiên. Dữ liệu từ v1–v2 giữ nguyên ID và được chuẩn hóa khi đọc. Các bản thiết kế v1–v5 vẫn dùng ID preset như trước. Theme cá nhân dùng ID `theme:<uuid>`, `schemaVersion: 6`, có `presetId`, `name`, `workspaceId`, bảng màu tùy chỉnh và các phần thiết kế hiện có.
- Workspace mặc định `default` được dựng khi đọc. Workspace tự tạo lưu `{ id, name }`. Gỡ workspace chuyển theme về mặc định trong cùng transaction.
- `drafts` lưu `{ id: themeId + "|" + part, themeId, part, value }` cho nền, chữ, canvas và hiệu ứng. Bản nháp được đọc khi mở trình chỉnh tương ứng. Áp dụng ghi thiết kế và xóa bản nháp đã áp dụng cùng transaction.
- `newtab-studio.theme` v1 chứa theme và ảnh được tham chiếu. `newtab-studio.backup` v1 chứa các theme, ảnh tải lên, workspace, bản nháp, dữ liệu widget, tùy chọn và theme đang dùng. Ảnh mã hóa Base64 kèm SHA-256, được kiểm MIME và giải mã trước khi ghi. Thumbnail tái tạo khi nhập. Hỗ trợ tệp layout v1 dùng ảnh có sẵn trong gói.
- Nhập thành bản sao remap ID theme, workspace, ảnh và lớp canvas, giữ cấu hình cục bộ hiện tại. Khôi phục đầy đủ thay dữ liệu trong một transaction IndexedDB. Cùng transaction ghi tùy chọn chờ đồng bộ. Nếu Chrome chưa ghi được vào `chrome.storage.local`, dữ liệu nhập và tùy chọn vẫn đọc được từ bản ghi này, tiện ích thử lại khi mở.
- Bản sao lưu đầy đủ chứa dữ liệu riêng do người dùng tạo. Bản xuất theme chứa thiết kế và cấu hình liên kết trong thiết kế. Lịch sử Chrome chỉ được đọc để hiển thị và không nằm trong tệp xuất.

- Từ 1.1.0, đồng hồ kim lưu `props.config.face` và `props.config.markings`. Bản ghi cũ đọc mặc định `ivory` và `numbers`; tùy chọn kim giây cũ giữ nguyên. Kích thước widget tiếp tục dùng `width` và `height` của lớp canvas.
