'use client';

import { Box, useMediaQuery } from '@mui/material';
import theme from '@/styles/Theme';
import { DashboardProvider } from '../../../contexts/DashboardContext';
import useDashboard from '../../../hooks/useDashboard';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouteGuard } from '../../../hooks/useRouteGuard';
import SX from './styles';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { isLoadingUser, isAuthenticated } = useDashboard();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useRouteGuard();

  // تا وقتی اطلاعات کاربر مشخص نشده، هیچ UI ای بر اساس Role رندر نمی‌شود
  if (isLoadingUser) return <LoadingSpinner />;

  // Session نامعتبر است؛ Provider خودش در حال ریدایرکت به /login است
  if (!isAuthenticated) return <LoadingSpinner />;

  if (isMobile) {
    return (
      <>
        <DashboardHeader variant="mobile" />
        {children}
      </>
    );
  }

  return (
    <Box sx={SX.main_wrapper}>
      <DashboardSidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, pt: 3, px: 3, pb: 3, width: '100%', bgcolor: 'background.paper' }}
      >
        <DashboardHeader variant="desktop" />
        {children}
      </Box>
    </Box>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <LayoutInner>{children}</LayoutInner>
    </DashboardProvider>
  );
}