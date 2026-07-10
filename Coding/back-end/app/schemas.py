from typing import Optional

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


class Token(SQLModel):
    access_token: str
    token_type: str


class BookingCreate(SQLModel):
    MaXe: str
    ThoiGianNhan: str
    ThoiGianTra: str
    PhuongThucCoc: str


class CheckInSchema(SQLModel):
    ODONhan: int
    MucXangNhan: str
    AnhNgoaiQuanNhan: Optional[str] = None
    SoMuBaoHiemGiao: int
    CoAoMuaGiao: bool
    KhachGianLanGPLX: bool = False


class CheckOutSchema(SQLModel):
    ODOTra: int
    MucXangTra: str
    AnhNgoaiQuanTra: Optional[str] = None
    SoMuBaoHiemTra: int
    CoAoMuaTra: bool
    PhiDenBuHuHai: float = 0.0
    LyDoPhat: Optional[str] = None

class StaffCreate(SQLModel):
    HoTen: str
    Email: str
    SoDienThoai: str
    VaiTro: str
    MatKhau: str

class StaffUpdate(SQLModel):
    HoTen: Optional[str] = None
    SoDienThoai: Optional[str] = None
    VaiTro: Optional[str] = None
    TrangThaiTaiKhoan: Optional[str] = None

class ConfigUpdate(SQLModel):
    SoLanGiaHanToiDa: Optional[int] = None
    DonGiaPhatXeThuong_Gio: Optional[float] = None
    DonGiaPhatXePKL_Gio: Optional[float] = None
    PhatMatMuBaoHiem: Optional[float] = None
    PhatMatAoMua: Optional[float] = None
    PhanTramTangGiaLe: Optional[float] = None

class UserUpdate(SQLModel):
    HoTen: Optional[str] = None
    SoDienThoai: Optional[str] = None
    Email: Optional[str] = None
    CCCD: Optional[str] = None
    DiaChi: Optional[str] = None

class UserGPLXUpdate(SQLModel):
    HangGPLXKhaiBao: str
    SoGPLX: str
    AnhGPLXMatTruoc: str
    AnhGPLXMatSau: str

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

class DanhGiaCreate(SQLModel):
    MaBooking: str
    DiemDanhGia: int
    NoiDung: Optional[str] = None

class BaoDuongCreate(SQLModel):
    MaXe: str
    NgayBaoDuong: str
    ChiPhi: float
    ChiTietBaoDuong: str
