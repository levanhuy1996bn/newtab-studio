# NewTab Studio

- Khi bắt đầu công việc, đọc [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), [HANDOVER.md](HANDOVER.md), [PROGRESS.md](PROGRESS.md), [ROADMAP.md](ROADMAP.md) và tài liệu Phase liên quan. Đối chiếu với mã hiện tại.
- Kiểm tra `git status --short --branch` ở đầu phiên. Nếu thư mục chưa có Git, kiểm tra các tệp liên quan trực tiếp. Giữ các thay đổi có sẵn và tiếp tục từ tính năng đang chạy.
- Phiên bản miễn phí gồm Phase 1–7. Phase 8–9 chỉ dùng để hoạch định.
- Giữ React/Vite/JavaScript, Tailwind, Zustand và Manifest V3. Tài nguyên chạy cùng extension phải được đóng gói cục bộ.
- Lưu tùy chọn nhỏ vào chrome.storage.local và bản ghi lớn hoặc Blob vào IndexedDB. Mọi thay đổi schema phải có kế hoạch nâng cấp dữ liệu cũ.
- Giữ đầy đủ bản dịch en và vi cho nội dung giao diện, trạng thái và nhãn trợ năng.
- Trên máy local này, chạy `source "$HOME/.bash_profile"` trong Bash trước lệnh Node hoặc npm để kích hoạt Node v22.
- Chạy npm run check, kiểm tra đường dẫn qua New Tab, ghi kết quả thực tế và việc còn lại vào PROGRESS.md.
- Cập nhật [HANDOVER.md](HANDOVER.md) sau mỗi mốc quan trọng, kể cả giữa phiên. Ghi Phase, việc đang làm, tệp thay đổi, kết quả kiểm tra, trở ngại và bước tiếp theo.
- Cập nhật PROGRESS.md sau mỗi công việc, [DECISIONS.md](DECISIONS.md) khi chốt quyết định kỹ thuật, [CHANGELOG.md](CHANGELOG.md) khi có thay đổi phiên bản và [KNOWN_ISSUES.md](KNOWN_ISSUES.md) khi phát hiện hoặc xử lý lỗi.
- Ghi bối cảnh bàn giao vào tệp dự án. Giữ API key, thông tin đăng nhập, token và URL truy cập riêng tư bên ngoài các tệp tài liệu.
