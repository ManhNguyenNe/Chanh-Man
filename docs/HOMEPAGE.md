# Trang chủ Chanh&Man

## Phạm vi đã xây dựng

Trang chủ gồm header/tìm kiếm, hero, danh mục, sản phẩm nổi bật, chọn theo nhu cầu, bộ sưu tập nền tối, hỗ trợ và footer. Có menu mobile, hộp xem nhanh sản phẩm, chọn phiên bản, giỏ hàng dùng thử và hộp thông tin hỗ trợ.

Tìm kiếm, danh mục và nhu cầu cập nhật kết quả ngay trong trang chủ. Các tiêu chí nằm trong query string (`q`, `category`, `need`, `all`) và hỗ trợ Back/Forward, tải lại trang. Chưa tạo các trang danh sách/chi tiết độc lập.

Sản phẩm, cấu hình, giá và tồn kho là dữ liệu minh họa. Tài khoản, checkout, thanh toán và đơn hàng thực tế chưa được triển khai. Giỏ hàng hiện lưu ở trình duyệt; không có dữ liệu gửi tới Supabase.

## Cấu trúc và cách học

- `src/pages/Home.jsx`: ghép các phần trang chủ và phối hợp tương tác.
- `src/components/header/`, `footer/`: phát triển tiếp các component đã có.
- `src/components/home/`: hero, danh mục, nhu cầu, bộ sưu tập, hỗ trợ.
- `src/components/products/`: lưới sản phẩm, thẻ sản phẩm, xem nhanh cấu hình.
- `src/components/cart/`: giỏ hàng dùng thử.
- `src/hooks/useCatalog.js`: điều phối URL, tải bất đồng bộ, hủy kết quả cũ và thử lại.
- `src/hooks/useCart.js`: đồng bộ giỏ hàng với giao diện.
- `src/services/productService.js`: giao diện đọc catalog; dữ liệu mẫu nằm trong `services/mock/catalog.js`.
- `src/services/cartService.js`: kiểm tra số lượng, gộp dòng theo phiên bản và lưu giỏ.
- `src/assets/theme.js`: nguồn giá trị chung cho Ant Design và CSS variables.

Khi nối Supabase, giữ đầu vào/đầu ra của các service và thay cách truy cập dữ liệu bên trong. Backend phải kiểm tra lại giá, tồn kho và quyền khi triển khai đặt hàng thật; dữ liệu trong localStorage không phải nguồn đáng tin cho giao dịch.

## Quyết định thiết kế

- Áp dụng `DESIGN.md`: nền trắng/parchment, hình ảnh sản phẩm lớn, màu nhấn Action Blue, các khối giới thiệu không bo góc, card tiện ích bo góc, không có gradient trang trí hoặc bóng đổ trên UI.
- Các mốc chính dùng nhất quán theo bảng breakpoint: 419, 640, 735, 833, 1068px; menu thu gọn ở <=833px. Lưới sản phẩm chuyển 1/2/3/4 cột.
- Các giá trị màu dùng trong theme được đưa sang CSS variables lúc khởi tạo. Chữ phụ nhỏ dùng `ink-muted-80` để đủ tương phản; `ink-muted-48` dành cho dòng headline lớn phù hợp.
- Loading, empty, lỗi và giỏ hàng là phần mở rộng chức năng của dự án dựa trên token sẵn có, vì DESIGN.md chưa đặc tả đầy đủ.
- ProductDialog và CartDrawer tải theo nhu cầu. Ant Design dùng locale tiếng Việt, ConfigProvider và App provider chung.
- Ảnh hero dùng nguồn mobile riêng; ảnh dưới màn hình đầu tải chậm. Tôn trọng reduced-motion, có skip link và trạng thái focus.

## Kiểm tra đã thực hiện

- `npm run lint` và `npm run build` thành công.
- Trình duyệt: tìm kiếm, kết quả rỗng, Back, menu mobile, chọn phiên bản đổi giá, phiên bản hết hàng bị vô hiệu hóa, thêm giỏ và giữ giỏ sau reload.
- 13 kiểm tra service trong trình duyệt: tìm không dấu, lọc danh mục, nhu cầu gaming, không có kết quả, sản phẩm không tồn tại, hủy truy vấn, gộp/tách phiên bản trong giỏ, tổng tiền, số lượng bằng 0/vượt tồn, hết hàng, xóa dòng và dữ liệu lưu trữ hỏng.
- Kiểm tra độ rộng 360, 640, 641, 768, 833, 834, 1068, 1069 và 1440px: không tràn ngang trang. Xem trực quan desktop, tablet, mobile và hộp cấu hình mobile.
- Kiểm tra axe trên trang chủ desktop và danh mục điện thoại mobile: 0 vi phạm, 0 mục chưa xác định tại thời điểm kiểm tra. Đây là kiểm tra tự động có phạm vi, không thay thế đánh giá toàn bộ khả năng truy cập.
- Không phát hiện lỗi JavaScript hoặc ảnh hỏng trong các màn hình đã kiểm tra.

Ảnh xem trước nằm trong `docs/previews/`.

## Nguồn ảnh minh họa

Các ảnh được lưu cục bộ cho bản mẫu học tập. Giá/cấu hình trong catalog không được lấy từ những trang dưới đây.

- [Apple MacBook Air](https://www.apple.com/macbook-air/): hero desktop/mobile.
- [Apple Store MacBook Air](https://www.apple.com/shop/buy-mac/macbook-air): ảnh danh mục và sản phẩm.
- [Apple Store MacBook Pro](https://www.apple.com/shop/buy-mac/macbook-pro): ảnh sản phẩm.
- [Apple MacBook Pro](https://www.apple.com/macbook-pro/): ảnh bộ sưu tập nền tối.
- [Apple Store iPhone 17](https://www.apple.com/shop/buy-iphone/iphone-17): ảnh danh mục và sản phẩm.
- [Apple Store iPhone 17 Pro](https://www.apple.com/shop/buy-iphone/iphone-17-pro): ảnh sản phẩm.
- [NVIDIA GeForce RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/): ảnh linh kiện.
