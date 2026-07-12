# TÀI LIỆU ĐẶC TẢ GIAO DIỆN NGƯỜI DÙNG (UI/UX SPECIFICATIONS)

Tài liệu này đặc tả chi tiết cấu trúc, luồng hoạt động và các thành phần giao diện của ứng dụng **SmartRental** cho cả 3 vai trò (Roles) tương ứng với mã nguồn thực tế: **Khách hàng (Customer)**, **Nhân viên (Staff)** và **Quản trị viên (Admin)**.

---

## 1. PHÂN HỆ KHÁCH HÀNG (CUSTOMER APP)

Được thiết kế dưới dạng ứng dụng di động tối ưu hiển thị, tập trung vào trải nghiệm đặt xe mượt mà và cá nhân hóa.

### 1.1. Màn hình Đăng ký / Đăng nhập (Register / Login)
- **Mục đích:** Xác thực danh tính khách hàng trước khi sử dụng hệ thống.
- **Thành phần giao diện:**
  - *Đăng ký (`Register.tsx`):* Họ tên (yêu cầu $\ge 2$ ký tự), Email (regex kiểm tra định dạng), Số điện thoại (10 chữ số bắt đầu bằng `0`), Mật khẩu ($\ge 6$ ký tự), CCCD (12 chữ số) và Hạng bằng lái xe khai báo (A1, A2, Không có).
  - *Đăng nhập (`Login.tsx`):* Nhập Email/Số điện thoại và Mật khẩu. Có nút điều hướng đăng ký tài khoản mới.
- **Ràng buộc UI (Validation):** Chặn submit và báo lỗi đỏ ngay tại form nếu nhập sai định dạng.

### 1.2. Màn hình Tìm kiếm & Lọc xe (Search & Filter)
- **Mục đích:** Giúp khách hàng tìm kiếm xe máy phù hợp theo nhu cầu và thời gian.
- **Thành phần giao diện:**
  - *Thanh tìm kiếm:* Tìm theo tên xe hoặc hãng xe.
  - *Bộ lọc phân loại:* Tabs/Chips lọc nhanh: Xe Ga, Xe Số, Xe Côn, Xe phân khối lớn (PKL).
  - *Danh sách xe:* Hiển thị dưới dạng thẻ (Card) bao gồm hình ảnh xe, tên xe, phân khối (cc), đơn giá/ngày và trạng thái xe (`San_Sang`, `Dang_Thue`, `Dang_Bao_Duong`).
  - *Bộ lọc thời gian:* Chọn ngày nhận và trả dự kiến để lọc các xe còn trống.

### 1.3. Màn hình Chi tiết Xe & Đặt xe (Motorbike Detail)
- **Mục đích:** Xem thông số kỹ thuật chi tiết của xe, nhận xét từ khách khác và tiến hành đặt xe.
- **Thành phần giao diện:**
  - *Thông tin xe:* Hình ảnh xe lớn, Hãng xe, Dòng xe, Phân khối, ODO hiện tại và giá thuê ngày.
  - *Quy định & Bảng phí đền bù:* Hiển thị rõ các quy định sử dụng, mức phạt trễ hạn, và đền bù nếu làm mất mũ bảo hiểm/áo mưa.
  - *Khối đặt xe:* Ô nhập ngày giờ nhận/trả xe (Datetime-local). Nút bấm `[ Xác nhận Đặt xe ]`.
  - *Danh sách đánh giá:* Hiển thị danh sách đánh giá từ các khách hàng trước (số sao và nội dung).
- **Ràng buộc UI (Validation):** Cấm chọn thời gian nhận trong quá khứ và thời gian trả trước thời gian nhận.

### 1.4. Màn hình Quản lý Đơn đặt & Lịch sử Thuê (My Bookings)
- **Mục đích:** Theo dõi trạng thái đơn đặt xe hiện tại, thanh toán cọc và thực hiện các yêu cầu phát sinh.
- **Thành phần giao diện:**
  - *Danh sách đơn:* Phân chia theo trạng thái (Chờ thanh toán cọc, Chờ nhận xe, Đang thuê, Hoàn tất, Đã hủy).
  - *Chi tiết đơn:* Hiển thị mã đơn (`Booking ID`), biển số xe, tổng tiền, tiền cọc.
  - *Nút hành động theo ngữ cảnh:*
    - Nút `[ Thanh toán cọc ]` (chuyển qua giao diện mô phỏng Payment Gateway).
    - Nút `[ Hủy đơn ]` (chỉ khả dụng khi chưa nhận xe, kèm thông báo về tỷ lệ hoàn cọc).
    - Nút `[ Yêu cầu trả sớm ]` / `[ Yêu cầu gia hạn ]` (khi đang trong quá trình thuê xe).
    - Nút `[ Đánh giá chuyến đi ]` (khi đơn đã hoàn tất).

### 1.5. Màn hình Hồ sơ & Xác thực GPLX (Profile)
- **Mục đích:** Quản lý thông tin tài khoản và tải lên hình ảnh GPLX để được cấp quyền thuê xe.
- **Thành phần giao diện:**
  - *Thông tin cá nhân:* Sửa Họ tên, SĐT, Email, CCCD, Địa chỉ.
  - *Cập nhật GPLX:* Chọn Hạng GPLX (A1/A2), nhập Số GPLX (12 chữ số) và nút upload ảnh Mặt trước / Mặt sau GPLX.
  - *Trạng thái hồ sơ:* Hiển thị trạng thái duyệt GPLX (`Khong_Dang_Ky`, `Da_Upload` - Chờ duyệt, `Da_Xac_Thuc`, `Tu_Choi`).

---

## 2. PHÂN HỆ NHÂN VIÊN (STAFF DASHBOARD)

Được tối ưu giao diện web-responsive, phục vụ các tác vụ xử lý trực tiếp tại quầy và thẩm định hồ sơ của khách.

### 2.1. Màn hình Danh sách công việc (Staff Worklist / Dashboard)
- **Mục đích:** Trung tâm điều phối công việc hàng ngày của nhân viên cửa hàng.
- **Thành phần giao diện:**
  - Chia làm 2 danh sách rõ ràng:
    - *Danh sách nhận xe (Check-in):* Các đơn đặt xe có trạng thái `Cho_Nhan_Xe` chuẩn bị đến giờ giao.
    - *Danh sách trả xe (Check-out):* Các đơn đặt xe đang trạng thái `Dang_Thue` hoặc `Qua_Han` cần thu hồi.
  - Nút hành động nhanh: `[ Bàn giao (Check-in) ]` và `[ Nhận lại xe (Check-out) ]`.

### 2.2. Màn hình Nghiệp vụ Giao xe (Check-in)
- **Mục đích:** Ghi nhận hiện trạng xe thực tế lúc giao cho khách hàng và xác thực bằng lái vật lý.
- **Thành phần giao diện:**
  - Nhập mã đơn đặt xe (`Booking ID`).
  - Ô nhập chỉ số ODO hiện tại của xe (cấm nhập số âm).
  - Chọn mức xăng thực tế khi bàn giao (Đầy, 3/4, 1/2, 1/4, Gần hết).
  - Nhập số lượng mũ bảo hiểm giao (mặc định là 2, giới hạn từ 0 - 2).
  - Tùy chọn tích chọn `[ Có áo mưa ]`.
  - Khối kiểm tra GPLX: Tích chọn `[ Phát hiện Khách Gian Lận GPLX ]` nếu khách cố tình mang GPLX giả hoặc không đúng thông tin. Hệ thống sẽ tự động hủy đơn, phạt 100% cọc và đưa khách hàng vào Blacklist.
  - Nút bấm `[ Xác Nhận Check-in ]`.

### 2.3. Màn hình Nghiệp vụ Nhận xe & Quyết toán (Check-out)
- **Mục đích:** Ghi nhận hiện trạng xe khi khách trả xe, tự động tính toán biểu phí phát sinh và xuất hóa đơn quyết toán.
- **Thành phần giao diện:**
  - Nhập mã đơn đặt xe (`Booking ID`).
  - Ô nhập chỉ số ODO trả xe (chặn nhập nhỏ hơn ODO lúc nhận xe).
  - Chọn mức xăng thực tế lúc thu hồi.
  - Chọn số mũ bảo hiểm thu lại và tích chọn trạng thái thu lại áo mưa.
  - Khối chi phí đền bù: Nhập số tiền phạt hư hại phát sinh (`PhiDenBuHuHai`) và ô bắt buộc nhập lý do phạt (`LyDoPhat`) nếu tiền đền bù $> 0$.
  - *Hóa đơn quyết toán tự động:* Sau khi submit, hệ thống hiển thị bảng tính tiền chi tiết gồm: Tiền thuê gốc, phí trễ hạn (nếu có), phí đền bù phụ kiện mất (nếu thiếu mũ/áo mưa), phí đền bù hư hại xe. Hiển thị số tiền khách cần đóng thêm hoặc số tiền cửa hàng hoàn trả lại cho khách.

### 2.4. Màn hình Duyệt GPLX Khách hàng (Staff GPLX Review)
- **Mục đích:** Nhân viên thẩm định hình ảnh bằng lái xe của khách hàng gửi lên hệ thống.
- **Thành phần giao diện:**
  - Danh sách khách hàng đang chờ duyệt bằng lái (`Da_Upload`).
  - Bảng so sánh thông tin: Họ tên, Số GPLX, ảnh chụp mặt trước và mặt sau bằng lái của khách hàng.
  - Nút bấm duyệt nhanh: `[ Phê duyệt (Xác thực) ]` hoặc `[ Từ chối ]`. Nếu Từ chối, nhân viên phải nhập lý do để gửi thông báo cho khách hàng cập nhật lại.

---

## 3. PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN DASHBOARD)

Giao diện quản trị nâng cao (Desktop-first), cho phép quản lý toàn diện tài nguyên, biểu phí và nhân sự của hệ thống.

### 3.1. Màn hình Báo cáo Thống kê (Admin Dashboard)
- **Mục đích:** Cung cấp cái nhìn toàn cảnh về tình hình kinh doanh của cửa hàng.
- **Thành phần giao diện:**
  - Thẻ thông số tổng hợp (KPI Cards): Tổng doanh thu, Chi phí bảo dưỡng, Doanh thu thuần, Tổng số đầu xe, Lượng xe đang cho thuê, Lượng xe đang bảo dưỡng.
  - Biểu đồ đường/cột biểu diễn xu hướng doanh thu theo tuần/tháng.
  - Danh sách 10 đơn đặt xe mới nhất.

### 3.2. Màn hình Quản lý Phương tiện (Motorbike Manager)
- **Mục đích:** Quản lý danh mục xe máy trong cửa hàng (thêm mới, chỉnh sửa thông tin xe, cập nhật trạng thái).
- **Thành phần giao diện:**
  - Bảng danh sách xe máy: Mã xe, Biển số, Hãng xe, Dòng xe, Phân khối, Nhóm bằng lái yêu cầu (A1/A2), Đơn giá ngày và Trạng thái (`San_Sang`, `Dang_Thue`, `Dang_Bao_Duong`).
  - Form thêm/sửa xe: Nhập chi tiết biển số, số khung, số máy, phân khối, giá thuê ngày, và upload ảnh xe.

### 3.3. Màn hình Quản lý Khách hàng & Blacklist (Customer Manager)
- **Mục đích:** Giám sát danh sách tài khoản khách hàng, lịch sử thuê xe và quản lý danh sách đen.
- **Thành phần giao diện:**
  - Danh sách khách hàng: ID, Họ tên, SĐT, Email, Nhóm xe được thuê, Trạng thái bằng lái.
  - Nút hành động nhanh: `[ Khóa tài khoản ]` hoặc `[ Đưa vào Blacklist ]`. Khi đưa vào Blacklist, yêu cầu nhập lý do vi phạm (ví dụ: phá hỏng xe, nợ tiền quyết toán, gian lận bằng lái).

### 3.4. Màn hình Quản lý Nhân viên (Staff Manager)
- **Mục đích:** Cấp tài khoản và phân quyền cho nhân viên cửa hàng.
- **Thành phần giao diện:**
  - Danh sách nhân viên hiện tại gồm: Mã nhân viên, Họ tên, Email, Số điện thoại và Vai trò (Nhân viên, Admin).
  - Nút thêm mới nhân viên: Điền Họ tên, Email, SĐT, lựa chọn vai trò phân quyền và nhập mật khẩu khởi tạo ban đầu.

### 3.5. Màn hình Quản lý Bảo dưỡng (Maintenance Manager)
- **Mục đích:** Ghi nhận lịch trình bảo dưỡng định kỳ và chi phí sửa chữa phương tiện.
- **Thành phần giao diện:**
  - Danh sách xe đang bảo dưỡng.
  - Nút `[ Tạo phiếu bảo dưỡng ]`: Chọn xe máy cần bảo dưỡng, chọn ngày bảo dưỡng, nhập chi phí sửa chữa (cấm nhập số âm) và chi tiết các hạng mục bảo trì.

### 3.6. Màn hình Thiết lập Cấu hình Hệ thống (Config Manager)
- **Mục đích:** Điều chỉnh các thông số cấu hình biểu phí phạt và chính sách tăng giá.
- **Thành phần giao diện:**
  - *Số lần gia hạn tối đa:* Giới hạn số lần khách được tự gia hạn đơn trên App.
  - *Đơn giá phạt trễ hạn theo giờ:* Phân biệt mức phạt xe thường (ví dụ: 30.000đ/giờ) và xe PKL (ví dụ: 50.000đ/giờ).
  - *Đơn giá đền bù phụ kiện:* Phí đền bù làm mất mũ bảo hiểm hoặc làm mất áo mưa.
  - *Hệ số tăng giá ngày lễ:* Tỷ lệ tăng giá tự động áp dụng vào các dịp lễ Tết (ví dụ: tăng 10% - 20%).
  - Nút lưu cấu hình và cập nhật tức thì lên hệ thống tính toán.
