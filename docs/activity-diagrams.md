# TÀI LIỆU THIẾT KẾ: SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS)

## 1. LUỒNG ĐẶT XE & KHÓA PHƯƠNG TIỆN TẠM THỜI 15 PHÚT

```mermaid
graph TB
    Start([Bắt đầu])

    subgraph E1 [Khách hàng - E1]
        A1[Chọn xe máy & khoảng thời gian thuê]
        A2[Nhận thông báo: Từ chối]
        A3[Nhận thông báo: Xe không còn trống]
        A4[Thực hiện thanh toán cọc online]
        A5[Nhận xác nhận đặt xe thành công]
        A6[Nhận thông báo: Đặt xe thất bại / Hết 15 phút]
    end

    subgraph SYS [Hệ thống SmartRental]
        S1[Đọc hồ sơ khách hàng từ D3]
        S2{Có ảnh GPLX phù hợp\nvới nhóm xe đã chọn\nvà không trong Blacklist?}
        S3[Truy vấn lịch đặt D2 kiểm tra trùng lịch]
        S4{Xe bị trùng lịch?}
        S5[Tính tiền thuê tạm tính & tiền cọc theo D5]
        S6[Tạo đơn đặt xe tạm thời\nCHO_THANH_TOAN]
        S7[Khóa xe tạm: TrangThaiXe = KHOA_TAM_15M\nLưu vào D1]
        S8[Gọi API Cổng Thanh Toán]
        S9{Nhận kết quả\ntừ Cổng TT?}
        S10[Hủy đơn tạm\nTrangThaiXe = SAN_SANG\nGhi lại D1 & D2]
        S11[Lưu chính thức đơn đặt xe\nTrangThaiBooking = CHO_NHAN_XE\nGhi vào D2]
        S12[TrangThaiXe = DANG_THUE\nGhi vào D1]
        S13[Gửi thông báo điều phối\ncông việc cho Nhân viên]
    end

    subgraph E4 [Cổng Thanh Toán - E4]
        P1[Xử lý giao dịch cọc]
        P2{Giao dịch\nthành công?}
        P3[Bắn tín hiệu: THANH_CONG]
        P4[Bắn tín hiệu: THAT_BAI]
    end

    subgraph E5 [Cron Job - E5]
        C1[Bộ đếm ngược 15 phút]
        C2{Hết 15 phút\nmà chưa có\nphản hồi TT?}
        C3[Bắn tín hiệu: HET_THOI_GIAN]
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
    Start([Bắt đầu])

    subgraph E1 [Khách hàng - E1]
        A1[Gửi yêu cầu gia hạn qua App\ncùng khoảng thời gian muốn gia hạn]
        A2[Nhận thông báo: Từ chối\nGửi trước < 2 tiếng]
        A3[Nhận thông báo: Từ chối\nĐạt giới hạn gia hạn tối đa]
        A4[Nhận thông báo: Từ chối\nXe bị trùng lịch]
        A5[Xác nhận và thực hiện\nthanh toán phí gia hạn online]
        A6[Nhận thông báo: Gia hạn thất bại]
        A7[Nhận xác nhận gia hạn thành công\ncùng giờ trả mới]
    end

    subgraph SYS [Hệ thống SmartRental]
        S1[Đọc thông tin đơn đặt xe từ D2]
        S2{Yêu cầu gửi trước\ngiờ trả cũ >= 2 tiếng?}
        S3[Đọc số lần gia hạn hiện tại từ D2]
        S4{SoLanGiaHan < 3?}
        S5[Truy vấn lịch xe tương lai trong D2]
        S6{Xe bị trùng lịch\ntrong thời gian gia hạn?}
        S7[Đọc đơn giá theo ngày thực tế gia hạn từ D5\nbao gồm giá động Lễ/Tết/Cuối tuần]
        S8[Tính phí gia hạn\ndựa trên đơn giá động đọc từ D5]
        S9[Gọi API Cổng Thanh Toán\nyêu cầu thu phí gia hạn]
        S10{Nhận kết quả\ntừ Cổng TT?}
        S11[Cập nhật D2:\nThoiGianTra mới\nSoLanGiaHan += 1\nTongTienGiaHan += ChiPhiGiaHan]
        S12[Gửi xác nhận cho Khách hàng]
    end

    subgraph E4 [Cổng Thanh Toán - E4]
        P1[Xử lý giao dịch phí gia hạn]
        P2{Giao dịch\nthành công?}
        P3[Bắn tín hiệu: THANH_CONG]
        P4[Bắn tín hiệu: THAT_BAI]
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
    Start1([Bắt đầu Check-in])

    subgraph E2_CI [Nhân viên - E2]
        NV1[Chọn đơn Booking cần bàn giao\ntừ danh sách công việc]
        NV2[Kiểm tra ODO, mức xăng,\nphụ kiện, ngoại quan xe]
        NV3[Điền & gửi Biên bản Check-in\nvào hệ thống]
    end

    subgraph SYS_CI [Hệ thống SmartRental]
        S1[Đọc thông tin tài khoản\nNhân viên từ D6]
        S2{TrangThaiTaiKhoan\n= HOA_DONG?}
        S3[Từ chối thao tác:\nHiển thị lỗi tài khoản bị khóa]
        S4[Xác nhận dữ liệu\nBiên bản Check-in hợp lệ]
        S5[Cập nhật D2:\nTrangThaiBooking = DANG_THUE\nGhi nhận ODONhan, MucXangNhan\nSo luong phu kien da giao]
    end

    %% Flow
    Start1 --> NV1 --> S1 --> S2
    S2 -- Không / Bị Khóa --> S3 --> End_CI_Reject([Kết thúc - Từ chối])
    S2 -- Hoạt động --> NV2 --> NV3 --> S4 --> S5 --> End_CI_OK([Kết thúc - Thành công])
```

### 3.2. Phân đoạn Nhận lại xe & Quyết toán (Check-out)

```mermaid
graph TB
    Start2([Bắt đầu Check-out])

    subgraph E2_CO [Nhân viên - E2]
        NV1[Chọn đơn Booking cần nhận lại xe]
        NV2[Kiểm tra xe: ODO trả, mức xăng,\nphụ kiện, ngoại quan]
        NV3{Phát hiện hư hỏng mới\nhoặc mất phụ kiện?}
        NV4[Thương lượng với khách\nNhập PhiDenBuHuHai & PhiMatPhuKien]
        NV5[Phí đền bù = 0đ]
    end

    subgraph SYS_CO [Hệ thống SmartRental]
        S1[Đọc thông tin tài khoản\nNhân viên từ D6]
        S2{TrangThaiTaiKhoan\n= HOA_DONG?}
        S3[Từ chối thao tác:\nHiển thị lỗi tài khoản bị khóa]
        S4[Đọc thông tin Booking từ D2]
        S5{ODO trả >=\nODO nhận?}
        S6[Báo lỗi: ODO không hợp lệ\nYêu cầu Nhân viên nhập lại]
        S7[Đọc cấu hình phí phạt từ D5]
        S8{Trễ hạn trả xe?}
        S9[Phí phạt trễ hạn = 0đ\ntrong ân hạn 2 tiếng]
        S10[Phạt theo giờ:\n30K/h xe số-ga; 50K/h PKL\nTối đa = 1/2 DonGiaApDung]
        S11[Phạt = 1/2 DonGiaApDung]
        S12[Phạt = 1 DonGiaApDung\ntính thêm 1 ngày thuê mới]
        S13[Tính Tổng quyết toán:\nTongQuyetToan =\nTienThueGoc + TienPhatTreHan\n+ PhiDenBuHuHai + PhiMatPhuKien\n+ TongTienGiaHan - TienCoc]
        S14{TongQuyetToan > 0\n(Khách còn nợ)?}
        S15{TongQuyetToan < 0\n(Hoàn tiền cọc dư)?}
        S16[TongQuyetToan = 0:\nQuyết toán cân bằng]
        S17[Gọi API E4:\nThu thêm TongQuyetToan từ khách]
        S18[Gọi API E4:\nHoàn tiền |TongQuyetToan| cho khách]
        S19{Nhận kết quả\ntừ Cổng TT?}
        S20[Ghi nhận lỗi giao dịch\nTrangThaiHoanTien = CHO_XU_LY\nChuyển Admin xử lý thủ công]
        S21[Cập nhật D2:\nTrangThaiBooking = HOAN_TAT]
        S22[Cập nhật D1:\nTrangThaiXe = SAN_SANG\nODOHienTai = ODOTra]
        S23[Lưu bản ghi vào D4:\nLich_Su_Thue]
        S24[Xuất hóa đơn\ngửi cho Khách hàng]
    end

    subgraph E4_CO [Cổng Thanh Toán - E4]
        P1[Xử lý giao dịch\nthu thêm hoặc hoàn tiền]
        P2{Giao dịch\nthành công?}
        P3[Bắn tín hiệu: THANH_CONG]
        P4[Bắn tín hiệu: THAT_BAI]
    end

    subgraph E1_CO [Khách hàng - E1]
        KH1[Nhận hóa đơn quyết toán]
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
    S19 -- Thất bại --> S20 --> S21

    S21 --> S22 --> S23 --> S24 --> KH1 --> End_CO_OK([Kết thúc - Thành công])
```

---

## 4. LUỒNG TỰ ĐỘNG MỞ KHÓA QUYỀN THUÊ XE (GPLX AUTO-UNLOCK)

Mô tả luồng hệ thống tự động phân quyền nhóm xe thuê ngay khi Khách hàng tải ảnh GPLX và khai báo hạng bằng lái — không cần Admin can thiệp. Đây là luồng nghiệp vụ hoàn toàn tự động.

```mermaid
graph TB
    Start([Bắt đầu])

    subgraph E1_GPLX [Khách hàng - E1]
        A1[Vào mục Hồ sơ cá nhân\nchọn Tải ảnh GPLX]
        A2[Chọn tệp ảnh GPLX hợp lệ]
        A3[Khai báo Hạng bằng lái:\nA1 / A2]
        A4[Nhận thông báo:\nĐã mở khóa quyền thuê xe\ntương ứng thành công]
        A5[Nhận thông báo:\nTải ảnh thất bại\nVui lòng thử lại]
    end

    subgraph SYS_GPLX [Hệ thống SmartRental]
        S1{Tệp ảnh hợp lệ?\nĐúng định dạng & kích thước}
        S2[Lưu ảnh GPLX vào kho lưu trữ]
        S3[Gán TrangThaiGPLX = DA_UPLOAD\nvào hồ sơ D3]
        S4{HangGPLX\nkhai báo là gì?}
        S5[Gán NhomXeDuocThue = NHOM_A1\nXe <= 175cc được phép thuê\nGhi vào D3]
        S6[Gán NhomXeDuocThue = NHOM_A2_PKL\nXe > 175cc / PKL được phép thuê\nGhi vào D3]
        S7[Gửi thông báo mở khóa\nthành công cho Khách hàng]
        S8[Trả về lỗi tải ảnh]
    end

    %% Flow
    Start --> A1 --> A2 --> S1
    S1 -- Không hợp lệ --> S8 --> A5 --> End_Fail([Kết thúc - Thất bại])
    S1 -- Hợp lệ --> S2 --> A3 --> S3 --> S4
    S4 -- Hạng A1 --> S5 --> S7 --> A4 --> End_OK([Kết thúc - Thành công])
    S4 -- Hạng A2 --> S6 --> S7
```

---

> **Ghi chú tổng hợp:**
> - Tất cả mã trạng thái (`TrangThaiBooking`, `TrangThaiXe`, `TrangThaiGPLX`, `NhomXeDuocThue`) được sử dụng **đồng nhất 100%** với Từ điển dữ liệu (D1–D6).
> - Sơ đồ 4 (GPLX Auto-Unlock) thể hiện việc **Admin không can thiệp vào luồng cấp quyền** theo đúng SRS Version 2.0.
> - Sơ đồ 3 Check-out đảm bảo hệ thống **chỉ giải phóng xe và đóng đơn sau khi nhận tín hiệu phản hồi từ Cổng thanh toán**, không bỏ qua bước xác nhận giao dịch.
