# Phase 1 · Foundation & Theme Gallery

## Đầu ra

Trang New Tab mặc định, đồng hồ và ngày, Gallery với 36 theme thuộc sáu nhóm, tìm kiếm cả hai ngôn ngữ, bộ lọc, yêu thích, xem thử, áp dụng và chỉnh hai màu. Có metadata Chrome và UI EN/VI. Từ 1.1.0, nút More by the Creator ở góc dưới trái mở bảng liên kết tiếng Anh cho các dự án và thơ của tác giả.

## Triển khai

1. Tạo Vite build và Manifest V3 có newtab override, quyền storage và icon.
2. Tạo catalog ID ổn định và ThemeScene dùng chung cho thẻ, dialog và New Tab.
3. Xây Gallery, tìm kiếm bỏ dấu, lọc nhóm, yêu thích, dialog preview và màu tùy chỉnh.
4. Thêm Zustand và adapter lưu tùy chọn theo khóa, khôi phục dữ liệu lỗi và nghe thay đổi giữa các tab. IndexedDB bắt đầu từ Phase 2 cùng tài sản ảnh.
5. Thêm bản dịch, UI bằng bàn phím và kiểm tra build.

## Nghiệm thu

Chạy npm run check. Qua Chrome, mở tab mới, chọn một theme khác, đóng để xác minh preview, rồi tùy chỉnh và áp dụng. Mở tab mới, xác minh màu và ngôn ngữ. Thử favorites, kết quả rỗng, màn hình hẹp và mất mạng. Xem TESTING.md.
