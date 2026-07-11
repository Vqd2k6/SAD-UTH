# TÀI LIỆU THIẾT KẾ: SƠ ĐỒ LỚP CHI TIẾT (CLASS DIAGRAM)

**Quy ước Access Modifier:**
- `-` (private): Thuộc tính dữ liệu.
- `+` (public): Phương thức giao tiếp (Messages).
- `#` (protected): Thuộc tính dùng chung trong lớp cha.

---

## 1. SƠ ĐỒ LỚP TỔNG QUAN (DOMAIN MODEL)

```mermaid
classDiagram
    direction TB

    %% ============================================================
    %% CÁC LỚP NGƯỜI DÙNG (ACTOR CLASSES)
    %% ============================================================
    class NguoiDung {
        <<Abstract>>
        #String hoTen
        #String email
        #String soDienThoai
        #String matKhau
        #datetime ngayTao
        +login(email, matKhau) boolean
    }

    class KhachHang {
        -String maKhachHang
        -String cccd
        -String diaChi
        -boolean coGPLX
        -String maHangGPLX
        -String soGPLX
        -date ngayCapGPLX
        -date ngayHetHanGPLX
        -String anhGPLXMatTruoc
        -String anhGPLXMatSau
        -String trangThaiGPLX
        -String maNhomXeDuocThue
        -boolean trangThaiBlacklist
        -String lyDoBlacklist
        +uploadGPLX(anhTruoc, anhSau, hangGPLX) void
        +autoAssignVehicleGroup() void
        +rentalMotorbike(xeMay: XeMay, thoiGianNhan, thoiGianTra) HopDongBooking
        +requestExtension(booking: HopDongBooking, soNgayThem) boolean
        +requestEarlyReturn(booking: HopDongBooking) boolean
        +cancelBooking(booking: HopDongBooking) boolean
        +canRent(nhomXe) boolean
    }

    class NhanVien {
        -String maNhanVien
        -String vaiTro
        -boolean trangThaiTaiKhoan
        +approveGPLX(khachHang: KhachHang) boolean
        +rejectGPLX(khachHang: KhachHang) boolean
        +submitCheckin(booking: HopDongBooking, dataCheckin) boolean
        +submitCheckout(booking: HopDongBooking, dataCheckout) boolean
        +completeMaintenance(baoDuong: BaoDuong) boolean
        +addViolationNote(lichSu: LichSuThue, ghiChu) void
    }

    class Admin {
        +manageVehicle(action, vehicleData) void
        +manageStaff(action, staffData) void
        +updateSystemConfig(configData) void
        +addToBlacklist(khachHang: KhachHang, lyDo) void
        +generateNetRevenueReport() decimal
    }

    NguoiDung <|-- KhachHang
    NguoiDung <|-- NhanVien
    NhanVien <|-- Admin

    %% ============================================================
    %% CÁC LỚP ĐIỀU KHIỂN (CONTROL CLASSES - BUSINESS LOGIC)
    %% ============================================================

    class AuthController {
        +registerUser(thongTinCaNhan) KhachHang
        +uploadGPLX(maKhachHang, anhTruoc, anhSau, hangGPLX) boolean
        +reviewGPLX(maKhachHang, action) boolean
    }

    class BookingController {
        +createBooking(maXe, nhan, tra) HopDongBooking
        +checkEligibility(maKhachHang, maXe) boolean
        +processDepositPayment(maBooking, phuongThuc) boolean
        +requestExtension(maBooking, soNgayThem) boolean
        +processExtensionPayment(maBooking, phuongThuc) boolean
    }

    class OrderController {
        +submitCheckin(maBooking, checkinData) boolean
        +submitCheckout(maBooking, checkoutData) boolean
        +processPayment(amount) boolean
        +processRefund(amount) boolean
        +finalizeSettlement(maBooking) boolean
    }

    class MaintenanceController {
        +completeMaintenance(maBaoDuong) boolean
    }

    %% ============================================================
    %% CÁC LỚP NGHIỆP VỤ (BUSINESS CLASSES)
    %% ============================================================

    class XeMay {
        -String maXe
        -String bienSo
        -String soKhung
        -String soMay
        -String hangXe
        -String tenXe
        -String maLoaiXe
        -int phanKhoi
        -String maNhomXe
        -int doiXe
        -String hinhAnhXe
        -String trangThaiXe
        -decimal mucTieuThuXang
        -int soMuBaoHiem
        -boolean coAoMua
        -decimal donGiaNgay
        -int odoHienTai
        -datetime ngayTao
        +checkAvailability(nhan, tra) boolean
        +lockTemporarily() void
        +release() void
        +updateStatus(status) void
        +updateODO(odo) void
        +calculateRentalPrice(soNgay) decimal
    }

    class HopDongBooking {
        -String maBooking
        -datetime thoiGianNhan
        -datetime thoiGianTra
        -datetime thoiGianTraGoc
        -int soNgayThue
        -int soNgayThueGoc
        -String trangThaiBooking
        -int soLanGiaHan
        -boolean coTraSom
        -datetime thoiGianYeuCauTraSom
        -String ghiChu
        -datetime ngayTao
        +validateConditions() boolean
        +confirmBooking() void
        +applyExtension(soNgayThem, tienGiaHan) void
        +processCheckin(dataCheckin, nhanVien: NhanVien) void
        +processCheckout(dataCheckout, nhanVien: NhanVien) void
        +finalizeSettlement() void
        +cancelBooking() void
        +isReviewed() boolean
    }

    class HoaDonQuyetToan {
        -String maHoaDon
        -decimal donGiaApDung
        -decimal tongTienThue
        -decimal phanTramGiamGia
        -decimal tienGiamGia
        -decimal phanTramTangGia
        -decimal tienTangGia
        -decimal tienCoc
        -String phuongThucCoc
        -String maGiaoDichCoc
        -String trangThaiThanhToanCoc
        -decimal tongTienGiaHan
        -decimal phiPhatTreHan
        -decimal phiDenBuHuHai
        -decimal phiMatPhuKien
        -String lyDoPhat
        -decimal tongThanhToan
        -datetime ngayTao
        +calculateDeposit() decimal
        +calculateTotalSettlement() decimal
        +calculateLateFee(thoiGianTraThucTe) decimal
        +calculateAccessoriesPenalty() decimal
    }

    class BienBanGiaoNhan {
        -String maBienBan
        -datetime thoiGianTraThucTe
        -int odoNhan
        -int odoTra
        -String mucXangNhan
        -String mucXangTra
        -String anhNgoaiQuanNhan
        -String anhNgoaiQuanTra
        -int soMuBaoHiemGiao
        -int soMuBaoHiemTra
        -boolean coAoMuaGiao
        -boolean coAoMuaTra
        -String maNhanVienGiao
        -String maNhanVienNhan
        -datetime ngayTao
    }

    class BaoDuong {
        -String maBaoDuong
        -datetime ngayBaoDuong
        -decimal chiPhi
        -String chiTietBaoDuong
        -boolean daHoanThanh
        +complete() void
    }

    class DanhGia {
        -String maDanhGia
        -int diemDanhGia
        -String noiDung
        -datetime ngayTao
        +submitReview() void
    }

    class ThanhToan {
        -String maGiaoDich
        -decimal soTien
        -String loaiGiaoDich
        -String phuongThuc
        -String trangThaiGiaoDich
        -datetime thoiGianGiaoDich
        +processPayment(amount, phuongThuc) boolean
        +processRefund(amount, phuongThuc) boolean
    }

    class LichSuThue {
        -String maLichSu
        -String bienSoXe
        -datetime thoiGianNhan
        -datetime thoiGianTra
        -decimal tongTienThanhToan
        -String ghiChuNoiBo
        -boolean danhDauViPham
        -datetime ngayTao
        +markViolation(ghiChu) void
    }

    class CauHinhHeThong {
        -String maCauHinh
        -int soLanGiaHanToiDa
        -decimal donGiaPhatXeThuong_Gio
        -decimal donGiaPhatXePKL_Gio
        -decimal phatMatMuBaoHiem
        -decimal phatMatAoMua
        -decimal phanTramTangGiaLe
        +getDynamicPriceMultiplier(ngay) decimal
        +getLateFeeRate(loaiXe) decimal
    }

    %% ============================================================
    %% QUAN HỆ CÁC LỚP (ASSOCIATION & COMPOSITION)
    %% ============================================================
    
    KhachHang "1" -- "0..*" HopDongBooking : tạo
    XeMay "1" -- "0..*" HopDongBooking : được thuê
    XeMay "1" -- "0..*" BaoDuong : được bảo dưỡng
    NhanVien "0..2" -- "0..*" BienBanGiaoNhan : giao/nhận xe
    HopDongBooking "1" -- "0..1" HoaDonQuyetToan : sinh ra
    HopDongBooking "1" -- "0..1" BienBanGiaoNhan : có biên bản
    HoaDonQuyetToan "1" *-- "0..*" ThanhToan : chứa giao dịch
    HopDongBooking "1" -- "0..1" LichSuThue : lưu trữ thành
    HopDongBooking "1" -- "0..1" DanhGia : có đánh giá
    CauHinhHeThong "1" -- "*" HoaDonQuyetToan : áp dụng quy tắc cho

    AuthController --> KhachHang : quản lý
    BookingController --> KhachHang : xác thực
    BookingController --> XeMay : kiểm tra
    BookingController --> HopDongBooking : tạo
    OrderController --> HopDongBooking : cập nhật
    OrderController --> NhanVien : ủy quyền
    MaintenanceController --> BaoDuong : xử lý
    MaintenanceController --> XeMay : giải phóng
```

---

## 2. BẢNG ĐỐI CHIẾU LỚP ENTITY VÀ KHO DỮ LIỆU

| Class Entity | Kho dữ liệu (Database Table) | Ghi chú |
|---|---|---|
| `XeMay` | D1 — Xe_May | Tự chứa các hàm kiểm tra lịch trống và tính giá ngày. |
| `HopDongBooking` | D2 — Hop_Dong_Booking | Lưu giữ thông tin giao dịch, xe máy, khách hàng. |
| `HoaDonQuyetToan` | D10 — Hoa_Don_Quyet_Toan | Chứa toàn bộ logic tính tổng tiền, tính phí trễ, và quyết toán tài chính. |
| `BienBanGiaoNhan` | D11 — Bien_Ban_Giao_Nhan | Ghi nhận thông tin thực tế của xe (ODO, mức xăng) tại thời điểm bàn giao. |
| `KhachHang` | D3 — Khach_Hang_GPLX | Điểm neo (Entry point) khi khách hàng tương tác với hệ thống. |
| `LichSuThue` | D4 — Lich_Su_Thue | Bản ghi offline. |
| `CauHinhHeThong` | D5 — Cau_Hinh_He_Thong | Cung cấp thông số cấu hình chung. |
| `NhanVien` | D6 — Nhan_Vien | Quản lý tác nhân nhân viên. |
| `BaoDuong` | D7 — Bao_Duong | Ghi nhận lịch sử bảo dưỡng xe máy. |
| `DanhGia` | D8 — Danh_Gia | Ghi nhận đánh giá của khách hàng. |
| `ThanhToan` | Lớp trừu tượng (Interface với E4) | Tương tác trực tiếp với Cổng thanh toán (E4). |

---

## 3. ĐẶC TẢ CHI TIẾT CÁC LỚP (CLASS SPECIFICATIONS)

### 3.1. Các lớp Người dùng (Actor Classes)

**a) Lớp `KhachHang` (Customer)**
- **Mô tả:** Đại diện cho khách hàng sử dụng dịch vụ thuê xe. Lớp này quản lý thông tin cá nhân, hồ sơ bằng lái và là nơi khởi tạo các luồng nghiệp vụ chính.
- **Trách nhiệm (Responsibilities):** 
  - Khởi tạo quá trình đặt xe mới.
  - Quản lý và tự động phân quyền theo loại Giấy phép lái xe (GPLX).
  - Khởi tạo các yêu cầu gia hạn, trả sớm hoặc hủy hợp đồng.
- **Phương thức chính:**
  - `uploadGPLX()`: Tải lên và lưu trữ thông tin bằng lái.
  - `autoAssignVehicleGroup()`: Tự động tính toán và gán nhóm xe (50cc/A1/A2) dựa trên thông tin GPLX.
  - `rentalMotorbike()`: Khởi tạo một đối tượng `HopDongBooking` mới.
  - `requestExtension()`: Gửi thông điệp tới `HopDongBooking` để yêu cầu gia hạn số ngày thuê.

**b) Lớp `NhanVien` (Staff)**
- **Mô tả:** Đại diện cho nhân viên vận hành tại cửa hàng.
- **Trách nhiệm:** 
  - Tương tác với đối tượng `HopDongBooking` để thực hiện check-in và check-out.
  - Ghi nhận thông tin thực tế của xe (ODO, mức xăng, tình trạng ngoại quan) tại thời điểm bàn giao.
  - Xét duyệt ảnh GPLX do khách hàng tải lên.
  - Hoàn thành tiến trình bảo dưỡng xe máy.
- **Phương thức chính:**
  - `approveGPLX() / rejectGPLX()`: Duyệt hoặc từ chối giấy phép lái xe.
  - `submitCheckin()`: Xác nhận bàn giao xe cho khách. Nếu phát hiện khách gian lận GPLX sẽ gọi hàm hủy cọc.
  - `submitCheckout()`: Xác nhận thu hồi xe và tạo hóa đơn dữ liệu quyết toán chi tiết.
  - `completeMaintenance()`: Xác nhận xe đã bảo dưỡng xong và đưa về trạng thái sẵn sàng.

**c) Lớp `Admin`**
- **Mô tả:** Đại diện cho quản trị viên, kế thừa từ `NhanVien`.
- **Trách nhiệm:** 
  - Quản lý danh mục xe, tài khoản nhân viên.
  - Cấu hình các thông số hệ thống.
  - Đưa khách hàng vi phạm vào Blacklist.
  - Xem báo cáo lợi nhuận ròng.
- **Phương thức chính:**
  - `generateNetRevenueReport()`: Tính toán doanh thu ròng (Tổng doanh thu - Tổng chi phí bảo dưỡng).

### 3.2. Các Lớp Điều Khiển (Control Classes)
- **`AuthController`**: Điều phối luồng đăng ký, đăng nhập và duyệt GPLX. Giao tiếp với thực thể `KhachHang`.
- **`BookingController`**: Xử lý logic đặt xe từ AppUI, kiểm tra tính khả dụng, tạo `HopDongBooking` và gọi cổng thanh toán đặt cọc/gia hạn.
- **`OrderController`**: Xử lý logic Check-in, Check-out từ StaffUI, thực thi tính toán quyết toán phạt trễ thông qua `HopDongBooking`.
- **`MaintenanceController`**: Xử lý quy trình báo cáo bảo dưỡng và chuyển trạng thái phương tiện từ StaffUI sang `BaoDuong` và `XeMay`.

### 3.3. Các lớp Thực thể Nghiệp vụ (Business Classes)

**a) Lớp `XeMay` (Motorcycle)**
- **Mô tả:** Đại diện cho một phương tiện cho thuê trong hệ thống.
- **Trách nhiệm:** 
  - Quản lý trạng thái và tính khả dụng của chính nó.
  - Tự động tính toán giá thuê cơ bản dựa trên thông tin của xe.
- **Phương thức chính:**
  - `checkAvailability(nhan, tra)`: Tự kiểm tra xem xe có trống lịch trong khoảng thời gian được yêu cầu hay không.
  - `lockTemporarily()`: Khóa trạng thái xe trong 15 phút khi chờ thanh toán cọc.
  - `calculateRentalPrice(soNgay)`: Tính tổng tiền thuê cơ bản dựa trên đơn giá ngày của xe.

**b) Lớp `HopDongBooking` (Booking Contract)**
- **Mô tả:** Đây là lớp cốt lõi (Core Entity) trong Domain Model, lưu trữ trạng thái và thông tin lịch trình của một lần thuê xe.
- **Trách nhiệm:** 
  - Liên kết xe máy, khách hàng và thời gian thuê.
  - Phối hợp với `HoaDonQuyetToan` và `BienBanGiaoNhan` để xử lý các nghiệp vụ vòng đời hợp đồng (check-in, check-out, gia hạn).
- **Phương thức chính:**
  - `validateConditions()`: Kiểm tra tính hợp lệ trước khi tạo hợp đồng (GPLX hợp lệ, lịch trống).
  - `applyExtension()`: Cập nhật lịch trình trả xe mới.
  - `processCheckin() / processCheckout()`: Gọi tạo Biên bản giao nhận.
  - `finalizeSettlement()`: Gắn kết với Hóa đơn quyết toán.

**c) Lớp `HoaDonQuyetToan` (Financial Settlement)**
- **Mô tả:** Quản lý toàn bộ thông tin tài chính của đơn thuê.
- **Trách nhiệm:** Chứa logic tính toán tiền cọc, phụ phí trễ hạn, đền bù hư hại và tổng quyết toán.
- **Phương thức chính:**
  - `calculateDeposit()`: Tự động tính toán số tiền cọc cần thanh toán.
  - `calculateLateFee(thoiGianTraThucTe)`: Tự động áp dụng các mốc tính phí phạt theo thời gian trễ.
  - `calculateAccessoriesPenalty()`: Tính phí mất phụ kiện.
  - `calculateTotalSettlement()`: Tổng hợp tất cả các chi phí và khấu trừ tiền cọc để ra số tiền thanh toán cuối cùng.

**d) Lớp `BienBanGiaoNhan` (Handover Record)**
- **Mô tả:** Ghi nhận thực tế tình trạng phương tiện khi Check-in và Check-out.
- **Trách nhiệm:** Lưu trữ ODO, mức xăng, hình ảnh ngoại quan. Bắt lỗi logic như ODO trả < ODO nhận.

**e) Lớp `ThanhToan` (Payment)**
- **Mô tả:** Đối tượng trung gian (Interface object) làm việc với Cổng thanh toán ngoại vi (E4).
- **Trách nhiệm:** Thực hiện và ghi nhận trạng thái các giao dịch tài chính (thanh toán cọc, thanh toán gia hạn, quyết toán, hoàn tiền).
- **Phương thức chính:**
  - `processPayment()`: Gọi API thực hiện thanh toán trực tuyến.
  - `processRefund()`: Gọi API thực hiện hoàn tiền (VD: khi khách hủy đơn hợp lệ).

**g) Lớp `LichSuThue` (Rental History)**
- **Mô tả:** Bản lưu trữ (Snapshot) dạng Read-Only của một hợp đồng đã hoàn tất.
- **Trách nhiệm:** Lưu vết lịch sử phục vụ tra cứu offline, báo cáo thống kê và xử lý phạt nguội về sau.

**h) Lớp `CauHinhHeThong` (System Settings)**
- **Mô tả:** Đối tượng cấu hình toàn cục (Singleton).
- **Trách nhiệm:** Cung cấp các thông số chung (phí phạt giờ, phí mất phụ kiện, tỷ lệ tăng giá Lễ/Tết) để các thực thể khác như `HopDongBooking` gọi và sử dụng trong quá trình tính toán.
