import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Rating, Typography, Box, Alert
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import api from '../services/api';

interface RatingModalProps {
  open: boolean;
  maBooking: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({ open, maBooking, onClose, onSuccess }: RatingModalProps) {
  const [diem, setDiem] = useState<number | null>(5);
  const [noiDung, setNoiDung] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!diem) {
      setError('Vui lòng chọn số sao');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/ratings/', {
        MaBooking: maBooking,
        DiemDanhGia: diem,
        NoiDung: noiDung || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lỗi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold text-lg border-b">
        ⭐ Đánh giá chuyến đi
      </DialogTitle>
      <DialogContent className="pt-6 pb-4">
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        <Typography variant="body2" color="textSecondary" className="mb-4">
          Mã đơn: <strong>{maBooking}</strong>
        </Typography>

        <Box className="flex flex-col items-center gap-4 py-4">
          <Typography className="font-semibold">Bạn đánh giá chuyến đi thế nào?</Typography>
          <Rating
            value={diem}
            onChange={(_, newValue) => setDiem(newValue)}
            size="large"
            emptyIcon={<StarIcon fontSize="inherit" />}
          />
          <Typography variant="caption" color="textSecondary">
            {diem === 5 ? 'Tuyệt vời!' : diem === 4 ? 'Rất tốt' : diem === 3 ? 'Bình thường' : diem === 2 ? 'Chưa hài lòng' : 'Rất tệ'}
          </Typography>
        </Box>

        <TextField
          label="Nhận xét của bạn (tùy chọn)"
          multiline
          rows={3}
          fullWidth
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          placeholder="Xe đẹp, phục vụ tốt..."
          className="mt-2"
        />
      </DialogContent>
      <DialogActions className="p-4 gap-2">
        <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
