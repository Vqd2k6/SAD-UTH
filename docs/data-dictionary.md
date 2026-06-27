# 📖 TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)
## Hệ thống Quản lý và Cho thuê xe máy Thông minh

---

## 1. DANH MỤC CÁC TÁC NHÂN NGOÀI (EXTERNAL ENTITIES)

| Ký hiệu | Tên Actor | Mô tả |
|----------|-----------|-------|
| **E1** | Khách hàng (Customer) | Người có nhu cầu thuê xe máy. Tìm xe, đặt xe, thanh toán, yêu cầu gia hạn, trả xe sớm, đánh giá dịch vụ. |
| **E2** | Nhân viên cửa hàng (Staff) | Bàn giao xe, kiểm tra tình trạng xe khi trả, ghi nhận sự cố, lập hóa đơn phụ phí, tra cứu lịch sử thuê xe để xử lý phạt nguội ngoài hệ thống. Nhận thông báo đơn mới từ hệ thống để chuẩn bị xe. |
| **E3** | Quản trị viên (Admin) | Quản lý danh mục xe, cấu hình giá thuê/phí phạt (Dynamic Pricing), duyệt GPLX, quản lý tài khoản nhân viên, xem báo cáo doanh thu, quản lý Blacklist. |
| **E4** | Cổng thanh toán (Payment Gateway) | Hệ thống thanh toán trực tuyến bên ngoài (chuyển khoản ngân hàng, ví điện tử) xử lý giao dịch đặt cọc, thanh toán gia hạn và hoàn tiền hủy đơn. |

> **Ghi chú về Cơ quan Công an:** Việc xử lý phạt nguội giao thông là quy trình **dân sự bên ngoài** hệ thống. Khi nhận thông báo phạt nguội từ cơ quan chức năng, chủ xe (Nhân viên/Admin) tự tra cứu lịch sử thuê xe trên hệ thống theo biển số và khoảng thời gian, sau đó tự thương lượng với khách hàng hoặc mang hợp đồng thuê đến cơ quan Công an để trình báo. Do đó, Cơ quan Công an **không phải** là Actor tương tác trực tiếp với hệ thống.

---

## 2. CÁC KHO DỮ LIỆU (DATA STORES)

### D1 — Xe_May (Motorcycle Inventory)

> Lưu trữ thông tin toàn bộ xe máy trong cửa hàng. Phân loại rõ ràng theo nhóm dung tích.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaXe` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã định danh duy nhất của xe. VD: `XM-001` |
| `BienSo` | VARCHAR(12) | NOT NULL, UNIQUE | Biển số xe. VD: `59-B1 12345` |
| `SoKhung` | VARCHAR(20) | NOT NULL, UNIQUE | Số khung xe |
| `SoMay` | VARCHAR(20) | NOT NULL, UNIQUE | Số máy xe |
| `HangXe` | VARCHAR(30) | NOT NULL | Hãng sản xuất: Honda, Yamaha, Vespa, VinFast... |
| `TenXe` | VARCHAR(50) | NOT NULL | Tên dòng xe. VD: `Honda Vision 110cc` |
| `LoaiXe` | ENUM | NOT NULL | {`Xe_So`, `Xe_Ga`, `Xe_Con_Tay`, `Xe_PKL`, `Xe_Dien`} |
| `PhanKhoi` | INT | NOT NULL | Dung tích xi-lanh (cc). `0` nếu là xe điện |
| `NhomXe` | ENUM | NOT NULL | {`Nhom_50cc_Dien`, `Nhom_Tren_50cc`}. **Tự động phân loại**: PhanKhoi ≤ 50 hoặc LoaiXe = `Xe_Dien` → `Nhom_50cc_Dien`; PhanKhoi > 50 → `Nhom_Tren_50cc` |
| `DoiXe` | INT | NOT NULL | Năm sản xuất. VD: `2023` |
| `HinhAnhXe` | TEXT | NULL | Danh sách URL hình ảnh xe (JSON array) |
| `TrangThaiXe` | ENUM | NOT NULL, DEFAULT `San_Sang` | {`San_Sang`, `Dang_Thue`, `Dang_Bao_Duong`, `Dang_Sua_Chua`} |
| `MucTieuThuXang` | DECIMAL(4,1) | NULL | Lít/100km. VD: `1.7` |
| `SoMuBaoHiem` | INT | NOT NULL, DEFAULT `2` | Số mũ bảo hiểm đi kèm |
| `CoAoMua` | BOOLEAN | NOT NULL, DEFAULT `TRUE` | Có kèm áo mưa hay không |
| `DonGiaNgay` | DECIMAL(12,0) | NOT NULL | Giá thuê cơ bản 1 ngày (VND). VD: `150000` |
| `ODOHienTai` | INT | NOT NULL, DEFAULT `0` | Số ODO hiện tại (km) |
| `NgayTao` | DATETIME | NOT NULL | Ngày thêm xe vào hệ thống |
| `NgayCapNhat` | DATETIME | NOT NULL | Ngày cập nhật thông tin lần cuối |

---

### D2 — Hop_Dong_Booking (Booking Contract)

> Lưu trữ toàn bộ vòng đời đơn đặt xe, bao gồm trạng thái gia hạn (tối đa 3 lần) và trả xe sớm.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaBooking` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã đơn đặt xe. VD: `BK-20260622001` |
| `MaKhachHang` | VARCHAR(10) | **FK** → D3.MaKhachHang, NOT NULL | Khách hàng đặt xe |
| `MaXe` | VARCHAR(10) | **FK** → D1.MaXe, NOT NULL | Xe máy được đặt |
| `ThoiGianNhan` | DATETIME | NOT NULL | Thời gian hẹn nhận xe |
| `ThoiGianTra` | DATETIME | NOT NULL | Thời gian hẹn trả xe (cập nhật khi gia hạn) |
| `ThoiGianTraGoc` | DATETIME | NOT NULL | Thời gian trả xe ban đầu (không thay đổi khi gia hạn) |
| `ThoiGianTraThucTe` | DATETIME | NULL | Thời gian khách trả xe thực tế |
| `SoNgayThue` | INT | NOT NULL | Tổng số ngày thuê (bao gồm gia hạn) |
| `SoNgayThueGoc` | INT | NOT NULL | Số ngày thuê ban đầu |
| `TrangThaiBooking` | ENUM | NOT NULL, DEFAULT `Cho_Xac_Nhan` | {`Cho_Xac_Nhan`, `Da_Coc`, `Cho_Nhan_Xe`, `Dang_Thue`, `Yeu_Cau_Tra_Som`, `Qua_Han`, `Cho_Tra_Xe`, `Dang_Quyet_Toan`, `Hoan_Tat`, `Da_Huy`}. **Lưu ý:** Hệ thống **tự động duyệt** đơn sau khi cọc thành công + kiểm tra lịch xe không trùng. Không có bước Staff duyệt thủ công. |
| `DonGiaApDung` | DECIMAL(12,0) | NOT NULL | Đơn giá ngày áp dụng (đã tính Dynamic Pricing) |
| `TongTienThue` | DECIMAL(15,0) | NOT NULL | Tổng tiền thuê gốc (chưa phụ phí/giảm giá) |
| `PhanTramGiamGia` | DECIMAL(4,1) | DEFAULT `0` | % giảm giá thuê dài ngày. VD: `5.0`, `10.0` |
| `TienGiamGia` | DECIMAL(15,0) | DEFAULT `0` | Số tiền giảm giá (VND) |
| `PhanTramTangGia` | DECIMAL(4,1) | DEFAULT `0` | % tăng giá Dynamic Pricing (Lễ/Tết/Cuối tuần). VD: `15.0`, `30.0` |
| `TienTangGia` | DECIMAL(15,0) | DEFAULT `0` | Số tiền tăng giá Dynamic Pricing (VND) |
| `TienCoc` | DECIMAL(15,0) | NOT NULL | Tiền đặt cọc khách đã thanh toán |
| `PhuongThucCoc` | ENUM | NOT NULL | {`Chuyen_Khoan`, `Vi_Dien_Tu`, `Tien_Mat`} |
| `SoLanGiaHan` | INT | NOT NULL, DEFAULT `0` | Số lần gia hạn đã thực hiện. **Tối đa: 3** |
| `TongTienGiaHan` | DECIMAL(15,0) | DEFAULT `0` | Tổng tiền gia hạn phải trả thêm |
| `CoTraSom` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Khách có yêu cầu trả xe sớm không |
| `ThoiGianYeuCauTraSom` | DATETIME | NULL | Thời điểm khách gửi yêu cầu trả sớm |
| `PhiPhatTreHan` | DECIMAL(15,0) | DEFAULT `0` | Phí phạt trễ hạn (VND) |
| `PhiDenBuHuHai` | DECIMAL(15,0) | DEFAULT `0` | Tổng phí đền bù hư hại linh kiện |
| `PhiMatPhuKien` | DECIMAL(15,0) | DEFAULT `0` | Phí mất mũ bảo hiểm, áo mưa |
| `TongThanhToan` | DECIMAL(15,0) | NOT NULL | Tổng cuối cùng = TongTienThue - TienGiamGia + TienTangGia + TongTienGiaHan + PhiPhatTreHan + PhiDenBuHuHai + PhiMatPhuKien - TienCoc |
| `ODONhan` | INT | NULL | Số ODO khi bàn giao xe (Check-in) |
| `ODOTra` | INT | NULL | Số ODO khi trả xe (Check-out) |
| `MucXangNhan` | ENUM | NULL | {`Day`, `3_Phan_4`, `1_Phan_2`, `1_Phan_4`, `Gan_Het`} |
| `MucXangTra` | ENUM | NULL | Tương tự MucXangNhan |
| `AnhNgoaiQuanNhan` | TEXT | NULL | URL ảnh chụp ngoại quan khi giao xe (JSON array) |
| `AnhNgoaiQuanTra` | TEXT | NULL | URL ảnh chụp ngoại quan khi trả xe (JSON array) |
| `MaNhanVienGiao` | VARCHAR(10) | **FK** → D6.MaNhanVien, NULL | Nhân viên bàn giao xe |
| `MaNhanVienNhan` | VARCHAR(10) | **FK** → D6.MaNhanVien, NULL | Nhân viên nhận lại xe |
| `DanhGiaSao` | INT | NULL | Đánh giá từ 1-5 sao |
| `NoiDungDanhGia` | TEXT | NULL | Nội dung đánh giá của khách |
| `GhiChu` | TEXT | NULL | Ghi chú nội bộ |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo đơn |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D3 — Khach_Hang_GPLX (Customer & Driving License)

> Lưu trữ thông tin khách hàng kèm trạng thái xác thực GPLX. Hỗ trợ 2 luồng đăng ký: Có GPLX / Không có GPLX.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaKhachHang` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã khách hàng. VD: `KH-001` |
| `HoTen` | NVARCHAR(100) | NOT NULL | Họ và tên đầy đủ |
| `Email` | VARCHAR(100) | UNIQUE, NULL | Email đăng ký |
| `SoDienThoai` | VARCHAR(15) | UNIQUE, NOT NULL | Số điện thoại đăng ký |
| `CCCD` | VARCHAR(12) | UNIQUE, NULL | Số căn cước công dân |
| `DiaChi` | NVARCHAR(200) | NULL | Địa chỉ thường trú |
| `MatKhau` | VARCHAR(255) | NOT NULL | Mật khẩu mã hóa (hashed) |
| `LuaChonGPLX` | ENUM | NOT NULL | {`Co_GPLX`, `Khong_GPLX`}. Lựa chọn khi đăng ký |
| `HangGPLX` | ENUM | NULL | {`A1`, `A2`, `Khong`}. A1: xe 50cc-175cc; A2: xe >175cc |
| `SoGPLX` | VARCHAR(12) | UNIQUE, NULL | Số giấy phép lái xe |
| `NgayCapGPLX` | DATE | NULL | Ngày cấp GPLX |
| `NgayHetHanGPLX` | DATE | NULL | Ngày hết hạn GPLX |
| `AnhGPLXMatTruoc` | TEXT | NULL | URL ảnh mặt trước GPLX |
| `AnhGPLXMatSau` | TEXT | NULL | URL ảnh mặt sau GPLX |
| `TrangThaiGPLX` | ENUM | NOT NULL, DEFAULT `Khong_Dang_Ky` | {`Khong_Dang_Ky`, `Cho_Duyet`, `Da_Duyet`, `Tu_Choi`}. `Khong_Dang_Ky` khi chọn "Không có GPLX"; `Cho_Duyet` khi tải ảnh lên chờ Admin; `Da_Duyet` khi Admin xác nhận hợp lệ; `Tu_Choi` khi Admin từ chối |
| `LyDoTuChoiGPLX` | TEXT | NULL | Lý do Admin từ chối GPLX |
| `NhomXeDuocThue` | ENUM | NOT NULL, DEFAULT `Nhom_50cc_Dien` | {`Nhom_50cc_Dien`, `Nhom_Tren_50cc`}. = `Nhom_Tren_50cc` **chỉ khi** TrangThaiGPLX = `Da_Duyet` VÀ HangGPLX ∈ {`A1`, `A2`}; các trường hợp còn lại = `Nhom_50cc_Dien` |
| `TrangThaiBlacklist` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Nằm trong danh sách đen hay không |
| `LyDoBlacklist` | TEXT | NULL | Lý do đưa vào Blacklist |
| `NgayTao` | DATETIME | NOT NULL | Ngày đăng ký tài khoản |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D4 — Lich_Su_Thue (Rental History & Internal Tracking)

> Lưu vết toàn bộ lịch sử thuê xe phục vụ tra cứu nội bộ (tra biển số + thời gian khi nhận thông báo phạt nguội từ bên ngoài), thống kê doanh thu và quản lý Blacklist.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaLichSu` | VARCHAR(15) | **PK**, NOT NULL, UNIQUE | Mã bản ghi lịch sử. VD: `LS-001` |
| `MaBooking` | VARCHAR(15) | **FK** → D2.MaBooking, NOT NULL | Tham chiếu đến đơn Booking gốc |
| `MaKhachHang` | VARCHAR(10) | **FK** → D3.MaKhachHang, NOT NULL | Khách hàng thuê xe |
| `MaXe` | VARCHAR(10) | **FK** → D1.MaXe, NOT NULL | Xe máy đã thuê |
| `BienSoXe` | VARCHAR(12) | NOT NULL | Biển số xe (snapshot tại thời điểm thuê) |
| `ThoiGianNhan` | DATETIME | NOT NULL | Thời gian nhận xe thực tế |
| `ThoiGianTra` | DATETIME | NOT NULL | Thời gian trả xe thực tế |
| `TongTienThanhToan` | DECIMAL(15,0) | NOT NULL | Tổng tiền đã thanh toán |
| `GhiChuNoiBo` | TEXT | NULL | Ghi chú nội bộ của NV/Admin (VD: ghi nhận phạt nguội, kết quả thương lượng với khách, tình trạng xử lý bên ngoài) |
| `DanhDauViPham` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | NV/Admin tự đánh dấu bản ghi có liên quan đến vi phạm giao thông (phạt nguội) sau khi tra cứu thủ công |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo bản ghi |

---

### D6 — Nhan_Vien (Staff Account) *(Bổ sung phục vụ FK)*

> Lưu trữ thông tin tài khoản nhân viên do Admin quản lý.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaNhanVien` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã nhân viên. VD: `NV-001` |
| `HoTen` | NVARCHAR(100) | NOT NULL | Họ và tên nhân viên |
| `Email` | VARCHAR(100) | UNIQUE, NOT NULL | Email đăng nhập |
| `SoDienThoai` | VARCHAR(15) | NOT NULL | Số điện thoại |
| `VaiTro` | ENUM | NOT NULL | {`Nhan_Vien`, `Admin`} |
| `TrangThaiTaiKhoan` | ENUM | NOT NULL, DEFAULT `Hoat_Dong` | {`Hoat_Dong`, `Bi_Khoa`} |
| `MatKhau` | VARCHAR(255) | NOT NULL | Mật khẩu mã hóa |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo tài khoản |

---

## 3. CÁC DÒNG DỮ LIỆU (DATA FLOWS)

### 3.1. Luồng dữ liệu liên quan đến Tiến trình 1.0 — Đăng ký & Xác thực GPLX

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Cấu trúc dữ liệu |
|----|-----------|---------------|--------------------|--------------------|
| F1.1 | `Yeu_Cau_Dang_Ky_Tai_Khoan` | E1 (Khách hàng) | P1.0 | {HoTen, Email, SoDienThoai, MatKhau, LuaChonGPLX, [AnhGPLXMatTruoc, AnhGPLXMatSau, HangGPLX, SoGPLX, NgayCapGPLX, NgayHetHanGPLX]} |
| F1.2 | `Thong_Tin_Dang_Nhap` | E1 (Khách hàng) | P1.0 | {Email \| SoDienThoai, MatKhau} |
| F1.3 | `Ho_So_GPLX_Cho_Duyet` | P1.0 | E3 (Admin) | {MaKhachHang, HoTen, AnhGPLXMatTruoc, AnhGPLXMatSau, HangGPLX, SoGPLX, NgayCapGPLX, NgayHetHanGPLX} |
| F1.4 | `Ket_Qua_Duyet_GPLX` | E3 (Admin) | P1.0 | {MaKhachHang, TrangThaiGPLX ∈ {`Da_Duyet`, `Tu_Choi`}, [LyDoTuChoiGPLX]} |
| F1.5 | `Thong_Bao_Ket_Qua_GPLX` | P1.0 | E1 (Khách hàng) | {TrangThaiGPLX, NhomXeDuocThue, [LyDoTuChoiGPLX]} |
| F1.6 | `Luu_Thong_Tin_Khach_Hang` | P1.0 | D3 (Khach_Hang_GPLX) | Toàn bộ thuộc tính D3 |
| F1.7 | `Doc_Thong_Tin_Khach_Hang` | D3 (Khach_Hang_GPLX) | P1.0 | {MaKhachHang, TrangThaiGPLX, NhomXeDuocThue, TrangThaiBlacklist} |

---

### 3.2. Luồng dữ liệu liên quan đến Tiến trình 2.0 — Đặt xe trực tuyến & Giữ chỗ

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Cấu trúc dữ liệu |
|----|-----------|---------------|--------------------|--------------------|
| F2.1 | `Yeu_Cau_Tim_Kiem_Xe` | E1 (Khách hàng) | P2.0 | {LoaiXe, HangXe, PhanKhoi, KhoangGia_Min, KhoangGia_Max, ThoiGianNhan, ThoiGianTra} |
| F2.2 | `Ket_Qua_Tim_Kiem_Xe` | P2.0 | E1 (Khách hàng) | Danh sách {MaXe, TenXe, HinhAnhXe, DonGiaNgay, TrangThaiXe, NhomXe} |
| F2.3 | `Doc_Danh_Sach_Xe` | D1 (Xe_May) | P2.0 | {MaXe, TenXe, LoaiXe, PhanKhoi, NhomXe, DonGiaNgay, TrangThaiXe, HinhAnhXe} |
| F2.4 | `Kiem_Tra_GPLX_Khach` | D3 (Khach_Hang_GPLX) | P2.0 | {MaKhachHang, TrangThaiGPLX, NhomXeDuocThue, HangGPLX} |
| F2.5 | `Yeu_Cau_Dat_Xe` | E1 (Khách hàng) | P2.0 | {MaKhachHang, MaXe, ThoiGianNhan, ThoiGianTra, DichVuDiKem[]} |
| F2.6 | `Thong_Bao_Khoa_Xe_Tam` | P2.0 | E1 (Khách hàng) | {MaXe, ThoiGianKhoaTam = 15 phút, ThongBao: "Xe đang được giữ chỗ 15 phút, vui lòng thanh toán cọc"} |
| F2.7 | `Thanh_Toan_Dat_Coc` | E1 (Khách hàng) | P2.0 | {MaBooking, TienCoc, PhuongThucCoc} |
| F2.8 | `Luu_Don_Dat_Xe` | P2.0 | D2 (Hop_Dong_Booking) | Tạo mới bản ghi D2. Nếu cọc thành công + lịch xe không trùng → TrangThaiBooking = `Cho_Nhan_Xe` (**tự động duyệt**) |
| F2.9 | `Cap_Nhat_Trang_Thai_Xe` | P2.0 | D1 (Xe_May) | {MaXe, TrangThaiXe = `Dang_Thue`} |
| F2.10 | `Thong_Bao_Don_Moi` | P2.0 | E2 (Nhân viên) | {MaBooking, TenKhachHang, TenXe, ThoiGianNhan, ThoiGianTra}. Thông báo thông tin đơn mới để NV **chuẩn bị xe** (không cần duyệt) |
| F2.11 | `Thong_Bao_Nhac_Nho_Tu_Dong` | P2.0 | E1 (Khách hàng) | {MaBooking, LoaiThongBao ∈ {`Truoc_Nhan_2h`, `Truoc_Tra_2h`, `Het_Gio_Hen`}, NoiDung} |
| F2.12 | `Xac_Nhan_Dat_Xe` | P2.0 | E1 (Khách hàng) | {MaBooking, TrangThaiBooking = `Cho_Nhan_Xe`, DonGiaApDung, TongTienThue, PhanTramTangGia, PhanTramGiamGia, TienCoc} |
| F2.13 | `Kiem_Tra_Lich_Xe_Trung` | D2 (Hop_Dong_Booking) | P2.0 | Danh sách Booking khác cùng MaXe có khoảng thời gian trùng với [ThoiGianNhan, ThoiGianTra] yêu cầu |
| F2.14 | `Yeu_Cau_Thanh_Toan_Online` | P2.0 | E4 (Cổng thanh toán) | {MaBooking, SoTien, LoaiGiaoDich ∈ {`Dat_Coc`, `Gia_Han`, `Hoan_Tien`}, ThongTinKhachHang} |
| F2.15 | `Ket_Qua_Giao_Dich` | E4 (Cổng thanh toán) | P2.0 | {MaBooking, MaGiaoDich, TrangThaiGD ∈ {`Thanh_Cong`, `That_Bai`}, ThoiGianGD, SoTien} |
| F2.2a | `Thong_Tin_Booking_Hop_Le` | P2.2 (Kiểm tra điều kiện) | P2.3 (Giữ chỗ & Khóa xe tạm) | {MaKhachHang, MaXe, ThoiGianNhan, ThoiGianTra, DonGiaApDung, TienCoc} (Luồng nội bộ Level 1) |
| F2.3a | `Yeu_Cau_Thanh_Toan_Tam` | P2.3 (Giữ chỗ & Khóa xe tạm) | P2.4 (Xử lý Thanh toán cọc) | {MaBooking, TienCoc} (Luồng nội bộ Level 1) |
| F2.4a | `Xac_Nhan_Thanh_Toan_Thanh_Cong` | P2.4 (Xử lý Thanh toán cọc) | P2.5 (Xác nhận đặt xe & Điều phối) | {MaBooking, MaGiaoDich, TienCoc, TrangThai = Thanh_Cong} (Luồng nội bộ Level 1) |
| F2.4b | `Huy_Booking_Tam` | P2.4 (Xử lý Thanh toán cọc) | P2.3 (Giữ chỗ & Khóa xe tạm) | {MaBooking, LyDo = Qua_Han_Thanh_Toan \| That_Bai} (Luồng nội bộ Level 1) |

---

### 3.3. Luồng dữ liệu liên quan đến Tiến trình 3.0 — Gia hạn & Yêu cầu Trả xe sớm

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Cấu trúc dữ liệu |
|----|-----------|---------------|--------------------|--------------------|
| F3.1 | `Yeu_Cau_Gia_Han` | E1 (Khách hàng) | P3.0 | {MaBooking, SoNgayGiaHanThem \| SoGioGiaHanThem, ThoiGianTraMoi} |
| F3.2 | `Doc_Booking_Gia_Han` | D2 (Hop_Dong_Booking) | P3.0 | {MaBooking, MaXe, ThoiGianTra, SoLanGiaHan, TrangThaiBooking} |
| F3.3 | `Kiem_Tra_Lich_Xe` | D2 (Hop_Dong_Booking) | P3.0 | Danh sách Booking khác cùng MaXe có ThoiGianNhan trùng khoảng gia hạn |
| F3.4 | `Ket_Qua_Gia_Han` | P3.0 | E1 (Khách hàng) | {KetQua ∈ {`Thanh_Cong`, `Tu_Choi_Trung_Lich`, `Tu_Choi_Vuot_3_Lan`}, [TienGiaHanThem], [GoiYXeThayThe]} |
| F3.5 | `Cap_Nhat_Gia_Han` | P3.0 | D2 (Hop_Dong_Booking) | {MaBooking, ThoiGianTra_Moi, SoLanGiaHan += 1, TongTienGiaHan += TienGiaHanThem} |
| F3.6 | `Yeu_Cau_Tra_Xe_Som` | E1 (Khách hàng) | P3.0 | {MaBooking, ThoiGianMuonTra} (gửi trước ≥ 1 tiếng) |
| F3.7 | `Cap_Nhat_Tra_Som` | P3.0 | D2 (Hop_Dong_Booking) | {MaBooking, CoTraSom = TRUE, ThoiGianYeuCauTraSom, TrangThaiBooking = `Yeu_Cau_Tra_Som`} |
| F3.8 | `Thong_Bao_Tra_Som_NV` | P3.0 | E2 (Nhân viên) | {MaBooking, TenKhachHang, TenXe, ThoiGianMuonTra, ThongBao: "Khách yêu cầu trả xe sớm"} |
| F3.1a | `Yeu_Cau_Cap_Nhat_Gia_Han` | P3.1 (Kiểm tra khả năng gia hạn) | P3.2 (Cập nhật gia hạn) | {MaBooking, ThoiGianTra_Moi, SoNgayGiaHanThem} (Luồng nội bộ Level 1) |

> **Ghi chú:** Không hỗ trợ gia hạn thủ công qua hotline/quầy. Khách hàng **bắt buộc** thao tác gia hạn trực tiếp trên ứng dụng để đảm bảo tính minh bạch và chính xác của dữ liệu.

---

### 3.4. Luồng dữ liệu liên quan đến Tiến trình 4.0 — Nhận xe & Quyết toán phụ phí

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Cấu trúc dữ liệu |
|----|-----------|---------------|--------------------|--------------------|
| F4.1 | `Yeu_Cau_Xem_Danh_Sach_Giao_Nhan` | E2 (Nhân viên) | P4.0 | {NgayTruyVan = Hôm nay, ChiNhanh/MaNhanVien} |
| F4.2 | `Doc_Danh_Sach_Booking_Trong_Ngay` | D2 (Hop_Dong_Booking) | P4.0 | Các booking có TrangThai ∈ {`Cho_Nhan_Xe`, `Dang_Thue`, `Yeu_Cau_Tra_Som`, `Qua_Han`} có ThoiGianNhan hoặc ThoiGianTra trong ngày |
| F4.3 | `Danh_Sach_Giao_Nhan_Trong_Ngay` | P4.0 | E2 (Nhân viên) | Danh sách {MaBooking, LoaiCongViec (Giao/Nhận), ThoiGian, TenKhachHang, MaXe, TrangThaiBooking} |
| F4.4 | `Bien_Ban_Check_In` | E2 (Nhân viên) | P4.0 | {MaBooking, ODONhan, MucXangNhan, AnhNgoaiQuanNhan[], SoPhuKienGiao: {MuBaoHiem, AoMua}, GhiChuNgoaiQuan} |
| F4.5 | `Cap_Nhat_Check_In` | P4.0 | D2 (Hop_Dong_Booking) | {MaBooking, TrangThaiBooking = `Dang_Thue`, ODONhan, MucXangNhan, AnhNgoaiQuanNhan, MaNhanVienGiao} |
| F4.6 | `Bien_Ban_Check_Out` | E2 (Nhân viên) | P4.0 | {MaBooking, ODOTra, MucXangTra, AnhNgoaiQuanTra[], SoPhuKienTra: {MuBaoHiem, AoMua}, GhiChuHuHai, PhiDenBuHuHai, PhiMatPhuKien} |
| F4.7 | `Doc_Booking_Quyet_Toan` | D2 (Hop_Dong_Booking) | P4.0 | {MaBooking, ThoiGianTra, DonGiaApDung, TongTienThue, TienCoc, ...} |
| F4.8 | `Tinh_Phi_Phat_Tre_Han` | P4.0 | (Nội bộ) | Logic: Ân hạn 2h → 2-6h: phạt/giờ → 6-12h: 1/2 ngày → >12h: 1 ngày |
| F4.9 | `Hoa_Don_Quyet_Toan` | P4.0 | E1 (Khách hàng) | {MaBooking, TongTienThue, TienGiamGia, TienTangGia, TongTienGiaHan, PhiPhatTreHan, PhiDenBuHuHai, PhiMatPhuKien, TienCoc, TongThanhToan} |
| F4.10 | `Cap_Nhat_Quyet_Toan` | P4.0 | D2 (Hop_Dong_Booking) | {MaBooking, TrangThaiBooking = `Hoan_Tat`, PhiPhatTreHan, PhiDenBuHuHai, PhiMatPhuKien, TongThanhToan, ThoiGianTraThucTe, ODOTra, MaNhanVienNhan} |
| F4.11 | `Giai_Phong_Xe` | P4.0 | D1 (Xe_May) | {MaXe, TrangThaiXe = `San_Sang`, ODOHienTai = ODOTra} |
| F4.12 | `Luu_Lich_Su_Thue` | P4.0 | D4 (Lich_Su_Thue) | Tạo mới bản ghi D4 từ D2 đã hoàn tất |
| F4.13 | `Danh_Gia_Chuyen_Di` | E1 (Khách hàng) | P4.0 | {MaBooking, DanhGiaSao, NoiDungDanhGia} |
| F4.3a | `Ban_Giao_Bien_Ban_Check_Out` | P4.3 (Thực hiện nhận lại xe) | P4.4 (Tính toán & Quyết toán phụ phí) | {MaBooking, ODOTra, MucXangTra, PhiDenBuHuHai, PhiMatPhuKien, ThoiGianTraThucTe} (Luồng nội bộ Level 1) |

---

### 3.5. Luồng dữ liệu liên quan đến Tiến trình 5.0 — Tra cứu Lịch sử thuê & Quản lý Blacklist

> **Lưu ý nghiệp vụ:** Khi chủ xe nhận thông báo phạt nguội từ cơ quan chức năng (quy trình dân sự bên ngoài), Nhân viên/Admin sử dụng chức năng tra cứu lịch sử thuê trên hệ thống để xác định khách hàng nào đã thuê xe tại thời điểm vi phạm. Việc thương lượng, đóng phạt, hoặc khởi kiện dân sự diễn ra hoàn toàn bên ngoài hệ thống.

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Cấu trúc dữ liệu |
|----|-----------|---------------|--------------------|--------------------|
| F5.1 | `Yeu_Cau_Tra_Cuu_Lich_Su` | E2 (Nhân viên) / E3 (Admin) | P5.0 | {BienSoXe, KhoangThoiGian_Tu, KhoangThoiGian_Den} |
| F5.2 | `Doc_Lich_Su_Theo_Bien_So` | D4 (Lich_Su_Thue) | P5.0 | Danh sách {MaLichSu, MaKhachHang, MaBooking, BienSoXe, ThoiGianNhan, ThoiGianTra} theo BienSoXe và khoảng thời gian |
| F5.3 | `Doc_Thong_Tin_Khach_Hang` | D3 (Khach_Hang_GPLX) | P5.0 | {MaKhachHang, HoTen, SoDienThoai, CCCD, SoGPLX} |
| F5.4 | `Ket_Qua_Tra_Cuu` | P5.0 | E2 (Nhân viên) / E3 (Admin) | {KetQua ∈ {`Tim_Thay`, `Khong_Tim_Thay`}, [ThongTinKhachHang: {HoTen, CCCD, SoDienThoai, SoGPLX}], [ThongTinThue: {MaBooking, ThoiGianNhan, ThoiGianTra}]} |
| F5.5 | `Ghi_Chu_Vi_Pham_Noi_Bo` | E2 (Nhân viên) / E3 (Admin) | P5.0 | {MaLichSu, GhiChuNoiBo, DanhDauViPham = TRUE} |
| F5.6 | `Cap_Nhat_Ghi_Chu_Lich_Su` | P5.0 | D4 (Lich_Su_Thue) | {MaLichSu, DanhDauViPham = TRUE, GhiChuNoiBo} |
| F5.7 | `Yeu_Cau_Blacklist` | E2 (Nhân viên) / E3 (Admin) | P5.0 | {MaKhachHang, LyDoBlacklist} |
| F5.8 | `Cap_Nhat_Blacklist` | P5.0 | D3 (Khach_Hang_GPLX) | {MaKhachHang, TrangThaiBlacklist = TRUE, LyDoBlacklist} |

---

## 4. CÁC THÀNH PHẦN DỮ LIỆU CHÍNH (KEY DATA ELEMENTS)

### 4.1. Khóa chính & Khóa ngoại cốt lõi

| Tên phần tử | Định dạng | Ví dụ | Ràng buộc | Kho dữ liệu |
|-------------|-----------|-------|-----------|-------------|
| `MaXe` | `XM-NNN` (VARCHAR 10) | `XM-001` | PK, UNIQUE, NOT NULL | D1 |
| `MaBooking` | `BK-YYYYMMDDNNN` (VARCHAR 15) | `BK-20260622001` | PK, UNIQUE, NOT NULL | D2 |
| `MaKhachHang` | `KH-NNN` (VARCHAR 10) | `KH-001` | PK, UNIQUE, NOT NULL | D3 |
| `MaLichSu` | `LS-NNN` (VARCHAR 15) | `LS-001` | PK, UNIQUE, NOT NULL | D4 |
| `MaNhanVien` | `NV-NNN` (VARCHAR 10) | `NV-001` | PK, UNIQUE, NOT NULL | (Admin quản lý) |

### 4.2. Các trường ENUM quan trọng

| Tên phần tử | Miền giá trị | Quy tắc nghiệp vụ |
|-------------|-------------|-------------------|
| `TrangThaiBooking` | {`Cho_Xac_Nhan`, `Da_Coc`, `Cho_Nhan_Xe`, `Dang_Thue`, `Yeu_Cau_Tra_Som`, `Qua_Han`, `Cho_Tra_Xe`, `Dang_Quyet_Toan`, `Hoan_Tat`, `Da_Huy`} | Luồng vòng đời: Cho_Xac_Nhan → Da_Coc → **Cho_Nhan_Xe** *(tự động duyệt sau cọc + check lịch xe)* → Dang_Thue → (Yeu_Cau_Tra_Som / Qua_Han) → Cho_Tra_Xe → Dang_Quyet_Toan → Hoan_Tat |
| `TrangThaiXe` | {`San_Sang`, `Dang_Thue`, `Dang_Bao_Duong`, `Dang_Sua_Chua`} | Xe chỉ cho thuê khi `San_Sang` |
| `TrangThaiGPLX` | {`Khong_Dang_Ky`, `Cho_Duyet`, `Da_Duyet`, `Tu_Choi`} | Chỉ `Da_Duyet` mới được thuê xe >50cc |
| `NhomXe` | {`Nhom_50cc_Dien`, `Nhom_Tren_50cc`} | Phân loại theo PhanKhoi và LoaiXe |
| `HangGPLX` | {`A1`, `A2`, `Khong`} | A1: 50cc-175cc; A2: >175cc |
| `LoaiXe` | {`Xe_So`, `Xe_Ga`, `Xe_Con_Tay`, `Xe_PKL`, `Xe_Dien`} | Ảnh hưởng đến phí phạt trễ giờ |
| `NhomXeDuocThue` | {`Nhom_50cc_Dien`, `Nhom_Tren_50cc`} | Phụ thuộc vào TrangThaiGPLX |

### 4.3. Các trường tính toán nghiệp vụ

| Tên phần tử | Kiểu | Công thức / Quy tắc |
|-------------|------|---------------------|
| `DonGiaApDung` | DECIMAL(12,0) | = `DonGiaNgay` × (1 + `PhanTramTangGia`/100) |
| `TongTienThue` | DECIMAL(15,0) | = `DonGiaApDung` × `SoNgayThueGoc` |
| `TienGiamGia` | DECIMAL(15,0) | = `TongTienThue` × `PhanTramGiamGia`/100 |
| `TienTangGia` | DECIMAL(15,0) | = `DonGiaNgay` × `SoNgayThueGoc` × `PhanTramTangGia`/100 |
| `PhiPhatTreHan` | DECIMAL(15,0) | Ân hạn 2h: 0đ; Trễ 2-6h: `DonGiaPhat_GIo` × số giờ; 6-12h: `DonGiaApDung`/2; >12h: `DonGiaApDung` |
| `TongThanhToan` | DECIMAL(15,0) | = `TongTienThue` - `TienGiamGia` + `TienTangGia` + `TongTienGiaHan` + `PhiPhatTreHan` + `PhiDenBuHuHai` + `PhiMatPhuKien` - `TienCoc` |
| `SoLanGiaHan` | INT | ≤ 3 cho mỗi MaBooking |

---

## 5. KIỂM TRA TÍNH NHẤT QUÁN (CONSISTENCY CHECK)

### 5.1. Kiểm tra Kho dữ liệu không "Mồ côi"

| Kho dữ liệu | Luồng GHI vào (Write) | Luồng ĐỌC ra (Read) | Kết quả |
|-------------|----------------------|---------------------|---------|
| **D1** Xe_May | F2.9 (Cập nhật trạng thái), F4.11 (Giải phóng xe) | F2.3 (Đọc danh sách xe) | ✅ Hợp lệ |
| **D2** Hop_Dong_Booking | F2.8 (Lưu đơn — tự động duyệt), F3.5 (Cập nhật gia hạn), F3.7 (Cập nhật trả sớm), F4.5 (Check-in), F4.10 (Quyết toán) | F2.13 (Kiểm tra lịch xe trùng), F3.2, F3.3 (Đọc booking gia hạn), F4.2 (Đọc DS giao nhận), F4.7 (Đọc quyết toán) | ✅ Hợp lệ |
| **D3** Khach_Hang_GPLX | F1.6 (Lưu KH), F5.8 (Cập nhật Blacklist) | F1.7 (Đọc KH), F2.4 (Kiểm tra GPLX), F5.3 (Đọc thông tin KH) | ✅ Hợp lệ |
| **D4** Lich_Su_Thue | F4.12 (Lưu lịch sử), F5.6 (Ghi chú vi phạm nội bộ) | F5.2 (Đọc lịch sử theo biển số) | ✅ Hợp lệ |

### 5.2. Kiểm tra luồng không hợp lệ

- ✅ Không có luồng dữ liệu trực tiếp giữa 2 Actor (E↔E) mà không qua Tiến trình.
- ✅ Không có luồng dữ liệu trực tiếp giữa 2 Kho dữ liệu (D↔D) mà không qua Tiến trình.
- ✅ Không có luồng dữ liệu trực tiếp giữa Actor và Kho dữ liệu mà không qua Tiến trình.
- ✅ Mọi Tiến trình đều có ít nhất 1 luồng vào và 1 luồng ra.

---

> **Ghi chú:** Tên các biến, thuộc tính, kho dữ liệu và dòng dữ liệu trong tài liệu này được sử dụng **đồng nhất 100%** với sơ đồ DFD và đặc tả tiến trình xử lý.
