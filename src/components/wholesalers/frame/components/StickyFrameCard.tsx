'use client';

import 'swiper/css';
import { tPD } from '@/utils';
import Image from 'next/image';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Box, Typography, Paper, Divider } from '@mui/material';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import VerticalAlignTopRoundedIcon from '@mui/icons-material/VerticalAlignTopRounded';
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded';

const DataRow = ({
  icon,
  label,
  value,
  isHighlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isHighlight?: boolean;
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
      <Box sx={{ color: '#9C7A2B', display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</Typography>
    </Box>
    <Typography
      sx={{
        fontWeight: 800,
        fontSize: '0.95rem',
        color: isHighlight ? '#9C7A2B' : '#1a1a1a',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default function StickyFrameCard({ frame }: { frame: any }) {
  if (!frame) return null;

  const images = frame.covers?.length > 0 ? frame.covers : ['/images/BlurFrame.jpg'];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid #eaeaea',
        bgcolor: 'white',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pt: '100%',
          bgcolor: 'white',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: '#f8f8f8',
              border: '1px solid rgba(0,0,0,0.03)',

              '& .swiper': {
                width: '100%',
                height: '100%',
              },
              '& .swiper-pagination-bullet': {
                backgroundColor: '#ccc',
                opacity: 0.8,
                width: '6px',
                height: '6px',
                transition: 'all 0.3s ease',
              },
              '& .swiper-pagination-bullet-active': {
                backgroundColor: '#9C7A2B',
                opacity: 1,
                width: '20px',
                borderRadius: '4px',
              },
            }}
          >
            <Swiper
              modules={[Pagination, Navigation]}
              pagination={{ clickable: true }}
              navigation={{
                nextEl: '.swiper-custom-next',
                prevEl: '.swiper-custom-prev',
              }}
              loop={images.length > 1}
            >
              {images.map((src: string, idx: number) => (
                <SwiperSlide
                  key={idx}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={src}
                      alt={`Frame Image ${idx + 1}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 380px"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>

            {images.length > 1 && (
              <>
                <Box
                  className="swiper-custom-prev"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 8,
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    color: '#444',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#fff',
                      transform: 'translateY(-50%) scale(1.05)',
                      color: '#1a1a1a',
                    },
                    '&.swiper-button-disabled': { opacity: 0.5, cursor: 'default' },
                  }}
                >
                  <ChevronRightRoundedIcon fontSize="small" />
                </Box>

                <Box
                  className="swiper-custom-next"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 8,
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    color: '#444',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#fff',
                      transform: 'translateY(-50%) scale(1.05)',
                      color: '#1a1a1a',
                    },
                    '&.swiper-button-disabled': { opacity: 0.5, cursor: 'default' },
                  }}
                >
                  <ChevronLeftRoundedIcon fontSize="small" />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2.5, bgcolor: '#fafafa' }}>
        <DataRow
          icon={<PercentRoundedIcon fontSize="small" />}
          label="اجرت"
          value={frame.wage ? `${tPD(frame.wage)} %` : '—'}
        />
        <Divider sx={{ opacity: 0.6 }} />

        <DataRow
          icon={<LocalOfferOutlinedIcon fontSize="small" />}
          label="تخفیف"
          value={frame.discount && frame.discount !== '0' ? `${tPD(frame.discount)} %` : '—'}
          isHighlight={!!(frame.discount && frame.discount !== '0')}
        />
        <Divider sx={{ opacity: 0.6 }} />

        <DataRow
          icon={<VerticalAlignBottomRoundedIcon fontSize="small" />}
          label="حداقل وزن"
          value={frame.minWeight ? `${tPD(frame.minWeight)} گرم` : '—'}
        />
        <Divider sx={{ opacity: 0.6 }} />

        <DataRow
          icon={<VerticalAlignTopRoundedIcon fontSize="small" />}
          label="حداکثر وزن"
          value={frame.maxWeight ? `${tPD(frame.maxWeight)} گرم` : '—'}
        />
        <Divider sx={{ opacity: 0.6 }} />

        <DataRow
          icon={<ScaleRoundedIcon fontSize="small" />}
          label="وزن کل"
          value={frame.totalWeight ? `${tPD(frame.totalWeight)} گرم` : '—'}
        />
      </Box>
    </Paper>
  );
}
