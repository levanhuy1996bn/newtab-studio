# Hệ thống thiết kế

Phase 1 dùng nền ngà, chữ than, accent xanh thông và khung ảnh màu theo theme. Đồ họa theme dùng gradient và hình học để hiển thị đồng nhất ở ba kích cỡ cùng lúc. Font serif hệ thống cho tiêu đề và font sans hệ thống cho thao tác, hỗ trợ dấu tiếng Việt và offline.

| Thành phần | Quy ước |
| --- | --- |
| Nền ứng dụng / surface | #f8f7f2 / #ffffff |
| Chữ chính / chữ phụ | #202a25 / #59665e |
| Accent / accent nhẹ | #285847 / #e7efe8 |
| Viền / focus | #deded3 / #285847 |
| Bo góc | 12–28 px cho ô nhập, thẻ, khung xem trước |
| Khoảng cách | Bước 4 px, ưu tiên 8/12/16/24/32/48 px |
| Bố cục | Gallery 1–3 cột theo chiều rộng, nội dung gói trong vùng đọc rộng tối đa 1200 px |

- Header luôn có điều hướng New Tab/Gallery và nút tiếng Anh/tiếng Việt.
- Thẻ có nút xem thử và nút yêu thích độc lập. Nút áp dụng hiển thị trạng thái đang dùng.
- Preview đi qua dialog có đóng bằng Escape, trả focus về thẻ đã mở, định vị nút hành động sau preview.
- Thời gian và ngày dùng Intl. Kiểm tra chữ có dấu dài, wrap ở 320 px và focus thấy rõ.
- Trình thiết kế về sau dùng toolbar, canvas, panel thuộc tính và panel layer. Màu overlay lưới và selection thuộc UI, không lưu vào theme. Hiệu ứng tuân thủ prefers-reduced-motion.
