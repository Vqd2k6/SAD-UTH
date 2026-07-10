import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, 
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import api from '../services/api';
import type { Booking } from '../types';
import RatingModal from '../components/RatingModal';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rating modal state
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  
  // Extend modal state
  const [extendBookingId, setExtendBookingId] = useState<string | null>(null);
  const [soNgayGiaHan, setSoNgayGiaHan] = useState('1');
  
  // Early return modal state  
  const [earlyReturnBookingId, setEarlyReturnBookingId] = useState<string | null>(null);
  const [thoiGianTraSom, setThoiGianTraSom] = useState('');
  
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const getStatusColor = (status: string) => {
    const map: Record<string, 'warning'|'info'|'success'|'error'|'default'> = {
      'Cho_Thanh_Toan_Coc': 'warning', 'Cho_Nhan_Xe': 'info', 'Dang_Thue': 'info',
      'Hoan_Tat': 'success', 'Da_Huy': 'error', 'Qua_Han': 'error',
      'Yeu_Cau_Tra_Som': 'warning',
    };
    return map[status] || 'default';
  };

  const handleMockPayment = async (maBooking: string) => {
    try {
      await api.post(`/bookings/${maBooking}/payment/webhook`, null, {
        params: { transaction_id: `MOCK_${Date.now()}`, status: 'SUCCESS' }
      });
      alert('Thanh toán cọc thành công!');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Lỗi thanh toán');
    }
  };

  const handleCancel = async (maBooking: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn này không?')) return;
    try {
      const res = await api.post(`/bookings/${maBooking}/cancel`);
      alert(res.data.message);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Lỗi hủy đơn');
    }
  };

  const handleExtendSubmit = async () => {
    if (!extendBookingId) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/bookings/${extendBookingId}/extend`, null, {
        params: { so_ngay_gia_han: parseInt(soNgayGiaHan) }
      });
      alert(res.data.message);
      setExtendBookingId(null);
      fetchBookings();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Lỗi gia hạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEarlyReturnSubmit = async () => {
    if (!earlyReturnBookingId || !thoiGianTraSom) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/bookings/${earlyReturnBookingId}/early-return`, null, {
        params: { thoi_gian_muon_tra: new Date(thoiGianTraSom).toISOString() }
      });
      alert(res.data.message);
      setEarlyReturnBookingId(null);
      fetchBookings();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Lỗi yêu cầu trả sớm');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;

  return (
    <Box className="container mx-auto p-4">
      <Typography variant="h4" className="font-bold mb-6">Chuyến đi của tôi</Typography>

      {bookings.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography color="textSecondary">Bạn chưa có đơn đặt xe nào.</Typography>
          <Button variant="contained" color="primary" href="/search" className="mt-4">Tìm xe ngay</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead className="bg-slate-800">
              <TableRow>
                {['Mã Đơn','Mã Xe','Nhận xe','Trả xe','Tổng tiền','Trạng thái','Hành động'].map(h => (
                  <TableCell key={h} className="font-bold text-white">{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.MaBooking} hover>
                  <TableCell className="font-mono text-xs">{b.MaBooking}</TableCell>
                  <TableCell>{b.MaXe}</TableCell>
                  <TableCell>{new Date(b.ThoiGianNhan).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{new Date(b.ThoiGianTra).toLocaleString('vi-VN')}</TableCell>
                  <TableCell className="font-semibold text-blue-700">
                    {(b.TongThanhToan || b.TongTienThue || 0).toLocaleString()} ₫
                  </TableCell>
                  <TableCell>
                    <Chip label={b.TrangThaiBooking.replace(/_/g,' ')} size="small" color={getStatusColor(b.TrangThaiBooking)} />
                  </TableCell>
                  <TableCell>
                    <Box className="flex flex-col gap-1 py-1">
                      {b.TrangThaiBooking === 'Cho_Thanh_Toan_Coc' && (
                        <>
                          <Button variant="contained" color="warning" size="small" onClick={() => handleMockPayment(b.MaBooking)}>
                            💳 Thanh toán Cọc
                          </Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(b.MaBooking)}>
                            Hủy đơn
                          </Button>
                        </>
                      )}
                      {b.TrangThaiBooking === 'Cho_Nhan_Xe' && (
                        <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(b.MaBooking)}>
                          Hủy đơn
                        </Button>
                      )}
                      {b.TrangThaiBooking === 'Dang_Thue' && (
                        <>
                          <Button variant="outlined" color="primary" size="small" onClick={() => { setExtendBookingId(b.MaBooking); setActionError(''); }}>
                            🔄 Gia hạn
                          </Button>
                          <Button variant="outlined" color="warning" size="small" onClick={() => { setEarlyReturnBookingId(b.MaBooking); setActionError(''); }}>
                            ↩ Trả sớm
                          </Button>
                        </>
                      )}
                      {b.TrangThaiBooking === 'Hoan_Tat' && (
                        <Button
                          variant={b.DanhGiaSao !== null ? 'outlined' : 'contained'}
                          color="secondary"
                          size="small"
                          onClick={() => !b.DanhGiaSao && setRatingBookingId(b.MaBooking)}
                          disabled={b.DanhGiaSao !== null}
                          sx={{ opacity: b.DanhGiaSao !== null ? 0.5 : 1 }}
                        >
                          {b.DanhGiaSao !== null ? `⭐ Đã đánh giá (${b.DanhGiaSao}★)` : '⭐ Đánh giá'}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Rating Modal */}
      {ratingBookingId && (
        <RatingModal
          open={!!ratingBookingId}
          maBooking={ratingBookingId}
          onClose={() => setRatingBookingId(null)}
          onSuccess={() => { fetchBookings(); alert('Đánh giá thành công! Cảm ơn bạn.'); }}
        />
      )}

      {/* Extend Modal */}
      <Dialog open={!!extendBookingId} onClose={() => setExtendBookingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold">🔄 Yêu cầu Gia hạn</DialogTitle>
        <DialogContent className="pt-4">
          {actionError && <Alert severity="error" className="mb-4">{actionError}</Alert>}
          <TextField
            label="Số ngày gia hạn"
            type="number"
            value={soNgayGiaHan}
            onChange={(e) => setSoNgayGiaHan(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { min: 1, max: 7 } }}
          />
          <Typography variant="caption" color="textSecondary" className="mt-2 block">
            Tối đa 3 lần gia hạn. Chi phí tính theo đơn giá/ngày hiện tại.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendBookingId(null)} disabled={actionLoading}>Hủy</Button>
          <Button onClick={handleExtendSubmit} variant="contained" disabled={actionLoading}>
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận Gia hạn'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Early Return Modal */}
      <Dialog open={!!earlyReturnBookingId} onClose={() => setEarlyReturnBookingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold">↩ Yêu cầu Trả xe sớm</DialogTitle>
        <DialogContent className="pt-4">
          {actionError && <Alert severity="error" className="mb-4">{actionError}</Alert>}
          <TextField
            label="Thời gian muốn trả"
            type="datetime-local"
            fullWidth
            value={thoiGianTraSom}
            onChange={(e) => setThoiGianTraSom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Typography variant="caption" color="textSecondary" className="mt-2 block">
            Phải báo trước tối thiểu 1 tiếng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEarlyReturnBookingId(null)} disabled={actionLoading}>Hủy</Button>
          <Button onClick={handleEarlyReturnSubmit} variant="contained" color="warning" disabled={actionLoading}>
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận Trả sớm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
