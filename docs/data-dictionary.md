# 📖 TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)
## Hệ thống Quản lý và Cho thuê xe máy Thông minh

---

## 1. DANH MỤC CÁC TÁC NHÂN NGOÀI (EXTERNAL ENTITIES)

| Ký hiệu | Tên Actor | Mô tả |
|----------|-----------|-------|
| **E1** | Khách hàng (Customer) | Người có nhu cầu thuê xe máy. Tìm xe, đặt xe, thanh toán, yêu cầu gia hạn, trả xe sớm, đánh giá dịch vụ. |
| **E2** | Nhân viên cửa hàng (Staff) | Bàn giao xe, kiểm tra tình trạng xe khi trả, ghi nhận sự cố, lập hóa đơn phụ phí, tra cứu lịch sử thuê xe để xử lý phạt nguội ngoài hệ thống. Có quyền xét duyệt và từ chối ảnh GPLX tại cửa hàng. |
| **E3** | Quản trị viên (Admin) | Quản lý danh mục xe máy, cấu hình giá thuê/phí phạt (Dynamic Pricing), quản lý tài khoản nhân viên, xem báo cáo doanh thu, quản lý Blacklist. |
| **E4** | Cổng thanh toán (Payment Gateway) | Hệ thống thanh toán trực tuyến bên ngoài xử lý giao dịch đặt cọc, thanh toán gia hạn và hoàn tiền hủy đơn. |
| **E5** | Hệ thống thời gian (Cron Job) | Tự động kích hoạt các tiến trình định kỳ theo lịch trình. |

---

## 2. CÁC KHO DỮ LIỆU (DATA STORES)

### D1 — Xe_May (Motorcycle Inventory)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaXe` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã định danh duy nhất của xe. VD: `XM-001` |
| `BienSo` | VARCHAR(12) | NOT NULL, UNIQUE | Biển số xe. VD: `59-B1 12345` |
| `SoKhung` | VARCHAR(20) | NOT NULL, UNIQUE | Số khung xe |
| `SoMay` | VARCHAR(20) | NOT NULL, UNIQUE | Số máy xe |
| `HangXe` | VARCHAR(30) | NOT NULL | Hãng sản xuất: Honda, Yamaha, Vespa, VinFast... |
| `TenXe` | VARCHAR(50) | NOT NULL | Tên dòng xe. VD: `Honda Vision 110cc` |
| `MaLoaiXe` | VARCHAR(20) | **FK** → DM_LoaiXe, NOT NULL | Tham chiếu loại xe |
| `PhanKhoi` | INT | NOT NULL | Dung tích xi-lanh (cc). `0` nếu là xe điện |
| `MaNhomXe` | VARCHAR(20) | **FK** → DM_NhomXe, NOT NULL | Tham chiếu phân nhóm xe |
| `DoiXe` | INT | NOT NULL | Năm sản xuất. VD: `2023` |
| `HinhAnhXe` | TEXT | NULL | Danh sách URL hình ảnh xe (JSON array) |
| `TrangThaiXe` | VARCHAR(20) | Mặc định `San_Sang`. ENUM(San_Sang, Dang_Thue, KHOA_TAM_15M, Dang_Bao_Duong) | Mặc định `San_Sang` |
| `MucTieuThuXang` | DECIMAL(4,1) | NULL | Lít/100km. VD: `1.7` |
| `SoMuBaoHiem` | INT | NOT NULL, DEFAULT `2` | Số mũ bảo hiểm đi kèm mặc định |
| `CoAoMua` | BOOLEAN | NOT NULL, DEFAULT `TRUE` | Có kèm áo mưa mặc định hay không |
| `DonGiaNgay` | DECIMAL(12,0) | NOT NULL | Giá thuê cơ bản 1 ngày (VND). VD: `150000` |
| `ODOHienTai` | INT | NOT NULL, DEFAULT `0` | Số ODO hiện tại (km) |
| `NgayTao` | DATETIME | NOT NULL | Ngày thêm xe vào hệ thống |
| `NgayCapNhat` | DATETIME | NOT NULL | Ngày cập nhật thông tin lần cuối |

---

### D2 — Hop_Dong_Booking (Booking Contract)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaBooking` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã đơn đặt xe. VD: `BK-20260622001` |
| `MaKhachHang` | VARCHAR(10) | **FK** → D3.MaKhachHang, NOT NULL | Khách hàng đặt xe |
| `MaXe` | VARCHAR(10) | **FK** → D1.MaXe, NOT NULL | Xe máy được đặt |
| `ThoiGianNhan` | DATETIME | NOT NULL | Thời gian hẹn nhận xe |
| `ThoiGianTra` | DATETIME | NOT NULL | Thời gian hẹn trả xe (cập nhật khi gia hạn) |
| `ThoiGianTraGoc` | DATETIME | NOT NULL | Thời gian trả xe ban đầu (không thay đổi khi gia hạn) |
| `SoNgayThue` | INT | NOT NULL | Tổng số ngày thuê (bao gồm gia hạn) |
| `SoNgayThueGoc` | INT | NOT NULL | Số ngày thuê ban đầu |
| `TrangThaiBooking`| VARCHAR(20) | ENUM(Cho_Thanh_Toan_Coc, Cho_Nhan_Xe, Dang_Thue,...) | Mặc định `Cho_Thanh_Toan_Coc` |
| `SoLanGiaHan` | INT | NOT NULL, DEFAULT `0` | Số lần gia hạn đã thực hiện. **Tối đa: 3** |
| `CoTraSom` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Khách có yêu cầu trả xe sớm không |
| `ThoiGianYeuCauTraSom` | DATETIME | NULL | Thời điểm khách gửi yêu cầu trả sớm |
| `GhiChu` | TEXT | NULL | Ghi chú nội bộ |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo đơn |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D10 — Hoa_Don_Quyet_Toan (Financial Records)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaHoaDon` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã hóa đơn |
| `MaBooking` | VARCHAR(15) | **FK** → D2.MaBooking, UNIQUE | Đơn booking gốc |
| `DonGiaApDung` | DECIMAL(12,0) | NOT NULL | Đơn giá ngày áp dụng (đã tính Dynamic Pricing) |
| `TongTienThue` | DECIMAL(15,0) | NOT NULL | Tổng tiền thuê gốc (chưa phụ phí/giảm giá) |
| `PhanTramGiamGia` | DECIMAL(4,1) | DEFAULT `0` | % giảm giá thuê dài ngày |
| `TienGiamGia` | DECIMAL(15,0) | DEFAULT `0` | Số tiền giảm giá (VND) |
| `PhanTramTangGia` | DECIMAL(4,1) | DEFAULT `0` | % tăng giá Dynamic Pricing |
| `TienTangGia` | DECIMAL(15,0) | DEFAULT `0` | Số tiền tăng giá Dynamic Pricing (VND) |
| `TienCoc` | DECIMAL(15,0) | NOT NULL | Tiền đặt cọc khách đã thanh toán |
| `PhuongThucCoc` | VARCHAR(20) | ENUM(Chuyen_Khoan, Tien_Mat, Vi_Dien_Tu) | Phương thức thanh toán cọc |
| `MaGiaoDichCoc` | VARCHAR(100)| NULL | ID giao dịch từ Payment Gateway |
| `TrangThaiThanhToanCoc`| VARCHAR(20) | ENUM(PENDING, SUCCESS, FAILED, REFUNDED) | Mặc định `PENDING` |
| `TongTienGiaHan` | DECIMAL(15,0) | DEFAULT `0` | Tổng tiền gia hạn phải trả thêm |
| `PhiPhatTreHan` | DECIMAL(15,0) | DEFAULT `0` | Phí phạt trễ hạn (VND) |
| `PhiDenBuHuHai` | DECIMAL(15,0) | DEFAULT `0` | Tổng phí đền bù hư hại linh kiện |
| `PhiMatPhuKien` | DECIMAL(15,0) | DEFAULT `0` | Phí mất mũ bảo hiểm, áo mưa |
| `LyDoPhat` | TEXT | NULL | Ghi chú lý do đền bù hư hại/phạt |
| `TongThanhToan` | DECIMAL(15,0) | NOT NULL | Tổng thu cuối cùng của hóa đơn |
| `NgayTao` | DATETIME | NOT NULL | Ngày xuất hóa đơn |

---

### D11 — Bien_Ban_Giao_Nhan (Check-in/Check-out Records)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaBienBan` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã biên bản |
| `MaBooking` | VARCHAR(15) | **FK** → D2.MaBooking, UNIQUE | Đơn booking gốc |
| `ThoiGianTraThucTe` | DATETIME | NULL | Thời gian khách trả xe thực tế |
| `ODONhan` | INT | NULL | Số ODO khi bàn giao xe (Check-in) |
| `ODOTra` | INT | NULL | Số ODO khi trả xe (Check-out) |
| `MucXangNhan` | VARCHAR(20) | ENUM(Day, 3_Phan_4, 1_Phan_2, 1_Phan_4, Gan_Het) | Mức xăng khi nhận |
| `MucXangTra` | VARCHAR(20) | ENUM(Day, 3_Phan_4, 1_Phan_2, 1_Phan_4, Gan_Het) | Mức xăng khi trả |
| `AnhNgoaiQuanNhan` | TEXT | NULL | URL ảnh chụp ngoại quan khi giao xe |
| `AnhNgoaiQuanTra` | TEXT | NULL | URL ảnh chụp ngoại quan khi trả xe |
| `SoMuBaoHiemGiao` | INT | DEFAULT `0` | Số mũ bảo hiểm thực tế bàn giao lúc Check-in |
| `SoMuBaoHiemTra` | INT | DEFAULT `0` | Số mũ bảo hiểm nhận lại lúc Check-out |
| `CoAoMuaGiao` | BOOLEAN | DEFAULT `FALSE` | Có bàn giao áo mưa kèm theo lúc Check-in |
| `CoAoMuaTra` | BOOLEAN | DEFAULT `FALSE` | Có nhận lại áo mưa kèm theo lúc Check-out |
| `MaNhanVienGiao` | VARCHAR(10) | **FK** → D6.MaNhanVien, NULL | Nhân viên bàn giao xe |
| `MaNhanVienNhan` | VARCHAR(10) | **FK** → D6.MaNhanVien, NULL | Nhân viên nhận lại xe |
| `NgayTao` | DATETIME | NOT NULL | Ngày lập biên bản |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D3 — Khach_Hang_GPLX (Customer & Driving License)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaKhachHang` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã khách hàng. VD: `KH-001` |
| `HoTen` | NVARCHAR(100) | NOT NULL | Họ và tên đầy đủ |
| `Email` | VARCHAR(100) | UNIQUE, NULL | Email đăng ký |
| `SoDienThoai` | VARCHAR(15) | UNIQUE, NOT NULL | Số điện thoại đăng ký |
| `CCCD` | VARCHAR(12) | UNIQUE, NULL | Số căn cước công dân |
| `DiaChi` | NVARCHAR(200) | NULL | Địa chỉ thường trú |
| `MatKhau` | VARCHAR(255) | NOT NULL | Mật khẩu mã hóa (hashed) |
| `CoGPLX` | BOOLEAN | NOT NULL | TRUE: Khách có khai báo GPLX, FALSE: Khách không khai báo |
| `HangGPLX` | VARCHAR(20) | ENUM(A1, A2, Khac) | Hạng bằng lái (VD: A1, A2) |
| `SoGPLX` | VARCHAR(12) | UNIQUE, NULL | Số giấy phép lái xe |
| `NgayCapGPLX` | DATE | NULL | Ngày cấp GPLX |
| `NgayHetHanGPLX` | DATE | NULL | Ngày hết hạn GPLX |
| `AnhGPLXMatTruoc` | TEXT | NULL | URL ảnh mặt trước GPLX |
| `AnhGPLXMatSau` | TEXT | NULL | URL ảnh mặt sau GPLX |
| `TrangThaiGPLX` | VARCHAR(20) | ENUM(Khong_Dang_Ky, Da_Upload, Hop_Le, Tu_Choi) | `Khong_Dang_Ky` hoặc `Da_Upload` |
| `MaNhomXeDuocThue`| VARCHAR(20) | **FK** → DM_NhomXe | Nhóm xe tối đa khách được thuê dựa trên GPLX |
| `TrangThaiBlacklist` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Đã vào sổ đen hay chưa |
| `LyDoBlacklist` | TEXT | NULL | Lý do đưa vào Blacklist (VD: Gian lận GPLX lúc nhận xe) |
| `NgayTao` | DATETIME | NOT NULL | Ngày đăng ký tài khoản |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D4 — Lich_Su_Thue (Rental History & Internal Tracking)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaLichSu` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã bản ghi lịch sử |
| `MaBooking` | VARCHAR(15) | **FK** → D2.MaBooking, NOT NULL | Tham chiếu đến đơn Booking gốc |
| `MaKhachHang` | VARCHAR(10) | **FK** → D3.MaKhachHang, NOT NULL | Khách hàng thuê xe |
| `MaXe` | VARCHAR(10) | **FK** → D1.MaXe, NOT NULL | Xe máy đã thuê |
| `BienSoXe` | VARCHAR(12) | NOT NULL | Biển số xe |
| `ThoiGianNhan` | DATETIME | NOT NULL | Thời gian nhận xe thực tế |
| `ThoiGianTra` | DATETIME | NOT NULL | Thời gian trả xe thực tế |
| `TongTienThanhToan` | DECIMAL(15,0) | NOT NULL | Tổng tiền đã thanh toán |
| `GhiChuNoiBo` | TEXT | NULL | Ghi chú nội bộ |
| `DanhDauViPham` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Cờ đánh dấu có vi phạm giao thông (Phạt nguội) |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo bản ghi |

---

### D5 — Cau_Hinh_He_Thong (System Configuration)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaCauHinh` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã cấu hình. VD: `CF-001` |
| `SoLanGiaHanToiDa` | INT | NOT NULL, DEFAULT `3` | Giới hạn số lần gia hạn qua App |
| `DonGiaPhatXeThuong_Gio`| DECIMAL(12,0) | NOT NULL | Phí phạt trễ giờ xe số/ga (VND) |
| `DonGiaPhatXePKL_Gio` | DECIMAL(12,0) | NOT NULL | Phí phạt trễ giờ xe côn/PKL (VND) |
| `PhatMatMuBaoHiem` | DECIMAL(12,0) | NOT NULL | Phí phạt mất mũ bảo hiểm |
| `PhatMatAoMua` | DECIMAL(12,0) | NOT NULL | Phí phạt mất áo mưa |
| `PhanTramTangGiaLe` | DECIMAL(4,1) | NOT NULL | Tỷ lệ tăng giá dịp lễ tết |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo cấu hình |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D6 — Nhan_Vien (Staff Account)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaNhanVien` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã nhân viên |
| `HoTen` | NVARCHAR(100) | NOT NULL | Họ và tên nhân viên |
| `Email` | VARCHAR(100) | UNIQUE, NOT NULL | Email đăng nhập |
| `SoDienThoai` | VARCHAR(15) | NOT NULL | Số điện thoại |
| `VaiTro` | VARCHAR(20) | ENUM(Nhan_Vien, Admin) | `Nhan_Vien` hoặc `Admin` |
| `TrangThaiTaiKhoan` | BOOLEAN | NOT NULL, DEFAULT `TRUE` | Trạng thái truy cập |
| `MatKhau` | VARCHAR(255) | NOT NULL | Mật khẩu mã hóa |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo tài khoản |

---

### D7 — Bao_Duong (Maintenance Records)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaBaoDuong` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã lịch bảo dưỡng |
| `MaXe` | VARCHAR(10) | **FK** → D1.MaXe, NOT NULL | Xe thực hiện bảo dưỡng |
| `NgayBaoDuong` | DATETIME | NOT NULL | Ngày tiến hành bảo dưỡng |
| `ChiPhi` | DECIMAL(15,0) | NOT NULL | Chi phí thực tế thanh toán cho bảo dưỡng |
| `ChiTietBaoDuong` | TEXT | NOT NULL | Chi tiết nội dung công việc bảo dưỡng |
| `DaHoanThanh` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Đã bảo dưỡng xong hay chưa. Hoàn thành sẽ đưa xe về `San_Sang` |

---

### D8 — Danh_Gia (Reviews)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaDanhGia` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã đánh giá |
| `MaBooking` | VARCHAR(15) | **FK** → D2.MaBooking, UNIQUE | Đánh giá tương ứng với Booking nào |
| `DiemDanhGia` | INT | NOT NULL | Số sao (1 đến 5) |
| `NoiDung` | TEXT | NULL | Nội dung bình luận |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo đánh giá |

---

### D9 — Các Bảng Danh Mục (Lookup Tables)

| Tên Bảng | Cột PK (VARCHAR_20) | Ý nghĩa / Giá trị điển hình |
|----------|---------------------|-----------------------------|
| **DM_LoaiXe** | `MaLoaiXe` | `Xe_So`, `Xe_Ga`, `Xe_Con_Tay`, `Xe_PKL`, `Xe_Dien` |
| **DM_NhomXe** | `MaNhomXe` | `Nhom_50cc_Dien`, `Nhom_A1`, `Nhom_A2_PKL` |

---

## 3. CÁC DÒNG DỮ LIỆU (DATA FLOWS)

*(Các dòng dữ liệu giữ nguyên ánh xạ với DFD như phiên bản cũ, bổ sung luồng tương ứng cho bảo dưỡng, báo cáo doanh thu và duyệt GPLX tại StaffUI).*

| Mã | Tên luồng | Nguồn | Đích | Chức năng mở rộng |
|----|-----------|-------|------|-------------------|
| F2.18 | `Quyết toán Không đến nhận xe` | P2.0 | D2 | Chuyển booking sang `Khong_Den_Nhan_Xe` nếu gian lận GPLX hoặc quá hạn nhận xe, tịch thu cọc. |
| F4.19 | `Hoàn thành bảo dưỡng` | E2 (Staff) / E3 (Admin) | P4.0 | Cập nhật cờ `DaHoanThanh` trong D7 và cập nhật trạng thái xe D1 về `San_Sang`. |
| F6.13 | `Truy xuất Báo cáo Lợi nhuận` | E3 (Admin) | P6.0 | Lấy Doanh thu (D2) trừ đi Chi phí bảo dưỡng (D7) để tính toán Doanh thu ròng. |

---

## 4. DANH MỤC CÁC PHẦN TỬ DỮ LIỆU (DATA ELEMENT DICTIONARY)

### 4.1. Khóa chính (PK) và Khóa ngoại (FK)

| Thuộc tính | Kiểu dữ liệu | Định dạng / Ví dụ | Ràng buộc | Lưu trữ ở |
|------------|--------------|-------------------|-----------|-----------|
| `MaBooking` | VARCHAR(15) | `BK-20260622001` | PK, UNIQUE, NOT NULL | D2 |
| `MaKhachHang`| VARCHAR(10) | `KH-001` | PK, UNIQUE, NOT NULL | D3 |
| `MaLichSu` | VARCHAR(15) | `LS-001` | PK, UNIQUE, NOT NULL | D4 |
| `MaCauHinh` | VARCHAR(10) | `CF-001` | PK, UNIQUE, NOT NULL | D5 |
| `MaNhanVien` | VARCHAR(10) | `NV-001` | PK, UNIQUE, NOT NULL | D6 |
| `MaBaoDuong` | VARCHAR(15) | `BD-001` | PK, UNIQUE, NOT NULL | D7 |
| `MaDanhGia` | VARCHAR(15) | `DG-001` | PK, UNIQUE, NOT NULL | D8 |

### 4.2. Các trường tính toán nghiệp vụ

| Tên phần tử | Kiểu | Công thức / Quy tắc |
|-------------|------|---------------------|
| `DonGiaApDung` | DECIMAL(12,0) | = `DonGiaNgay` × (1 + `PhanTramTangGia`/100) |
| `TongTienThue` | DECIMAL(15,0) | = `DonGiaApDung` × `SoNgayThueGoc` |
| `TienGiamGia` | DECIMAL(15,0) | = `TongTienThue` × `PhanTramGiamGia`/100 |
| `PhiPhatTreHan` | DECIMAL(15,0) | Tính theo cấu hình nếu `ThoiGianTraThucTe` > `ThoiGianTra` |
| `PhiMatPhuKien` | DECIMAL(15,0) | = (Mũ giao - Mũ trả) × PhatMatMu + (Áo giao - Áo trả) × PhatMatAo |
| `LoiNhuanRong` | DECIMAL(15,0) | = SUM(`TongThanhToan`) từ D2 - SUM(`ChiPhi`) từ D7 (Tính toán động trong Dashboard) |

---

## 5. KIỂM TRA TÍNH NHẤT QUÁN (CONSISTENCY CHECK)

### 5.1. Kiểm tra Kho dữ liệu không "Mồ côi"

| Kho dữ liệu | Luồng GHI vào (Write) | Luồng ĐỌC ra (Read) | Kết quả |
|-------------|----------------------|---------------------|---------|
| **D1** Xe_May | F2.11, F4.12, F6.2, F4.19 | F2.3, F6.3 | ✅ Hợp lệ |
| **D2** Hop_Dong_Booking | F2.10, F3.7, F3.9, F4.5, F4.11, F4.15, F2.18 | F2.15, F3.3, F3.5, F4.2, F4.7, F6.13 | ✅ Hợp lệ |
| **D3** Khach_Hang_GPLX | F1.7, F5.8 | F1.8, F2.5, F5.3 | ✅ Hợp lệ |
| **D4** Lich_Su_Thue | F4.13, F5.6 | F5.2 | ✅ Hợp lệ |
| **D5** Cau_Hinh_He_Thong | F6.6 | F2.4, F3.4, F4.8, F6.7 | ✅ Hợp lệ |
| **D6** Nhan_Vien | F6.10 | F6.11 | ✅ Hợp lệ |
| **D7** Bao_Duong | Quản lý Bảo dưỡng | F6.13 | ✅ Hợp lệ |
| **D8** Danh_Gia | Khách hàng đánh giá | API tính trung bình sao | ✅ Hợp lệ |
| **D9** Các DM_... | Quản trị viên cập nhật | Các form thao tác Select | ✅ Hợp lệ |
