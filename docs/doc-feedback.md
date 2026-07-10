# 🚨 Báo cáo Phản biện Kiến trúc & Đặc tả (Doc Feedback)

Đúng theo yêu cầu của hệ thống (Vai trò Kiểm định Kiến trúc - System Auditor), tôi đã tiến hành rà soát các tài liệu `srs.md`, `process-specifications.md` và `erd-diagrams.md`. 

Phát hiện nhiều điểm bất thường và sai sót logic nghiêm trọng cần được xử lý trước khi tôi có thể viết code API hoàn thiện. Dưới đây là chi tiết và phương án đề xuất:

## 1. Lỗ hổng Race Condition và Logic Quản lý Trạng thái Xe (Nghiêm trọng)

**Vấn đề:** 
Trong *Process 2.0 (Đặt xe trực tuyến)*, khi khách hàng vừa bắt đầu đặt xe, hệ thống gán ngay `TrangThaiXe = 'Dang_Thue'` (ở `D1: Xe_May`) để giữ chỗ 15 phút. 
- **Sai logic nghiệp vụ:** Nếu khách đặt xe cho **tháng sau**, việc chuyển trạng thái xe thành `'Dang_Thue'` ngay lúc này sẽ khiến chiếc xe đó không thể được thuê vào **ngày mai** (bị khóa hoàn toàn). `TrangThaiXe` chỉ nên chuyển sang `'Dang_Thue'` khi khách đã thực sự đến cửa hàng lấy xe (Check-in).
- **Nguy cơ Race Condition (Đụng độ):** Luồng kiểm tra trùng lịch hiện tại là: `Kiểm tra lịch -> Tạo đơn -> Khóa xe`. Nếu có 2 request đặt cùng 1 xe, cùng 1 khoảng thời gian gửi đến máy chủ cách nhau vài mili-giây, cả 2 sẽ vượt qua bước "Kiểm tra" trước khi database kịp ghi dữ liệu, dẫn đến overbooking.

**Đề xuất chuẩn hóa:**
- Loại bỏ hoàn toàn việc sử dụng `TrangThaiXe = 'Dang_Thue'` để khóa xe giữ chỗ tạm thời. Tính khả dụng của xe chỉ được tính toán dựa trên việc **query khoảng thời gian trống (gap)** từ bảng `Hop_Dong_Booking`.
- **Chống Race Condition:** Sử dụng tính năng Lock dòng của Database (Serializable Transaction Level) hoặc cơ chế khóa `SELECT ... FOR UPDATE` khi kiểm tra trùng lịch.

## 2. Thiếu hụt Trường Dữ liệu trong ERD

**Vấn đề:** 
Đọc bảng `Hop_Dong_Booking` trong ERD, hệ thống có lưu số tiền (`TienCoc`, `TongThanhToan`) và phương thức (`PhuongThucCoc`), nhưng hoàn toàn bỏ quên các vết kiểm toán (Audit Trail) cho giao dịch tài chính.
- Bảng `Hop_Dong_Booking` thiếu cột lưu **Mã Giao Dịch (Transaction ID)** từ Cổng thanh toán trả về. Không có mã này, kế toán không thể đối soát dòng tiền.
- Thiếu cột **Trạng thái thanh toán cọc** (Ví dụ: `TrangThaiThanhToan: PENDING, SUCCESS, FAILED, REFUNDED`). Mặc dù có `TrangThaiBooking`, nhưng thanh toán và trạng thái hành trình (Booking) nên tách bạch.
- Thiếu trạng thái `Khong_Den_Nhan_Xe` (No Show) trong `TrangThaiBooking` (SRS mục 4.3 có đề cập xử lý No-show nhưng ERD không có status này).

**Đề xuất chuẩn hóa:**
- Cập nhật thêm các cột vào bảng `Hop_Dong_Booking` (trong Database):
  - `MaGiaoDichCoc` (VARCHAR)
  - `TrangThaiThanhToan` (ENUM)
  - Thêm `No_Show` vào enum `TrangThaiBooking`.

## 3. Kẽ hở Logic Nghiệp vụ: Xác thực GPLX Ảo (Edge Case)

**Vấn đề:** 
Trong *Process 1.0*, hệ thống tự động gán quyền thuê xe phân khối lớn (Nhom_A1, Nhom_A2) ngay khi khách upload ảnh mà không cần duyệt.
Nhưng *SRS mục 3.2 (Bàn giao xe)* yêu cầu nhân viên đối chiếu GPLX thật. Vậy điều gì xảy ra nếu nhân viên phát hiện ảnh GPLX khách tải lên lúc đặt xe là giả/không hợp lệ?
- Đặc tả không quy định cách xử lý: Từ chối giao xe? Có hoàn lại 100% tiền cọc hay phạt 100% cọc?

**Đề xuất chuẩn hóa:**
- Bổ sung quy định vào SRS: "Nếu phát hiện GPLX không hợp lệ lúc nhận xe, cửa hàng có quyền từ chối giao xe và áp dụng chính sách phạt 100% tiền cọc (tương đương No-show)".

---
> ⚠️ **HÀNH ĐỘNG BẮT BUỘC (SYSTEM ACTION):**
> Tôi đã dừng lại việc lên kế hoạch triển khai API theo quy tắc hệ thống. Không viết code "chữa cháy". Vui lòng xem xét các đề xuất trên và xác nhận tôi có được phép sửa đổi/thêm các cột dữ liệu này vào CSDL và áp dụng các cơ chế chống Race condition trong Backend hay không? Mọi tiếp tục chỉ diễn ra khi bạn phê duyệt!
