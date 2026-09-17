'use client';

import { Box } from '@mui/material';

import { useId } from 'react';

import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';

import { Swiper, SwiperSlide } from 'swiper/react';

import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface BannerSliderProps {
  banners: string[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const swiperId = useId().replace(/:/g, '');

  const prevClass = `tag-banner-prev-${swiperId}`;

  const nextClass = `tag-banner-next-${swiperId}`;

  const safeBanners = Array.isArray(banners) ? banners.filter(Boolean) : [];

  if (safeBanners.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',

        width: '100%',

        minWidth: 0,

        aspectRatio: '4 / 1',

        overflow: 'hidden',

        borderRadius: {
          xs: 2.5,
          md: 3,
        },

        bgcolor: '#f8f8f8',

        '& .swiper': {
          width: '100%',
          height: '100%',
        },

        '& .swiper-slide': {
          width: '100%',
          height: '100%',
        },

        '& .swiper-pagination': {
          bottom: {
            xs: '5px !important',
            md: '8px !important',
          },
        },

        '& .swiper-pagination-bullet': {
          bgcolor: '#ccc',

          opacity: 0.8,

          width: 6,
          height: 6,

          transition: 'all .3s ease',
        },

        '& .swiper-pagination-bullet-active': {
          bgcolor: '#A67C00',

          opacity: 1,

          width: 20,

          borderRadius: 4,
        },
      }}
    >
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={
          safeBanners.length > 1
            ? {
                nextEl: `.${nextClass}`,

                prevEl: `.${prevClass}`,
              }
            : false
        }
        pagination={
          safeBanners.length > 1
            ? {
                clickable: true,
              }
            : false
        }
        loop={safeBanners.length > 1}
        dir="rtl"
      >
        {safeBanners.map((banner, index) => (
          <SwiperSlide key={`${banner}-${index}`}>
            <Box
              component="img"
              src={banner}
              alt={`بنر کالکشن ${index + 1}`}
              loading="lazy"
              sx={{
                display: 'block',

                width: '100%',
                height: '100%',

                objectFit: 'cover',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {safeBanners.length > 1 ? (
        <>
          <Box
            className={prevClass}
            role="button"
            aria-label="اسلاید قبلی"
            sx={{
              position: 'absolute',

              top: '50%',

              right: 8,

              transform: 'translateY(-50%)',

              zIndex: 10,

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              width: {
                xs: 30,
                sm: 34,
              },

              height: {
                xs: 30,
                sm: 34,
              },

              borderRadius: '50%',

              bgcolor: 'rgba(255,255,255,.90)',

              backdropFilter: 'blur(8px)',

              boxShadow: '0 4px 12px rgba(0,0,0,.10)',

              border: '1px solid rgba(0,0,0,.05)',

              cursor: 'pointer',

              color: '#444',

              transition: 'all .2s ease',

              '&:hover': {
                bgcolor: '#fff',

                transform: 'translateY(-50%) scale(1.05)',

                color: '#1a1a1a',
              },

              '&.swiper-button-disabled': {
                opacity: 0.45,

                cursor: 'default',
              },
            }}
          >
            <KeyboardArrowDownRounded
              sx={{
                transform: 'rotate(-90deg)',

                fontSize: 20,
              }}
            />
          </Box>

          <Box
            className={nextClass}
            role="button"
            aria-label="اسلاید بعدی"
            sx={{
              position: 'absolute',

              top: '50%',

              left: 8,

              transform: 'translateY(-50%)',

              zIndex: 10,

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              width: {
                xs: 30,
                sm: 34,
              },

              height: {
                xs: 30,
                sm: 34,
              },

              borderRadius: '50%',

              bgcolor: 'rgba(255,255,255,.90)',

              backdropFilter: 'blur(8px)',

              boxShadow: '0 4px 12px rgba(0,0,0,.10)',

              border: '1px solid rgba(0,0,0,.05)',

              cursor: 'pointer',

              color: '#444',

              transition: 'all .2s ease',

              '&:hover': {
                bgcolor: '#fff',

                transform: 'translateY(-50%) scale(1.05)',

                color: '#1a1a1a',
              },

              '&.swiper-button-disabled': {
                opacity: 0.45,

                cursor: 'default',
              },
            }}
          >
            <KeyboardArrowDownRounded
              sx={{
                transform: 'rotate(90deg)',

                fontSize: 20,
              }}
            />
          </Box>
        </>
      ) : null}
    </Box>
  );
}
