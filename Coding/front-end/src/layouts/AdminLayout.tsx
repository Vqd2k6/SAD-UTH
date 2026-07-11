import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import OutputIcon from '@mui/icons-material/Output';
import InputIcon from '@mui/icons-material/Input';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import SettingsIcon from '@mui/icons-material/Settings';
import FactCheckIcon from '@mui/icons-material/FactCheck';

const drawerWidth = 240;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Staff';
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  React.useEffect(() => {
    const path = window.location.pathname;
    const adminOnlyRoutes = ['/admin', '/admin/motorbikes', '/admin/customers', '/admin/staff', '/admin/config'];
    const staffOnlyRoutes = ['/admin/check-in', '/admin/check-out', '/admin/worklist', '/admin/maintenance'];
    
    // If Staff tries to access admin-only routes via URL, redirect them
    if (role === 'Staff' && adminOnlyRoutes.includes(path)) {
      navigate('/admin/check-in', { replace: true });
    }
    
    // If Admin tries to access staff-only operational routes via URL, redirect them
    if (role === 'Admin' && staffOnlyRoutes.includes(path)) {
      navigate('/admin', { replace: true });
    }
  }, [role, navigate]);

  return (
    <Box sx={{ display: 'flex' }} className="min-h-screen bg-gray-100">
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} className="bg-slate-800">
        <Toolbar className="flex justify-between">
          <Typography variant="h6" noWrap component="div" className="font-bold">
            Staff & Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Đăng Xuất</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {role === 'Admin' && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin">
                  <ListItemIcon><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="Tổng quan" />
                </ListItemButton>
              </ListItem>
            )}
            
            {role === 'Staff' && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/check-in">
                    <ListItemIcon><OutputIcon /></ListItemIcon>
                    <ListItemText primary="Giao Xe (Check-in)" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/check-out">
                    <ListItemIcon><InputIcon /></ListItemIcon>
                    <ListItemText primary="Nhận Xe (Check-out)" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/worklist">
                    <ListItemIcon><ListAltIcon /></ListItemIcon>
                    <ListItemText primary="Danh sách Giao Nhận" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/maintenance">
                    <ListItemIcon><BuildIcon /></ListItemIcon>
                    <ListItemText primary="Bảo Dưỡng" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/gplx-review">
                    <ListItemIcon><FactCheckIcon /></ListItemIcon>
                    <ListItemText primary="Duyệt GPLX" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {role === 'Admin' && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/motorbikes">
                    <ListItemIcon><TwoWheelerIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Xe Máy" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/customers">
                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                    <ListItemText primary="Khách Hàng" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/gplx-review">
                    <ListItemIcon><FactCheckIcon /></ListItemIcon>
                    <ListItemText primary="Duyệt GPLX" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/staff">
                    <ListItemIcon><BadgeIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Nhân sự" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/admin/config">
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="Cấu hình Hệ thống" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="pt-20">
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
