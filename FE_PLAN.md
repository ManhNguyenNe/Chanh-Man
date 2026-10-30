# Kế hoạch frontend — cửa hàng điện tử

Ngày lập: 08/09/2026. Cập nhật: **14/10/2026** (Asia/Saigon).

Trạng thái: **đã có checkout COD, đơn của tài khoản và hai trang khôi phục/đặt mật khẩu mới giả lập; còn thiếu quản trị và tích hợp thật**. Hiện trạng dưới đây được đối chiếu với mã nguồn và [PROGRESS.md](./PROGRESS.md). Kiểm tra từng phần được ghi ở mục 9; chưa nghiệm thu toàn bộ FE.

## 1. Mục tiêu và trình tự

Xây dựng website bán laptop, linh kiện PC và điện thoại để học ReactJS và Supabase. Theo yêu cầu ngày 01/10/2026, xây FE và tích hợp Supabase song song theo từng luồng. Kế hoạch database, quyền và thứ tự tích hợp nằm trong [BE_PLAN.md](./BE_PLAN.md); mock tiếp tục phục vụ các phần chưa nối và kiểm tra.

FE phải chạy được luồng xem hàng → chọn phiên bản → giỏ hàng → đăng nhập → đặt hàng COD → xem đơn → quản trị xử lý đơn. Giai đoạn FE mô phỏng tài khoản, tồn kho và đơn hàng; chỉ được coi là giao dịch thật sau khi hoàn tất backend.

Hiện tại dùng React + Vite, JavaScript, CSS và Ant Design; đã có theme/locale tiếng Việt, Header/Footer và ShopLayout dùng chung. App.jsx chọn trang theo window.location.pathname; chưa cài React Router hoặc thư viện Supabase. URL không nhận diện hiện rơi về Home, chưa có 404. /account, /checkout, /account/orders và /account/orders/:id yêu cầu phiên hợp lệ; danh sách/chi tiết chỉ đọc đơn thuộc tài khoản hiện tại, kể cả fixture admin. Admin chưa triển khai.

Luồng đã có: trang chủ/danh mục → chi tiết hoặc xem nhanh → chọn phiên bản → giỏ Drawer → /cart → đăng nhập → /checkout → /account/orders/:id. Trang giỏ dùng chung state với Header/Drawer, có thành tiền từng dòng, tạm tính, loading/empty/error và thông báo điều chỉnh theo tồn kho. Nút Đặt mua ở sản phẩm vẫn mở hộp kiểm tra lựa chọn rồi thêm giỏ; Tiếp tục đặt hàng ở /cart đã nối checkout. Login/register dùng tài khoản giả lập; sau đăng nhập giữ giỏ và quay lại URL hợp lệ, gồm checkout/chi tiết đơn, mặc định /cart. Header/Footer/menu mobile đưa tới hồ sơ /account khi có phiên; hồ sơ sửa họ tên/số điện thoại, email chỉ đọc, lưu và đăng xuất.

Checkout nhập địa chỉ, phí giao hàng dùng thử 30.000₫, COD và bước kiểm tra trước khi xác nhận. Service tính lại giá/tồn kho, lưu đơn/snapshot vào localStorage, chống đơn trùng khi retry; đơn thành công cập nhật tồn kho catalog và chỉ dọn giỏ nếu lựa chọn vẫn khớp. /account/orders nối từ hồ sơ/chi tiết, hiển thị đơn mới nhất trước, mã/ngày/trạng thái/tổng và tóm tắt snapshot sản phẩm; có làm mới, rỗng, lỗi/thử lại và quay lại sau đăng nhập. Chưa có xử lý đơn; đây chưa phải giao dịch thật.

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
| 6. Nghiệm thu FE | Kiểm tra responsive, bàn phím, trạng thái bất đồng bộ, dữ liệu lỗi, tài liệu service | Hoàn thành danh sách nghiệm thu ở mục 9; chốt hợp đồng dữ liệu và nghiệm thu từng luồng cùng BE |
| 7. DB và tích hợp | Thiết kế schema, migration, Auth, RLS, Storage; thay service giả lập bằng Supabase | Luồng thật được kiểm tra với nhiều tài khoản, kiểm soát giá/tồn kho và quyền ở backend |

Mỗi giai đoạn học theo nhịp: giải thích luồng → xây một phần nhỏ → chạy thử → giải thích component/state/service liên quan. Giai đoạn 7 bắt đầu song song với các phần FE đã ổn định; nghiệm thu từng luồng trước khi coi chức năng đó hoàn tất.

### Hiện trạng theo giai đoạn

| Giai đoạn | Đã có | Còn thiếu |
|---|---|---|
| 1. Luồng và dữ liệu | Kế hoạch tổng thể; hợp đồng catalog/giỏ/auth/hồ sơ, recovery mock và báo giá/tạo/danh sách/chi tiết đơn COD giả lập | Chốt xử lý đơn/admin và recovery thật |
| 2. Nền tảng | ShopLayout, Header/Footer, Ant Design, theme/locale; kiểm tra phiên tại /account, /checkout và chi tiết đơn | Router, 404, guard admin và AdminLayout |
| 3. Danh mục và sản phẩm | Home, Category, Product; tìm kiếm/lọc/sort/Xem thêm; chọn phiên bản, loading/empty/error theo màn hình | Lưu lựa chọn phiên bản trong URL, ảnh theo phiên bản, hoàn thiện ảnh/thông số và nghiệm thu trạng thái lỗi |
| 4. Tài khoản và mua hàng | Giỏ Drawer và /cart; login/register, xác minh email giả lập, phiên 1 giờ, đăng xuất/hồ sơ và forgot/reset-password dùng thử. Checkout COD có địa chỉ, phí, báo giá, xác nhận lại giá/tồn kho, retry chống trùng; danh sách/chi tiết đơn riêng theo tài khoản, snapshot và tồn kho lưu trên trình duyệt. Giữ giỏ, quay lại checkout/danh sách/chi tiết sau đăng nhập | Khôi phục mật khẩu thật, xử lý đơn, giỏ theo tài khoản và hợp nhất giỏ khách; quyền/giao dịch thật qua BE-4 |
| 5. Quản trị | Chưa triển khai | Toàn bộ trang admin, quyền truy cập và kho mock có thể cập nhật dùng chung |
| 6. Nghiệm thu | Test service catalog/giỏ/auth/hồ sơ/đơn; trình duyệt giỏ/auth/hồ sơ/checkout/danh sách/chi tiết, lỗi giá/tồn kho/lưu trữ/hết phiên và hai tab cạnh tranh tồn kho | Nghiệm thu toàn bộ mua hàng/admin và checklist mục 9; kiểm tra quyền/giao dịch thật khi nối BE |
| 7. Backend | Đã có kế hoạch BE_PLAN.md; chưa triển khai Supabase | Tích hợp catalog, Auth/hồ sơ, giỏ, đơn và admin theo từng đợt song song FE |

### Thứ tự làm tiếp

1. Hoàn thiện điều hướng và 404, giữ các URL catalog/chi tiết đang có.
2. Giỏ, login/register, hồ sơ, checkout/đơn và forgot/reset-password giả lập đã có; tiếp tục tích hợp Auth/hồ sơ/recovery thật.
3. Hoàn thiện khôi phục mật khẩu thật, giỏ theo tài khoản và hợp nhất giỏ khách; tích hợp checkout/đơn nguyên tử theo BE-4 sau Auth/giỏ.
4. Xây admin xử lý đơn, sản phẩm/phiên bản/tồn kho, danh mục/hãng và tổng quan; thay catalog tĩnh bằng kho mock dùng chung có thể cập nhật.
5. Hoàn thiện dữ liệu, trạng thái lỗi và nghiệm thu từng luồng; song song triển khai BE theo [BE_PLAN.md](./BE_PLAN.md), bắt đầu catalog và Auth/hồ sơ.

## 4. Sơ đồ trang và trạng thái triển khai

| Đường dẫn | Nội dung | Hiện trạng |
|---|---|---|
| / | Trang chủ, danh mục, sản phẩm, tìm kiếm và hỗ trợ | Đã có |
| /san-pham | Tất cả sản phẩm; lọc hãng/màu/giá/khuyến mại/tồn kho, sort, Xem thêm | Đã có |
| /laptop, /dien-thoai, /linh-kien-pc | Danh sách theo danh mục, dùng chung Category | Đã có |
| /san-pham/:id | Album/phóng to ảnh, phiên bản, giá, thông số, tồn kho, thêm giỏ | Đã có; dùng ID, không phải slug riêng |
| /cart | Đổi số lượng, xóa, thành tiền, tạm tính và cảnh báo tồn kho | Đã có /cart và /cart/; Drawer có liên kết Xem giỏ hàng; Tiếp tục đặt hàng nối /checkout |
| /checkout | Địa chỉ, phí vận chuyển, COD, xác nhận | Đã có /checkout và /checkout/; yêu cầu đăng nhập, form Ant Design, báo giá 30.000₫ phí dùng thử, kiểm tra rồi xác nhận, loading/rỗng/lỗi/retry, xử lý giá/tồn kho đổi và hết phiên |
| /login, /register | Đăng nhập, đăng ký và trạng thái chờ xác minh giả lập | Đã có, kể cả URL có dấu / cuối; validation, email trùng, chờ/xác minh bằng nút mô phỏng, loading/lỗi/retry và trạng thái đã đăng nhập. Chưa gửi email thật |
| /forgot-password | Yêu cầu khôi phục mật khẩu | Đã có, kể cả dấu / cuối; nối từ Quên mật khẩu trên login, form email/validation, loading/chống gửi lặp, kết quả chung cho email có/không có tài khoản, lỗi giữ email/thử lại, quay về login với next an toàn. Không gửi email thật hoặc đổi mật khẩu |
| /reset-password | Đặt mật khẩu mới, liên kết không hợp lệ/hết hạn | Đã có, kể cả dấu / cuối; vé dùng thử 10 phút/một lần/cùng tab, thiếu/sai/hết hạn/đã dùng bị chặn. Form mật khẩu mới/nhập lại 8–128 ký tự, hiện/ẩn, loading/chống gửi lặp, lỗi giữ form/thử lại và kết quả mô phỏng. Nối bằng Mô phỏng mở liên kết khôi phục sau khi gửi yêu cầu; không thay mật khẩu thật |
| /account | Hồ sơ cá nhân | Đã có /account và /account/; sửa họ tên/số điện thoại, email chỉ đọc, lưu vào phiên dùng thử, đăng xuất. Có loading/lỗi/retry và thông báo chưa đăng nhập/hết phiên |
| /account/orders | Lịch sử mua hàng | Đã có, kể cả dấu / cuối; yêu cầu phiên, chỉ lấy đơn của mình, mới nhất trước, mã/ngày/trạng thái/sản phẩm/tổng, làm mới/rỗng/loading/lỗi/thử lại. Có Đơn hàng cạnh tài khoản trên header desktop, Đơn hàng của tôi trong menu mobile/nút tại hồ sơ và liên kết tới chi tiết; khách chọn lối vào header/menu được đưa tới login rồi quay lại danh sách |
| /account/orders/:id | Chi tiết đơn và kết quả đặt hàng thành công | Đã có, kể cả dấu / cuối; yêu cầu phiên, chỉ đọc đơn của mình, snapshot hàng/địa chỉ/tổng, nhãn trạng thái đơn/thanh toán theo dữ liệu, loading/lỗi/retry và không tìm thấy; có liên kết về danh sách. Không có trang thành công riêng |
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

- pages/: đã có Home, Category, Product, Cart, Auth dùng chung cho /login, /register, Profile tại /account, Checkout, Order, Orders, ForgotPassword và ResetPassword; bổ sung nhóm admin khi triển khai.
- components/: đã có Header/Footer, HomeSections, ProductCard, ProductShowcase, ProductDialog, ProductDetails, CatalogFilters và CartDrawer. CartItems dùng chung Drawer và /cart; OrderSummary dùng chung checkout/chi tiết đơn. CartPage.css nằm trong components/cart, Auth.css trong components/auth, Checkout.css trong components/checkout; checkout/đơn tái sử dụng tiêu đề/card của giỏ, không có eyebrow. Giữ CSS theo nhóm chức năng hiện có.
- layouts/: đã có ShopLayout; tiếp tục dùng cho cửa hàng, bổ sung AdminLayout khi làm admin, không tạo MainLayout trùng chức năng.
- services/: đã có productService, cartService, authService và orderService giả lập (quote/create/getMyOrder/listMyOrders); còn thiếu catalogService quản trị, danh sách/xử lý đơn admin, mediaService và thao tác ghi sản phẩm. Client Supabase bổ sung khi bắt đầu BE-1 theo BE_PLAN.md.
- services/mock/: catalog.js chứa dữ liệu tĩnh; orders.js đọc/ghi đơn dùng thử trong localStorage. Catalog trừ lượng đã đặt từ đơn để tồn kho dùng chung giữa catalog/chi tiết/giỏ/checkout. Chưa có thao tác quản trị kho/catalog.
- hooks/: đã có useCart và useAuth; ShopLayout cung cấp state cho page/Header/Drawer bằng render props. Context chỉ bổ sung khi thực sự cần.
- utils/: định dạng tiền/ngày, các hàm thuần; authRoutes kiểm tra URL quay lại sau đăng nhập, chỉ nhận route cửa hàng đang có và cùng nguồn.
- assets/: ảnh và CSS chung; token màu/chữ/khoảng cách dùng CSS variables.

Hiện dùng Ant Design Form cho giá trị/validation, state cục bộ cho modal/kết quả, URL cho bộ lọc, useCart và localStorage cho giỏ; useAuth đọc và theo dõi phiên giả lập trong sessionStorage. Chưa có Context tài khoản/giỏ. Khi nối nhiều trang, chỉ thêm Context nếu thực sự cần chia sẻ state. Dữ liệu dẫn xuất như số món không tạo state trùng. Không dựng thư viện quản lý state hoặc bộ adapter tổng quát từ đầu.

Service catalog hiện trả Promise với độ trễ giả lập, hỗ trợ hủy truy vấn danh sách/bộ lọc; chưa có công cụ bật lỗi mạng. listProducts trả items, total, page, chưa trả pageSize. getProduct có lỗi NOT_FOUND; lỗi giỏ chưa thống nhất code/fieldErrors. Auth trả Promise, lỗi có code/message/fieldErrors; subscribeAuthChanges báo thay đổi/hết phiên và lỗi đọc lưu trữ cho useAuth. Order có VALIDATION_ERROR/fieldErrors, UNAUTHENTICATED, NOT_FOUND, OUT_OF_STOCK, PRICE_CHANGED kèm quote mới, REQUEST_CONFLICT, STORAGE_ERROR và DATA_ERROR; không ghi đè kho đơn bị hỏng bằng dữ liệu rỗng.

Quy ước cần hoàn thiện: thành công trả dữ liệu; thất bại throw lỗi có code, message và fieldErrors khi cần. Mã lỗi dự kiến: VALIDATION_ERROR, NOT_FOUND, UNAUTHENTICATED, FORBIDDEN, OUT_OF_STOCK, PRICE_CHANGED, NETWORK_ERROR. Khi thay Supabase, service ánh xạ dữ liệu/lỗi về hợp đồng FE; không trả cấu trúc SDK trực tiếp ra UI. Nếu bổ sung pageSize hoặc đổi tham số, cập nhật các caller và test cùng đợt.

| Service hiện có / cần bổ sung | Trách nhiệm/đầu vào và đầu ra |
|---|---|
| productService.listProducts(filters) — đã có | Nhận category, q, need, limit, page, brands, colors, priceRange, promotion, inStock, sort, signal; trả items, total, page |
| productService.getProduct(id) — đã có | Tra ID sản phẩm, trả sản phẩm và các phiên bản; lỗi NOT_FOUND nếu không tồn tại |
| productService.getHomeContent/getCategoryFilters/findVariant — đã có | Nội dung trang chủ, lựa chọn bộ lọc theo danh mục và tra phiên bản cho giỏ |
| productService.saveProduct(input) | Tạo/sửa sản phẩm và phiên bản; trả bản đã lưu; dùng cho admin |
| productService.archiveProduct(id), updateVariantStock(id, quantity) | Ẩn sản phẩm và điều chỉnh tồn kho; giữ dữ liệu đã gắn với đơn cũ |
| catalogService | Đọc/tạo/sửa/ẩn danh mục và hãng; có lỗi khi thao tác xung đột với dữ liệu đang dùng |
| authService — đã có một phần | getSession, signIn, signUp, signOut, subscribeAuthChanges, verifyDemoEmail và updateProfile. signUp cần xác minh mô phỏng trước signIn; getSession trả user có phone hoặc null; updateProfile chỉ sửa displayName/phone của phiên hiện tại. requestPasswordReset({email}) trim/chuyển thường/kiểm tra email, lookup giả lập với phản hồi {mock:true,message} chung, không ghi yêu cầu/email/token. createDemoRecovery() được gọi riêng bằng nút mô phỏng, tạo vé {token,expiresAt} cùng tab; getPasswordResetState(token) kiểm tra, resetPassword({token,password,confirmPassword}) kiểm tra form và đánh dấu đã dùng rồi trả {mock:true}. Lỗi VALIDATION_ERROR/fieldErrors, STORAGE_ERROR, INVALID_RECOVERY_LINK, RECOVERY_LINK_EXPIRED, RECOVERY_LINK_USED. Không lưu mật khẩu/hash hoặc đổi phiên/hồ sơ/credential thật |
| cartService — đã có một phần | getCart, addItem, updateQuantity, removeItem; trả items (có productId), count, total và notices khi điều chỉnh tồn kho. clearPurchasedCart(items) dọn giỏ chỉ khi lựa chọn hiện tại khớp đơn thành công; khác thì giữ và trả false, lỗi lưu thì throw. Chưa có mergeGuestCart hoặc giỏ theo tài khoản |
| orderService.quoteOrder(input) — đã có | Nhận items[{variantId,quantity}], paymentMethod:'cod', shippingAddress tùy chọn để xem trước; trả items/snapshot, subtotal, shippingFee, total, currency, shippingAddress, issues và fingerprint. Không giữ chỗ tồn kho |
| orderService.createOrder(input) — đã có | Nhận items, shippingAddress, paymentMethod:'cod', requestId UUID và quoteFingerprint; tự lấy tài khoản từ phiên, tính lại giá/tồn kho, trả đơn/snapshot. Retry cùng requestId/nội dung trả đơn gốc; nội dung khác báo REQUEST_CONFLICT. Bỏ qua tổng tiền/userId/status do FE gửi |
| orderService.getMyOrder(id) — đã có | Trả snapshot của đơn thuộc phiên hiện tại; không có phiên báo UNAUTHENTICATED, đơn không tồn tại/khác chủ báo NOT_FOUND |
| orderService.listMyOrders() — đã có | Trả Promise mảng snapshot đơn của phiên hiện tại, mới nhất trước theo createdAt rồi id giảm dần khi trùng ngày; không nhận userId từ caller. Guest/hết phiên báo UNAUTHENTICATED, kho đơn hỏng/không đọc được báo STORAGE_ERROR. Trả bản sao độc lập, không ghi lại dữ liệu |
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

Hiện catalog, giỏ khách, auth/hồ sơ và checkout/danh sách/chi tiết đơn giả lập hoạt động. Chưa có admin, giỏ theo tài khoản, hợp nhất giỏ hoặc giao dịch DB thật. Giỏ giới hạn số lượng và bỏ dòng không hợp lệ khi đọc; /cart và Drawer thông báo điều chỉnh tồn kho. Giá lấy từ catalog hiện tại, chưa lưu giá lúc thêm giỏ để so sánh; checkout đã có báo giá và xác nhận lại giá/tồn kho trước tạo đơn. Ảnh/thông số còn minh họa, một số sản phẩm dùng ảnh “đang cập nhật”; album dùng ảnh cấp sản phẩm.

Auth hiện có fixture customer/admin với mật khẩu dùng thử chung hiển thị trên form, không lưu mật khẩu/hash trong trình duyệt. Đăng ký lưu email, displayName, phone (mặc định rỗng) và verified trong sessionStorage; luôn là customer. /account lưu họ tên đã trim (2–80 ký tự), số điện thoại tùy chọn (8–15 chữ số, có thể bắt đầu bằng +), hỗ trợ cả fixture và tài khoản mới. Chỉ cập nhật hồ sơ của phiên hiện tại, không đổi email/id/role hoặc gia hạn phiên; lỗi ghi không thay đổi hồ sơ đã lưu. Dữ liệu cũ chưa có phone vẫn đọc được. Phiên lưu email/expiresAt, hết hạn sau 1 giờ và được theo dõi khi tab đang mở hoặc nhận focus. Đóng tab kết thúc lưu trữ tài khoản mới/thay đổi hồ sơ; giỏ và đơn localStorage vẫn giữ. Khi đăng nhập bằng email chưa xác minh, trang mở lại bước mô phỏng xác minh. Không gửi email hoặc đổi mật khẩu thật; quyền chưa được backend thực thi. next nhận URL cửa hàng cùng nguồn đang có, gồm /account, /checkout, /account/orders và /account/orders/:id; từ chối URL ngoài nguồn/admin hoặc route không hợp lệ.

Checkout dùng Ant Design Form cho tên người nhận (2–80), điện thoại bắt buộc (8–15 chữ số, có thể bắt đầu bằng +), địa chỉ cụ thể (5–240), phường/xã và tỉnh/thành phố (2–80), ghi chú tùy chọn tối đa 500 ký tự. Phí giao hàng mock cấu hình bằng hằng shippingFee = 30.000₫; tổng VND luôn do service tính. Tối đa 100 dòng đầu vào, số lượng nguyên 1–999, gộp phiên bản trùng. Sửa form phải kiểm tra lại; quote không giữ chỗ, create kiểm tra lại catalog. Giá đổi trả quote mới để xác nhận lại; thiếu hàng yêu cầu chỉnh giỏ.

Đơn ở chanh-man:orders:v1 lưu snapshot hàng/địa chỉ/giá/phí, mã đơn, chủ sở hữu từ phiên và trạng thái pending/unpaid. Tồn kho bằng số mẫu trừ lượng trong các đơn đã ghi; một lần ghi localStorage vừa tạo đơn vừa cập nhật nguồn tồn kho dẫn xuất. Web Locks tuần tự hóa tạo đơn giữa các tab hỗ trợ API này; fallback chỉ bảo đảm trong cùng ngữ cảnh JavaScript. Đây là giới hạn mock, thay bằng giao dịch DB nguyên tử ở BE-4. Dữ liệu trình duyệt có thể sửa/xóa, không có bảo mật/giao hàng thật.

Một lần gửi giữ requestId UUID qua retry và lưu ở /checkout?order=:id trước tạo đơn; truy cập lại đọc đơn đã tạo rồi chuyển tới chi tiết, không tự tạo lại hoặc dọn giỏ lần hai. Lỗi tạo đơn giữ form/giỏ. Sau thành công chỉ dọn khi variantId/số lượng hiện tại khớp lựa chọn đã mua; nếu giỏ đã đổi hoặc ghi dọn thất bại, giữ giỏ và trang kết quả giải thích. Chi tiết có breadcrumb và liên kết về /account/orders.

Danh sách tải toàn bộ lịch sử mock nhỏ, sắp xếp tại service và có nút Làm mới. Mỗi card dùng snapshot sản phẩm đầu tiên, số phiên bản còn lại, tổng số sản phẩm và tổng tiền tại lúc mua; không đọc lại catalog để đổi đơn cũ. Nhãn pending/confirmed/shipping/delivered/cancelled và unpaid/paid dùng chung với chi tiết, không có thao tác chuyển trạng thái ở tài khoản. Chưa có tìm kiếm/lọc/phân trang hoặc tự cập nhật giữa các tab; bổ sung phân trang tại service khi dữ liệu thật tăng, vẫn lọc theo phiên và thực thi quyền backend.

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

ForgotPassword và ResetPassword dùng Auth.css/ShopLayout hiện có, cho guest hoặc người đang đăng nhập. Sau yêu cầu chung, nút Mô phỏng mở liên kết khôi phục mới tạo vé độc lập với email/tài khoản; không làm lộ email có tồn tại hay không. Vé ở chanh-man:auth-recovery:v1 trong sessionStorage chứa UUID, expiresAt, used; hết hạn sau 10 phút, dùng một lần, tạo vé mới vô hiệu vé cũ. Token truyền qua fragment #token= để không nằm trong query; chỉ mô phỏng UI, không cấp phiên đăng nhập hay quyền đổi credential thật. Form reset kiểm tra lại vé ngay trước tiêu thụ; ghi lỗi giữ vé chưa dùng để retry, dùng thành công xóa giá trị form. Không lưu mật khẩu/hash và demoPassword không đổi.

Thiếu/sai/hết hạn/đã dùng hiện thông báo và lối gửi yêu cầu mới; form đang mở cũng chuyển sang hết hạn theo timer. Lỗi đọc có Thử lại, lỗi ghi giữ nội dung form. Login → forgot → reset → login đều giữ next qua authReturnPath; URL ngoài nguồn bị đưa về /cart. Hồ sơ không có liên kết khôi phục theo yêu cầu gỡ ở đợt 038. Gửi email/đổi mật khẩu thật, recovery session và thu hồi phiên làm tiếp theo BE-2.

## 8. Trạng thái giao diện bắt buộc

Mỗi màn hình lấy dữ liệu có đang tải, thành công, rỗng, lỗi và thử lại phù hợp. Phân biệt không có sản phẩm với bộ lọc không tìm thấy. Chi tiết có trạng thái không tồn tại; trang tài khoản có hết phiên; admin có không đủ quyền.

Form có label, kiểm tra trường, lỗi ngay cạnh trường, thông báo thành công và nút đang xử lý. Checkout khi bấm Kiểm tra đơn hàng với thông tin sai có thông báo tổng quát gần nút, cuộn/focus tới trường lỗi đầu tiên; chưa mở bước xác nhận cho đến khi hợp lệ. Hỗ trợ bàn phím, focus rõ, modal đóng bằng Escape và trả focus về nút mở. Ảnh có alt phù hợp. Không dùng màu làm dấu hiệu duy nhất cho lỗi/trạng thái.

## 9. Nghiệm thu FE và từng luồng tích hợp BE

Chưa nghiệm thu toàn bộ FE. PROGRESS.md lưu các lần lint/build, kiểm tra trình duyệt/responsive theo từng đợt; kết quả cũ không thay thế kiểm chứng phiên bản mới. Repository có test service catalog/giỏ/auth/đơn và kiểm tra trình duyệt checkout/danh sách/chi tiết; chưa kiểm tra xử lý đơn/admin vì chưa triển khai. Giữ các ô dưới đây chưa đánh dấu cho đến nghiệm thu đầy đủ.

Đợt xây /cart ngày 01/10/2026 có tests/cart-service.test.js (chạy cùng test catalog bằng `node --test tests/cart-service.test.js tests/category-service.test.js`) và tests/cart-browser.mjs theo cách chạy Playwright hiện có với CODEX_NODE_PACKAGES. Test trình duyệt bao phủ giỏ rỗng, đổi số lượng/tổng tiền, reload, đồng bộ Drawer/Header, liên kết từ sản phẩm tới /cart, lỗi lưu trữ, bàn phím và điều chỉnh tồn kho; kiểm tra không tràn ngang ở 360/640/641/768/833/834/1068/1440px. Đây là nghiệm thu riêng trang giỏ, chưa đánh dấu hoàn tất luồng checkout.

Đợt xây /login và /register ngày 01/10/2026 bổ sung tests/auth-service.test.js và tests/auth-browser.mjs. Chạy service bằng `node --test tests/auth-service.test.js tests/cart-service.test.js tests/category-service.test.js`; trình duyệt bằng `node tests/auth-browser.mjs` với Vite ở 127.0.0.1:5173 và CODEX_NODE_PACKAGES trỏ thư mục node_modules có Playwright theo các test hiện có. Bao phủ validation, email trùng, đăng ký/chờ xác minh/khôi phục bước xác minh sau reload, đăng nhập/đăng xuất, giữ phiên và giỏ, next an toàn, lỗi lưu trữ/retry, bàn phím hiện mật khẩu và focus Modal. Service kiểm tra cả fixture admin, hết phiên và dữ liệu lưu hỏng/sai kiểu; không coi role giả lập là phân quyền thật. Responsive kiểm tra cùng 8 độ rộng ở trên, lưu ảnh login/register tại 360/768/1440px. Kết quả thực tế ghi tại đợt 028 trong PROGRESS.md.

Đợt xây /account ngày 01/10/2026 mở rộng test auth service cho updateProfile và thêm tests/profile-browser.mjs (chạy `node tests/profile-browser.mjs` cùng điều kiện Vite/Playwright ở trên). Kiểm tra lưu họ tên/điện thoại, hồ sơ cũ chưa có phone, giữ thời hạn phiên, không đổi email/id/role, tách dữ liệu customer/admin/tài khoản đăng ký và lỗi ghi không mất dữ liệu. Trình duyệt kiểm tra /account cho guest, đăng nhập quay lại hồ sơ, validation/email chỉ đọc, lưu/reload/tên Header, Header/Footer/menu mobile, lỗi đọc/ghi và thử lại, chặn lưu khi hết phiên và giữ giỏ. Đã chạy lại auth-browser theo điều hướng mới và cart-browser; responsive cùng 8 độ rộng, xem ảnh profile tại 360/768/1440px, kiểm tra nút 44px, bàn phím và Escape/focus Modal chính sách. Kết quả ghi tại đợt 029 trong PROGRESS.md; chưa nghiệm thu checkout/đơn/admin.

Đợt 031 ngày 04/10/2026 bổ sung tests/order-service.test.js và tests/checkout-browser.mjs. Chạy `node --test tests/auth-service.test.js tests/cart-service.test.js tests/category-service.test.js tests/order-service.test.js` đạt 13 test; kiểm tra trình duyệt bằng `node tests/checkout-browser.mjs` cùng Vite/CODEX_NODE_PACKAGES như trên. Bao phủ giỏ → login quay lại → địa chỉ → kiểm tra → COD → chi tiết/reload; giỏ rỗng, validation, giá đổi, thiếu hàng, gửi cùng requestId, URL khôi phục kết quả, tài khoản khác không xem đơn, hết phiên, lỗi lưu đơn/retry, lỗi dọn giỏ và giỏ thay đổi. Hai tab cùng đặt lượng vượt tổng kho chỉ tạo được một đơn với Web Locks. Responsive kiểm tra 360/640/641/768/833/834/1068/1440px, bàn phím/focus và nút 44px; xem ảnh checkout/đơn 360/768/1440px. Lint/build, cart-browser, auth-browser và profile-browser chạy lại đạt. Giới hạn mock và kết quả ghi tại PROGRESS.md; chưa nghiệm thu toàn bộ website hoặc quyền/giao dịch backend.

Đợt 034 ngày 04/10/2026 thêm tests/orders-browser.mjs và mở rộng order-service/auth-service. Kiểm tra danh sách rỗng, chỉ lấy đơn của phiên (kể cả admin), bỏ qua userId đầu vào, sắp xếp ngày/ID, snapshot độc lập và dữ liệu hỏng không bị ghi đè. Trình duyệt chạy `node tests/orders-browser.mjs` với điều kiện Vite/CODEX_NODE_PACKAGES như trên; bao phủ guest/login quay lại, tạo đơn qua checkout rồi xem lịch sử, trạng thái đơn/thanh toán, nhiều phiên bản/tên dài, hồ sơ/danh sách/chi tiết, reload/làm mới, lỗi đọc/thử lại, hỏng dữ liệu, hết phiên và bàn phím. Responsive ở 360/640/641/768/833/834/1068/1440px, xem ảnh orders 360/768/1440px, nút tối thiểu 44px. Kết quả thực tế và kiểm tra các trang liên quan ghi tại PROGRESS.md; chưa nghiệm thu toàn bộ FE/BE.

Đợt 036 ngày 14/10/2026 mở rộng auth-service.test.js cho requestPasswordReset và thêm tests/forgot-password-browser.mjs. Chạy service cùng các test catalog/giỏ/đơn đạt 13 test; kiểm tra email sai, trim/chuyển thường, thông báo giống nhau với tài khoản có/chưa có/chưa xác minh, lỗi đọc và không thay phiên/hồ sơ/xác minh. Trình duyệt kiểm tra login → forgot-password → gửi/kết quả → login giữ next, validation/focus, loading/chống gửi lặp, lỗi/retry giữ email, gửi yêu cầu khác, giữ session/giỏ, người đã đăng nhập, reload/dấu / cuối và next ngoài nguồn bị chặn. Responsive 360/640/641/768/833/834/1068/1440px; xem ảnh form 360/768/1440 và kết quả 1440. Lint/build và kiểm tra login/register lại đạt; chi tiết kết quả ở PROGRESS.md, chưa nghiệm thu reset hoặc email thật.

Đợt 039 ngày 14/10/2026 bổ sung tests/password-reset-service.test.js và tests/reset-password-browser.mjs. Service chạy cùng catalog/giỏ/auth/đơn đạt 14 test: validation, TTL/một lần/vé thay thế, cạnh tranh tiêu thụ, dữ liệu hỏng, đọc/ghi lỗi giữ vé và không lưu mật khẩu hoặc đổi session/profile/quyền. Trình duyệt kiểm tra forgot → mở liên kết mô phỏng → form/reset/kết quả; vé thiếu/khác tab/hết hạn/đã dùng, tự hết hạn khi đang mở, lỗi phát vé/đọc/tiêu thụ và retry, validation/nhập lại/hiện mật khẩu, gửi lặp, reload/dấu / cuối, next an toàn, bàn phím và bảo toàn giỏ/phiên. Responsive 360/640/641/768/833/834/1068/1440px, xem ảnh form 360/768/1440 và kết quả/hết hạn 1440. Lint/build, forgot-password-browser và auth-browser đạt. Chưa nghiệm thu recovery thật hoặc toàn bộ FE/BE.

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

Dùng các hợp đồng và luồng đã ổn để xây DB và tích hợp dần theo [BE_PLAN.md](./BE_PLAN.md): catalog chỉ đọc, Auth/hồ sơ/RLS, giỏ tài khoản, checkout/đơn, Storage/admin. Không chờ hoàn tất toàn bộ FE; kiểm tra quyền và giao dịch thật theo từng đợt, rồi nghiệm thu xuyên suốt trước khi coi website hoàn tất.

## 10. Tài liệu tham khảo

- [React Router — Declarative installation](https://reactrouter.com/start/declarative/installation): hướng dẫn router cho ứng dụng React/Vite.
- [Supabase — React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs): cách kết nối React với Supabase và cấu hình publishable key khi tới giai đoạn tích hợp.
