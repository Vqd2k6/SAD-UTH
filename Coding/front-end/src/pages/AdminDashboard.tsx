import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import api from '../services/api';
import type { DashboardStats, User } from '../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/dashboard/statistics'),
          api.get('/users/')
        ]);
        setStats(statsRes.data);
        
        const allUsers: User[] = usersRes.data;
        setPendingUsers(allUsers.filter(u => u.TrangThaiGPLX === 'Da_Upload'));
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

  const cards = [
    { title: 'Doanh Thu Tổng', value: `${Number(stats.total_revenue || 0).toLocaleString()} ₫`, color: 'bg-green-100 text-green-800' },
    { title: 'Doanh Thu Tháng này', value: `${Number(stats.revenue_month || 0).toLocaleString()} ₫`, color: 'bg-teal-100 text-teal-800' },
    { title: 'Doanh Thu Tuần này', value: `${Number(stats.revenue_week || 0).toLocaleString()} ₫`, color: 'bg-emerald-100 text-emerald-800' },
    { title: 'Đơn Tuần này', value: stats.bookings_week ?? 0, color: 'bg-blue-50 text-blue-700' },
    { title: 'Đơn Tháng này', value: stats.bookings_month ?? 0, color: 'bg-indigo-50 text-indigo-700' },
    { title: 'Tổng Kho Xe', value: stats.total_motorbikes, color: 'bg-blue-100 text-blue-800' },
    { title: 'Xe Đang Thuê', value: stats.active_rentals, color: 'bg-purple-100 text-purple-800' },
    { title: 'Xe Sẵn Sàng', value: stats.available_motorbikes, color: 'bg-cyan-100 text-cyan-800' },
    { title: 'Đang Bảo Dưỡng', value: stats.motorbikes_in_maintenance, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">Bảng Điều Khiển (Dashboard)</Typography>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <Paper key={index} className={`p-6 rounded-lg shadow-sm ${card.color}`}>
            <Typography variant="h6" className="font-semibold mb-2">{card.title}</Typography>
            <Typography variant="h3" className="font-bold">{card.value}</Typography>
          </Paper>
        ))}
      </div>

      <Typography variant="h5" className="font-bold mb-4">Hồ sơ chờ duyệt GPLX</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-slate-100">
            <TableRow>
              <TableCell className="font-bold">Mã KH</TableCell>
              <TableCell className="font-bold">Họ Tên</TableCell>
              <TableCell className="font-bold">Điện thoại</TableCell>
              <TableCell className="font-bold">Trạng thái</TableCell>
              <TableCell className="font-bold">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingUsers.length > 0 ? pendingUsers.map(u => (
              <TableRow key={u.MaKhachHang}>
                <TableCell>{u.MaKhachHang}</TableCell>
                <TableCell>{u.HoTen}</TableCell>
                <TableCell>{u.SoDienThoai}</TableCell>
                <TableCell>
                  <Chip label="Chờ duyệt" color="warning" size="small" />
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" href="/admin/customers">
                    Tới trang duyệt
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center">Không có hồ sơ nào đang chờ duyệt.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
