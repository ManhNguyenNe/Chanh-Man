# Tiến trình dự án Chanh&Man

Cập nhật gần nhất: **17/10/2026**, múi giờ Asia/Saigon.

Nhật ký ghi nhận công việc thực tế sau mỗi đợt code. Mục mới nhất nằm trước; kết quả kiểm tra thuộc đợt được ghi, không phải cam kết trạng thái luôn đúng ở các phiên bản sau.

## Hiện trạng dự án

| Hạng mục | Trạng thái |
|---|---|
| Kế hoạch FE và quy tắc phát triển | Đã có `FE_PLAN.md`, `AGENTS.md`; kế hoạch được đối chiếu hiện trạng ngày 14/10/2026 |
| Tài liệu yêu cầu nghiệp vụ | Có BRD Word v1.0 cho hệ thống mục tiêu online và bán tại quầy dùng chung kho, phân kỳ G1/G2/G3; các chính sách còn mở cần chủ cửa hàng phê duyệt |
| Hướng thiết kế | Đã có `DESIGN.md`, đã áp dụng vào trang chủ |
| React + Vite + Ant Design | Đã tích hợp Ant Design và theme chung |
| Trang chủ Chanh&Man | Đã triển khai 8 phần nội dung, responsive và các tương tác chính |
| Tìm kiếm và lọc sản phẩm | Có trên trang chủ và danh mục; giữ tiêu chí trong URL |
| Xem cấu hình và giỏ hàng | Có hộp xem nhanh, chọn phiên bản và giỏ lưu trên trình duyệt |
| Trang giỏ hàng /cart | Đã có; dùng chung giỏ với Header/Drawer, đổi số lượng/xóa/thành tiền, rỗng/lỗi và cảnh báo tồn kho; đã nối checkout |
| Trang danh mục độc lập | Đã có Laptop, Điện thoại, Linh kiện PC, Tất cả; lọc và sắp xếp bằng dữ liệu giả lập |
| Trang chi tiết độc lập | Đã có /san-pham/:id; ảnh, chính sách, mô tả, chọn phiên bản, nhận xét dùng thử và gợi ý mua cùng |
| Đăng nhập và đăng ký | Đã có /login, /register bằng auth giả lập; validation, xác minh email mô phỏng, phiên trong tab, đăng xuất và giữ giỏ |
| Hồ sơ /account | Đã có; xem/sửa họ tên và số điện thoại, email chỉ đọc, lưu theo tài khoản dùng thử, đăng xuất; có lỗi/thử lại và chưa đăng nhập/hết phiên |
| Quên mật khẩu /forgot-password | Đã có trang yêu cầu khôi phục giả lập; email/validation, loading/gửi lặp, kết quả chung, lỗi/thử lại, giữ giỏ/phiên và quay lại login |
| Đặt mật khẩu mới /reset-password | Đã có FE mô phỏng: vé 10 phút/một lần/cùng tab, form mật khẩu mới/nhập lại, thiếu/sai/hết hạn/đã dùng/lỗi/retry và kết quả. Không thay credential thật |
| Checkout /checkout | Đã có; yêu cầu phiên, địa chỉ, phí 30.000₫ dùng thử, COD, kiểm tra rồi xác nhận, báo giá lại và retry chống trùng |
| Chi tiết đơn /account/orders/:id | Đã có; đơn của tài khoản hiện tại, snapshot hàng/địa chỉ/tổng, lưu dùng thử trên trình duyệt và cập nhật tồn kho mock |
| Danh sách đơn /account/orders | Đã có; chỉ đọc đơn của phiên hiện tại, mới nhất trước, mã/ngày/trạng thái/snapshot sản phẩm/tổng tiền, làm mới/rỗng/lỗi/thử lại và nối hồ sơ/chi tiết |
| Quản trị và xử lý đơn | Chưa triển khai |
| Database và tích hợp Supabase | Đủ 13/13 bảng catalog, hồ sơ/quyền, giỏ và đơn/kho; đã có RPC quyền, giỏ và BE-4. Đã kiểm tra RLS, giao dịch, retry, cạnh tranh hàng cuối và hoàn kho; xóa tasks/products_legacy ngoài Plan. FE vẫn dùng mock, BE-1 đến BE-4 chưa nghiệm thu toàn luồng |

**Lưu ý phạm vi:** bản hiện tại là FE học tập, giá/cấu hình/tồn kho là dữ liệu minh họa, chưa tiếp nhận đơn hàng thực tế. Hoàn thành trang chủ không đồng nghĩa hoàn thành toàn bộ FE.

## Nhật ký thay đổi

### Đợt 044 — 17/10/2026 — Tài liệu BRD chi tiết cho hệ thống Chanh&Man

**Mục tiêu:** tạo tài liệu yêu cầu nghiệp vụ `.docx` theo sáu đề mục người dùng yêu cầu, tập trung mô tả chi tiết cách vận hành cửa hàng điện tử.

**Đã thực hiện:** [BRD_Chanh_Man_v1.0.docx](./docs/BRD_Chanh_Man_v1.0.docx) gồm 28 trang với tóm tắt, mục tiêu, phạm vi, các bên liên quan, yêu cầu nghiệp vụ, chức năng và phi chức năng. Đã hỏi và ghi nhận các lựa chọn của chủ dự án: hệ thống hoàn chỉnh có phân kỳ; một cửa hàng bán online và trực tiếp dùng chung kho; chỉ hàng mới chính hãng/linh kiện mới; COD, tiền mặt và chuyển khoản, cổng thanh toán online ở giai đoạn sau. Chưa có chính sách chính thức nên quy trình được đề xuất và các mức phí/thời hạn/hạn mức được ghi cần phê duyệt.

Tài liệu có 80 yêu cầu nghiệp vụ thuộc 16 nhóm, 64 yêu cầu chức năng, 20 yêu cầu phi chức năng, ma trận truy vết, 7 luồng nghiệm thu xuyên suốt và 10 nhóm quyết định chính sách cần chốt. Mô tả cả bán tại quầy cho khách không có tài khoản, kho chung, serial/IMEI, nhập hàng, giao thất bại, đối soát COD, đổi trả, hoàn tiền, bảo hành, hỗ trợ và báo cáo. Phân biệt hệ thống mục tiêu với phần FE/database đã triển khai; G1/G2/G3 của BRD không tương đương các phase BE hiện tại.

**Kiểm tra thực chạy:** cập nhật mục lục và số trang bằng Word, xuất PDF nội bộ rồi dùng bộ render tài liệu tạo PNG, kiểm tra trực quan đủ 28 trang và sửa ngắt trang/tiêu đề. Audit accessibility không có phát hiện high/medium/low. Kiểm tra cấu trúc đủ sáu heading chính, BR01–BR80, FR01–FR64, NFR01–NFR20 và header lặp cho các bảng. Chỉ bàn giao file Word; ảnh/PDF kiểm tra là nội bộ.

**Còn lại:** chủ cửa hàng phê duyệt chính sách và các chỉ tiêu định lượng đề xuất trước khi dùng làm cam kết nghiệm thu/mở bán. BRD là đầu vào cho thiết kế và cập nhật kế hoạch ở đợt sau; đợt này không triển khai thêm chức năng, thay đổi schema hay dữ liệu Supabase. Không chạy lint/build ứng dụng vì chỉ tạo tài liệu và cập nhật nhật ký.

### Đợt 043 — 17/10/2026 — Hoàn tất database/RPC BE-4 và xóa bảng ngoài Plan

**Mục tiêu:** xóa các bảng ứng dụng ngoài BE_PLAN theo yêu cầu và xây dựng database đơn hàng/kho trên Supabase dev `manhngynne` (`dnnsfxgtngvkrvvzjovp`). Triển khai bắt đầu 16/10 và hoàn tất kiểm tra 17/10; phạm vi là database/RPC, FE tiếp tục dùng mock.

**Đã thực hiện:** migration [20261016160344_chanhman_orders_and_inventory.sql](./supabase/migrations/20261016160344_chanhman_orders_and_inventory.sql) đã áp dụng, version local khớp remote. Xóa `public.tasks` (1 dòng) và `public.products_legacy` (3 dòng) bằng DROP không CASCADE, có kiểm tra số dòng trước khi xóa. Tạo `orders`, `order_items`, `order_status_history`, `inventory_movements`, `private.shop_settings`: tổng cộng **13/13 bảng ứng dụng**. Bảng hệ thống Supabase được giữ. Phí ban đầu 30.000 VND, ledger initial cho stock dương hiện có; index/FK/CHECK/RLS/grants đi cùng schema. Client chỉ đọc đơn của mình; admin đọc toàn bộ đơn và ledger; không có DML trực tiếp hoặc quyền đọc request_payload.

RPC `quote_order` báo giá hiện tại; `create_order` yêu cầu Auth đã xác minh, chuẩn hóa payload, khóa theo request ID và variants/parent, tính lại tiền, ghi snapshot/đơn/lịch sử, trừ stock/ghi ledger và trừ lượng đã mua khỏi giỏ trong một transaction. Cùng request/payload retry trả đơn hiện tại, không trừ kho/giỏ lần nữa; payload khác bị từ chối. Tiền hữu hạn tối đa 999999999999999 VND; input tối đa 100 dòng/32KB, quantity 1–999 sau gộp. `get_order` chỉ chủ đơn/admin; `set_order_status` chỉ admin theo state machine, hủy hoàn một lần và delivered cập nhật COD paid; `adjust_stock` kiểm tra expectedStock để tránh ghi đè tồn kho đã đổi. Public RPC INVOKER, handler đặc quyền ở private có kiểm tra danh tính/quyền và search_path rỗng.

[generate-seed.mjs](./supabase/generate-seed.mjs) và [seed.sql](./supabase/seed.sql) bổ sung initial ledger khi migrations chạy trước seed trên DB sạch; reseed giữ stock và không ghi trùng movement. Hợp đồng RPC, ánh xạ địa chỉ FE fullName/street/city sang recipientName/addressLine/province và giới hạn tích hợp nằm trong [supabase/README.md](./supabase/README.md). Cập nhật hiện trạng [BE_PLAN.md](./BE_PLAN.md).

**Kiểm tra thực chạy:** [tests/orders.sql](./supabase/tests/orders.sql) đạt phân quyền A/B/admin, quyền cột, chống giả role/xác minh, validation/báo giá/giới hạn tiền, snapshots, ghi đơn/kho/giỏ nguyên tử, retry/conflict, trạng thái/thanh toán/hoàn kho, expectedStock và rollback khi hoàn kho tràn integer. Ba bộ catalog/profiles/cart hồi quy đều đạt. Fixture SQL rollback.

[tests/orders-concurrency.sql](./supabase/tests/orders-concurrency.sql) chạy từng cặp request đồng thời qua các kết nối DB: cùng ID chỉ tạo một đơn/trừ một lần; hai khách tranh hàng cuối chỉ một đơn thành công và stock=0; hai lệnh hủy đồng thời chỉ ghi một history/movement hoàn. Fixture đã commit để kiểm tra khóa thật được dọn bằng transaction có guard; kiểm kê cuối không còn Auth/profile/admin/cart/receipt/order/item/history thử nghiệm. Catalog giữ 24 products/46 variants; 36 movement initial khớp toàn bộ stock, không có movement thử nghiệm khác. Thử reseed trong transaction rollback đạt, không reset stock/nhân bản ledger.

[verify-api.mjs](./supabase/verify-api.mjs) qua REST publishable key đạt: anon đọc catalog, bị chặn dữ liệu/RPC giỏ/đơn/admin; private không expose; tasks/legacy trả 404. Lint, Node syntax và diff whitespace check đạt. Advisors sau migration không có ERROR/WARN; còn INFO [RLS đóng mặc định trên admin_users](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) và [index chưa dùng](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), giữ index theo FK/truy vấn của Plan. Lỗi phiên plugin và giới hạn automatic approval trước đó đã được khắc phục bằng gọi lại sau khi tiếp tục; các thao tác kiểm tra/dọn dữ liệu đều đã có kết quả thành công.

**Còn lại:** chưa nối FE/Auth thật, chưa cấp admin đầu tiên, chưa thử JWT đăng nhập thật hoặc luồng browser checkout/admin. Các test A/B/admin sử dụng Auth rows và claims mô phỏng ở DB. Chưa dựng DB local sạch từ migrations+seed vì Docker daemon không chạy. Không lặp build/UI test vì không đổi mã FE. Quyền sửa nội dung catalog, giao diện quản trị và Storage tiếp tục ở BE-5; có đủ bảng không đồng nghĩa website đã sẵn sàng nhận đơn thật.

### Đợt 042 — 15/10/2026 — Database và RPC giỏ tài khoản BE-3

**Mục tiêu:** tiếp tục BE-3 trên Supabase dev đã xác nhận, chuẩn bị giỏ riêng theo tài khoản và hợp nhất giỏ khách an toàn khi đăng nhập. Phạm vi là database/RPC; chưa thay giỏ localStorage hoặc hook FE.

**Đã thực hiện:** migration [20261014160347_chanhman_account_cart.sql](./supabase/migrations/20261014160347_chanhman_account_cart.sql) tạo `public.cart_items` với PK(user_id,variant_id), FK Auth CASCADE/variant RESTRICT, quantity integer 1–999, timestamps và index variant_id. RLS SELECT/INSERT/UPDATE/DELETE theo auth.uid(), kể cả admin chỉ có giỏ của mình; chỉ cấp INSERT ba cột user_id/variant_id/quantity và UPDATE quantity. Trigger giữ owner/variant/created_at, đặt updated_at. `private.cart_merge_requests` lưu request/payload chuẩn hóa trong cùng transaction, PK(user_id,request_id); client không có quyền bảng và policy RLS từ chối rõ ràng.

RPC `get_my_cart()` SECURITY INVOKER trả items/count/total/notices, đọc giá/kho thật và lọc active ở variant/product/category/brand. Các dòng hidden chỉ có ID/số lượng đã lưu, metadata catalog NULL và stock=0; admin dùng giỏ cũng áp dụng cùng bộ lọc. Read giữ nguyên dòng hết hàng/vượt kho/ẩn để khách điều chỉnh; count gồm toàn bộ lượng đã lưu, total chỉ cộng dòng có đủ tồn kho. Chặn tổng vượt số nguyên an toàn JavaScript bằng 22003. Giỏ không giữ hoặc trừ kho.

RPC `merge_guest_cart(p_request_id,p_items)` dùng public wrapper INVOKER/private handler DEFINER có auth.uid() và search_path rỗng. Input tối đa 100 dòng/32KB, đúng hai trường variantId/quantity; số nguyên 1–999, gộp trùng rồi kiểm tra giới hạn, sắp payload theo ID. Cùng user/request/payload retry trả giỏ hiện tại và replayed=true, không cộng lại dù kho/catalog/giỏ đã đổi. Cùng request khác payload trả 22023/REQUEST_ID_REUSED. Request mới dùng UPSERT cộng lượng nguyên tử, giới hạn theo stock/999, bỏ qua guest line không còn bán/hết hàng với notices và giữ các dòng tài khoản khác. Receipt và cập nhật giỏ rollback cùng nhau nếu thất bại. Notice của lần merge đầu không được lưu riêng; retry trả notices của giỏ hiện tại.

**Kiểm tra thực chạy:** [tests/cart.sql](./supabase/tests/cart.sql) đạt RLS A/B/admin, CRUD/cột bất biến/FK/timestamps, catalog hidden/soldout/vượt kho, giá/kho mới, chuẩn hóa trùng/1.0, empty merge, retry sau sửa giỏ/catalog, request khác payload, giả giá/userId, input sai và biên 100/101 dòng/32KB/999, tổng MAX_SAFE_INTEGER/MAX+1 và rollback không để lại receipt/giỏ. Bộ catalog/profiles hồi quy đều đạt. Thử hai connection cùng request đồng thời có đúng quantity=1/receipt=1; hai request khác đồng thời tăng đúng 1→3, receipt=3 và stock vẫn 8. Fixture concurrency đã dọn, fixture SQL rollback; kiểm kê cuối Auth/profiles/admin/cart/receipt đều 0, catalog vẫn 24 products/46 variants, legacy 3 dòng, không có product QA.

[verify-api.mjs](./supabase/verify-api.mjs) qua REST publishable key đạt: anon vẫn đọc catalog, bị chặn cart_items và RPC đọc/merge giỏ, profiles/role RPC; schema private trả 406/PGRST106. Lint, Node syntax và git diff --check đạt. Advisors không có ERROR/WARN mới; chỉ INFO đã có về [RLS đóng mặc định trên admin_users](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) và [products_brand_idx chưa dùng](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index). Không lặp build/UI test vì không sửa mã FE.

**Còn lại:** **8/13 bảng**, còn orders/order_items/order_status_history/inventory_movements/private.shop_settings ở BE-4. FE Auth/catalog/giỏ vẫn mock; chưa kiểm tra bằng JWT đăng nhập thực hoặc luồng browser login→merge→logout. Khi tích hợp, chỉ xóa giỏ khách sau phản hồi commit, giữ requestId/payload để retry nếu lỗi, và bỏ state giỏ tài khoản khi logout. Snapshot tồn kho trong merge có thể đổi sau đó; checkout BE-4 phải kiểm tra/khóa kho riêng. Chưa xác minh dựng DB local sạch từ migrations+seed vì Docker daemon chưa chạy.

### Đợt 041 — 14/10/2026 — Database hồ sơ và quyền admin BE-2

**Mục tiêu:** tiếp tục tạo cấu trúc database theo đợt BE-2 của BE_PLAN.md trên project dev đã xác nhận; chưa thay authService/hồ sơ/session giả lập của FE.

**Đã thực hiện:** migration `supabase/migrations/20261014154355_chanhman_profiles_and_admin.sql` tạo `public.profiles` (UUID từ auth.users, display_name trim whitespace 2–80 ký tự, phone NULL hoặc dấu + tùy chọn với 8–15 chữ số, timestamps) và `private.admin_users` (user_id FK Auth, created_at). Cả hai RLS; FK ON DELETE CASCADE. Không sao chép email/mật khẩu hoặc trạng thái xác minh khỏi Auth.

Auth INSERT trigger `private.handle_new_user()` dùng quyền owner để tạo hồ sơ; metadata chỉ lấy display_name dạng chuỗi, trim/validate rồi fallback `Khách hàng`. Helper tên được dùng lại cho backfill missing profiles và không ghi đè hồ sơ đã có. Trigger profile chặn đổi id, giữ created_at, cập nhật updated_at và trim tên. Các hàm nội bộ không có EXECUTE cho client, search_path rỗng; trigger đặc quyền không phải endpoint client.

Customer/admin chỉ SELECT/UPDATE hồ sơ của mình với USING/WITH CHECK theo auth.uid(); chỉ GRANT UPDATE(display_name,phone), không INSERT/DELETE hoặc đổi id/timestamps. Bảng admin không cấp quyền client và dùng RLS đóng mặc định. `private.is_admin()` lookup live theo auth.uid(), trả false khi thiếu UID; authenticated có USAGE private và EXECUTE duy nhất helper cần thiết. Public RPC SECURITY INVOKER `get_my_role()` chỉ authenticated có UID gọi được; metadata/claims role không quyết định quyền. Admin xem đầy đủ catalog gồm draft/archived/parent inactive/variant inactive, nhưng không có DML catalog. Giữ một policy SELECT cho mỗi role/bảng để tránh policy permissive trùng.

CLI tạo migration, plugin Supabase áp dụng và file local đồng bộ version remote. Cập nhật `supabase/tests/catalog.sql` theo quyền helper mới và bổ sung `supabase/tests/profiles.sql`; API script kiểm tra thêm anonymous profiles/role RPC.

**Kiểm tra thực chạy:** SQL profiles đạt trigger/fallback cả metadata sai kiểu/tên trắng/quá dài; validation tên/phone/NULL, timestamps/cột bất biến; RLS A/B và admin chỉ đọc/sửa hồ sơ riêng; metadata/claims admin giả không nâng quyền; khách không đọc/ghi admin_users; admin xem catalog ẩn và bị chặn ghi; thu hồi admin tác dụng ngay với claims không đổi; profile/admin cascade khi xóa Auth fixture; helper/RPC anon hoặc thiếu UID bị từ chối. SQL catalog regression đạt. Các identity trong kiểm tra là Auth rows và JWT claims mô phỏng tại DB, tất cả fixture rollback; kiểm kê cuối Auth/profiles/admin đều 0, catalog vẫn 24 products/46 variants và legacy giữ 3 dòng. REST publishable key thực xác nhận anon catalog vẫn đọc được và profiles/get_my_role bị từ chối. Node syntax, lint và git diff --check đạt; đợt này không sửa code FE nên không lặp build đã đạt ở đợt 040.

Kiểm tra REST thêm `Accept-Profile: private` trả 406/PGRST106, xác nhận schema private không nằm trong Data API exposed schemas. Advisors không có ERROR/WARN. Security INFO [RLS Enabled No Policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) ở private.admin_users là có chủ đích: RLS đóng mặc định, client không có quyền bảng, chỉ helper owner lookup và quản trị đáng tin cậy truy cập. Performance INFO [Unused Index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) của products_brand_idx từ đợt catalog vẫn được giữ cho FK/lọc hãng.

**Còn lại:** đã có **6/13 bảng ứng dụng**, còn 7 ở BE-3/BE-4. Project chưa có tài khoản thật nên chưa cấp admin đầu tiên. BE-2 database đã sẵn sàng; chưa tích hợp Auth/profile/session FE, cấu hình/kiểm tra email-confirm/callback/reset thực hoặc kiểm tra Data API bằng JWT đăng nhập A/B/admin thật. Chưa xác minh dựng DB local sạch vì Docker daemon chưa chạy. Chưa triển khai giỏ tài khoản, đơn/ledger, RPC ghi admin hoặc Storage.

### Đợt 040 — 14/10/2026 — Khởi tạo cấu trúc database catalog trên Supabase dev

**Mục tiêu:** bắt đầu backend theo BE_PLAN.md bằng plugin Supabase, phạm vi BE-0 và cấu trúc catalog của BE-1; giữ ID/URL/giỏ hiện tại, có migration và quyền đọc an toàn.

**Đã thực hiện:** người dùng xác nhận project `manhngynne`, ref `dnnsfxgtngvkrvvzjovp`, làm môi trường dev Chanh&Man. Kiểm kê PostgreSQL 17.6, không có Auth user/migration trước đó, có bucket `images`, bảng `tasks` và bảng `products` UUID chứa 3 dòng. Đổi tên bảng products cũ thành `products_legacy`, giữ đủ 3 dòng; không sửa tasks hoặc bucket hiện có.

Tạo `public.categories`, `brands`, `products`, `product_variants`: PK text ổn định, FK RESTRICT, UNIQUE slug/SKU, text CHECK cho trạng thái, giá numeric(15,0) dương/hữu hạn và giá tham chiếu >= giá bán, stock integer không âm, kiểm tra kiểu/kích thước JSON và mã nhu cầu. Index theo danh mục/trạng thái/thứ tự, hãng và product/active của variant. Trigger giữ ID/created_at, cập nhật updated_at; variant không chuyển sang product khác. Deferred constraint trigger yêu cầu product active đủ field và có ít nhất một variant active; thay đổi khả dụng variant khóa product cha. Stock=0 vẫn được hiển thị.

RLS bật cả bốn bảng, anon/authenticated chỉ SELECT catalog active với parent hợp lệ; không quyền INSERT/UPDATE/DELETE/TRUNCATE. Các hàm trigger SECURITY INVOKER ở schema private với search_path cố định và không cấp quyền gọi cho client; chưa cấp admin hoặc thêm RPC ghi.

Supabase CLI 2.120.0 tạo migration, plugin MCP áp dụng DDL và lưu lịch sử. File local đồng bộ version remote: `supabase/migrations/20261014151914_chanhman_catalog.sql` và `20261014152020_chanhman_catalog_money_bounds.sql`. Seed riêng sinh từ toàn bộ mock qua `supabase/generate-seed.mjs`: **3 danh mục, 16 hãng, 24 sản phẩm, 46 phiên bản**, giữ ID/ảnh/thứ tự/giá/kho/màu/nhu cầu, khai báo options/SKU mẫu tường minh. `ON CONFLICT (id) DO NOTHING` bảo toàn stock và chỉnh sửa hiện hữu. Tài liệu tại [supabase/README.md](./supabase/README.md).

**Kiểm tra thực chạy:** generator assertions và node syntax check đạt; `supabase/tests/catalog.sql` trên dev đạt các kiểm tra constraints/FK/immutable ID/timestamps/publish/last variant, RLS cho anon/authenticated, quyền ghi service_role và chặn ghi client, fixture rollback sạch. Reseed trong transaction thử không nhân bản hoặc reset stock đã đổi; rollback trả kho về ban đầu. `supabase/verify-api.mjs` với publishable key đọc đủ số dòng qua REST thật, không thấy product/variant ẩn, và POST/PATCH/DELETE bị từ chối với 42501. Kiểm kê cuối giữ đủ 3 dòng legacy, không còn product QA. `npm run lint`, `npm run build`, `git diff --check` đạt. Security advisors không có lint; performance chỉ INFO [unused_index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) cho `products_brand_idx`, giữ index này vì phục vụ FK/lọc hãng trong BE_PLAN và dữ liệu mới còn nhỏ.

**Còn lại:** chưa xác minh dựng database local sạch từ migrations+seed vì Docker daemon chưa chạy; chưa kiểm tra concurrency nhiều connection. FE/productService/cartService vẫn dùng mock, chưa có query/filter/count/RPC tìm kiếm và mapping Supabase, nên BE-1 chưa hoàn tất. Auth/profile/admin, giỏ tài khoản, đơn/ledger và Storage thuộc các đợt sau. Giá/kho/SKU và bảo hành mở rộng trong seed là minh họa; RPC ghi sau này phải validate tiền nguyên trước cast numeric. Không coi đợt này là hệ thống sẵn sàng mở bán.

### Đợt 039 — 14/10/2026 — Xây trang đặt mật khẩu mới dùng thử

**Mục tiêu:** /reset-password theo FE_PLAN.md, AGENTS.md, DESIGN.md, giới hạn mock không lưu mật khẩu/hash và kế hoạch tích hợp Auth của BE_PLAN.md; tái sử dụng ShopLayout/Auth.css/Ant Design, không thêm dependency.

**Đã thực hiện:** thêm route có/không có dấu / cuối, form mật khẩu mới/nhập lại (8–128 ký tự, không toàn khoảng trắng), validation/focus/hiện ẩn, loading/khóa gửi lặp và lỗi giữ form/thử lại. Trước form kiểm tra vé: thiếu/sai/hết hạn/đã dùng có thông báo, lối yêu cầu mới/quay về login; lỗi đọc có Thử lại. Timer báo hết hạn ngay khi form đang mở, service kiểm tra lại trước xác nhận. Thành công xóa trường mật khẩu và đưa focus tới kết quả ghi rõ mô phỏng. Tiêu đề/card/dấu chấm xanh/no eyebrow và responsive dùng chung auth.

ForgotPassword sau phản hồi chung có nút Mô phỏng mở liên kết khôi phục. createDemoRecovery tạo vé UUID độc lập với email/tài khoản, lưu expiresAt/used trong sessionStorage; giới hạn 10 phút, một lần và cùng tab, tạo mới thay vé cũ. Token truyền qua fragment; getPasswordResetState kiểm tra và resetPassword đánh dấu đã dùng chỉ sau validation. Lỗi đọc/ghi không tiêu thụ hoặc ghi đè vé đang có; không lưu mật khẩu/hash, không đổi demoPassword/hồ sơ/phiên hoặc cấp quyền đăng nhập cho guest. Login → forgot → reset → login giữ next đã kiểm tra; liên kết khôi phục trong hồ sơ vẫn được gỡ như yêu cầu đợt 038.

**File:** [ResetPassword.jsx](./src/pages/ResetPassword.jsx), [ForgotPassword.jsx](./src/pages/ForgotPassword.jsx), [authService.js](./src/services/authService.js), [App.jsx](./src/App.jsx), [password-reset-service.test.js](./tests/password-reset-service.test.js), [reset-password-browser.mjs](./tests/reset-password-browser.mjs), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build và 14 test catalog/giỏ/auth/đơn/recovery đạt. Service test kiểm tra validation/nhập lại, TTL đúng biên, vé đã dùng/bị thay, hai lần tiêu thụ chỉ một thành công, đọc/ghi lỗi không mất vé, dữ liệu hỏng giữ nguyên, không lưu mật khẩu/đổi hạn phiên/hồ sơ/vai trò và guest không nhận phiên. Reset-password-browser đạt luồng forgot → vé → reset/kết quả, thiếu/khác tab/hết hạn/đã dùng, tự hết hạn khi form mở, lỗi phát vé/đọc/tiêu thụ rồi retry, form sai/nhập lại/hiện ẩn bằng Enter, gửi lặp chỉ ghi một lần, bảo toàn session/giỏ, next ngoài nguồn, reload/dấu / cuối. Không lỗi JavaScript/tràn ngang tại 360/640/641/768/833/834/1068/1440px; nút gửi tối thiểu 44 × 44px. Forgot-password-browser và auth-browser chạy lại đều đạt trên Edge headless riêng ngoài sandbox.

**Ảnh:** form [1440px](./docs/previews/reset-password-1440.png), [768px](./docs/previews/reset-password-768.png), [360px](./docs/previews/reset-password-360.png); [kết quả](./docs/previews/reset-password-result-1440.png), [hết hạn](./docs/previews/reset-password-expired-1440.png). Đã xem cả năm ảnh; ảnh forgot/auth được cập nhật khi kiểm tra lại.

**Giới hạn/tiếp theo:** vé chỉ phục vụ mô phỏng trạng thái FE, không gắn với quyền khôi phục tài khoản thật. Mật khẩu vừa nhập không thay thế mật khẩu demo; chưa gửi email, đổi mật khẩu server hoặc thu hồi phiên. Thay mô phỏng bằng recovery session thật tại BE-2, xử lý callback/redirect/quyền trên backend. Chưa nghiệm thu toàn bộ FE/BE, chưa commit/push.

### Đợt 038 — 14/10/2026 — Gỡ lối khôi phục khỏi hồ sơ

**Đã thực hiện:** theo yêu cầu đổi lại, gỡ liên kết Khôi phục mật khẩu khỏi /account, đưa phần điều hướng hồ sơ về trước đợt 037. Cập nhật hiện trạng route trong [FE_PLAN.md](./FE_PLAN.md); giữ trang /forgot-password và liên kết Quên mật khẩu trên login. Chỉ xóa dòng liên kết trong [Profile.jsx](./src/pages/Profile.jsx), không đổi CSS/service. Ảnh profile-recovery ở đợt 037 là lịch sử trước khi gỡ.

**Kiểm tra:** đối chiếu mã nguồn xác nhận hồ sơ không còn liên kết khôi phục và login vẫn dẫn tới forgot-password. Không chạy lại test UI/service vì chỉ gỡ một liên kết và trở về bố cục đã kiểm tra trước đó.

### Đợt 037 — 14/10/2026 — Thêm lối khôi phục từ hồ sơ

**Đã thực hiện:** thêm liên kết Khôi phục mật khẩu trong khối Tài khoản của bạn tại /account, ngay sau Thông tin cá nhân. Người đã đăng nhập có thể mở /forgot-password?next=/account từ hồ sơ; liên kết Quên mật khẩu trên login vẫn phục vụ khách chưa đăng nhập. Dùng text-action và spacing hiện có, không thêm CSS hoặc thay nghiệp vụ.

**File:** [Profile.jsx](./src/pages/Profile.jsx), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt. Kiểm tra Edge headless với fixture đăng nhập: liên kết xuất hiện, vùng bấm tối thiểu 44 × 44px và không tràn ngang ở 360/640/641/768/833/834/1068/1440px; Enter mở đúng forgot-password với next=/account, link về login giữ next và Back vẫn có phiên/hồ sơ cũ. Không lỗi JavaScript; xem ảnh khối tài khoản tại [1440px](./docs/previews/profile-recovery-1440.png), [768px](./docs/previews/profile-recovery-768.png), [360px](./docs/previews/profile-recovery-360.png). Không thêm test hoặc chạy lại service vì chỉ bổ sung một liên kết; gửi email/đổi mật khẩu vẫn giả lập theo đợt 036.

### Đợt 036 — 14/10/2026 — Xây trang quên mật khẩu

**Mục tiêu:** triển khai /forgot-password theo FE_PLAN.md, AGENTS.md, DESIGN.md và thông báo khôi phục chung trong BE_PLAN.md; giữ phạm vi FE giả lập, tái sử dụng code theo Ponytail.

**Đã thực hiện:** thêm ForgotPassword cho route có/không có dấu / cuối. Nút Quên mật khẩu trên login chuyển thành liên kết tới form, giữ next đã kiểm tra; quay lại login vẫn giữ đích cửa hàng hợp lệ, URL ngoài nguồn bị đưa về /cart. Dùng ShopLayout, Auth.css và Ant Design hiện có: tiêu đề trắng/dấu chấm xanh/không eyebrow, email có label/validation/focus, khóa trường và nút khi gửi, lỗi giữ email để gửi lại, kết quả chung có focus và nút về login/gửi yêu cầu khác. Desktop hai cột, dưới 834px một cột; giao diện giải thích rõ chưa gửi email/đặt mật khẩu mới. Truy cập được cả guest và tài khoản có phiên.

requestPasswordReset trong authService trim/chuyển thường/kiểm tra email, mô phỏng lookup cùng độ trễ cho mọi địa chỉ và trả {mock:true,message}. Fixture, tài khoản chưa xác minh hoặc email chưa có đều nhận cùng thông báo; không lộ trạng thái tài khoản, không tạo token, gửi email, lưu yêu cầu hay đổi hồ sơ/phiên/mật khẩu. Lỗi lưu trữ trả code/message theo service hiện có; UI hiển thị rồi cho gửi lại. Không thêm dependency hoặc tạo route reset chưa được yêu cầu.

**File:** [ForgotPassword.jsx](./src/pages/ForgotPassword.jsx), [Auth.jsx](./src/pages/Auth.jsx), [App.jsx](./src/App.jsx), [authService.js](./src/services/authService.js), [auth-service.test.js](./tests/auth-service.test.js), [forgot-password-browser.mjs](./tests/forgot-password-browser.mjs), [auth-browser.mjs](./tests/auth-browser.mjs), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt; 13 test catalog/giỏ/auth/đơn đạt. Test auth mở rộng cho email sai/quá dài/trim/chuyển thường, phản hồi chung cho tài khoản có/chưa có/chưa xác minh, lỗi đọc và không thay dữ liệu/hạn phiên hoặc phát thông báo đổi tài khoản. Forgot-password-browser đạt login → forgot → gửi/kết quả → login giữ next, validation/focus, loading/chống gửi lặp, lỗi/retry giữ email, gửi yêu cầu khác, bảo toàn session/giỏ, phiên đã đăng nhập, reload/dấu / cuối và next ngoài nguồn. Không lỗi JavaScript hoặc tràn ngang ở 360/640/641/768/833/834/1068/1440px; nút gửi tối thiểu 44 × 44px. Edge không khởi chạy được trong sandbox; đã kiểm tra bằng Edge headless hồ sơ tạm riêng và Vite localhost ngoài sandbox. Kiểm tra login/register được cập nhật theo liên kết mới và chạy lại.

**Ảnh:** form [1440px](./docs/previews/forgot-password-1440.png), [768px](./docs/previews/forgot-password-768.png), [360px](./docs/previews/forgot-password-360.png); [kết quả 1440px](./docs/previews/forgot-password-result-1440.png). Đã xem cả bốn ảnh.

**Giới hạn/tiếp theo:** mới mô phỏng bước yêu cầu khôi phục, chưa có /reset-password, token/liên kết hết hạn hoặc gửi mail/thay mật khẩu thật. Tích hợp Auth recovery và reset theo BE-2, giữ thông báo chung ở backend. Không coi luồng khôi phục hoặc toàn bộ FE đã hoàn tất; chưa commit/push.

### Đợt 035 — 04/10/2026 — Đưa lối vào đơn hàng lên header

**Mục tiêu/tham khảo:** giúp khách tìm danh sách đơn từ mọi trang cửa hàng. Tham khảo lối Tra cứu đơn hàng ở phần đầu trang [CellphoneS](https://cellphones.com.vn/chinh-sach-giao-hang) và liên kết Lịch sử mua hàng trên [TGDD](https://www.thegioididong.com/). Chọn lối vào cạnh tài khoản trên header desktop; mobile dùng menu để giữ header gọn theo DESIGN.md. Đây là lựa chọn áp dụng cho dự án, không sao chép toàn bộ giao diện các website tham khảo.

**Đã thực hiện:** thêm Đơn hàng bên trái biểu tượng tài khoản/giỏ, có vùng bấm 44px; ở 833px trở xuống chuyển vào menu mobile với nhãn Đơn hàng của tôi. Người có phiên tới /account/orders; khách tới /login?next=/account/orders rồi quay lại danh sách. Chuyển liên kết đơn trong hồ sơ thành Button Ant Design để dễ nhận ra. Cập nhật FE_PLAN.md theo các lối vào mới.

**File:** [Header.jsx](./src/components/header/Header.jsx), [Header.css](./src/components/header/Header.css), [Profile.jsx](./src/pages/Profile.jsx), [orders-browser.mjs](./tests/orders-browser.mjs), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt. Orders-browser mở rộng kiểm tra lối vào header bằng Enter, menu mobile/đích guest có next, nút hồ sơ và breakpoint 833/834px; toàn bộ luồng danh sách vẫn đạt. Auth-browser, profile-browser và cart-browser chạy lại đạt. Không tràn ngang ở 360/640/641/768/833/834/1068/1440px; xem header tại 1440/834, menu mobile 360 và nút hồ sơ. Không chạy lại test service vì không đổi nghiệp vụ dữ liệu.

**Ảnh:** [Header 1440px](./docs/previews/header-orders-1440.png), [Header 834px](./docs/previews/header-orders-834.png), [Menu mobile](./docs/previews/header-orders-mobile-360.png), [Nút hồ sơ](./docs/previews/profile-orders-button-1440.png). Dữ liệu đơn/quyền vẫn giả lập như đợt 034.

### Đợt 034 — 04/10/2026 — Xây danh sách đơn của tài khoản

**Mục tiêu:** triển khai /account/orders theo FE_PLAN.md, AGENTS.md, DESIGN.md và hợp đồng chủ sở hữu/snapshot của BE_PLAN.md; tiếp tục dùng mock hiện có và Ponytail, không thêm dependency.

**Đã thực hiện:** thêm Orders cho /account/orders và /account/orders/, dùng ShopLayout/tiêu đề/card của giỏ/checkout, không eyebrow. Hiển thị đơn mới nhất trước với mã/ngày, nhãn trạng thái, snapshot sản phẩm đầu/số phiên bản còn lại, tổng số món, COD/trạng thái thanh toán và tổng tiền; có Làm mới, loading, rỗng, lỗi/thử lại và thông báo chưa đăng nhập/hết phiên. Desktop card chia các nhóm thông tin/thao tác theo hàng; dưới 641px xếp dọc, nút chi tiết đủ chiều rộng. Tài khoản truy cập từ hồ sơ, mở chi tiết rồi quay lại danh sách; next sau login nhận cả danh sách có dấu / cuối. Nội dung auth/tài khoản cập nhật theo phần đã có.

listMyOrders lấy danh tính từ getSession, lọc chủ đơn tại service, sắp xếp createdAt giảm dần rồi id khi cùng ngày; trả bản sao snapshot, không nhận userId từ UI và không ghi lại kho dữ liệu. Fixture admin cũng chỉ xem đơn của mình trong trang tài khoản. Dữ liệu hỏng hoặc đọc bị chặn báo lỗi để thử lại, không giả thành danh sách rỗng. Thêm orderStatusLabels/paymentStatusLabels dùng chung danh sách và chi tiết, thay nhãn pending/unpaid cố định của chi tiết bằng trạng thái thực trong snapshot. Không có thao tác hủy/xử lý đơn ở tài khoản.

**File chính:** [Orders.jsx](./src/pages/Orders.jsx), [orderService.js](./src/services/orderService.js), [orderStatus.js](./src/utils/orderStatus.js), [Checkout.css](./src/components/checkout/Checkout.css), [App.jsx](./src/App.jsx), [Profile.jsx](./src/pages/Profile.jsx), [Order.jsx](./src/pages/Order.jsx), [authRoutes.js](./src/utils/authRoutes.js), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt; 13 test catalog/giỏ/auth/đơn đạt. Mở rộng [order-service.test.js](./tests/order-service.test.js) cho guest/rỗng/tài khoản riêng, bỏ qua userId ngoài phiên, snapshot độc lập, thứ tự ngày/ID, giữ đơn đã hủy và lỗi dữ liệu. [auth-service.test.js](./tests/auth-service.test.js) kiểm tra URL quay lại danh sách. [orders-browser.mjs](./tests/orders-browser.mjs) đạt guest → login quay lại, giỏ → checkout → tạo đơn → lịch sử/chi tiết, hồ sơ/danh sách/chi tiết bằng Enter, mới nhất trước, đầy đủ nhãn đơn/thanh toán, nhiều phiên bản/tên dài, reload/làm mới, đọc bị chặn/retry, kho hỏng không mất dữ liệu, customer/admin riêng và hết phiên ẩn đơn. Không lỗi JavaScript hoặc tràn ngang ở 360/640/641/768/833/834/1068/1440px; nút làm mới/chi tiết tối thiểu 44 × 44px. Chạy lại checkout-browser, auth-browser và profile-browser đều đạt.

**Ảnh:** danh sách [1440px](./docs/previews/orders-1440.png), [768px](./docs/previews/orders-768.png), [360px](./docs/previews/orders-360.png); đã xem cả ba bố cục. Ảnh hồ sơ/chi tiết/auth được cập nhật khi chạy lại kiểm tra liên quan.

**Giới hạn/tiếp theo:** đơn vẫn dùng localStorage và phiên giả lập, chưa có quyền RLS hoặc dữ liệu server. Danh sách đọc toàn bộ lịch sử mock nhỏ; chưa có lọc/tìm kiếm/phân trang hoặc tự cập nhật giữa tab, dùng Làm mới để đọc lại. Bổ sung phân trang tại service khi dữ liệu thật tăng và thực thi quyền khi nối BE-4. Khôi phục mật khẩu, giỏ tài khoản, quản trị/xử lý đơn và tích hợp Supabase tiếp tục theo kế hoạch song song; chưa nghiệm thu toàn bộ website. Không commit/push trong đợt này.

### Đợt 033 — 04/10/2026 — Thu gọn thao tác cuối chi tiết đơn

**Nguyên nhân/đã sửa:** khoảng cách giữa Tiếp tục mua sắm và Về hồ sơ bị cộng gap 24px của order-details với margin-top 24px của liên kết trực tiếp trong cart-page-panel. Gom hai thao tác vào order-actions với gap token 8px; liên kết không còn nhận margin của card. Giữ vùng bấm tối thiểu 44px và các khoảng cách giữa nhóm thông tin khác.

**File:** [Order.jsx](./src/pages/Order.jsx), [Checkout.css](./src/components/checkout/Checkout.css).

**Kiểm tra:** lint/build và checkout-browser đạt; xem ảnh chi tiết đơn ở 360/768/1440px, hai thao tác đã gần nhau và không tràn ngang. Ảnh order được cập nhật trong docs/previews. Không bổ sung test/service hoặc dependency cho thay đổi bố cục này.

### Đợt 032 — 04/10/2026 — Làm rõ phản hồi khi kiểm tra đơn không hợp lệ

**Nguyên nhân:** nút Kiểm tra đơn hàng chỉ chạy bước báo giá khi form hợp lệ. Số điện thoại sai hoặc địa chỉ dưới 5 ký tự chặn submit và chỉ báo lỗi cạnh trường, nên người dùng dễ tưởng nút không phản hồi khi đang ở cuối form. COD là lựa chọn đã chọn sẵn, không mở thêm nội dung.

**Đã sửa:** onFinishFailed hiển thị thông báo tổng quát ngay phía trên nút, cuộn tới và focus trường lỗi đầu tiên bằng API Form hiện có. Giữ nguyên validation và bước xác nhận; form hợp lệ vẫn mở Kiểm tra trước khi đặt cùng nút Xác nhận đặt hàng COD. Không thêm dependency.

**File:** [Checkout.jsx](./src/pages/Checkout.jsx), [checkout-browser.mjs](./tests/checkout-browser.mjs), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build và checkout-browser đạt. Kiểm tra bổ sung xác nhận thông báo tổng quát, focus số điện thoại sai và chưa xuất hiện nút xác nhận khi form không hợp lệ; luồng kiểm tra/xác nhận hợp lệ, giá/tồn kho đổi, retry, hết phiên và responsive vẫn đạt. Không chạy lại test service vì không đổi nghiệp vụ dữ liệu.

### Đợt 031 — 04/10/2026 — Xây checkout COD và chi tiết đơn dùng thử

**Mục tiêu:** bổ sung /checkout đang thiếu theo FE_PLAN.md, AGENTS.md, DESIGN.md và hợp đồng đơn trong BE_PLAN.md; tái sử dụng layout/giỏ/auth/Ant Design, không thêm dependency.

**Đã thực hiện:** /cart nối /checkout và /checkout/; khách/hết phiên có bước đăng nhập quay lại, giữ giỏ. Form nhập tên/điện thoại/địa chỉ/phường/tỉnh/ghi chú, chọn COD, hiển thị phí dùng thử 30.000₫ và tổng tiền. Khách kiểm tra địa chỉ/tổng rồi xác nhận; sửa form yêu cầu kiểm tra lại. Có loading/rỗng/lỗi/thử lại, validation cạnh trường, khóa gửi lặp và focus bước kiểm tra. Tiêu đề/card dùng phong cách giỏ/danh mục, không eyebrow; hai cột desktop, một cột dưới 834px, trường địa chỉ xếp dọc dưới 641px. OrderSummary dùng chung checkout/chi tiết.

Order service gộp phiên bản trùng, kiểm tra 1–100 dòng/số lượng nguyên 1–999, địa chỉ và COD; lấy chủ đơn từ phiên, tính lại giá/tồn kho thay vì tin tổng/userId/status đầu vào. Giá đổi trả báo giá mới để xác nhận lại; thiếu hàng chặn tạo đơn. requestId UUID cùng nội dung trả đơn gốc, khác nội dung báo xung đột. /checkout?order=:id khôi phục kết quả đã tạo sau khi luồng điều hướng bị gián đoạn. Đơn/snapshot lưu localStorage; catalog/chi tiết/giỏ trừ lượng từ đơn đã ghi, nên một lần ghi thành công cập nhật cả nguồn đơn và tồn kho dẫn xuất. Web Locks khóa tạo đơn giữa các tab; fallback chỉ tuần tự hóa trong cùng ngữ cảnh JavaScript.

Sau thành công chuyển tới /account/orders/:id, yêu cầu phiên và chỉ đọc đơn của mình; tài khoản khác nhận không tìm thấy. Trang có mã/ngày/trạng thái pending/unpaid, snapshot sản phẩm/giá/phí/địa chỉ và lỗi/thử lại. Giỏ chỉ dọn nếu lựa chọn hiện tại vẫn khớp đơn; thay đổi hoặc lỗi ghi dọn giữ giỏ và có thông báo kiểm tra lại. Lỗi tạo đơn giữ form/giỏ; dữ liệu đơn hỏng không bị thay bằng mảng rỗng. Cập nhật URL quay lại sau login, nội dung dùng thử/quyền riêng tư và hiện trạng FE_PLAN.md.

**File chính:** [Checkout.jsx](./src/pages/Checkout.jsx), [Order.jsx](./src/pages/Order.jsx), [OrderSummary.jsx](./src/components/checkout/OrderSummary.jsx), [Checkout.css](./src/components/checkout/Checkout.css), [orderService.js](./src/services/orderService.js), [orders.js](./src/services/mock/orders.js), [productService.js](./src/services/productService.js), [cartService.js](./src/services/cartService.js), [App.jsx](./src/App.jsx), [authRoutes.js](./src/utils/authRoutes.js), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt; 13 test service catalog/giỏ/auth/đơn đạt. [order-service.test.js](./tests/order-service.test.js) kiểm tra validation, tính lại giá/tổng, thiếu hàng, lỗi ghi không trừ kho, requestId chống trùng/xung đột, snapshot, tài khoản riêng, bỏ qua đầu vào giả, dọn giỏ và bảo toàn dữ liệu hỏng. [checkout-browser.mjs](./tests/checkout-browser.mjs) đạt giỏ → login quay lại → kiểm tra → COD → chi tiết/reload, giỏ rỗng, chỉnh form/validation, giá đổi, thiếu hàng, retry cùng ID, khôi phục kết quả, hết phiên, lỗi lưu đơn/dọn giỏ, giỏ đổi và hai tab cạnh tranh tồn kho. Chạy lại cart-browser, auth-browser và profile-browser đều đạt. Không có lỗi JavaScript trong các luồng kiểm tra; không tràn ngang ở 360/640/641/768/833/834/1068/1440px, nút kiểm tra/xác nhận tối thiểu 44 × 44px. Đã xem ảnh desktop/tablet/mobile.

**Ảnh:** checkout [1440px](./docs/previews/checkout-1440.png), [768px](./docs/previews/checkout-768.png), [360px](./docs/previews/checkout-360.png); chi tiết đơn [1440px](./docs/previews/order-1440.png), [768px](./docs/previews/order-768.png), [360px](./docs/previews/order-360.png).

**Giới hạn/tiếp theo:** đơn/tồn kho và quyền đều giả lập trong trình duyệt; chỉ nhập thông tin minh họa, chưa gửi đơn/thu tiền/giao hàng thật. Lưu trữ có thể sửa/xóa, Web Locks không thay thế giao dịch DB; nối RPC nguyên tử/RLS ở BE-4 theo BE_PLAN.md. Chưa có lịch sử/xử lý đơn, khôi phục mật khẩu, giỏ theo tài khoản hoặc admin; tiếp tục FE và BE song song. Chưa nghiệm thu toàn bộ website. Không commit/push trong đợt xây trang này.

### Đợt 030 — 01/10/2026 — Lập kế hoạch database và tích hợp Supabase

**Mục tiêu:** đọc hiện trạng FE, lập kế hoạch backend để tích hợp dần song song với việc xây FE theo yêu cầu mới.

**Đã thực hiện:** tạo BE_PLAN.md với schema catalog/phiên bản, profiles/quyền admin, giỏ theo tài khoản, đơn COD/snapshot và lịch sử kho/trạng thái; quy định PK/FK/check/index, RLS/grants, RPC nguyên tử, chống đơn/merge trùng và hoàn kho đúng một lần. Ghi điểm thay service, đặc biệt cartService đang tra variant mock đồng bộ; lộ trình BE-0 đến BE-6, migration/seed, Auth/Storage và checklist nghiệm thu. Cập nhật FE_PLAN để bỏ yêu cầu chờ toàn bộ FE hoàn tất trước BE, giữ nguyên các phần chức năng chưa triển khai và checklist chưa đạt.

**File:** [BE_PLAN.md](./BE_PLAN.md), [FE_PLAN.md](./FE_PLAN.md), [PROGRESS.md](./PROGRESS.md).

**Kiểm tra:** đối chiếu kế hoạch với router, package.json, productService/catalog mock, cartService, authService và cách chi tiết dùng ảnh/nhận xét. Rà tài liệu Supabase hiện hành về RLS, functions, Storage và changelog; kiểm tra diff, liên kết file nội bộ và nội dung phân biệt kế hoạch/triển khai. Không chạy lint/build/test UI vì chỉ thay Markdown; chưa kiểm thử SQL, quyền hoặc giao dịch thật.

**Giới hạn/tiếp theo:** chưa kiểm kê project Supabase từ xa, chưa tạo migration/schema, cài SDK hay thay service. Bước đầu là xác minh môi trường dev và tích hợp catalog thật cùng truy vấn variant cho giỏ; tiếp theo Auth/hồ sơ. Checkout/đơn/admin tiếp tục xây FE cùng từng đợt BE, chưa nghiệm thu toàn bộ website.

### Đợt 029 — 01/10/2026 — Xây trang hồ sơ tài khoản

**Mục tiêu:** bổ sung hồ sơ /account theo FE_PLAN.md và thay cửa sổ thông tin tài khoản bằng trang xem/sửa thông tin, giữ thiết kế chung.

**Đã thực hiện:** thêm Profile tại /account và /account/, dùng ShopLayout/useAuth cùng CSS auth hiện có. Tiêu đề card trắng/dấu chấm xanh không có eyebrow; desktop hai cột tỷ lệ 2:1, dưới 834px xếp dọc. Form Ant Design có họ tên, email chỉ đọc, điện thoại không bắt buộc, validation, lưu/thông báo thành công/lỗi và khóa gửi lặp. Có liên kết giỏ hàng, tiếp tục mua sắm và đăng xuất; loading/lỗi/thử lại, chưa đăng nhập/hết phiên không hiển thị form hồ sơ. Header/Footer/menu mobile tới /account khi đã đăng nhập; khách tới login với next=/account. Trang login khi đã đăng nhập có liên kết Xem hồ sơ. Form và trạng thái hồ sơ là phần mở rộng theo Known Gaps của DESIGN.md.

Auth service bổ sung updateProfile cho phiên hiện tại, lưu họ tên/phone trong sessionStorage riêng theo email, hỗ trợ tài khoản đăng ký và fixture customer/admin. Dữ liệu cũ không có phone vẫn dùng được. Không đổi email/id/role qua input, không gia hạn phiên khi lưu; chỉ thông báo cập nhật Header sau khi ghi thành công. Lỗi ghi giữ hồ sơ cũ và nội dung form, hết phiên không được lưu. Cập nhật next hợp lệ cho /account, nội dung tài khoản và FE_PLAN.md. Không thêm dependency.

**File chính:** [Profile.jsx](./src/pages/Profile.jsx), [Auth.css](./src/components/auth/Auth.css), [authService.js](./src/services/authService.js), [authRoutes.js](./src/utils/authRoutes.js), [ShopLayout.jsx](./src/layouts/ShopLayout.jsx), [Auth.jsx](./src/pages/Auth.jsx), [App.jsx](./src/App.jsx), [shopInfo.js](./src/assets/shopInfo.js), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt; 12 test service auth/giỏ/catalog đạt. Test auth mở rộng gồm guest/hết phiên, name/phone sai, cập nhật fixture/tài khoản mới, tương thích hồ sơ cũ, đăng xuất/đăng nhập lại, tách tài khoản, bỏ qua email/id/role giả, giữ expiresAt và lỗi ghi không sửa dữ liệu/không phát thông báo thành công. [profile-browser.mjs](./tests/profile-browser.mjs), [auth-browser.mjs](./tests/auth-browser.mjs) và [cart-browser.mjs](./tests/cart-browser.mjs) đều đạt. Đã thử guest → login → hồ sơ, sửa/lưu bằng Enter/reload/tên Header, Header/Footer/menu mobile, email chỉ đọc, customer/admin riêng, lỗi đọc/thử lại, lỗi ghi giữ bản nháp rồi lưu lại, hết phiên chặn lưu và giữ giỏ. Modal quyền riêng tư vẫn đóng bằng Escape và trả focus. Không có lỗi JavaScript hoặc tràn ngang ở 360/640/641/768/833/834/1068/1440px; nút lưu/đăng xuất tối thiểu 44 × 44px, đã xem desktop/tablet/mobile.

**Ảnh:** [Desktop 1440px](./docs/previews/profile-1440.png), [Tablet 768px](./docs/previews/profile-768.png), [Mobile 360px](./docs/previews/profile-360.png). Ảnh auth/giỏ được cập nhật khi chạy kiểm tra lại.

**Giới hạn/tiếp theo:** hồ sơ và phiên vẫn giả lập trong tab, chưa lưu server; chỉ dùng thông tin minh họa. Email không chỉnh sửa tại hồ sơ; đổi email/mật khẩu và dữ liệu bền vững xử lý khi tích hợp Auth thật. Checkout, lịch sử đơn hàng, khôi phục mật khẩu và admin vẫn theo kế hoạch, chưa nghiệm thu toàn bộ FE.

### Đợt 028 — 01/10/2026 — Xây trang đăng nhập và đăng ký

**Mục tiêu:** triển khai /login và /register theo FE_PLAN.md, AGENTS.md và DESIGN.md bằng xác thực giả lập, dùng Ant Design hiện có.

**Đã thực hiện:** Auth dùng chung bố cục/form cho hai route, hỗ trợ dấu / cuối; tiêu đề card trắng, dấu chấm xanh, không có eyebrow như danh mục/giỏ. Form có label, kiểm tra email/họ tên/mật khẩu nhập lại, báo email trùng và thông tin đăng nhập sai, hiện/ẩn mật khẩu bằng bàn phím, khóa gửi lặp và trạng thái xử lý. Đăng ký có màn hình chờ xác minh và nút mô phỏng; sau khi rời trang/reload, đăng nhập email chưa xác minh mở lại bước này. Trang đã đăng nhập có thông tin phiên, tiếp tục mua sắm và đăng xuất. Trạng thái loading/lỗi/retry và form là phần mở rộng theo Known Gaps của thiết kế.

Auth service/hook quản lý fixture customer/admin và tài khoản minh họa mới, chỉ giữ hồ sơ/trạng thái xác minh/phiên trong sessionStorage, không lưu mật khẩu/hash. Phiên 1 giờ có theo dõi hết hạn/focus và lỗi lưu trữ. Header/Footer nối đăng nhập hoặc thông tin phiên/đăng xuất; next chỉ nhận route cửa hàng đang có và cùng nguồn, mặc định /cart. Giỏ khách trong localStorage không mất khi đăng nhập/đăng xuất. Cập nhật nội dung quyền riêng tư và hiện trạng/thứ tự tiếp theo trong FE_PLAN.md. Không thêm dependency.

**File chính:** [Auth.jsx](./src/pages/Auth.jsx), [Auth.css](./src/components/auth/Auth.css), [authService.js](./src/services/authService.js), [useAuth.js](./src/hooks/useAuth.js), [authRoutes.js](./src/utils/authRoutes.js), [App.jsx](./src/App.jsx), [Header.jsx](./src/components/header/Header.jsx), [ShopLayout.jsx](./src/layouts/ShopLayout.jsx), [shopInfo.js](./src/assets/shopInfo.js), [FE_PLAN.md](./FE_PLAN.md).

**Kiểm tra:** lint/build đạt; 12 test service auth/giỏ/catalog đạt, gồm credential/validation, đăng ký/chờ xác minh, vai trò fixture/customer, hết phiên, dữ liệu lưu hỏng/sai kiểu, URL quay lại an toàn và không lưu mật khẩu. [auth-browser.mjs](./tests/auth-browser.mjs) đạt validation, email trùng, khôi phục xác minh sau reload, đăng nhập/giữ phiên/đăng xuất, next hợp lệ/không hợp lệ và giữ giỏ. Lỗi đọc phiên có thử lại; lỗi ghi giữ nội dung form và giỏ. Icon hiện mật khẩu dùng Enter và vùng chạm tối thiểu 44px; Escape đóng Modal tài khoản và trả focus. Không có lỗi JavaScript hoặc tràn ngang ở 360/640/641/768/833/834/1068/1440px; đã xem cả hai trang ở desktop/tablet/mobile. Chạy lại [cart-browser.mjs](./tests/cart-browser.mjs) đạt để kiểm tra thay đổi Header/ShopLayout không làm hỏng giỏ. Test service mới ở [auth-service.test.js](./tests/auth-service.test.js).

**Ảnh:** đăng nhập [1440px](./docs/previews/login-1440.png), [768px](./docs/previews/login-768.png), [360px](./docs/previews/login-360.png); đăng ký [1440px](./docs/previews/register-1440.png), [768px](./docs/previews/register-768.png), [360px](./docs/previews/register-360.png). Ảnh giỏ được cập nhật khi chạy kiểm tra lại.

**Giới hạn/tiếp theo:** tài khoản và xác minh email chỉ mô phỏng, sử dụng mật khẩu dùng thử chung hiển thị trên trang; không dùng thông tin cá nhân thật. Tài khoản mới chỉ tồn tại trong tab; giỏ vẫn là giỏ khách dùng chung trên trình duyệt. Chưa có khôi phục mật khẩu, hồ sơ, checkout, giỏ theo tài khoản hoặc guard admin; thêm khi triển khai các trang tương ứng. Chưa nghiệm thu toàn bộ FE hoặc tích hợp Supabase.

### Đợt 027 — 01/10/2026 — Lưu bản hiện tại lên nhánh main

**Mục tiêu:** commit và đẩy bản hiện tại lên nhánh main của repository riêng tư [Chanh-Man](https://github.com/ManhNguyenNe/Chanh-Man).

**Nội dung bản lưu:** cập nhật FE_PLAN.md và nhật ký; trang /cart, service/hook giỏ, test và ảnh kiểm tra; các chỉnh sửa chính sách/Modal ảnh sản phẩm đã ghi ở đợt 021–022. Không đổi nhánh.

**Kiểm tra trước khi đẩy:** main trên GitHub và local cùng commit 6eb7f94; rà các file thay đổi và mẫu khóa bí mật thông dụng, không tìm thấy chuỗi khớp. Lint/build gần nhất đạt ở đợt 026; kiểm tra toàn bộ giỏ ở đợt 025 đạt. Không chạy lại các kiểm tra này vì không sửa mã nguồn trong đợt lưu bản.

**Bàn giao:** kết quả push và đối chiếu commit local/GitHub được xác minh sau khi commit, báo trong phiên bàn giao; mục này không tự xác nhận push đã thành công.

### Đợt 026 — 01/10/2026 — Bỏ eyebrow ở tiêu đề giỏ hàng

**Đã thực hiện:** bỏ dòng Lựa chọn của bạn khỏi cart-page-heading; xóa CSS eyebrow không còn dùng và bỏ margin phía trên h1, giữ khoảng cách dưới tiêu đề 8px như category-intro.

**File:** [Cart.jsx](./src/pages/Cart.jsx), [CartPage.css](./src/components/cart/CartPage.css).

**Kiểm tra:** lint/build đạt. Trình duyệt xác nhận không còn eyebrow, tiêu đề/mô tả còn hiển thị, h1 có margin-top 0 và không tràn ngang tại 360/640/641/768/1440px. Đã xem ảnh [desktop](./docs/previews/cart-heading-1440.png), [tablet](./docs/previews/cart-heading-768.png), [mobile](./docs/previews/cart-heading-360.png). Không chạy lại test service hoặc toàn bộ luồng giỏ vì chỉ thay nội dung tiêu đề và khoảng cách.

### Đợt 025 — 01/10/2026 — Đồng bộ giao diện giỏ hàng

**Mục tiêu:** chỉnh những khác biệt thị giác giữa /cart và trang danh mục/chi tiết theo DESIGN.md.

**Đã thực hiện:** breadcrumb về 14px, padding đầu trang về 24px; tiêu đề đặt trong card trắng bo 18px, dấu chấm/eyebrow xanh và khoảng cách dùng token chung. Card giỏ/tóm tắt dùng padding 24px desktop, 17px mobile; giảm khoảng đệm cuối trang mobile về 48px. Đơn giá và thành tiền tăng lên 17px. Nút Xóa dùng chung giữa trang giỏ/Drawer có vùng chạm tối thiểu 44 × 44px. Bỏ khai báo flex-wrap trùng; không thay luồng giỏ hoặc dữ liệu.

**File:** [CartPage.css](./src/components/cart/CartPage.css), [CartDrawer.css](./src/components/cart/CartDrawer.css), [Cart.jsx](./src/pages/Cart.jsx), [cart-browser.mjs](./tests/cart-browser.mjs).

**Kiểm tra:** lint/build đạt; test trình duyệt giỏ hiện có đạt, bổ sung kiểm tra kích thước nút Xóa trên trang và Drawer. Không tràn ngang tại 360/640/641/768/833/834/1068/1440px; đổi số lượng, tổng tiền, reload, đồng bộ Header/Drawer, xóa bằng Enter, Escape, giỏ rỗng, lỗi lưu và cảnh báo tồn kho vẫn đạt. Đã xem ảnh [desktop 1440px](./docs/previews/cart-1440.png), [tablet 768px](./docs/previews/cart-768.png), [mobile 360px](./docs/previews/cart-360.png). Không chạy lại test service vì chỉ sửa JSX trình bày và CSS.

**Giới hạn:** xác nhận vùng chạm nút Xóa sau chỉnh sửa; ghi nhận 44px ở đợt 024 chưa phản ánh chiều rộng thực tế trước đó. Checkout vẫn chưa triển khai theo kế hoạch; chưa nghiệm thu toàn bộ FE.

### Đợt 024 — 01/10/2026 — Xây trang giỏ hàng

**Mục tiêu:** hoàn thiện /cart theo FE_PLAN.md, tái sử dụng giỏ hiện có và token DESIGN.md.

**Đã thực hiện:** thêm /cart và /cart/ vào điều hướng hiện tại; breadcrumb, danh sách phiên bản, liên kết sản phẩm, đơn giá/thành tiền, điều chỉnh số lượng, xóa và tóm tắt. Tách CartItems để Drawer/trang dùng chung thao tác; ShopLayout cung cấp cùng useCart cho Header/Drawer/trang. Drawer có liên kết Xem giỏ hàng. Thêm loading/error/retry ở hook; khóa thao tác đang xử lý, lỗi lưu giữ nguyên giỏ. Service trả productId và thông báo giảm số lượng/bỏ phiên bản hết hàng khi đọc. Desktop hai cột, dưới 834px một cột, dưới 641px thu ảnh/padding; vùng chạm tối thiểu 44px. Trạng thái giỏ/loading/error là phần mở rộng theo Known Gaps. Cập nhật FE_PLAN.md theo phần đã hoàn thành.

**File chính:** [Cart.jsx](./src/pages/Cart.jsx), [components/cart](./src/components/cart/), [useCart.js](./src/hooks/useCart.js), [cartService.js](./src/services/cartService.js), [ShopLayout.jsx](./src/layouts/ShopLayout.jsx), [App.jsx](./src/App.jsx).

**Kiểm tra:** lint/build đạt; 11 test catalog/giỏ đạt, gồm tách/gộp phiên bản, tính tiền, số lượng sai, hết hàng, lưu lỗi không mất dữ liệu, dữ liệu hỏng và điều chỉnh tồn kho. Playwright đạt giỏ rỗng, đổi số lượng/tổng tiền, reload, đồng bộ Header/Drawer, điều hướng sản phẩm → Drawer → /cart, xóa bằng Enter, Escape đóng Drawer, lỗi lưu và cảnh báo tồn kho. Không lỗi JavaScript hoặc tràn ngang ở 360/640/641/768/833/834/1068/1440px. Đã xem ảnh desktop/mobile: [1440px](./docs/previews/cart-1440.png), [768px](./docs/previews/cart-768.png), [360px](./docs/previews/cart-360.png). Test lưu tại [cart-service.test.js](./tests/cart-service.test.js), [cart-browser.mjs](./tests/cart-browser.mjs).

**Giới hạn:** nút Tiếp tục đặt hàng disabled và giải thích vì checkout/auth chưa có; không tạo route checkout giả. Giá lấy từ catalog hiện tại, chưa có so sánh giá lúc thêm giỏ hoặc báo giá đặt hàng. Chưa nghiệm thu toàn bộ FE; tiếp tục tài khoản/checkout theo kế hoạch. Không thêm dependency.

### Đợt 023 — 01/10/2026 — Đồng bộ kế hoạch FE với mã nguồn

**Mục tiêu:** cập nhật kế hoạch theo FE hiện tại, phân biệt chức năng đã triển khai với phần cần làm tiếp.

**Đã thực hiện:** cập nhật hiện trạng các giai đoạn và từng route; dùng URL /san-pham/:id cùng các trang danh mục hiện có. Ghi nhận ShopLayout, Ant Design, Xem thêm theo nhóm 20, service catalog/giỏ và giới hạn của tài khoản, đặt mua, nhận xét dùng thử. Phân biệt hợp đồng service/dữ liệu hiện có với mô hình mục tiêu; bổ sung thứ tự hoàn thiện mua hàng, admin và nghiệm thu. Giữ checklist chưa nghiệm thu; ghi trang liên hệ/chính sách riêng là đề xuất bổ sung.

**File:** [FE_PLAN.md](./FE_PLAN.md), [PROGRESS.md](./PROGRESS.md).

**Kiểm tra:** đối chiếu router hiện tại, danh sách page, package.json, hook/service, dữ liệu mẫu, test catalog và nhật ký các đợt trước; rà diff tài liệu. Không chạy lại lint/build hoặc kiểm tra trình duyệt vì chỉ sửa Markdown. Giữ nguyên các thay đổi mã nguồn và ảnh xem trước đã có trong workspace.

**Còn lại:** chưa triển khai thêm page hoặc chức năng; tiếp tục theo thứ tự trong FE_PLAN.md. Các kết quả kiểm tra giao diện ở đợt trước là lịch sử, không phải nghiệm thu mới.

### Đợt 022 — 30/09/2026 — Thống nhất cửa sổ xem ảnh

**Đã thực hiện:** Modal ảnh căn giữa, khung tối đa 960 × 720px và tự thu theo viewport, chừa 16px mỗi cạnh. Chiều cao không phụ thuộc ảnh; ảnh dùng object-fit contain trong phần thân co giãn, giữ tỷ lệ và không cắt ảnh. Header riêng, tiêu đề dài có ellipsis, nút đóng tối thiểu 44px. Dùng classNames semantic của Ant Design, chỉ tác động Modal ảnh.

**File:** [ProductDetails.jsx](./src/components/products/ProductDetails.jsx), [ProductDetails.css](./src/components/products/ProductDetails.css).

**Kiểm tra:** lint/build đạt. Playwright mở lần lượt hai ảnh iPhone có tỷ lệ khác nhau: kích thước Modal không đổi ở 1440×900, 834×800, 360×640 và 844×390; toàn bộ khung/ảnh trong viewport, không có nội dung tràn dọc; Escape đóng được. Đã xem ảnh desktop/mobile/ngang: [Desktop](./docs/previews/image-modal-1440.png), [Mobile](./docs/previews/image-modal-360.png), [Màn hình ngang](./docs/previews/image-modal-844.png). Không thay logic dữ liệu.


### Đợt 021 — 30/09/2026 — Chính sách trải ngang khối thông tin

**Đã thực hiện:** cho pdp-policies chiếm toàn bộ hai cột gallery; chia bốn nút thành bốn cột bằng nhau trên desktop. Dưới 834px còn hai cột, dưới 641px một cột, giữ vùng chạm 44px và token hiện có.

**File:** [ProductDetails.css](./src/components/products/ProductDetails.css).

**Kiểm tra:** lint/build đạt. Playwright xác nhận số hàng đúng ở 1440/834/833/640/360px, không tràn ngang, Enter mở chính sách bảo hành. Đã xem ảnh desktop/mobile: [Desktop](./docs/previews/policies-horizontal-1440.png), [Mobile](./docs/previews/policies-horizontal-360.png). Khởi động lại Vite do server cũ đã dừng; không thay logic dữ liệu.


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
