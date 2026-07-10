import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import MotorbikeDetail from './pages/MotorbikeDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

import AdminDashboard from './pages/AdminDashboard';
import AdminCheckIn from './pages/AdminCheckIn';
import AdminCheckOut from './pages/AdminCheckOut';
import MotorbikeManager from './pages/MotorbikeManager';
import MaintenanceManager from './pages/MaintenanceManager';
import StaffWorklist from './pages/StaffWorklist';
import CustomerManager from './pages/CustomerManager';
import StaffManager from './pages/StaffManager';
import ConfigManager from './pages/ConfigManager';

const Home = () => <Navigate to="/search" replace />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Public Customer Routes ===== */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="motorbikes/:id" element={<MotorbikeDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Protected Customer Routes (cần đăng nhập) */}
          <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ===== Protected Admin/Staff Routes ===== */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Staff']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="worklist" element={<StaffWorklist />} />
            <Route path="motorbikes" element={<MotorbikeManager />} />
            <Route path="maintenance" element={<MaintenanceManager />} />
            <Route path="check-in" element={<AdminCheckIn />} />
            <Route path="check-out" element={<AdminCheckOut />} />
            <Route path="customers" element={<CustomerManager />} />
            <Route path="staff" element={<StaffManager />} />
            <Route path="config" element={<ConfigManager />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
