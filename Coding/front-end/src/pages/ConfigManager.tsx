import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';
import api from '../services/api';
import type { SystemConfig } from '../types';

export default function ConfigManager() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form states
  const [soLanGiaHanToiDa, setSoLanGiaHanToiDa] = useState<number>(0);
  const [donGiaPhatXeThuong_Gio, setDonGiaPhatXeThuong_Gio] = useState<number>(0);
  const [donGiaPhatXePKL_Gio, setDonGiaPhatXePKL_Gio] = useState<number>(0);
  const [phatMatMuBaoHiem, setPhatMatMuBaoHiem] = useState<number>(0);
  const [phatMatAoMua, setPhatMatAoMua] = useState<number>(0);
  const [phanTramTangGiaLe, setPhanTramTangGiaLe] = useState<number>(0);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/config/');
      const data: SystemConfig = res.data;
      setSoLanGiaHanToiDa(data.SoLanGiaHanToiDa || 0);
      setDonGiaPhatXeThuong_Gio(data.DonGiaPhatXeThuong_Gio || 0);
      setDonGiaPhatXePKL_Gio(data.DonGiaPhatXePKL_Gio || 0);
      setPhatMatMuBaoHiem(data.PhatMatMuBaoHiem || 0);
      setPhatMatAoMua(data.PhatMatAoMua || 0);
      setPhanTramTangGiaLe(data.PhanTramTangGiaLe || 0);
    } catch (err) {
      console.error(err);
      setMessage('Không thể tải cấu hình hệ thống');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleUpdateConfig = async () => {
    try {
      setMessage('');
      setIsError(false);
      await api.put('/config/', {
        SoLanGiaHanToiDa: Number(soLanGiaHanToiDa),
        DonGiaPhatXeThuong_Gio: Number(donGiaPhatXeThuong_Gio),
        DonGiaPhatXePKL_Gio: Number(donGiaPhatXePKL_Gio),
        PhatMatMuBaoHiem: Number(phatMatMuBaoHiem),
        PhatMatAoMua: Number(phatMatAoMua),
        PhanTramTangGiaLe: Number(phanTramTangGiaLe)
      });
      setMessage('Cập nhật cấu hình thành công!');
      fetchConfig();
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.detail || 'Lỗi khi cập nhật cấu hình');
      setIsError(true);
    }
  };

  if (loading) {
    return <Box className="flex justify-center mt-10"><CircularProgress /></Box>;
  }

  return (
    <Box className="container mx-auto p-4 max-w-2xl">
      <Typography variant="h4" className="font-bold mb-6">Cấu hình Hệ thống</Typography>
      
      <Paper className="p-6">
        {message && (
          <Alert severity={isError ? "error" : "success"} className="mb-6">
            {message}
          </Alert>
        )}
        
        <Box className="flex flex-col gap-4">
          <TextField 
            label="Số lần gia hạn tối đa" 
            type="number"
            value={soLanGiaHanToiDa} 
            onChange={e => setSoLanGiaHanToiDa(Number(e.target.value))} 
            fullWidth 
          />
          <TextField 
            label="Phạt trễ giờ - Xe Thường (VNĐ)" 
            type="number"
            value={donGiaPhatXeThuong_Gio} 
            onChange={e => setDonGiaPhatXeThuong_Gio(Number(e.target.value))} 
            fullWidth 
          />
          <TextField 
            label="Phạt trễ giờ - Xe PKL (VNĐ)" 
            type="number"
            value={donGiaPhatXePKL_Gio} 
            onChange={e => setDonGiaPhatXePKL_Gio(Number(e.target.value))} 
            fullWidth 
          />
          <TextField 
            label="Phạt mất mũ bảo hiểm (VNĐ)" 
            type="number"
            value={phatMatMuBaoHiem} 
            onChange={e => setPhatMatMuBaoHiem(Number(e.target.value))} 
            fullWidth 
          />
          <TextField 
            label="Phạt mất áo mưa (VNĐ)" 
            type="number"
            value={phatMatAoMua} 
            onChange={e => setPhatMatAoMua(Number(e.target.value))} 
            fullWidth 
          />
          <TextField 
            label="Phần trăm tăng giá dịp Lễ/Tết (%)" 
            type="number"
            value={phanTramTangGiaLe} 
            onChange={e => setPhanTramTangGiaLe(Number(e.target.value))} 
            fullWidth 
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleUpdateConfig}
            className="mt-4"
          >
            Lưu Cấu Hình
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
