# TÀI LIỆU THIẾT KẾ: SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)

## 1. LUỒNG ĐẶT XE & THANH TOÁN CỌC TRỰC TUYẾN

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    participant AppUI as 📱 App Interface
    participant KH as 🧑‍💼 kh: KhachHang
    participant XM as 🛵 xe: XeMay
    participant HD as 📄 hd: HopDongBooking
    participant CH as ⚙️ ch: CauHinhHeThong
    participant TT as 💳 tt: ThanhToan
    participant E4 as 🏦 E4: Cổng Thanh Toán

    Customer->>AppUI: Chọn Xe & Thời gian Nhận/Trả
    AppUI->>KH: rentalMotorbike(xe, thoiGianNhan, thoiGianTra)
    activate KH

    %% === VALIDATION TẠI OBJECT KHÁCH HÀNG ===
    KH->>KH: canRent(xe.nhomXe)
    alt Không đủ điều kiện (Thiếu GPLX / Blacklist)
        KH-->>AppUI: Exception: Tài khoản không đủ điều kiện
        AppUI-->>Customer: Hiển thị lỗi (Cần GPLX / Bị khóa)
    end

    %% === VALIDATION TẠI OBJECT XE MÁY ===
    KH->>XM: checkAvailability(thoiGianNhan, thoiGianTra)
    activate XM
    alt Xe đã bị đặt
        XM-->>KH: false
        KH-->>AppUI: Exception: Xe đã bận lịch
        AppUI-->>Customer: Đề xuất xe khác
    end
    XM-->>KH: true
    deactivate XM

    %% === KHỞI TẠO OBJECT BOOKING VÀ TÍNH TOÁN ===
    KH->>HD: create(kh, xe, thoiGianNhan, thoiGianTra)
    activate HD
    HD->>CH: getDynamicPriceMultiplier(ngayNhan)
    CH-->>HD: multiplier
    HD->>XM: calculateRentalPrice(soNgay)
    XM-->>HD: donGiaGoc
    HD->>HD: calculateTotalSettlement()
    HD->>HD: calculateDeposit()
    HD-->>KH: hd (trạng thái: Chờ Cọc)
    deactivate HD

    KH->>XM: lockTemporarily()
    XM-->>KH: khóa xe 15 phút
    KH-->>AppUI: Đối tượng hd & Yêu cầu thanh toán
    deactivate KH
    AppUI-->>Customer: Hiển thị QR thanh toán cọc

    %% === XỬ LÝ THANH TOÁN ===
    Customer->>AppUI: Xác nhận thanh toán cọc
    AppUI->>TT: processPayment(hd.tienCoc, phuongThuc)
    activate TT
    TT->>E4: Gửi yêu cầu trừ tiền
    
    alt Giao dịch thành công
        E4-->>TT: THANH_CONG
        TT->>HD: confirmBooking()
        activate HD
        HD->>XM: updateStatus('Dang_Thue')
        HD-->>TT: Cập nhật thành công
        deactivate HD
        TT-->>AppUI: true
        AppUI-->>Customer: Thông báo đặt xe thành công
    else Giao dịch thất bại / Quá hạn
        E4-->>TT: THAT_BAI
        TT->>HD: cancelBooking()
        activate HD
        HD->>XM: release()
        HD-->>TT: Hủy thành công
        deactivate HD
        TT-->>AppUI: false
        AppUI-->>Customer: Thông báo hủy đơn do lỗi thanh toán
    end
    deactivate TT
```

---

## 2. LUỒNG GIA HẠN THUÊ XE TRÊN ỨNG DỤNG (EXTENSION)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    participant AppUI as 📱 App Interface
    participant KH as 🧑‍💼 kh: KhachHang
    participant HD as 📄 hd: HopDongBooking
    participant XM as 🛵 xe: XeMay
    participant CH as ⚙️ ch: CauHinhHeThong
    participant TT as 💳 tt: ThanhToan

    Customer->>AppUI: Nhập số ngày muốn gia hạn
    AppUI->>KH: requestExtension(hd, soNgayThem)
    activate KH

    KH->>HD: applyExtension(soNgayThem)
    activate HD
    
    %% === VALIDATION TẠI OBJECT BOOKING ===
    HD->>HD: validateConditions() (Kiểm tra <= 3 lần & > 2 tiếng)
    alt Không thỏa mãn
        HD-->>KH: Exception: Quá số lần / Gửi quá trễ
        KH-->>AppUI: Báo lỗi nghiệp vụ
        AppUI-->>Customer: Thông báo từ chối gia hạn
    end

    HD->>XM: checkAvailability(thoiGianTraCu, thoiGianTraMoi)
    alt Bị trùng lịch
        XM-->>HD: false
        HD-->>KH: Exception: Xe đã có lịch tiếp theo
        KH-->>AppUI: Báo lỗi trùng lịch
    end

    %% === TÍNH PHÍ GIA HẠN THÔNG MINH ===
    HD->>CH: getDynamicPriceMultiplier(ngayGiaHan)
    CH-->>HD: multiplier
    HD->>XM: calculateRentalPrice(soNgayThem)
    XM-->>HD: donGiaGoc
    HD->>HD: tính chi phí gia hạn = donGiaGoc * multiplier
    HD-->>KH: Yêu cầu thanh toán (chiPhiGiaHan)
    deactivate HD

    KH-->>AppUI: Gửi phí tạm tính
    AppUI-->>Customer: Hiển thị phí gia hạn & Nút Thanh toán
    
    Customer->>AppUI: Bấm Thanh toán
    AppUI->>TT: processPayment(chiPhiGiaHan, phuongThuc)
    activate TT
    TT->>HD: Nếu thành công -> lưu thông tin gia hạn
    HD-->>TT: OK
    TT-->>AppUI: Giao dịch thành công
    deactivate TT
    
    AppUI-->>Customer: Hiển thị giờ trả mới
    deactivate KH
```

---

## 3. LUỒNG BÀN GIAO XE (CHECK-IN)

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 🧑‍💼 Nhân viên
    participant StaffUI as 💻 Staff Dashboard
    participant NV as 🧑‍🔧 nv: NhanVien
    participant HD as 📄 hd: HopDongBooking
    participant XM as 🛵 xe: XeMay

    Staff->>StaffUI: Nhập ODO, Mức xăng, Hình ảnh nhận
    StaffUI->>NV: submitCheckin(hd, checkinData)
    activate NV

    NV->>HD: processCheckin(checkinData, nv)
    activate HD
    
    HD->>XM: updateStatus('Dang_Thue')
    HD->>XM: updateODO(checkinData.odoNhan)
    
    HD-->>NV: Bàn giao thành công
    deactivate HD

    NV-->>StaffUI: true
    deactivate NV
    StaffUI-->>Staff: Hiển thị xác nhận Check-in thành công
```

---

## 4. LUỒNG QUYẾT TOÁN PHỤ PHÍ & ĐỀN BÙ HƯ HẠI (CHECK-OUT)

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 🧑‍💼 Nhân viên
    participant StaffUI as 💻 Staff Dashboard
    participant NV as 🧑‍🔧 nv: NhanVien
    participant HD as 📄 hd: HopDongBooking
    participant XM as 🛵 xe: XeMay
    participant CH as ⚙️ ch: CauHinhHeThong
    participant TT as 💳 tt: ThanhToan
    participant LS as 🗄️ ls: LichSuThue

    Staff->>StaffUI: Nhập ODO, Xăng trả, Phí đền bù
    StaffUI->>NV: submitCheckout(hd, checkoutData)
    activate NV

    %% === GIAO TIẾP VỚI OBJECT BOOKING ===
    NV->>HD: processCheckout(checkoutData, nv)
    activate HD
    
    HD->>HD: validateODO()
    HD->>CH: getLateFeeRate(xe.loaiXe)
    CH-->>HD: donGiaPhatGio
    
    HD->>HD: calculateLateFee(thoiGianTraThucTe)
    HD->>HD: calculateTotalSettlement()
    HD-->>NV: tongThanhToan
    deactivate HD

    NV-->>StaffUI: Hiển thị hóa đơn chi tiết

    %% === XỬ LÝ THANH TOÁN (HOÀN HOẶC THU THÊM) ===
    alt tongThanhToan > 0 (Thu thêm)
        Staff->>StaffUI: Khách thanh toán nợ
        StaffUI->>TT: processPayment(tongThanhToan)
        TT-->>StaffUI: OK
    else tongThanhToan < 0 (Hoàn cọc)
        Staff->>StaffUI: Yêu cầu hoàn cọc dư
        StaffUI->>TT: processRefund(abs(tongThanhToan))
        TT-->>StaffUI: OK
    end

    %% === CHỐT ĐƠN VÀ LƯU LỊCH SỬ ===
    StaffUI->>NV: finalizeSettlement(hd)
    NV->>HD: finalizeSettlement()
    activate HD
    HD->>XM: release() (Trả về San_Sang)
    HD->>XM: updateODO(odoTra)
    HD->>LS: create(hd) (Khởi tạo bản lưu lịch sử)
    HD-->>NV: Hoàn tất Check-out
    deactivate HD
    
    NV-->>StaffUI: true
    deactivate NV
    StaffUI-->>Staff: Đóng đơn thành công
```

---

## 5. LUỒNG ĐĂNG KÝ TÀI KHOẢN VÀ TỰ ĐỘNG PHÂN QUYỀN GPLX

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Khách hàng
    participant AppUI as 📱 App Interface
    participant KH as 🧑‍💼 kh: KhachHang

    Customer->>AppUI: Nhập Thông tin cá nhân & Mật khẩu
    AppUI->>KH: create(thongTinCaNhan)
    activate KH
    KH-->>AppUI: kh (instance)
    deactivate KH

    opt Khách có GPLX
        Customer->>AppUI: Tải ảnh GPLX & Chọn hạng (A1/A2)
        AppUI->>KH: uploadGPLX(anhTruoc, anhSau, hangGPLX)
        activate KH
        KH->>KH: autoAssignVehicleGroup()
        Note over KH: Đặt trạng thái GPLX = DA_UPLOAD<br/>Set NhomXeDuocThue tương ứng
        KH-->>AppUI: Cập nhật quyền thành công
        deactivate KH
    end

    AppUI-->>Customer: Tài khoản đã sẵn sàng (với nhóm xe được cấp phép)
```
