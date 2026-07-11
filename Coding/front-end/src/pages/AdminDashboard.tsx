import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Grid } from '@mui/material';
import api from '../services/api';
import type { DashboardStats } from '../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/dashboard/statistics');
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;
  if (!stats) return <Typography align="center" className="mt-20">Lỗi tải dữ liệu thống kê</Typography>;

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">Bảng Điều Khiển (Dashboard)</Typography>
      
      {/* 1. Doanh Thu Section */}
      <Typography variant="h5" className="font-bold mb-4 text-green-800 border-b pb-2">💰 Doanh Thu & Lợi Nhuận</Typography>
      <Grid container spacing={3} className="mb-8">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-green-50 border border-green-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Tổng Doanh Thu</Typography>
            <Typography variant="h5" className="font-bold text-green-700">{Number(stats.total_revenue || 0).toLocaleString()} ₫</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-red-50 border border-red-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Chi Phí Bảo Dưỡng</Typography>
            <Typography variant="h5" className="font-bold text-red-700">-{Number(stats.total_maintenance_cost || 0).toLocaleString()} ₫</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-blue-50 border border-blue-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Lợi Nhuận Ròng</Typography>
            <Typography variant="h5" className="font-bold text-blue-700">{Number(stats.net_revenue || 0).toLocaleString()} ₫</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-teal-50 border border-teal-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Thu Tháng Này</Typography>
            <Typography variant="h5" className="font-bold text-teal-700">{Number(stats.revenue_month || 0).toLocaleString()} ₫</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 2. Quản Lý Xe Section */}
      <Typography variant="h5" className="font-bold mb-4 text-orange-800 border-b pb-2">🏍️ Trạng Thái Xe Máy</Typography>
      <Grid container spacing={3} className="mb-8">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-gray-100 border border-gray-300 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Tổng Số Xe</Typography>
            <Typography variant="h5" className="font-bold text-gray-800">{stats.total_motorbikes}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-cyan-50 border border-cyan-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Sẵn Sàng Giao</Typography>
            <Typography variant="h5" className="font-bold text-cyan-700">{stats.available_motorbikes}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-purple-50 border border-purple-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Đang Cho Thuê</Typography>
            <Typography variant="h5" className="font-bold text-purple-700">{stats.active_rentals}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-orange-50 border border-orange-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Đang Bảo Dưỡng</Typography>
            <Typography variant="h5" className="font-bold text-orange-700">{stats.motorbikes_in_maintenance}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. Đơn Thuê Section */}
      <Typography variant="h5" className="font-bold mb-4 text-indigo-800 border-b pb-2">📑 Đơn Đặt Xe Gần Đây</Typography>
      <Grid container spacing={3} className="mb-4">
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-indigo-50 border border-indigo-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Đơn Trong Tháng</Typography>
            <Typography variant="h5" className="font-bold text-indigo-700">{stats.bookings_month}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper className="p-4 rounded-lg shadow-sm bg-indigo-50 border border-indigo-200 h-full">
            <Typography variant="subtitle2" className="text-gray-600 mb-1">Đơn Trong Tuần</Typography>
            <Typography variant="h5" className="font-bold text-indigo-700">{stats.bookings_week}</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper} className="shadow-sm">
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="font-bold">Mã Đơn</TableCell>
              <TableCell className="font-bold">Mã Xe</TableCell>
              <TableCell className="font-bold">Khách Hàng</TableCell>
              <TableCell className="font-bold">Ngày Đặt</TableCell>
              <TableCell className="font-bold">Trạng Thái</TableCell>
              <TableCell className="font-bold">Thành Tiền</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.recent_bookings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-4 text-gray-500">Không có đơn đặt xe gần đây.</TableCell>
              </TableRow>
            ) : (
              stats.recent_bookings?.map((booking) => (
                <TableRow key={booking.MaBooking} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs">{booking.MaBooking}</TableCell>
                  <TableCell className="font-semibold text-blue-600">{booking.MaXe}</TableCell>
                  <TableCell className="font-mono text-xs">{booking.MaKhachHang}</TableCell>
                  <TableCell>{new Date(booking.NgayTao).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.TrangThaiBooking} 
                      size="small" 
                      color={
                        booking.TrangThaiBooking === 'Hoan_Tat' ? 'success' :
                        booking.TrangThaiBooking === 'Dang_Thue' ? 'primary' :
                        booking.TrangThaiBooking === 'Da_Huy' || booking.TrangThaiBooking === 'Khong_Den_Nhan_Xe' ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{Number(booking.TongThanhToan || booking.TongTienThue).toLocaleString()} ₫</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}
