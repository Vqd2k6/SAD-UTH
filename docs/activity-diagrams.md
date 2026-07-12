# TÀI LIỆU THIẾT KẾ: SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS)

## 1. LUỒNG ĐẶT XE & KHÓA PHƯƠNG TIỆN TẠM THỜI 15 PHÚT

```mermaid
graph TB
    Start(["Bắt đầu"])

    subgraph E1 [Khách hàng - E1]
        A1["Chọn xe máy & khoảng thời gian thuê"]
        A2["Nhận thông báo: Từ chối"]
        A3["Nhận thông báo: Xe không còn trống"]
        A4["Thực hiện thanh toán cọc online"]
        A5["Nhận xác nhận đặt xe thành công"]
        A6["Nhận thông báo: Đặt xe thất bại / Hết 15 phút"]
    end

    subgraph SYS [Hệ thống SmartRental]
        S1["Đọc hồ sơ khách hàng từ D3"]
        S2{"Có ảnh GPLX phù hợp<br/>với nhóm xe đã chọn<br/>và không trong Blacklist?"}
        S3["Truy vấn lịch đặt D2 kiểm tra trùng lịch"]
        S4{"Xe bị trùng lịch?"}
        S5["Tính tiền thuê tạm tính & tiền cọc theo D5"]
        S6["Tạo đơn đặt xe tạm thời<br/>CHO_THANH_TOAN"]
        S7["Khóa xe tạm: TrangThaiXe = KHOA_TAM_15M<br/>Lưu vào D1"]
        S8["Gọi API Cổng Thanh Toán"]
        S9{"Nhận kết quả<br/>từ Cổng TT?"}
        S10["Hủy đơn tạm<br/>TrangThaiXe = SAN_SANG<br/>Ghi lại D1 & D2"]
        S11["Lưu chính thức đơn đặt xe<br/>TrangThaiBooking = CHO_NHAN_XE<br/>Ghi vào D2"]
        S12["TrangThaiXe = DANG_THUE<br/>Ghi vào D1"]
        S13["Gửi thông báo điều phối<br/>công việc cho Nhân viên"]
        C1["Bộ đếm ngược 15 phút (tiến trình ngầm)"]
        C2{"Hết 15 phút<br/>mà chưa có<br/>phản hồi TT?"}
        C3["Bắn tín hiệu: HET_THOI_GIAN"]
    end

    subgraph E4 [Cổng Thanh Toán - E4]
        P1["Xử lý giao dịch cọc"]
        P2{"Giao dịch<br/>thành công?"}
        P3["Bắn tín hiệu: THANH_CONG"]
        P4["Bắn tín hiệu: THAT_BAI"]
    end

    %% Flow
    Start --> A1 --> S1
    S1 --> S2
    S2 -- Không --> A2 --> End1([Kết thúc])
    S2 -- Có --> S3 --> S4
    S4 -- Có --> A3 --> End2([Kết thúc])
    S4 -- Không --> S5 --> S6 --> S7
    S7 --> S8
    S8 --> P1 --> P2
    S7 --> C1 --> C2
    C2 -- Chưa hết giờ --> P2
    C2 -- Hết giờ --> C3

    P2 -- Thành công --> P3 --> S9
    P2 -- Thất bại --> P4 --> S9
    C3 --> S9

    S9 -- Thành công --> S11
    S9 -- Thất bại / Hết giờ --> S10

    S10 --> A6 --> End3([Kết thúc])

    A4 --> P1

    S11 --> S12 --> S13 --> A5 --> End4([Kết thúc])
```

---

## 2. LUỒNG GIA HẠN THUÊ XE TRÊN ỨNG DỤNG (EXTENSION LOGIC)

```mermaid
graph TB
    Start(["Bắt đầu"])

    subgraph E1 [Khách hàng - E1]
        A1["Gửi yêu cầu gia hạn qua App<br/>cùng khoảng thời gian muốn gia hạn"]
        A2["Nhận thông báo: Từ chối<br/>Gửi trước &lt; 2 tiếng"]
        A3["Nhận thông báo: Từ chối<br/>Đạt giới hạn gia hạn tối đa"]
        A4["Nhận thông báo: Từ chối<br/>Xe bị trùng lịch"]
        A5["Xác nhận và thực hiện<br/>thanh toán phí gia hạn online"]
        A6["Nhận thông báo: Gia hạn thất bại"]
        A7["Nhận xác nhận gia hạn thành công<br/>cùng giờ trả mới"]
    end

    subgraph SYS [Hệ thống SmartRental]
        S1["Đọc thông tin đơn đặt xe từ D2"]
        S2{"Yêu cầu gửi trước<br/>giờ trả cũ &gt;= 2 tiếng?"}
        S3["Đọc số lần gia hạn hiện tại từ D2"]
        S4{"SoLanGiaHan &lt; 3?"}
        S5["Truy vấn lịch xe tương lai trong D2"]
        S6{"Xe bị trùng lịch<br/>trong thời gian gia hạn?"}
        S7["Đọc đơn giá theo ngày thực tế gia hạn từ D5<br/>bao gồm giá động Lễ/Tết/Cuối tuần"]
        S8["Tính phí gia hạn<br/>dựa trên đơn giá động đọc từ D5"]
        S9["Gọi API Cổng Thanh Toán<br/>yêu cầu thu phí gia hạn"]
        S10{"Nhận kết quả<br/>từ Cổng TT?"}
        S11["Cập nhật D2:<br/>ThoiGianTra mới<br/>SoLanGiaHan += 1<br/>TongTienGiaHan += ChiPhiGiaHan"]
        S12["Gửi xác nhận cho Khách hàng"]
    end

    subgraph E4 [Cổng Thanh Toán - E4]
        P1["Xử lý giao dịch phí gia hạn"]
        P2{"Giao dịch<br/>thành công?"}
        P3["Bắn tín hiệu: THANH_CONG"]
        P4["Bắn tín hiệu: THAT_BAI"]
    end

    %% Flow
    Start --> A1 --> S1 --> S2
    S2 -- Không --> A2 --> End1([Kết thúc])
    S2 -- Có --> S3 --> S4
    S4 -- Không --> A3 --> End2([Kết thúc])
    S4 -- Có --> S5 --> S6
    S6 -- Có --> A4 --> End3([Kết thúc])
    S6 -- Không --> S7 --> S8 --> S9

    S9 --> P1
    A5 --> P1
    P1 --> P2
    P2 -- Thành công --> P3 --> S10
    P2 -- Thất bại --> P4 --> S10

    S10 -- Thất bại --> A6 --> End4([Kết thúc])
    S10 -- Thành công --> S11 --> S12 --> A7 --> End5([Kết thúc])
```

---

## 3. LUỒNG CHECK-IN, CHECK-OUT & QUYẾT TOÁN PHỤ PHÍ LŨY TIẾN

### 3.1. Phân đoạn Bàn giao xe (Check-in)

```mermaid
graph TB
    Start1(["Bắt đầu Check-in"])

    subgraph E2_CI [Nhân viên - E2]
        NV1["Chọn đơn Booking cần bàn giao<br/>từ danh sách công việc"]
        NV2["Kiểm tra ODO, mức xăng,<br/>phụ kiện, ngoại quan xe"]
        NV3["Điền & gửi Biên bản Check-in<br/>vào hệ thống"]
    end

    subgraph SYS_CI [Hệ thống SmartRental]
        S1["Đọc thông tin tài khoản<br/>Nhân viên từ D6"]
        S2{"TrangThaiTaiKhoan<br/>= HOA_DONG?"}
        S3["Từ chối thao tác:<br/>Hiển thị lỗi tài khoản bị khóa"]
        S4["Xác nhận dữ liệu<br/>Biên bản Check-in hợp lệ"]
        S5["Cập nhật D2:<br/>TrangThaiBooking = DANG_THUE<br/>Ghi nhận ODONhan, MucXangNhan<br/>So luong phu kien da giao"]
    end

    %% Flow
    Start1 --> NV1 --> S1 --> S2
    S2 -- Không / Bị Khóa --> S3 --> End_CI_Reject([Kết thúc - Từ chối])
    S2 -- Hoạt động --> NV2 --> NV3 --> S4 --> S5 --> End_CI_OK([Kết thúc - Thành công])
```

### 3.2. Phân đoạn Nhận lại xe & Quyết toán (Check-out)

```mermaid
graph TB
    Start2(["Bắt đầu Check-out"])

    subgraph E2_CO [Nhân viên - E2]
        NV1["Chọn đơn Booking cần nhận lại xe"]
        NV2["Kiểm tra xe: ODO trả, mức xăng,<br/>phụ kiện, ngoại quan"]
        NV3{"Phát hiện hư hỏng mới<br/>hoặc mất phụ kiện?"}
        NV4["Thương lượng với khách<br/>Nhập PhiDenBuHuHai & PhiMatPhuKien"]
        NV5["Phí đền bù = 0đ"]
    end

    subgraph SYS_CO [Hệ thống SmartRental]
        S1["Đọc thông tin tài khoản<br/>Nhân viên từ D6"]
        S2{"TrangThaiTaiKhoan<br/>= HOA_DONG?"}
        S3["Từ chối thao tác:<br/>Hiển thị lỗi tài khoản bị khóa"]
        S4["Đọc thông tin Booking từ D2"]
        S5{"ODO trả &gt;=<br/>ODO nhận?"}
        S6["Báo lỗi: ODO không hợp lệ<br/>Yêu cầu Nhân viên nhập lại"]
        S7["Đọc cấu hình phí phạt từ D5"]
        S8{"Trễ hạn trả xe?"}
        S9["Phí phạt trễ hạn = 0đ<br/>trong ân hạn 2 tiếng"]
        S10["Phạt theo giờ:<br/>30K/h xe số-ga; 50K/h PKL<br/>Tối đa = 1/2 DonGiaApDung"]
        S11["Phạt = 1/2 DonGiaApDung"]
        S12["Phạt = 1 DonGiaApDung<br/>tính thêm 1 ngày thuê mới"]
        S13["Tính Tổng quyết toán:<br/>TongQuyetToan =<br/>TienThueGoc + TienPhatTreHan<br/>+ PhiDenBuHuHai + PhiMatPhuKien<br/>+ TongTienGiaHan - TienCoc"]
        S14{"TongQuyetToan &gt; 0<br/>(Khách còn nợ)?"}
        S15{"TongQuyetToan &lt; 0<br/>(Hoàn tiền cọc dư)?"}
        S16["TongQuyetToan = 0:<br/>Quyết toán cân bằng"]
        S17["Gọi API E4:<br/>Thu thêm TongQuyetToan từ khách"]
        S18["Gọi API E4:<br/>Hoàn tiền |TongQuyetToan| cho khách"]
        S19{"Nhận kết quả<br/>từ Cổng TT?"}
        S20["Ghi nhận lỗi giao dịch<br/>TrangThaiBooking = CHO_HOAN_TIEN_THU_CONG<br/>Chuyển Kế toán xử lý thủ công"]
        S21["Cập nhật D2:<br/>TrangThaiBooking = HOAN_TAT"]
        S22["Cập nhật D1:<br/>TrangThaiXe = SAN_SANG<br/>ODOHienTai = ODOTra"]
        S23["Lưu bản ghi vào D4:<br/>Lich_Su_Thue"]
        S24["Xuất hóa đơn<br/>gửi cho Khách hàng"]
    end

    subgraph E4_CO [Cổng Thanh Toán - E4]
        P1["Xử lý giao dịch<br/>thu thêm hoặc hoàn tiền"]
        P2{"Giao dịch<br/>thành công?"}
        P3["Bắn tín hiệu: THANH_CONG"]
        P4["Bắn tín hiệu: THAT_BAI"]
    end

    subgraph E1_CO [Khách hàng - E1]
        KH1["Nhận hóa đơn quyết toán"]
    end

    %% Flow
    Start2 --> NV1 --> S1 --> S2
    S2 -- Không / Bị Khóa --> S3 --> End_CO_Reject([Kết thúc - Từ chối])
    S2 -- Hoạt động --> S4 --> NV2 --> S5
    S5 -- Không --> S6 --> NV2
    S5 -- Có --> NV3
    NV3 -- Có --> NV4 --> S7
    NV3 -- Không --> NV5 --> S7
    S7 --> S8
    S8 -- Không / Trễ <= 2h --> S9 --> S13
    S8 -- Trễ từ 2h - 6h --> S10 --> S13
    S8 -- Trễ từ 6h - 12h --> S11 --> S13
    S8 -- Trễ > 12h --> S12 --> S13
    S13 --> S14
    S14 -- Có --> S17 --> P1
    S14 -- Không --> S15
    S15 -- Có --> S18 --> P1
    S15 -- Không --> S16 --> S21

    P1 --> P2
    P2 -- Thành công --> P3 --> S19
    P2 -- Thất bại --> P4 --> S19
    S19 -- Thành công --> S21
    S19 -- Thất bại --> S20
    S20 --> S22

    S21 --> S22 --> S23 --> S24 --> KH1 --> End_CO_OK([Kết thúc - Thành công])
```

---

## 4. LUỒNG ĐĂNG KÝ VÀ DUYỆT GPLX (MANUAL APPROVAL)

Mô tả luồng hệ thống ghi nhận ảnh GPLX và Nhân viên/Admin thực hiện duyệt thủ công để cấp quyền thuê xe.

```mermaid
graph TB
    Start(["Bắt đầu"])

    subgraph E1_GPLX [Khách hàng - E1]
        A1["Vào mục Hồ sơ cá nhân<br/>chọn Tải ảnh GPLX"]
        A2["Chọn tệp ảnh GPLX hợp lệ"]
        A3["Khai báo Hạng bằng lái:<br/>A1 / A2"]
        A4["Nhận thông báo:<br/>Đã mở khóa quyền thuê xe<br/>tương ứng thành công"]
        A5["Nhận thông báo:<br/>Tải ảnh thất bại hoặc Bị từ chối"]
    end

    subgraph SYS_GPLX [Hệ thống SmartRental]
        S1{"Tệp ảnh hợp lệ?<br/>Đúng định dạng & kích thước"}
        S2["Lưu ảnh GPLX vào kho lưu trữ"]
        S3["Gán TrangThaiGPLX = DA_UPLOAD<br/>và NhomXeDuocThue = Nhom_50cc_Dien<br/>vào hồ sơ D3"]
        S4["Thông báo chờ duyệt"]
        S8["Trả về lỗi tải ảnh"]
    end

    subgraph E2_GPLX [Nhân viên/Admin - E2/E3]
        NV1["Nhận thông báo có hồ sơ mới"]
        NV2["Kiểm tra tính hợp lệ của ảnh GPLX"]
        NV3{"Duyệt hay<br/>Từ chối?"}
        NV4["Từ chối: Cập nhật TrangThaiGPLX = TU_CHOI"]
        NV5["Duyệt: Kiểm tra Hạng GPLX khai báo"]
        NV6["Hạng A1: Gán Nhom_A1<br/>Hạng A2: Gán Nhom_A2_PKL<br/>Cập nhật TrangThaiGPLX = DA_XAC_MINH"]
    end

    %% Flow
    Start --> A1 --> A2 --> S1
    S1 -- Không hợp lệ --> S8 --> A5 --> End_Fail([Kết thúc - Thất bại])
    S1 -- Hợp lệ --> S2 --> A3 --> S3 --> S4
    
    S4 --> NV1 --> NV2 --> NV3
    NV3 -- Từ chối --> NV4 --> A5
    NV3 -- Duyệt --> NV5 --> NV6 --> A4 --> End_OK([Kết thúc - Thành công])
```

---

## 5. LUỒNG HOÀN THÀNH BẢO DƯỠNG XE

```mermaid
graph TB
    Start(["Bắt đầu"])

    subgraph E2_BD [Nhân viên - E2]
        BD1["Truy cập danh sách xe<br/>đang bảo dưỡng"]
        BD2["Chọn xe và nhấn<br/>Hoàn thành bảo dưỡng"]
    end

    subgraph SYS_BD [Hệ thống SmartRental]
        S1["Đọc bản ghi bảo dưỡng từ D7"]
        S2{"Xe có trạng thái<br/>DANG_BAO_DUONG?"}
        S3["Báo lỗi: Trạng thái không hợp lệ"]
        S4["Cập nhật D7:<br/>DaHoanThanh = TRUE"]
        S5["Cập nhật D1:<br/>TrangThaiXe = SAN_SANG"]
        S6["Hiển thị nút xám (Disabled)<br/>ngăn bấm lại lần 2"]
    end

    %% Flow
    Start --> BD1 --> BD2 --> S1 --> S2
    S2 -- Không --> S3 --> End1([Kết thúc])
    S2 -- Có --> S4 --> S5 --> S6 --> End2([Kết thúc - Thành công])
```

---

## 6. LUỒNG ĐÁNH GIÁ CHUYẾN ĐI

```mermaid
graph TB
    Start(["Bắt đầu"])

    subgraph E1_Rating [Khách hàng - E1]
        R1["Mở trang chi tiết<br/>Đơn đặt xe đã hoàn tất"]
        R2{"Đơn đã được<br/>đánh giá chưa?"}
        R3["Nút Đánh giá bị mờ (Disabled)<br/>Không thể thao tác"]
        R4["Nhấn nút Đánh giá"]
        R5["Nhập số sao (1-5) & Nội dung"]
        R6["Nhận thông báo:<br/>Cảm ơn bạn đã đánh giá"]
    end

    subgraph SYS_Rating [Hệ thống SmartRental]
        S1["Gọi hàm isReviewed()"]
        S2["Lưu bản ghi DanhGia vào D8"]
        S3["Cập nhật UI vô hiệu hóa nút Đánh giá"]
    end

    %% Flow
    Start --> R1 --> S1 --> R2
    R2 -- Rồi (isReviewed = true) --> R3 --> End1([Kết thúc])
    R2 -- Chưa (isReviewed = false) --> R4 --> R5 --> S2 --> S3 --> R6 --> End2([Kết thúc - Thành công])
```

---

> **Ghi chú tổng hợp:**
> - Tất cả mã trạng thái (`TrangThaiBooking`, `TrangThaiXe`, `TrangThaiGPLX`, `NhomXeDuocThue`) được sử dụng **đồng nhất 100%** với Từ điển dữ liệu (D1–D6).
> - Sơ đồ 4 (GPLX Auto-Unlock) thể hiện việc Admin/Nhân viên can thiệp vào luồng cấp quyền.
> - Sơ đồ 3 Check-out đảm bảo hệ thống **chỉ giải phóng xe và đóng đơn sau khi nhận tín hiệu phản hồi từ Cổng thanh toán**, không bỏ qua bước xác nhận giao dịch.
