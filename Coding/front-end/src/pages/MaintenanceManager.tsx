import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Alert
} from '@mui/material';
import api from '../services/api';
import type { Maintenance } from '../types';

export default function MaintenanceManager() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form State
  const [maXe, setMaXe] = useState('');
  const [chiPhi, setChiPhi] = useState(0);
  const [chiTiet, setChiTiet] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await api.get('/maintenance/all');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreate = async () => {
    if (!maXe || !chiTiet) {
      setIsError(true);
      setMessage('Vui lòng điền đầy đủ Mã Xe và Chi tiết bảo dưỡng.');
      return;
    }
    setIsError(false);
    try {
      await api.post('/maintenance/', {
        MaXe: maXe,
        NgayBaoDuong: new Date().toISOString(),
        ChiPhi: chiPhi,
        ChiTietBaoDuong: chiTiet
      });
      setMessage('✅ Thêm lịch bảo dưỡng thành công! Xe đã chuyển sang trạng thái Đang Bảo Dưỡng.');
      setMaXe(''); setChiPhi(0); setChiTiet('');
      fetchRecords();
    } catch (err: any) {
      setIsError(true);
      setMessage(`❌ ${err.response?.data?.detail || 'Lỗi thêm bảo dưỡng'}`);
    }
  };

  const handleComplete = async (maBaoDuong: string) => {
    if (!window.confirm('Xác nhận hoàn tất bảo dưỡng? Xe sẽ được đưa về trạng thái Sẵn Sàng.')) return;
    try {
      const res = await api.put(`/maintenance/${maBaoDuong}/complete`);
      setIsError(false);
      setMessage(`✅ ${res.data.message}`);
      fetchRecords();
    } catch (err: any) {
      setIsError(true);
      setMessage(`❌ ${err.response?.data?.detail || 'Lỗi hoàn tất bảo dưỡng'}`);
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">Lịch Sử Bảo Dưỡng</Typography>
      
      {message && (
        <Alert severity={isError ? 'error' : 'success'} className="mb-4" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      
      <Paper className="p-6 mb-6">
        <Typography variant="h6" className="font-bold mb-4">➕ Tạo Lịch Bảo Dưỡng Mới</Typography>
        <Box className="flex gap-4 mb-4">
          <TextField label="Mã Xe" value={maXe} onChange={e => setMaXe(e.target.value)} required />
          <TextField label="Chi Phí (VNĐ)" type="number" value={chiPhi} onChange={e => setChiPhi(Number(e.target.value))} />
          <TextField label="Chi tiết bảo dưỡng" fullWidth value={chiTiet} onChange={e => setChiTiet(e.target.value)} required />
          <Button variant="contained" color="primary" onClick={handleCreate}>Lưu</Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="font-bold">Mã Bảo Dưỡng</TableCell>
              <TableCell className="font-bold">Mã Xe</TableCell>
              <TableCell className="font-bold">Ngày Bảo Dưỡng</TableCell>
              <TableCell className="font-bold">Chi Phí</TableCell>
              <TableCell className="font-bold">Chi Tiết</TableCell>
              <TableCell className="font-bold">Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.MaBaoDuong}>
                <TableCell>{r.MaBaoDuong}</TableCell>
                <TableCell className="font-semibold text-blue-600">{r.MaXe}</TableCell>
                <TableCell>{new Date(r.NgayBaoDuong).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-red-600 font-semibold">{Number(r.ChiPhi).toLocaleString()} VNĐ</TableCell>
                <TableCell>{r.ChiTietBaoDuong}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color={r.DaHoanThanh ? "inherit" : "success"}
                    onClick={() => handleComplete(r.MaBaoDuong)}
                    disabled={r.DaHoanThanh}
                  >
                    {r.DaHoanThanh ? '✔️ Đã xong' : '✅ Hoàn thành & Trả xe'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
