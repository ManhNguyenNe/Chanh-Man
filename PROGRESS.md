# Tiến trình dự án Chanh&Man

Cập nhật gần nhất: **30/09/2026**, múi giờ Asia/Saigon.

Nhật ký ghi nhận công việc thực tế sau mỗi đợt code. Mục mới nhất nằm trước; kết quả kiểm tra thuộc đợt được ghi, không phải cam kết trạng thái luôn đúng ở các phiên bản sau.

## Hiện trạng dự án

| Hạng mục | Trạng thái |
|---|---|
| Kế hoạch FE và quy tắc phát triển | Đã có `FE_PLAN.md`, `AGENTS.md` |
| Hướng thiết kế | Đã có `DESIGN.md`, đã áp dụng vào trang chủ |
| React + Vite + Ant Design | Đã tích hợp Ant Design và theme chung |
| Trang chủ Chanh&Man | Đã triển khai 8 phần nội dung, responsive và các tương tác chính |
| Tìm kiếm và lọc sản phẩm | Có trên trang chủ và danh mục; giữ tiêu chí trong URL |
| Xem cấu hình và giỏ hàng | Có hộp xem nhanh, chọn phiên bản và giỏ lưu trên trình duyệt |
| Trang danh mục độc lập | Đã có Laptop, Điện thoại, Linh kiện PC, Tất cả; lọc và sắp xếp bằng dữ liệu giả lập |
| Trang chi tiết độc lập | Đã có /san-pham/:id; ảnh, chính sách, mô tả, chọn phiên bản, nhận xét dùng thử và gợi ý mua cùng |
| Đăng nhập, đăng ký, hồ sơ | Chưa triển khai; hiện chỉ có thông tin giới thiệu tính năng |
| Checkout, đơn hàng và quản trị | Chưa triển khai |
| Database và tích hợp Supabase | Chưa triển khai; dự kiến thực hiện sau giai đoạn FE |

**Lưu ý phạm vi:** bản hiện tại là FE học tập, giá/cấu hình/tồn kho là dữ liệu minh họa, chưa tiếp nhận đơn hàng thực tế. Hoàn thành trang chủ không đồng nghĩa hoàn thành toàn bộ FE.

## Nhật ký thay đổi

### Đợt 020 — 30/09/2026 — Tạo repository GitHub Chanh-Man

**Đã thực hiện:** tạo repository riêng tư [ManhNguyenNe/Chanh-Man](https://github.com/ManhNguyenNe/Chanh-Man) cho dự án test_proj. Tên URL dùng dấu gạch nối vì GitHub không hỗ trợ dấu &; tên dự án vẫn là Chanh&Man. Thiết lập origin và chuẩn bị push nhánh main.

**Kiểm tra:** API GitHub xác nhận repository đúng tài khoản ManhNguyenNe và private=true. Mã nguồn không thay đổi; không chạy lại lint/build. Kết quả push và đối chiếu commit local/remote được báo trong phiên bàn giao sau khi lệnh hoàn tất.


### Đợt 019 — 30/09/2026 — Chuẩn bị repository Git

**Đã thực hiện:** khởi tạo Git với nhánh main; bổ sung .gitignore loại file môi trường và bộ cài .msix, tiếp tục bỏ node_modules/dist. Chuẩn bị commit mã nguồn, tài nguyên và tài liệu dự án để đưa lên GitHub.

**Kiểm tra:** rà danh sách file đưa vào Git và mẫu khóa bí mật thông dụng, không tìm thấy chuỗi khớp. Không sửa mã chạy nên không chạy lại lint/build.

**Còn lại:** tạo repository GitHub và push sau khi có xác thực GitHub trên máy. Chưa có remote hoặc xác nhận push thành công tại thời điểm ghi nhật ký.


### Đợt 018 — 22/09/2026 — Thu gọn nhãn ảnh và căn thumbnails

**Đã thực hiện:** bỏ dòng Xem ảnh lớn và bộ đếm Hình ảnh sản phẩm. Vẫn bấm ảnh chính để phóng to và chọn ảnh bằng thumbnail. Dùng grid cho vùng ảnh, căn đáy thumbnails ngang đáy khối thông số ở bố cục hai cột; đưa chính sách xuống hàng riêng để không ảnh hưởng chiều cao căn chỉnh. Mobile giữ thứ tự tên → ảnh → thumbnails → phiên bản → thông số → chính sách.

**File:** [ProductDetails.jsx](./src/components/products/ProductDetails.jsx), [ProductDetails.css](./src/components/products/ProductDetails.css).

**Kiểm tra:** lint/build đạt. Playwright xác nhận hai mép đáy lệch không quá 1px tại 1440/1069/834/641px; không tràn ngang ở các mốc này và 640/360px; bấm ảnh mở Modal. Đã xem ảnh desktop/mobile: [Desktop](./docs/previews/gallery-aligned-1440.png), [Mobile](./docs/previews/gallery-aligned-360.png). Không thay logic dữ liệu.


### Đợt 017 — 22/09/2026 — Căn khoảng cách card mua

**Đã thực hiện:** bỏ các margin rời rạc trong card mua, dùng flex-column với gap 12px giữa các nhóm. Cụm giá và hai nút cách nhau 8px; giảm padding khối ghi chú còn 12px, bỏ margin 24px quanh ghi chú và nhóm bảo hành. Liên kết desktop cao tối thiểu 32px, mobile giữ 44px để dễ chạm. CSS chỉ áp dụng trong card mua, dùng token DESIGN.md.

**File:** [ProductDetails.css](./src/components/products/ProductDetails.css).

**Kiểm tra:** lint/build đạt. Đã xem card ở desktop 1440px, tablet 834px và mobile 360px; không tràn ngang. Tab/Enter kích hoạt liên kết bảo hành và mở Modal đúng. Ảnh: [Desktop](./docs/previews/purchase-spacing-1440.png), [Tablet](./docs/previews/purchase-spacing-834.png), [Mobile](./docs/previews/purchase-spacing-360.png). Không chạy lại test dữ liệu vì chỉ sửa CSS.


### Đợt 016 — 22/09/2026 — Sắp lại chi tiết sản phẩm theo mẫu ThinkPro

**Đã thực hiện:** khối thông tin chia hai cột ảnh/chính sách và tên/phiên bản/thông số; cột mua riêng bên phải hiển thị giá, đặt mua, thêm giỏ và thông tin bảo hành/giao nhận. Thêm bản tóm tắt thông số với nút Xem tất cả mở Modal dùng bảng thông số hiện có. Chuyển danh sách mua kèm ngay sau khu thông tin/mua, trước mô tả và đánh giá. Giữ nội dung và tương tác mô tả/đánh giá. Dưới 1069px đưa khu mua xuống dưới khối thông tin; dưới 641px chuyển thông tin thành một cột theo thứ tự tên, ảnh, phiên bản, thông số, chính sách. Giữ breadcrumb và token DESIGN.md; không thêm dependency hay chính sách bán hàng chưa có.

**File:** [ProductDetails.jsx](./src/components/products/ProductDetails.jsx), [ProductDetails.css](./src/components/products/ProductDetails.css).

**Kiểm tra:** lint/build đạt; chạy lại product-browser.mjs đạt các luồng phiên bản/giá, hết hàng, giỏ, đặt mua dùng thử, nhận xét, chính sách, tab và mở rộng mô tả; không lỗi JavaScript hoặc tràn ngang tại 10 độ rộng. Kiểm tra thêm Modal thông số và thứ tự thông tin → mua kèm → mô tả/đánh giá. Đã xem trực quan desktop/tablet/mobile, điều chỉnh mobile để tiêu đề đứng trước ảnh. Ảnh: [Desktop](./docs/previews/product-thinkpro-1440.png), [Tablet](./docs/previews/product-thinkpro-834.png), [Mobile](./docs/previews/product-thinkpro-360.png).

**Giới hạn tham khảo:** URL ThinkPro không truy cập được (web cache miss, trình duyệt ERR_NETWORK_ACCESS_DENIED); dùng ảnh người dùng cung cấp làm tham chiếu bố cục. Dữ liệu mua kèm và thông số vẫn là dữ liệu minh họa có sẵn; chưa có backend nhận đơn/nhận xét.


### Đợt 015 — 22/09/2026 — Đồng bộ breadcrumb và đưa tên vào gallery

**Đã thực hiện:** breadcrumb trang chi tiết dùng chữ 14px và dấu phân cách `>` giống trang danh mục. Chuyển toàn bộ cụm thương hiệu, tên sản phẩm, thông số tóm tắt và liên kết đánh giá vào `.pdp-panel.pdp-gallery`; giữ một h1 và liên kết nhãn truy cập cho section. Khoảng cách breadcrumb tới hai cột dùng `space-md`, padding tiêu đề dùng token hiện có theo DESIGN.md.

**File:** [Product.jsx](./src/pages/Product.jsx), [ProductDetails.jsx](./src/components/products/ProductDetails.jsx), [ProductDetails.css](./src/components/products/ProductDetails.css).

**Kiểm tra:** lint/build đạt. Playwright đối chiếu font và separator thực tế với trang Laptop, xác nhận h1 nằm trong gallery, không tràn ngang ở 1440/834/833/360px. Đã xem ảnh desktop, tablet và mobile: [1440px](./docs/previews/product-heading-1440.png), [834px](./docs/previews/product-heading-834.png), [360px](./docs/previews/product-heading-360.png). Không chạy lại test service vì chỉ sửa bố cục/CSS.


### Đợt 014 — 22/09/2026 — Trang chi tiết sản phẩm

**Mục tiêu:** triển khai bố cục theo ảnh người dùng: thông tin và nhận xét bên trái, chọn phiên bản/đặt mua thành cột riêng bên phải, sản phẩm mua cùng bên dưới.

**Đã thực hiện:** thêm URL `/san-pham/:id`, nối ảnh/tên sản phẩm và hộp xem nhanh tới trang chi tiết. Dùng lại ShopLayout, ProductCard và giỏ hàng. Có album ảnh và phóng to, liên kết chính sách, tab mô tả/thông số/thông tin, mở rộng mô tả. Cột phiên bản cập nhật giá, khóa lựa chọn hết hàng, thêm giỏ và xem trước đặt mua. Nhận xét có trạng thái trống, thống kê sao và form validation; nội dung dùng thử chỉ tồn tại trong phiên trang hiện tại. Khu mua cùng dùng danh mục minh họa, chưa suy luận từ lịch sử đơn hàng. Desktop hai cột, chuyển một cột tại 833px, đặt khu mua ngay sau ảnh trên mobile. Màu, khoảng cách và radius dùng token hiện có; loading/error/form là phần mở rộng theo quy tắc Known Gaps.

**File chính:** [Product.jsx](./src/pages/Product.jsx), [ProductDetails.jsx](./src/components/products/ProductDetails.jsx), [ProductDetails.css](./src/components/products/ProductDetails.css), [App.jsx](./src/App.jsx), [ShopLayout.jsx](./src/layouts/ShopLayout.jsx), [ProductCard.jsx](./src/components/products/ProductCard.jsx), [ProductDialog.jsx](./src/components/products/ProductDialog.jsx), [catalog.js](./src/services/mock/catalog.js).

**Kiểm tra:** lint/build đạt; 10 test category-service đạt. Playwright/Edge headless kiểm tra link từ trang chủ, route không tồn tại, đổi phiên bản và giá, toàn bộ sản phẩm hết hàng, giỏ hàng, xem trước đặt mua, validation/gửi nhận xét, tab, mở rộng mô tả, chính sách, album/phóng to và chọn ảnh bằng Tab/Enter. Không ghi nhận lỗi JavaScript; không tràn ngang ở 360, 640, 641, 735, 736, 833, 834, 1068, 1069, 1440px. Đã xem trực quan ảnh desktop/tablet/mobile. Script lưu ở [product-browser.mjs](./tests/product-browser.mjs) và [product-gallery-browser.mjs](./tests/product-gallery-browser.mjs); chạy khi Vite ở cổng 5173, đặt CODEX_NODE_PACKAGES tới thư mục node_modules chứa Playwright của runtime. Môi trường không có CLI agent-browser nên dùng Playwright có sẵn.

**Ảnh:** [Desktop](./docs/previews/product-desktop.png), [Tablet](./docs/previews/product-834.png), [Mobile](./docs/previews/product-360.png), [Đầu trang mobile](./docs/previews/product-mobile-top.png).

**Giới hạn:** chưa tích hợp backend nhận xét/đơn hàng/checkout. Đặt mua chỉ mở bảng kiểm tra lựa chọn và lưu giỏ, có thông báo rõ. Các sản phẩm ngoài iPhone dùng ảnh đơn hiện có; dữ liệu gợi ý mua cùng và thông số vẫn minh họa. Không thêm dependency.


### Đợt 013 — 20/09/2026 — Xem thêm sản phẩm trong catalog

**Đã thực hiện:** thay phân trang bằng nút Ant Design “Xem thêm” dạng pill, vùng bấm tối thiểu 44px theo DESIGN.md. Ban đầu hiển thị tối đa 20 sản phẩm; mỗi lần mở thêm tối đa 20, giữ các thẻ cũ khi tải và không cuộn về đầu. Hiển thị số lượng đã xem, ẩn nút khi hết kết quả. Đổi bộ lọc/sắp xếp reset mức hiển thị. Lỗi khi mở thêm giữ danh sách và có nút thử lại. Query page lưu số đợt đã mở để tải lại/Back khôi phục mức hiển thị.

**File:** [useCategoryCatalog.js](./src/hooks/useCategoryCatalog.js), [Category.jsx](./src/pages/Category.jsx), [Catalog.css](./src/components/catalog/Catalog.css).

**Kiểm tra:** lint/build và 10 test service đạt. Trình duyệt xác nhận 20 → 24 thẻ, hết dữ liệu ẩn nút; Enter kích hoạt được, chọn Apple reset query page. Đã xem ảnh desktop 1440px, tablet 834px, mobile 390px; không ghi nhận lỗi JavaScript. Ảnh trong docs/previews/catalog-more-*.png.

**Giới hạn:** hiện truy vấn lại từ đầu với limit tăng dần qua service mock để giữ logic đơn giản; khi tích hợp API với dữ liệu lớn cần cân nhắc tải nối theo cursor. Chưa giả lập lỗi mạng trên trình duyệt.

### Đợt 012 — 20/09/2026 — Mở/thu gọn từng nhóm lọc

**Đã thực hiện:** thêm nút chevron ở bên phải, cùng hàng với legend của Thương hiệu, Khoảng giá, Màu sắc, Ưu đãi & tình trạng. Mỗi nhóm mở mặc định và đóng/mở độc lập; thu gọn giữ nguyên lựa chọn và URL. Nút Ant Design 44px dùng aria-expanded/aria-controls và tên truy cập; vùng ẩn không nhận focus. Giữ token màu/spacing hiện có theo DESIGN.md.

**File:** [CatalogFilters.jsx](./src/components/catalog/CatalogFilters.jsx), [Catalog.css](./src/components/catalog/Catalog.css).

**Kiểm tra:** lint/build đạt. Desktop thu gọn thương hiệu không đổi URL; Enter mở lại vẫn giữ Apple đã chọn. Mobile Drawer thu gọn khoảng giá hoạt động; đã xem ảnh desktop/mobile, không ghi nhận lỗi JavaScript. Không chạy lại test service vì không đổi logic lọc. Ảnh: [desktop](./docs/previews/filter-expand-desktop.png), [mobile](./docs/previews/filter-expand-mobile.png).

### Đợt 011 — 20/09/2026 — Chips lọc thương hiệu

**Đã thực hiện:** thay Checkbox.Group thương hiệu bằng các nút Ant Design dạng pill, chọn/bỏ nhiều thương hiệu bằng aria-pressed. Mặc định hiện 8 thương hiệu; Xem thêm/Thu gọn cho danh sách dài. Thương hiệu đang chọn vẫn hiện khi thu gọn. Giữ URL, bộ lọc kết hợp và nút đặt lại hiện có. Dùng nền trắng, selected parchment/viền focus theo DESIGN.md, vùng bấm tối thiểu 44px; các checkbox khác giữ nguyên.

**File:** [CatalogFilters.jsx](./src/components/catalog/CatalogFilters.jsx), [Catalog.css](./src/components/catalog/Catalog.css).

**Kiểm tra:** lint/build đạt. Trình duyệt chọn Apple và ASUS đồng thời cập nhật query và aria-pressed; mở rộng hiển thị 16 thương hiệu; đã xem desktop và Drawer mobile, Escape đóng được. Không ghi nhận lỗi JavaScript. Không chạy lại test service vì không đổi thuật toán lọc. Ảnh: [desktop](./docs/previews/brand-chips-desktop.png), [mobile](./docs/previews/brand-chips-mobile.png).

### Đợt 010 — 10/09/2026 — 20 sản phẩm mỗi trang và căn footer

**Đã thực hiện:** dùng hằng CATEGORY_PAGE_SIZE = 20 cho truy vấn và Pagination. Trang Tất cả có đủ 20 thẻ ở trang đầu (5 hàng × 4 cột desktop), trang hai có 4 thẻ còn lại. Không nhân bản sản phẩm để lấp kết quả lọc/danh mục ít hơn 20. Đưa ghi chú và phân trang vào catalog-footer: ghi chú trái, phân trang phải, căn giữa theo chiều dọc; dưới 834px xuống dòng để tránh tràn.

**File:** [useCategoryCatalog.js](./src/hooks/useCategoryCatalog.js), [Category.jsx](./src/pages/Category.jsx), [Catalog.css](./src/components/catalog/Catalog.css).

**Kiểm tra:** lint/build đạt. Trình duyệt xác nhận trang đầu 20 thẻ/5 hàng ở 1440px, nút trang kế chuyển URL page=2 và trả 4 thẻ. Đo hai phần footer nằm cùng hàng desktop; mobile 390px không tràn ngang. Ảnh footer: [desktop](./docs/previews/catalog-footer-20.png), [mobile](./docs/previews/catalog-footer-mobile.png). Không đổi dữ liệu hoặc thuật toán phân trang service.

### Đợt 009 — 10/09/2026 — Giới hạn dòng và căn hàng nội dung card

**Đã thực hiện:** card danh mục dành cố định hai dòng cho tên, cắt tên vượt hai dòng bằng ellipsis; cấu hình một dòng, phần dư thành dấu “…”. Chiều cao được tính theo font/line-height để thích ứng mobile. Thêm title chứa nội dung đầy đủ; hộp xem cấu hình vẫn giữ toàn bộ thông tin. Không đổi dữ liệu hoặc phần ảnh.

**File:** [Catalog.css](./src/components/catalog/Catalog.css), [ProductCard.jsx](./src/components/products/ProductCard.jsx).

**Kiểm tra:** lint/build đạt. Đo tại 1440, 1069, 768, 390px: không tràn ngang; vùng tên/cấu hình có cùng chiều cao giữa card, hàng giá đồng mức trong mỗi hàng desktop/tablet. Đã xem [ảnh desktop](./docs/previews/catalog-text-aligned.png). Không chạy lại test service vì chỉ đổi trình bày. Quy tắc cắt dòng là phần mở rộng chức năng theo yêu cầu, giữ typography và spacing DESIGN.md.

### Đợt 008 — 10/09/2026 — Bổ sung dữ liệu mock catalog

**Mục tiêu:** đủ sản phẩm và tình huống để thử bộ lọc, phân trang, lựa chọn phiên bản.

**Đã thực hiện:** thêm 18 sản phẩm, tổng 24 (8 Laptop, 8 Điện thoại, 8 Linh kiện PC); giữ nguyên sáu sản phẩm và ID phiên bản cũ để không ảnh hưởng giỏ đã lưu. Thêm ASUS, Lenovo, Dell, HP, Samsung, Xiaomi, OPPO, vivo, AMD, Intel, Corsair, Kingston, MSI, Cooler Master. Có nhiều mức giá, màu, cờ ưu đãi, phiên bản hết hàng và ba sản phẩm hết hàng hoàn toàn. Mỗi mẫu mới có hai lựa chọn, trong đó một lựa chọn bảo hành mở rộng giả lập. Tất cả giá/cấu hình/tồn kho đều là fixture học tập.

**Ảnh:** mẫu mới dùng thông báo “Ảnh đang cập nhật” trên nền trong suốt, không lấy ảnh Apple gán cho hãng khác. Chưa bổ sung ảnh đúng model; công việc thay ảnh trong suốt của đợt 007 vẫn còn dở.

**File:** [catalog.js](./src/services/mock/catalog.js), [placeholder](./public/images/product-pending.svg), [tests](./tests/category-service.test.js), [CATEGORY.md](./docs/CATEGORY.md).

**Kiểm tra:** lint/build đạt, 10/10 kiểm tra service đạt. Trình duyệt: Laptop trang 2 có HP Pavilion/ASUS ROG; lọc ASUS từ trang 2 quay về trang đầu với 2 kết quả; mẫu ASUS ROG hết hàng không cho thêm giỏ. Mobile 390px không tràn ngang, không ảnh hỏng; không ghi nhận lỗi JavaScript. [Ảnh mobile](./docs/previews/catalog-mock-mobile.png).

**Tiếp theo:** bổ sung ảnh đúng model và hoàn tất công việc ảnh trong suốt; chưa tích hợp DB/API thật.

### Đợt 007 — 10/09/2026 — Điều chỉnh giá và thử ảnh trong suốt (phiên bị ngắt)

**Ghi nhận bổ sung:** đã giảm khoảng đệm trên giá về 8px và đưa nút mũi tên cùng hàng; ảnh iPhone PNG trong suốt đã tải vào public/images nhưng chưa tích hợp catalog. Ảnh tách nền MacBook do công cụ tạo ảnh trả về có nền ô caro nên không sử dụng. Việc thay ảnh nền trong suốt cho toàn bộ catalog chưa hoàn tất. Đây là trạng thái của phiên trước, không phải phần đã hoàn thành trong đợt bổ sung dữ liệu.

**File:** [Catalog.css](./src/components/catalog/Catalog.css), [iPhone PNG](./public/images/iphone-transparent.png), [iPhone Pro PNG](./public/images/iphone-pro-transparent.png). Lint/build trong đợt tiếp theo đã bao gồm trạng thái mã này; chưa xác nhận toàn bộ yêu cầu ảnh hoàn thành.

### Đợt 006 — 10/09/2026 — Lưới 4 cột và card danh mục gọn hơn

**Mục tiêu:** tăng số sản phẩm mỗi hàng desktop, bỏ dòng nhãn và tình trạng được khoanh, cải thiện vùng ảnh có nền xám.

**Đã thực hiện:** catalog-grid dùng 4 cột từ 1069px, 2 cột ở 641–1068px, 1 cột đến 640px. Thêm tùy chọn compact vào ProductCard để danh mục không render badge/ưu đãi và dòng tồn kho; trang chủ giữ cách trình bày hiện tại. Giá và tồn kho chi tiết vẫn có trong hộp cấu hình. Vùng ảnh phủ nền parchment, giữ object-fit contain và màu ảnh gốc; không dùng filter, không sửa file ảnh. Điều chỉnh padding, xuống dòng giá/tên và nút cấu hình 44px cho card hẹp.

**Đối chiếu thiết kế:** bảng breakpoint DESIGN.md cho phép 4–5 cột desktop; nền ảnh trung tính sáng, giữ tỷ lệ, radius card 18px và không shadow phù hợp. Phần lớn nền ảnh laptop hòa vào parchment; ảnh nguồn có nền trắng/tối vẫn giữ nền đó. Muốn đồng nhất hoàn toàn cần bộ ảnh PNG/WebP nền trong suốt, chưa thay trong đợt này.

**File:** [Catalog.css](./src/components/catalog/Catalog.css), [ProductCard.jsx](./src/components/products/ProductCard.jsx), [Category.jsx](./src/pages/Category.jsx), [CATEGORY.md](./docs/CATEGORY.md).

**Kiểm tra:** lint/build đạt. Đo 360, 640, 641, 768, 833, 834, 1068, 1069, 1440px: đúng số cột, không tràn ngang trang/thẻ, không còn hai dòng bị loại trong catalog. Đã xem desktop/tablet/mobile, mở cấu hình Air 13 và đóng bằng Escape. Không ghi nhận lỗi JavaScript. Không chạy lại test service vì không đổi dữ liệu/logic lọc. Laptop chỉ có ba sản phẩm mẫu nên còn một ô trống; dùng trang Tất cả sản phẩm để kiểm tra hàng đủ bốn thẻ.

**Ảnh:** [Desktop](./docs/previews/category-four-desktop.png), [Tablet](./docs/previews/category-four-tablet.png), [Mobile](./docs/previews/category-four-mobile.png).

### Đợt 005 — 10/09/2026 — Cân khoảng cách chips và ghi nhận panel không viền

**Mục tiêu:** kiểm tra border người dùng đã bỏ, thu gọn khoảng cách quanh chips lọc.

**Đã thực hiện:** giữ nguyên phần bỏ viền của người dùng. Mẫu store-utility-card trong DESIGN.md có border 1px; panel bố cục không viền được ghi nhận là biến thể mở rộng theo lựa chọn người dùng, vẫn dùng nền trắng trên parchment, radius 18px, không shadow. Giảm margin dưới toolbar và chips từ 24px về token space-sm (12px), margin dưới nút lọc mobile từ 20px về 12px; giữ vùng thao tác tối thiểu 44px.

**File:** [Catalog.css](./src/components/catalog/Catalog.css), [CATEGORY.md](./docs/CATEGORY.md).

**Kiểm tra:** build đạt; đã xem desktop 1440px, tablet 768px và mobile 390px. Đo khoảng cách toolbar/chips đúng 12px, chip cao 46px; mobile không tràn ngang. Xóa tất cả bỏ chips và giữ ba sản phẩm Laptop. Không ghi nhận lỗi JavaScript. Không chạy lại lint/test service vì chỉ chỉnh CSS và tài liệu.

**Ảnh:** [Desktop](./docs/previews/category-chips-desktop.png), [Tablet](./docs/previews/category-chips-tablet.png), [Mobile](./docs/previews/category-chips-mobile.png). Không thay đổi phạm vi tính năng hoặc dữ liệu.

### Đợt 004 — 10/09/2026 — Thu gọn và phân vùng trang danh mục

**Mục tiêu:** giảm diện tích giới thiệu, tách rõ ba vùng được đánh dấu trong ảnh phản hồi.

**Đã thực hiện:** giới thiệu, bộ lọc và danh sách có nền trắng, viền mảnh, bo góc 18px theo token store-utility-card; không thêm bóng đổ. Đây là áp dụng token cho vùng chức năng bên trong container, không phải full-bleed tile. Bỏ khẩu hiệu nhỏ trên tiêu đề, giảm tiêu đề desktop từ 56 xuống 40px và khoảng đệm; intro Laptop đo được 113px ở desktop. Điều chỉnh khoảng cách và chiều rộng bộ lọc để nội dung vừa trong panel; mobile vẫn dùng Drawer.

**File:** [Catalog.css](./src/components/catalog/Catalog.css), [Category.jsx](./src/pages/Category.jsx), [tài liệu danh mục](./docs/CATEGORY.md).

**Kiểm tra:** build và lint đạt. Đã xem desktop/tablet/mobile; đo 360, 640, 641, 768, 833, 834, 1068, 1069, 1440px, không tràn ngang trang hoặc thẻ. Kiểm tra ba panel có nền trắng/bo 18px; lọc mobile về kết quả rỗng, Escape trả focus về nút Bộ lọc, xóa lọc khôi phục kết quả. Không có lỗi JavaScript được ghi nhận. Không chạy lại test service vì chỉ thay bố cục và nội dung giới thiệu.

**Ảnh:** [Desktop](./docs/previews/category-panels-desktop.png), [Tablet](./docs/previews/category-panels-tablet.png), [Mobile](./docs/previews/category-panels-mobile.png). Phạm vi dữ liệu giả lập và các hạng mục chưa triển khai giữ như đợt 003.

### Đợt 003 — 09/09/2026 — Trang danh mục sản phẩm

**Mục tiêu:** mở danh mục từ header/trang chủ, có breadcrumb, bộ lọc trái và danh sách phải.

**Đã thực hiện:**

- Tạo bốn URL danh mục; nối nút ở header, Home, footer; breadcrumb quay về Trang chủ.
- Lọc thương hiệu, giá, màu, khuyến mại, còn hàng; bỏ từng điều kiện/đặt lại. Sắp xếp, tìm kiếm trong danh mục, giữ query khi reload/Back.
- Responsive theo DESIGN.md; Ant Design cho controls và Drawer mobile. Có loading, empty, error/retry, phân trang ở service.
- Tách ShopLayout dùng chung xem nhanh, giỏ và hỗ trợ giữa hai trang; giữ giỏ qua trang. Bổ sung màu/ưu đãi minh họa cho dữ liệu hiện có.
- Sửa tương phản breadcrumb và thứ tự heading sau kiểm tra truy cập. Lưu ảnh và hợp đồng service.

**File chính:** [Category.jsx](./src/pages/Category.jsx), [catalog components](./src/components/catalog/), [ShopLayout.jsx](./src/layouts/ShopLayout.jsx), [Home.jsx](./src/pages/Home.jsx), [App.jsx](./src/App.jsx), [useCategoryCatalog.js](./src/hooks/useCategoryCatalog.js), [categoryRoutes.js](./src/utils/categoryRoutes.js), [productService.js](./src/services/productService.js), [catalog.js](./src/services/mock/catalog.js), [header](./src/components/header/), [footer](./src/components/footer/), [ProductCard.jsx](./src/components/products/ProductCard.jsx), [theme.js](./src/assets/theme.js).

**Kiểm tra:** lint/build đạt; [8 bài kiểm tra service](./tests/category-service.test.js) đạt. Đã thử chuyển danh mục, tìm kiếm, kết hợp lọc, kết quả rỗng, reload/Back, xem nhanh/thêm giỏ/giữ giỏ qua trang, lọc mobile và bàn phím. Không tràn ngang tại 9 độ rộng 360–1440px đã đo. Axe: 0 vi phạm, 1 mục tương phản Select chưa tự xác định do lớp input; đã đối chiếu màu chữ/nền và xem trực quan. Không phát hiện lỗi JavaScript hoặc ảnh hỏng trong phạm vi đã thử.

**Giới hạn/tiếp theo:** dữ liệu gồm sáu sản phẩm mẫu; phân trang nhiều trang đã kiểm tra ở service, chưa đủ sản phẩm để thử điều khiển nhiều trang trên UI. Chưa mô phỏng lỗi service trên UI. Trang chi tiết riêng và Supabase chưa thực hiện. Hosting cần rewrite URL về index.html.

**Chi tiết và ảnh:** [CATEGORY.md](./docs/CATEGORY.md), [Desktop](./docs/previews/category-desktop.png), [Tablet](./docs/previews/category-tablet.png), [Mobile](./docs/previews/category-mobile.png), [Bộ lọc mobile](./docs/previews/category-mobile-filter.png).

### Đợt 002 — 09/09/2026 — Khởi tạo nhật ký tiến trình

**Mục tiêu:** có một nơi theo dõi thay đổi và duy trì việc ghi nhận sau mỗi lần code.

**Đã thực hiện:**

- Tạo `PROGRESS.md`, bổ sung tổng quan hiện trạng và ghi lại đợt xây dựng trang chủ vừa hoàn thành.
- Bổ sung mục 13 trong `AGENTS.md`: bắt buộc cập nhật tiến trình trước khi bàn giao, giữ lịch sử, ghi rõ kiểm tra và công việc chưa hoàn tất.
- Thêm liên kết tới nhật ký trong `README.md` để dễ tìm.

**File thay đổi:** [PROGRESS.md](./PROGRESS.md), [AGENTS.md](./AGENTS.md), [README.md](./README.md).

**Kiểm tra:** đối chiếu với code trang chủ và tài liệu hiện có; kiểm tra các mục nhật ký và liên kết file. Không chạy lại lint/build hoặc trình duyệt vì đợt này chỉ thay đổi Markdown.

**Tiếp theo:** các đợt code sau tiếp tục ghi vào file này theo mục 13 của `AGENTS.md`.

### Đợt 001 — 08–09/09/2026 — Xây dựng trang chủ Chanh&Man

Mục này được ghi bổ sung ngày 09/09/2026, dựa trên code hiện có, kết quả kiểm tra trong đợt triển khai trước và [tài liệu trang chủ](./docs/HOMEPAGE.md).

**Mục tiêu:** tạo trang chủ cửa hàng laptop, điện thoại và linh kiện PC theo 8 phần đã thống nhất, tuân thủ `DESIGN.md` và `AGENTS.md`, chuẩn bị lớp service để nối API sau.

**Giao diện đã xây dựng:**

1. **Header:** thương hiệu Chanh&Man, danh mục, tìm kiếm, tài khoản, giỏ hàng; menu thu gọn trên mobile.
2. **Hero:** thông điệp “Một lựa chọn tốt. Vạn điều có thể.”, ảnh MacBook Air và các nút khám phá.
3. **Danh mục:** laptop, điện thoại, linh kiện PC; chọn nhóm để cập nhật danh sách sản phẩm.
4. **Sản phẩm nổi bật:** thẻ ảnh, tên, thông số, giá, trạng thái hàng; lọc danh mục và xem thêm.
5. **Chọn theo nhu cầu:** học tập, văn phòng, gaming, sáng tạo và nâng cấp PC.
6. **Bộ sưu tập:** khối nền tối giới thiệu thiết bị phục vụ sáng tạo.
7. **Dịch vụ/hỗ trợ:** mở nội dung hướng dẫn chọn mua, bảo hành, giao nhận và đổi trả; không đưa ra cam kết bán hàng chưa có.
8. **Footer:** liên kết danh mục, hỗ trợ, giới thiệu và thông báo phạm vi bản học tập.

**Tương tác và dữ liệu:**

- Tìm kiếm có/không dấu; kết hợp lọc danh mục và nhu cầu. Query string giữ tiêu chí khi tải lại hoặc dùng Back/Forward.
- Có trạng thái đang tải, kết quả rỗng, lỗi và thử lại; hủy truy vấn cũ khi tiêu chí thay đổi.
- Hộp xem nhanh cho phép chọn phiên bản; giá thay đổi theo lựa chọn, phiên bản hết hàng không thể chọn mua.
- Giỏ hàng gộp theo phiên bản, hỗ trợ đổi số lượng, xóa dòng và tính tạm tính; lưu trên trình duyệt và khôi phục khi tải lại.
- Tách dữ liệu mẫu và service khỏi UI để thuận tiện tích hợp API sau này.

**Thiết kế và tổ chức mã:**

- Thiết lập theme Ant Design, locale tiếng Việt và token dùng chung với CSS theo `DESIGN.md`.
- Áp dụng nền sáng/tối, màu nhấn xanh, ảnh sản phẩm lớn và component riêng cho khu vực giới thiệu.
- Điều chỉnh chữ phụ sang token có độ tương phản phù hợp; hỗ trợ bàn phím, skip link và giảm chuyển động.
- Tải hộp cấu hình/giỏ theo nhu cầu; ảnh hero có nguồn mobile, ảnh dưới màn hình đầu tải chậm.
- Cập nhật tên trang, mô tả, favicon và hướng dẫn chạy dự án; lưu ảnh xem trước và nguồn ảnh minh họa.

**File/thư mục chính:**

| Nhóm | File/thư mục |
|---|---|
| Khởi tạo và ghép trang | [App.jsx](./src/App.jsx), [main.jsx](./src/main.jsx), [Home.jsx](./src/pages/Home.jsx) |
| Theme và CSS chung | [theme.js](./src/assets/theme.js), [index.css](./src/index.css) |
| Điều hướng và footer | [header](./src/components/header/), [footer](./src/components/footer/) |
| Các khối trang chủ | [HomeSections.jsx](./src/components/home/HomeSections.jsx), [HomeSections.css](./src/components/home/HomeSections.css) |
| Sản phẩm | [products](./src/components/products/) |
| Giỏ hàng | [CartDrawer.jsx](./src/components/cart/CartDrawer.jsx), [useCart.js](./src/hooks/useCart.js), [cartService.js](./src/services/cartService.js) |
| Catalog và tìm kiếm | [useCatalog.js](./src/hooks/useCatalog.js), [productService.js](./src/services/productService.js), [catalog.js](./src/services/mock/catalog.js) |
| Nội dung và tiện ích | [shopInfo.js](./src/assets/shopInfo.js), [Icon.jsx](./src/components/Icon.jsx), [formatMoney.js](./src/utils/formatMoney.js) |
| Nhận diện và ảnh | [index.html](./index.html), [favicon.svg](./public/favicon.svg), [images](./public/images/) |
| Tài liệu và ảnh xem trước | [README.md](./README.md), [HOMEPAGE.md](./docs/HOMEPAGE.md), [previews](./docs/previews/) |

**Kiểm tra đã đạt trong đợt xây dựng trang chủ:**

- `npm run lint` và `npm run build` thành công.
- Đã thử tìm kiếm, kết quả rỗng, Back, menu mobile, thay phiên bản/giá, thêm giỏ và giữ giỏ sau reload.
- 13 kiểm tra service trong trình duyệt đã đạt, gồm tìm không dấu, lọc theo nhu cầu, hủy truy vấn, gộp/tách phiên bản, tính tiền, giới hạn tồn kho và xử lý dữ liệu lưu trữ hỏng. Đây là kiểm tra đã chạy trong phiên trước, chưa phải bộ test tự động được lưu trong repository.
- Các độ rộng 360, 640, 641, 768, 833, 834, 1068, 1069 và 1440px không gây tràn ngang trang; đã xem trực quan desktop, tablet và mobile.
- Kiểm tra axe trên trang chủ desktop và danh mục điện thoại mobile: 0 vi phạm, 0 mục chưa xác định trong phạm vi kiểm tra.
- Không phát hiện lỗi JavaScript hoặc ảnh hỏng trên các màn hình đã kiểm tra.

**Ảnh xem trước:** [Màn hình đầu trang](./docs/previews/home-hero.png), [Desktop](./docs/previews/home-desktop.png), [Tablet](./docs/previews/home-tablet.png), [Mobile](./docs/previews/home-mobile.png).

**Chưa thực hiện / hướng tiếp tục:** xây các trang danh sách và chi tiết riêng, tài khoản, checkout, đơn hàng và quản trị theo [FE_PLAN.md](./FE_PLAN.md). Database, Auth và tích hợp Supabase thực hiện sau khi hoàn thiện FE theo phạm vi thống nhất.







