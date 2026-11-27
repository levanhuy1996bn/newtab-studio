# Phase 5 · Widget System & Layout Presets

Phụ thuộc canvas và lớp lưu trữ. Registry widget định nghĩa schema, mặc định, editor form và renderer theo loại.

1. Làm Clock số/kim, Date & Greeting, Search, Quick Links và Calendar theo locale. Tìm kiếm mã hóa chuỗi và điều hướng khi submit. Quick Links chỉ nhận http/https.
2. Thêm Todo, Notes, Daily Quote, Pomodoro và Countdown. Lưu Todo/Notes riêng khỏi theme. Timer lưu mốc đích để tính lại khi tab ẩn hoặc mở lại. Cảnh báo bằng UI cục bộ.
3. Tạo layout preset theo nhóm công việc, tối giản và học tập. Mỗi lần thêm vào canvas tạo ID mới. Bố trí lại khi thiếu chỗ.
4. Đánh giá Weather riêng nếu có nguồn miễn phí phù hợp quyền riêng tư, điều khoản và offline fallback. Weather không phải điều kiện nghiệm thu.

Nghiệm thu bằng đổi ngôn ngữ, qua nửa đêm, mở lại timer, chỉnh danh sách từ hai tab và export bản thiết kế với lớp cá nhân được tách riêng.

## Hành vi bản 0.5.0

- Trong Visual Editor, mở **Tiện ích và bố cục** để thêm 11 loại widget hoặc chọn bố cục Tối giản, Công việc, Học tập. Chèn preset là một bước undo và tạo ID mới cho mỗi lớp. Công cụ thử dời và thu nhỏ cả bố cục khi vùng mặc định đã có lớp.
- Widget hoạt động tương tác trên New Tab. Màn hình từ 720 px trở xuống hiển thị các widget theo luồng thẻ bên dưới khung nền để dễ thao tác. Đồng hồ mặc định ẩn khi canvas đã có một widget đồng hồ hiện.
- Todo, Notes và trạng thái timer lưu theo ID lớp trong IndexedDB. Notes dùng nút **Lưu**. Pomodoro cho phép chuyển giữa Tập trung và Nghỉ. Timer đang chạy dùng mốc đích, hiển thị báo hết giờ trong widget.
- **Xuất bố cục** tải JSON của bản nháp thiết kế, gồm preset, cấu hình nền và chữ, lớp canvas và tham chiếu ảnh. Danh sách việc, nội dung ghi chú, phiên timer và tệp nhị phân thuộc các luồng lưu riêng. Nhập/xuất theme đầy đủ và backup/restore thuộc Phase 7.
- Weather để lại cho lần đánh giá riêng về nguồn. Open-Meteo cần tọa độ cho dự báo và giới hạn API miễn phí cho mục đích phi thương mại. [Tài liệu dự báo](https://open-meteo.com/en/docs) · [Điều kiện API](https://open-meteo.com/en/pricing#api-plans)

## Tự sắp xếp trong bản 0.5.3

- Trong Visual Editor, chọn **Tự sắp xếp** ở **Bố cục tiện ích trên tab mới**. Dùng mũi tên để đổi thứ tự, chọn **Xem thử** để xem các hàng thẻ và bấm **Áp dụng canvas** để lưu cho theme.
- Trên New Tab, các thẻ tự xuống hàng và giữ thứ tự. Tab cuộn dọc khi thiếu chỗ. Widget bị ẩn tiếp tục ẩn. Chữ và các lớp trang trí còn nằm trong cảnh nền.
- **Canvas tự do** dùng lại vị trí, kích thước, góc xoay và thứ tự lớp đã lưu. Theme cũ mặc định dùng chế độ này với cách hiển thị thẻ ở chiều rộng từ 720 px trở xuống.

## Chỉnh nhanh trên New Tab từ 0.6.6

- Mở **Chỉnh tiện ích** ở thanh trái để chọn widget đang hiển thị. Ẩn rồi bật lại giữ vị trí, cấu hình và dữ liệu cá nhân của đúng ID lớp.
- Kéo trên New Tab hoặc chọn widget và dùng phím mũi tên. Bấm **Lưu** để áp dụng cho theme hoặc **Hủy** để bỏ bản nháp. Thay đổi vị trí sẽ chuyển theme từ Tự sắp xếp sang Canvas tự do khi lưu. Màn hình hẹp tiếp tục dùng thẻ phân trang khi đã đóng trình chỉnh.
- Trên New Tab, widget ở Canvas tự do có thể kéo tới bốn mép vùng nội dung bên cạnh thanh công cụ. Các lớp trang trí trên New Tab và mặt phẳng trong Visual Editor vẫn dùng tỷ lệ 16:9.
- Mỗi widget dùng mặt kính có thanh chỉnh độ đậm nền. Mặc định 26%, giữ độ đậm chữ độc lập với màu nền.

## Lối tắt trên New Tab từ 0.6.8

- Bật **Liên kết nhanh** trong **Chỉnh tiện ích**. Ở mục **Đã lưu**, thêm qua nút dấu cộng, sửa và gỡ trong **Cài đặt lối tắt**. Lối tắt đã lưu gắn với ID widget và được lưu cục bộ.
- **Hay truy cập** xếp theo số lượt truy cập của tối đa 1.000 URL mới nhất được Chrome trả về trong 90 ngày. **Mới truy cập** xếp theo thời điểm mở. Mỗi mục lịch sử hiển thị tối đa tám kết quả HTTP(S). Kết quả tự cập nhật khi Chrome báo lịch sử thay đổi. [Chrome History API](https://developer.chrome.com/docs/extensions/reference/api/history)
- Hai chế độ lịch sử dùng cùng quyền `history` tùy chọn và chỉ gọi API sau khi quyền đã được cấp. Khi bị thu hồi quyền, widget hiện trạng thái yêu cầu cấp quyền lại. [Chrome Permissions API](https://developer.chrome.com/docs/extensions/reference/api/permissions)

## Kiểu chữ, kích thước và đồng hồ từ 1.1.0

- Trong **Chỉnh tiện ích**, chọn widget và kéo góc dưới bên phải để thay đổi kích thước. Dùng Alt và phím mũi tên, hoặc đưa tiêu điểm tới tay nắm rồi dùng phím mũi tên. Lưu kích thước chuyển Tự sắp xếp sang Canvas tự do. Màn hẹp vẫn dùng thẻ phân trang.
- Đồng hồ kim có bốn mặt Trắng ngà, Xanh đêm, Xanh xô thơm và Đồng ấm. Chọn chữ số, vạch hoặc chấm và tùy chọn kim giây. Mặt đồng hồ tự vừa thẻ, với hai trục cuộn tắt.
- Widget dùng Be Vietnam Pro, phần nội dung Châm ngôn dùng Lora. Hai kiểu chữ được đóng gói cục bộ. [Nguồn Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro) · [Giấy phép OFL](../../public/fonts/be-vietnam-pro-OFL.txt)
- Châm ngôn mỗi ngày hiện mặc định ở góc dưới bên phải của preset chưa lưu canvas. Widget xoay vòng 34 mục theo ngày địa phương, gồm 8 câu biên soạn trước đó và 26 đoạn Kinh Thánh. Hai nút mũi tên cố định ở đáy widget cho xem câu trước hoặc câu tiếp theo ngay trên New Tab. Mở tab mới hoặc sang ngày mới trở về câu của ngày đó. Widget hiện sách, chương và câu cho trích dẫn Kinh Thánh. Bản Anh trích từ World English Bible theo thứ tự sách Công giáo. Bản Việt giữ lời người dùng cung cấp. Các đoạn dài có vùng cuộn riêng. [Nguồn World English Bible](https://ebible.org/Scriptures/details.php?id=eng-web-c)
