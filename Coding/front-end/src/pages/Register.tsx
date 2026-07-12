import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, MenuItem } from '@mui/material';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    MatKhau: '',
    CCCD: '',
    HangGPLXKhaiBao: 'Khong'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate name
    if (formData.HoTen.trim().length < 2) {
      setError('Họ tên phải từ 2 đến 100 ký tự');
      return;
    }
    // Validate phone
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.SoDienThoai.trim())) {
      setError('Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0');
      return;
    }
    // Validate email
    if (formData.Email.trim()) {
      const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (!emailRegex.test(formData.Email.trim())) {
        setError('Email không đúng định dạng');
        return;
      }
    }
    // Validate password
    if (formData.MatKhau.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }
    if (formData.MatKhau.length > 72) {
      setError('Mật khẩu không được vượt quá 72 ký tự');
      return;
    }
    // Validate CCCD
    if (formData.CCCD.trim()) {
      const cccdRegex = /^\d{12}$/;
      if (!cccdRegex.test(formData.CCCD.trim())) {
        setError('CCCD phải gồm đúng 12 chữ số');
        return;
      }
    }

    setLoading(true);
    
    // Convert 'Khong' to null for API
    const submitData = {
      ...formData,
      HangGPLXKhaiBao: formData.HangGPLXKhaiBao === 'Khong' ? null : formData.HangGPLXKhaiBao
    };

    try {
      await api.post('/auth/register', submitData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex justify-center items-center flex-grow py-12">
      <Paper elevation={3} className="p-8 max-w-md w-full rounded-xl">
        <Typography variant="h5" className="text-center font-bold mb-6">
          Đăng Ký Tài Khoản
        </Typography>
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <TextField label="Họ Tên" name="HoTen" variant="outlined" fullWidth required value={formData.HoTen} onChange={handleChange} />
          <TextField label="Email" name="Email" type="email" variant="outlined" fullWidth value={formData.Email} onChange={handleChange} />
          <TextField label="Số điện thoại" name="SoDienThoai" variant="outlined" fullWidth required value={formData.SoDienThoai} onChange={handleChange} />
          <TextField label="Mật khẩu" name="MatKhau" type="password" variant="outlined" fullWidth required value={formData.MatKhau} onChange={handleChange} />
          <TextField label="Số CCCD" name="CCCD" variant="outlined" fullWidth value={formData.CCCD} onChange={handleChange} />
          
          <TextField select label="Hạng GPLX (Tùy chọn)" name="HangGPLXKhaiBao" value={formData.HangGPLXKhaiBao} onChange={handleChange} fullWidth>
            <MenuItem value="Khong">Không có</MenuItem>
            <MenuItem value="A1">Hạng A1 (Dưới 175cc)</MenuItem>
            <MenuItem value="A2">Hạng A2 (Trên 175cc)</MenuItem>
          </TextField>

          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} className="mt-2 bg-blue-600 hover:bg-blue-700 h-12">
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Ký'}
          </Button>
          <Typography variant="body2" className="text-center mt-2">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Đăng nhập
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
