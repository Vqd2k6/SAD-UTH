import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField 
} from '@mui/material';
import api from '../services/api';
import type { Maintenance } from '../types';

export default function MaintenanceManager() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.post('/maintenance/', {
        MaXe: maXe,
        NgayBaoDuong: new Date().toISOString(),
        ChiPhi: chiPhi,
        ChiTietBaoDuong: chiTiet
      });
      alert('Thêm lịch bảo dưỡng thành công!');
      setMaXe(''); setChiPhi(0); setChiTiet('');
      fetchRecords();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Lỗi thêm bảo dưỡng');
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">Lịch Sử Bảo Dưỡng</Typography>
      
      <Paper className="p-6 mb-6">
        <Typography variant="h6" className="font-bold mb-4">Thêm Bản Ghi Mới</Typography>
        <Box className="flex gap-4 mb-4">
          <TextField label="Mã Xe" value={maXe} onChange={e => setMaXe(e.target.value)} />
          <TextField label="Chi Phí (VNĐ)" type="number" value={chiPhi} onChange={e => setChiPhi(Number(e.target.value))} />
          <TextField label="Chi tiết bảo dưỡng" fullWidth value={chiTiet} onChange={e => setChiTiet(e.target.value)} />
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
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.MaBaoDuong}>
                <TableCell>{r.MaBaoDuong}</TableCell>
                <TableCell className="font-semibold text-blue-600">{r.MaXe}</TableCell>
                <TableCell>{new Date(r.NgayBaoDuong).toLocaleDateString()}</TableCell>
                <TableCell className="text-red-600 font-semibold">{r.ChiPhi.toLocaleString()} VNĐ</TableCell>
                <TableCell>{r.ChiTietBaoDuong}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
