import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import api from '../services/api';

const AdminCheckOut: React.FC = () => {
  const [maBooking, setMaBooking] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const [checkOutData, setCheckOutData] = useState({
    ODOTra: 0,
    MucXangTra: 'Day',
    AnhNgoaiQuanTra: '',
    SoMuBaoHiemTra: 2,
    CoAoMuaTra: true,
    PhiDenBuHuHai: 0,
    LyDoPhat: ''
  });

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setCheckOutData({ ...checkOutData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maBooking) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);
    try {
      const res = await api.post(`/staff/bookings/${maBooking}/check-out`, {
        ...checkOutData,
        ODOTra: Number(checkOutData.ODOTra),
        SoMuBaoHiemTra: Number(checkOutData.SoMuBaoHiemTra),
        PhiDenBuHuHai: Number(checkOutData.PhiDenBuHuHai)
      });
      setSuccess(res.data.message);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lỗi Check-out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-2xl mx-auto">
      <Paper elevation={2} className="p-8">
        <Typography variant="h5" className="font-bold mb-6">Nghiệp vụ Nhận Xe (Check-out & Quyết toán)</Typography>
        
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        {success && <Alert severity="success" className="mb-4">{success}</Alert>}
        
        {result && (
          <Box className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Typography variant="h6" className="text-green-800 font-bold mb-2">Hóa Đơn Quyết Toán</Typography>
            <Typography variant="body1">Tổng quyết toán: <b>{result.TongQuyetToan?.toLocaleString()} VNĐ</b></Typography>
            <Typography variant="body1" className="text-red-600 mt-2">
              Khách Cần Thanh Toán Thêm (đã trừ cọc): <b>{result.SoTienCanThuThemHoacHoanTra?.toLocaleString()} VNĐ</b>
            </Typography>
          </Box>
        )}

        <form onSubmit={handleCheckOut} className="flex flex-col gap-4">
          <TextField 
            label="Mã Đơn Đặt Xe (Booking ID)" 
            variant="outlined" 
            fullWidth 
            required 
            value={maBooking} 
            onChange={(e) => setMaBooking(e.target.value)} 
          />
          
          <Box className="grid grid-cols-2 gap-4 mt-4">
            <TextField label="ODO Trả" name="ODOTra" type="number" required value={checkOutData.ODOTra} onChange={handleChange} />
            <FormControl>
              <InputLabel>Mức Xăng Trả</InputLabel>
              <Select label="Mức Xăng Trả" name="MucXangTra" value={checkOutData.MucXangTra} onChange={handleChange}>
                <MenuItem value="Day">Đầy (100%)</MenuItem>
                <MenuItem value="Mot_Phan_Tu">1/4 Bình</MenuItem>
                <MenuItem value="Mot_Phan_Hai">1/2 Bình</MenuItem>
                <MenuItem value="Ba_Phan_Tu">3/4 Bình</MenuItem>
                <MenuItem value="Rong">Rỗng</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Số mũ bảo hiểm thu lại" name="SoMuBaoHiemTra" type="number" required value={checkOutData.SoMuBaoHiemTra} onChange={handleChange} />
            <FormControlLabel 
              control={<Checkbox name="CoAoMuaTra" checked={checkOutData.CoAoMuaTra} onChange={handleChange} />} 
              label="Thu lại Áo Mưa?" 
            />
            <TextField 
              label="Phí Đền Bù Hư Hại (nếu có)" 
              name="PhiDenBuHuHai" 
              type="number" 
              value={checkOutData.PhiDenBuHuHai} 
              onChange={handleChange} 
              className="col-span-1"
            />
            <TextField 
              label="Lý do phạt / Đền bù" 
              name="LyDoPhat" 
              type="text" 
              value={checkOutData.LyDoPhat} 
              onChange={handleChange} 
              className="col-span-1"
            />
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} className="mt-6 bg-slate-800 hover:bg-slate-900 h-12">
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác Nhận Check-out & Quyết Toán'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminCheckOut;
