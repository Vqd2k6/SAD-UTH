import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, TextField, Paper, CircularProgress, 
  Divider, Card, CardContent, 
} from '@mui/material';
import api from '../services/api';
import type { Motorbike, Rating } from '../types';

export default function MotorbikeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bike, setBike] = useState<Motorbike | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [thoiGianNhan, setThoiGianNhan] = useState('');
  const [thoiGianTra, setThoiGianTra] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bikeRes, ratingRes] = await Promise.all([
          api.get(`/motorbikes/${id}`),
          api.get(`/ratings/motorbike/${id}`)
        ]);
        setBike(bikeRes.data);
        setRatings(ratingRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleBook = async () => {
    if (!thoiGianNhan || !thoiGianTra) {
      setBookingError('Vui lòng chọn thời gian nhận và trả xe');
      return;
    }
    
    try {
      setBookingError('');
      await api.post('/bookings/', {
        MaXe: id,
        ThoiGianNhan: new Date(thoiGianNhan).toISOString(),
        ThoiGianTra: new Date(thoiGianTra).toISOString(),
        PhuongThucCoc: 'Chuyen_Khoan'
      });
      alert('Đã tạo đơn đặt xe thành công! Chờ thanh toán cọc.');
      navigate('/my-bookings');
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || 'Lỗi đặt xe');
    }
  };

  if (loading) return <Box className="flex justify-center mt-20"><CircularProgress /></Box>;
  if (!bike) return <Typography align="center" className="mt-20">Không tìm thấy xe</Typography>;

  return (
    <Box className="container mx-auto p-4">
      <Paper className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              src={bike.HinhAnhXe || 'https://via.placeholder.com/400x300?text=Xe+May'} 
              alt={bike.BienSo} 
              className="w-full rounded-lg shadow-md object-cover h-80" 
            />
          </div>
          <div>
            <Typography variant="h4" className="font-bold mb-2">{bike.LoaiXe} - {bike.BienSo}</Typography>
            <Typography variant="h6" color="primary" className="mb-4">
              {bike.DonGiaNgay?.toLocaleString()} VNĐ / ngày
            </Typography>
            <Divider className="my-4" />
            <Typography className="mb-2"><strong>Đời xe:</strong> {bike.DoiXe}</Typography>
            <Typography className="mb-2"><strong>Phân khối:</strong> {bike.PhanKhoi}cc</Typography>
            <Typography className="mb-4"><strong>ODO hiện tại:</strong> {bike.ODOHienTai} km</Typography>
            
            <Box className="bg-blue-50 p-4 rounded-md mt-6">
              <Typography variant="h6" className="mb-4 font-semibold text-blue-800">Đặt xe ngay</Typography>
              <TextField
                fullWidth
                label="Thời gian nhận"
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                className="mb-4"
                value={thoiGianNhan}
                onChange={(e) => setThoiGianNhan(e.target.value)}
              />
              <TextField
                fullWidth
                label="Thời gian trả"
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                className="mb-4"
                value={thoiGianTra}
                onChange={(e) => setThoiGianTra(e.target.value)}
              />
              {bookingError && <Typography color="error" className="mb-4 text-sm">{bookingError}</Typography>}
              {localStorage.getItem('token') ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  onClick={handleBook}
                  disabled={bike.TrangThaiXe !== 'San_Sang'}
                >
                  {bike.TrangThaiXe === 'San_Sang' ? 'Xác nhận Đặt xe' : 'Xe đang bận / bảo dưỡng'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="warning" 
                  fullWidth 
                  size="large"
                  onClick={() => navigate('/login', { state: { from: `/motorbikes/${id}` } })}
                >
                  Đăng nhập để đặt xe
                </Button>
              )}
            </Box>
          </div>
        </div>
      </Paper>

      <Typography variant="h5" className="font-bold mb-4">Đánh giá từ khách hàng</Typography>
      {ratings.length === 0 ? (
        <Typography color="textSecondary">Chưa có đánh giá nào cho xe này.</Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ratings.map((rating) => (
            <Card key={rating.MaDanhGia}>
              <CardContent>
                <Box className="flex justify-between items-center mb-2">
                  <Typography className="font-bold text-yellow-600">⭐ {rating.DiemDanhGia} / 5</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(rating.NgayTao).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body2">{rating.NoiDung}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Box>
  );
}
