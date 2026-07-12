import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button,  MenuItem, Alert 
} from '@mui/material';
import api from '../services/api';
import type { User } from '../types';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [hangGPLX, setHangGPLX] = useState('');
  const [soGPLX, setSoGPLX] = useState('');
  const [anhMatTruoc, setAnhMatTruoc] = useState('');
  const [anhMatSau, setAnhMatSau] = useState('');
  const [message, setMessage] = useState('');

  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [cccd, setCccd] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setHangGPLX(res.data.HangGPLX || '');
      setSoGPLX(res.data.SoGPLX || '');
      setHoTen(res.data.HoTen || '');
      setSoDienThoai(res.data.SoDienThoai || '');
      setEmail(res.data.Email || '');
      setCccd(res.data.CCCD || '');
      setDiaChi(res.data.DiaChi || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileMessage('');
    
    // Validate name
    if (hoTen.trim().length < 2) {
      setProfileMessage('Họ tên phải từ 2 đến 100 ký tự');
      return;
    }
    // Validate phone
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(soDienThoai.trim())) {
      setProfileMessage('Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0');
      return;
    }
    // Validate email
    if (email.trim()) {
      const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (!emailRegex.test(email.trim())) {
        setProfileMessage('Email không đúng định dạng');
        return;
      }
    }
    // Validate CCCD
    if (cccd.trim()) {
      const cccdRegex = /^\d{12}$/;
      if (!cccdRegex.test(cccd.trim())) {
        setProfileMessage('CCCD phải gồm đúng 12 chữ số');
        return;
      }
    }

    try {
      await api.put('/users/me', {
        HoTen: hoTen,
        SoDienThoai: soDienThoai,
        Email: email,
        CCCD: cccd,
        DiaChi: diaChi
      });
      setProfileMessage('Cập nhật thông tin thành công!');
      setIsEditingProfile(false);
      fetchProfile();
    } catch (err: any) {
      setProfileMessage(err.response?.data?.detail || 'Lỗi cập nhật thông tin');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFileString: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileString(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateGPLX = async () => {
    setMessage('');
    if (!hangGPLX || !soGPLX || !anhMatTruoc || !anhMatSau) {
      setMessage('Vui lòng điền đủ thông tin và upload đầy đủ ảnh');
      return;
    }

    // Validate SoGPLX
    const gplxRegex = /^\d{12}$/;
    if (!gplxRegex.test(soGPLX.trim())) {
      setMessage('Số GPLX phải gồm đúng 12 chữ số');
      return;
    }

    try {
      await api.put('/users/me/gplx', {
        HangGPLXKhaiBao: hangGPLX,
        SoGPLX: soGPLX,
        AnhGPLXMatTruoc: anhMatTruoc,
        AnhGPLXMatSau: anhMatSau
      });
      setMessage('Cập nhật GPLX thành công!');
      fetchProfile();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Lỗi cập nhật GPLX');
    }
  };

  if (!user) return null;

  return (
    <Box className="container mx-auto p-4 max-w-4xl">
      <Typography variant="h4" className="font-bold mb-6">Trang Cá Nhân</Typography>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Paper className="p-6 h-full flex flex-col">
            <Box className="flex justify-between items-center border-b pb-2 mb-4">
              <Typography variant="h6" className="font-bold">Thông tin tài khoản</Typography>
              {!isEditingProfile ? (
                <Button size="small" variant="outlined" onClick={() => setIsEditingProfile(true)}>Sửa</Button>
              ) : (
                <Box>
                  <Button size="small" color="error" onClick={() => setIsEditingProfile(false)} className="mr-2">Hủy</Button>
                  <Button size="small" variant="contained" onClick={handleUpdateProfile}>Lưu</Button>
                </Box>
              )}
            </Box>

            {profileMessage && <Alert severity={profileMessage.includes('thành công') ? "success" : "error"} className="mb-4">{profileMessage}</Alert>}

            {!isEditingProfile ? (
              <>
                <Typography className="mb-2"><strong>Họ và tên:</strong> {user.HoTen}</Typography>
                <Typography className="mb-2"><strong>Số điện thoại:</strong> {user.SoDienThoai}</Typography>
                <Typography className="mb-2"><strong>Email:</strong> {user.Email || 'Chưa cập nhật'}</Typography>
                <Typography className="mb-2"><strong>CCCD:</strong> {user.CCCD || 'Chưa cập nhật'}</Typography>
                <Typography className="mb-2"><strong>Địa chỉ:</strong> {user.DiaChi || 'Chưa cập nhật'}</Typography>
                <Typography className="mb-2"><strong>Quyền thuê xe:</strong> {user.NhomXeDuocThue}</Typography>
                <Typography className="mb-2"><strong>Trạng thái GPLX:</strong> {user.TrangThaiGPLX}</Typography>
              </>
            ) : (
              <Box className="flex flex-col gap-3">
                <TextField size="small" label="Họ và tên" value={hoTen} onChange={e => setHoTen(e.target.value)} />
                <TextField size="small" label="Số điện thoại" value={soDienThoai} onChange={e => setSoDienThoai(e.target.value)} />
                <TextField size="small" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField size="small" label="CCCD" value={cccd} onChange={e => setCccd(e.target.value)} />
                <TextField size="small" label="Địa chỉ" value={diaChi} onChange={e => setDiaChi(e.target.value)} multiline rows={2} />
              </Box>
            )}
          </Paper>
        </div>
        
        <div>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4 font-bold border-b pb-2">Cập nhật Bằng Lái Xe</Typography>
            {message && <Alert severity={message.includes('thành công') ? "success" : "error"} className="mb-4">{message}</Alert>}
            
            <TextField
              select
              fullWidth
              label="Hạng GPLX"
              value={hangGPLX}
              onChange={(e) => setHangGPLX(e.target.value)}
              className="mb-4"
            >
              <MenuItem value="A1">Hạng A1 (Dưới 175cc)</MenuItem>
              <MenuItem value="A2">Hạng A2 (Trên 175cc)</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Số GPLX"
              value={soGPLX}
              onChange={(e) => setSoGPLX(e.target.value)}
              className="mb-4"
              placeholder="Nhập 12 số GPLX"
            />

            <Box className="mb-4">
              <Typography variant="body2" className="mb-1 text-gray-600">Ảnh mặt trước GPLX</Typography>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, setAnhMatTruoc)} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {anhMatTruoc && <img src={anhMatTruoc} alt="Mặt trước" className="mt-2 h-24 object-cover rounded" />}
            </Box>

            <Box className="mb-4">
              <Typography variant="body2" className="mb-1 text-gray-600">Ảnh mặt sau GPLX</Typography>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, setAnhMatSau)} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {anhMatSau && <img src={anhMatSau} alt="Mặt sau" className="mt-2 h-24 object-cover rounded" />}
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={handleUpdateGPLX}
            >
              Gửi Xác Thực
            </Button>
          </Paper>
        </div>
      </div>
    </Box>
  );
}
