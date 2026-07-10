import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button,
  Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Booking } from '../types';

const STATUS_COLOR_MAP: Record<string, 'info'|'warning'|'error'|'default'> = {
  Cho_Nhan_Xe: 'info',
  Dang_Thue: 'default',
  Yeu_Cau_Tra_Som: 'warning',
  Qua_Han: 'error',
  Cho_Tra_Xe: 'warning',
};

const STATUS_LABEL: Record<string, string> = {
  Cho_Nhan_Xe: '→ Chờ Giao Xe',
  Dang_Thue: '✓ Đang Thuê',
  Yeu_Cau_Tra_Som: '↩ Yêu cầu Trả Sớm',
  Qua_Han: '⚠ Quá Hạn',
  Cho_Tra_Xe: '← Chờ Nhận Xe',
};

export default function StaffWorklist() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState('today');

  const fetchWorklist = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/staff/bookings/worklist?time_filter=${tabValue}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorklist();
  }, [tabValue]);

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold">Danh sách Giao Nhận</Typography>
        <Button variant="outlined" onClick={fetchWorklist}>🔄 Làm mới</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Hôm nay" value="today" />
          <Tab label="Tuần này" value="week" />
          <Tab label="Tháng này" value="month" />
        </Tabs>
      </Box>

      {bookings.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography color="textSecondary">Không có đơn nào cần xử lý trong khoảng thời gian này 🎉</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-slate-700">
              <TableRow>
                {['Mã Đơn','Mã Xe','Thời gian Nhận','Thời gian Trả','Trạng thái','Hành động'].map(h => (
                  <TableCell key={h} className="font-bold text-white">{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.MaBooking} hover>
                  <TableCell className="font-mono font-bold text-blue-700">{b.MaBooking}</TableCell>
                  <TableCell className="font-semibold">{b.MaXe}</TableCell>
                  <TableCell>{new Date(b.ThoiGianNhan).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{new Date(b.ThoiGianTra).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABEL[b.TrangThaiBooking] || b.TrangThaiBooking}
                      color={STATUS_COLOR_MAP[b.TrangThaiBooking] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {b.TrangThaiBooking === 'Cho_Nhan_Xe' && (
                      <Button
                        variant="contained"
                        size="small"
                        className="bg-blue-600"
                        onClick={() => navigate('/admin/check-in')}
                      >
                        Giao Xe →
                      </Button>
                    )}
                    {(b.TrangThaiBooking === 'Yeu_Cau_Tra_Som' || b.TrangThaiBooking === 'Qua_Han' || b.TrangThaiBooking === 'Cho_Tra_Xe') && (
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => navigate('/admin/check-out')}
                      >
                        Nhận Xe ←
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
