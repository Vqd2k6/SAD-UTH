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
| `ThoiGianTra` | DATETIME | NOT NULL, CHECK (ThoiGianTra > ThoiGianNhan) | Thời gian hẹn trả xe (cập nhật khi gia hạn) |
| `ThoiGianTraGoc` | DATETIME | NOT NULL, CHECK (ThoiGianTraGoc >= ThoiGianNhan) | Thời gian trả xe ban đầu (không thay đổi khi gia hạn) |
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
| `DonGiaApDung` | DECIMAL(12,0) | NOT NULL, CHECK (DonGiaApDung >= 0) | Đơn giá ngày áp dụng (đã tính Dynamic Pricing) |
| `TongTienThue` | DECIMAL(15,0) | NOT NULL, CHECK (TongTienThue >= 0) | Tổng tiền thuê gốc (chưa phụ phí/giảm giá) |
| `PhanTramGiamGia` | DECIMAL(4,1) | DEFAULT `0`, CHECK (PhanTramGiamGia >= 0) | % giảm giá thuê dài ngày |
| `TienGiamGia` | DECIMAL(15,0) | DEFAULT `0`, CHECK (TienGiamGia >= 0) | Số tiền giảm giá (VND) |
| `PhanTramTangGia` | DECIMAL(4,1) | DEFAULT `0`, CHECK (PhanTramTangGia >= 0) | % tăng giá Dynamic Pricing |
| `TienTangGia` | DECIMAL(15,0) | DEFAULT `0`, CHECK (TienTangGia >= 0) | Số tiền tăng giá Dynamic Pricing (VND) |
| `TienCoc` | DECIMAL(15,0) | NOT NULL, CHECK (TienCoc >= 0) | Tiền đặt cọc khách đã thanh toán |
| `PhuongThucCoc` | VARCHAR(20) | ENUM(Chuyen_Khoan, Tien_Mat, Vi_Dien_Tu) | Phương thức thanh toán cọc |
| `MaGiaoDichCoc` | VARCHAR(100)| NULL | ID giao dịch từ Payment Gateway |
| `TrangThaiThanhToanCoc`| VARCHAR(20) | ENUM(PENDING, SUCCESS, FAILED, REFUNDED) | Mặc định `PENDING` |
| `TongTienGiaHan` | DECIMAL(15,0) | DEFAULT `0`, CHECK (TongTienGiaHan >= 0) | Tổng tiền gia hạn phải trả thêm |
| `PhiPhatTreHan` | DECIMAL(15,0) | DEFAULT `0`, CHECK (PhiPhatTreHan >= 0) | Phí phạt trễ hạn (VND) |
| `PhiDenBuHuHai` | DECIMAL(15,0) | DEFAULT `0`, CHECK (PhiDenBuHuHai >= 0) | Tổng phí đền bù hư hại linh kiện |
| `PhiMatPhuKien` | DECIMAL(15,0) | DEFAULT `0`, CHECK (PhiMatPhuKien >= 0) | Phí mất mũ bảo hiểm, áo mưa |
| `LyDoPhat` | TEXT | NULL | Ghi chú lý do đền bù hư hại/phạt |
| `TongThanhToan` | DECIMAL(15,0) | NOT NULL, CHECK (TongThanhToan >= 0) | Tổng thu cuối cùng của hóa đơn |
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
| `NgayHetHanGPLX` | DATE | NULL, CHECK (NgayHetHanGPLX > NgayCapGPLX) | Ngày hết hạn GPLX |
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
| `ChiPhi` | DECIMAL(15,0) | NOT NULL, CHECK (ChiPhi >= 0) | Chi phí thực tế thanh toán cho bảo dưỡng |
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

Bảng dưới đây tài liệu hóa chi tiết các luồng dữ liệu (Data Flows) trao đổi giữa các Tác nhân ngoài (E), các Tiến trình xử lý (P) và các Kho dữ liệu (D) trong sơ đồ DFD của hệ thống:

| ID | Tên luồng dữ liệu | Mô tả chung | Nguồn | Đích | Loại luồng | Tên Cấu trúc Dữ liệu | Lưu lượng (Ước tính) | Ghi chú / Quy tắc nghiệp vụ |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **F1.1** | Yêu cầu đăng ký tài khoản | Chứa thông tin tài khoản mới cùng ảnh chụp GPLX của khách hàng để đăng ký thành viên. | E1: Khách hàng | P1.0: Đăng ký & Đăng nhập | User Input | DS_DangKyTK | 50/ngày | Yêu cầu kiểm tra trùng lắp Email/SĐT/CCCD/Số GPLX. |
| **F1.2** | Thông tin đăng nhập | Nhập email/SĐT và mật khẩu để xác thực quyền truy cập vào ứng dụng. | E1: Khách hàng | P1.0: Đăng ký & Đăng nhập | User Input | DS_ThongTinDangNhap | 500/ngày | Kiểm tra khớp mật khẩu đã mã hóa. |
| **F1.3** | Kết quả đăng nhập | Phản hồi thông báo đăng nhập thành công kèm Access Token hoặc báo lỗi tài khoản/mật khẩu. | P1.0: Đăng ký & Đăng nhập | E1: Khách hàng | System Output | DS_KetQuaDangNhap | 500/ngày | Trả về JWT token khi thành công. |
| **F1.7** | Lưu thông tin khách hàng | Ghi thông tin tài khoản mới vào cơ sở dữ liệu. | P1.0: Đăng ký & Đăng nhập | D3: Khách hàng | Internal Write | DS_LuuThongTinKH | 50/ngày | Mặc định TrangThaiGPLX = 'Khong_Dang_Ky' và NhomXeDuocThue = 'Nhom_50cc_Dien'. |
| **F1.8** | Đọc thông tin khách hàng | Truy vấn thông tin tài khoản phục vụ xác thực đăng nhập. | D3: Khách hàng | P1.0: Đăng ký & Đăng nhập | Internal Read | DS_DocThongTinKH | 500/ngày | Trích xuất email/SĐT và hash mật khẩu. |
| **F1.9** | Yêu cầu đăng nhập quản trị | Nhập thông tin tài khoản nhân viên/admin để xác thực quyền quản trị. | E2: Nhân viên / E3: Admin | P1.0: Đăng ký & Đăng nhập | User Input | DS_ThongTinDangNhap | 20/ngày | Xác thực thông tin qua bảng nhân sự D6. |
| **F1.10** | Kết quả đăng nhập quản trị | Phản hồi đăng nhập quản trị thành công và phân quyền vai trò. | P1.0: Đăng ký & Đăng nhập | E2: Nhân viên / E3: Admin | System Output | DS_KetQuaDangNhap | 20/ngày | Gắn vai trò (Staff/Admin) vào token. |
| **F2.1** | Yêu cầu tìm kiếm xe | Khách lọc xe theo hãng, loại xe, phân khối, giá và thời gian thuê mong muốn. | E1: Khách hàng | P2.0: Đặt xe trực tuyến | User Input | DS_TimKiemXe | 1000/ngày | Thời gian nhận/trả phải lớn hơn thời điểm hiện tại. |
| **F2.2** | Kết quả tìm kiếm xe | Hiển thị danh sách các xe máy phù hợp và ở trạng thái Sẵn sàng. | P2.0: Đặt xe trực tuyến | E1: Khách hàng | System Output | DS_KetQuaTimKiemXe | 1000/ngày | Tự động loại trừ xe bận lịch trong khoảng thời gian yêu cầu. |
| **F2.6** | Yêu cầu đặt xe | Gửi yêu cầu đặt xe cụ thể cùng dịch vụ đi kèm trong khoảng thời gian xác định. | E1: Khách hàng | P2.0: Đặt xe trực tuyến | User Input | DS_YeuCauDatXe | 100/ngày | Khách hàng phải có GPLX được duyệt phù hợp với nhóm xe đã chọn (trừ nhóm <50cc). |
| **F2.7** | Yêu cầu hủy đặt xe | Khách gửi yêu cầu hủy đơn đã đặt trước khi nhận xe. | E1: Khách hàng | P2.0: Đặt xe trực tuyến | User Input | DS_YeuCauHuyDatXe | 5/ngày | Áp dụng chính sách hoàn cọc (100%, 50%, hoặc 0%) theo thời gian hủy. |
| **F2.8** | Thông báo khóa xe tạm | Hệ thống chuyển trạng thái xe sang khóa tạm 15 phút để chờ khách cọc. | P2.0: Đặt xe trực tuyến | E1: Khách hàng | System Output | DS_ThongBaoKhoaXeTam | 100/ngày | Cập nhật TrangThaiXe = 'KHOA_TAM_15M' trong D1. |
| **F2.9** | Thanh toán đặt cọc | Khách thực hiện thanh toán tiền cọc qua cổng trực tuyến để giữ xe chính thức. | E1: Khách hàng | P2.0: Đặt xe trực tuyến | User Input | DS_ThanhToanOnline | 80/ngày | Tiền cọc tối thiểu theo TiLeDatCoc cấu hình (thường là 30%). |
| **F2.12** | Thông báo đơn mới | Hệ thống gửi thông báo cho nhân viên chuẩn bị xe khi khách cọc thành công. | P2.0: Đặt xe trực tuyến | E2: Nhân viên | System Output | DS_ThongBaoDonMoi | 80/ngày | Chuyển trạng thái đơn sang 'Cho_Nhan_Xe'. |
| **F2.13** | Thông báo nhắc nhở tự động | Hệ thống gửi cảnh báo trước giờ nhận/trả xe và khi quá hạn nhận xe. | P2.0: Đặt xe trực tuyến | E1: Khách hàng | System Output | DS_ThongBaoNhacNho | 240/ngày | Hệ thống tự động quét và kích hoạt gửi thông báo định kỳ. |
| **F2.14** | Xác nhận đặt xe | Thông báo đặt xe thành công, mã Booking và hóa đơn cọc cho khách. | P2.0: Đặt xe trực tuyến | E1: Khách hàng | System Output | DS_XacNhanDatXe | 80/ngày | Ghi nhận đơn đặt chính thức vào D2. |
| **F2.16** | Yêu cầu giao dịch trực tuyến | Hệ thống yêu cầu cổng thanh toán trừ cọc hoặc thực hiện hoàn cọc. | P2.0: Đặt xe trực tuyến | E4: Cổng thanh toán | System Output | DS_YeuCauGiaoDich | 85/ngày | Gửi mã Booking và số tiền cọc sang API cổng. |
| **F2.17** | Kết quả giao dịch | Phản hồi từ cổng thanh toán về trạng thái giao dịch đặt cọc. | E4: Cổng thanh toán | P2.0: Đặt xe trực tuyến | User Input | DS_KetQuaGiaoDich | 85/ngày | Cập nhật MaGiaoDichCoc và TrangThaiThanhToanCoc trong D10. |
| **F2.18** | Quyết toán Không đến nhận xe | Hệ thống tự động hủy đơn và phạt 100% cọc nếu khách không đến nhận sau 2 giờ. | P2.0: Đặt xe trực tuyến | D2: Hợp đồng Booking | Internal Write | DS_QuyetToanNoShow | 2/ngày | Chuyển TrangThaiBooking = 'Khong_Den_Nhan_Xe' và thu hồi cọc. |
| **F3.1** | Yêu cầu gia hạn | Khách hàng gửi yêu cầu muốn thuê thêm X ngày/giờ trực tiếp trên ứng dụng. | E1: Khách hàng | P3.0: Gia hạn & Trả xe sớm | User Input | DS_YeuCauGiaHan | 10/ngày | Yêu cầu phải gửi trước giờ trả xe cũ ít nhất 2 giờ; số lần gia hạn <= 3. |
| **F3.2** | Thanh toán gia hạn | Khách thực hiện thanh toán chi phí gia hạn phát sinh trực tuyến. | E1: Khách hàng | P3.0: Gia hạn & Trả xe sớm | User Input | DS_ThanhToanOnline | 8/ngày | Đơn giá thuê ngày mới tính theo giá động thực tế của ngày gia hạn. |
| **F3.6** | Kết quả gia hạn | Phản hồi thông báo gia hạn thành công (cập nhật lịch) hoặc từ chối do trùng lịch xe. | P3.0: Gia hạn & Trả xe sớm | E1: Khách hàng | System Output | DS_KetQuaGiaHan | 10/ngày | Cập nhật ThoiGianTra mới vào D2 khi thành công. |
| **F3.8** | Yêu cầu trả xe sớm | Khách hàng báo trước thời điểm muốn trả xe sớm qua app để cửa hàng chuẩn bị. | E1: Khách hàng | P3.0: Gia hạn & Trả xe sớm | User Input | DS_YeuCauTraXeSom | 3/ngày | Yêu cầu gửi trước thời điểm trả mong muốn ít nhất 1 giờ. |
| **F3.10** | Thông báo trả sớm | Hệ thống thông báo cho nhân viên tại quầy chuẩn bị tiếp nhận xe trả sớm. | P3.0: Gia hạn & Trả xe sớm | E2: Nhân viên | System Output | DS_YeuCauTraXeSom | 3/ngày | Hiển thị thông báo trên màn hình điều phối của Staff. |
| **F3.12** | Yêu cầu giao dịch gia hạn trực tuyến | Hệ thống yêu cầu cổng thanh toán trừ chi phí gia hạn của khách hàng. | P3.0: Gia hạn & Trả xe sớm | E4: Cổng thanh toán | System Output | DS_YeuCauGiaoDich | 8/ngày | Truyền mã Booking và chi phí gia hạn. |
| **F3.13** | Kết quả giao dịch gia hạn | Phản hồi từ cổng thanh toán về trạng thái giao dịch gia hạn. | E4: Cổng thanh toán | P3.0: Gia hạn & Trả xe sớm | User Input | DS_KetQuaGiaoDich | 8/ngày | Cập nhật TongTienGiaHan trong D10. |
| **F3.15** | Kết quả yêu cầu trả sớm | Xác nhận chấp nhận yêu cầu trả xe sớm và gợi ý mang xe đến cửa hàng bàn giao. | P3.0: Gia hạn & Trả xe sớm | E1: Khách hàng | System Output | DS_KetQuaTraSom | 3/ngày | Cập nhật cờ CoTraSom = TRUE và ThoiGianYeuCauTraSom trong D2. |
| **F4.1** | Yêu cầu xem danh sách giao nhận | Nhân viên truy vấn danh sách công việc bàn giao/nghiệm thu xe trong ca làm việc. | E2: Nhân viên | P4.0: Giao nhận & Quyết toán | User Input | DS_TruyVanGiaoNhan | 10/ngày | Lọc theo ngày hiện tại và chi nhánh/cửa hàng. |
| **F4.3** | Danh sách giao nhận trong ngày | Trả về danh sách đơn hàng chờ Check-in và Check-out trong ca trực. | P4.0: Giao nhận & Quyết toán | E2: Nhân viên | System Output | DS_DanhSachGiaoNhan | 10/ngày | Lấy dữ liệu từ kho D2. |
| **F4.4** | Biên bản Check-in | Nhân viên nhập ODO giao, mức xăng giao, ảnh ngoại quan và phụ kiện giao thực tế. | E2: Nhân viên | P4.0: Giao nhận & Quyết toán | User Input | DS_BienBanCheckIn | 40/ngày | Ghi dữ liệu vào D11. Cập nhật TrangThaiXe = 'Dang_Thue' và TrangThaiBooking = 'Dang_Thue'. |
| **F4.6** | Biên bản Check-out | Nhân viên nhập ODO nhận, xăng nhận, ảnh ngoại quan nhận, linh kiện hư hỏng/mất mát (nếu có). | E2: Nhân viên | P4.0: Giao nhận & Quyết toán | User Input | DS_BienBanCheckOut | 40/ngày | Ghi dữ liệu vào D11. Kiểm tra ODO trả >= ODO nhận. |
| **F4.10** | Hóa đơn quyết toán | Xuất hóa đơn chi tiết (tiền thuê, giảm giá, phí phạt trễ giờ, đền bù) gửi cho khách. | P4.0: Giao nhận & Quyết toán | E1: Khách hàng | System Output | DS_HoaDonQuyetToan | 40/ngày | Ghi nhận hóa đơn chính thức vào D10 và giải phóng xe D1 về 'San_Sang'. |
| **F4.14** | Đánh giá chuyến đi | Khách hàng gửi số sao đánh giá (1-5) và bình luận sau khi kết thúc hành trình. | E1: Khách hàng | P4.0: Giao nhận & Quyết toán | User Input | DS_DanhGiaChuyenDi | 30/ngày | Ghi nhận đánh giá vào D8. Giới hạn 1 đánh giá/Booking. |
| **F4.17** | Yêu cầu giao dịch quyết toán trực tuyến | Hệ thống yêu cầu cổng thanh toán thu thêm phụ phí hoặc hoàn trả cọc thừa. | P4.0: Giao nhận & Quyết toán | E4: Cổng thanh toán | System Output | DS_YeuCauGiaoDich | 40/ngày | Trừ tiền phạt/đền bù hoặc hoàn trả tiền cọc thừa tự động qua API. |
| **F4.18** | Kết quả giao dịch quyết toán | Phản hồi từ cổng thanh toán về trạng thái giao dịch quyết toán tài chính. | E4: Cổng thanh toán | P4.0: Giao nhận & Quyết toán | User Input | DS_KetQuaGiaoDich | 40/ngày | Cập nhật hóa đơn D10 sang hoàn tất. Nếu lỗi thanh toán, chuyển đơn sang 'CHO_HOAN_TIEN_THU_CONG'. |
| **F4.19** | Hoàn thành bảo dưỡng | Nhân viên/Admin cập nhật trạng thái đã sửa chữa/bảo dưỡng xong cho xe máy bận. | E2: Nhân viên / E3: Admin | P4.0: Giao nhận & Quyết toán | User Input | DS_HoanThanhBaoDuong | 5/ngày | Cập nhật D7 (DaHoanThanh = TRUE) và đưa TrangThaiXe D1 về 'San_Sang'. |
| **F5.1** | Yêu cầu tra cứu lịch sử | Truy vấn lịch sử di chuyển và thông tin thuê xe của khách hoặc biển số xe cụ thể. | E2: Nhân viên / E3: Admin | P5.0: Tra cứu lịch sử & Blacklist | User Input | DS_TraCuuLichSu | 20/ngày | Lọc dữ liệu từ D4 (Lịch sử thuê) và D3. |
| **F5.4** | Kết quả tra cứu | Trả về danh sách chi tiết các chuyến đi, hóa đơn và thông tin GPLX của khách hàng. | P5.0: Tra cứu lịch sử & Blacklist | E2: Nhân viên / E3: Admin | System Output | DS_KetQuaTraCuu | 20/ngày | Hiển thị chi tiết thông tin và cờ cảnh báo vi phạm. |
| **F5.5** | Ghi chú vi phạm nội bộ | Nhân viên lập ghi chú vi phạm luật giao thông hoặc đền bù chậm của khách. | E2: Nhân viên | P5.0: Tra cứu lịch sử & Blacklist | User Input | DS_GhiChuViPham | 2/ngày | Ghi nhận vào D4, cập nhật DanhDauViPham = TRUE. |
| **F5.7** | Yêu cầu Blacklist | Admin thực hiện đưa tài khoản vi phạm nghiêm trọng vào danh sách đen để khóa quyền thuê. | E3: Admin | P5.0: Tra cứu lịch sử & Blacklist | User Input | DS_YeuCauBlacklist | 1/tuần | Cập nhật TrangThaiBlacklist = TRUE trong D3. |
| **F6.1** | Yêu cầu cập nhật thông tin xe máy | Admin thực hiện thêm xe mới, sửa thông tin xe hoặc xóa xe khỏi hệ thống. | E3: Admin | P6.0: Quản trị cấu hình & Tài khoản | User Input | DS_QuanLyXe | 5/tuần | Xe chỉ được xóa khi không trong hợp đồng thuê hoạt động. |
| **F6.4** | Kết quả cập nhật xe | Phản hồi cập nhật thông tin danh mục xe máy thành công hoặc báo lỗi trùng biển số. | P6.0: Quản trị cấu hình & Tài khoản | E3: Admin | System Output | DS_KetQuaCapNhat | 5/tuần | Cập nhật kho dữ liệu D1. |
| **F6.5** | Yêu cầu cập nhật cấu hình hệ thống | Admin thiết lập các tham số vận hành (phí trễ giờ, giá đền bù linh kiện, tỉ lệ cọc). | E3: Admin | P6.0: Quản trị cấu hình & Tài khoản | User Input | DS_CapNhatCauHinh | 1/tuần | Cấu hình lưu trữ tại D5. Tỉ lệ đặt cọc phải từ 10% - 50%. |
| **F6.8** | Kết quả cập nhật cấu hình | Phản hồi cập nhật tham số cấu hình thành công hoặc báo lỗi tham số vượt giới hạn. | P6.0: Quản trị cấu hình & Tài khoản | E3: Admin | System Output | DS_KetQuaCapNhat | 1/tuần | Cập nhật bản ghi cấu hình trong D5. |
| **F6.9** | Yêu cầu quản lý nhân viên | Admin thêm nhân viên mới, cập nhật phân quyền hoặc khóa tài khoản nhân viên. | E3: Admin | P6.0: Quản trị cấu hình & Tài khoản | User Input | DS_QuanLyNhanVien | 2/tháng | Nhân viên mới thêm phải có Email/SĐT độc nhất. |
| **F6.12** | Kết quả quản lý nhân viên | Phản hồi kết quả thêm/sửa/khóa nhân sự thành công hoặc báo lỗi trùng thông tin. | P6.0: Quản trị cấu hình & Tài khoản | E3: Admin | System Output | DS_KetQuaCapNhat | 2/tháng | Cập nhật thông tin vào D6. |
| **F6.13** | Truy xuất Báo cáo Lợi nhuận | Admin xuất báo cáo tổng doanh thu trừ đi chi phí bảo dưỡng xe để tính lợi nhuận ròng. | E3: Admin | P6.0: Quản trị cấu hình & Tài khoản | User Input | DS_TruyXuatBaoCao | 5/tháng | Query dữ liệu từ D2 (Booking), D10 (Hóa đơn) và D7 (Bảo dưỡng). |

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

## 6. ĐẶC TẢ CẤU TRÚC DỮ LIỆU CỦA CÁC LUỒNG (DATA STRUCTURES SPECIFICATIONS)

Dưới đây là định nghĩa chi tiết cho các cấu trúc dữ liệu (Data Structures) mô tả thành phần phần tử, kiểu dữ liệu và các ràng buộc logic đi kèm cho từng luồng thông tin:

### 6.1. Nhóm Xác thực & Tài khoản

#### `DS_DangKyTK`
*   `HoTen`: NVARCHAR(100) — Họ tên đầy đủ khách hàng (Bắt buộc).
*   `Email`: VARCHAR(100) — Địa chỉ email (Bắt buộc, duy nhất).
*   `SoDienThoai`: VARCHAR(15) — Số điện thoại liên hệ (Bắt buộc, duy nhất, độ dài 9-11 chữ số).
*   `CCCD`: VARCHAR(12) — Số căn cước công dân (Bắt buộc, 12 chữ số).
*   `MatKhau`: VARCHAR(255) — Mật khẩu đăng nhập (Bắt buộc, tối thiểu 8 ký tự).
*   `CoGPLX`: BOOLEAN — Có bằng lái xe hay không (Mặc định: FALSE).
*   `HangGPLX`: VARCHAR(20) — Hạng giấy phép lái xe (Nếu CoGPLX = TRUE; ENUM: A1, A2).
*   `SoGPLX`: VARCHAR(12) — Số GPLX (Nếu CoGPLX = TRUE; duy nhất, 12 chữ số).
*   `NgayCapGPLX`: DATE — Ngày cấp GPLX (Nếu CoGPLX = TRUE).
*   `NgayHetHanGPLX`: DATE — Ngày hết hạn GPLX (Nếu CoGPLX = TRUE).
*   `AnhGPLXMatTruoc`: TEXT — URL ảnh chụp mặt trước bằng lái.
*   `AnhGPLXMatSau`: TEXT — URL ảnh chụp mặt sau bằng lái.

#### `DS_ThongTinDangNhap`
*   `Email_Or_SoDienThoai`: VARCHAR(100) — Email hoặc Số điện thoại đăng nhập (Bắt buộc).
*   `MatKhau`: VARCHAR(255) — Mật khẩu đăng nhập dạng thô (Bắt buộc).

#### `DS_KetQuaDangNhap`
*   `ThanhCong`: BOOLEAN — Kết quả xác thực (TRUE / FALSE).
*   `AccessToken`: VARCHAR(512) — JWT Token truy cập hệ thống (Nếu ThanhCong = TRUE).
*   `Role`: VARCHAR(20) — Vai trò người dùng (Customer, Staff, Admin).
*   `ThongBaoLoi`: NVARCHAR(250) — Chi tiết thông báo lỗi (Nếu ThanhCong = FALSE).

---

### 6.2. Nhóm Đặt xe & Gia hạn

#### `DS_TimKiemXe`
*   `LoaiXe`: VARCHAR(20) — Loại xe (Tùy chọn; ENUM: Xe_So, Xe_Ga, Xe_Con_Tay, Xe_PKL, Xe_Dien).
*   `HangXe`: VARCHAR(30) — Hãng sản xuất (Tùy chọn; VD: Honda, Yamaha).
*   `KhoangGia_Min`: DECIMAL(12,0) — Giá thuê thấp nhất mong muốn (Mặc định: 0đ).
*   `KhoangGia_Max`: DECIMAL(12,0) — Giá thuê cao nhất mong muốn.
*   `ThoiGianNhan`: DATETIME — Thời điểm muốn nhận xe (Bắt buộc, > thời điểm hiện tại).
*   `ThoiGianTra`: DATETIME — Thời điểm muốn trả xe (Bắt buộc, > ThoiGianNhan).

#### `DS_KetQuaTimKiemXe`
*   Danh sách các đối tượng xe máy khả dụng dạng mảng: `Array<D1_Xe_May>`
*   Mỗi đối tượng bao gồm: `MaXe`, `TenXe`, `BienSo` (ẩn 3 số cuối), `HangXe`, `MaLoaiXe`, `PhanKhoi`, `DonGiaNgay`, `HinhAnhXe[]`.

#### `DS_YeuCauDatXe`
*   `MaKhachHang`: VARCHAR(10) — Mã khách hàng thực hiện đặt xe (Bắt buộc).
*   `MaXe`: VARCHAR(10) — Mã phương tiện lựa chọn (Bắt buộc).
*   `ThoiGianNhan`: DATETIME — Thời điểm nhận xe (Bắt buộc).
*   `ThoiGianTra`: DATETIME — Thời điểm trả xe (Bắt buộc).
*   `CoThueMuBaoHiem`: BOOLEAN — Có thuê thêm mũ bảo hiểm chất lượng cao không.
*   `CoThueAoMua`: BOOLEAN — Có thuê thêm áo mưa không.

#### `DS_XacNhanDatXe`
*   `MaBooking`: VARCHAR(15) — Mã đơn hàng do hệ thống tự sinh (BK-YYYYMMDDNNN).
*   `TrangThaiBooking`: VARCHAR(20) — Trạng thái đơn hàng (Mặc định: Cho_Thanh_Toan_Coc).
*   `DonGiaApDung`: DECIMAL(12,0) — Đơn giá thực tế áp dụng sau khi tính Dynamic Pricing.
*   `TongTienThue`: DECIMAL(15,0) — Tổng tiền thuê gốc = DonGiaApDung × Số ngày thuê.
*   `TienCoc`: DECIMAL(15,0) — Tiền cọc giữ xe tối thiểu cần thanh toán (thường = 30% TongTienThue).
*   `HanThanhToan`: DATETIME — Thời điểm hết hạn giữ xe chờ thanh toán cọc (15 phút từ lúc tạo đơn).

#### `DS_YeuCauGiaHan`
*   `MaBooking`: VARCHAR(15) — Mã đơn đặt xe cần gia hạn (Bắt buộc).
*   `SoNgayGiaHanThem`: INT — Số ngày muốn thuê thêm (Bắt buộc, CHECK > 0).
*   `ThoiGianTraMoi`: DATETIME — Thời điểm trả xe mới mong muốn.

---

### 6.3. Nhóm Giao dịch & Tài chính

#### `DS_ThanhToanOnline`
*   `MaBooking`: VARCHAR(15) — Mã đơn đặt xe thanh toán (Bắt buộc).
*   `SoTien`: DECIMAL(15,0) — Số tiền thực tế giao dịch (Bắt buộc, CHECK > 0).
*   `PhuongThucCoc`: VARCHAR(20) — Ví điện tử hoặc ngân hàng (ENUM: Chuyen_Khoan, Vi_Dien_Tu).
*   `LoaiGiaoDich`: VARCHAR(20) — Mục đích giao dịch (ENUM: Dat_Coc, Gia_Han, Quyet_Toan).

#### `DS_KetQuaGiaoDich`
*   `MaBooking`: VARCHAR(15) — Mã đơn đặt xe tương ứng.
*   `SoTien`: DECIMAL(15,0) — Số tiền đã giao dịch.
*   `TrangThaiGD`: VARCHAR(20) — Kết quả giao dịch từ Gateway (ENUM: SUCCESS, FAILED).
*   `MaGiaoDichCong`: VARCHAR(100) — Mã giao dịch đối soát do cổng thanh toán trả về.
*   `ThoiGianThanhToan`: DATETIME — Thời điểm giao dịch thành công.

#### `DS_HoaDonQuyetToan`
*   `MaHoaDon`: VARCHAR(15) — Mã hóa đơn quyết toán (HD-YYYYMMDDNNN).
*   `MaBooking`: VARCHAR(15) — Mã đơn đặt xe.
*   `DonGiaApDung`: DECIMAL(12,0) — Đơn giá áp dụng.
*   `TongTienThue`: DECIMAL(15,0) — Tiền thuê gốc.
*   `TienGiamGia`: DECIMAL(15,0) — Tiền ưu đãi dài ngày.
*   `TienTangGia`: DECIMAL(15,0) — Phụ trội ngày Lễ/Tết.
*   `TongTienGiaHan`: DECIMAL(15,0) — Tiền các lần gia hạn được duyệt.
*   `PhiPhatTreHan`: DECIMAL(15,0) — Phí phạt trả trễ quá giờ ân hạn.
*   `PhiDenBuHuHai`: DECIMAL(15,0) — Phí đền bù hư hỏng xe.
*   `PhiMatPhuKien`: DECIMAL(15,0) — Phí đền bù mất mũ bảo hiểm/áo mưa.
*   `TienCoc`: DECIMAL(15,0) — Khoản cọc ban đầu đã đóng (để cấn trừ).
*   `TongThanhToan`: DECIMAL(15,0) — Số tiền cuối cùng khách phải đóng thêm (nếu > 0) hoặc hoàn trả lại (nếu < 0).

---

### 6.4. Nhóm Vận hành Check-in & Check-out

#### `DS_BienBanCheckIn`
*   `MaBooking`: VARCHAR(15) — Mã đơn đặt xe (Bắt buộc).
*   `ODONhan`: INT — Chỉ số km hiện tại lúc giao xe (Bắt buộc, CHECK >= 0).
*   `MucXangNhan`: VARCHAR(20) — Mức xăng giao (Bắt buộc; ENUM: Day, 3_Phan_4, 1_Phan_2, 1_Phan_4, Gan_Het).
*   `AnhNgoaiQuanNhan`: TEXT — URL hoặc danh sách ảnh chụp hiện trạng xe lúc nhận.
*   `SoMuBaoHiemGiao`: INT — Số mũ bảo hiểm thực tế giao (CHECK từ 0 đến 2).
*   `CoAoMuaGiao`: BOOLEAN — Có bàn giao áo mưa kèm theo không.
*   `MaNhanVienGiao`: VARCHAR(10) — Mã nhân viên thực hiện Check-in.

#### `DS_BienBanCheckOut`
*   `MaBooking`: VARCHAR(15) — Mã đơn đặt xe (Bắt buộc).
*   `ODOTra`: INT — Chỉ số km hiện tại lúc nhận lại xe (Bắt buộc, CHECK >= ODONhan).
*   `MucXangTra`: VARCHAR(20) — Mức xăng thu hồi (Bắt buộc; ENUM: Day, 3_Phan_4, 1_Phan_2, 1_Phan_4, Gan_Het).
*   `AnhNgoaiQuanTra`: TEXT — URL hoặc danh sách ảnh chụp hiện trạng xe lúc trả.
*   `SoMuBaoHiemTra`: INT — Số mũ bảo hiểm nhận lại.
*   `CoAoMuaTra`: BOOLEAN — Có nhận lại áo mưa không.
*   `PhiDenBuHuHai`: DECIMAL(15,0) — Phí đền bù hư hại (Do nhân viên nhập tay dựa trên bảng giá cấu hình).
*   `PhiMatPhuKien`: DECIMAL(15,0) — Phí mất phụ kiện (Tự động tính nếu số lượng trả < số lượng nhận).
*   `MaNhanVienNhan`: VARCHAR(10) — Mã nhân viên thực hiện Check-out.

---

### 6.5. Nhóm Quản trị Admin

#### `DS_QuanLyXe`
*   `HanhDong`: VARCHAR(20) — Loại cập nhật (ENUM: CREATE, UPDATE, DELETE).
*   `MaXe`: VARCHAR(10) — Mã xe máy.
*   `BienSo`: VARCHAR(12) — Biển số xe.
*   `TenXe`: VARCHAR(50) — Tên xe.
*   `MaLoaiXe`: VARCHAR(20) — Loại xe.
*   `PhanKhoi`: INT — Dung tích xi-lanh.
*   `DonGiaNgay`: DECIMAL(12,0) — Đơn giá thuê/ngày.
*   `DoiXe`: INT — Năm sản xuất.

#### `DS_CapNhatCauHinh`
*   `SoLanGiaHanToiDa`: INT — Giới hạn lần gia hạn qua App (CHECK >= 0).
*   `DonGiaPhatXeThuong_Gio`: DECIMAL(12,0) — Phí phạt/giờ xe số & xe ga.
*   `DonGiaPhatXePKL_Gio`: DECIMAL(12,0) — Phí phạt/giờ xe côn & PKL.
*   `PhatMatMuBaoHiem`: DECIMAL(12,0) — Tiền phạt mất mũ bảo hiểm.
*   `PhatMatAoMua`: DECIMAL(12,0) — Tiền phạt mất áo mưa.
*   `PhanTramTangGiaLe`: DECIMAL(4,1) — Tỉ lệ tăng giá ngày lễ.

#### `DS_QuanLyNhanVien`
*   `HanhDong`: VARCHAR(20) — Lệnh (ENUM: CREATE, UPDATE, LOCK).
*   `MaNhanVien`: VARCHAR(10) — Mã nhân sự.
*   `HoTen`: NVARCHAR(100) — Họ tên nhân sự.
*   `Email`: VARCHAR(100) — Email liên hệ.
*   `SoDienThoai`: VARCHAR(15) — Số điện thoại.
*   `VaiTro`: VARCHAR(20) — Vai trò cấp tài khoản (ENUM: Nhan_Vien, Admin).
