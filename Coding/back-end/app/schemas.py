import re
from typing import Optional
from pydantic import field_validator
from sqlmodel import SQLModel

class UserRegister(SQLModel):
    HoTen: str
    Email: Optional[str] = None
    SoDienThoai: str
    MatKhau: str
    CCCD: Optional[str] = None
    AnhGPLXMatTruoc: Optional[str] = None
    AnhGPLXMatSau: Optional[str] = None
    HangGPLXKhaiBao: Optional[str] = None  # e.g. "A1", "A2", None

    @field_validator("HoTen")
    @classmethod
    def validate_hoten(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Họ tên phải từ 2 đến 100 ký tự")
        return v

    @field_validator("Email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        v = v.strip()
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, v):
            raise ValueError("Email không đúng định dạng")
        return v

    @field_validator("SoDienThoai")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        phone_regex = r"^0\d{9}$"
        if not re.match(phone_regex, v):
            raise ValueError("Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0")
        return v

    @field_validator("MatKhau")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Mật khẩu phải chứa ít nhất 6 ký tự")
        if len(v) > 72:
            raise ValueError("Mật khẩu không được vượt quá 72 ký tự")
        return v

    @field_validator("CCCD")
    @classmethod
    def validate_cccd(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        v = v.strip()
        cccd_regex = r"^\d{12}$"
        if not re.match(cccd_regex, v):
            raise ValueError("CCCD phải gồm đúng 12 chữ số")
        return v


class Token(SQLModel):
    access_token: str
    token_type: str


class BookingCreate(SQLModel):
    MaXe: str
    ThoiGianNhan: str
    ThoiGianTra: str
    PhuongThucCoc: str

    @field_validator("PhuongThucCoc")
    @classmethod
    def validate_phuongthuccoc(cls, v: str) -> str:
        if v not in ["Chuyen_Khoan", "Tien_Mat"]:
            raise ValueError("Phương thức cọc phải là 'Chuyen_Khoan' hoặc 'Tien_Mat'")
        return v


class CheckInSchema(SQLModel):
    ODONhan: int
    MucXangNhan: str
    AnhNgoaiQuanNhan: Optional[str] = None
    SoMuBaoHiemGiao: int
    CoAoMuaGiao: bool
    KhachGianLanGPLX: bool = False

    @field_validator("ODONhan")
    @classmethod
    def validate_odonhan(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Chỉ số ODO nhận không được âm")
        return v

    @field_validator("SoMuBaoHiemGiao")
    @classmethod
    def validate_somubao_giao(cls, v: int) -> int:
        if v < 0 or v > 2:
            raise ValueError("Số mũ bảo hiểm giao phải từ 0 đến 2")
        return v

    @field_validator("MucXangNhan")
    @classmethod
    def validate_mucxang_nhan(cls, v: str) -> str:
        if v not in ["Day", "3_Phan_4", "1_Phan_2", "1_Phan_4", "Gan_Het"]:
            raise ValueError("Mức xăng nhận phải là một trong các giá trị: Day, 3_Phan_4, 1_Phan_2, 1_Phan_4, Gan_Het")
        return v


class CheckOutSchema(SQLModel):
    ODOTra: int
    MucXangTra: str
    AnhNgoaiQuanTra: Optional[str] = None
    SoMuBaoHiemTra: int
    CoAoMuaTra: bool
    PhiDenBuHuHai: float = 0.0
    LyDoPhat: Optional[str] = None

    @field_validator("ODOTra")
    @classmethod
    def validate_odotra(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Chỉ số ODO trả không được âm")
        return v

    @field_validator("SoMuBaoHiemTra")
    @classmethod
    def validate_somubao_tra(cls, v: int) -> int:
        if v < 0 or v > 2:
            raise ValueError("Số mũ bảo hiểm trả phải từ 0 đến 2")
        return v

    @field_validator("PhiDenBuHuHai")
    @classmethod
    def validate_phi_den_bu(cls, v: float) -> float:
        if v < 0.0:
            raise ValueError("Phí đền bù hư hại không được âm")
        return v

    @field_validator("MucXangTra")
    @classmethod
    def validate_mucxang_tra(cls, v: str) -> str:
        if v not in ["Day", "3_Phan_4", "1_Phan_2", "1_Phan_4", "Gan_Het"]:
            raise ValueError("Mức xăng trả phải là một trong các giá trị: Day, 3_Phan_4, 1_Phan_2, 1_Phan_4, Gan_Het")
        return v


class StaffCreate(SQLModel):
    HoTen: str
    Email: str
    SoDienThoai: str
    VaiTro: str
    MatKhau: str

    @field_validator("Email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, v):
            raise ValueError("Email không đúng định dạng")
        return v

    @field_validator("SoDienThoai")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        phone_regex = r"^0\d{9}$"
        if not re.match(phone_regex, v):
            raise ValueError("Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0")
        return v

    @field_validator("VaiTro")
    @classmethod
    def validate_vaitro(cls, v: str) -> str:
        if v not in ["Nhan_Vien", "Admin"]:
            raise ValueError("Vai trò phải là 'Nhan_Vien' hoặc 'Admin'")
        return v


class StaffUpdate(SQLModel):
    HoTen: Optional[str] = None
    SoDienThoai: Optional[str] = None
    VaiTro: Optional[str] = None
    TrangThaiTaiKhoan: Optional[str] = None

    @field_validator("SoDienThoai")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        phone_regex = r"^0\d{9}$"
        if not re.match(phone_regex, v):
            raise ValueError("Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0")
        return v

    @field_validator("VaiTro")
    @classmethod
    def validate_vaitro(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ["Nhan_Vien", "Admin"]:
            raise ValueError("Vai trò phải là 'Nhan_Vien' hoặc 'Admin'")
        return v


class ConfigUpdate(SQLModel):
    SoLanGiaHanToiDa: Optional[int] = None
    DonGiaPhatXeThuong_Gio: Optional[float] = None
    DonGiaPhatXePKL_Gio: Optional[float] = None
    PhatMatMuBaoHiem: Optional[float] = None
    PhatMatAoMua: Optional[float] = None
    PhanTramTangGiaLe: Optional[float] = None

    @field_validator("SoLanGiaHanToiDa")
    @classmethod
    def validate_giahan(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Số lần gia hạn tối đa không được âm")
        return v

    @field_validator("DonGiaPhatXeThuong_Gio", "DonGiaPhatXePKL_Gio", "PhatMatMuBaoHiem", "PhatMatAoMua", "PhanTramTangGiaLe")
    @classmethod
    def validate_non_negative_floats(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0.0:
            raise ValueError("Giá trị cấu hình không được âm")
        return v


class UserUpdate(SQLModel):
    HoTen: Optional[str] = None
    SoDienThoai: Optional[str] = None
    Email: Optional[str] = None
    CCCD: Optional[str] = None
    DiaChi: Optional[str] = None

    @field_validator("Email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, v):
            raise ValueError("Email không đúng định dạng")
        return v

    @field_validator("SoDienThoai")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        phone_regex = r"^0\d{9}$"
        if not re.match(phone_regex, v):
            raise ValueError("Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0")
        return v

    @field_validator("CCCD")
    @classmethod
    def validate_cccd(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        cccd_regex = r"^\d{12}$"
        if not re.match(cccd_regex, v):
            raise ValueError("CCCD phải gồm đúng 12 chữ số")
        return v


class UserGPLXUpdate(SQLModel):
    HangGPLXKhaiBao: str
    SoGPLX: str
    AnhGPLXMatTruoc: str
    AnhGPLXMatSau: str

    @field_validator("SoGPLX")
    @classmethod
    def validate_sogplx(cls, v: str) -> str:
        v = v.strip()
        gplx_regex = r"^\d{12}$"
        if not re.match(gplx_regex, v):
            raise ValueError("Số GPLX phải gồm đúng 12 chữ số")
        return v


class MotorbikeUpdate(SQLModel):
    BienSo: Optional[str] = None
    SoKhung: Optional[str] = None
    SoMay: Optional[str] = None
    HangXe: Optional[str] = None
    TenXe: Optional[str] = None
    LoaiXe: Optional[str] = None
    PhanKhoi: Optional[int] = None
    NhomXe: Optional[str] = None
    DoiXe: Optional[int] = None
    HinhAnhXe: Optional[str] = None
    TrangThaiXe: Optional[str] = None
    MucTieuThuXang: Optional[float] = None
    SoMuBaoHiem: Optional[int] = None
    CoAoMua: Optional[bool] = None
    DonGiaNgay: Optional[float] = None
    ODOHienTai: Optional[int] = None


class MotorbikeCreate(SQLModel):
    MaXe: str
    BienSo: str
    SoKhung: str
    SoMay: str
    HangXe: str
    TenXe: str
    LoaiXe: str
    PhanKhoi: int
    NhomXe: str
    DoiXe: int
    HinhAnhXe: Optional[str] = None
    TrangThaiXe: str = "San_Sang"
    MucTieuThuXang: Optional[float] = None
    SoMuBaoHiem: int = 2
    CoAoMua: bool = True
    DonGiaNgay: float
    ODOHienTai: int = 0


class DanhGiaCreate(SQLModel):
    MaBooking: str
    DiemDanhGia: int
    NoiDung: Optional[str] = None

    @field_validator("DiemDanhGia")
    @classmethod
    def validate_diem(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Điểm đánh giá phải từ 1 đến 5 sao")
        return v


class BaoDuongCreate(SQLModel):
    MaXe: str
    NgayBaoDuong: str
    ChiPhi: float
    ChiTietBaoDuong: str

    @field_validator("ChiPhi")
    @classmethod
    def validate_chiphi(cls, v: float) -> float:
        if v < 0.0:
            raise ValueError("Chi phí bảo dưỡng không được âm")
        return v
