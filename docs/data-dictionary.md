# 📖 TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)
## Hệ thống Quản lý và Cho thuê xe máy Thông minh

---

## 1. DANH MỤC CÁC TÁC NHÂN NGOÀI (EXTERNAL ENTITIES)

| Ký hiệu | Tên Actor | Mô tả |
|----------|-----------|-------|
| **E1** | Khách hàng (Customer) | Người có nhu cầu thuê xe máy. Tìm xe, đặt xe, thanh toán, yêu cầu gia hạn, trả xe sớm, đánh giá dịch vụ. |
| **E2** | Nhân viên cửa hàng (Staff) | Bàn giao xe, kiểm tra tình trạng xe khi trả, ghi nhận sự cố, lập hóa đơn phụ phí, tra cứu lịch sử thuê xe để xử lý phạt nguội ngoài hệ thống. Nhận thông báo đơn mới từ hệ thống để chuẩn bị xe. |
| **E3** | Quản trị viên (Admin) | Tra cứu, hậu kiểm hồ sơ khách hàng và ảnh GPLX (đọc thông tin, không phê duyệt), quản lý danh mục xe máy, cấu hình giá thuê/phí phạt (Dynamic Pricing), quản lý tài khoản nhân viên, xem báo cáo doanh thu, quản lý Blacklist. |
| **E4** | Cổng thanh toán (Payment Gateway) | Hệ thống thanh toán trực tuyến bên ngoài (chuyển khoản ngân hàng, ví điện tử) xử lý giao dịch đặt cọc, thanh toán gia hạn và hoàn tiền hủy đơn. |
| **E5** | Hệ thống thời gian (Cron Job) | Tự động kích hoạt các tiến trình định kỳ theo lịch trình: Gửi thông báo nhắc nhở trước giờ nhận/trả xe, hủy đơn và giải phóng xe khi quá 15 phút không thanh toán cọc. |

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
| `LoaiXe` | ENUM | NOT NULL | {`Xe_So`, `Xe_Ga`, `Xe_Con_Tay`, `Xe_PKL`, `Xe_Dien`} |
| `PhanKhoi` | INT | NOT NULL | Dung tích xi-lanh (cc). `0` nếu là xe điện |
| `NhomXe` | ENUM | NOT NULL | {`Nhom_50cc_Dien`, `Nhom_A1`, `Nhom_A2_PKL`}. **Tự động phân loại**: PhanKhoi < 50 hoặc LoaiXe = `Xe_Dien` → `Nhom_50cc_Dien`; 50 ≤ PhanKhoi < 175 → `Nhom_A1`; PhanKhoi ≥ 175 → `Nhom_A2_PKL` |
| `DoiXe` | INT | NOT NULL | Năm sản xuất. VD: `2023` |
| `HinhAnhXe` | TEXT | NULL | Danh sách URL hình ảnh xe (JSON array) |
| `TrangThaiXe` | ENUM | NOT NULL, DEFAULT `San_Sang` | {`San_Sang`, `Dang_Thue`, `KHOA_TAM_15M`, `Dang_Bao_Duong`, `Dang_Sua_Chua`} |
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
| `ThoiGianTraThucTe` | DATETIME | NULL | Thời gian khách trả xe thực tế |
| `SoNgayThue` | INT | NOT NULL | Tổng số ngày thuê (bao gồm gia hạn) |
| `SoNgayThueGoc` | INT | NOT NULL | Số ngày thuê ban đầu |
| `TrangThaiBooking` | ENUM | NOT NULL, DEFAULT `Cho_Thanh_Toan_Coc` | {`Cho_Thanh_Toan_Coc`, `Cho_Nhan_Xe`, `Dang_Thue`, `Yeu_Cau_Tra_Som`, `Qua_Han`, `Cho_Tra_Xe`, `Dang_Quyet_Toan`, `Hoan_Tat`, `Da_Huy`}. **Lưu ý:** Hệ thống **tự động duyệt** đơn sau khi cọc thành công + kiểm tra lịch xe không trùng. |
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
| `SoMuBaoHiemGiao` | INT | DEFAULT `0` | Số mũ bảo hiểm thực tế bàn giao lúc Check-in |
| `SoMuBaoHiemTra` | INT | DEFAULT `0` | Số mũ bảo hiểm nhận lại lúc Check-out |
| `CoAoMuaGiao` | BOOLEAN | DEFAULT `FALSE` | Có bàn giao áo mưa kèm theo lúc Check-in |
| `CoAoMuaTra` | BOOLEAN | DEFAULT `FALSE` | Có nhận lại áo mưa kèm theo lúc Check-out |
| `MaNhanVienGiao` | VARCHAR(10) | **FK** → D6.MaNhanVien, NULL | Nhân viên bàn giao xe |
| `MaNhanVienNhan` | VARCHAR(10) | **FK** → D6.MaNhanVien, NULL | Nhân viên nhận lại xe |
| `DanhGiaSao` | INT | NULL | Đánh giá từ 1-5 sao |
| `NoiDungDanhGia` | TEXT | NULL | Nội dung đánh giá của khách |
| `GhiChu` | TEXT | NULL | Ghi chú nội bộ |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo đơn |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

> **Ghi chú về Khử chuẩn (Denormalization):**
> Trong bảng `Hop_Dong_Booking`, trường `SoNgayThue` được thiết kế dưới dạng Derived Attribute (thuộc tính tính toán từ `ThoiGianNhan` và `ThoiGianTra`). Việc lưu trữ dư thừa dữ liệu này (Redundancy) là chủ đích thiết kế (Khử chuẩn) để tối ưu tốc độ đọc (Read-heavy) trong các câu truy vấn báo cáo và tính toán logic trên Dashboard, thay vì phải chạy phép tính `DATEDIFF` real-time mỗi lần truy vấn. Tương tự, mảng hình ảnh URL `AnhNgoaiQuanNhan` và `AnhNgoaiQuanTra` lưu dạng JSON TEXT để tối ưu hóa thiết kế hướng Document, tránh việc phình to database bằng các bảng liên kết 1-N không cần thiết.

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
| `LuaChonGPLX` | ENUM | NOT NULL | {`Co_GPLX`, `Khong_GPLX`}. Lựa chọn khi đăng ký |
| `HangGPLX` | ENUM | NULL | {`A1`, `A2`, `Khong`}. A1: xe dưới 175cc; A2: xe mọi phân khối |
| `SoGPLX` | VARCHAR(12) | UNIQUE, NULL | Số giấy phép lái xe |
| `NgayCapGPLX` | DATE | NULL | Ngày cấp GPLX |
| `NgayHetHanGPLX` | DATE | NULL | Ngày hết hạn GPLX |
| `AnhGPLXMatTruoc` | TEXT | NULL | URL ảnh mặt trước GPLX |
| `AnhGPLXMatSau` | TEXT | NULL | URL ảnh mặt sau GPLX |
| `TrangThaiGPLX` | ENUM | NOT NULL, DEFAULT `Khong_Dang_Ky` | {`Khong_Dang_Ky`, `Da_Upload`}. `Khong_Dang_Ky`: Khách không khai báo GPLX → chỉ thuê nhóm 50cc/Điện; `Da_Upload`: Khách đã tải ảnh GPLX lên. |
| `NhomXeDuocThue` | ENUM | NOT NULL, DEFAULT `Nhom_50cc_Dien` | {`Nhom_50cc_Dien`, `Nhom_A1`, `Nhom_A2_PKL`}. Phụ thuộc vào HangGPLX |
| `TrangThaiBlacklist` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | Nằm trong danh sách đen hay không |
| `LyDoBlacklist` | TEXT | NULL | Lý do đưa vào Blacklist |
| `NgayTao` | DATETIME | NOT NULL | Ngày đăng ký tài khoản |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D4 — Lich_Su_Thue (Rental History & Internal Tracking)

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
| `GhiChuNoiBo` | TEXT | NULL | Ghi chú nội bộ của NV/Admin |
| `DanhDauViPham` | BOOLEAN | NOT NULL, DEFAULT `FALSE` | NV/Admin tự đánh dấu bản ghi có liên quan đến vi phạm giao thông (phạt nguội) sau khi tra cứu thủ công |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo bản ghi |

---

### D5 — Cau_Hinh_He_Thong (System Configuration)

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
|------------|--------------|-----------|-------|
| `MaCauHinh` | VARCHAR(10) | **PK**, NOT NULL, UNIQUE | Mã cấu hình. VD: `CF-001` |
| `SoLanGiaHanToiDa` | INT | NOT NULL, DEFAULT `3` | Giới hạn số lần gia hạn qua App |
| `DonGiaPhatXeThuong_Gio`| DECIMAL(12,0) | NOT NULL | Phí phạt trễ giờ xe số/ga (VND). VD: `30000` |
| `DonGiaPhatXePKL_Gio` | DECIMAL(12,0) | NOT NULL | Phí phạt trễ giờ xe côn/PKL (VND). VD: `50000` |
| `PhatMatMuBaoHiem` | DECIMAL(12,0) | NOT NULL | Phí phạt mất mũ bảo hiểm. VD: `150000` |
| `PhatMatAoMua` | DECIMAL(12,0) | NOT NULL | Phí phạt mất áo mưa. VD: `50000` |
| `PhanTramTangGiaLe` | DECIMAL(4,1) | NOT NULL | Tỷ lệ tăng giá dịp lễ tết. VD: `30.0` |
| `NgayTao` | DATETIME | NOT NULL | Ngày tạo cấu hình |
| `NgayCapNhat` | DATETIME | NOT NULL | Lần cập nhật cuối |

---

### D6 — Nhan_Vien (Staff Account)

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

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Mô tả chi tiết chức năng |
|----|-----------|---------------|--------------------|--------------------------|
| F1.1 | `Yêu cầu đăng ký tài khoản` | E1 (Khách hàng) | P1.0 | Gửi thông tin đăng ký tài khoản gồm: Họ tên, Email, SĐT, lựa chọn GPLX và ảnh chụp 2 mặt GPLX. |
| F1.2 | `Thông tin đăng nhập` | E1 (Khách hàng) | P1.0 | Gửi Email/Số điện thoại và Mật khẩu để yêu cầu đăng nhập hệ thống. |
| F1.3 | `Kết quả đăng nhập` | P1.0 | E1 (Khách hàng) | Trả về token đăng nhập khi xác thực thành công hoặc thông báo lỗi nếu sai mật khẩu. |
| F1.6 | `Thông báo tài khoản sẵn sàng` | P1.0 | E1 (Khách hàng) | Hệ thống thông báo tài khoản đã được tạo thành công. |
| F1.7 | `Lưu thông tin khách hàng` | P1.0 | D3 (Khach_Hang_GPLX) | Ghi mới tài khoản hoặc cập nhật trạng thái GPLX vào kho D3. |
| F1.8 | `Đọc thông tin khách hàng` | D3 (Khach_Hang_GPLX) | P1.0 | Truy vấn thông tin tài khoản phục vụ xác thực đăng nhập hoặc đối chiếu điều kiện thuê xe. |
| F1.9 | `Yêu cầu đăng nhập quản trị` | E2 (Nhân viên) / E3 (Admin) | P1.0 | Gửi Email/SĐT và mật khẩu đăng nhập hệ thống dành cho nhân viên hoặc admin. |
| F1.10 | `Kết quả đăng nhập quản trị` | P1.0 | E2 (Nhân viên) / E3 (Admin) | Trả về token đăng nhập thành công kèm thông tin vai trò (Role). |
| F1.11 | `Đọc thông tin nhân viên xác thực` | D6 (Nhan_Vien) | P1.0 | Truy vấn thông tin tài khoản nhân viên từ D6 phục vụ đối chiếu thông tin xác thực đăng nhập. |

---

### 3.2. Luồng dữ liệu liên quan đến Tiến trình 2.0 — Đặt xe trực tuyến & Giữ chỗ

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Mô tả chi tiết chức năng |
|----|-----------|---------------|--------------------|--------------------------|
| F2.1 | `Yêu cầu tìm kiếm xe` | E1 (Khách hàng) | P2.0 | Gửi bộ lọc tìm xe. |
| F2.2 | `Kết quả tìm kiếm xe` | P2.0 | E1 (Khách hàng) | Trả về danh sách xe máy khả dụng phù hợp với bộ lọc tìm kiếm. |
| F2.3 | `Đọc danh sách xe` | D1 (Xe_May) | P2.0 | Truy vấn thông tin xe máy từ kho D1 phục vụ tìm kiếm và kiểm tra tình trạng xe. |
| F2.4 | `Đọc cấu hình hệ thống` | D5 (Cau_Hinh_He_Thong) | P2.0 | Đọc các tham số giá ngày phục vụ tính toán chi phí. |
| F2.5 | `Kiểm tra GPLX khách` | D3 (Khach_Hang_GPLX) | P2.0 | Đọc thông tin GPLX và cờ Blacklist để xác thực khách có đủ điều kiện đặt xe hay không. |
| F2.6 | `Yêu cầu đặt xe` | E1 (Khách hàng) | P2.0 | Gửi yêu cầu đặt xe cụ thể kèm dịch vụ đi kèm trong khoảng thời gian xác định. |
| F2.7 | `Yêu cầu hủy đặt xe` | E1 (Khách hàng) | P2.0 | Gửi yêu cầu hủy đơn hàng đã cọc trước giờ nhận xe. |
| F2.8 | `Thông báo khóa xe tạm` | P2.0 | E1 (Khách hàng) | Xác nhận xe đã được khóa giữ chỗ tạm thời 15 phút, yêu cầu khách tiến hành thanh toán. |
| F2.9 | `Thanh toán đặt cọc` | E1 (Khách hàng) | P2.0 | Khách hàng thực hiện thanh toán tiền đặt cọc (30% giá trị đơn hàng). |
| F2.10 | `Lưu đơn đặt xe` | P2.0 | D2 (Hop_Dong_Booking) | Ghi mới đơn đặt xe hoặc cập nhật trạng thái đơn vào kho D2. |
| F2.11 | `Cập nhật trạng thái xe` | P2.0 | D1 (Xe_May) | Cập nhật trạng thái xe máy trong kho D1. |
| F2.12 | `Thông báo đơn mới` | P2.0 | E2 (Nhân viên) | Thông báo chi tiết đơn đặt xe đã cọc thành công để nhân viên chuẩn bị xe giao khách. |
| F2.14 | `Xác nhận đặt xe` | P2.0 | E1 (Khách hàng) | Gửi xác nhận đặt xe thành công. |
| F2.15 | `Kiểm tra lịch xe trùng` | D2 (Hop_Dong_Booking) | P2.0 | Truy vấn lịch sử booking trong D2 để kiểm tra xe có bị trùng lịch trong khoảng thời gian đặt không. |
| F2.16 | `Yêu cầu giao dịch trực tuyến` | P2.0 | E4 (Cổng thanh toán) | Gửi lệnh thanh toán cọc hoặc yêu cầu hoàn cọc sang cổng thanh toán trực tuyến E4. |
| F2.17 | `Kết quả giao dịch` | E4 (Cổng thanh toán) | P2.0 | Cổng thanh toán phản hồi kết quả giao dịch về hệ thống. |

---

### 3.3. Luồng dữ liệu liên quan đến Tiến trình 3.0 — Gia hạn & Yêu cầu Trả xe sớm

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Mô tả chi tiết chức năng |
|----|-----------|---------------|--------------------|--------------------------|
| F3.1 | `Yêu cầu gia hạn` | E1 (Khách hàng) | P3.0 | Gửi yêu cầu xin thuê thêm giờ/ngày trực tiếp trên ứng dụng của khách hàng. |
| F3.2 | `Thanh toán gia hạn` | E1 (Khách hàng) | P3.0 | Khách hàng thực hiện thanh toán online phần tiền phụ thu gia hạn. |
| F3.3 | `Đọc booking gia hạn` | D2 (Hop_Dong_Booking) | P3.0 | Đọc thông tin đơn booking hiện tại trong D2 để kiểm tra số lần gia hạn (<3 lần). |
| F3.4 | `Đọc cấu hình gia hạn` | D5 (Cau_Hinh_He_Thong) | P3.0 | Đọc cấu hình gia hạn từ kho D5 để lấy đơn giá phụ thu. |
| F3.5 | `Kiểm tra lịch xe` | D2 (Hop_Dong_Booking) | P3.0 | Kiểm tra xem xe có bị khách hàng khác đặt trước trong khoảng thời gian gia hạn không. |
| F3.6 | `Kết quả gia hạn` | P3.0 | E1 (Khách hàng) | Thông báo kết quả gia hạn thành công hoặc bị từ chối. |
| F3.7 | `Cập nhật gia hạn` | P3.0 | D2 (Hop_Dong_Booking) | Cập nhật thời gian trả xe mới, tăng số lần gia hạn và cộng tiền gia hạn vào D2. |
| F3.8 | `Yêu cầu trả xe sớm` | E1 (Khách hàng) | P3.0 | Gửi thông báo muốn mang trả xe sớm. |
| F3.9 | `Cập nhật trả sớm` | P3.0 | D2 (Hop_Dong_Booking) | Ghi nhận cờ trả sớm CoTraSom = TRUE và cập nhật trạng thái Yêu cầu trả sớm vào D2. |
| F3.10 | `Thông báo trả sớm` | P3.0 | E2 (Nhân viên) | Thông báo cho nhân viên tại quầy chuẩn bị tiếp nhận xe. |

---

### 3.4. Luồng dữ liệu liên quan đến Tiến trình 4.0 — Nhận xe & Quyết toán phụ phí

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Mô tả chi tiết chức năng |
|----|-----------|---------------|--------------------|--------------------------|
| F4.1 | `Yêu cầu xem danh sách giao nhận` | E2 (Nhân viên) | P4.0 | Nhân viên yêu cầu xem danh sách xe cần giao (Check-in) hoặc nhận (Check-out) hôm nay. |
| F4.2 | `Đọc danh sách booking trong ngày` | D2 (Hop_Dong_Booking) | P4.0 | Lọc các booking có mốc thời gian nhận/trả xe trong ngày từ kho D2. |
| F4.3 | `Danh sách giao nhận trong ngày` | P4.0 | E2 (Nhân viên) | Hiển thị danh sách công việc giao nhận xe máy trong ngày. |
| F4.4 | `Biên bản Check-in` | E2 (Nhân viên) | P4.0 | NV nhập biên bản giao xe. |
| F4.5 | `Cập nhật Check-in` | P4.0 | D2 (Hop_Dong_Booking) | Ghi nhận thông tin bàn giao xe và chuyển trạng thái booking sang "Đang thuê" trong D2. |
| F4.6 | `Biên bản Check-out` | E2 (Nhân viên) | P4.0 | NV nhập biên bản thu hồi xe. |
| F4.7 | `Đọc booking quyết toán` | D2 (Hop_Dong_Booking) | P4.0 | Truy vấn thông tin đơn thuê gốc từ D2 phục vụ đối chiếu và quyết toán tiền. |
| F4.8 | `Đọc bảng giá phạt và đền bù` | D5 (Cau_Hinh_He_Thong) | P4.0 | Lấy cấu hình phạt từ D5 để tính toán chi phí. |
| F4.10 | `Hóa đơn quyết toán` | P4.0 | E1 (Khách hàng) | Xuất hóa đơn quyết toán chi tiết các khoản chi phí và phụ thu gửi cho khách hàng. |
| F4.11 | `Cập nhật quyết toán` | P4.0 | D2 (Hop_Dong_Booking) | Ghi nhận trạng thái Hoàn tất và tổng thanh toán thực tế vào D2. |
| F4.12 | `Giải phóng xe` | P4.0 | D1 (Xe_May) | Chuyển trạng thái xe máy trong D1 về "Sẵn sàng". |
| F4.13 | `Lưu lịch sử thuê` | P4.0 | D4 (Lich_Su_Thue) | Sao chép và lưu vết toàn bộ dữ liệu đơn thuê đã hoàn tất sang kho lịch sử D4. |
| F4.14 | `Đánh giá chuyến đi` | E1 (Khách hàng) | P4.0 | Khách hàng gửi điểm số và nhận xét đánh giá dịch vụ. |
| F4.15 | `Ghi nhận đánh giá` | P4.0 | D2 (Hop_Dong_Booking) | Lưu thông tin phản hồi của khách hàng vào đơn booking tương ứng trong kho D2. |
| F4.17 | `Lệnh hoàn tiền/thu thêm` | P4.0 | E4 (Cổng thanh toán) | Gửi API yêu cầu cổng thanh toán thu thêm phụ phí (nếu nợ) hoặc hoàn lại tiền cọc dư cho khách (Auto API). |
| F4.18 | `Kết quả quyết toán` | E4 (Cổng thanh toán) | P4.0 | Cổng thanh toán phản hồi kết quả giao dịch về hệ thống để đóng đơn hàng. |

---

### 3.5. Luồng dữ liệu liên quan đến Tiến trình 5.0 — Tra cứu Lịch sử thuê & Quản lý Blacklist

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Mô tả chi tiết chức năng |
|----|-----------|---------------|--------------------|--------------------------|
| F5.1 | `Yêu cầu tra cứu lịch sử` | E2 (Nhân viên) / E3 (Admin) | P5.0 | Nhập Biển số xe và khoảng thời gian để tra cứu. |
| F5.2 | `Đọc lịch sử theo biển số` | D4 (Lich_Su_Thue) | P5.0 | Truy vết danh sách chuyến đi của biển số xe tương ứng trong khoảng thời gian từ kho D4. |
| F5.3 | `Đọc thông tin khách hàng` | D3 (Khach_Hang_GPLX) | P5.0 | Đọc thông tin cá nhân và số GPLX của khách thuê xe tương ứng từ kho D3. |
| F5.4 | `Kết quả tra cứu` | P5.0 | E2 (Nhân viên) / E3 (Admin) | Hiển thị kết quả tra cứu thông tin khách hàng. |
| F5.5 | `Ghi chú vi phạm nội bộ` | E2 (Nhân viên) / E3 (Admin) | P5.0 | NV/Admin gửi ghi chú tiến trình xử lý phạt nguội và cờ đánh dấu vi phạm. |
| F5.6 | `Cập nhật ghi chú lịch sử` | P5.0 | D4 (Lich_Su_Thue) | Lưu vết cờ vi phạm DanhDauViPham = TRUE và ghi chú nội bộ vào bản ghi lịch sử trong D4. |
| F5.7 | `Yêu cầu Blacklist` | E3 (Admin) | P5.0 | Admin yêu cầu đưa khách hàng vi phạm nghiêm trọng vào danh sách đen. |
| F5.8 | `Cập nhật Blacklist` | P5.0 | D3 (Khach_Hang_GPLX) | Cập nhật cờ TrangThaiBlacklist = TRUE kèm lý do chi tiết vào hồ sơ khách hàng ở kho D3. |

---

### 3.6. Luồng dữ liệu liên quan đến Tiến trình 6.0 — Quản lý Danh mục, Nhân viên & Cấu hình Hệ thống [MỚI]

| Mã | Tên luồng | Nguồn (Source) | Đích (Destination) | Mô tả chi tiết chức năng |
|----|-----------|---------------|--------------------|--------------------------|
| F6.1 | `Yêu cầu cập nhật thông tin xe máy` | E3 (Admin) | P6.0 | Admin gửi lệnh thêm xe mới hoặc chỉnh sửa thông tin xe máy trong danh mục. |
| F6.2 | `Lưu thông tin xe mới` | P6.0 | D1 (Xe_May) | Ghi mới xe hoặc cập nhật thông tin chỉnh sửa xe máy vào kho dữ liệu D1. |
| F6.3 | `Đọc danh sách xe quản trị` | D1 (Xe_May) | P6.0 | Đọc dữ liệu xe máy hiện tại từ kho D1 phục vụ kiểm tra trùng lắp và đối chiếu. |
| F6.4 | `Kết quả cập nhật xe` | P6.0 | E3 (Admin) | Phản hồi thông báo cập nhật thành công hoặc trả về mã lỗi cụ thể cho Admin. |
| F6.5 | `Yêu cầu cập nhật cấu hình hệ thống` | E3 (Admin) | P6.0 | Admin gửi lệnh thay đổi cấu hình vận hành hệ thống (giá, phạt trễ giờ, đền bù). |
| F6.6 | `Lưu cấu hình hệ thống` | P6.0 | D5 (Cau_Hinh_He_Thong) | Ghi đè cấu hình vận hành mới vào kho lưu trữ cấu hình hệ thống D5. |
| F6.7 | `Đọc cấu hình hệ thống quản trị` | D5 (Cau_Hinh_He_Thong) | P6.0 | Đọc thông số cấu hình hiện tại từ D5 phục vụ đối chiếu và hiển thị cho Admin. |
| F6.8 | `Kết quả cập nhật cấu hình` | P6.0 | E3 (Admin) | Phản hồi xác nhận đã áp dụng thành công thiết lập cấu hình hệ thống mới. |
| F6.9 | `Yêu cầu quản lý nhân viên` | E3 (Admin) | P6.0 | Admin gửi lệnh thêm mới, sửa đổi thông tin hoặc khóa tài khoản nhân viên. |
| F6.10 | `Cập nhật thông tin nhân viên` | P6.0 | D6 (Nhan_Vien) | Thực hiện ghi mới hoặc cập nhật thông tin chỉnh sửa tài khoản nhân viên vào kho D6. |
| F6.11 | `Đọc thông tin nhân viên` | D6 (Nhan_Vien) | P6.0 | Truy vấn danh sách và thông tin tài khoản nhân viên từ kho D6 để kiểm tra trùng lặp hoặc hiển thị. |
| F6.12 | `Kết quả quản lý nhân viên` | P6.0 | E3 (Admin) | Phản hồi thông báo cập nhật tài khoản nhân viên thành công hoặc thất bại cho Admin. |

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

### 4.2. Các trường ENUM quan trọng

| Tên phần tử | Miền giá trị | Quy tắc nghiệp vụ |
|-------------|-------------|-------------------|
| `TrangThaiBooking` | {`Cho_Thanh_Toan_Coc`, `Cho_Nhan_Xe`, `Dang_Thue`, `Yeu_Cau_Tra_Som`, `Qua_Han`, `Cho_Tra_Xe`, `Dang_Quyet_Toan`, `Hoan_Tat`, `Da_Huy`} | Luồng vòng đời: **Cho_Thanh_Toan_Coc** *(tạo đơn tạm, khóa xe 15 phút)* → **Cho_Nhan_Xe** *(tự động duyệt sau cọc thành công)* → Dang_Thue → (Yeu_Cau_Tra_Som / Qua_Han) → Cho_Tra_Xe → Dang_Quyet_Toan → Hoan_Tat |
| `TrangThaiXe` | {`San_Sang`, `Dang_Thue`, `KHOA_TAM_15M`, `Dang_Bao_Duong`, `Dang_Sua_Chua`} | Xe chỉ cho thuê khi `San_Sang`; `KHOA_TAM_15M` khi đang giữ chỗ chờ cọc |
| `TrangThaiGPLX` | {`Khong_Dang_Ky`, `Da_Upload`} | `Khong_Dang_Ky`: Khách không khai báo GPLX → chỉ thuê 50cc/Điện; `Da_Upload`: Khách đã tải ảnh → hệ thống tự phân quyền theo `HangGPLX`, không cần Admin duyệt |
| `NhomXe` | {`Nhom_50cc_Dien`, `Nhom_A1`, `Nhom_A2_PKL`} | Phân loại theo PhanKhoi và LoaiXe |
| `HangGPLX` | {`A1`, `A2`, `Khong`} | A1: xe dưới 175cc; A2: xe mọi phân khối |
| `LoaiXe` | {`Xe_So`, `Xe_Ga`, `Xe_Con_Tay`, `Xe_PKL`, `Xe_Dien`} | Ảnh hưởng đến phí phạt trễ giờ |
| `NhomXeDuocThue` | {`Nhom_50cc_Dien`, `Nhom_A1`, `Nhom_A2_PKL`} | Phụ thuộc vào TrangThaiGPLX và HangGPLX |

### 4.3. Các trường tính toán nghiệp vụ

| Tên phần tử | Kiểu | Công thức / Quy tắc |
|-------------|------|---------------------|
| `DonGiaApDung` | DECIMAL(12,0) | = `DonGiaNgay` × (1 + `PhanTramTangGia`/100) |
| `TongTienThue` | DECIMAL(15,0) | = `DonGiaApDung` × `SoNgayThueGoc` |
| `TienGiamGia` | DECIMAL(15,0) | = `TongTienThue` × `PhanTramGiamGia`/100 |
| `TienTangGia` | DECIMAL(15,0) | = `DonGiaNgay` × `SoNgayThueGoc` × `PhanTramTangGia`/100 |
| `PhiPhatTreHan` | DECIMAL(15,0) | Ân hạn 2h: 0đ; Trễ 2-6h: tính theo giờ (Gà/Số: 30K/h, Côn/PKL: 50K/h) nhưng tối đa không quá 1/2 ngày thuê; 6-12h: `DonGiaApDung`/2; >12h: `DonGiaApDung` |
| `TongThanhToan` | DECIMAL(15,0) | = `TongTienThue` - `TienGiamGia` + `TienTangGia` + `TongTienGiaHan` + `PhiPhatTreHan` + `PhiDenBuHuHai` + `PhiMatPhuKien` - `TienCoc` |
| `SoLanGiaHan` | INT | ≤ 3 cho mỗi MaBooking |

---

## 5. KIỂM TRA TÍNH NHẤT QUÁN (CONSISTENCY CHECK)

### 5.1. Kiểm tra Kho dữ liệu không "Mồ côi"

| Kho dữ liệu | Luồng GHI vào (Write) | Luồng ĐỌC ra (Read) | Kết quả |
|-------------|----------------------|---------------------|---------|
| **D1** Xe_May | F2.11 (Cập nhật trạng thái xe), F4.12 (Giải phóng xe), F6.2 (Lưu thông tin xe mới) | F2.3 (Đọc danh sách xe), F6.3 (Đọc danh sách xe quản trị) | ✅ Hợp lệ |
| **D2** Hop_Dong_Booking | F2.10 (Lưu đơn đặt xe), F3.7 (Cập nhật gia hạn), F3.9 (Cập nhật trả sớm), F4.5 (Cập nhật Check-in), F4.11 (Cập nhật quyết toán), F4.15 (Ghi nhận đánh giá), F2.22 (Tạo booking tạm), F2.26 (Cập nhật giao dịch hoàn tiền) | F2.15 (Kiểm tra lịch xe trùng), F3.3 (Đọc booking gia hạn), F3.5 (Kiểm tra lịch xe), F4.2 (Đọc danh sách booking trong ngày), F4.7 (Đọc booking quyết toán), F2.23 (Đọc booking nhắc nhở), F2.25 (Đọc đơn đặt xe (để hủy)), F3.14 (Đọc đơn đặt xe (để trả sớm)) | ✅ Hợp lệ |
| **D3** Khach_Hang_GPLX | F1.7 (Lưu thông tin khách hàng), F5.8 (Cập nhật Blacklist) | F1.8 (Đọc thông tin khách hàng), F2.5 (Kiểm tra GPLX khách), F5.3 (Đọc thông tin khách hàng) | ✅ Hợp lệ |
| **D4** Lich_Su_Thue | F4.13 (Lưu lịch sử thuê), F5.6 (Cập nhật ghi chú lịch sử) | F5.2 (Đọc lịch sử theo biển số) | ✅ Hợp lệ |
| **D5** Cau_Hinh_He_Thong | F6.6 (Lưu cấu hình hệ thống) | F2.4 (Đọc cấu hình hệ thống), F3.4 (Đọc cấu hình gia hạn), F4.8 (Đọc bảng giá phạt và đền bù), F6.7 (Đọc cấu hình hệ thống quản trị) | ✅ Hợp lệ |
| **D6** Nhan_Vien | F6.10 (Cập nhật thông tin nhân viên) | F6.11 (Đọc thông tin nhân viên) | ✅ Hợp lệ |

### 5.2. Kiểm tra luồng không hợp lệ

- ✅ Không có luồng dữ liệu trực tiếp giữa 2 Actor (E↔E) mà không qua Tiến trình.
- ✅ Không có luồng dữ liệu trực tiếp giữa 2 Kho dữ liệu (D↔D) mà không qua Tiến trình.
- ✅ Không có luồng dữ liệu trực tiếp giữa Actor và Kho dữ liệu mà không qua Tiến trình.
- ✅ Mọi Tiến trình đều có ít nhất 1 luồng vào và 1 luồng ra.

---

> **Ghi chú:** Tên các biến, thuộc tính, kho dữ liệu và dòng dữ liệu trong tài liệu này được sử dụng **đồng nhất 100%** với sơ đồ DFD và đặc tả tiến trình xử lý.
