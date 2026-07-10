import enum
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


# --- ENUMS ---
class LoaiXeEnum(str, enum.Enum):
    Xe_So = "Xe_So"
    Xe_Ga = "Xe_Ga"
    Xe_Con_Tay = "Xe_Con_Tay"
    Xe_PKL = "Xe_PKL"
    Xe_Dien = "Xe_Dien"


class NhomXeEnum(str, enum.Enum):
    Nhom_50cc_Dien = "Nhom_50cc_Dien"
    Nhom_A1 = "Nhom_A1"
    Nhom_A2_PKL = "Nhom_A2_PKL"


class TrangThaiXeEnum(str, enum.Enum):
    San_Sang = "San_Sang"
    Dang_Thue = "Dang_Thue"
    KHOA_TAM_15M = "KHOA_TAM_15M"
    Dang_Bao_Duong = "Dang_Bao_Duong"
    Dang_Sua_Chua = "Dang_Sua_Chua"


class LuaChonGPLXEnum(str, enum.Enum):
    Co_GPLX = "Co_GPLX"
    Khong_GPLX = "Khong_GPLX"


class HangGPLXEnum(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    Khong = "Khong"


class TrangThaiGPLXEnum(str, enum.Enum):
    Khong_Dang_Ky = "Khong_Dang_Ky"
    Da_Upload = "Da_Upload"
    Da_Xac_Thuc = "Da_Xac_Thuc"
    Tu_Choi = "Tu_Choi"


class VaiTroEnum(str, enum.Enum):
    Nhan_Vien = "Nhan_Vien"
    Admin = "Admin"


class TrangThaiTaiKhoanEnum(str, enum.Enum):
    Hoat_Dong = "Hoat_Dong"
    Bi_Khoa = "Bi_Khoa"


class TrangThaiBookingEnum(str, enum.Enum):
    Cho_Thanh_Toan_Coc = "Cho_Thanh_Toan_Coc"
    Cho_Nhan_Xe = "Cho_Nhan_Xe"
    Khong_Den_Nhan_Xe = "Khong_Den_Nhan_Xe"
    Dang_Thue = "Dang_Thue"
    Yeu_Cau_Tra_Som = "Yeu_Cau_Tra_Som"
    Qua_Han = "Qua_Han"
    Cho_Tra_Xe = "Cho_Tra_Xe"
    Dang_Quyet_Toan = "Dang_Quyet_Toan"
    Hoan_Tat = "Hoan_Tat"
    Da_Huy = "Da_Huy"


class TrangThaiThanhToanEnum(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PhuongThucCocEnum(str, enum.Enum):
    Chuyen_Khoan = "Chuyen_Khoan"
    Vi_Dien_Tu = "Vi_Dien_Tu"
    Tien_Mat = "Tien_Mat"


class MucXangEnum(str, enum.Enum):
    Day = "Day"
    Ba_Phan_Tu = "3_Phan_4"
    Mot_Phan_Hai = "1_Phan_2"
    Mot_Phan_Tu = "1_Phan_4"
    Gan_Het = "Gan_Het"


# --- MODELS ---
class XeMay(SQLModel, table=True):
    __tablename__ = "Xe_May"

    MaXe: str = Field(primary_key=True, max_length=10)
    BienSo: str = Field(unique=True, max_length=12)
    SoKhung: str = Field(unique=True, max_length=20)
    SoMay: str = Field(unique=True, max_length=20)
    HangXe: str = Field(max_length=30)
    TenXe: str = Field(max_length=50)
    LoaiXe: LoaiXeEnum
    PhanKhoi: int
    NhomXe: NhomXeEnum
    DoiXe: int
    HinhAnhXe: Optional[str] = None  # JSON string of URLs
    TrangThaiXe: TrangThaiXeEnum = Field(default=TrangThaiXeEnum.San_Sang)
    MucTieuThuXang: Optional[Decimal] = Field(
        default=None, max_digits=4, decimal_places=1
    )
    SoMuBaoHiem: int = Field(default=2)
    CoAoMua: bool = Field(default=True)
    DonGiaNgay: Decimal = Field(max_digits=12, decimal_places=0)
    ODOHienTai: int = Field(default=0)
    NgayTao: datetime = Field(default_factory=datetime.utcnow)
    NgayCapNhat: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    bookings: List["HopDongBooking"] = Relationship(back_populates="xe_may")
    lich_su_thue: List["LichSuThue"] = Relationship(back_populates="xe_may")


class KhachHangGPLX(SQLModel, table=True):
    __tablename__ = "Khach_Hang_GPLX"

    MaKhachHang: str = Field(primary_key=True, max_length=10)
    HoTen: str = Field(max_length=100)
    Email: Optional[str] = Field(default=None, unique=True, max_length=100)
    SoDienThoai: str = Field(unique=True, max_length=15)
    CCCD: Optional[str] = Field(default=None, unique=True, max_length=12)
    DiaChi: Optional[str] = Field(default=None, max_length=200)
    MatKhau: str = Field(max_length=255, exclude=True)
    LuaChonGPLX: LuaChonGPLXEnum
    HangGPLX: Optional[HangGPLXEnum] = None
    SoGPLX: Optional[str] = Field(default=None, unique=True, max_length=12)
    NgayCapGPLX: Optional[date] = None
    NgayHetHanGPLX: Optional[date] = None
    AnhGPLXMatTruoc: Optional[str] = None
    AnhGPLXMatSau: Optional[str] = None
    TrangThaiGPLX: TrangThaiGPLXEnum = Field(default=TrangThaiGPLXEnum.Khong_Dang_Ky)
    NhomXeDuocThue: NhomXeEnum = Field(default=NhomXeEnum.Nhom_50cc_Dien)
    TrangThaiBlacklist: bool = Field(default=False)
    LyDoBlacklist: Optional[str] = None
    NgayTao: datetime = Field(default_factory=datetime.utcnow)
    NgayCapNhat: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    bookings: List["HopDongBooking"] = Relationship(back_populates="khach_hang")
    lich_su_thue: List["LichSuThue"] = Relationship(back_populates="khach_hang")


class NhanVien(SQLModel, table=True):
    __tablename__ = "Nhan_Vien"

    MaNhanVien: str = Field(primary_key=True, max_length=10)
    HoTen: str = Field(max_length=100)
    Email: str = Field(unique=True, max_length=100)
    SoDienThoai: str = Field(max_length=15)
    VaiTro: VaiTroEnum
    TrangThaiTaiKhoan: TrangThaiTaiKhoanEnum = Field(
        default=TrangThaiTaiKhoanEnum.Hoat_Dong
    )
    MatKhau: str = Field(max_length=255, exclude=True)
    NgayTao: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    bookings_giao: List["HopDongBooking"] = Relationship(
        back_populates="nhan_vien_giao",
        sa_relationship_kwargs={"foreign_keys": "[HopDongBooking.MaNhanVienGiao]"},
    )
    bookings_nhan: List["HopDongBooking"] = Relationship(
        back_populates="nhan_vien_nhan",
        sa_relationship_kwargs={"foreign_keys": "[HopDongBooking.MaNhanVienNhan]"},
    )


class HopDongBooking(SQLModel, table=True):
    __tablename__ = "Hop_Dong_Booking"

    MaBooking: str = Field(primary_key=True, max_length=15)
    MaKhachHang: str = Field(foreign_key="Khach_Hang_GPLX.MaKhachHang")
    MaXe: str = Field(foreign_key="Xe_May.MaXe")
    ThoiGianNhan: datetime
    ThoiGianTra: datetime
    ThoiGianTraGoc: datetime
    ThoiGianTraThucTe: Optional[datetime] = None
    SoNgayThue: int
    SoNgayThueGoc: int
    TrangThaiBooking: TrangThaiBookingEnum = Field(
        default=TrangThaiBookingEnum.Cho_Thanh_Toan_Coc
    )
    DonGiaApDung: Decimal = Field(max_digits=12, decimal_places=0)
    TongTienThue: Decimal = Field(max_digits=15, decimal_places=0)
    PhanTramGiamGia: Decimal = Field(default=Decimal(0), max_digits=4, decimal_places=1)
    TienGiamGia: Decimal = Field(default=Decimal(0), max_digits=15, decimal_places=0)
    PhanTramTangGia: Decimal = Field(default=Decimal(0), max_digits=4, decimal_places=1)
    TienTangGia: Decimal = Field(default=Decimal(0), max_digits=15, decimal_places=0)
    TienCoc: Decimal = Field(max_digits=15, decimal_places=0)
    PhuongThucCoc: PhuongThucCocEnum
    MaGiaoDichCoc: Optional[str] = Field(default=None, max_length=100)
    TrangThaiThanhToanCoc: TrangThaiThanhToanEnum = Field(
        default=TrangThaiThanhToanEnum.PENDING
    )
    SoLanGiaHan: int = Field(default=0)
    TongTienGiaHan: Decimal = Field(default=Decimal(0), max_digits=15, decimal_places=0)
    CoTraSom: bool = Field(default=False)
    ThoiGianYeuCauTraSom: Optional[datetime] = None
    PhiPhatTreHan: Decimal = Field(default=Decimal(0), max_digits=15, decimal_places=0)
    PhiDenBuHuHai: Decimal = Field(default=Decimal(0), max_digits=15, decimal_places=0)
    PhiMatPhuKien: Decimal = Field(default=Decimal(0), max_digits=15, decimal_places=0)
    TongThanhToan: Decimal = Field(max_digits=15, decimal_places=0)
    ODONhan: Optional[int] = None
    ODOTra: Optional[int] = None
    MucXangNhan: Optional[MucXangEnum] = None
    MucXangTra: Optional[MucXangEnum] = None
    AnhNgoaiQuanNhan: Optional[str] = None
    AnhNgoaiQuanTra: Optional[str] = None
    SoMuBaoHiemGiao: int = Field(default=0)
    SoMuBaoHiemTra: int = Field(default=0)
    CoAoMuaGiao: bool = Field(default=False)
    CoAoMuaTra: bool = Field(default=False)
    MaNhanVienGiao: Optional[str] = Field(
        default=None, foreign_key="Nhan_Vien.MaNhanVien"
    )
    MaNhanVienNhan: Optional[str] = Field(
        default=None, foreign_key="Nhan_Vien.MaNhanVien"
    )
    DanhGiaSao: Optional[int] = None
    NoiDungDanhGia: Optional[str] = None
    GhiChu: Optional[str] = None
    LyDoPhat: Optional[str] = None
    NgayTao: datetime = Field(default_factory=datetime.utcnow)
    NgayCapNhat: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    khach_hang: KhachHangGPLX = Relationship(back_populates="bookings")
    xe_may: XeMay = Relationship(back_populates="bookings")
    nhan_vien_giao: Optional[NhanVien] = Relationship(
        back_populates="bookings_giao",
        sa_relationship_kwargs={"foreign_keys": "[HopDongBooking.MaNhanVienGiao]"},
    )
    nhan_vien_nhan: Optional[NhanVien] = Relationship(
        back_populates="bookings_nhan",
        sa_relationship_kwargs={"foreign_keys": "[HopDongBooking.MaNhanVienNhan]"},
    )
    lich_su_thue: Optional["LichSuThue"] = Relationship(back_populates="booking")


class LichSuThue(SQLModel, table=True):
    __tablename__ = "Lich_Su_Thue"

    MaLichSu: str = Field(primary_key=True, max_length=15)
    MaBooking: str = Field(foreign_key="Hop_Dong_Booking.MaBooking")
    MaKhachHang: str = Field(foreign_key="Khach_Hang_GPLX.MaKhachHang")
    MaXe: str = Field(foreign_key="Xe_May.MaXe")
    BienSoXe: str = Field(max_length=12)
    ThoiGianNhan: datetime
    ThoiGianTra: datetime
    TongTienThanhToan: Decimal = Field(max_digits=15, decimal_places=0)
    GhiChuNoiBo: Optional[str] = None
    DanhDauViPham: bool = Field(default=False)
    NgayTao: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    booking: HopDongBooking = Relationship(back_populates="lich_su_thue")
    khach_hang: KhachHangGPLX = Relationship(back_populates="lich_su_thue")
    xe_may: XeMay = Relationship(back_populates="lich_su_thue")


class CauHinhHeThong(SQLModel, table=True):
    __tablename__ = "Cau_Hinh_He_Thong"

    MaCauHinh: str = Field(primary_key=True, max_length=10)
    SoLanGiaHanToiDa: int = Field(default=3)
    DonGiaPhatXeThuong_Gio: Decimal = Field(max_digits=12, decimal_places=0)
    DonGiaPhatXePKL_Gio: Decimal = Field(max_digits=12, decimal_places=0)
    PhatMatMuBaoHiem: Decimal = Field(max_digits=12, decimal_places=0)
    PhatMatAoMua: Decimal = Field(max_digits=12, decimal_places=0)
    PhanTramTangGiaLe: Decimal = Field(max_digits=4, decimal_places=1)
    NgayTao: datetime = Field(default_factory=datetime.utcnow)
    NgayCapNhat: datetime = Field(default_factory=datetime.utcnow)

class DanhGia(SQLModel, table=True):
    __tablename__ = "Danh_Gia"
    MaDanhGia: str = Field(primary_key=True)
    MaBooking: str = Field(foreign_key="Hop_Dong_Booking.MaBooking")
    DiemDanhGia: int = Field(ge=1, le=5)
    NoiDung: Optional[str] = Field(default=None)
    NgayTao: datetime = Field(default_factory=datetime.utcnow)

class BaoDuong(SQLModel, table=True):
    __tablename__ = "Bao_Duong"
    MaBaoDuong: str = Field(primary_key=True)
    MaXe: str = Field(foreign_key="Xe_May.MaXe")
    NgayBaoDuong: datetime
    ChiPhi: float
    ChiTietBaoDuong: str
