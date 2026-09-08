'use client';

import { Box, IconButton, InputBase, styled } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

type Size = 'sm' | 'md' | 'lg';

const HEIGHTS: Record<Size, number> = { sm: 48, md: 60, lg: 72 };
const FONTS: Record<Size, number> = { sm: 16, md: 20, lg: 24 };
const SIDE_PAD: Record<Size, number> = { sm: 52, md: 60, lg: 64 };

const SearchInput = styled(InputBase, {
  shouldForwardProp: (p) => p !== 'ownerState',
})<{
  ownerState: { size: Size };
}>(({ theme, ownerState }) => {
  const h = HEIGHTS[ownerState.size];
  const fs = FONTS[ownerState.size];
  const pad = SIDE_PAD[ownerState.size];

  return {
    width: '100%',
    height: h,
    borderRadius: 9999,
    backgroundColor: theme.palette.grey[200],
    padding: `0 ${pad}px`,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: 'none',
    '&:hover': { backgroundColor: theme.palette.grey[200] },
    '&.Mui-focused': {
      backgroundColor: theme.palette.grey[200],
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    '& .MuiInputBase-input': {
      textAlign: 'center',
      fontSize: fs,
      lineHeight: `${h}px`,
      height: `${h}px`,
    },
    '& input::placeholder': {
      fontSize: fs * 0.92,
      color: '#4A4343',
      opacity: 1,
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.grey[200]} inset`,
    },
  };
});

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  size = 'sm',
}: {
  value: string;
  onChange: (val: string) => void;
  onSearch?: (q: string) => void;
  placeholder?: string;
  size?: Size;
}) {
  return (
    <Box position="relative" dir="rtl">
      <SearchInput
        ownerState={{ size }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) onSearch(value.trim());
        }}
        inputProps={{ 'aria-label': 'search' }}
        disabled
      />
      <IconButton
        aria-label="search"
        onClick={() => onSearch?.(value.trim())}
        sx={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <SearchRoundedIcon />
      </IconButton>
    </Box>
  );
}
