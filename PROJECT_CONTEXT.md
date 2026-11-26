# Bối cảnh NewTab Studio

NewTab Studio là Chrome Extension Manifest V3 thay thế trang New Tab bằng giao diện cá nhân hóa. Bản miễn phí triển khai Phase 1–7, hoạt động local-first, hỗ trợ tiếng Anh và tiếng Việt, dùng React, Vite, JavaScript, Tailwind CSS và Zustand. Phase 8–9 là lộ trình tương lai. [Đặc tả sản phẩm](docs/PRODUCT_SPEC.md) · [Lộ trình](ROADMAP.md)

## Trạng thái khi bàn giao

Bản **0.6.8** đã hoàn thành Phase 1–6, tinh chỉnh New Tab đầu Phase 7 và dùng logo Xoài thuôn. Có 33 preset, thanh bên trái gọn, chỉnh widget trực tiếp trên New Tab, Tự sắp xếp phân trang, hai cách đặt ảnh, hiệu ứng và lịch đổi theme. Phase 7 tiếp tục với quản lý theme, backup/restore và phát hành. Xem [HANDOVER.md](HANDOVER.md), [PROGRESS.md](PROGRESS.md) và [CHANGELOG.md](CHANGELOG.md).

## Điểm vào mã nguồn

| Khu vực | Tệp |
| --- | --- |
| New Tab, gallery, điều hướng | [App.jsx](src/App.jsx) · [ThemeScene.jsx](src/ThemeScene.jsx) · [manifest.json](public/manifest.json) |
| Theme dựng sẵn và dịch | [themeCatalog.js](src/themeCatalog.js) · [i18n.js](src/i18n.js) |
| Tùy chọn và giao dịch IndexedDB | [preferences.js](src/preferences.js) · [studioRepository.js](src/studioRepository.js) |
| Nền và ảnh cá nhân | [BackgroundStudio.jsx](src/BackgroundStudio.jsx) · [background.js](src/background.js) · [assetUpload.js](src/assetUpload.js) |
| Typography | [TextEditor.jsx](src/TextEditor.jsx) · [TextLayers.jsx](src/TextLayers.jsx) · [typography.js](src/typography.js) |
| Free Canvas | [VisualEditor.jsx](src/VisualEditor.jsx) · [CanvasScene.jsx](src/CanvasScene.jsx) · [canvasModel.js](src/canvasModel.js) · [canvasGeometry.js](src/canvasGeometry.js) |
| Widgets, preset và xuất layout | [TabWidgetEditor.jsx](src/TabWidgetEditor.jsx) · [Widgets.jsx](src/Widgets.jsx) · [widgetModel.js](src/widgetModel.js) · [widgetLayouts.js](src/widgetLayouts.js) · [layoutExport.js](src/layoutExport.js) |
| Hiệu ứng và lịch đổi theme | [EffectsStudio.jsx](src/EffectsStudio.jsx) · [SceneEffects.jsx](src/SceneEffects.jsx) · [effects.js](src/effects.js) |
| Kiểm tra gói cài | [package.json](package.json) · [check-build.js](scripts/check-build.js) |

Tham khảo [kiến trúc](docs/ARCHITECTURE.md), [schema](docs/DATA_SCHEMA.md), [kiểm thử](docs/TESTING.md), [quyết định](DECISIONS.md) và [vấn đề đã biết](KNOWN_ISSUES.md) trước khi mở rộng tính năng.

## Chạy cục bộ

Trên máy hiện tại, kích hoạt Node v22 trong Bash bằng `source "$HOME/.bash_profile"`. Chạy `npm ci` khi chưa có dependencies, rồi dùng `npm run check` để chạy unit test, build và kiểm tra gói cài. Chrome nạp thư mục `dist/` qua **Load unpacked**. [Hướng dẫn chạy](README.md)
