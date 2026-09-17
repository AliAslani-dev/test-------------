'use client';

import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

import WarehouseIcon from '@mui/icons-material/Warehouse';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';

import type { MouseEvent } from 'react';

import useText from '@/hooks/useText';

import type { PageMode } from './types';

interface ModeSwitcherProps {
  value: PageMode | null;
  onChange: (value: PageMode) => void;
  tagsDisabled?: boolean;
}

export default function ModeSwitcher({ value, onChange, tagsDisabled = false }: ModeSwitcherProps) {
  const { t } = useText('wholesalers');

  const handleChange = (_: MouseEvent<HTMLElement>, nextValue: PageMode | null) => {
    if (!nextValue) {
      return;
    }

    if (nextValue === 'tags' && tagsDisabled) {
      return;
    }

    onChange(nextValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',

          width: {
            xs: '100%',
            sm: '100%',
            md: 'fit-content',
          },

          maxWidth: '100%',

          p: {
            xs: '10px',
            md: '6px',
          },

          borderRadius: {
            xs: 4,
            md: '999px',
          },

          overflow: 'hidden',

          border: '1px solid rgba(0,0,0,0.10)',

          bgcolor: '#fff',

          backdropFilter: 'blur(14px)',

          boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
        }}
      >
        <ToggleButtonGroup
          exclusive
          value={value}
          onChange={handleChange}
          aria-label="نوع نمایش"
          sx={{
            width: '100%',

            display: {
              xs: 'grid',
              md: 'inline-flex',
            },

            gridTemplateColumns: {
              xs: 'repeat(3, minmax(0, 1fr))',
              md: 'none',
            },

            gap: {
              xs: 0.5,
              sm: 1,
            },

            '& .MuiToggleButtonGroup-grouped': {
              border: 0,

              borderRadius: {
                xs: 3,
                md: '999px !important',
              },

              m: 0,
              minHeight: 40,
            },

            '& .MuiToggleButton-root, & .MuiToggleButton-root.Mui-disabled': {
              border: '0 !important',
            },

            '& .MuiToggleButton-root': {
              position: 'relative',

              width: {
                xs: '100%',
                md: 'auto',
              },

              justifyContent: 'center',

              gap: 0.9,

              px: {
                xs: 0.7,
                sm: 1.4,
                md: 2,
              },

              py: {
                xs: 1,
                md: 0.9,
              },

              fontWeight: 900,

              fontSize: {
                xs: 11,
                sm: 13,
              },

              color: 'rgba(0,0,0,0.62)',

              whiteSpace: 'nowrap',

              transition: 'all 180ms ease',

              '& svg': {
                fontSize: {
                  xs: 17,
                  sm: 18,
                },

                opacity: 0.85,
              },

              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              },
            },

            '& .MuiToggleButton-root.Mui-selected': {
              color: '#fff',
              bgcolor: 'transparent',

              '&::after': {
                content: '""',

                position: 'absolute',

                inset: 0,

                borderRadius: {
                  xs: 3,
                  md: '999px',
                },

                backgroundColor: '#A67C00',

                border: '1px solid rgba(203,175,113,0.45)',

                zIndex: -1,
              },

              '&:hover': {
                bgcolor: 'transparent',
              },

              '& svg': {
                opacity: 1,
              },
            },
          }}
        >
          <ToggleButton value="tags" disabled={tagsDisabled}>
            <LocalOfferRoundedIcon />
            کالکشن‌ها
          </ToggleButton>

          <ToggleButton value="moreSales">
            <WarehouseIcon />

            {t('wholesalers')}
          </ToggleButton>

          <ToggleButton value="approved">
            <VisibilityIcon />

            {t('approved')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
