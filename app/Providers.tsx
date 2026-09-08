'use client';

import React, { useEffect, useState } from 'react';
import theme from '@/styles/Theme';
import { SnackbarProvider } from 'notistack';
import { useMediaQuery } from '@mui/material';
import { LangProvider } from '@/hooks/LanContext';
import { ThemeContextProvider } from '@/hooks/useTheme';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LangProvider>
      <ThemeContextProvider>
        <SnackbarProvider
          style={{ 
            marginTop: mounted && isMobile ? '64px' : 0 
          }}
          maxSnack={4}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {children}
        </SnackbarProvider>
      </ThemeContextProvider>
    </LangProvider>
  );
}