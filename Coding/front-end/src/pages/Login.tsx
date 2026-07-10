import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import api from '../services/api';

const Login = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from || '/';

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setError('');
  };

  const getLoginEndpoint = () => {
    if (tabIndex === 0) return '/auth/login/customer';
    if (tabIndex === 1) return '/auth/login/staff';
    return '/auth/login/admin';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const endpoint = getLoginEndpoint();
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      
      if (tabIndex === 0) {
        localStorage.setItem('role', 'Customer');
        navigate(from);
      } else if (tabIndex === 1) {
        localStorage.setItem('role', 'Staff');
        navigate('/admin/check-in');
      } else {
        localStorage.setItem('role', 'Admin');
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex justify-center items-center flex-grow py-12 min-h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50">
      <Paper elevation={4} className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
        <Box className="bg-blue-600 text-white p-6 text-center">
          <Typography variant="h5" className="font-bold">
            Chào mừng trở lại!
          </Typography>
          <Typography variant="body2" className="opacity-80 mt-1">
            Đăng nhập để tiếp tục vào hệ thống
          </Typography>
        </Box>
        
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary" 
          textColor="primary"
          className="border-b"
        >
          <Tab label="Khách Hàng" />
          <Tab label="Nhân Viên" />
          <Tab label="Quản Trị" />
        </Tabs>

        <Box className="p-8">
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <TextField
              label={tabIndex === 0 ? "Email hoặc Số điện thoại" : "Tài khoản nhân sự"}
              variant="outlined"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              className="mt-2 bg-blue-600 hover:bg-blue-700 h-12 shadow-lg"
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ĐĂNG NHẬP'}
            </Button>
            
            {tabIndex === 0 && (
              <Typography variant="body2" className="text-center mt-4 text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                  Đăng ký ngay
                </Link>
              </Typography>
            )}
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
