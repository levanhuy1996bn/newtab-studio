# Phase 6 · Animation & Advanced Customization

Phụ thuộc renderer và widget ổn định.

1. Tạo schema hiệu ứng nền tuyết, lá, sao, mưa, hạt, chuyển màu và parallax. Ưu tiên CSS transform/opacity, giới hạn số hạt và vùng phủ.
2. Thêm hiệu ứng text và widget với preset cường độ, tốc độ và kết thúc. Tạm dừng render khi tab ẩn. Dừng hiệu ứng trang trí theo prefers-reduced-motion hoặc chế độ hiệu năng.
3. Thêm theme ngày/đêm và lịch theme theo giờ thiết bị. Quy định ưu tiên từ lựa chọn thủ công theo phiên, khung lịch đang bật, tới theme mặc định. Quy tắc vượt nửa đêm và lịch trùng phải xác định.
4. Thêm Focus Mode để ẩn thành phần phụ và Performance Mode để giới hạn hiệu ứng. Lưu mức ưu tiên theo lựa chọn cục bộ.

Nghiệm thu bằng mô phỏng giảm chuyển động, đổi giờ qua ranh giới lịch, mở lại tab đang ẩn và đo chi phí render với nhiều layer.

## Hành vi bản 0.6.0

- **Hiệu ứng** ở New Tab và cửa sổ xem thử theme mở trình chỉnh hiệu ứng. Mỗi theme lưu một hiệu ứng nền, một hiệu ứng chữ và một hiệu ứng widget. Có ba tốc độ Chậm, Vừa, Nhanh và ba mức Nhẹ, Vừa, Mạnh. Chữ và widget có thể phát một lần hoặc lặp. Nút **Phát lại xem thử** khởi động lại hoạt ảnh trong trình chỉnh.
- Tuyết, lá rơi, sao, mưa và hạt lơ lửng dùng tối đa 24 hạt. Chuyển màu dùng lớp phủ. Parallax theo con trỏ dùng một lần cập nhật mỗi khung hình khi có sự kiện. Widget ngừng hoạt ảnh khi rê chuột hoặc focus vào điều khiển. Tab ẩn tạm dừng CSS và xử lý parallax. Giảm chuyển động của hệ thống và Chế độ hiệu năng tắt hoạt ảnh trang trí và tạm dừng trình chiếu ở New Tab và xem thử hiệu ứng.
- **Lịch đổi theme** có chế độ Tắt, Ngày và đêm và tối đa tám khung giờ tùy chỉnh. Giờ dùng múi giờ thiết bị, bắt đầu tính từ đầu khoảng và loại thời điểm kết thúc. Khung có giờ kết thúc nhỏ hơn giờ bắt đầu đi qua nửa đêm. Khung trên cùng được ưu tiên khi trùng. Ngoài khung dùng Forest Hour mặc định. Chế độ Tắt dùng lựa chọn đã áp dụng toàn hồ sơ như các bản trước.
- Khi bật lịch, lựa chọn thủ công có ưu tiên trong tab hiện tại và giữ qua reload. Chọn **Tiếp tục theo lịch** để bỏ ưu tiên. Các tab khác tiếp tục dùng lịch và cùng đọc thiết kế đã lưu.
- **Chế độ tập trung** ẩn điều hướng và các hành động phụ trên New Tab. Đồng hồ, widget và nút thoát chế độ vẫn có thể dùng. Focus và Performance là tùy chọn theo hồ sơ, đồng bộ qua các tab Chrome hiện tại.
