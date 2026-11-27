# Phase 3 · Text Editor & Typography

Phụ thuộc ThemeDocument và renderer của Phase 2. Mở rộng layer text và xây panel thuộc tính trước khi có canvas hoàn chỉnh.

1. Thêm văn bản tự do, lời chào, thơ, trích dẫn và preset chữ. Đóng gói nội dung tự viết, thuộc phạm vi công cộng hoặc được cấp phép. Lưu metadata tác giả và nguồn.
2. Cung cấp font cục bộ có ký tự tiếng Việt, font fallback và giấy phép. Điều khiển cỡ, weight, màu, line height, khoảng cách chữ, căn lề, shadow, độ mờ và xoay.
3. Xây Random Quote và Daily Quote từ bộ nội dung cục bộ. Daily Quote ổn định trong ngày theo múi giờ thiết bị. Lưu khóa trích dẫn hoặc nội dung do người dùng nhập dưới dạng dữ liệu văn bản.
4. Đồng bộ preview và New Tab qua một text renderer. Xác định giới hạn nhập và wrap trên viewport hẹp.

Nghiệm thu bằng đoạn thơ nhiều dòng, văn bản dài, tiếng Việt có dấu và chữ do người dùng nhập có ký hiệu HTML. Tải lại và kiểm tra nội dung, font, vị trí.

## Nội dung và font đi kèm

- 14 mẫu song ngữ do NewTab Studio biên soạn, gồm ba lời chào, ba bài thơ ngắn và tám châm ngôn. Từ 1.1.1, thư viện có thêm 20 đoạn Kinh Thánh. Tiếng Việt do người dùng cung cấp. Tiếng Anh lấy từ bản World English Bible theo thứ tự sách Công giáo, thuộc phạm vi công cộng. Mẫu chèn trực tiếp có thể sửa. Châm ngôn mỗi ngày cập nhật theo ngày và ngôn ngữ của tiện ích. [Nguồn bản Anh](https://ebible.org/Scriptures/details.php?id=eng-web-c)
- Lora và Noto Sans được đóng gói dưới dạng TrueType biến thiên, với fallback hệ thống. [Nguồn Lora](https://github.com/google/fonts/tree/main/ofl/lora) · [SIL OFL của Lora](../../public/fonts/lora-OFL.txt) · [Nguồn Noto Sans](https://github.com/google/fonts/tree/main/ofl/notosans) · [SIL OFL của Noto Sans](../../public/fonts/noto-sans-OFL.txt)
- Mỗi preset có tối đa tám khối, đặt trên hoặc dưới đồng hồ và căn lề trong khung. Bố trí tự do theo tọa độ thuộc Phase 4.
