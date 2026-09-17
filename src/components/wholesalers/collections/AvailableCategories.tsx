'use client';

import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';

import Image from 'next/image';

import type { AvailableCategoryDTO } from '@/api/zarhub/dto';

interface AvailableCategoriesProps {
  categories: AvailableCategoryDTO[];

  loading: boolean;

  selectedCategoryId: number | null;

  onSelect: (category: AvailableCategoryDTO) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  گردنبند: 'Neckless',

  آویز: 'Pendant',

  بنگل: 'Bangle-2',

  انگشتر: 'Ring',

  زنجیر: 'Chain',

  دستبند: 'Bracelet',

  گوشواره: 'Earrings',

  النگو: 'Bangle-1',

  سکه: 'Coin',

  شمش: 'Bullion',

  سرویس: 'Set',

  'طلای گرمی': 'Gram-2',

  پابند: 'Anklet',

  'آویز ساعت': 'WatchPendant',

  پیرسینگ: 'Piercing-2',

  ست: 'Set',

  'نیم ست': 'Half-Set',

  'سکه بانکی': 'Bank-Coin',
};

export default function AvailableCategories({
  categories,
  loading,
  selectedCategoryId,
  onSelect,
}: AvailableCategoriesProps) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  const isTablet =
    useMediaQuery(theme.breakpoints.down('md'), {
      noSsr: true,
    }) && !isMobile;

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), {
    noSsr: true,
  });

  const visibleCategories = categories.filter((category) => category.faName !== 'سایر');

  const skeletonCount = isDesktop ? 10 : isTablet ? 8 : 6;

  if (!loading && visibleCategories.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-label="دسته‌بندی کالکشن‌ها"
      sx={{
        position: 'relative',

        width: '100%',

        minWidth: 0,

        display: 'flex',

        flexDirection: 'column',

        alignItems: 'center',

        gap: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontSize: {
            xs: '20px',
            sm: '20px',
            md: '22px',
            lg: '26px',
          },

          fontWeight: 800,

          color: '#1a1a1a',
        }}
      >
        دسته‌بندی کالکشن‌ها
      </Typography>

      <Box
        sx={{
          width: '100%',

          minWidth: 0,

          display: 'grid',

          gridTemplateColumns: {
            xs: 'repeat(3, minmax(0, 1fr))',

            sm: 'repeat(3, minmax(0, 1fr))',

            md: 'repeat(4, minmax(0, 1fr))',

            lg: 'repeat(5, minmax(0, 1fr))',
          },

          justifyItems: 'center',

          gap: {
            xs: '10px',
            sm: '16px',
            md: '20px',
          },
        }}
      >
        {loading
          ? Array.from({
              length: skeletonCount,
            }).map((_, index) => (
              <Box
                key={`category-skeleton-${index}`}
                sx={{
                  position: 'relative',

                  width: '100%',

                  maxWidth: {
                    xs: 100,
                    sm: 155,
                    md: 180,
                  },

                  aspectRatio: {
                    xs: '90 / 113',
                    sm: '150 / 177',
                    md: '180 / 226',
                  },

                  bgcolor: '#fff',

                  borderRadius: {
                    xs: '24px',
                    sm: '36px',
                  },

                  p: {
                    xs: '4px',
                    sm: '8px',
                  },

                  overflow: 'hidden',
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    borderRadius: isMobile ? '20px' : '30px',
                  }}
                />
              </Box>
            ))
          : visibleCategories.map((category) => {
              const imageName = CATEGORY_IMAGES[category.faName];

              const selected = selectedCategoryId === category.id;

              return (
                <Box
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelect(category);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();

                      onSelect(category);
                    }
                  }}
                  sx={{
                    position: 'relative',

                    width: '100%',

                    maxWidth: {
                      xs: 100,
                      sm: 155,
                      md: 180,
                    },

                    aspectRatio: {
                      xs: '90 / 113',
                      sm: '150 / 177',
                      md: '180 / 226',
                    },

                    minWidth: 0,

                    bgcolor: '#fff',

                    borderRadius: {
                      xs: '24px',
                      sm: '36px',
                    },

                    p: {
                      xs: '4px',
                      sm: '8px',
                    },

                    display: 'flex',

                    flexDirection: 'column',

                    alignItems: 'center',

                    cursor: 'pointer',

                    border: selected ? '2px solid #A67C00' : '2px solid white',

                    overflow: 'hidden',

                    transition:
                      'transform 0.3s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease',

                    '&:hover': {
                      transform: 'translateY(-2px)',

                      bgcolor: 'rgb(244, 244, 244)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',

                      width: '100%',

                      flex: 1,

                      minHeight: 0,

                      overflow: 'hidden',
                    }}
                  >
                    {imageName ? (
                      <Image
                        src={`/images/categories/${imageName}-Category.jpg`}
                        alt={category.faName}
                        fill
                        sizes="180px"
                        style={{
                          objectFit: 'contain',

                          borderRadius: isMobile ? '20px' : '30px',
                        }}
                      />
                    ) : null}
                  </Box>

                  <Box
                    sx={{
                      height: {
                        xs: 9,
                        sm: 10,
                        md: 14,
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      width: '100%',

                      fontWeight: 700,

                      color: selected ? '#A67C00' : '#1a237e',

                      textAlign: 'center',

                      fontSize: {
                        xs: 12,
                        sm: 14,
                        md: 20,
                      },

                      lineHeight: 1.2,

                      mb: {
                        xs: 0,
                        md: 1,
                      },

                      overflow: 'hidden',

                      textOverflow: 'ellipsis',

                      whiteSpace: 'nowrap',
                    }}
                  >
                    {category.faName}
                  </Typography>
                </Box>
              );
            })}
      </Box>
    </Box>
  );
}
