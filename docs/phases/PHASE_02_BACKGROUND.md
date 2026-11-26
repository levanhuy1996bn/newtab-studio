# Phase 2 · Background Studio & Asset Library

Phụ thuộc ThemeScene và catalog Phase 1. Mục tiêu là tạo một bản sao chỉnh được từ preset và lưu nền tùy chỉnh.

1. Tạo repository IndexedDB cho themes và assets. Ghi Blob cùng MIME, kích thước và nguồn. Tạo thumbnail một lần, cache và revoke object URL khi bỏ dùng.
2. Xây thư viện hình đi kèm có nguồn rõ ràng, khu ảnh cá nhân, upload và chọn ảnh. Kiểm tra khả năng decode, pixel, byte và định dạng ảnh tĩnh trước khi ghi.
3. Tạo nền màu đặc, gradient và ảnh. Cung cấp crop, zoom, vị trí, blur, độ sáng, tương phản, độ bão hòa, overlay và opacity. Lưu tham số phi phá hủy.
4. Thêm slideshow có thứ tự, khoảng thời gian, fallback khi thiếu ảnh, dừng khi tab ẩn. Khi xóa ảnh, kiểm tra tham chiếu của theme và draft trước.

Nghiệm thu bằng upload và áp dụng, mở lại Chrome, kiểm tra ảnh và thông số còn đủ. Mô phỏng lỗi quota và ảnh hỏng. Xóa hoặc sửa tham chiếu bằng một luồng cho trạng thái nhất quán.

## Nguồn và vị trí lưu nền

- Nền họa tiết dùng bảng màu và mã họa tiết trong [themeCatalog.js](../../src/themeCatalog.js). [ThemeScene.jsx](../../src/ThemeScene.jsx) và [styles.css](../../src/styles.css) vẽ gradient, hình học, sóng và các đường nét bằng CSS.
- Ảnh JPG/WebP đi kèm nằm trong [public/backgrounds](../../public/backgrounds). Vite sao chép ảnh đầy đủ và ảnh thu nhỏ vào `dist/backgrounds/`. [Wallpaper ImageGen và câu lệnh tạo](../WALLPAPERS.md)
- Ảnh tải lên nằm trong IndexedDB `newtab-studio` của hồ sơ Chrome. Store `assets` giữ ảnh gốc và `assetPreviews` giữ ảnh thu nhỏ.
- New Tab dùng nền phủ viewport. Ảnh dùng `object-fit: cover` cùng vị trí và zoom đã lưu, nên khung dọc có thể cắt bớt phần rìa ảnh ngang.

### Ảnh đóng gói

- Blue Marble · NASA Earth Observatory. [Nguồn](https://science.nasa.gov/resource/blue-marble-2002/)
- Martian Dunes · NASA/JPL-Caltech/University of Arizona. [Nguồn](https://science.nasa.gov/resource/dunes-in-noachis-terra-region-of-mars/)
- Cosmic Cliffs · NASA, ESA, CSA, STScI. [Nguồn](https://science.nasa.gov/universe/nebulae/nasas-webb-reveals-cosmic-cliffs-glittering-landscape-of-star-birth/)

Ảnh được chuyển sang JPEG để dùng trong bundle cục bộ. [Hướng dẫn sử dụng ảnh NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/)
