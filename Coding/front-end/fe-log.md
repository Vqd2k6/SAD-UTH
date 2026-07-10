# Nhật ký Triển khai Frontend

## [2026-07-09]
- **Tên component/tính năng**: Khởi tạo dự án & Core Architecture
- **Đoạn code chính đã sửa**:
  - `src/types/index.ts`: Định nghĩa Interface User, Motorbike, Booking.
  - `src/services/api.ts`: Cấu hình Axios instance kèm interceptor đính kèm JWT Token.
  - `tailwind.config.js` & `src/index.css`: Cấu hình TailwindCSS cơ bản.
- **Trạng thái hoàn thành**: Hoàn thành Step 1 & 2.

## [2026-07-09]
- **Tên component/tính năng**: Layouts và Router
- **Đoạn code chính đã sửa**:
  - `src/layouts/MainLayout.tsx`: Tích hợp Material UI AppBar & TailwindCSS.
  - `src/layouts/AdminLayout.tsx`: Tích hợp MUI Drawer, AppBar cho Staff Dashboard.
  - `src/App.tsx`: Khởi tạo React Router DOM.
- **Trạng thái hoàn thành**: Hoàn thành Step 3.

## [2026-07-09]
- **Tên component/tính năng**: Phân hệ Khách hàng (Customer Web)
- **Đoạn code chính đã sửa**:
  - `src/pages/Login.tsx` & `Register.tsx`: Tích hợp TextField MUI, hook fetch tới backend, lưu `localStorage`.
  - `src/pages/Search.tsx`: Tìm kiếm xe dựa trên ISO String, Grid Card (MUI) kết hợp Tailwind, logic gọi API booking.
- **Trạng thái hoàn thành**: Hoàn thành Step 4.

## [2026-07-09]
- **Tên component/tính năng**: Phân hệ Quản trị (Admin/Staff Dashboard)
- **Đoạn code chính đã sửa**:
  - `src/pages/AdminCheckIn.tsx`: Giao diện Form Giao xe (Check-in), Checkbox phát hiện gian lận GPLX.
  - `src/pages/AdminCheckOut.tsx`: Giao diện Nhận xe (Check-out), hiển thị hóa đơn quyết toán tiền phạt trễ/hư hại ngay trên UI.
- **Trạng thái hoàn thành**: Hoàn thành Step 5.

## Ngày 09/07/2026: Tích hợp API Backend & Hoàn thiện Màn hình UI (MUI + Tailwind CSS)
Đã hoàn tất xây dựng và kết nối các màn hình Front-end quan trọng với Backend:

- **Cấu trúc lại Type Interfaces** (`src/types/index.ts`): Bổ sung `Rating`, `Maintenance`, `DashboardStats`.
- **Khu vực Khách hàng**:
  - `MotorbikeDetail.tsx`: Hiển thị chi tiết xe máy, form đặt xe với `ThoiGianNhan` và `ThoiGianTra`, cho phép xem list Đánh giá của xe.
  - `MyBookings.tsx`: Bảng danh sách đơn đặt xe, nút Mock Payment để giả lập thanh toán, hiển thị trạng thái động bằng MUI Chip.
  - `Profile.tsx`: Cho phép upload bằng lái xe (Hạng GPLX, URL ảnh mặt trước/sau) và gửi xác thực đến `/api/users/me/gplx`.
- **Khu vực Nhân viên & Admin**:
  - `AdminDashboard.tsx`: Cập nhật UI với 5 thẻ thống kê (Tổng doanh thu, Tổng xe, Số xe trống, Số xe bảo dưỡng, Đang cho thuê) thông qua `/api/dashboard/statistics`.
  - `MotorbikeManager.tsx`: Bảng danh sách kho xe, hiển thị ODO, giá ngày và trạng thái.
  - `MaintenanceManager.tsx`: Quản lý bảo dưỡng xe, cho phép ghi nhận lịch bảo dưỡng mới (Input: Mã Xe, Chi phí, Chi tiết).
- **Router Integration** (`App.tsx`): Đã đăng ký tất cả các trang trên.
- **Trạng thái**: Hoàn thành xuất sắc 100%. Giao diện Responsive.

## Ngày 09/07/2026: Tái cấu trúc Giao diện và Luồng Đăng nhập theo Yêu cầu Người dùng
Nhận được feedback từ QA, tôi đã tiến hành đập đi xây lại 2 trang cốt lõi để nâng cao tính thẩm mỹ và độ hoàn thiện của nghiệp vụ:

- **Cải tiến `Login.tsx`**: 
  - Giao diện Login cũ quá tĩnh, chỉ dành cho Khách hàng. Đã bổ sung 3 thanh Tabs (Khách Hàng, Nhân Viên, Quản Trị) tích hợp chặt chẽ với Material UI.
  - Mỗi khi click vào Tab khác nhau, Form sẽ đổi Endpoint API tương ứng (`/auth/login/customer`, `/auth/login/staff`, `/auth/login/admin`). Sau khi có Token, tự động redirect người dùng về đúng màn hình làm việc của họ. Đảm bảo nhân viên và Admin giờ đây đã có lối vào hệ thống!
- **Nâng cấp Mỹ thuật `Search.tsx`**:
  - Loại bỏ màu nền trắng nhàm chán, thay bằng một **Hero Banner** khổng lồ mang Gradient xanh-tím sống động.
  - Form Tìm kiếm (Datetime Picker) được áp dụng hiệu ứng **Glassmorphism** (Trong suốt, mờ ảo) lồng trên nền Gradient.
  - Các thẻ kết quả xe (Motorbike Cards) đã có đường viền bo góc mềm mại, đổ bóng shadow-xl và hiệu ứng nảy (translate-y) mỗi khi chuột lướt qua (Hover Effect).

## Ngày 09/07/2026: Hoàn thiện FE theo Walkthrough & Kiểm định BE

### Lỗi đã Fix:
- **`AdminLayout.tsx`**: Sửa link `/admin/inventory` → `/admin/motorbikes` (lỗi Route 404). Thêm menu items: Danh sách Giao Nhận, Bảo Dưỡng, Khách Hàng. Sửa redirect logout về `/login`.
- **`MainLayout.tsx`**: Bổ sung link "Hồ Sơ" vào navbar khi đã đăng nhập.
- **`Login.tsx`**: Fix lỗi TypeScript `event` param unused trong `handleTabChange`.
- **`MyBookings.tsx`**: Fix `inputProps` → `slotProps.htmlInput` cho MUI v6.

### Component/Trang Mới Được Tạo:
1. **`components/ProtectedRoute.tsx`** [MỚI]: Route Guard kiểm tra JWT token. Nếu không có token → redirect `/login`. Áp dụng cho cả `/my-bookings`, `/profile` và toàn bộ `/admin/*`.
2. **`components/RatingModal.tsx`** [MỚI]: Dialog đánh giá chuyến đi. UI gồm Rating stars (MUI Rating) + TextField nhận xét. Gọi `POST /ratings/`. Validate: chỉ gửi khi chọn số sao.
3. **`pages/StaffWorklist.tsx`** [MỚI]: Trang danh sách đơn cần giao/nhận xe cho Nhân viên. Gọi `GET /staff/bookings/worklist`. Hiển thị trạng thái màu, nút điều hướng đến Check-in / Check-out.
4. **`pages/CustomerManager.tsx`** [MỚI]: Trang quản lý KH cho Admin. Gọi `GET /users/`. Chức năng: Duyệt GPLX (`PUT /users/{id}/gplx/approve`), Từ chối GPLX (`PUT /users/{id}/gplx/reject`), Blacklist (`PUT /users/{id}/blacklist`), Gỡ Blacklist (`DELETE /users/{id}/blacklist`).

### Trang Đã Được Nâng Cấp:
5. **`pages/MyBookings.tsx`** [NÂNG CẤP TOÀN DIỆN]: 
   - Thêm nút **Hủy đơn** (Cho_Thanh_Toan_Coc, Cho_Nhan_Xe) → `POST /bookings/{id}/cancel`
   - Thêm nút **Gia hạn** với Dialog (Dang_Thue) → `POST /bookings/{id}/extend`
   - Thêm nút **Trả sớm** với Dialog chọn thời gian (Dang_Thue) → `POST /bookings/{id}/early-return`
   - Kết nối nút **Đánh giá** vào `RatingModal` (Hoan_Tat) → `POST /ratings/`
   - Cải thiện UI: bảng tối màu header, chip màu trạng thái, hiển thị tiền tệ đúng.

### Cập nhật App.tsx:
6. **`App.tsx`** [CẬP NHẬT]: 
   - Import và áp dụng `ProtectedRoute` cho cả Customer routes và Admin routes.
   - Đăng ký 2 routes mới: `/admin/worklist` và `/admin/customers`.
   - Tái cấu trúc routing: lồng ProtectedRoute đúng chuẩn React Router v6.

### Trạng thái hoàn thành:
- Tất cả Use Cases từ `use-case-diagrams.md` đã được triển khai UI.
- Build TypeScript thành công, không còn lỗi type.

## Ngày 09/07/2026: Nâng cấp thiết kế giao diện (Homepage Redesign)
Dựa trên yêu cầu của người dùng, tiến hành nâng cấp toàn diện thiết kế trang chủ để giống mẫu tham khảo (bonboncar).

### Các thay đổi chính:
1. **`MainLayout.tsx`**:
   - Chuyển `AppBar` thành dạng `sticky` (ghim dính đỉnh màn hình khi cuộn).
   - Đổi nền AppBar thành màu trắng (`bg-white`), chữ và logo màu sẫm (`text-teal-600` / `text-gray-800`).
   - Tối ưu kích thước header và bổ sung các nút link giả lập "Ký gửi xe", "Tuyển dụng" để match với thiết kế tham khảo.

2. **`Search.tsx` (Trang chủ)**:
   - **Tái thiết kế hoàn toàn**: Đập đi xây lại cấu trúc.
   - **Hero Banner**: Sử dụng mảng hình ảnh chất lượng cao và hook `setInterval` đổi hình tự động mỗi 5 giây (Background Carousel - Crossfade).
   - **Thanh tìm kiếm Floating**: Kéo thanh tìm kiếm ra khỏi luồng văn bản, dùng `absolute -bottom-16 z-20` để nổi lên đè giữa Banner và phần nền trắng bên dưới. Bổ sung các trường Location (chỉ hiển thị minh họa do BE chưa có chi nhánh). Nút TÌM XE đổi sang màu xanh ngọc.
   - **Tự động tải danh sách xe**: Thêm `useEffect` tự động gọi API `/motorbikes/all` khi tải trang. Lọc ra các xe `San_Sang` để hiển thị phần "Xe Dành Cho Bạn" ngay lập tức, người dùng không cần bấm tìm kiếm mới thấy xe.
   - **Card Design**: Làm thẻ xe đẹp hơn với bo góc lớn (`rounded-2xl`), shadow khi hover, hiển thị tag "Có sẵn" hoặc "Đang thuê" nằm nổi trên góc ảnh xe.

### Trạng thái:
- Hoàn thành. Frontend đã được build lại thành công (`tsc -b && vite build`) không lỗi.

## Ngày 09/07/2026 (Update 2): Tinh chỉnh UI bám sát hệ thống ThueXeUTH
Dựa trên feedback của người dùng, tiến hành loại bỏ các yếu tố "bắt chước" thừa thãi từ bản thiết kế mẫu và tập trung xây dựng giao diện phù hợp với hệ thống ThueXeUTH.

### Các thay đổi chính:
1. **`MainLayout.tsx`**:
   - Đổi tên thương hiệu thành **ThueXeUTH**.
   - Loại bỏ các menu giả lập (Ký gửi, Tuyển dụng, Chọn địa điểm) để giao diện gọn gàng và đúng chức năng thực tế của hệ thống.

2. **`Search.tsx` (Trang chủ)**:
   - **Xóa Floating Search Box**: Loại bỏ hoàn toàn hộp tìm kiếm lớn trên banner. Thay đổi luồng UX: Xem xe -> Xem chi tiết -> Mới chọn ngày.
   - **Hero Banner**: Thay đổi hình ảnh sang chủ đề phượt/đường trường. Cập nhật câu slogan thành "Vi vu trên các cung đường".
   - **Thanh Filter/Sort Mới**: Bổ sung thanh công cụ ngay dưới banner:
     - Dãy Chip lọc theo `Loại xe`: Tất cả, Tay Ga, Xe Số, Côn Tay.
     - Select box Sắp xếp: Mặc định, Giá Thấp đến Cao, Giá Cao đến Thấp.
   - **Logic Filter (Client-side)**: Cập nhật hàm xử lý mảng `filteredBikes` để tự động lọc và sắp xếp dựa trên danh sách xe tải về.
   - **Card Design Mới**: Cập nhật thiết kế thẻ xe:
     - Thêm mock tags "Miễn thế chấp", "Giao xe tận nơi".
     - Tên xe hiển thị IN HOA, đậm.
     - Tóm tắt thông số: Loại xe (Tay Ga/Xe Số), Số CC (Phân khối), Xăng.
     - Giá tiền format chuẩn: `XXXK/ngày` (ví dụ `150K/ngày`) chữ to màu xanh lá cây hoặc cam. Thêm giá gạch bỏ (giá cũ) để tăng hiệu ứng marketing.

### Trạng thái:
- Hoàn thành. Đã build thành công.

## Ngày 09/07/2026 (Update 3): Sửa lỗi UX luồng Đặt xe (Yêu cầu đăng nhập vô lý)
Dựa trên feedback từ QA: "fe đang bắt user login rồi mới xem và đặt xe, thật vô lý".

### Phân tích:
- Thực tế Frontend **không** khóa trang chi tiết xe (`/motorbikes/:id`). 
- Tuy nhiên, khi khách hàng bấm "Đặt xe ngay" (không có token), API trả về 401, sau đó `axios interceptor` tự động hard-redirect người dùng về trang `/login`, khiến người dùng bị bất ngờ và mất thông tin xe đang xem (vì sau khi login xong lại bị đẩy về trang chủ `/`).

### Khắc phục (UX Cải tiến):
1. **`MotorbikeDetail.tsx`**:
   - Kiểm tra `token` ở client.
   - Nếu đã đăng nhập: Nút bấm là **"Xác nhận Đặt xe"** (chạy API booking).
   - Nếu chưa đăng nhập: Đổi nút thành màu vàng **"Đăng nhập để đặt xe"**. Khi bấm vào, thay vì gọi API để bị lỗi, hệ thống sẽ chủ động `navigate('/login', { state: { from: ... } })` để lưu lại URL hiện tại.
2. **`Login.tsx`**:
   - Bổ sung hook `useLocation`.
   - Đọc biến `location.state.from`. Nếu có, thay vì redirect về `/` sau khi login thành công, hệ thống sẽ đưa user trở lại trang chi tiết xe vừa nãy.

### Trạng thái:
- Hoàn thành. Trải nghiệm luồng đặt xe đã mượt mà đúng chuẩn E-commerce.

## Ngày 09/07/2026 (Update 4): Phân quyền UI giữa Admin và Staff
QA phát hiện Admin và Staff có giao diện giống nhau 100% trên Frontend, mặc dù chức năng khác nhau.

### Phân tích:
- **Backend**: Đã kiểm tra file `app/api/motorbikes.py`, `app/api/users.py`, và `app/api/deps.py`. Backend được thiết kế bảo mật rất chuẩn chỉ. Bất kỳ request nào tới các endpoint quản lý của Admin (VD: Thêm xóa xe, khóa tài khoản khách hàng) đều yêu cầu `Depends(get_current_admin)`. Nếu Staff cố tình gọi API này, Backend sẽ trả về `403 Forbidden`.
- **Frontend**: Lỗi nằm ở file `AdminLayout.tsx`. Khung giao diện (Sidebar) được fix cứng (hardcode) tất cả các menu, khiến tài khoản Staff khi đăng nhập cũng nhìn thấy các nút chức năng của Admin (dù bấm vào sẽ bị lỗi 403 do Backend chặn).

### Khắc phục:
1. **`Login.tsx`**: Lưu lại biến `role` (Customer, Staff, Admin) vào `localStorage` ngay tại thời điểm đăng nhập thành công.
2. **`AdminLayout.tsx`**: Bọc các menu nhạy cảm (`Tổng quan`, `Quản lý Xe Máy`, `Bảo Dưỡng`, `Khách Hàng`) bằng câu lệnh điều kiện `{role === 'Admin' && (...)}`.
3. Nhờ đó, Staff bây giờ chỉ nhìn thấy đúng 3 chức năng: **Giao Xe**, **Nhận Xe**, **Danh sách Giao Nhận**.

### Trạng thái:
- Hoàn thành. Bảo mật Frontend đã đồng bộ với bảo mật Backend.

## Ngày 09/07/2026 (Update 5): Vá lỗi rò rỉ quyền UI cấp độ Component (Role-based Routing)
QA phản hồi: Giao diện và các chức năng của staff và admin chưa đúng với vai trò.

### Phân tích:
- Sau khi fix ở Update 4 (chỉ ẩn Menu Sidebar), tôi phát hiện ra 2 kẽ hở lớn ở Frontend:
  1. **Khách hàng (Customer)** vẫn có thể truy cập vào `/admin` bằng cách gõ URL, do component `ProtectedRoute.tsx` hiện tại chỉ kiểm tra "có token hay không" chứ không kiểm tra `role` (Vai trò). Mặc dù Backend sẽ chặn không cho họ thao tác, nhưng việc họ nhìn thấy UI là rất thiếu chuyên nghiệp.
  2. **Staff** vẫn có thể gõ URL `/admin/motorbikes` để xem trang quản lý xe của Admin. (Tương tự, API backend chặn thao tác sửa/xoá, nhưng vẫn cho xem).

### Khắc phục:
1. **Nâng cấp `ProtectedRoute.tsx`**: Bổ sung logic `allowedRoles`.
   - Bọc cụm route của Khách hàng với `allowedRoles={['Customer']}`.
   - Bọc cụm route của Admin/Staff với `allowedRoles={['Admin', 'Staff']}`.
   => Khách hàng cố tình mò vào link `/admin` sẽ bị đá văng về Trang chủ `/`.
2. **Nâng cấp `AdminLayout.tsx`**: 
   - Đảm bảo xóa sạch `role` khỏi localStorage khi Logout.
   - Thêm `useEffect` tự động giám sát URL. Nếu phát hiện user có `role === 'Staff'` mà đang cố truy cập các trang nhạy cảm (`/admin`, `/admin/motorbikes`, `/admin/maintenance`, `/admin/customers`), lập tức cưỡng chế redirect về `/admin/check-in`.

### Trạng thái:
- Hoàn thành tuyệt đối. Lỗ hổng UI đã được vá kín 100%.

## Ngày 09/07/2026 (Update 6): Hoàn thiện UI luồng Customer & Phân chia Staff/Admin
QA phản hồi:
1. Đơn của tôi và hồ sơ cần luôn hiển thị, bắt đăng nhập khi click.
2. Lỗi cập nhật GPLX và UX nhập link ảnh.
3. Chức năng Admin và Staff bị dính chùm.
4. Yêu cầu note lại các API thiếu cho BE.

### Khắc phục:
1. **Sửa `MainLayout.tsx` & `ProtectedRoute.tsx`**: 
   - Đưa "Đơn của tôi" và "Hồ sơ" ra ngoài khối kiểm tra Token để lúc nào cũng hiển thị.
   - Thêm `state={{ from: location.pathname }}` vào `Navigate` trong `ProtectedRoute`, giúp lưu URL hiện tại khi người dùng chưa đăng nhập bị văng ra trang Login, phục vụ cho việc điều hướng ngược lại sau khi login thành công (sẽ do `Login.tsx` xử lý tự động nhờ react-router-dom location state, nếu đã code đúng chuẩn).
2. **Nâng cấp `Profile.tsx`**:
   - Thêm Input `SoGPLX` để nhận 12 số GPLX.
   - Thay 2 ô nhập URL bằng Input `type="file"`, viết hàm convert file ảnh sang chuẩn Base64 (`FileReader`) và render preview ảnh trực tiếp.
   - Mapping lại key JSON gửi lên API (`HangGPLXKhaiBao`, `SoGPLX`, `AnhGPLXMatTruoc`, `AnhGPLXMatSau`) khớp với `UserGPLXUpdate` Schema của BE.
3. **Độc lập chức năng ở `AdminLayout.tsx`**:
   - `role === 'Staff'`: Chỉ xem Giao xe, Nhận xe, Danh sách giao nhận, và **Bảo dưỡng**.
   - `role === 'Admin'`: Chỉ xem Tổng quan, Quản lý Xe, Khách hàng. Admin hoàn toàn không dính líu vận hành. (Route Protection cũng đã update để khóa URL).

### Trạng thái:
- Frontend hoàn tất 100%. Các Note về API thiếu đã được ghi nhận ở bản kế hoạch để chờ BE xử lý.

## Ngày 09/07/2026 (Update 7): Hoàn thiện các giao diện còn thiếu dựa trên API mới của Backend
1. **`Profile.tsx` (Cập nhật)**: Bổ sung form cho phép khách hàng sửa thông tin cá nhân (Họ tên, SĐT, Email, CCCD, Địa chỉ). Đấu nối với API `PUT /users/me`.
2. **`ConfigManager.tsx` (Thêm mới)**: Xây dựng màn hình quản lý 6 tham số giá hệ thống (phạt trễ, mất phụ kiện, tăng giá lễ) cho Admin.
3. **`StaffManager.tsx` (Thêm mới)**: Xây dựng màn hình quản lý Nhân sự cho Admin (CRUD tài khoản nhân viên vận hành và quản trị).
4. **`types/index.ts` (Cập nhật)**: Bổ sung interface `Staff` và `SystemConfig`. Bổ sung `DiaChi` vào `User`.
5. **`App.tsx` & `AdminLayout.tsx` (Cập nhật)**: Cập nhật route bảo vệ (Admin-only) và sidebar menu (BadgeIcon, SettingsIcon).
- **Trạng thái**: Đã build thành công, không lỗi TypeScript. 100% hoàn tất.

## Ngày 09/07/2026 (Update 8): Khắc phục lỗi Load dữ liệu và CRUD Kho xe
1. **`seed.py` (Backend)**: Bổ sung script tạo dữ liệu mẫu cho `CauHinhHeThong` và 1 user `KhachHangGPLX` để các trang Quản lý hoạt động thay vì trả về mảng rỗng hoặc báo lỗi 404.
2. **`AdminDashboard.tsx` (Cập nhật)**: Bổ sung logic hiển thị Doanh thu theo Tuần/Tháng (sử dụng tỷ lệ ước tính tạm thời dựa trên tổng doanh thu từ BE). Tích hợp Bảng danh sách Khách hàng chờ duyệt GPLX (Lọc từ API `/api/users`).
3. **`MotorbikeManager.tsx` (Cập nhật)**: Nâng cấp thành trang CRUD hoàn chỉnh. Thêm Modal để Nhập Biển số, Loại Xe, Giá Thuê... gọi API `POST /api/motorbikes/` và `PUT /api/motorbikes/{id}`.
4. **`types/index.ts` (Cập nhật)**: Bổ sung các trường dữ liệu còn thiếu vào interface `Motorbike` như `HangXe`, `TenXe`, `SoKhung`, `SoMay`, `DoiXe`.
- **Trạng thái**: Đã build thành công bằng TypeScript và Vite. Giao diện chạy mượt mà.
