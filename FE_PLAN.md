# Kế hoạch frontend — cửa hàng điện tử

Ngày lập: 08/09/2026. Trạng thái: kế hoạch đề xuất, chưa triển khai.

## 1. Mục tiêu và trình tự

Xây dựng website bán laptop, linh kiện PC và điện thoại để học ReactJS và Supabase. Hoàn thành FE bằng dữ liệu giả lập trước, sau đó thiết kế DB và tích hợp backend thật.

FE phải chạy được luồng xem hàng → chọn phiên bản → giỏ hàng → đăng nhập → đặt hàng COD → xem đơn → quản trị xử lý đơn. Giai đoạn FE mô phỏng tài khoản, tồn kho và đơn hàng; chỉ được coi là giao dịch thật sau khi hoàn tất backend.

Hiện trạng đã kiểm tra: React + Vite, JavaScript và CSS; App.jsx đang là màn hình mẫu, Home/Header/Footer là khung. Chưa có router hoặc thư viện Supabase trong package.json. Phát triển tiếp các component hiện có theo AGENTS.md.

## 2. Phạm vi bản đầu

- Khách hàng: trang chủ, danh sách và chi tiết sản phẩm, giỏ hàng, đăng ký/đăng nhập/khôi phục mật khẩu, đặt hàng COD, hồ sơ và lịch sử đơn hàng.
- Quản trị: tổng quan, sản phẩm và phiên bản, danh mục/hãng, tồn kho và đơn hàng.
- Cho phép xem hàng và tạo giỏ khi chưa đăng nhập; yêu cầu đăng nhập để đặt hàng. Sau đăng nhập quay lại bước đặt hàng và giữ giỏ.
- Một cửa hàng, giao diện tiếng Việt, tiền VND, một địa chỉ nhập trong mỗi lần đặt hàng. Phí vận chuyển giả lập có cấu hình và hiển thị rõ.
- Để giai đoạn mở rộng: thanh toán trực tuyến, mã giảm giá, đánh giá, yêu thích, so sánh và lắp cấu hình PC.
- Tên thương hiệu và màu nhấn là lựa chọn tạm có thể đổi; đề xuất nền trắng/xám nhạt, màu nhấn xanh dương, ưu tiên ảnh và thông số dễ đọc.

## 3. Các giai đoạn và đầu ra

| Giai đoạn | Công việc | Điều kiện hoàn thành |
|---|---|---|
| 1. Thiết kế luồng và dữ liệu | Sơ đồ trang; phác thảo desktop/mobile cho danh sách, chi tiết, checkout và admin; định nghĩa dữ liệu đầu vào/đầu ra của service | Mỗi thao tác chính có trang đích, trạng thái và dữ liệu cần thiết |
| 2. Nền tảng giao diện | Router, MainLayout, AdminLayout, Header/Footer, màu/chữ/khoảng cách, button/input/modal, trang 404 | Điều hướng chạy; bố cục dùng được trên điện thoại và máy tính |
| 3. Danh mục và sản phẩm | Service giả lập bất đồng bộ, trang chủ, tìm kiếm/lọc/sắp xếp/phân trang, chi tiết và chọn phiên bản | URL giữ bộ lọc; phiên bản đổi đúng ảnh/giá/tồn kho; có loading/empty/error |
| 4. Tài khoản và mua hàng | Phiên người dùng giả lập, giỏ hàng, form giao hàng, COD, kết quả đặt hàng, hồ sơ và đơn của tôi | Chạy xuyên suốt luồng mua; giữ giỏ khi tải lại; có lỗi giá/tồn kho và chống nhấn gửi lặp |
| 5. Quản trị | Tổng quan từ dữ liệu giả lập, quản lý sản phẩm/phiên bản/danh mục/hãng, xem và xử lý đơn | Thao tác cập nhật thể hiện lại ở cửa hàng; tài khoản thường không vào giao diện admin |
| 6. Nghiệm thu FE | Kiểm tra responsive, bàn phím, trạng thái bất đồng bộ, dữ liệu lỗi, tài liệu service | Hoàn thành danh sách nghiệm thu ở mục 9; chốt dữ liệu FE cần trước khi xây DB |
| 7. DB và tích hợp | Thiết kế schema, migration, Auth, RLS, Storage; thay service giả lập bằng Supabase | Luồng thật được kiểm tra với nhiều tài khoản, kiểm soát giá/tồn kho và quyền ở backend |

Mỗi giai đoạn học theo nhịp: giải thích luồng → xây một phần nhỏ → chạy thử → giải thích component/state/service liên quan. Giai đoạn 7 chỉ bắt đầu sau khi FE được nghiệm thu.

## 4. Sơ đồ trang dự kiến

| Đường dẫn | Nội dung |
|---|---|
| / | Banner, danh mục, sản phẩm nổi bật |
| /products | Tìm kiếm, lọc danh mục/hãng/giá/tồn kho, sắp xếp, phân trang |
| /products/:slug | Album ảnh, phiên bản, giá, thông số, tồn kho, thêm giỏ |
| /cart | Đổi số lượng, xóa, tạm tính |
| /checkout | Địa chỉ, phí vận chuyển, COD, xác nhận |
| /login, /register | Đăng nhập và đăng ký |
| /forgot-password, /reset-password | Form khôi phục và trạng thái liên kết không hợp lệ; mô phỏng ở FE |
| /account | Hồ sơ cá nhân |
| /account/orders | Lịch sử mua hàng |
| /account/orders/:id | Chi tiết đơn và kết quả đặt hàng thành công |
| /admin | Tổng quan |
| /admin/products | Danh sách và tồn kho theo phiên bản |
| /admin/products/new, /admin/products/:id/edit | Form sản phẩm, ảnh và phiên bản |
| /admin/categories, /admin/brands | Danh mục và hãng |
| /admin/orders, /admin/orders/:id | Danh sách, chi tiết và cập nhật trạng thái đơn |
| URL không tồn tại | Trang 404 |

Danh sách sản phẩm giữ từ khóa, bộ lọc, sort và page trong query string để tải lại/chia sẻ/quay lui vẫn đúng. Đổi bộ lọc đưa về trang 1. Chi tiết giữ lựa chọn phiên bản bằng query string khi phù hợp.

Desktop: bộ lọc bên trái, lưới hàng bên phải; chi tiết chia album và thông tin mua. Mobile: bộ lọc trong bảng mở, các khối xếp dọc, thao tác mua dễ chạm. Checkout hiển thị form và tóm tắt đơn; admin có bảng hoặc thẻ phù hợp màn hình hẹp.

## 5. Tổ chức FE và điểm thay API

Giữ React + Vite + JavaScript và CSS hiện tại. Đề xuất thêm React Router cho điều hướng. Chỉ thêm thư viện khác khi tính năng cần, kiểm tra tương thích và lưu lockfile khi cài.

Luồng dữ liệu: page/component → hook khi cần → service → dữ liệu giả lập; sau này service → Supabase. Component không import dữ liệu mẫu hoặc Supabase client trực tiếp.

- pages/: trang theo URL; có thể nhóm admin trong pages/admin/ khi triển khai.
- components/: tái sử dụng Header/Footer hiện có; thêm ProductCard, ProductFilters, VariantSelector, QuantityInput, OrderSummary khi cần. CSS component nằm cạnh JSX.
- layouts/: MainLayout và AdminLayout.
- services/: productService, catalogService, authService, cartService, orderService, mediaService; client Supabase bổ sung ở giai đoạn 7.
- services/mock/: dữ liệu mẫu và kho dữ liệu giả lập dùng chung cho cửa hàng/admin, chỉ tạo khi bắt đầu giai đoạn 3.
- hooks/: logic React dùng lại, gồm giỏ và phiên tài khoản nếu cần; Context chỉ cho dữ liệu thực sự chia sẻ, provider có thể đặt cùng hook tương ứng.
- utils/: định dạng tiền/ngày, kiểm tra form và các hàm thuần.
- assets/: ảnh và CSS chung; token màu/chữ/khoảng cách dùng CSS variables.

State cục bộ cho form/modal; URL cho bộ lọc; Context cho giỏ và tài khoản. Dữ liệu dẫn xuất như số món không tạo state trùng. Không dựng thư viện quản lý state hoặc bộ adapter tổng quát từ đầu.

Service giả lập trả Promise để mô phỏng độ trễ/lỗi. Quy ước: thành công trả dữ liệu; thất bại throw lỗi có code, message và fieldErrors khi cần. Kết quả danh sách có items, total, page, pageSize. Mã lỗi dự kiến: VALIDATION_ERROR, NOT_FOUND, UNAUTHENTICATED, FORBIDDEN, OUT_OF_STOCK, PRICE_CHANGED, NETWORK_ERROR. Khi thay Supabase, service ánh xạ dữ liệu/lỗi về quy ước này; không trả cấu trúc SDK trực tiếp ra UI.

| Service dự kiến | Trách nhiệm/đầu vào và đầu ra |
|---|---|
| productService.listProducts(filters) | Nhận q, categoryId, brandId, minPrice, maxPrice, inStock, sort, page, pageSize; trả danh sách phân trang |
| productService.getProduct(slug) | Trả sản phẩm, ảnh và các phiên bản; lỗi NOT_FOUND nếu không tồn tại |
| productService.saveProduct(input) | Tạo/sửa sản phẩm và phiên bản; trả bản đã lưu; dùng cho admin |
| productService.archiveProduct(id), updateVariantStock(id, quantity) | Ẩn sản phẩm và điều chỉnh tồn kho; giữ dữ liệu đã gắn với đơn cũ |
| catalogService | Đọc/tạo/sửa/ẩn danh mục và hãng; có lỗi khi thao tác xung đột với dữ liệu đang dùng |
| authService | getSession, signIn, signUp, signOut, subscribeAuthChanges, requestPasswordReset, resetPassword, updateProfile; theo dõi cả trạng thái chờ xác minh email |
| cartService | getCart, addItem, updateQuantity, removeItem, mergeGuestCart; trả giỏ mới sau mỗi thay đổi |
| orderService.quoteOrder(input) | Nhận variantId, quantity, địa chỉ và COD; trả giá/phí/tổng mới nhất và vấn đề từng dòng |
| orderService.createOrder(input) | Nhận danh sách variantId/quantity, địa chỉ, COD và requestId; trả đơn hoặc lỗi giá/tồn kho; không tin tổng tiền do FE gửi |
| orderService.listMyOrders/getMyOrder | Đơn thuộc người dùng hiện tại; không lấy userId tùy ý từ form |
| orderService.listOrders/updateOrderStatus | Admin xem đơn và thực hiện chuyển trạng thái được phép |
| mediaService.uploadProductImage(file) | Nhận File; trả path và URL; FE giả lập preview, sau này dùng Storage |

API trên là hợp đồng nội bộ của FE, chưa phải endpoint REST hoặc schema DB. Chi tiết tham số sẽ được ghi bằng JSDoc cạnh service khi triển khai.

## 6. Hình dạng dữ liệu FE cần

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

- [ ] Trang chủ → danh sách → chi tiết → chọn phiên bản → giỏ → đăng nhập → checkout COD → chi tiết đơn hoạt động bằng mock.
- [ ] Tìm kiếm/lọc/sắp xếp/phân trang đúng; Back/Forward và refresh giữ trạng thái URL; truy cập thẳng route hợp lệ hoạt động.
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
