# Kế hoạch frontend — cửa hàng điện tử

Ngày lập: 08/09/2026. Cập nhật: **01/10/2026** (Asia/Saigon).

Trạng thái: **đã triển khai một phần FE bằng dữ liệu giả lập; chưa hoàn tất luồng đặt hàng và quản trị**. Hiện trạng dưới đây được đối chiếu với mã nguồn và [PROGRESS.md](./PROGRESS.md); không phải kết quả nghiệm thu lại trên trình duyệt.

## 1. Mục tiêu và trình tự

Xây dựng website bán laptop, linh kiện PC và điện thoại để học ReactJS và Supabase. Hoàn thành FE bằng dữ liệu giả lập trước, sau đó thiết kế DB và tích hợp backend thật.

FE phải chạy được luồng xem hàng → chọn phiên bản → giỏ hàng → đăng nhập → đặt hàng COD → xem đơn → quản trị xử lý đơn. Giai đoạn FE mô phỏng tài khoản, tồn kho và đơn hàng; chỉ được coi là giao dịch thật sau khi hoàn tất backend.

Hiện tại dùng React + Vite, JavaScript, CSS và Ant Design; đã có theme/locale tiếng Việt, Header/Footer và ShopLayout dùng chung. App.jsx chọn trang theo window.location.pathname; chưa cài React Router hoặc thư viện Supabase. URL không nhận diện hiện rơi về Home, chưa có 404 hoặc route guard.

Luồng đã có: trang chủ/danh mục → chi tiết hoặc xem nhanh → chọn phiên bản → giỏ Drawer → trang /cart, lưu trên trình duyệt. Trang giỏ dùng chung state với Header/Drawer, có thành tiền từng dòng, tạm tính, loading/empty/error và thông báo điều chỉnh theo tồn kho. Nút Đặt mua chỉ mở hộp kiểm tra lựa chọn rồi thêm giỏ; nút Tài khoản chỉ mở thông báo. Chưa có đăng nhập, checkout, tạo đơn hoặc xử lý đơn; nút Tiếp tục đặt hàng ở /cart đang disabled và giải thích rõ.

Tiếp tục tái sử dụng code hiện có theo [AGENTS.md](./AGENTS.md). [DESIGN.md](./DESIGN.md) là nguồn chuẩn UI/UX, ưu tiên hơn các mô tả giao diện trong kế hoạch này.

## 2. Phạm vi bản đầu

- Khách hàng: trang chủ, danh sách và chi tiết sản phẩm, giỏ hàng, đăng ký/đăng nhập/khôi phục mật khẩu, đặt hàng COD, hồ sơ và lịch sử đơn hàng.
- Quản trị: tổng quan, sản phẩm và phiên bản, danh mục/hãng, tồn kho và đơn hàng.
- Cho phép xem hàng và tạo giỏ khi chưa đăng nhập; yêu cầu đăng nhập để đặt hàng. Sau đăng nhập quay lại bước đặt hàng và giữ giỏ.
- Một cửa hàng, giao diện tiếng Việt, tiền VND, một địa chỉ nhập trong mỗi lần đặt hàng. Phí vận chuyển giả lập có cấu hình và hiển thị rõ.
- Để giai đoạn mở rộng: thanh toán trực tuyến, mã giảm giá, đánh giá có lưu trữ, yêu thích, so sánh và lắp cấu hình PC. Chi tiết hiện có nhận xét dùng thử trong state, mất khi tải lại; không coi là hệ thống đánh giá hoàn chỉnh.
- Thương hiệu hiện tại là Chanh&Man; dùng token, màu nhấn và quy tắc responsive từ DESIGN.md, không thiết kế lại các trang đã có trong đợt bổ sung chức năng.

## 3. Các giai đoạn và đầu ra

| Giai đoạn | Công việc | Điều kiện hoàn thành |
|---|---|---|
| 1. Thiết kế luồng và dữ liệu | Sơ đồ trang; phác thảo desktop/mobile cho danh sách, chi tiết, checkout và admin; định nghĩa dữ liệu đầu vào/đầu ra của service | Mỗi thao tác chính có trang đích, trạng thái và dữ liệu cần thiết |
| 2. Nền tảng giao diện | Router, ShopLayout, AdminLayout, Header/Footer, màu/chữ/khoảng cách, control Ant Design, trang 404 | Điều hướng chạy; bố cục dùng được trên điện thoại và máy tính |
| 3. Danh mục và sản phẩm | Service giả lập bất đồng bộ, trang chủ, tìm kiếm/lọc/sắp xếp/Xem thêm, chi tiết và chọn phiên bản | URL giữ bộ lọc; phiên bản đổi đúng ảnh/giá/tồn kho; có loading/empty/error |
| 4. Tài khoản và mua hàng | Phiên người dùng giả lập, giỏ hàng, form giao hàng, COD, kết quả đặt hàng, hồ sơ và đơn của tôi | Chạy xuyên suốt luồng mua; giữ giỏ khi tải lại; có lỗi giá/tồn kho và chống nhấn gửi lặp |
| 5. Quản trị | Tổng quan từ dữ liệu giả lập, quản lý sản phẩm/phiên bản/danh mục/hãng, xem và xử lý đơn | Thao tác cập nhật thể hiện lại ở cửa hàng; tài khoản thường không vào giao diện admin |
| 6. Nghiệm thu FE | Kiểm tra responsive, bàn phím, trạng thái bất đồng bộ, dữ liệu lỗi, tài liệu service | Hoàn thành danh sách nghiệm thu ở mục 9; chốt dữ liệu FE cần trước khi xây DB |
| 7. DB và tích hợp | Thiết kế schema, migration, Auth, RLS, Storage; thay service giả lập bằng Supabase | Luồng thật được kiểm tra với nhiều tài khoản, kiểm soát giá/tồn kho và quyền ở backend |

Mỗi giai đoạn học theo nhịp: giải thích luồng → xây một phần nhỏ → chạy thử → giải thích component/state/service liên quan. Giai đoạn 7 chỉ bắt đầu sau khi FE được nghiệm thu.

### Hiện trạng theo giai đoạn

| Giai đoạn | Đã có | Còn thiếu |
|---|---|---|
| 1. Luồng và dữ liệu | Kế hoạch tổng thể, dữ liệu và service catalog/giỏ | Chốt luồng và hợp đồng tài khoản, checkout, đơn, admin |
| 2. Nền tảng | ShopLayout, Header/Footer, Ant Design, theme/locale | Router, 404, guard tài khoản/admin và AdminLayout |
| 3. Danh mục và sản phẩm | Home, Category, Product; tìm kiếm/lọc/sort/Xem thêm; chọn phiên bản, loading/empty/error theo màn hình | Lưu lựa chọn phiên bản trong URL, ảnh theo phiên bản, hoàn thiện ảnh/thông số và nghiệm thu trạng thái lỗi |
| 4. Tài khoản và mua hàng | Giỏ Drawer và /cart: gộp phiên bản, đổi số lượng, xóa, thành tiền/tạm tính, localStorage, cảnh báo điều chỉnh tồn kho | Auth, checkout COD, hồ sơ, đơn hàng; báo giá và xác nhận lại giá/tồn kho trước đặt hàng |
| 5. Quản trị | Chưa triển khai | Toàn bộ trang admin, quyền truy cập và kho mock có thể cập nhật dùng chung |
| 6. Nghiệm thu | Có test service danh mục và kết quả kiểm tra từng đợt trong PROGRESS.md | Nghiệm thu xuyên suốt mua hàng/admin và checklist mục 9 |
| 7. Backend | Chưa triển khai | Thực hiện sau nghiệm thu FE |

### Thứ tự làm tiếp

1. Hoàn thiện điều hướng và 404, giữ các URL catalog/chi tiết đang có.
2. Trang giỏ đã có; tiếp tục tài khoản giả lập, giữ giỏ, quay lại checkout sau đăng nhập và bổ sung guard.
3. Nối checkout COD → chi tiết đơn thành công → lịch sử đơn và hồ sơ; hoàn thiện khôi phục mật khẩu.
4. Xây admin xử lý đơn, sản phẩm/phiên bản/tồn kho, danh mục/hãng và tổng quan; thay catalog tĩnh bằng kho mock dùng chung có thể cập nhật.
5. Hoàn thiện dữ liệu, trạng thái lỗi và nghiệm thu FE trước khi thiết kế DB.

## 4. Sơ đồ trang và trạng thái triển khai

| Đường dẫn | Nội dung | Hiện trạng |
|---|---|---|
| / | Trang chủ, danh mục, sản phẩm, tìm kiếm và hỗ trợ | Đã có |
| /san-pham | Tất cả sản phẩm; lọc hãng/màu/giá/khuyến mại/tồn kho, sort, Xem thêm | Đã có |
| /laptop, /dien-thoai, /linh-kien-pc | Danh sách theo danh mục, dùng chung Category | Đã có |
| /san-pham/:id | Album/phóng to ảnh, phiên bản, giá, thông số, tồn kho, thêm giỏ | Đã có; dùng ID, không phải slug riêng |
| /cart | Đổi số lượng, xóa, thành tiền, tạm tính và cảnh báo tồn kho | Đã có route /cart và /cart/; Drawer có liên kết Xem giỏ hàng; nút đặt hàng chưa khả dụng vì chưa có checkout |
| /checkout | Địa chỉ, phí vận chuyển, COD, xác nhận | Chưa có |
| /login, /register | Đăng nhập, đăng ký và trạng thái chờ xác minh giả lập | Chưa có; nút tài khoản chỉ mở thông báo |
| /forgot-password, /reset-password | Khôi phục, liên kết không hợp lệ/hết hạn giả lập | Chưa có |
| /account | Hồ sơ cá nhân | Chưa có |
| /account/orders | Lịch sử mua hàng | Chưa có |
| /account/orders/:id | Chi tiết đơn và kết quả đặt hàng thành công | Chưa có; không cần trang thành công riêng |
| /admin | Tổng quan | Chưa có |
| /admin/products | Danh sách và tồn kho theo phiên bản | Chưa có; không cần trang tồn kho riêng |
| /admin/products/new, /admin/products/:id/edit | Form sản phẩm, ảnh và phiên bản | Chưa có |
| /admin/categories, /admin/brands | Danh mục và hãng | Chưa có |
| /admin/orders, /admin/orders/:id | Danh sách, chi tiết và cập nhật trạng thái đơn | Chưa có |
| URL không tồn tại | Trang 404 | Chưa có; hiện hiển thị Home |

Các route chưa có ở bảng trên vẫn là kế hoạch. Thay tên /products và /products/:slug trong kế hoạch cũ bằng URL đang dùng; không cần tạo thêm trang tìm kiếm riêng.

Danh mục hiện giữ q, brand, color, price, promo, stock, sort và page trong query string; đổi bộ lọc đưa về page=1. Xem thêm tăng mức hiển thị theo nhóm 20 sản phẩm: hook truy vấn lại từ đầu với limit = 20 × page, không phải chuyển trang số. Giữ hành vi này khi hoàn thiện FE; chưa cần thay bằng cursor cho catalog mock. Lựa chọn phiên bản ở chi tiết hiện chỉ lưu trong state, chưa giữ trong URL.

Giới thiệu, tư vấn, bảo hành, giao nhận, đổi trả và quyền riêng tư hiện là Modal nội dung minh họa trong shopInfo. Đề xuất bổ sung trước khi mở bán: trang liên hệ/hỗ trợ và URL riêng cho chính sách, điều khoản mua hàng bằng mẫu trang nội dung chung. Đây là phần bổ sung sản phẩm, chưa triển khai và chưa có nội dung chính sách chính thức.

Desktop: bộ lọc bên trái, lưới hàng bên phải; chi tiết chia album và thông tin mua. Mobile: bộ lọc trong bảng mở, các khối xếp dọc, thao tác mua dễ chạm. Checkout hiển thị form và tóm tắt đơn; admin có bảng hoặc thẻ phù hợp màn hình hẹp.

## 5. Tổ chức FE và điểm thay API

Giữ React + Vite + JavaScript và CSS hiện tại. Đề xuất thêm React Router cho điều hướng. Chỉ thêm thư viện khác khi tính năng cần, kiểm tra tương thích và lưu lockfile khi cài.

Luồng dữ liệu: page/component → hook khi cần → service → dữ liệu giả lập; sau này service → Supabase. Component không import dữ liệu mẫu hoặc Supabase client trực tiếp.

- pages/: đã có Home, Category, Product, Cart; bổ sung checkout/tài khoản và nhóm admin khi triển khai.
- components/: đã có Header/Footer, HomeSections, ProductCard, ProductShowcase, ProductDialog, ProductDetails, CatalogFilters và CartDrawer. CartItems dùng chung thao tác giỏ giữa Drawer và /cart; CartPage.css nằm trong components/cart. Tái sử dụng trước khi tách thêm component; CSS component nằm cạnh JSX.
- layouts/: đã có ShopLayout; tiếp tục dùng cho cửa hàng, bổ sung AdminLayout khi làm admin, không tạo MainLayout trùng chức năng.
- services/: đã có productService và cartService; còn thiếu catalogService quản trị, authService, orderService, mediaService và thao tác ghi sản phẩm. Client Supabase bổ sung ở giai đoạn 7.
- services/mock/: đã có catalog.js là dữ liệu tĩnh; chưa có kho cập nhật chung cho admin/cửa hàng hoặc đơn hàng.
- hooks/: logic React dùng lại, gồm giỏ và phiên tài khoản nếu cần; Context chỉ cho dữ liệu thực sự chia sẻ, provider có thể đặt cùng hook tương ứng.
- utils/: định dạng tiền/ngày, kiểm tra form và các hàm thuần.
- assets/: ảnh và CSS chung; token màu/chữ/khoảng cách dùng CSS variables.

Hiện dùng state cục bộ cho form/modal, URL cho bộ lọc, useCart và localStorage cho giỏ; chưa có Context tài khoản/giỏ. Khi nối nhiều trang, chỉ thêm Context nếu thực sự cần chia sẻ state. Dữ liệu dẫn xuất như số món không tạo state trùng. Không dựng thư viện quản lý state hoặc bộ adapter tổng quát từ đầu.

Service catalog hiện trả Promise với độ trễ giả lập, hỗ trợ hủy truy vấn danh sách/bộ lọc; chưa có công cụ bật lỗi mạng. listProducts trả items, total, page, chưa trả pageSize. getProduct có lỗi NOT_FOUND; lỗi giỏ chưa thống nhất code/fieldErrors.

Quy ước cần hoàn thiện: thành công trả dữ liệu; thất bại throw lỗi có code, message và fieldErrors khi cần. Mã lỗi dự kiến: VALIDATION_ERROR, NOT_FOUND, UNAUTHENTICATED, FORBIDDEN, OUT_OF_STOCK, PRICE_CHANGED, NETWORK_ERROR. Khi thay Supabase, service ánh xạ dữ liệu/lỗi về hợp đồng FE; không trả cấu trúc SDK trực tiếp ra UI. Nếu bổ sung pageSize hoặc đổi tham số, cập nhật các caller và test cùng đợt.

| Service hiện có / cần bổ sung | Trách nhiệm/đầu vào và đầu ra |
|---|---|
| productService.listProducts(filters) — đã có | Nhận category, q, need, limit, page, brands, colors, priceRange, promotion, inStock, sort, signal; trả items, total, page |
| productService.getProduct(id) — đã có | Tra ID sản phẩm, trả sản phẩm và các phiên bản; lỗi NOT_FOUND nếu không tồn tại |
| productService.getHomeContent/getCategoryFilters/findVariant — đã có | Nội dung trang chủ, lựa chọn bộ lọc theo danh mục và tra phiên bản cho giỏ |
| productService.saveProduct(input) | Tạo/sửa sản phẩm và phiên bản; trả bản đã lưu; dùng cho admin |
| productService.archiveProduct(id), updateVariantStock(id, quantity) | Ẩn sản phẩm và điều chỉnh tồn kho; giữ dữ liệu đã gắn với đơn cũ |
| catalogService | Đọc/tạo/sửa/ẩn danh mục và hãng; có lỗi khi thao tác xung đột với dữ liệu đang dùng |
| authService | getSession, signIn, signUp, signOut, subscribeAuthChanges, requestPasswordReset, resetPassword, updateProfile; theo dõi cả trạng thái chờ xác minh email |
| cartService — đã có một phần | Đã có getCart, addItem, updateQuantity, removeItem; trả items (có productId), count, total; getCart thêm notices khi điều chỉnh tồn kho. Chưa có mergeGuestCart hoặc giỏ theo tài khoản |
| orderService.quoteOrder(input) | Nhận variantId, quantity, địa chỉ và COD; trả giá/phí/tổng mới nhất và vấn đề từng dòng |
| orderService.createOrder(input) | Nhận danh sách variantId/quantity, địa chỉ, COD và requestId; trả đơn hoặc lỗi giá/tồn kho; không tin tổng tiền do FE gửi |
| orderService.listMyOrders/getMyOrder | Đơn thuộc người dùng hiện tại; không lấy userId tùy ý từ form |
| orderService.listOrders/updateOrderStatus | Admin xem đơn và thực hiện chuyển trạng thái được phép |
| mediaService.uploadProductImage(file) | Nhận File; trả path và URL; FE giả lập preview, sau này dùng Storage |

Các thao tác không ghi “đã có” ở bảng trên đều chưa triển khai. API là hợp đồng nội bộ của FE, chưa phải endpoint REST hoặc schema DB. Bổ sung JSDoc/ví dụ thành công và lỗi cạnh service khi triển khai.

## 6. Hình dạng dữ liệu FE cần

Bảng dưới là mô hình mục tiêu, chưa phải cấu trúc đã triển khai đầy đủ. Catalog hiện dùng category, brand dạng chuỗi, specs dạng mảng chuỗi, image/images và variants lồng trong sản phẩm; mỗi variant có id, label, price, stock. Chưa có đầy đủ slug, SKU, options, trạng thái ẩn, ảnh riêng từng phiên bản hay thực thể Brand quản trị. Giữ tương thích UI khi bổ sung dữ liệu cho admin/đơn hàng; không coi kế hoạch này là schema DB đã chốt.

| Đối tượng | Trường chính |
|---|---|
| Product | id, slug, name, categoryId, brandId, description, images, specifications, status |
| ProductVariant | id, productId, sku, options, price, compareAtPrice tùy chọn, stock, image, active |
| Specification | key, label, value, unit tùy chọn; nhóm thông số theo danh mục |
| Category / Brand | id, name, slug, active |
| CartItem | variantId, quantity; thông tin hiển thị lấy từ catalog, giá có thể thay đổi |
| UserProfile | id, displayName, email, phone; role do nguồn xác thực/ủy quyền cung cấp |
| Order | id, code, items, shippingAddress, subtotal, shippingFee, total, currency, paymentMethod, paymentStatus, status, createdAt |
| OrderItem | variantId, sku, productName, variantLabel, unitPrice, quantity, image tại thời điểm mua |

ID là chuỗi ổn định; tiền VND là số nguyên, định dạng khi hiển thị; ngày trao đổi theo ISO. Mỗi sản phẩm có ít nhất một phiên bản bán được, kể cả sản phẩm chỉ có một cấu hình. Giá và tồn kho thuộc phiên bản. Giỏ gộp theo variantId; hai cấu hình khác nhau là hai dòng.

Thông số laptop gồm CPU/RAM/SSD/màn hình; điện thoại gồm chip/RAM/dung lượng/màn hình; linh kiện theo loại, ví dụ socket hoặc công suất. Không ép mọi danh mục dùng cùng một form thông số.

OrderItem và địa chỉ là bản chụp khi mua, không thay đổi khi admin sửa sản phẩm hoặc khách sửa hồ sơ. Trạng thái đơn đề xuất: pending → confirmed → shipping → delivered; cho hủy từ pending/confirmed. paymentStatus tách riêng khỏi status giao hàng.

## 7. Quy tắc giả lập và chuyển sang Supabase

Các mục sau là yêu cầu hoàn thiện. Hiện chỉ catalog đọc và giỏ khách hoạt động; chưa có auth/đơn/admin, hợp nhất giỏ hoặc giao dịch tồn kho. Giỏ giới hạn số lượng và bỏ dòng không hợp lệ khi đọc; /cart và Drawer thông báo nếu vượt tồn kho hoặc phiên bản không còn bán/hết hàng. Giá được lấy từ catalog hiện tại, chưa lưu giá lúc thêm giỏ để so sánh và chưa có báo giá/xác nhận lại trước đặt hàng. Ảnh/thông số còn minh họa, một số sản phẩm dùng ảnh “đang cập nhật”; album hiện dùng ảnh cấp sản phẩm.

- Có ít nhất 18 sản phẩm mẫu thuộc ba nhóm, đủ nhiều hãng, nhiều phiên bản, còn/hết hàng, tên dài và ảnh lỗi để kiểm tra.
- Kho mock dùng chung: admin sửa sản phẩm thì cửa hàng đọc được dữ liệu mới. Giỏ lưu localStorage; phần catalog/đơn demo có thể lưu cùng cơ chế với phiên bản dữ liệu và nút reset trong công cụ phát triển.
- Chỉ dùng tài khoản/demo fixture và thông tin giao hàng giả. Không lưu mật khẩu ở trình duyệt; mock auth không phải cơ chế bảo mật.
- Có kịch bản thử guest/customer/admin và phiên hết hạn. Route guard hỗ trợ trải nghiệm; quyền truy cập thật phải được backend/RLS thực thi sau này.
- Mock có cách bật chậm/lỗi/không có kết quả ở môi trường phát triển. Kết quả tìm kiếm cũ không được ghi đè truy vấn mới; cleanup theo vòng đời hook.
- Form ảnh có preview, trạng thái tải/lỗi và giới hạn loại/kích thước được cấu hình. Preview giả không được coi là đã upload lên server.
- Sau này giỏ khách được hợp nhất một lần sau đăng nhập; dòng trùng variantId cộng số lượng rồi đối chiếu tồn kho, báo người dùng nếu phải điều chỉnh. Đăng xuất xóa dữ liệu riêng của tài khoản khỏi state hiển thị.
- Giữ requestId cho cùng một lần đặt hàng và retry; FE khóa nút trong khi gửi. Backend sau này phải bảo đảm chống tạo đơn trùng, kiểm tra giá/tồn kho và tạo đơn/trừ kho trong giao dịch nguyên tử. Hủy đơn phải hoàn kho đúng một lần.
- Chỉ xóa giỏ khi tạo đơn thành công. Nếu giá đổi hoặc hết hàng, cập nhật báo giá và yêu cầu khách xem lại trước khi gửi.
- Khi tích hợp: cấu hình Supabase client tập trung, frontend dùng publishable key; secret/service-role chỉ phía server. Xây RLS theo chủ sở hữu/vai trò và quyền Storage cùng với schema ở giai đoạn 7.

## 8. Trạng thái giao diện bắt buộc

Mỗi màn hình lấy dữ liệu có đang tải, thành công, rỗng, lỗi và thử lại phù hợp. Phân biệt không có sản phẩm với bộ lọc không tìm thấy. Chi tiết có trạng thái không tồn tại; trang tài khoản có hết phiên; admin có không đủ quyền.

Form có label, kiểm tra trường, lỗi ngay cạnh trường, thông báo thành công và nút đang xử lý. Hỗ trợ bàn phím, focus rõ, modal đóng bằng Escape và trả focus về nút mở. Ảnh có alt phù hợp. Không dùng màu làm dấu hiệu duy nhất cho lỗi/trạng thái.

## 9. Nghiệm thu FE trước khi xây DB

Chưa nghiệm thu toàn bộ FE. PROGRESS.md lưu các lần lint/build, kiểm tra trình duyệt/responsive của từng đợt trước; không xem đó là kiểm chứng lại phiên bản hiện tại. Repository có tests/category-service.test.js (chạy bằng `node --test tests/category-service.test.js`) cho catalog; chưa có bộ test xuyên suốt mua hàng/admin. Lần cập nhật tài liệu 01/10/2026 chỉ đối chiếu mã nguồn, không chạy lại lint/build hoặc trình duyệt. Giữ các ô dưới đây chưa đánh dấu cho đến nghiệm thu đầy đủ.

Đợt xây /cart ngày 01/10/2026 có tests/cart-service.test.js (chạy cùng test catalog bằng `node --test tests/cart-service.test.js tests/category-service.test.js`) và tests/cart-browser.mjs theo cách chạy Playwright hiện có với CODEX_NODE_PACKAGES. Test trình duyệt bao phủ giỏ rỗng, đổi số lượng/tổng tiền, reload, đồng bộ Drawer/Header, liên kết từ sản phẩm tới /cart, lỗi lưu trữ, bàn phím và điều chỉnh tồn kho; kiểm tra không tràn ngang ở 360/640/641/768/833/834/1068/1440px. Đây là nghiệm thu riêng trang giỏ, chưa đánh dấu hoàn tất luồng checkout.

- [ ] Trang chủ → danh sách → chi tiết → chọn phiên bản → giỏ → đăng nhập → checkout COD → chi tiết đơn hoạt động bằng mock.
- [ ] Tìm kiếm/lọc/sắp xếp/Xem thêm đúng; Back/Forward và refresh giữ bộ lọc và mức hiển thị trong URL; truy cập thẳng route hợp lệ và 404 hoạt động.
- [ ] Hai phiên bản cùng sản phẩm có giá/tồn kho/giỏ riêng; sản phẩm hết hàng không thể thêm; số lượng phải là số nguyên dương.
- [ ] Giỏ rỗng, giá đổi, thiếu hàng, đặt hàng lỗi, gửi lặp và retry đều có hành vi rõ; lỗi không làm mất giỏ.
- [ ] Đăng nhập/đăng xuất/khôi phục/xác minh email mô phỏng có đủ trạng thái; dữ liệu đơn riêng không lẫn giữa tài khoản demo.
- [ ] Admin tạo/sửa/ẩn sản phẩm và phiên bản, sửa danh mục/hãng/tồn kho, xem và cập nhật đơn đúng luồng.
- [ ] Giao diện được xem ở 360px, 768px và 1440px; không tràn trang; menu/bộ lọc/modal/form dùng bằng bàn phím.
- [ ] Service contract có tài liệu, đủ ví dụ thành công/lỗi và không phụ thuộc mock trong component.
- [ ] Chạy lint và build; kiểm tra trình duyệt không có lỗi console liên quan. Test tự động tập trung vào gộp giỏ theo phiên bản, tính tiền và chuyển trạng thái đơn; kiểm thử luồng mua hàng và admin quan trọng.
- [ ] Ghi nhận rõ các phần vẫn là mô phỏng để xác định yêu cầu DB/backend. Môi trường hosting tương lai cần fallback về index.html cho route SPA.

Sau nghiệm thu, dùng các hợp đồng và luồng đã ổn để thiết kế DB. Bắt đầu tích hợp catalog chỉ đọc, tiếp theo Auth/RLS, giỏ và đơn hàng, cuối cùng Storage/admin; kiểm tra quyền và giao dịch thật trước khi coi website hoàn tất.

## 10. Tài liệu tham khảo

- [React Router — Declarative installation](https://reactrouter.com/start/declarative/installation): hướng dẫn router cho ứng dụng React/Vite.
- [Supabase — React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs): cách kết nối React với Supabase và cấu hình publishable key khi tới giai đoạn tích hợp.
