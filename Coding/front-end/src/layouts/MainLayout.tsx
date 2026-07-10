import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box className="min-h-screen flex flex-col bg-gray-50">
      <AppBar position="sticky" elevation={1} className="bg-white text-gray-800" sx={{ top: 0, zIndex: 50, borderBottom: '1px solid #eaeaea' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters className="flex justify-between h-20">
            <Typography variant="h5" component={Link} to="/" className="text-teal-600 no-underline font-extrabold tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-500 border-4 border-teal-200"></span> ThueXeUTH
            </Typography>
            <Box className="flex gap-4 items-center">
              <Button sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }} component={Link} to="/search">
                Tìm Xe
              </Button>
              <Button sx={{ color: 'text.primary', fontWeight: 600, textTransform: 'none' }} component={Link} to="/my-bookings">
                Đơn Của Tôi
              </Button>
              <Button sx={{ color: 'text.primary', fontWeight: 600, textTransform: 'none' }} component={Link} to="/profile">
                Hồ Sơ
              </Button>
              {token ? (
                <Button sx={{ color: 'error.main', fontWeight: 600, textTransform: 'none' }} onClick={handleLogout}>
                  Đăng Xuất
                </Button>
              ) : (
                <Button component={Link} to="/login" variant="outlined" sx={{ borderColor: '#e0e0e0', color: 'text.primary', borderRadius: 2, px: 3, fontWeight: 600, textTransform: 'none' }}>
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Container maxWidth="lg" className="flex-grow py-8 flex flex-col">
        <Outlet />
      </Container>
      
      <Box className="bg-gray-800 text-white py-6 mt-auto">
        <Container maxWidth="lg" className="text-center">
          <Typography variant="body2">
            © 2026 ThueXeUTH. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
