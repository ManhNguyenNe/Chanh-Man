# Chanh&Man

Theo dõi công việc đã hoàn thành và những phần còn lại tại [PROGRESS.md](./PROGRESS.md).

Website học tập bán laptop, điện thoại và linh kiện PC, xây bằng React + Vite + Ant Design. Trang chủ sử dụng thiết kế trong DESIGN.md và quy tắc trong AGENTS.md.

## Chạy dự án

```sh
npm install
npm run dev
```

Mở địa chỉ được Vite thông báo. Kiểm tra mã và build:

```sh
npm run lint
npm run build
npm run preview
```

## Hiện đã có

- Trang chủ responsive với 8 phần nội dung.
- Tìm kiếm tiếng Việt có/không dấu, lọc danh mục và nhu cầu, URL giữ tiêu chí lọc.
- Xem nhanh sản phẩm, chọn phiên bản, thêm/sửa/xóa giỏ và giữ giỏ khi tải lại.
- Theme Ant Design dùng chung token với CSS theo DESIGN.md.
- Service dữ liệu giả lập được tách riêng để chuẩn bị tích hợp API.

Tài khoản, checkout, DB và tích hợp Supabase thuộc giai đoạn tiếp theo. Giá, cấu hình và tồn kho đang dùng dữ liệu minh họa; chưa tiếp nhận đơn hàng thực tế.

Xem [chi tiết triển khai và kiểm tra](docs/HOMEPAGE.md), [kế hoạch FE](FE_PLAN.md), [thiết kế](DESIGN.md) và [quy tắc dự án](AGENTS.md).
