# Database Chanh&Man

Khởi tạo ngày **14/10/2026**, cập nhật **17/10/2026** theo [BE_PLAN.md](../BE_PLAN.md): đã triển khai cấu trúc catalog BE-1, hồ sơ/quyền admin BE-2, giỏ tài khoản BE-3 và database/RPC đơn hàng, kho BE-4. Project Supabase dev: **manhngynne**, ref **`dnnsfxgtngvkrvvzjovp`**. FE vẫn dùng mock, chưa tích hợp database hoặc Auth thật.

Database đã có **13/13 bảng ứng dụng**: bốn bảng catalog, hai bảng hồ sơ/quyền, hai bảng giỏ/receipt và năm bảng đơn/kho/cấu hình. Đã xóa `public.tasks` (1 dòng) và `public.products_legacy` (3 dòng) theo yêu cầu trực tiếp của người dùng vì nằm ngoài Plan. Không tính `auth.users` và các bảng hệ thống do Supabase quản lý; các bảng hệ thống không thuộc phạm vi xóa.

## Bảng và quan hệ

| Bảng | Trường |
|---|---|
| `categories` | `id`, `slug`, `name`, `caption`, `image_url`, `icon`, `sort_order`, `active` |
| `brands` | `id`, `slug`, `name`, `active` |
| `products` | `id`, `slug`, `category_id`, `brand_id`, `name`, `description`, `badge`, `image_url`, `images`, `specs`, `specifications`, `needs`, `colors`, `promotion`, `status`, `sort_order` |
| `product_variants` | `id`, `product_id`, `sku`, `label`, `options`, `price`, `compare_at_price`, `stock`, `image_url`, `active`, `sort_order` |
| `profiles` | `id uuid`, `display_name`, `phone`, `created_at`, `updated_at` |
| `private.admin_users` | `user_id uuid`, `created_at` |
| `cart_items` | `user_id uuid`, `variant_id text`, `quantity`, `created_at`, `updated_at`; PK `(user_id, variant_id)` |
| `private.cart_merge_requests` | `user_id uuid`, `request_id uuid`, `payload jsonb`, `created_at`; PK `(user_id, request_id)` |
| `orders` | `id uuid`, `code`, `user_id`, `request_id`, `request_payload`, `shipping_address`, `subtotal`, `shipping_fee`, `total`, `currency`, `payment_method`, `payment_status`, `status`, timestamps; UNIQUE `(user_id, request_id)` |
| `order_items` | `id uuid`, `order_id`, `variant_id`, snapshot `sku`, `product_name`, `variant_label`, `image_url`, `unit_price`, `quantity`; UNIQUE `(order_id, variant_id)` |
| `order_status_history` | `id uuid`, `order_id`, `from_status`, `to_status`, `actor_id`, `note`, `created_at` |
| `inventory_movements` | `id uuid`, `variant_id`, `order_id`, `actor_id`, `quantity_delta`, `reason`, `note`, `created_at` |
| `private.shop_settings` | `id = 1`, `shipping_fee`, `updated_at` |

Cả bốn bảng catalog có `created_at` và `updated_at` kiểu `timestamptz`. ID là `text` ổn định, giữ các ID đang dùng trên FE và giỏ khách. Trigger chặn thay đổi ID, giữ `created_at` và cập nhật `updated_at` khi sửa dòng. Variant không được đổi `product_id`.

Mỗi product tham chiếu một category và một brand; mỗi variant tham chiếu một product. FK dùng `ON DELETE RESTRICT`. Category/brand có thể chưa được chọn ở draft nhưng phải có trước khi product chuyển sang `active`. Các slug, tên brand và SKU có ràng buộc UNIQUE tương ứng.

`products.status` nhận `draft`, `active`, `archived`. Product active phải có tên, ảnh chính, category, brand và ít nhất một variant active. Trigger kiểm tra điều kiện variant tại cuối transaction, cho phép tạo product cùng các variant trong một lần ghi. Thao tác thay đổi khả dụng của variant khóa product cha để bảo vệ điều kiện này khi ghi đồng thời. Variant stock bằng 0 vẫn có thể active và hiển thị.

Giá VND dùng `numeric(15,0)`: `price > 0` và không vượt `999999999999999`; `compare_at_price` có thể NULL, nếu có phải nằm từ price đến giới hạn đó. Giới hạn trên cũng loại giá trị `NaN`. Stock là integer không âm. PostgreSQL có thể làm tròn tiền thập phân khi cast sang `numeric(15,0)`; RPC ghi catalog ở đợt admin phải kiểm tra đầu vào là số nguyên trước khi cast. Chưa có RPC ghi catalog cho client.

`images` là mảng JSON URL có thứ tự; `specs` là mảng chuỗi; `specifications` là mảng object; `options` là object cấu hình variant. Database kiểm tra kiểu và giới hạn kích thước. Seed chưa có thông số chi tiết nên `specifications = []`. `needs` nhận các mã `study`, `work`, `game`, `creative`, `upgrade`; `colors` giữ tên màu tiếng Việt của FE. Ảnh variant NULL dùng ảnh product tại lớp service khi tích hợp.

### Hồ sơ và quyền admin — BE-2

`profiles.id` và `private.admin_users.user_id` là khóa chính UUID, cùng tham chiếu `auth.users(id)` với `ON DELETE CASCADE`. Không sao chép email, mật khẩu hoặc trạng thái xác minh từ Auth vào hồ sơ. `display_name` bắt buộc, được loại khoảng trắng đầu/cuối theo lớp POSIX `[[:space:]]` rồi kiểm tra độ dài 2–80 ký tự. `phone` có thể NULL; nếu có phải gồm 8–15 chữ số, cho phép dấu `+` đầu. Trigger giữ ID và `created_at` khi cập nhật, tự đặt `updated_at`.

Trigger `chanhman_auth_user_created` tạo profile khi Auth tạo user. Hàm nội bộ chỉ lấy trường metadata `display_name` nếu đó là chuỗi hợp lệ sau khi trim; thiếu, sai kiểu hoặc sai độ dài dùng tên **Khách hàng**. Backfill bổ sung hồ sơ còn thiếu cho tài khoản có sẵn, không ghi đè hồ sơ đã tồn tại. Không lấy role từ metadata hoặc dữ liệu client.

Có dòng trong `private.admin_users` nghĩa là user có quyền admin. `private.is_admin()` kiểm tra trực tiếp `auth.uid()` và bảng quyền trong mỗi lần gọi; cấp hoặc thu hồi quyền có hiệu lực ở truy vấn tiếp theo mà không chờ JWT đổi role. Admin chỉ được cấp qua quản trị database hoặc `service_role` đáng tin cậy; không có API tự nâng quyền. Chưa cấp tài khoản admin sử dụng thật; fixture kiểm tra được dọn hoặc rollback.

### Giỏ tài khoản — BE-3

`cart_items` lưu số lượng theo `(user_id, variant_id)`, không lưu giá, tên hoặc tổng tiền. `user_id` tham chiếu `auth.users(id)` với `ON DELETE CASCADE`; `variant_id` tham chiếu `product_variants(id)` với `ON DELETE RESTRICT` và có index riêng cho FK. Quantity là integer từ 1 đến 999. Trigger chặn đổi chủ giỏ/variant, giữ `created_at` và cập nhật `updated_at`. Giỏ không giữ hàng và không thay đổi stock.

`private.cart_merge_requests` lưu payload đã chuẩn hóa cho mỗi `(user_id, request_id)` để hợp nhất giỏ khách có thể retry mà không cộng hai lần. `user_id` có FK tới Auth với `ON DELETE CASCADE`. Payload là mảng tối đa 100 dòng, được gộp các variant trùng, chuẩn hóa quantity và sắp theo variant ID; receipt và thay đổi giỏ được ghi trong cùng transaction. Xóa user Auth sẽ xóa giỏ và receipts của user đó.

`public.get_my_cart()` dùng `SECURITY INVOKER`, yêu cầu `auth.uid()` hợp lệ, trả `{items, count, total, notices}`. Item có `variantId`, `quantity`, `productId`, `name`, `image`, `label`, `price`, `stock`, `available`; ảnh variant thiếu thì dùng ảnh product. RPC luôn lọc chủ giỏ và kiểm tra variant/product/category/brand đang bán, kể cả khi admin gọi hoặc khi được gọi từ hàm merge đặc quyền. Variant bị ẩn được giữ trong giỏ nhưng trả metadata/price là NULL, stock là 0 và `available = false`; variant hết hàng hoặc dòng vượt stock cũng được giữ, kèm notice để khách điều chỉnh.

`count` cộng toàn bộ quantity đang lưu, kể cả dòng không khả dụng. `total` chỉ cộng giá hiện tại × quantity của những dòng khả dụng đầy đủ; dòng vượt tồn kho không được cộng một phần vào total. Notice đọc giỏ dùng `UNAVAILABLE`, `OUT_OF_STOCK` hoặc `STOCK_CHANGED`. Nếu count/total vượt `9007199254740991`, RPC báo SQLSTATE `22003` thay vì trả số JavaScript có thể mất chính xác. Đọc giỏ không tự xóa hoặc giảm quantity.

`public.merge_guest_cart(p_request_id uuid, p_items jsonb)` là wrapper `SECURITY INVOKER` gọi helper `private.merge_guest_cart()` dùng `SECURITY DEFINER`, `search_path` rỗng và kiểm tra `auth.uid()` trong body. RPC chỉ nhận request ID cùng mảng object `{variantId, quantity}`; từ chối key thừa như giá hoặc chủ giỏ, sai kiểu/ID, quantity âm/lẻ/chuỗi hoặc ngoài 1–999. Giới hạn 100 dòng đầu vào và 32 KB; gộp variant trùng rồi kiểm tra tổng quantity của mỗi variant không vượt 999. Mảng rỗng hợp lệ và vẫn ghi receipt khi commit.

Merge mới cộng quantity bằng UPSERT nguyên tử, theo thứ tự variant ID, giới hạn kết quả theo snapshot stock hiện tại và 999. Variant không tồn tại, bị ẩn hoặc hết hàng không được thêm từ giỏ khách, kèm `MERGE_SKIPPED`; dòng đã có thuộc variant bị ẩn/hết hàng vẫn được giữ. Với variant còn bán, nếu lượng đang lưu đã vượt stock thì merge cũng giảm kết quả về giới hạn đó. Khi chạm giới hạn stock/999 có `MERGE_LIMIT_REACHED`, kể cả khi vừa bằng giới hạn mà không phải giảm lượng. Kết quả thêm `requestId`, `replayed` vào hợp đồng đọc giỏ. Đây là đối chiếu snapshot, không khóa/giữ stock; dữ liệu catalog có thể thay đổi ngay sau khi đọc.

Cùng request ID và payload chuẩn hóa trả `replayed = true` cùng **giỏ hiện tại**, không cộng lại dù catalog hoặc giỏ đã được sửa sau lần đầu. Cùng ID nhưng payload chuẩn hóa khác bị từ chối với SQLSTATE `22023`, thông điệp `REQUEST_ID_REUSED`. Notice riêng của lần merge mới chỉ nằm trong phản hồi đầu; retry trả notice đọc giỏ hiện tại, không lưu/phát lại phản hồi cũ. Lỗi bất kỳ, gồm tổng tiền vượt giới hạn, rollback cả receipt và thay đổi giỏ.

### Đơn hàng và kho — BE-4

`orders.code` do sequence riêng sinh dạng `CM-<số>`; sequence có thể có khoảng trống sau transaction rollback. Chủ đơn tham chiếu Auth với `ON DELETE RESTRICT`. Dòng hàng và lịch sử giữ quan hệ tới đơn bằng FK `RESTRICT`; variant đã có dòng hàng/ledger cũng không bị xóa. `actor_id` trong lịch sử/ledger dùng `ON DELETE SET NULL`. Snapshot đơn và dòng hàng giữ tên, SKU, nhãn, ảnh, giá và địa chỉ lúc mua, không thay đổi theo catalog/hồ sơ. Trigger chặn sửa snapshot trong `orders` và tự cập nhật `updated_at` khi đổi trạng thái.

Tiền dùng VND nguyên, `numeric(15,0)`, hữu hạn và không vượt **999999999999999**; `total = subtotal + shipping_fee`. Phí cố định khởi tạo **30.000 VND** trong dòng `private.shop_settings(id=1)`, chỉ được thay qua quản trị database đáng tin cậy ở giai đoạn này. Kho khả dụng nằm ở `product_variants.stock`; ledger ghi mọi thay đổi kho của RPC trong cùng transaction. Migration ghi `initial` cho tồn kho dương hiện có. Unique partial `(order_id, variant_id, reason)` với reason `order/cancel` ngăn ghi trừ hoặc hoàn hai lần; quantity delta không được bằng 0.

Các RPC trong schema `public`:

| Chữ ký | Kết quả và quyền |
|---|---|
| `quote_order(p_items jsonb, p_shipping_address jsonb default null, p_payment_method text default 'cod')` | Authenticated; báo giá hiện tại, không giữ hàng hoặc ghi đơn. |
| `create_order(p_request_id uuid, p_items jsonb, p_shipping_address jsonb, p_quote_fingerprint text, p_payment_method text default 'cod')` | Người mua đã xác minh email; trả chi tiết đơn cùng `replayed`. |
| `get_order(p_order_id uuid)` | Chủ đơn hoặc admin đọc chi tiết; người khác nhận `NOT_FOUND`. |
| `set_order_status(p_order_id uuid, p_status text, p_note text default null)` | Chỉ admin; trả chi tiết đơn sau chuyển trạng thái. |
| `adjust_stock(p_variant_id text, p_target_stock integer, p_expected_stock integer, p_note text)` | Chỉ admin; trả `{variantId, stock}`. |

Đầu vào items là 1–100 object `{variantId, quantity}`, tối đa 32 KB, không nhận key thừa như giá/chủ đơn. ID theo regex catalog; quantity phải là số JSON nguyên 1–999. Gộp variant trùng, kiểm tra lượng gộp không vượt 999 rồi sắp ID theo collation `C`. Số `1.0` chuẩn hóa thành `1`. Địa chỉ tối đa 8 KB, chỉ nhận `{recipientName, phone, addressLine, ward?, province, note?}`; trim khoảng trắng theo POSIX. Tên cần 2–80 ký tự, địa chỉ 5–240, tỉnh/thành 2–80; ward tối đa 80, note tối đa 500; điện thoại 8–15 chữ số và có thể có dấu `+` đầu. Quote cho phép bỏ địa chỉ; create bắt buộc địa chỉ hợp lệ. Khi nối service FE, ánh xạ **`fullName → recipientName`, `street → addressLine`, `city → province`**; đây chưa phải thay đổi đã thực hiện ở FE.

Quote trả `{items, subtotal, shippingFee, total, currency, paymentMethod, shippingAddress, issues, fingerprint}`. Mỗi item có `{variantId, quantity, productId, sku, productName, variantLabel, image, unitPrice, stock}`; `issues` có `{variantId, code}` với `UNAVAILABLE` hoặc `OUT_OF_STOCK`. Dòng không còn bán không lộ metadata. Fingerprint 32 ký tự hex được tính từ danh sách, lượng, giá, phí, tiền tệ và phương thức thanh toán; đây là dấu đối chiếu, không trao quyền quyết định giá cho client. Create luôn tính lại; `PRICE_CHANGED` hoặc `OUT_OF_STOCK` đính kèm quote hiện tại trong error detail khi báo giá lại được tính. Trường hợp thiếu variant ngay tại bước khóa bị từ chối trước khi tính quote.

Chi tiết đơn trả `{id, code, userId, requestId, shippingAddress, subtotal, shippingFee, total, currency, paymentMethod, paymentStatus, status, createdAt, updatedAt, items, history}`. Items chứa snapshot `{variantId, sku, productName, variantLabel, image, unitPrice, quantity}`; history chứa `{fromStatus, toStatus, actorId, note, createdAt}`. Không trả `request_payload`. Danh sách đơn có thể query các cột được cấp quyền của `orders` với RLS; chưa có RPC phân trang danh sách riêng.

Create lấy chủ đơn từ `auth.uid()`, xác minh trực tiếp `auth.users.email_confirmed_at`, từ chối user anonymous hoặc đang bị ban; không tin metadata do client sửa. Transaction advisory lock serialize cùng `(user, requestId)`. Payload chuẩn hóa gồm items, địa chỉ, COD và fingerprint; cùng ID/payload trả **chi tiết đơn hiện tại** với `replayed=true` ngay trước kiểm tra lại catalog/kho. Payload khác nhận `REQUEST_CONFLICT`. Retry không tạo đơn, không trừ kho và không dọn giỏ thêm lần nữa.

Với request mới, RPC khóa variants theo ID tăng dần bằng `FOR NO KEY UPDATE`, kiểm tra đã khóa đủ mọi variant, rồi khóa product → category → brand → settings bằng `FOR SHARE`. Thứ tự này phải được giữ khi bổ sung RPC quản trị catalog. `NO KEY UPDATE` vẫn serialize cập nhật stock nhưng cho phép khóa FK `KEY SHARE` của giỏ, tránh deadlock khi merge giỏ đồng thời checkout. Sau khi kiểm tra lại khả dụng, kho và quote, một transaction ghi orders/items/history pending, trừ stock, ghi movement `order` rồi trừ lượng đã mua khỏi từng dòng giỏ đang khóa. Lượng dư trong giỏ được giữ; dòng không còn lượng bị xóa. FE chỉ tải lại giỏ tài khoản sau thành công, không trừ lần nữa. Bất kỳ lỗi nào rollback toàn bộ.

Chỉ admin chuyển `pending → confirmed/cancelled`, `confirmed → shipping/cancelled`, `shipping → delivered`; delivered/cancelled kết thúc. COD chỉ chuyển `paid` cùng delivered, các trạng thái khác giữ unpaid. Gửi lại trạng thái hiện tại trả đơn mà không thêm history/hoàn kho. Hủy bắt buộc lý do không rỗng tối đa 500 ký tự; RPC khóa đơn rồi variants theo ID, hoàn stock và ghi movement `cancel` một lần trong cùng transaction. `adjust_stock` khóa variant, yêu cầu target/expected không âm và lý do hợp lệ; số kho khác expected trả `CONFLICT` (`40001`). Nếu target bằng kho hiện tại thì không ghi movement bằng 0.

## Quyền đọc và ghi

Cả bốn bảng catalog bật RLS. Khách chưa đăng nhập và customer chỉ được SELECT:

- Category và brand có `active = true`.
- Product có `status = 'active'`, category active và brand active.
- Variant active thuộc product mà người gọi được xem.

Admin được SELECT cả category/brand không active, product draft/archived và variant bị ẩn. Hai role client không có quyền INSERT, UPDATE, DELETE hoặc TRUNCATE các bảng catalog; riêng stock được admin điều chỉnh qua `adjust_stock`. RPC sửa nội dung catalog chưa triển khai.

`profiles` bật RLS: `authenticated` chỉ SELECT hồ sơ của mình và UPDATE hai cột `display_name`, `phone` với `USING`/`WITH CHECK` theo `auth.uid()`. Admin cũng chỉ đọc/sửa hồ sơ của mình. Client không có quyền INSERT, DELETE, đổi ID hay timestamps; `anon` không được đọc hồ sơ.

`private.admin_users` bật RLS và không có policy hoặc quyền bảng cho client, nên client không được đọc danh sách admin hoặc tự cấp quyền. Schema `private` không expose qua Data API. `authenticated` được `USAGE` schema và `EXECUTE` riêng các helper quyền, merge giỏ, chuẩn hóa/báo giá và giao dịch đơn/kho mà wrapper cần gọi; không có quyền bảng private hoặc gọi các hàm trigger. Các handler đặc quyền dùng `SECURITY DEFINER`, `search_path` rỗng và kiểm tra danh tính/quyền trong body; tất cả RPC public dùng `SECURITY INVOKER`. Quản trị database và `service_role` là các đường ghi đáng tin cậy.

`orders`, `order_items` và `order_status_history` bật RLS: khách hàng chỉ đọc đơn của mình, admin đọc toàn bộ đơn. `orders` chỉ cấp SELECT các cột công khai trong hợp đồng; `request_payload` không được cấp quyền, vì vậy client cần chọn rõ cột thay vì `select('*')`. `inventory_movements` chỉ admin được đọc. Cả bốn bảng đều không cho client INSERT/UPDATE/DELETE trực tiếp; các thay đổi đi qua RPC. `private.shop_settings` không có quyền bảng cho client và policy từ chối rõ ràng; helper chỉ trả phí cho người đã đăng nhập. `anon` không được gọi RPC đơn/kho.

`cart_items` bật RLS cho SELECT/INSERT/UPDATE/DELETE theo `user_id = auth.uid()`; UPDATE có cả `USING` và `WITH CHECK`. Admin cũng chỉ truy cập giỏ của mình. Client chỉ được INSERT các cột `user_id`, `variant_id`, `quantity` và UPDATE `quantity`; không được đổi timestamps hay liên kết. `anon` không có quyền bảng hoặc EXECUTE hai RPC giỏ. `private.cart_merge_requests` bật RLS với policy `false` rõ ràng cho client và không cấp quyền bảng, nên cả customer/admin không được đọc/sửa receipts trực tiếp.

## Migration

Migration được tạo bằng Supabase CLI và áp dụng bằng Supabase MCP. Tên file local đã đồng bộ timestamp/version với migration history remote:

- [20261014151914_chanhman_catalog.sql](./migrations/20261014151914_chanhman_catalog.sql): bảng, constraints, index, trigger, RLS và grants; bảo toàn bảng demo legacy.
- [20261014152020_chanhman_catalog_money_bounds.sql](./migrations/20261014152020_chanhman_catalog_money_bounds.sql): thêm giới hạn tiền và loại `NaN`, giữ nguyên lịch sử migration đầu đã áp dụng.
- [20261014154355_chanhman_profiles_and_admin.sql](./migrations/20261014154355_chanhman_profiles_and_admin.sql): profiles, trigger/backfill Auth, bảng quyền admin, helper/RPC role, RLS/grants và quyền admin đọc catalog ẩn.
- [20261014160347_chanhman_account_cart.sql](./migrations/20261014160347_chanhman_account_cart.sql): giỏ tài khoản, receipt hợp nhất, RPC đọc/merge nguyên tử, constraints, index, trigger và RLS/grants. Đã áp dụng trên dev remote; version file local khớp migration history.
- [20261016160344_chanhman_orders_and_inventory.sql](./migrations/20261016160344_chanhman_orders_and_inventory.sql): xóa hai bảng demo ngoài Plan bằng DROP không CASCADE có kiểm tra số dòng; tạo năm bảng BE-4, ledger ban đầu, RPC quote/create/read/status/stock và RLS/grants. Đã áp dụng trên dev remote; version file local khớp migration history.

Các file migration là nguồn schema của dự án; dữ liệu minh họa nằm riêng trong seed. Chưa xác minh dựng lại toàn bộ database local vì Docker daemon chưa khả dụng. Việc áp dụng và kiểm tra trên dev remote không thay thế kiểm tra dựng lại từ migrations và seed.

## Seed minh họa

[seed.sql](./seed.sql) được sinh từ **toàn bộ** [catalog mock](../src/services/mock/catalog.js): **3 category, 16 brand, 24 product, 46 variant**. Generator giữ ID, thứ tự, ảnh, nhãn, giá, tồn kho, màu và nhu cầu. Không lấy stock từ productService vì service đang trừ các đơn demo.

Chạy từ thư mục gốc `test_proj`:

```powershell
node supabase/generate-seed.mjs
```

[generate-seed.mjs](./generate-seed.mjs) dùng Node stdlib, kiểm tra số dòng, ID/SKU duy nhất, tham chiếu category, mảng dữ liệu, options, giá và tồn kho trước khi ghi UTF-8 SQL. Slug category/product dùng ID; slug brand viết thường và thay dấu cách bằng dấu gạch ngang; SKU mẫu là `CM-` cộng variant ID viết hoa. Options khai báo tường minh theo product/variant ID từ fixture, không parse label lúc chạy. Hậu tố bảo hành mở rộng mẫu được giữ bằng `warranty: "extended-demo"`; không bổ sung thông số chưa có nguồn.

Seed ghi product active và các variant trong cùng transaction `BEGIN`/`COMMIT`. Mọi bảng dùng `ON CONFLICT (id) DO NOTHING`: chạy lại không nhân bản, không ghi đè tồn kho hoặc các chỉnh sửa dev đã có. `compare_at_price` và ảnh variant là NULL; ảnh `/images/...` tiếp tục dùng tài nguyên FE hiện tại. Đây là giá và tồn kho minh họa, chưa phải dữ liệu mở bán.

Sau các INSERT catalog, seed khóa variants theo ID rồi bổ sung movement `initial` chỉ cho variant có stock dương và chưa có bất kỳ movement nào. Bước này cần thiết khi migrations chạy trước seed trên DB sạch. Chạy seed sau BE-4 không ghi trùng initial hoặc reset stock; kiểm thử reseed trên dev trong transaction rollback đã đạt. Seed hiện tại yêu cầu toàn bộ migrations đến BE-4.

## Kiểm tra

[tests/catalog.sql](./tests/catalog.sql) kiểm tra constraints, publish và quyền đọc/ghi catalog. [tests/profiles.sql](./tests/profiles.sql) kiểm tra trigger/fallback, constraints, quyền cột, hồ sơ riêng A/B, giả role từ metadata và quyền admin đọc catalog ẩn; cũng kiểm tra thu hồi admin bằng bảng quyền live. Hai script cùng [tests/cart.sql](./tests/cart.sql) đã chạy lại sau migration BE-4 và đạt trên dev remote. Fixture nằm trong transaction và rollback, không để lại tài khoản hoặc dữ liệu thử.

[tests/cart.sql](./tests/cart.sql) đã đạt trên dev remote: giỏ riêng A/B/admin, CRUD và quyền cột, FK/timestamps, catalog ẩn/hết hàng/vượt stock, payload sai, gộp trùng, retry với payload chuẩn hóa, xung đột request ID, giới hạn 100 dòng/999 quantity, không thay đổi stock, tổng tiền an toàn và rollback receipt/giỏ khi lỗi. Script cũng kiểm tra mảng rỗng, số JSON `1.0`, giới hạn chính xác `MAX_SAFE_INTEGER` và cascade khi xóa user; fixture nằm trong transaction và rollback.

Kết quả concurrency giỏ ở đợt BE-3: hai request cùng ID chỉ cộng một lần, tạo quantity 1 và một receipt; hai ID khác nhau đồng thời tăng quantity từ 1 lên 3, tổng ba receipts. Stock giữ nguyên 8 và fixture đã được dọn. Đây là kết quả lịch sử của BE-3; bảng legacy đã được xóa ở BE-4.

[tests/orders.sql](./tests/orders.sql) đã đạt: RLS chủ đơn/admin, quyền cột và từ chối DML trực tiếp, xác minh Auth đáng tin cậy, giới hạn input/tiền, báo giá không lộ catalog ẩn, snapshot, trừ kho/giỏ nguyên tử, retry/conflict, đổi giá/phí, luồng trạng thái COD, hủy hoàn một lần và điều chỉnh kho có expectedStock. Có kiểm tra rollback khi hoàn kho gây tràn integer. Fixture rollback toàn bộ; sequence mã đơn có thể có khoảng trống.

[tests/orders-concurrency.sql](./tests/orders-concurrency.sql) chứa các khối `@step` chạy riêng: setup, mỗi cặp a/b chạy song song, assertion sau từng cặp và cleanup cuối. Đã chạy trên dev: cùng request tạo đúng một đơn/trừ một lần; hai khách tranh hàng cuối chỉ một đơn thành công; hai lệnh hủy đồng thời chỉ có một movement hoàn và một history cancelled. Các fixture commit để kiểm tra khóa thật đã được dọn bằng transaction có kiểm tra danh tính. Không chạy cả file tuần tự rồi coi đó là kiểm thử đồng thời.

Kiểm kê cuối BE-4: đúng 13 bảng ứng dụng, không còn tasks/legacy; 24 products, 46 variants, 36 movement initial (10 variant stock=0 không cần movement). Tổng movement của từng variant khớp stock. Auth/profiles/admin/cart/receipts/orders/items/history đều 0 dòng; không còn movement order/cancel/adjustment thử nghiệm. Phí giao hàng 30.000 VND.

Kiểm tra customer A/B/admin dùng fixture SQL, `SET LOCAL ROLE` và mô phỏng JWT claims trong PostgreSQL. Đây là kiểm tra RLS/grants ở database; chưa có JWT từ đăng nhập Auth thật và chưa kiểm tra đăng ký/gửi email/xác minh/reset mật khẩu qua Auth API. Chạy các script bằng kết nối quản trị hoặc Supabase MCP trên database dev đã có migrations và seed.

[verify-api.mjs](./verify-api.mjs) kiểm tra Data API thực bằng publishable key với role `anon`: đọc catalog, từ chối ghi catalog, đọc profiles/giỏ/đơn/ledger và gọi RPC role/giỏ/đơn/admin; schema `private` không expose. Hai bảng đã xóa trả 404/PGRST205. Đã chạy sau BE-4 và đạt. Script lấy `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY` từ biến môi trường; cũng nhận các biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` tương đương. Không lưu key trong script. Chạy từ thư mục gốc:

```powershell
node supabase/verify-api.mjs
```

Kết quả kiểm tra thực tế và giới hạn được ghi trong [PROGRESS.md](../PROGRESS.md).

Rà advisors sau migration BE-4 không có ERROR/WARN. Security advisor có [INFO RLS enabled no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) trên `private.admin_users`, là thiết kế chủ ý để RLS mặc định từ chối client cùng với không cấp quyền bảng. Performance advisor có [INFO unused index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) trên `products_brand_idx`, `orders_status_created_idx`, `order_items_variant_idx`, `inventory_order_idx`, `inventory_actor_idx`; giữ các index phục vụ FK và truy vấn đơn/kho theo Plan, chưa có dữ liệu giao dịch thật để đo tải.

## Phần tiếp theo

Phần database BE-2 đã triển khai; **BE-2 chưa hoàn tất toàn bộ** vì FE vẫn dùng Auth giả lập. Còn tích hợp authService/session, đăng ký/đăng nhập/đăng xuất/xác minh/reset thật, callback/redirect, email và đọc/sửa hồ sơ từ database. Chưa chọn tài khoản admin đầu tiên.

BE-1 cũng chưa hoàn tất: FE và giỏ khách vẫn dùng mock, chưa tích hợp query/filter/count từ Supabase. Đã đủ các bảng trong Plan; quyền ghi nội dung catalog admin và Storage thuộc BE-5.

Phần database BE-3 đã triển khai; **BE-3 chưa hoàn tất toàn bộ** vì `cartService`/`useCart` vẫn chỉ dùng localStorage và Auth giả lập, chưa tự chọn giỏ guest/user hoặc gọi merge khi đăng nhập. Khi tích hợp, giữ request ID/payload để retry và chỉ xóa giỏ khách sau phản hồi xác nhận server commit; lỗi phải giữ dữ liệu khách. Khi logout, bỏ state giỏ tài khoản, không chép giỏ riêng sang localStorage giỏ khách. Các hook cleanup này chưa được triển khai ở FE.

Phần database/RPC BE-4 đã triển khai; **BE-4 chưa nghiệm thu toàn luồng FE**. Còn nối quote/create/read đơn, mapping địa chỉ, phân trang danh sách, xử lý lỗi và tải lại giỏ sau commit. Chưa kiểm tra bằng JWT đăng nhập Auth thật hoặc luồng browser từ đăng nhập đến checkout/admin. Chưa dựng lại DB local sạch vì Docker daemon không chạy; kết quả kiểm tra dev và reseed không thay thế bài kiểm tra đó.
