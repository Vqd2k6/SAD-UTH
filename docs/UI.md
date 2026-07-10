# TÀI LIỆU ĐẶC TẢ GIAO DIỆN NGƯỜI DÙNG (UI SPECIFICATIONS)

Dựa trên các bản phác thảo (wireframes) ban đầu, tài liệu này chuẩn hóa và đặc tả chi tiết giao diện người dùng (UI) cho ứng dụng di động **SmartRental**.

---

## 1. TỔNG QUAN LUỒNG TRẢI NGHIỆM (USER FLOW)

Ứng dụng được chia làm 2 phân hệ giao diện chính:
1. **Phân hệ Khách hàng (Customer App):** 
   Đăng nhập $\rightarrow$ Tìm kiếm xe $\rightarrow$ Xem chi tiết $\rightarrow$ Đặt xe $\rightarrow$ Thanh toán $\rightarrow$ Quản lý lịch sử thuê & Hồ sơ cá nhân.
2. **Phân hệ Nhân viên (Staff Dashboard):** 
   Dashboard quản lý đơn $\rightarrow$ Thực hiện Check-in (Bàn giao xe) $\rightarrow$ Thực hiện Check-out (Nhận lại xe & Quyết toán).

---

## 2. ĐẶC TẢ CHI TIẾT CÁC MÀN HÌNH (SCREENS)

### 2.1. Nhóm Màn hình Xác thực & Trang chủ

#### Screen 1: Đăng Nhập (Login)
*Màn hình chào mừng và xác thực người dùng.*
- **Header:** Đăng Nhập / Chào mừng quay trở lại
- **Form inputs:**
  - `Tên đăng nhập / Email`
  - `Mật khẩu`
- **Controls:**
  - Checkbox: `Ghi nhớ mật khẩu`
  - Nút bấm chính: `[ ĐĂNG NHẬP ]`
  - Nút điều hướng: `Đăng ký tài khoản mới` | `Quên mật khẩu`

#### Screen 2: Tìm kiếm & Lọc (Home / Search)
*Trang chủ mặc định sau khi đăng nhập, giúp khách hàng tìm xe nhanh.*
- **Thanh tìm kiếm (Search Bar):** Nhập tên xe hoặc biển số.
- **Bộ lọc nhanh (Quick Filters):**
  - **Thương hiệu:** Nút chọn `[Honda]`, `[Yamaha]`, `[Suzuki]`...
  - **Phân loại xe:** Các Tab/Chip `[Xe Số]`, `[Xe Ga]`, `[Xe Côn]` để lọc danh sách bên dưới.

#### Screen 3: Kết quả Tìm kiếm (Search Results)
*Hiển thị danh sách xe thỏa mãn điều kiện.*
- **Giao diện:** Dạng danh sách (List View) hoặc Dạng thẻ (Card View).
- **Thành phần trên mỗi Thẻ xe (Vehicle Card):**
  - Hình ảnh xe (Thumbnail).
  - Tên xe: `Honda Air Blade 125`
  - Phân loại: `Xe Ga`
  - Đơn giá: `150.000đ / ngày`
  - Nút hành động: `[ Xem chi tiết ]`
- **Bottom Navigation (Thanh điều hướng dưới):** `🏠 Home` | `📄 Đặt thuê` | `👤 Cá nhân`

---

### 2.2. Nhóm Màn hình Đặt xe & Thanh toán

#### Screen 4: Chi tiết Xe (Vehicle Details)
*Hiển thị đầy đủ thông số kỹ thuật và tình trạng xe để khách ra quyết định.*
- **Header:** Nút Back `< Chi tiết xe`
- **Hình ảnh:** Carousel ảnh xe chất lượng cao.
- **Thông tin nổi bật:** 
  - Tên xe, Phân loại, Giá ngày.
  - Điểm đánh giá: `⭐ 4.8 / 5`
- **Thông số kỹ thuật:**
  - Màu sắc: `Đen` | Năm sản xuất: `2024` | ODO hiện tại | Mức tiêu hao nhiên liệu.
- **Mô tả:** Đoạn văn ngắn giới thiệu tình trạng xe.
- **Nút hành động cố định (Sticky Button):** `[ ĐẶT XE NGAY ]`

#### Screen 5: Khởi tạo Booking (Booking Form)
*Thiết lập thời gian và tùy chọn giao nhận.*
- **Header:** Nút Back `< Đặt xe`
- **Tóm tắt xe:** `Honda Air Blade 125 - 150.000đ/ngày`
- **Form nhập liệu:**
  - `Ngày nhận (Pick-up Date & Time)`
  - `Ngày trả (Drop-off Date & Time)`
  - Dropdown: `Phương thức giao nhận (Tại cửa hàng / Giao tận nơi)`
  - Textarea: `Ghi chú cho nhân viên`
- **Nút hành động:** `[ CHUYỂN ĐẾN THANH TOÁN ]`

#### Screen 6: Thanh Toán (Checkout / Payment)
*Chốt chi phí và chọn phương thức thanh toán.*
- **Header:** Nút Back `< Thanh toán`
- **Hóa đơn tạm tính (Summary):**
  - Xe: `Honda Air Blade 125`
  - Thời gian thuê: `2 ngày`
  - Tổng tiền: `300.000đ` (Có thể hiển thị thêm dòng Phí cọc 30%).
- **Lựa chọn thanh toán (Radio Buttons):**
  - `( ) Tiền mặt`
  - `(•) Chuyển khoản ngân hàng`
  - `( ) Ví điện tử (MoMo/VNPAY)`
- **Nút hành động:** `[ XÁC NHẬN THANH TOÁN ]`

#### Screen 7: Xác nhận Thành công (Booking Success)
*Màn hình thông báo trạng thái giao dịch.*
- **Visual:** Icon Checkmark lớn (✔️) màu xanh lá.
- **Tiêu đề:** `Cảm ơn bạn đã đặt xe!`
- **Chi tiết đơn hàng:**
  - Mã đơn: `#BK-10293`
  - Xe: `Honda Air Blade 125`
  - Nhận: `01/01/2024` - Trả: `03/01/2024`
  - Đã thanh toán: `300.000đ`
- **Nút hành động:** `[ Về Trang Chủ ]` hoặc `[ Xem đơn đặt ]`

---

### 2.3. Nhóm Màn hình Quản lý Cá nhân

#### Screen 8: Lịch sử Thuê xe (Rental History)
*Nơi khách hàng theo dõi các chuyến đi.*
- **Header:** `Lịch sử thuê`
- **Tab Control:** `[ Đã đặt ]` | `[ Đang thuê ]` | `[ Lịch sử ]`
- **Thẻ đơn hàng (Order Card):**
  - Mã đơn, Tên xe, Thời gian thuê.
  - Trạng thái bằng màu sắc: `Đang chờ` (Vàng), `Đang thuê` (Xanh), `Hoàn thành` (Xám).
  - Nút phụ: `Yêu cầu gia hạn` (nếu đang thuê).

#### Screen 9: Hồ sơ (Profile)
*Quản lý thông tin tài khoản.*
- **Header:** `Hồ sơ cá nhân`
- **Avatar & Thông tin cơ bản:** 
  - Ảnh đại diện, Họ tên (`Nguyễn Văn A`).
  - SĐT, Email.
- **Menu chức năng:**
  - `Quản lý GPLX` (Tải lên / Xét duyệt).
  - `Cập nhật mật khẩu`.
  - `Cài đặt thông báo`.
- **Nút hành động:** `[ Đăng xuất ]` (Màu đỏ).

---

### 2.4. Phân hệ Nhân viên (Staff / Operation)

#### Screen 10: Staff Dashboard
*Trung tâm điều phối công việc hàng ngày của nhân viên tại quầy.*
- **Header:** `Dashboard Quản lý`
- **Tab Control:** `[ Cần Giao (Check-in) ]` | `[ Cần Thu (Check-out) ]`
- **Danh sách Task:**
  - Hiển thị danh sách khách hàng chuẩn bị tới nhận xe hoặc trả xe.
  - Mỗi item có nút: `[ Tiến hành Check-in ]` hoặc `[ Tiến hành Check-out ]`.

#### Screen 11: Form Bàn Giao / Thu Hồi (Check-in / Check-out Form)
*Màn hình nghiệp vụ chính của nhân viên để ghi nhận thực tế.*
- **Header:** `Biên bản Check-in` (hoặc Check-out)
- **Thông tin Hợp đồng:** Mã đơn, Khách hàng, Tên xe, Biển số.
- **Form nhập liệu thực tế (Bắt buộc):**
  - `ODO hiện tại` (Nhập số km).
  - `Mức xăng` (Chọn: E, 1/4, 1/2, 3/4, F).
  - `Tình trạng ngoại quan` (Ghi chú vết xước, móp).
  - `Ảnh chụp minh chứng` (Nút mở Camera chụp 4 góc xe).
  - `Phụ kiện kèm theo` (Số Mũ bảo hiểm, Áo mưa).
- **Nút hành động:** `[ XÁC NHẬN BÀN GIAO ]` / `[ TẠO QUYẾT TOÁN ]`

---

## 3. ĐỀ XUẤT NÂNG CẤP (UI/UX IMPROVEMENTS)

Dựa trên wireframe thô, để sản phẩm chuyên nghiệp hơn khi đưa vào lập trình (đặc biệt nếu dùng React Native / Flutter), nhóm nên bổ sung các yếu tố sau:
1. **Empty States:** Cần thiết kế màn hình khi khách chưa có đơn thuê nào (Lịch sử trống) hoặc tìm kiếm không ra kết quả.
2. **Micro-interactions:** Thêm hiệu ứng loading khi bấm thanh toán, hiệu ứng transition mượt mà khi vuốt xem ảnh xe ở màn hình Chi tiết.
3. **Màu sắc & Typography:** 
   - Primary Color: Xanh dương đậm (Tin cậy, công nghệ).
   - Secondary Color: Cam (Nổi bật các nút Call-to-action như Đặt Xe).
   - Font chữ: Inter hoặc Roboto để dễ đọc các thông số số liệu.
4. **Giao diện chụp ảnh (Camera UI):** Ở màn hình 11 (Check-in), cần có Overlay hướng dẫn nhân viên chụp đúng các góc: Đầu xe, Đuôi xe, 2 Cạnh bên, Bảng đồng hồ ODO.
