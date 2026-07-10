import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Button, Tooltip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField
} from '@mui/material';
import api from '../services/api';
import type { User } from '../types';

const GPLX_COLOR: Record<string, 'default'|'warning'|'success'|'error'> = {
  Khong_Dang_Ky: 'default',
  Da_Upload: 'warning',
  Da_Xac_Thuc: 'success',
  Tu_Choi: 'error',
};

export default function CustomerManager() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Blacklist dialog
  const [blacklistTarget, setBlacklistTarget] = useState<string | null>(null);
  const [lyDoBlacklist, setLyDoBlacklist] = useState('');

  // GPLX viewer dialog
  const [gplxViewUser, setGplxViewUser] = useState<User | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/users/');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleApproveGPLX = async (maKH: string) => {
    try {
      await api.put(`/users/${maKH}/gplx/approve`);
      setMessage(`✅ Đã phê duyệt GPLX cho KH ${maKH}`);
      fetchCustomers();
    } catch (err: any) {
      setMessage(`❌ Lỗi: ${err.response?.data?.detail}`);
    }
  };

  const handleRejectGPLX = async (maKH: string) => {
    try {
      await api.put(`/users/${maKH}/gplx/reject`, null, { params: { ly_do: 'Ảnh không rõ / không hợp lệ' }});
      setMessage(`⚠️ Đã từ chối GPLX của KH ${maKH}`);
      fetchCustomers();
    } catch (err: any) {
      setMessage(`❌ Lỗi: ${err.response?.data?.detail}`);
    }
  };

  const handleBlacklist = async () => {
    if (!blacklistTarget) return;
    try {
      await api.put(`/users/${blacklistTarget}/blacklist`, null, { params: { ly_do: lyDoBlacklist || 'Vi phạm quy định' }});
      setMessage(`🚫 Đã Blacklist KH ${blacklistTarget}`);
      setBlacklistTarget(null);
      setLyDoBlacklist('');
      fetchCustomers();
    } catch (err: any) {
      setMessage(`❌ Lỗi: ${err.response?.data?.detail}`);
    }
  };

  const handleUnblacklist = async (maKH: string) => {
    try {
      await api.delete(`/users/${maKH}/blacklist`);
      setMessage(`✅ Đã gỡ Blacklist cho KH ${maKH}`);
      fetchCustomers();
    } catch (err: any) {
      setMessage(`❌ Lỗi: ${err.response?.data?.detail}`);
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-4">Quản lý Khách Hàng</Typography>
      
      {message && (
        <Alert 
          severity={message.startsWith('✅') ? 'success' : message.startsWith('⚠️') ? 'warning' : 'error'} 
          className="mb-4"
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead className="bg-slate-700">
            <TableRow>
              {['Mã KH','Họ Tên','Điện thoại','CCCD','Trạng thái GPLX','Hạng GPLX','Nhóm Xe','Blacklist','Hành động'].map(h => (
                <TableCell key={h} className="font-bold text-white text-xs">{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((kh) => (
              <TableRow key={kh.MaKhachHang} hover className={kh.TrangThaiBlacklist ? 'bg-red-50' : ''}>
                <TableCell className="font-mono text-xs">{kh.MaKhachHang}</TableCell>
                <TableCell className="font-semibold">{kh.HoTen}</TableCell>
                <TableCell>{kh.SoDienThoai}</TableCell>
                <TableCell className="text-xs">{kh.CCCD || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={kh.TrangThaiGPLX.replace(/_/g,' ')}
                    color={GPLX_COLOR[kh.TrangThaiGPLX] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{kh.HangGPLX || '-'}</TableCell>
                <TableCell className="text-xs">{kh.NhomXeDuocThue.replace(/_/g,' ')}</TableCell>
                <TableCell>
                  {kh.TrangThaiBlacklist
                    ? <Chip label="Blacklist" color="error" size="small" />
                    : <Chip label="Bình thường" color="success" size="small" />
                  }
                </TableCell>
                <TableCell>
                  <Box className="flex flex-col gap-1 py-1">
                    {kh.TrangThaiGPLX === 'Da_Upload' && (
                      <>
                        <Tooltip title="Xem ảnh GPLX">
                          <Button size="small" variant="outlined" color="info" onClick={() => setGplxViewUser(kh)}>
                            🖼️ Xem GPLX
                          </Button>
                        </Tooltip>
                        <Button size="small" variant="contained" color="success" onClick={() => handleApproveGPLX(kh.MaKhachHang)}>
                          ✓ Duyệt
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleRejectGPLX(kh.MaKhachHang)}>
                          ✗ Từ chối
                        </Button>
                      </>
                    )}
                    {!kh.TrangThaiBlacklist ? (
                      <Button size="small" variant="outlined" color="error" onClick={() => setBlacklistTarget(kh.MaKhachHang)}>
                        🚫 Blacklist
                      </Button>
                    ) : (
                      <Button size="small" variant="outlined" color="success" onClick={() => handleUnblacklist(kh.MaKhachHang)}>
                        ✅ Gỡ BL
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* GPLX Image Viewer Dialog */}
      <Dialog open={!!gplxViewUser} onClose={() => setGplxViewUser(null)} maxWidth="md" fullWidth>
        <DialogTitle className="font-bold">📋 GPLX của {gplxViewUser?.HoTen} ({gplxViewUser?.MaKhachHang})</DialogTitle>
        <DialogContent>
          {gplxViewUser?.AnhGPLXMatTruoc || gplxViewUser?.AnhGPLXMatSau ? (
            <Box className="flex gap-4 mt-2">
              <Box className="flex-1">
                <Typography variant="caption" className="font-bold block mb-1">Mặt trước</Typography>
                {gplxViewUser.AnhGPLXMatTruoc ? (
                  <img src={gplxViewUser.AnhGPLXMatTruoc} alt="GPLX mặt trước" className="w-full rounded border" />
                ) : <Typography color="textSecondary">Không có ảnh</Typography>}
              </Box>
              <Box className="flex-1">
                <Typography variant="caption" className="font-bold block mb-1">Mặt sau</Typography>
                {gplxViewUser.AnhGPLXMatSau ? (
                  <img src={gplxViewUser.AnhGPLXMatSau} alt="GPLX mặt sau" className="w-full rounded border" />
                ) : <Typography color="textSecondary">Không có ảnh</Typography>}
              </Box>
            </Box>
          ) : (
            <Typography color="textSecondary" className="mt-2">Không có ảnh GPLX nào được tải lên.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setGplxViewUser(null); handleApproveGPLX(gplxViewUser!.MaKhachHang); setGplxViewUser(null); }} variant="contained" color="success">✓ Phê duyệt</Button>
          <Button onClick={() => { handleRejectGPLX(gplxViewUser!.MaKhachHang); setGplxViewUser(null); }} variant="outlined" color="error">✗ Từ chối</Button>
          <Button onClick={() => setGplxViewUser(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Blacklist dialog */}
      <Dialog open={!!blacklistTarget} onClose={() => setBlacklistTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold text-red-700">🚫 Xác nhận Blacklist</DialogTitle>
        <DialogContent className="pt-4">
          <Typography className="mb-4">Bạn đang Blacklist khách hàng <strong>{blacklistTarget}</strong>. Họ sẽ không thể đặt xe nữa.</Typography>
          <TextField
            label="Lý do Blacklist"
            fullWidth
            value={lyDoBlacklist}
            onChange={(e) => setLyDoBlacklist(e.target.value)}
            placeholder="Vi phạm quy định, gây hư hại xe..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlacklistTarget(null)}>Hủy</Button>
          <Button onClick={handleBlacklist} variant="contained" color="error">Xác nhận Blacklist</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
