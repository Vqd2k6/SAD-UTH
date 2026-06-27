# 📘 TÀI LIỆU QUẢN LÝ DỰ ÁN & QUY ƯỚC PHÁT TRIỂN
> **Môn học:** Phân tích Thiết kế Hệ thống (PTTKHT)
> **Trường:** Đại học Giao thông Vận tải TP.HCM (UTH)
> **Mục tiêu:** Định nghĩa bài toán, phân tích nghiệp vụ, thiết kế sơ đồ, xây dựng dự án và định hướng mở rộng (scalability).

---

## 📌 THÔNG TIN CHUNG DỰ ÁN
*   **Tên dự án:** Hệ thống Quản lý và Cho thuê xe Thông minh (Smart Car/Vehicle Rental System)
*   **Giảng viên hướng dẫn:** *[Nhập tên GVHD]*
*   **Thành viên thực hiện:**
    1.  *[Tên thành viên 1] - [MSSV]*
    2.  *[Tên thành viên 2] - [MSSV]*
*   **Công nghệ dự kiến:** *[Ví dụ: Next.js, Node.js, PostgreSQL/MySQL, Docker]*

---

## ⚙️ QUY ƯỚC & RÀNG BUỘC PHÁT TRIỂN (CONVENTIONS)

Để đảm bảo code có thể bảo trì, mở rộng và giúp Trợ lý AI (Antigravity) hoạt động hiệu quả mà không bị mất ngữ cảnh giữa các phiên làm việc, chúng ta tuân thủ các quy ước sau:

### 1. Quy ước Đặt tên (Naming Conventions)
*   **Thư mục & File code:** Dạng `kebab-case` (ví dụ: `user-profile.controller.js`, `order-detail.tsx`).
*   **Class & Interface:** Dạng `PascalCase` (ví dụ: `UserService`, `UserInterface`).
*   **Biến & Hàm:** Dạng `camelCase` (ví dụ: `getUserById`, `totalPrice`).
*   **Hằng số:** Dạng `UPPER_SNAKE_CASE` (ví dụ: `MAX_RETRY_ATTEMPTS`, `API_URL`).
*   **Bảng CSDL:** Dạng `snake_case` số nhiều (ví dụ: `users`, `order_details`).
*   **Khóa ngoại CSDL:** Dạng `singular_table_id` (ví dụ: `user_id`, `order_id`).

### 2. Nguyên tắc Kiến trúc & Thiết kế
*   **Clean Architecture / MVC:** Phân chia rõ ràng giữa Business Logic (Service), Controller, và Data Layer (Repository/Model).
*   **Nguyên lý SOLID:** Ưu tiên Single Responsibility (Mỗi hàm/class chỉ làm một việc duy nhất).
*   **Không lặp lại code (DRY):** Tránh viết trùng lặp logic, tối ưu hóa các hàm tiện ích dùng chung (helper/util).
*   **Database:** Phải thiết kế chuẩn hóa tối thiểu là dạng chuẩn 3 (3NF) trước khi coding, có định nghĩa rõ ràng về kiểu dữ liệu và chỉ mục (Index).

### 3. Quy ước Git & Commit
*   **Tên Branch:**
    *   `main` / `master`: Nhánh production ổn định.
    *   `develop`: Nhánh tích hợp tính năng.
    *   `feature/<tên-chức-năng>`: Nhánh phát triển tính năng mới.
    *   `bugfix/<lỗi-cần-sửa>`: Nhánh sửa lỗi.
*   **Định dạng Commit (Conventional Commits):**
    *   `feat: <mô tả>`: Thêm tính năng mới.
    *   `fix: <mô tả>`: Sửa lỗi.
    *   `docs: <mô tả>`: Cập nhật tài liệu/markdown.
    *   `refactor: <mô tả>`: Tối ưu cấu trúc code (không đổi logic).
    *   `style: <mô tả>`: Định dạng code (khoảng trắng, dấu phẩy...).

### 4. Quy ước phối hợp với Trợ lý AI (Antigravity Rules)
*   **Bảo toàn comment:** Giữ nguyên các comment giải thích nghiệp vụ có sẵn trong code trừ khi cấu trúc thay đổi hoàn toàn.
*   **Cập nhật Tiến trình:** Sau mỗi phiên làm việc lớn, AI cần cập nhật trạng thái tại phần **[Nhật ký Phiên Làm Việc](#-nhật-ký-phiên-làm-việc)** ở cuối file này để phiên sau có thể tiếp tục ngay lập tức.
*   **Tài liệu đi kèm:** Khi vẽ sơ đồ hoặc thiết kế DB, hãy cập nhật đường dẫn đến file sơ đồ tương ứng tại mục **[Sơ đồ Hệ thống](#-sơ-đồ-hệ-thống)**.

---

## 🗺️ LỘ TRÌNH PHÁT TRIỂN & TIẾN ĐỘ (ROADMAP)

Dưới đây là các giai đoạn phát triển chính của dự án PTTKHT. Đánh dấu `[x]` khi hoàn thành và `[/]` khi đang thực hiện.

- [x] **Giai đoạn 1: Định nghĩa Bài toán & Yêu cầu (Define Problem & SRS)** - [Tài liệu SRS](file:///Users/vqd2k6/Desktop/PTTKHT-UTH/Project-KTHP/docs/srs.md)
  - [x] Khảo sát hiện trạng và định nghĩa bài toán thực tế.
  - [x] Xác định phạm vi dự án (Project Scope).
  - [x] Phân tích yêu cầu chức năng (Functional Requirements).
  - [x] Xác định yêu cầu phi chức năng (Non-Functional Requirements: bảo mật, hiệu năng, khả năng mở rộng).
- [ ] **Giai đoạn 2: Phân tích Nghiệp vụ & Sơ đồ hóa (Business Analysis & Modeling)**
  - [ ] Vẽ sơ đồ Use Case (Tổng quát và Chi tiết).
  - [ ] Xây dựng Sơ đồ Hoạt động (Activity Diagram) cho các nghiệp vụ chính.
  - [ ] Thiết kế Sơ đồ Lớp (Class Diagram) thực thể nghiệp vụ.
  - [ ] Thiết kế Sơ đồ Tuần tự (Sequence Diagram) cho các luồng xử lý phức tạp.
- [ ] **Giai đoạn 3: Thiết kế Hệ thống & Cơ sở Dữ liệu (System Design)**
  - [ ] Thiết kế Sơ đồ Cơ sở Dữ liệu (ERD - Entity Relationship Diagram).
  - [ ] Thiết kế kiến trúc phần mềm (Software Architecture).
  - [ ] Thiết kế Giao diện người dùng (UI/UX Mockups).
- [ ] **Giai đoạn 4: Xây dựng Dự án (Implementation/Coding)**
  - [ ] Khởi tạo Boilerplate, cấu hình Git và môi trường phát triển.
  - [ ] Thiết lập Cơ sở dữ liệu và Migration.
  - [ ] Phát triển Backend API & Nghiệp vụ cốt lõi.
  - [ ] Phát triển Giao diện Frontend và tích hợp API.
  - [ ] Viết Unit Test và Integration Test cơ bản.
- [ ] **Giai đoạn 5: Tối ưu hóa, Kiểm thử & Mở rộng (Testing, Deployment & Scaling)**
  - [ ] Kiểm thử toàn diện hệ thống (System & UAT Testing).
  - [ ] Tối ưu hóa truy vấn CSDL, lưu bộ nhớ đệm (Caching).
  - [ ] Dockerize ứng dụng và cấu hình CI/CD.
  - [ ] Đánh giá khả năng mở rộng (Scale-out, Load Balancing, Microservices hóa nếu cần).

---

## 📊 SƠ ĐỒ HỆ THỐNG (SYSTEM DIAGRAMS)
*Danh sách các sơ đồ thiết kế hệ thống (Lưu trữ trong thư mục `/docs/diagrams/` hoặc link bên ngoài):*

| Tên sơ đồ | Loại sơ đồ | Đường dẫn / Liên kết | Mô tả |
| :--- | :--- | :--- | :--- |
| **Use Case Diagram** | Use Case | [Link/Đường dẫn] | Tổng quan các tác nhân và chức năng hệ thống |
| **Activity Diagram** | Activity | [Link/Đường dẫn] | Luồng hoạt động của các nghiệp vụ chính |
| **Class Diagram** | Class | [Link/Đường dẫn] | Cấu trúc lớp đối tượng và quan hệ dữ liệu |
| **Sequence Diagram** | Sequence | [Link/Đường dẫn] | Luồng tương tác chi tiết giữa các đối tượng |
| **ERD (Database)** | Entity-Relationship | [Link/Đường dẫn] | Thiết kế các bảng và quan hệ cơ sở dữ liệu |

---

## 📝 NHẬT KÝ PHIÊN LÀM VIỆC (SESSION LOGS)

*Mục này ghi lại lịch sử thay đổi qua từng phiên để AI và User dễ dàng bàn giao công việc:*

| Ngày / Phiên | Người thực hiện | Nội dung thực hiện | Trạng thái tiếp theo | Ghi chú / Điểm lưu ý |
| :--- | :--- | :--- | :--- | :--- |
| **2026-06-17** | AI & User | Khởi tạo cấu trúc dự án và thiết lập file quy ước `README.md`. | Xác định chủ đề dự án là Cho thuê xe. | Đã thống nhất đề tài và tạo file SRS ban đầu. |
| **2026-06-17 (2)** | AI & User | Chi tiết hóa SRS: Giới hạn nghiệp vụ thuê xe máy và thêm quy tắc cụ thể (gia hạn, trả muộn, hủy đơn, đền bù hư hại). Phân tách rõ ràng vai trò Staff/Admin, bỏ phạt xăng. | Bắt đầu Giai đoạn 2: Vẽ sơ đồ Use Case và Activity. | Đã hoàn tất xuất sắc Giai đoạn 1. Sẵn sàng cho khâu vẽ sơ đồ nghiệp vụ. |
| **2026-06-21** | AI & User | Cập nhật tài liệu SRS: bổ sung tùy chọn GPLX khi đăng ký, phân loại nhóm xe, cấu hình ưu đãi thuê dài ngày & định giá động, nâng giờ ân hạn lên 2 tiếng và đổi thang phạt muộn, tính năng yêu cầu trả xe sớm, hệ thống cảnh báo tự động, đa ngôn ngữ VIE/ENG, và đánh giá độ ổn định của xe. | Hoàn tất cập nhật SRS, tiếp tục vẽ sơ đồ nghiệp vụ. | Tài liệu SRS đã được bổ sung đầy đủ các thay đổi nghiệp vụ mới. |
| **2026-06-25** | AI & User | Cập nhật sơ đồ Ngữ cảnh (Context Diagram) trong `dfd-diagrams.md` theo bảng quy đổi luồng gom nhóm mới để tối ưu hóa tính mạch lạc và cân bằng DFD, trong khi giữ nguyên mã luồng (F) ở sơ đồ Level 0. | Tiến hành thiết kế các sơ đồ UML khác (Use Case, Activity, Class, Sequence) trong Giai đoạn 2. | Đã hoàn tất đồng bộ sơ đồ Context mới với tài liệu thiết kế. |

---
*Mẹo dành cho AI:* Hãy đọc kỹ file này ở đầu mỗi phiên làm việc để hiểu bối cảnh và các quy ước mà cả hai đã thống nhất!
