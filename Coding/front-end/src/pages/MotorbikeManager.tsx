import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, DialogActions, Alert 
} from '@mui/material';
import api from '../services/api';
import type { Motorbike } from '../types';

export default function MotorbikeManager() {
  const [bikes, setBikes] = useState<Motorbike[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<Motorbike | null>(null);
  const [formData, setFormData] = useState<Partial<Motorbike>>({});
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/motorbikes/all');
      setBikes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBikes(); }, []);

  const handleOpen = (bike?: Motorbike) => {
    setEditingBike(bike || null);
    setFormData(bike ? { ...bike } : {
      MaXe: `XM00${Math.floor(Math.random() * 900) + 10}`,
      BienSo: '', SoKhung: '', SoMay: '', HangXe: '', TenXe: '', 
      LoaiXe: 'Xe_Ga', PhanKhoi: 110, NhomXe: 'Nhom_A1', DoiXe: new Date().getFullYear(),
      HinhAnhXe: '', TrangThaiXe: 'San_Sang', DonGiaNgay: 150000,
      MucTieuThuXang: 'MUC_TRUNG_BINH', SoMuBaoHiem: 2, CoAoMua: true, ODOHienTai: 0
    });
    setMessage('');
    setOpen(true);
  };

  const handleSave = async () => {
    setMessage(''); setIsError(false);
    try {
      if (editingBike) {
        await api.put(`/motorbikes/${editingBike.MaXe}`, formData);
        setMessage('Cập nhật xe thành công!');
      } else {
        await api.post('/motorbikes/', formData);
        setMessage('Thêm xe mới thành công!');
      }
      fetchBikes();
      setTimeout(() => setOpen(false), 1500);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maXe: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    try {
      await api.delete(`/motorbikes/${maXe}`);
      fetchBikes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa xe');
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="p-6">
      <Box className="flex justify-between mb-6">
        <Typography variant="h4" className="font-bold">Quản Lý Kho Xe Máy</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Thêm Xe Mới</Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="font-bold">Mã Xe</TableCell>
              <TableCell className="font-bold">Biển Số</TableCell>
              <TableCell className="font-bold">Loại Xe</TableCell>
              <TableCell className="font-bold">Nhóm Bằng Lái</TableCell>
              <TableCell className="font-bold">Đơn Giá / Ngày</TableCell>
              <TableCell className="font-bold">Trạng Thái</TableCell>
              <TableCell className="font-bold">Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bikes.map((b) => (
              <TableRow key={b.MaXe}>
                <TableCell>{b.MaXe}</TableCell>
                <TableCell className="font-semibold">{b.BienSo}</TableCell>
                <TableCell>{b.LoaiXe} ({b.PhanKhoi}cc)</TableCell>
                <TableCell>{b.NhomXe}</TableCell>
                <TableCell>{b.DonGiaNgay?.toLocaleString()} VNĐ</TableCell>
                <TableCell>
                  <Chip 
                    label={b.TrangThaiXe} 
                    color={
                      b.TrangThaiXe === 'San_Sang' ? 'success' :
                      b.TrangThaiXe === 'Dang_Thue' ? 'info' : 'error'
                    } 
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(b)}>Sửa</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(b.MaXe)}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Thêm / Sửa Xe */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBike ? 'Sửa Thông Tin Xe' : 'Thêm Xe Mới'}</DialogTitle>
        <DialogContent dividers>
          {message && <Alert severity={isError ? "error" : "success"} className="mb-4">{message}</Alert>}
          <Box className="grid grid-cols-2 gap-4 mt-2">
            <TextField label="Mã Xe" value={formData.MaXe || ''} disabled fullWidth />
            <TextField label="Biển Số" value={formData.BienSo || ''} onChange={e => setFormData({...formData, BienSo: e.target.value})} fullWidth />
            <TextField label="Hãng Xe" value={formData.HangXe || ''} onChange={e => setFormData({...formData, HangXe: e.target.value})} fullWidth />
            <TextField label="Tên Xe" value={formData.TenXe || ''} onChange={e => setFormData({...formData, TenXe: e.target.value})} fullWidth />
            <TextField label="Đơn Giá Ngày" type="number" value={formData.DonGiaNgay || 0} onChange={e => setFormData({...formData, DonGiaNgay: Number(e.target.value)})} fullWidth />
            <TextField label="Phân Khối (cc)" type="number" value={formData.PhanKhoi || 0} onChange={e => setFormData({...formData, PhanKhoi: Number(e.target.value)})} fullWidth />
            <TextField label="Số Khung" value={formData.SoKhung || ''} onChange={e => setFormData({...formData, SoKhung: e.target.value})} fullWidth />
            <TextField label="Số Máy" value={formData.SoMay || ''} onChange={e => setFormData({...formData, SoMay: e.target.value})} fullWidth />
            
            <TextField select label="Trạng Thái Xe" value={formData.TrangThaiXe || 'San_Sang'} onChange={e => setFormData({...formData, TrangThaiXe: e.target.value as any})} fullWidth>
              <MenuItem value="San_Sang">Sẵn Sàng</MenuItem>
              <MenuItem value="Dang_Bao_Duong">Đang Bảo Dưỡng</MenuItem>
              <MenuItem value="Dang_Sua_Chua">Đang Sửa Chữa</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
