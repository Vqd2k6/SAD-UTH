import uuid
from decimal import Decimal
from sqlmodel import Session, select
from app.database import engine
from app.models import (
    NhanVien, VaiTroEnum, TrangThaiTaiKhoanEnum, 
    XeMay, LoaiXeEnum, NhomXeEnum, TrangThaiXeEnum,
    CauHinhHeThong, KhachHangGPLX, TrangThaiGPLXEnum, HangGPLXEnum, LuaChonGPLXEnum
)
from app.core.security import get_password_hash

def seed_data():
    with Session(engine) as session:
        # Check if admin already exists
        admin = session.get(NhanVien, "ADMIN01")
        if not admin:
            print("Seeding Admin account...")
            admin = NhanVien(
                MaNhanVien="ADMIN01",
                HoTen="Quản Trị Viên",
                Email="admin@kthp.com",
                SoDienThoai="0987654321",
                VaiTro=VaiTroEnum.Admin,
                TrangThaiTaiKhoan=TrangThaiTaiKhoanEnum.Hoat_Dong,
                MatKhau=get_password_hash("admin123")
            )
            session.add(admin)
            
        staff = session.get(NhanVien, "STAFF01")
        if not staff:
            print("Seeding Staff account...")
            staff = NhanVien(
                MaNhanVien="STAFF01",
                HoTen="Nhân Viên Kỹ Thuật",
                Email="staff@kthp.com",
                SoDienThoai="0123456789",
                VaiTro=VaiTroEnum.Nhan_Vien,
                TrangThaiTaiKhoan=TrangThaiTaiKhoanEnum.Hoat_Dong,
                MatKhau=get_password_hash("staff123")
            )
            session.add(staff)
            
        # Seed motorbikes
        bike1 = session.get(XeMay, "XM001")
        if not bike1:
            print("Seeding motorbikes...")
            b1 = XeMay(
                MaXe="XM001",
                BienSo="59A1-123.45",
                SoKhung="SK123456789",
                SoMay="SM123456789",
                HangXe="Honda",
                TenXe="Vision 2023",
                LoaiXe=LoaiXeEnum.Xe_Ga,
                PhanKhoi=110,
                NhomXe=NhomXeEnum.Nhom_A1,
                DoiXe=2023,
                TrangThaiXe=TrangThaiXeEnum.San_Sang,
                DonGiaNgay=Decimal("150000"),
                HinhAnhXe="https://cdn.honda.com.vn/motorbikes/September2023/VjA0XwXJ9C6gZJd51QzH.jpg"
            )
            b2 = XeMay(
                MaXe="XM002",
                BienSo="59B1-987.65",
                SoKhung="SK987654321",
                SoMay="SM987654321",
                HangXe="Yamaha",
                TenXe="Exciter 155 VVA",
                LoaiXe=LoaiXeEnum.Xe_Con,
                PhanKhoi=155,
                NhomXe=NhomXeEnum.Nhom_A1,
                DoiXe=2024,
                TrangThaiXe=TrangThaiXeEnum.San_Sang,
                DonGiaNgay=Decimal("250000"),
                HinhAnhXe="https://yamaha-motor.com.vn/wp/wp-content/uploads/2023/09/Exciter-155-VVA-Xanh-GP-1.png"
            )
            b3 = XeMay(
                MaXe="XM003",
                BienSo="59C1-555.55",
                SoKhung="SK555555555",
                SoMay="SM555555555",
                HangXe="Honda",
                TenXe="SH 350i",
                LoaiXe=LoaiXeEnum.Xe_Ga,
                PhanKhoi=330,
                NhomXe=NhomXeEnum.Nhom_A2_PKL,
                DoiXe=2024,
                TrangThaiXe=TrangThaiXeEnum.San_Sang,
                DonGiaNgay=Decimal("500000"),
                HinhAnhXe="https://cdn.honda.com.vn/motorbikes/August2023/OQQO69K0w9D831WzYd6d.jpg"
            )
            session.add(b1)
            session.add(b2)
            session.add(b3)
            
        config = session.exec(select(CauHinhHeThong)).first() if hasattr(session, 'exec') else session.query(CauHinhHeThong).first()
        if not config:
            print("Seeding Config...")
            new_config = CauHinhHeThong(
                SoLanGiaHanToiDa=3,
                DonGiaPhatXeThuong_Gio=50000,
                DonGiaPhatXePKL_Gio=100000,
                PhatMatMuBaoHiem=150000,
                PhatMatAoMua=50000,
                PhanTramTangGiaLe=20
            )
            session.add(new_config)
            
        customer1 = session.get(KhachHangGPLX, "KH001")
        if not customer1:
            print("Seeding Customer...")
            customer1 = KhachHangGPLX(
                MaKhachHang="KH001",
                HoTen="Khách Hàng Test",
                Email="khachhang@kthp.com",
                SoDienThoai="0999888777",
                MatKhau=get_password_hash("khach123"),
                LuaChonGPLX=LuaChonGPLXEnum.Co_GPLX,
                TrangThaiGPLX=TrangThaiGPLXEnum.Da_Upload,
                HangGPLX=HangGPLXEnum.A1,
                NhomXeDuocThue=NhomXeEnum.Nhom_A1,
                AnhGPLXMatTruoc="https://chiasetainguyen.com/vi-sao-anh-the-cccd-luon-la-hinh-tu-dim-hang-minh-nhat.jpg"
            )
            session.add(customer1)
            
        session.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
