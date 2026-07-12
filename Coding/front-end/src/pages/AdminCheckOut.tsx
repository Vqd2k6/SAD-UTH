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
    
    // Validate ODO
    const odo = Number(checkOutData.ODOTra);
    if (isNaN(odo) || odo < 0) {
      setError('Chỉ số ODO trả không được âm');
      return;
    }
    // Validate Helmet count
    const helmets = Number(checkOutData.SoMuBaoHiemTra);
    if (isNaN(helmets) || helmets < 0 || helmets > 2) {
      setError('Số mũ bảo hiểm thu về phải từ 0 đến 2');
      return;
    }
    // Validate Damage fee
    const damageFee = Number(checkOutData.PhiDenBuHuHai);
    if (isNaN(damageFee) || damageFee < 0) {
      setError('Phí đền bù hư hại không được âm');
      return;
    }
    // Validate Reason if fee > 0
    if (damageFee > 0 && !checkOutData.LyDoPhat.trim()) {
      setError('Vui lòng nhập lý do đền bù hư hại');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);
    try {
      const res = await api.post(`/staff/bookings/${maBooking}/check-out`, {
        ...checkOutData,
        ODOTra: odo,
        SoMuBaoHiemTra: helmets,
        PhiDenBuHuHai: damageFee
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
            <Typography variant="h6" className="text-green-800 font-bold mb-4 border-b border-green-200 pb-2">🧾 Hóa Đơn Quyết Toán</Typography>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between"><span>Tiền thuê xe gốc:</span> <span>{result.TongTienThue?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between"><span>Tiền gia hạn (nếu có):</span> <span>{result.TongTienGiaHan?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between text-red-600"><span>Phí trễ hạn:</span> <span>+ {result.PhiTreHan?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between text-red-600"><span>Phí đền bù mũ bảo hiểm:</span> <span>+ {result.PhiMatMu?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between text-red-600"><span>Phí đền bù áo mưa:</span> <span>+ {result.PhiMatAoMua?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between text-red-600"><span>Phí đền bù hư hại:</span> <span>+ {result.PhiDenBuHuHai?.toLocaleString()} VNĐ</span></div>
            </div>
            <div className="border-t border-green-200 pt-2 flex flex-col gap-2">
              <div className="flex justify-between font-bold text-lg"><span>Tổng quyết toán:</span> <span>{result.TongQuyetToan?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between text-green-700"><span>Đã đặt cọc:</span> <span>- {result.TienCocDaDong?.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between text-red-700 font-bold text-xl mt-2 border-t border-red-200 pt-2">
                <span>Khách Cần Thanh Toán Thêm:</span> 
                <span>{result.SoTienCanThuThemHoacHoanTra > 0 ? result.SoTienCanThuThemHoacHoanTra?.toLocaleString() : 0} VNĐ</span>
              </div>
              {result.SoTienCanThuThemHoacHoanTra < 0 && (
                <div className="flex justify-between text-blue-700 font-bold text-xl mt-2">
                  <span>Cửa Hàng Cần Hoàn Trả Khách:</span> 
                  <span>{Math.abs(result.SoTienCanThuThemHoacHoanTra)?.toLocaleString()} VNĐ</span>
                </div>
              )}
            </div>
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
                <MenuItem value="1_Phan_4">1/4 Bình</MenuItem>
                <MenuItem value="1_Phan_2">1/2 Bình</MenuItem>
                <MenuItem value="3_Phan_4">3/4 Bình</MenuItem>
                <MenuItem value="Gan_Het">Gần Hết (Rỗng)</MenuItem>
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
