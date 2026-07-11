import { useState, useEffect } from 'react';
import { Typography, Card, CardContent, CardMedia, Box, Container, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../services/api';
import type { Motorbike } from '../types';
import { useNavigate } from 'react-router-dom';

// Moto touring images
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1558981001-1995369a39cd?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1449426468159-d96bd59d6189?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'
];

const Search = () => {
  const [bikes, setBikes] = useState<Motorbike[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<Motorbike[]>([]);
  const [loading, setLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  
  // Filter state
  const [searchText, setSearchText] = useState<string>('');
  const [filterLoaiXe, setFilterLoaiXe] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');

  const navigate = useNavigate();

  // Background carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial bikes
  useEffect(() => {
    const fetchInitialBikes = async () => {
      setLoading(true);
      try {
        const res = await api.get('/motorbikes/all');
        const availableBikes = res.data.filter((b: Motorbike) => b.TrangThaiXe === 'San_Sang');
        
        // Fetch rating summaries
        const bikesWithRatings = await Promise.all(
          availableBikes.map(async (bike: Motorbike) => {
            try {
              const summaryRes = await api.get(`/ratings/motorbike/${bike.MaXe}/summary`);
              return { ...bike, ratingSummary: summaryRes.data };
            } catch (err) {
              return bike;
            }
          })
        );
        
        setBikes(bikesWithRatings);
        setFilteredBikes(bikesWithRatings);
      } catch (error) {
        console.error('Error fetching initial bikes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialBikes();
  }, []);

  // Handle filtering and sorting
  useEffect(() => {
    let result = [...bikes];

    // Filter by type
    if (filterLoaiXe !== 'all') {
      result = result.filter(b => b.LoaiXe === filterLoaiXe);
    }
    
    // Filter by search text
    if (searchText.trim() !== '') {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(b => 
        b.TenXe.toLowerCase().includes(lowerSearch) || 
        b.HangXe.toLowerCase().includes(lowerSearch) || 
        b.BienSo.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.DonGiaNgay - b.DonGiaNgay);
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => b.DonGiaNgay - a.DonGiaNgay);
    }

    setFilteredBikes(result);
  }, [filterLoaiXe, sortOrder, searchText, bikes]);

  const handleViewDetail = (id: string) => {
    navigate(`/motorbikes/${id}`);
  };

  const getLoaiXeLabel = (loai: string) => {
    if (loai === 'Xe_Ga') return 'Tay Ga';
    if (loai === 'Xe_So') return 'Xe Số';
    if (loai === 'Xe_Con_Tay') return 'Côn Tay';
    return loai;
  };

  return (
    <Box className="flex flex-col w-full min-h-screen bg-gray-50 pb-20">
      {/* Hero Banner with Carousel */}
      <Box 
        className="relative flex flex-col justify-center items-center w-full h-[400px] transition-all duration-1000 ease-in-out bg-cover bg-center"
        sx={{
          backgroundImage: `url(${HERO_IMAGES[bgIndex]})`,
        }}
      >
        <Box className="absolute inset-0 bg-black/40" />
        
        <Container className="relative z-10 flex flex-col items-center h-full justify-center">
          <Typography variant="h2" className="text-white font-extrabold text-shadow-lg text-center drop-shadow-2xl">
            ThueXeUTH
          </Typography>
          <Typography variant="h4" className="text-white font-medium mt-4 text-shadow-md text-center italic">
            "Vi vu trên các cung đường"
          </Typography>
        </Container>
      </Box>

      <Container className="pt-8">
        {/* Filter Bar */}
        <Box className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Box className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Chip 
              label="Tất cả" 
              clickable 
              color={filterLoaiXe === 'all' ? 'success' : 'default'} 
              onClick={() => setFilterLoaiXe('all')}
            />
            <Chip 
              label="Xe Ga" 
              clickable 
              color={filterLoaiXe === 'Xe_Ga' ? 'success' : 'default'} 
              onClick={() => setFilterLoaiXe('Xe_Ga')}
            />
            <Chip 
              label="Xe Số" 
              clickable 
              color={filterLoaiXe === 'Xe_So' ? 'success' : 'default'} 
              onClick={() => setFilterLoaiXe('Xe_So')}
            />
            <Chip 
              label="Côn Tay" 
              clickable 
              color={filterLoaiXe === 'Xe_Con_Tay' ? 'success' : 'default'} 
              onClick={() => setFilterLoaiXe('Xe_Con_Tay')}
            />
          </Box>
          
          <Box className="w-full md:w-auto flex-1 md:px-4">
             <input
                type="text"
                placeholder="Tìm tên xe, hãng, biển số..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
             />
          </Box>
          
          <Box className="w-full md:w-48">
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Sắp xếp</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOrder}
                label="Sắp xếp"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="default">Mặc định</MenuItem>
                <MenuItem value="price_asc">Giá: Thấp đến Cao</MenuItem>
                <MenuItem value="price_desc">Giá: Cao đến Thấp</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Results Section */}
        {loading ? (
          <Typography className="text-center text-gray-500 my-10">Đang tải dữ liệu...</Typography>
        ) : filteredBikes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBikes.map(bike => (
              <Card 
                key={bike.MaXe}
                className="h-full flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer bg-white" 
                onClick={() => handleViewDetail(bike.MaXe)}
              >
                <Box className="relative">
                  <CardMedia
                    component="img"
                    height="200"
                    image={bike.HinhAnhXe || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&auto=format&fit=crop"}
                    alt={bike.BienSo}
                    className="object-cover h-48 w-full"
                  />
                  {/* Mock tag for UI like the reference image */}
                  <Box className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center w-6 h-6">
                      ⚡
                    </span>
                  </Box>
                  {bike.ratingSummary && bike.ratingSummary.total_rentals >= 10 && (
                    <Box className="absolute bottom-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-tl-xl shadow-sm">
                      🔥 Xe Hot
                    </Box>
                  )}
                </Box>
                
                <CardContent className="flex-grow flex flex-col p-4">
                  {/* Tags */}
                  <Box className="flex gap-2 mb-3">
                    <Chip label="Miễn thế chấp" size="small" className="bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200" />
                    <Chip label="Giao xe tận nơi" size="small" className="bg-orange-50 text-orange-700 text-[10px] font-semibold border border-orange-200" />
                  </Box>

                  {/* Title */}
                  <Typography className="font-bold text-gray-800 text-base uppercase mb-2">
                    {bike.LoaiXe.replace('_', ' ')} {bike.BienSo}
                  </Typography>

                  {/* Sub info */}
                  <Box className="flex gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1">🏍️ {getLoaiXeLabel(bike.LoaiXe)}</span>
                    <span className="flex items-center gap-1">⚙️ {bike.PhanKhoi}cc</span>
                    <span className="flex items-center gap-1">⛽ Xăng</span>
                  </Box>
                  
                  {/* Price & Rating (Mocked rating) */}
                  <Box className="flex justify-between items-end mt-auto">
                    <Box className="flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-gray-700 text-xs font-medium">
                        {bike.ratingSummary && bike.ratingSummary.avg_rating > 0 
                          ? bike.ratingSummary.avg_rating.toFixed(1) 
                          : 'Mới'}
                      </span>
                      {bike.ratingSummary && bike.ratingSummary.total_rentals > 0 && (
                        <>
                          <span className="text-gray-400 text-xs mx-1">•</span>
                          <span className="text-green-600 text-xs">
                            {bike.ratingSummary.total_rentals >= 100 
                              ? '100+ chuyến' 
                              : bike.ratingSummary.total_rentals >= 10 
                                ? '10+ chuyến' 
                                : bike.ratingSummary.total_rentals >= 5 
                                  ? '5+ chuyến' 
                                  : `${bike.ratingSummary.total_rentals} chuyến`}
                          </span>
                        </>
                      )}
                    </Box>
                    <Box className="text-right">
                      <Typography className="text-gray-400 text-xs line-through block">
                        {(bike.DonGiaNgay * 1.1).toLocaleString('vi-VN').replace(/000$/, 'K')}
                      </Typography>
                      <Typography className="font-bold text-green-600 text-lg">
                        {bike.DonGiaNgay.toLocaleString('vi-VN').replace(/000$/, 'K')} <span className="text-xs font-normal text-gray-500">/ngày</span>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Typography variant="h6" className="text-center text-gray-500 mt-10">
            Không tìm thấy xe máy nào phù hợp với bộ lọc.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default Search;
