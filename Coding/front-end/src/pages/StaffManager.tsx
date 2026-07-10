import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Chip, CircularProgress, Alert 
} from '@mui/material';
import api from '../services/api';
import type { Staff } from '../types';

export default function StaffManager() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  // Form states
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [vaiTro, setVaiTro] = useState('Nhan_Vien');
  const [matKhau, setMatKhau] = useState('');
  const [trangThai, setTrangThai] = useState('Hoat_Dong');
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff/');
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenNew = () => {
    setEditingStaff(null);
    setHoTen('');
    setEmail('');
    setSoDienThoai('');
    setVaiTro('Nhan_Vien');
    setMatKhau('');
    setTrangThai('Hoat_Dong');
    setMessage('');
    setIsError(false);
    setOpenDialog(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setHoTen(staff.HoTen);
    setEmail(staff.Email);
    setSoDienThoai(staff.SoDienThoai);
    setVaiTro(staff.VaiTro);
    setTrangThai(staff.TrangThaiTaiKhoan);
    setMatKhau(''); // Không hiển thị mật khẩu cũ
    setMessage('');
    setIsError(false);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setMessage('');
    setIsError(false);
    try {
      if (editingStaff) {
        // Update
        await api.put(`/staff/${editingStaff.MaNhanVien}`, {
          HoTen: hoTen,
          SoDienThoai: soDienThoai,
          VaiTro: vaiTro,
          TrangThaiTaiKhoan: trangThai
        });
        setMessage('Cập nhật nhân viên thành công');
      } else {
        // Create
        if (!matKhau) {
          setIsError(true);
          setMessage('Vui lòng nhập mật khẩu cho nhân viên mới');
          return;
        }
        await api.post('/staff/', {
          HoTen: hoTen,
          Email: email,
          SoDienThoai: soDienThoai,
          VaiTro: vaiTro,
          MatKhau: matKhau
        });
        setMessage('Tạo nhân viên thành công');
      }
      fetchStaff();
      setTimeout(() => setOpenDialog(false), 1500);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.detail || 'Lỗi khi lưu nhân viên');
    }
  };

  if (loading) {
    return <Box className="flex justify-center mt-10"><CircularProgress /></Box>;
  }

  return (
    <Box className="container mx-auto p-4">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold">Quản lý Nhân sự</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenNew}>Thêm Nhân Viên</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell className="font-bold">Mã NV</TableCell>
              <TableCell className="font-bold">Họ và Tên</TableCell>
              <TableCell className="font-bold">Email</TableCell>
              <TableCell className="font-bold">Số điện thoại</TableCell>
              <TableCell className="font-bold">Vai trò</TableCell>
              <TableCell className="font-bold">Trạng thái</TableCell>
              <TableCell className="font-bold">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffList.map((staff) => (
              <TableRow key={staff.MaNhanVien} hover>
                <TableCell>{staff.MaNhanVien}</TableCell>
                <TableCell>{staff.HoTen}</TableCell>
                <TableCell>{staff.Email}</TableCell>
                <TableCell>{staff.SoDienThoai}</TableCell>
                <TableCell>
                  <Chip 
                    label={staff.VaiTro === 'Admin' ? 'Quản trị viên' : 'Nhân viên'} 
                    color={staff.VaiTro === 'Admin' ? 'secondary' : 'default'} 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={staff.TrangThaiTaiKhoan === 'Hoat_Dong' ? 'Hoạt động' : 'Bị khóa'} 
                    color={staff.TrangThaiTaiKhoan === 'Hoat_Dong' ? 'success' : 'error'} 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleOpenEdit(staff)}>Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
            {staffList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">Chưa có dữ liệu nhân sự</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Form */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
        <DialogContent dividers>
          {message && <Alert severity={isError ? "error" : "success"} className="mb-4">{message}</Alert>}
          
          <Box className="flex flex-col gap-4 mt-2">
            <TextField 
              label="Họ và Tên" 
              fullWidth 
              value={hoTen} 
              onChange={e => setHoTen(e.target.value)} 
            />
            <TextField 
              label="Email" 
              fullWidth 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              disabled={!!editingStaff} // Không cho sửa email khi update
            />
            <TextField 
              label="Số điện thoại" 
              fullWidth 
              value={soDienThoai} 
              onChange={e => setSoDienThoai(e.target.value)} 
            />
            
            <TextField 
              select 
              label="Vai trò" 
              fullWidth 
              value={vaiTro} 
              onChange={e => setVaiTro(e.target.value)}
            >
              <MenuItem value="Nhan_Vien">Nhân viên Vận hành</MenuItem>
              <MenuItem value="Admin">Quản trị viên (Admin)</MenuItem>
            </TextField>

            {editingStaff && (
              <TextField 
                select 
                label="Trạng thái tài khoản" 
                fullWidth 
                value={trangThai} 
                onChange={e => setTrangThai(e.target.value)}
              >
                <MenuItem value="Hoat_Dong">Hoạt động</MenuItem>
                <MenuItem value="Bi_Khoa">Bị Khóa</MenuItem>
              </TextField>
            )}

            {!editingStaff && (
              <TextField 
                label="Mật khẩu" 
                fullWidth 
                type="password"
                value={matKhau} 
                onChange={e => setMatKhau(e.target.value)} 
                helperText="Mật khẩu đăng nhập cho nhân viên mới"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
