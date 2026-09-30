# Quy tắc phát triển dự án test_proj

## Phạm vi áp dụng

Đọc và tuân thủ tài liệu này khi tạo mới, chỉnh sửa hoặc tổ chức lại mã nguồn trong dự án `test_proj`.

## 1. Bối cảnh dự án

Đây là dự án React sử dụng Supabase làm backend. Các công nghệ chính có thể bao gồm:

- React.
- JavaScript hoặc TypeScript.
- Supabase Database, Auth và Storage.
- Supabase Realtime khi cần.
- CSS hoặc thư viện UI đang được sử dụng trong dự án.

Luôn kiểm tra code hiện tại trước khi giả định dự án đang dùng thư viện, cấu trúc thư mục hoặc phong cách code nào. Danh sách trên không có nghĩa tất cả công nghệ đã được cài đặt hoặc cấu hình.

Ant Design (`antd`) đã được chọn làm thư viện UI chính, kết hợp CSS và component riêng theo `DESIGN.md`. Tại thời điểm cập nhật quy tắc, phiên bản cài đặt là 6.6.3; khi triển khai, kiểm tra lại `package.json`, lockfile và package thực tế thay vì coi số phiên bản này là cố định. Quy tắc sử dụng nằm ở mục 12.

## 2. Mục tiêu chính

Xây dựng và duy trì dự án theo các tiêu chí: **đơn giản, dễ hiểu, dễ bảo trì, an toàn và đồng nhất với code hiện có**.

Chủ dự án đang trong quá trình học React và Supabase. Ưu tiên giải pháp dễ hiểu thay vì quá thông minh hoặc quá trừu tượng. Không tạo thêm độ phức tạp nếu không thật sự cần thiết.

## 3. Trước khi viết code

1. Kiểm tra các file có liên quan.
2. Hiểu cách chức năng hiện tại đang hoạt động.
3. Kiểm tra xem dự án đã có chức năng tương tự hay chưa.
4. Tuân theo cấu trúc và phong cách code hiện tại.
5. Tái sử dụng component, layout, hook, utility, service và Supabase client hiện có nếu phù hợp.
6. Với công việc liên quan UI/UX, đọc [DESIGN.md](./DESIGN.md) trước khi lập thiết kế hoặc chỉnh sửa giao diện, rồi áp dụng quy tắc tại mục 11 bên dưới.
7. Trước khi tự viết control hoặc thêm thư viện UI, kiểm tra component Ant Design hiện có và áp dụng mục 12. Dùng API tương ứng với phiên bản đã cài.

Không lập tức tạo file mới hoặc abstraction mới khi chưa kiểm tra code hiện tại.

## 4. Phạm vi thay đổi

Chỉ thay đổi code liên quan trực tiếp đến yêu cầu. Ưu tiên thay đổi nhỏ, rõ ràng và có phạm vi cụ thể.

Không được:

- Refactor code không liên quan.
- Đổi tên biến hoặc file không liên quan.
- Tự ý tổ chức lại cấu trúc thư mục.
- Viết lại code đang hoạt động chỉ vì có cách khác trông đẹp hơn.
- Thay đổi hành vi hiện tại nếu yêu cầu không cần đến.
- Xóa chức năng nếu không được yêu cầu rõ ràng.

## 5. Cấu trúc thư mục src/

Đặt file theo đúng trách nhiệm của từng thư mục. Các tên file dưới đây chỉ là ví dụ; chỉ tạo file khi chức năng thực tế cần đến.

### 5.1. pages/ — Trang hoàn chỉnh

- Chứa các trang hoàn chỉnh, mỗi file page tương ứng với một URL được cấu hình trong ứng dụng.
- Ví dụ: `/` → `Home.jsx`, `/login` → `Login.jsx`, `/Cart` → `Cart.jsx`.
- Một page ghép các component lại với nhau để tạo thành một trang.
- Tách các phần giao diện có thể tái sử dụng sang `components/`.

### 5.2. components/ — Component tái sử dụng

- Đây là thư mục quan trọng nhất, chứa các component có thể tái sử dụng ở nhiều page.
- Đặt file `.css` của component cùng với file `.jsx` trong thư mục này.
- Có thể nhóm mỗi component vào một thư mục riêng, ví dụ: `components/Button/Button.jsx` và `components/Button/Button.css`.

### 5.3. layouts/ — Khung bố cục trang

- Chứa khung bố cục của trang; các trang có thể dùng chung hoặc có layout riêng.
- Ví dụ: `MainLayout.jsx` dành cho trang người dùng, gồm Header → Content → Footer.
- Ví dụ: `AdminLayout.jsx` dành cho trang quản trị, gồm Sidebar → Topbar → Content.
- Layout tổ chức khung hiển thị và vị trí nội dung của page.

### 5.4. assets/ — Tài nguyên tĩnh

- Chứa tài nguyên tĩnh như ảnh, icon, font và CSS dùng chung.
- Có thể tổ chức thành `images/`, `icons/`, `fonts/` hoặc chứa file như `logo.png`.
- CSS dành riêng cho component phải đặt cạnh file `.jsx` trong `components/`.

### 5.5. services/ — Giao tiếp với backend

- Chứa phần giao tiếp với backend, ví dụ: `api.js`, `supabase.js`, `auth.js`.
- Tập trung cấu hình kết nối và các hàm gọi backend tại đây để page, component hoặc hook có thể import và sử dụng lại.
- Không lặp lại logic gọi backend trực tiếp trong từng page.

### 5.6. hooks/ — Custom hook

- Chứa custom hook: các hàm tái sử dụng logic React, được xây dựng từ các hook như `useState`, `useEffect`.
- Tên custom hook bắt đầu bằng `use`, ví dụ: `useAuth.js`.

### 5.7. utils/ — Hàm tiện ích

- Chứa các hàm tiện ích dùng lại, ví dụ: `formatDate.js`, `formatMoney.js`, `validateEmail.js`.
- Dùng cho logic tiện ích không phụ thuộc vào hook hoặc vòng đời của React; logic cần React hook đặt trong `hooks/`.

## 6. Quy tắc React

- Tuân theo các pattern React đang được sử dụng trong dự án.
- Ưu tiên Functional Component.
- Mỗi component nên tập trung vào một nhiệm vụ chính; hạn chế component quá lớn và khó hiểu.
- Nếu component quá phức tạp, cân nhắc tách thành component UI tái sử dụng, custom hook hoặc hàm hỗ trợ.
- Không tách code chỉ để tạo abstraction nếu không mang lại lợi ích rõ ràng.

## 7. Quản lý state trong React

- Sử dụng local state nếu state chỉ thuộc về một component hoặc một nhóm component nhỏ.
- Không tự ý thêm thư viện quản lý global state nếu dự án chưa sử dụng hoặc chưa thật sự cần.
- Không lưu cùng một state ở nhiều nơi nếu không cần thiết.
- Ưu tiên tính toán dữ liệu từ state hiện có thay vì tạo thêm state mới.

Ví dụ, nếu `total` luôn có thể tính từ `items`, nên dùng:

```js
const total = items.length;
```

Thay vì tạo state riêng:

```js
const [total, setTotal] = useState(0);
```

## 8. Quy tắc sử dụng useEffect

- Không sử dụng `useEffect` nếu không thật sự cần thiết.
- Chủ yếu dùng để đồng bộ với hệ thống bên ngoài: API, Browser API, subscription, timer hoặc Supabase Realtime.
- Không dùng `useEffect` chỉ để tính giá trị có thể tính trực tiếp trong quá trình render.
- Luôn cleanup subscription, event listener và timer khi cần.

## 9. Tái sử dụng và đặt tên component

- Trước khi tạo component mới, kiểm tra và ưu tiên tái sử dụng component hiện có.
- Tránh tạo nhiều component gần giống nhau chỉ khác một vài chi tiết nhỏ.
- Không tạo component quá generic quá sớm.
- Ưu tiên tên rõ nghĩa, thể hiện mục đích của component.

Ví dụ tên nên dùng:

```text
UserTable
WarrantyForm
DeviceCard
```

Tránh các abstraction phức tạp như dưới đây, trừ khi dự án thật sự cần:

```text
GenericDynamicEntityRenderer
UniversalDataProcessor
```

## 10. Hàm và khả năng đọc code

- Sử dụng tên biến và tên hàm rõ nghĩa, thể hiện mục đích của code.
- Giữ hàm đơn giản và dễ đọc.
- Hạn chế các đoạn `if` lồng quá sâu nếu có cách viết đơn giản hơn; dùng early return khi giúp logic dễ hiểu hơn.
- Chỉ viết comment khi cần giải thích điều chưa rõ từ code. Không comment từng dòng một cách không cần thiết.

Ví dụ tên hàm nên dùng:

```js
getUserProfile()
createWarrantyRequest()
fetchDevices()
```

Tránh các tên mơ hồ:

```js
getData()
handleThing()
process()
```

## 11. Tuân thủ thiết kế UI/UX theo DESIGN.md

### 11.1. Nguồn thiết kế bắt buộc

- [DESIGN.md](./DESIGN.md) tại thư mục gốc dự án là nguồn chuẩn cho thiết kế UI/UX. Phải đọc các phần liên quan trước khi tạo hoặc sửa page, layout, component, CSS, tương tác và responsive, bao gồm cả khu vực khách hàng và quản trị.
- Các gợi ý giao diện trước đây, bao gồm trong `FE_PLAN.md`, phải nhường ưu tiên cho `DESIGN.md` khi có khác biệt. Yêu cầu trực tiếp mới của người dùng vẫn được ưu tiên.
- Mục này tóm tắt cách áp dụng; không thay thế nội dung chi tiết trong `DESIGN.md`. Khi tài liệu thiết kế được cập nhật, đối chiếu lại các phần đang triển khai.
- Với giá trị token hoặc component có mô tả không nhất quán trong chính tài liệu, ưu tiên giá trị khai báo trong YAML đầu file; dùng phần mô tả để bổ sung hành vi chưa có trong YAML. Với breakpoint khác nhau giữa các đoạn, chọn mốc từ bảng `Responsive Behavior / Breakpoints`, dùng nhất quán và ghi rõ lựa chọn khi triển khai.

### 11.2. Ngôn ngữ thị giác và token

- Thiết kế lấy ảnh sản phẩm làm trọng tâm, phân cấp chữ rõ, nhiều khoảng trắng và hạn chế trang trí. Trang giới thiệu dùng các mảng sáng/tối liền cạnh; danh sách bán hàng và quản trị áp dụng bố cục chức năng phù hợp, giữ cùng hệ token.
- Dùng màu, typography, spacing, radius và component variant từ `DESIGN.md`. Ánh xạ các token sang CSS variables dùng chung; component tham chiếu biến thay vì lặp mã màu hoặc tự tạo giá trị thiết kế rời rạc.
- Giữ Action Blue làm màu nhấn tương tác duy nhất; dùng đúng biến thể focus và liên kết trên nền tối. Không thêm màu thương hiệu thứ hai hoặc gradient trang trí.
- Typography theo từng token: body mặc định 17px, weight 400, line-height 1.47; headline theo token display, weight 600. Không tự thêm weight 500. Dùng font stack và phương án thay thế được mô tả trong tài liệu, kiểm tra hiển thị tiếng Việt trên hệ điều hành hiện tại.
- Full-bleed product tile không bo góc; utility card, nút tiện ích và nút pill dùng đúng nhóm radius đã định nghĩa. Không thêm bóng đổ cho card, button hoặc chữ; bóng đổ quy định chỉ dành cho ảnh sản phẩm phù hợp.
- Header, sub-nav, footer, tìm kiếm, lựa chọn phiên bản và thanh mua hàng cố định phải đối chiếu component tương ứng trong tài liệu. Không tự áp dụng giao diện mặc định của thư viện UI nếu khác thiết kế.

### 11.3. Tương tác, responsive và phần chưa được mô tả

- Thực hiện trạng thái mặc định, nhấn và focus theo `DESIGN.md`: nút có hiệu ứng nhấn `scale(0.95)`, focus bàn phím rõ; lựa chọn phiên bản thể hiện trạng thái selected. Tuân thủ hướng dẫn không bổ sung đặc tả hover riêng.
- Tuân thủ cách thu gọn navigation, đổi số cột, giảm kích thước headline, khoảng cách và giới hạn chiều rộng theo tài liệu. Vùng chạm trên mobile tối thiểu 44 × 44px; thanh cố định không che nội dung hoặc thao tác form.
- Ảnh giữ đúng tỷ lệ, có kích thước responsive; dùng `srcset`/`sizes` khi có các nguồn ảnh tương ứng. Hero đầu trang tải sớm, ảnh ngoài màn hình đầu lazy-load.
- `DESIGN.md` có mục `Known Gaps`, đặc biệt về validation và lỗi form. Khi cần loading, empty, error, disabled, thông báo hoặc bảng quản trị chưa được mô tả, bổ sung theo token/component hiện có và yêu cầu chức năng; ghi rõ đó là phần mở rộng của dự án, không coi là đặc tả đã có trong tài liệu.
- Giữ label, thông báo lỗi bằng chữ, điều hướng bàn phím và focus dễ nhận biết; không chỉ dùng màu để truyền đạt trạng thái. Tôn trọng thiết lập giảm chuyển động của người dùng khi áp dụng hiệu ứng.

### 11.4. Kiểm tra trước khi hoàn thành thay đổi UI

- Đối chiếu phần đã làm với token và component liên quan trong `DESIGN.md`, gồm màu, chữ, khoảng cách, bo góc, ảnh và trạng thái tương tác.
- Kiểm tra trực quan ở mobile, tablet và desktop, đặc biệt hai phía của breakpoint bị ảnh hưởng; bảo đảm không tràn ngang, cắt chữ hoặc che nút thao tác.
- Kiểm tra bàn phím và các trạng thái dữ liệu/form liên quan đến thay đổi. Báo rõ phần chưa kiểm tra được; không khẳng định tuân thủ chỉ dựa vào build thành công.
- Chỉ cập nhật giao diện trong phạm vi công việc được yêu cầu; không dùng quy tắc này làm lý do tự sửa toàn bộ website.

## 12. Sử dụng Ant Design

### 12.1. Phạm vi sử dụng

- Ưu tiên Ant Design cho các chức năng đã có component phù hợp: form, input, select, checkbox, modal, drawer, phân trang, thông báo, upload và bảng quản trị.
- Với hero, album ảnh, khối giới thiệu, thẻ sản phẩm, chọn phiên bản và bố cục cửa hàng, kết hợp component riêng với control Ant Design khi hữu ích. Không ép mọi phần giao diện vào `Card`, `Layout` hoặc `Typography` chỉ vì thư viện có sẵn.
- `DESIGN.md` quyết định hình thức và trải nghiệm; Ant Design cung cấp thành phần triển khai. Giao diện mặc định của thư viện không thay thế thiết kế dự án.
- Dùng trực tiếp component thư viện nếu đã đáp ứng yêu cầu. Chỉ tạo wrapper khi có thiết kế, hành vi hoặc logic thực sự dùng lại; không bọc lại toàn bộ Ant Design hay dựng bộ form/table tổng quát từ đầu.
- Không thêm bộ UI khác có chức năng trùng lặp nếu Ant Design và component hiện có đã đáp ứng nhu cầu. Không mặc định đưa Ant Design Pro hoặc Ant Design Mobile vào dự án.

### 12.2. Theme và ngôn ngữ

- Cấu hình theme chung bằng `ConfigProvider` ở cấp ứng dụng. Tập trung cấu hình vào một module dùng chung trong cấu trúc hiện có; chỉ tạo khi bắt đầu tích hợp, không khai báo theme rải rác trong từng page.
- Ánh xạ token của `DESIGN.md` vào theme Ant Design và CSS variables từ một nguồn giá trị chung. Các seed token Ant Design cần tính toán màu/kích thước phải nhận giá trị đúng kiểu; không mặc định truyền chuỗi `var(--...)` vào mọi token.
- Cấu hình màu chính, nền, chữ, font, kích thước control, đường viền và bóng đổ theo thiết kế. Dùng component token hoặc variant để phân biệt nút pill, nút tiện ích, card và input; không đặt một radius toàn cục rồi buộc mọi thành phần cùng hình dạng.
- Ưu tiên theo thứ tự: API/props công khai → theme/component token → `classNames`/`styles` cho semantic DOM nếu component hỗ trợ → CSS có phạm vi trong class của component dự án.
- Không dựa vào class hash sinh tự động, selector theo cấu trúc DOM nội bộ hoặc sửa `node_modules`. Tránh ghi đè `.ant-*` toàn cục và lạm dụng `!important`; chỉ dùng khi có lý do cụ thể và đã kiểm tra ảnh hưởng.
- Thiết lập locale tiếng Việt bằng locale được phiên bản đã cài hỗ trợ, đồng thời viết label và thông báo nghiệp vụ bằng tiếng Việt. Nếu dùng DatePicker hoặc định dạng ngày qua thư viện ngày, cấu hình locale của thư viện ngày tương ứng.
- Thông báo và modal cần nhận cùng theme/locale: ưu tiên Ant Design `App` provider dưới `ConfigProvider` và instance từ `App.useApp()`, hoặc hook tương ứng với context holder. Không dùng static `message.xxx`, `notification.xxx`, `Modal.xxx` khi cần context ứng dụng. Có thể alias `App` thành `AntdApp` để tránh nhầm với `App.jsx` của dự án.

### 12.3. Form, bảng và tích hợp service

- Với Ant Design `Form`, để Form quản lý giá trị và validation của các trường đã đăng ký. Không đồng thời lưu bản sao mọi trường trong `useState`. Dùng API của Form để đọc/cập nhật giá trị; dữ liệu tải bất đồng bộ cập nhật qua form instance thay vì kỳ vọng thay `initialValues` sẽ tự cập nhật form.
- Validation tại FE phục vụ trải nghiệm; hiển thị cả lỗi nghiệp vụ trả về từ service, gồm lỗi từng trường và lỗi chung. Nút submit có trạng thái đang xử lý và tránh gửi lặp; lỗi không làm mất nội dung người dùng đã nhập.
- Component và callback gọi service theo mục 5.5; không truy vấn Supabase hoặc import dữ liệu mock trực tiếp trong cấu hình Form/Table. Giữ cùng hợp đồng service khi thay mock bằng API thật.
- `Table` dùng `rowKey` từ ID ổn định. Khi phân trang/lọc/sắp xếp qua service, gửi tiêu chí vào service và dùng tổng số bản ghi trả về; không lọc hoặc sắp xếp chỉ trang đang tải rồi trình bày như kết quả toàn bộ dữ liệu.
- `Upload` dùng luồng upload do service của dự án kiểm soát khi tới bước tích hợp, ví dụ qua API `customRequest` được hỗ trợ. Giai đoạn mock chỉ preview hoặc upload giả lập; không gửi file tự động đến endpoint chưa cấu hình, không đặt thông tin bí mật trong props.
- Dùng loading, empty, error, disabled và feedback phù hợp, đồng thời áp dụng quy tắc phần thiết kế còn thiếu tại mục 11.3. Không tự coi màu trạng thái mặc định của Ant Design là ngoại lệ đã được cho phép trong `DESIGN.md`.

### 12.4. CSS, responsive và khả năng truy cập

- CSS riêng tiếp tục nằm cạnh JSX theo mục 5.2. Global reset nếu cần chỉ nhập một lần ở đầu vào ứng dụng và kiểm tra ảnh hưởng tới HTML/component riêng; không chồng nhiều bộ reset.
- Chủ động thiết kế responsive theo `DESIGN.md`; không mặc định breakpoint hoặc kích thước control của Ant Design trùng với yêu cầu dự án. Bảng admin trên mobile có thể cuộn trong vùng bảng hoặc chuyển sang bố cục phù hợp, không làm tràn ngang cả trang.
- Giữ label, tên truy cập cho nút chỉ có icon, focus bàn phím, thứ tự Tab và thao tác đóng modal/drawer. Theme tùy chỉnh không được làm mất dấu hiệu focus hoặc khả năng đọc; kiểm tra cả popup được render ngoài cây DOM của component qua portal.
- Tôn trọng giảm chuyển động và kích thước vùng chạm theo mục 11.3. Không mặc định component thư viện tự bảo đảm toàn bộ khả năng truy cập sau khi tùy chỉnh.

### 12.5. Dependency và kiểm tra

- Import component qua API công khai, ví dụ `import { Button, Form } from 'antd'`. Chỉ dùng component/icon cần thiết; tránh tải toàn bộ bản bundle dựng sẵn. Nếu dùng `@ant-design/icons`, kiểm tra và khai báo dependency trực tiếp thay vì dựa vào dependency bắc cầu.
- Giữ lockfile đồng bộ khi thay đổi dependency. Không tự nâng major version, thêm bản vá React hoặc chép hướng dẫn Ant Design 4/5 vào bản 6 mà chưa kiểm tra tính tương thích.
- Khi xây routing, tách tải khu vực quản trị nếu phù hợp để màn hình cửa hàng không tải trước toàn bộ bảng và form admin. Đánh giá dung lượng build thực tế trước khi thêm giải pháp tối ưu phức tạp.
- Sau thay đổi tích hợp hoặc theme, chạy lint/build phù hợp và kiểm tra các component bị ảnh hưởng trên trình duyệt, gồm form, popup, focus và mobile. Việc chỉ sửa tài liệu không cần chạy test giao diện.
- Tham khảo API đúng phiên bản từ [Ant Design Components](https://ant.design/components/overview/), [Customize Theme](https://ant.design/docs/react/customize-theme/) và [App](https://ant.design/components/app/), kết hợp kiểu khai báo trong package đã cài khi cần xác minh.

## 13. Ghi nhận tiến trình sau mỗi lần code

- Sau mỗi đợt triển khai, sửa lỗi hoặc thay đổi cấu hình đã thực hiện, phải cập nhật [PROGRESS.md](./PROGRESS.md) ở gốc dự án trước khi trả lời hoàn thành. Nếu công việc còn dở, ghi rõ phần đã làm và phần chưa hoàn tất trước khi bàn giao.
- Đọc tiến trình hiện có trước khi cập nhật. Thêm một mục cho mỗi đợt làm việc, dùng ngày theo múi giờ Asia/Saigon và mã tăng dần; mục mới nhất đặt trên cùng phần nhật ký. Giữ lịch sử cũ, không ghi đè hoặc gộp mất các đợt trước.
- Mỗi mục ghi: mục tiêu, thay đổi thực tế, file/thư mục chính có liên kết, kết quả kiểm tra và giới hạn/công việc tiếp theo. Viết tiếng Việt dễ hiểu, giải thích thay đổi có ích gì cho website.
- Phân biệt việc đã triển khai với đề xuất hoặc kế hoạch. Không đánh dấu cả giai đoạn FE hoàn tất khi mới xong một phần; không dùng phần trăm tiến độ nếu chưa có cơ sở.
- Chỉ ghi kiểm tra thực sự đã chạy và kết quả quan sát được. Nếu dẫn kết quả của đợt trước, nêu rõ đó là kết quả lịch sử; nếu chưa chạy hoặc không cần chạy vì chỉ sửa tài liệu, ghi rõ lý do.
- Cập nhật phần tổng quan hiện trạng khi phạm vi hoàn thành thay đổi. Các bước tiếp theo là thông tin theo dõi, không tự mở rộng phạm vi yêu cầu hiện tại.
- Dùng `PROGRESS.md` làm nhật ký thống nhất; tài liệu chuyên đề như `docs/HOMEPAGE.md` giữ giải thích chi tiết và được liên kết từ nhật ký. Không tạo thêm nhật ký trùng chức năng; không ghi khóa API, mật khẩu hoặc dữ liệu riêng tư vào tài liệu.
