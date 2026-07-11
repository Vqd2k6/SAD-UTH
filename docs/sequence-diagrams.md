# TÀI LIỆU THIẾT KẾ: SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)

## 1. LUỒNG ĐẶT XE & THANH TOÁN CỌC TRỰC TUYẾN

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    participant AppUI as 📱 AppUI (Boundary)
    participant BC as ⚙️ BookingController (Control)
    participant KH as 🧑‍💼 KhachHang (Entity)
    participant XM as 🛵 XeMay (Entity)
    participant HD as 📄 HopDongBooking (Entity)
    participant CH as ⚙️ CauHinhHeThong (Entity)
    participant TT as 💳 ThanhToan (Entity)
    participant E4 as 🏦 E4: Cổng Thanh Toán

    Customer->>AppUI: Chọn Xe & Thời gian Nhận/Trả
    AppUI->>BC: createBooking(maXe, thoiGianNhan, thoiGianTra)
    activate BC

    %% === VALIDATION TẠI OBJECT KHÁCH HÀNG ===
    BC->>KH: checkEligibility(maKhachHang, maXe)
    activate KH
    KH-->>BC: result (Hợp lệ / Lỗi GPLX / Lỗi Blacklist)
    deactivate KH

    alt Không đủ điều kiện
        BC-->>AppUI: Exception: Tài khoản không đủ điều kiện
        AppUI-->>Customer: Hiển thị lỗi (Cần duyệt GPLX / Bị khóa)
    end

    %% === VALIDATION TẠI OBJECT XE MÁY ===
    BC->>XM: checkAvailability(maXe, thoiGianNhan, thoiGianTra)
    activate XM
    alt Xe đã bị đặt
        XM-->>BC: false
        BC-->>AppUI: Exception: Xe đã bận lịch
        AppUI-->>Customer: Đề xuất xe khác
    end
    XM-->>BC: true
    deactivate XM

    %% === KHỞI TẠO OBJECT BOOKING VÀ TÍNH TOÁN ===
    BC->>CH: getDynamicPriceMultiplier(ngayNhan)
    activate CH
    CH-->>BC: multiplier
    deactivate CH
    BC->>HD: create(maKhachHang, maXe, thoiGianNhan, thoiGianTra, multiplier)
    activate HD
    HD->>XM: calculateRentalPrice(soNgay)
    XM-->>HD: donGiaGoc
    HD->>HD: calculateTotalSettlement()
    HD->>HD: calculateDeposit()
    HD-->>BC: hd (trạng thái: Chờ Cọc)
    deactivate HD

    BC->>XM: lockTemporarily(maXe)
    XM-->>BC: khóa xe 15 phút
    BC-->>AppUI: Đối tượng hd & Yêu cầu thanh toán
    deactivate BC
    AppUI-->>Customer: Hiển thị QR thanh toán cọc

    %% === XỬ LÝ THANH TOÁN ===
    Customer->>AppUI: Xác nhận thanh toán cọc
    AppUI->>BC: processDepositPayment(maBooking, phuongThuc)
    activate BC
    BC->>TT: processPayment(hd.tienCoc, phuongThuc)
    activate TT
    TT->>E4: Gửi yêu cầu trừ tiền
    
    alt Giao dịch thành công
        E4-->>TT: THANH_CONG
        TT-->>BC: OK
        BC->>HD: confirmBooking()
        activate HD
        HD->>XM: updateStatus('Dang_Thue')
        HD-->>BC: Cập nhật thành công
        deactivate HD
        BC-->>AppUI: true
        AppUI-->>Customer: Thông báo đặt xe thành công
    else Giao dịch thất bại / Quá hạn
        E4-->>TT: THAT_BAI
        TT-->>BC: FAIL
        BC->>HD: cancelBooking()
        activate HD
        HD->>XM: release()
        HD-->>BC: Hủy thành công
        deactivate HD
        BC-->>AppUI: false
        AppUI-->>Customer: Thông báo hủy đơn do lỗi thanh toán
    end
    deactivate TT
    deactivate BC
```

---

## 2. LUỒNG GIA HẠN THUÊ XE TRÊN ỨNG DỤNG (EXTENSION)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    participant AppUI as 📱 AppUI (Boundary)
    participant BC as ⚙️ BookingController (Control)
    participant HD as 📄 HopDongBooking (Entity)
    participant XM as 🛵 XeMay (Entity)
    participant CH as ⚙️ CauHinhHeThong (Entity)
    participant TT as 💳 ThanhToan (Entity)

    Customer->>AppUI: Nhập số ngày muốn gia hạn
    AppUI->>BC: requestExtension(maBooking, soNgayThem)
    activate BC

    BC->>HD: validateExtensionConditions()
    activate HD
    
    %% === VALIDATION TẠI OBJECT BOOKING ===
    alt Không thỏa mãn (Quá 3 lần / Trễ)
        HD-->>BC: false
        BC-->>AppUI: Exception: Quá số lần / Gửi quá trễ
        AppUI-->>Customer: Thông báo từ chối gia hạn
    end

    HD->>XM: checkAvailability(thoiGianTraCu, thoiGianTraMoi)
    alt Bị trùng lịch
        XM-->>HD: false
        HD-->>BC: false
        BC-->>AppUI: Exception: Xe đã có lịch tiếp theo
        AppUI-->>Customer: Báo lỗi trùng lịch
    end

    %% === TÍNH PHÍ GIA HẠN THÔNG MINH ===
    BC->>CH: getDynamicPriceMultiplier(ngayGiaHan)
    activate CH
    CH-->>BC: multiplier
    deactivate CH
    BC->>HD: calculateExtensionCost(multiplier)
    activate HD
    HD->>XM: calculateRentalPrice(soNgayThem)
    XM-->>HD: donGiaGoc
    HD->>HD: tính chi phí gia hạn = donGiaGoc * multiplier
    HD-->>BC: Yêu cầu thanh toán (chiPhiGiaHan)
    deactivate HD

    BC-->>AppUI: Gửi phí tạm tính
    AppUI-->>Customer: Hiển thị phí gia hạn & Nút Thanh toán
    
    Customer->>AppUI: Bấm Thanh toán
    AppUI->>BC: processExtensionPayment(maBooking, phuongThuc)
    BC->>TT: processPayment(chiPhiGiaHan, phuongThuc)
    activate TT
    TT-->>BC: Giao dịch thành công
    deactivate TT

    BC->>HD: applyExtension(soNgayThem, chiPhiGiaHan)
    HD-->>BC: OK
    
    BC-->>AppUI: Cập nhật thành công
    deactivate BC
    
    AppUI-->>Customer: Hiển thị giờ trả mới
```

---

## 3. LUỒNG BÀN GIAO XE (CHECK-IN)

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 🧑‍💼 Nhân viên
    participant StaffUI as 💻 StaffUI (Boundary)
    participant OC as ⚙️ OrderController (Control)
    participant NV as 🧑‍🔧 NhanVien (Entity)
    participant HD as 📄 HopDongBooking (Entity)
    participant XM as 🛵 XeMay (Entity)

    Staff->>StaffUI: Nhập ODO, Mức xăng, Hình ảnh nhận
    StaffUI->>OC: submitCheckin(maBooking, checkinData)
    activate OC

    OC->>NV: checkStaffStatus()
    NV-->>OC: Status (Active)

    OC->>HD: processCheckin(checkinData)
    activate HD
    
    HD->>XM: updateStatus('Dang_Thue')
    HD->>XM: updateODO(checkinData.odoNhan)
    
    HD-->>OC: Bàn giao thành công
    deactivate HD

    OC-->>StaffUI: true
    deactivate OC
    StaffUI-->>Staff: Hiển thị xác nhận Check-in thành công
```

---

## 4. LUỒNG QUYẾT TOÁN PHỤ PHÍ & ĐỀN BÙ HƯ HẠI (CHECK-OUT)

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 🧑‍💼 Nhân viên
    participant StaffUI as 💻 StaffUI (Boundary)
    participant OC as ⚙️ OrderController (Control)
    participant HD as 📄 HopDongBooking (Entity)
    participant XM as 🛵 XeMay (Entity)
    participant CH as ⚙️ CauHinhHeThong (Entity)
    participant TT as 💳 ThanhToan (Entity)
    participant LS as 🗄️ LichSuThue (Entity)

    Staff->>StaffUI: Nhập ODO, Xăng trả, Phí đền bù
    StaffUI->>OC: submitCheckout(maBooking, checkoutData)
    activate OC

    %% === GIAO TIẾP VỚI OBJECT BOOKING ===
    OC->>CH: getLateFeeRate(xe.loaiXe)
    activate CH
    CH-->>OC: donGiaPhatGio
    deactivate CH
    OC->>HD: processCheckout(checkoutData, donGiaPhatGio)
    activate HD
    
    HD->>HD: validateODO()
    HD->>HD: calculateLateFee(thoiGianTraThucTe, donGiaPhatGio)
    HD->>HD: calculateTotalSettlement()
    HD-->>OC: tongThanhToan
    deactivate HD

    OC-->>StaffUI: Hiển thị hóa đơn chi tiết

    %% === XỬ LÝ THANH TOÁN (HOÀN HOẶC THU THÊM) ===
    alt tongThanhToan > 0 (Thu thêm)
        Staff->>StaffUI: Khách thanh toán nợ
        StaffUI->>OC: processPayment(tongThanhToan)
        OC->>TT: processPayment(tongThanhToan)
        TT-->>OC: OK
        OC-->>StaffUI: OK
    else tongThanhToan < 0 (Hoàn cọc)
        Staff->>StaffUI: Yêu cầu hoàn cọc dư
        StaffUI->>OC: processRefund(abs(tongThanhToan))
        OC->>TT: processRefund(abs(tongThanhToan))
        TT-->>OC: OK
        OC-->>StaffUI: OK
    end

    %% === CHỐT ĐƠN VÀ LƯU LỊCH SỬ ===
    StaffUI->>OC: finalizeSettlement(maBooking)
    OC->>HD: finalizeSettlement()
    activate HD
    HD->>XM: release() (Trả về San_Sang)
    HD->>XM: updateODO(odoTra)
    HD->>LS: create(hd) (Khởi tạo bản lưu lịch sử)
    HD-->>OC: Hoàn tất Check-out
    deactivate HD
    
    OC-->>StaffUI: true
    deactivate OC
    StaffUI-->>Staff: Đóng đơn thành công
```

---

## 5. LUỒNG ĐĂNG KÝ TÀI KHOẢN VÀ DUYỆT GPLX THỦ CÔNG

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    actor Staff as 🧑‍💼 Nhân viên
    participant AppUI as 📱 AppUI (Boundary)
    participant StaffUI as 💻 StaffUI (Boundary)
    participant AC as ⚙️ AuthController (Control)
    participant KH as 🧑‍💼 KhachHang (Entity)

    Customer->>AppUI: Nhập Thông tin cá nhân & Mật khẩu
    AppUI->>AC: registerUser(thongTinCaNhan)
    activate AC
    AC->>KH: create(thongTinCaNhan)
    KH-->>AC: kh (instance)
    AC-->>AppUI: Đăng ký thành công
    deactivate AC

    opt Khách có GPLX
        Customer->>AppUI: Tải ảnh GPLX & Chọn hạng (A1/A2)
        AppUI->>AC: uploadGPLX(maKhachHang, anhTruoc, anhSau, hangGPLX)
        activate AC
        AC->>KH: updateGPLX(anhTruoc, anhSau, hangGPLX, 'DA_UPLOAD')
        KH-->>AC: OK
        AC-->>AppUI: Tải lên thành công, chờ duyệt
        deactivate AC

        %% Nhân viên duyệt GPLX
        Staff->>StaffUI: Xem hồ sơ Khách hàng
        StaffUI->>AC: reviewGPLX(maKhachHang, 'APPROVE')
        activate AC
        AC->>KH: assignVehicleGroup(hangGPLX)
        Note over KH: Set TrangThaiGPLX = DA_XAC_MINH<br/>Set NhomXeDuocThue tương ứng
        KH-->>AC: OK
        AC-->>StaffUI: Đã duyệt thành công
        deactivate AC
    end

    AppUI-->>Customer: Tài khoản đã được phê duyệt
```

---

## 6. LUỒNG HOÀN THÀNH BẢO DƯỠNG

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 🧑‍💼 Nhân viên
    participant StaffUI as 💻 StaffUI (Boundary)
    participant MC as ⚙️ MaintenanceController (Control)
    participant BD as 🛠️ BaoDuong (Entity)
    participant XM as 🛵 XeMay (Entity)

    Staff->>StaffUI: Chọn "Hoàn thành bảo dưỡng"
    StaffUI->>MC: completeMaintenance(maBaoDuong)
    activate MC

    MC->>BD: markAsCompleted()
    activate BD
    BD-->>MC: OK
    deactivate BD

    MC->>XM: releaseFromMaintenance()
    activate XM
    Note over XM: Set TrangThaiXe = SAN_SANG
    XM-->>MC: OK
    deactivate XM

    MC-->>StaffUI: Thành công
    deactivate MC

    StaffUI-->>Staff: Vô hiệu hóa nút Hoàn thành (Màu xám)
```
