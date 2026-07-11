import { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import api from '../services/api';
import type { User } from '../types';

export default function StaffGPLXReview() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('Ảnh mờ, không rõ thông tin');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      // Staff only needs to see users who have uploaded GPLX
      const gplxUsers = res.data.filter((u: User) => 
        u.TrangThaiGPLX === 'Da_Upload' || u.TrangThaiGPLX === 'Da_Xac_Thuc' || u.TrangThaiGPLX === 'Tu_Choi'
      );
      setUsers(gplxUsers);
    } catch (err: any) {
      setError('Lỗi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
    setShowRejectInput(false);
    setRejectReason('Ảnh mờ, không rõ thông tin');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleApproveGPLX = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/users/${selectedUser.MaKhachHang}/gplx/approve`);
      alert('Đã phê duyệt GPLX');
      fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRejectGPLX = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/users/${selectedUser.MaKhachHang}/gplx/reject?ly_do=${encodeURIComponent(rejectReason)}`);
      alert('Đã từ chối GPLX');
      fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="p-6 max-w-5xl mx-auto">
      <Typography variant="h4" className="font-bold mb-6 text-gray-800">Duyệt Bằng Lái Xe (GPLX)</Typography>
      
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <TableContainer component={Paper} className="shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell className="font-bold">Mã KH</TableCell>
              <TableCell className="font-bold">Tên</TableCell>
              <TableCell className="font-bold">Trạng Thái GPLX</TableCell>
              <TableCell className="font-bold text-center">Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" className="py-8 text-gray-500">
                  Không có yêu cầu duyệt GPLX nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.MaKhachHang} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs">{user.MaKhachHang}</TableCell>
                  <TableCell className="font-semibold">{user.HoTen}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.TrangThaiGPLX} 
                      color={
                        user.TrangThaiGPLX === 'Da_Xac_Thuc' ? 'success' : 
                        user.TrangThaiGPLX === 'Da_Upload' ? 'warning' : 'error'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                    >
                      Xem / Duyệt
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Xem & Duyệt GPLX Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle className="font-bold bg-gray-50 border-b">
          Xét duyệt GPLX - {selectedUser?.HoTen}
        </DialogTitle>
        <DialogContent className="pt-6">
          {selectedUser && (
            <Box className="flex flex-col gap-6 mt-2">
              <Box className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography className="font-semibold text-gray-700 mb-2">Mặt trước</Typography>
                  {selectedUser.AnhGPLXMatTruoc ? (
                    <img 
                      src={selectedUser.AnhGPLXMatTruoc} 
                      alt="GPLX Mặt Trước" 
                      className="w-full h-64 object-contain bg-gray-100 rounded border border-gray-300"
                    />
                  ) : (
                    <Box className="w-full h-64 bg-gray-100 rounded border flex items-center justify-center text-gray-500">Không có ảnh</Box>
                  )}
                </Box>
                <Box>
                  <Typography className="font-semibold text-gray-700 mb-2">Mặt sau</Typography>
                  {selectedUser.AnhGPLXMatSau ? (
                    <img 
                      src={selectedUser.AnhGPLXMatSau} 
                      alt="GPLX Mặt Sau" 
                      className="w-full h-64 object-contain bg-gray-100 rounded border border-gray-300"
                    />
                  ) : (
                    <Box className="w-full h-64 bg-gray-100 rounded border flex items-center justify-center text-gray-500">Không có ảnh</Box>
                  )}
                </Box>
              </Box>

              {showRejectInput && (
                <TextField 
                  fullWidth 
                  label="Lý do từ chối" 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-4"
                  autoFocus
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4 border-t bg-gray-50">
          <Button onClick={handleCloseDialog} color="inherit">Đóng</Button>
          
          {!showRejectInput ? (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setShowRejectInput(true)}
                disabled={selectedUser?.TrangThaiGPLX === 'Da_Xac_Thuc'}
              >
                Từ chối
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleApproveGPLX}
                disabled={selectedUser?.TrangThaiGPLX === 'Da_Xac_Thuc'}
              >
                Phê duyệt Hợp lệ
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleRejectGPLX}
            >
              Xác nhận Từ chối
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
