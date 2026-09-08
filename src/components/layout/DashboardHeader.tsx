'use client';

import Link from 'next/link';
import Image from 'next/image';
import MuiDrawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import theme from '@/styles/Theme';
import useDashboard from '../../../hooks/useDashboard';
import SliderIcon from '@/components/shared/icon/SliderIcon';
import { SidebarContent } from './DashboardSidebar';
import SX from './styles';

interface DashboardHeaderProps {
  variant: 'mobile' | 'desktop';
}

export default function DashboardHeader({ variant }: DashboardHeaderProps) {
  const { email, mobileDrawerOpen, setMobileDrawerOpen, setDesktopDrawerOpen } = useDashboard();

  if (variant === 'mobile') {
    return (
      <>
        <AppBar data-table-top-boundary position="fixed" sx={SX.mobile_app_bar}>
          <Toolbar disableGutters>
            <Box sx={SX.mobile_app_bar_wrapper}>
              <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: 'inherit' }}>
                <MenuIcon />
              </IconButton>
              <Link href="/dashboard">
                <Image
                  src="/logos/ZarHubEnIcon.png"
                  alt="ZarHub Logo"
                  width={113}
                  height={48.5}
                  style={{ marginRight: '4px', marginTop: '8px' }}
                />
              </Link>
            </Box>
          </Toolbar>
        </AppBar>

        <Toolbar />

        <MuiDrawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: 320, backgroundImage: 'none' } }}
        >
          <Box
            sx={{ minWidth: 320, height: '100%' }}
            role="presentation"
            onKeyDown={() => setMobileDrawerOpen(false)}
          >
            <Box sx={SX.lists_wrapper}>
              <SidebarContent open={mobileDrawerOpen} setOpen={setMobileDrawerOpen} />
            </Box>
          </Box>
        </MuiDrawer>
      </>
    );
  }

  return (
    <Box data-table-top-boundary sx={SX.top_fix_header}>
      <IconButton
        edge="start"
        color="inherit"
        sx={{ backgroundColor: theme.palette.grey[200] }}
        onClick={() => setDesktopDrawerOpen((v) => !v)}
        aria-label="toggle sidebar"
      >
        <SliderIcon />
      </IconButton>
      {email && (
        <Box
          sx={{
            backgroundColor: theme.palette.grey[200],
            padding: '8px 16px',
            borderRadius: '100px',
          }}
        >
          <Typography sx={{ fontSize: '14px', fontWeight: 500, cursor: 'default' }}>
            {email}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
