# Phát hành Chrome Web Store

Phase 7 tạo bản phát hành. Kiểm tra chính sách và yêu cầu dashboard tại thời điểm gửi. [Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish) · [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies)

## Chuẩn bị

1. Đồng bộ version package và manifest, chạy `npm ci` và `npm run check`.
2. Cài dist vào hồ sơ sạch. Kiểm tra lần đầu, cập nhật từ bản trước, EN/VI, offline, clock, restore và các chức năng theo TESTING.md.
3. Kiểm tra icon, screenshot, mô tả EN/VI, giấy phép asset và thông tin hỗ trợ.
4. Chuẩn bị chính sách riêng tư phù hợp các tính năng thực tế, mô tả storage, tệp nhập/xuất, cách xóa dữ liệu và trường hợp mở công cụ tìm kiếm hoặc lối tắt bên ngoài.
5. Giải trình quyền storage dùng để lưu tùy chọn. Kiểm tra mục đích duy nhất là cá nhân hóa New Tab và rà toàn bộ mã/asset chạy local.

## Tài liệu và ảnh bản 0.6.5

- [Store Listing EN/VI và nội dung điền Privacy](chrome-web-store/LISTING.md)
- [Logo xoài chữ X mẫu 01–03](chrome-web-store/logo-preview.png), [mẫu 04–06](chrome-web-store/logo-preview-v2.png) và [tệp SVG/PNG](chrome-web-store/logos/)
- [Ảnh chụp giao diện Chrome](chrome-web-store/screenshots/), [ô quảng cáo nhỏ](chrome-web-store/small-promo.png) và [marquee](chrome-web-store/marquee.png)
- Chủ dự án đã cung cấp Gist cho [chính sách riêng tư EN/VI](chrome-web-store/PRIVACY.md). URL để điền và trạng thái xác minh nằm trong [Store Listing](chrome-web-store/LISTING.md#url-chính-sách-riêng-tư).

## Đóng gói và gửi

```bash
npm run check
(cd dist && zip -r ../newtab-studio-release.zip .)
unzip -l newtab-studio-release.zip
```

Manifest phải nằm ở gốc ZIP. Upload qua Developer Dashboard, điền Store listing, Privacy và Distribution, kiểm tra bản nháp, rồi gửi review khi chủ dự án phê duyệt. Lưu lại ZIP, version, kết quả kiểm thử và release notes. Khi cần sửa bản lỗi, phát hành bản có version tăng với migration tương thích và xác minh khôi phục trên profile hiện có.
