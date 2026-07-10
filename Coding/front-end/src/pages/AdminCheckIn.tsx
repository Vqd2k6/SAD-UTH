import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import api from '../services/api';

const AdminCheckIn: React.FC = () => {
  const [maBooking, setMaBooking] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [checkInData, setCheckInData] = useState({
    ODONhan: 0,
    MucXangNhan: 'Day',
    AnhNgoaiQuanNhan: '',
    SoMuBaoHiemGiao: 2,
    CoAoMuaGiao: true,
    KhachGianLanGPLX: false
  });

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setCheckInData({ ...checkInData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maBooking) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/staff/bookings/${maBooking}/check-in`, {
        ...checkInData,
        ODONhan: Number(checkInData.ODONhan),
        SoMuBaoHiemGiao: Number(checkInData.SoMuBaoHiemGiao)
      });
      setSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lỗi Check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-2xl mx-auto">
      <Paper elevation={2} className="p-8">
        <Typography variant="h5" className="font-bold mb-6">Nghiệp vụ Giao Xe (Check-in)</Typography>
        
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        {success && <Alert severity="success" className="mb-4">{success}</Alert>}
        
        <form onSubmit={handleCheckIn} className="flex flex-col gap-4">
          <TextField 
            label="Mã Đơn Đặt Xe (Booking ID)" 
            variant="outlined" 
            fullWidth 
            required 
            value={maBooking} 
            onChange={(e) => setMaBooking(e.target.value)} 
          />
          
          <Box className="grid grid-cols-2 gap-4 mt-4">
            <TextField label="ODO Hiện tại" name="ODONhan" type="number" required value={checkInData.ODONhan} onChange={handleChange} />
            <FormControl>
              <InputLabel>Mức Xăng Giao</InputLabel>
              <Select label="Mức Xăng Giao" name="MucXangNhan" value={checkInData.MucXangNhan} onChange={handleChange}>
                <MenuItem value="Day">Đầy (100%)</MenuItem>
                <MenuItem value="Mot_Phan_Tu">1/4 Bình</MenuItem>
                <MenuItem value="Mot_Phan_Hai">1/2 Bình</MenuItem>
                <MenuItem value="Ba_Phan_Tu">3/4 Bình</MenuItem>
                <MenuItem value="Rong">Rỗng</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Số mũ bảo hiểm giao" name="SoMuBaoHiemGiao" type="number" required value={checkInData.SoMuBaoHiemGiao} onChange={handleChange} />
            <FormControlLabel 
              control={<Checkbox name="CoAoMuaGiao" checked={checkInData.CoAoMuaGiao} onChange={handleChange} />} 
              label="Kèm Áo Mưa?" 
            />
          </Box>
          
          <Box className="p-4 bg-red-50 border border-red-200 rounded mt-4">
            <FormControlLabel 
              control={<Checkbox name="KhachGianLanGPLX" color="error" checked={checkInData.KhachGianLanGPLX} onChange={handleChange} />} 
              label="CẢNH BÁO: Phát hiện Khách Gian Lận GPLX (Sẽ tự động hủy đơn và phạt 100% cọc)" 
              className="text-red-700 font-bold"
            />
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} className="mt-6 bg-slate-800 hover:bg-slate-900 h-12">
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác Nhận Check-in'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminCheckIn;
