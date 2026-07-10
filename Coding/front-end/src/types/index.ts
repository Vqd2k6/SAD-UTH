export interface User {
  MaKhachHang: string;
  HoTen: string;
  Email: string | null;
  SoDienThoai: string;
  CCCD: string | null;
  DiaChi: string | null;
  LuaChonGPLX: 'Khong_GPLX' | 'Co_GPLX';
  HangGPLX: 'Khong' | 'A1' | 'A2' | null;
  AnhGPLXMatTruoc: string | null;
  AnhGPLXMatSau: string | null;
  TrangThaiGPLX: 'Khong_Dang_Ky' | 'Da_Upload' | 'Da_Xac_Thuc' | 'Tu_Choi';
  NhomXeDuocThue: 'Nhom_50cc_Dien' | 'Nhom_A1' | 'Nhom_A2_PKL';
  TrangThaiBlacklist: boolean;
  NgayTao: string;
}

export interface Motorbike {
  MaXe: string;
  BienSo: string;
  LoaiXe: 'Xe_So' | 'Xe_Ga' | 'Xe_Con' | 'Xe_Dien';
  PhanKhoi: number;
  NhomXe: 'Nhom_50cc_Dien' | 'Nhom_A1' | 'Nhom_A2_PKL';
  HangXe: string;
  TenXe: string;
  SoKhung: string;
  SoMay: string;
  DoiXe: number;
  MucTieuThuXang?: string;
  SoMuBaoHiem?: number;
  CoAoMua?: boolean;
  DonGiaNgay: number;
  TrangThaiXe: 'San_Sang' | 'Dang_Thue' | 'Dang_Bao_Duong' | 'Dang_Sua_Chua';
  HinhAnhXe: string | null;
  ODOHienTai: number;
}

export interface Booking {
  MaBooking: string;
  MaKhachHang: string;
  MaXe: string;
  ThoiGianNhan: string;
  ThoiGianTra: string;
  ThoiGianTraGoc: string;
  ThoiGianTraThucTe: string | null;
  SoNgayThue: number;
  TrangThaiBooking: 'Cho_Thanh_Toan_Coc' | 'Cho_Nhan_Xe' | 'Dang_Thue' | 'Yeu_Cau_Tra_Som' | 'Qua_Han' | 'Cho_Tra_Xe' | 'Dang_Quyet_Toan' | 'Hoan_Tat' | 'Da_Huy' | 'Khong_Den_Nhan_Xe';
  DonGiaApDung: number;
  TongTienThue: number;
  TienCoc: number;
  PhuongThucCoc: 'Chuyen_Khoan' | 'Tien_Mat' | 'The_Tin_Dung';
  MaGiaoDichCoc: string | null;
  TrangThaiThanhToanCoc: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  SoLanGiaHan: number;
  TongTienGiaHan: number;
  CoTraSom: boolean;
  ODONhan: number | null;
  ODOTra: number | null;
  MucXangNhan: string | null;
  MucXangTra: string | null;
  PhiDenBuHuHai: number;
  PhiPhatTreHan: number;
  PhiMatPhuKien: number;
  TongThanhToan: number;
  DanhGiaSao: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
export interface Rating {
  MaDanhGia: string;
  MaBooking: string;
  DiemDanhGia: number;
  NoiDung: string | null;
  NgayTao: string;
}

export interface Maintenance {
  MaBaoDuong: string;
  MaXe: string;
  NgayBaoDuong: string;
  ChiPhi: number;
  ChiTietBaoDuong: string;
}

export interface DashboardStats {
  total_revenue: number;
  revenue_week: number;
  revenue_month: number;
  bookings_week: number;
  bookings_month: number;
  total_motorbikes: number;
  active_rentals: number;
  motorbikes_in_maintenance: number;
  available_motorbikes: number;
}

export interface Staff {
  MaNhanVien: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  VaiTro: 'Admin' | 'Nhan_Vien';
  TrangThaiTaiKhoan: 'Hoat_Dong' | 'Bi_Khoa';
  NgayTao: string;
}

export interface SystemConfig {
  MaCauHinh: string;
  SoLanGiaHanToiDa: number;
  DonGiaPhatXeThuong_Gio: number;
  DonGiaPhatXePKL_Gio: number;
  PhatMatMuBaoHiem: number;
  PhatMatAoMua: number;
  PhanTramTangGiaLe: number;
  NgayCapNhat: string;
}
