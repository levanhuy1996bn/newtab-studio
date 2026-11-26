# Phase 4 · Visual Editor & Free Canvas

Phụ thuộc mô hình layer và nội dung Phase 2–3. Canvas dùng tọa độ thiết kế và tỷ lệ hiển thị, chuyển đổi tọa độ con trỏ vào cùng hệ trước khi áp dụng transform.

1. Tạo workspace có toolbar, canvas, panel thuộc tính và layers. Thêm shape, sticker/emoji, frame, border và hình ảnh.
2. Hỗ trợ kéo/thả, đổi kích thước, xoay, chọn nhiều, căn hàng, snap grid và alignment guides. Dùng Pointer Events và xử lý cancel/lost capture.
3. Cung cấp sắp xếp, nhóm/tách, khóa/hiện, nhân bản, menu ngữ cảnh, nhập kích thước trực tiếp và phím tắt. Không bắt phím tắt khi focus đang ở ô nhập.
4. Một thao tác hoàn tất tạo một lệnh undoable. Undo/redo khôi phục thứ tự và quan hệ nhóm. Preview dùng cùng bộ render nhưng ẩn guides và handles.
5. Chốt chiến lược scale, clipping và bố trí tại nhiều tỷ lệ viewport.

Nghiệm thu bằng nhiều layer có rotation, group, undo/redo, drag bằng chuột/bàn rê và căn chỉnh bằng bàn phím. Mở lại xác minh không lệch giữa renderer và editor.

## Bố cục và lưu trữ

Canvas dùng mặt phẳng 1.200 × 675 đặt giữa theme. Canvas co theo chiều rộng và chiều cao khung với tỷ lệ 16:9. Kéo hoạt động ở mọi tỷ lệ hiển thị vì vị trí chuột được đổi về tọa độ thiết kế. Layer khóa có thể chọn trong danh sách. Layer ẩn vẫn có thể hiện lại từ danh sách.

Bản nháp và tối đa 80 bước undo/redo thuộc phiên chỉnh sửa hiện tại. **Apply canvas** lưu tối đa 64 lớp vào document của preset. Lớp ảnh lấy từ ảnh đóng gói hoặc ảnh đã tải vào thư viện Background Studio.

## Phím tắt

| Phím | Thao tác |
| --- | --- |
| Shift + chọn | Chọn nhiều lớp hoặc nhóm |
| Shift + đổi cỡ | Giữ tỷ lệ lớp khi kéo |
| Shift + xoay | Xoay theo bước 15° |
| Phím mũi tên / Shift + mũi tên | Dịch lớp 1 / 10 px thiết kế |
| Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z hoặc Ctrl + Y | Undo, redo |
| Ctrl/Cmd + D | Nhân bản lớp |
| Ctrl/Cmd + G hoặc Ctrl/Cmd + Shift + G | Nhóm hoặc tách nhóm |
| Delete hoặc Backspace | Xóa lớp |
| Escape | Hủy thao tác kéo, đóng menu/xem thử hoặc bỏ chọn |
