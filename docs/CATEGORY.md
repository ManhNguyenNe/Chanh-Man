# Trang danh mục Chanh&Man

## Phạm vi

- Đợt 008: catalog có 24 sản phẩm (8 mỗi danh mục), giữ 6 mẫu cũ và thêm 18 mẫu nhiều thương hiệu. Có 3 sản phẩm hết hàng hoàn toàn; sản phẩm mới có hai lựa chọn tiêu chuẩn/bảo hành mở rộng giả lập. Ảnh mới chưa có thì dùng nhãn “Ảnh đang cập nhật”. Giá/cấu hình là fixture, không được xác minh như thông tin bán hàng. Đã kiểm tra phân trang thực tế trên UI; chi tiết ở PROGRESS.md đợt 008.
- Cập nhật đợt 006: danh mục dùng 4 cột từ 1069px, 2 cột ở 641–1068px, 1 cột đến 640px. Card danh mục bỏ badge và dòng tồn kho, giữ thông tin cấu hình trong modal. Vùng ảnh dùng parchment liền khối, giữ ảnh nguyên màu/tỷ lệ; ảnh nguồn có nền trắng/tối vẫn giữ nguyên, chưa thay bằng tài nguyên trong suốt. Xem [ảnh desktop mới](./previews/category-four-desktop.png) và kiểm tra đợt 006 trong PROGRESS.md.
- Cập nhật tiếp 10/09/2026: giữ panel không viền do người dùng lựa chọn. Đây là biến thể bố cục mở rộng, khác chi tiết border 1px của mẫu store-utility-card; không thay đặc tả card sản phẩm trong DESIGN.md. Khoảng cách dưới toolbar/chips/nút lọc mobile thống nhất token space-sm (12px), giữ chiều cao thao tác tối thiểu 44px. Xem đợt 005 trong PROGRESS.md và [ảnh mới](./previews/category-chips-desktop.png).
- Cập nhật 10/09/2026: intro thu gọn, ba vùng intro/bộ lọc/kết quả dùng nền trắng, viền hairline và radius 18px. Áp dụng token store-utility-card trong DESIGN.md cho panel chức năng bên trong container; không áp dụng quy tắc tile tràn viền, không thêm shadow. Ảnh mới: [desktop](./previews/category-panels-desktop.png), [tablet](./previews/category-panels-tablet.png), [mobile](./previews/category-panels-mobile.png). Kiểm tra của lần chỉnh sửa này ghi ở đợt 004 trong PROGRESS.md; kết quả dưới đây thuộc đợt xây ban đầu.
- URL: `/laptop`, `/dien-thoai`, `/linh-kien-pc`, `/san-pham` (tất cả).
- Header, khối danh mục trang chủ và footer mở trang tương ứng; breadcrumb quay về trang chủ. Liên kết nhu cầu/hỗ trợ trở về đúng section của Home.
- Desktop: bộ lọc trái, danh sách phải; dưới hoặc bằng 833px dùng Drawer. Danh sách 4 cột, xuống 2 ở 1068px, xuống 1 ở 640px.
- Lọc thương hiệu, giá, màu sắc, khuyến mại, còn hàng. Nhiều giá trị trong cùng nhóm theo OR; kết hợp các nhóm theo AND. Giá lọc/sắp xếp là giá khởi điểm; màu thuộc sản phẩm, không tự chọn phiên bản trong hộp xem nhanh.
- Sắp xếp nổi bật (thứ tự catalog), giá tăng/giảm, tên; tìm kiếm trong danh mục hiện tại. Bỏ từng điều kiện hoặc đặt lại toàn bộ.
- Query string giữ tiêu chí khi reload/Back. Chuyển danh mục bắt đầu với bộ lọc mặc định.
- Loading, empty, error/retry, hủy truy vấn cũ; phân trang 20 sản phẩm, ẩn điều khiển khi chỉ có một trang. Ghi chú trái và phân trang phải trong một hàng desktop; mobile xuống dòng. Trang đầu Tất cả có 5 hàng × 4 cột; kết quả ít hơn 20 hiển thị số lượng thực tế.
- ShopLayout dùng chung header/footer, xem nhanh, giỏ và thông tin hỗ trợ với Home.

## Mã và dữ liệu

- [Category.jsx](../src/pages/Category.jsx), [CatalogFilters.jsx](../src/components/catalog/CatalogFilters.jsx), [Catalog.css](../src/components/catalog/Catalog.css): trang, controls và CSS.
- [useCategoryCatalog.js](../src/hooks/useCategoryCatalog.js): đồng bộ query và tải dữ liệu; [categoryRoutes.js](../src/utils/categoryRoutes.js): ánh xạ URL.
- [productService.js](../src/services/productService.js): `getCategoryFilters(category, { signal })` trả category/brands/colors/priceRanges. `listProducts` nhận category/q/brands/colors/priceRange/promotion/inStock/sort/page/limit/signal; trả items/total/page thực tế.
- Service lọc và sắp xếp toàn bộ trước phân trang. UI không import mock; giữ hợp đồng này khi nối API.
- [catalog.js](../src/services/mock/catalog.js) bổ sung colors/promotion cho sáu sản phẩm hiện có. Thương hiệu chỉ có Apple/NVIDIA; khuyến mại là cờ minh họa, không giảm tiền trong giỏ.
- Điều hướng giữa trang dùng browser navigation theo pathname, chưa thêm thư viện routing. Hosting production cần rewrite URL ứng dụng về index.html; chưa triển khai hosting trong đợt này.
- Giữ token DESIGN.md, thêm component token Breadcrumb để chữ đủ tương phản. Bộ lọc và trạng thái dữ liệu là phần mở rộng chức năng theo AGENTS.md.

## Kiểm tra ngày 09/09/2026

- `npm run lint`, `npm run build`: đạt.
- `node --test tests/category-service.test.js`: 8/8 đạt, gồm facets, nhóm lọc, khoảng giá, sắp xếp trước phân trang, tìm không dấu, ưu đãi/tồn kho, hủy truy vấn và không sửa dữ liệu gốc.
- Trình duyệt: mở trực tiếp URL, nút danh mục Home/header; tìm air trong Laptop trả hai mẫu Air; lọc 20–30 triệu trả Air 13; thêm màu Đen trả rỗng; Back khôi phục Air 13; reload giữ tiêu chí.
- Xem nhanh iPhone Pro, thêm giỏ, chuyển sang PC vẫn giữ 1 sản phẩm và 32.990.000 đồng. Giỏ do kiểm thử tạo đã được dọn trong phiên kiểm thử.
- Mobile: chọn màu trong Drawer cập nhật kết quả; Escape đóng và trả focus về nút Bộ lọc. Select dùng ArrowDown/Enter trả đúng thứ tự giá tăng.
- Đo tại 360, 640, 641, 768, 833, 834, 1068, 1069, 1440px: không tràn ngang trang hoặc thẻ. Đã xem trực quan desktop, tablet, mobile và Drawer.
- Không phát hiện lỗi JavaScript hoặc ảnh hỏng trong phạm vi kiểm tra.
- Axe 4.12.1 sau sửa: 0 vi phạm ở desktop/tablet và mobile mở Drawer; 1 mục tương phản Select chưa tự xác định do input chồng nội dung. Đã đối chiếu trực quan và computed style: chữ #1d1d1f trên nền #ffffff. Không coi đây là báo cáo tự động đạt tuyệt đối mọi tiêu chí.
- Error/retry có triển khai nhưng chưa chủ động mô phỏng lỗi service trên UI. Phân trang kiểm tra ở service với limit=2; bộ dữ liệu hiện tại chưa vượt 6 sản phẩm nên chưa thử luồng nhiều trang trên UI.

## Ảnh và tham khảo

[Desktop](./previews/category-desktop.png) · [Tablet](./previews/category-tablet.png) · [Mobile](./previews/category-mobile.png) · [Bộ lọc mobile](./previews/category-mobile-filter.png).

Tham khảo tổ chức bộ lọc tại [ThinkPro – Chuột](https://thinkpro.vn/chuot), thiết kế riêng theo DESIGN.md. Ảnh sản phẩm tái sử dụng nguồn đã ghi trong [HOMEPAGE.md](./HOMEPAGE.md).

Trang chi tiết riêng, DB, Supabase, tài khoản, checkout, đơn hàng và quản trị chưa thuộc đợt này. Giá/tồn kho/khuyến mại vẫn là dữ liệu học tập.
