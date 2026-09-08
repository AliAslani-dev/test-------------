import Link from 'next/link';
import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import { Close } from '@mui/icons-material';
import { DrawerItemType } from '../../data';
import { AdminTab, ProviderTab } from '@/constants';
import SX, {
  getListItemTextStyles,
  getListItemButtonStyles,
  getListItemIconContainerStyles,
  getListStyles,
} from './styles';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { removeToken } from '@/utils/auth';
import useDashboard from '../../../../../hooks/useDashboard';
import { USER_ROLES } from '@/constants/roles';
import { useLang } from '@/hooks/LanContext';

interface DrawerActivableListProps {
  items: DrawerItemType[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: AdminTab | ProviderTab;
}

const DrawerActivableList: FunctionComponent<DrawerActivableListProps> = ({
  items,
  open,
  setOpen,
  activeTab,
}) => {
  const { lang } = useLang();
  const { t } = useText('base', lang);
  const { user } = useDashboard();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <List sx={getListStyles(user?.role === 'banking-provider')}>
      {isMobile && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginInline: '16px',
              py: 0.4,
            }}
          >
            <Typography>{t('accesses')}</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
        </>
      )}
      {items.map(
        (item) =>
          item.link && (
            <ListItem disablePadding sx={SX.list_item} key={item.title.en}>
              <ListItemButton
                component={Link}
                href={item.link}
                disableRipple
                disableTouchRipple
                sx={getListItemButtonStyles(open, activeTab, item.title_en)}
              >
                <ListItemIcon sx={SX.list_item_icon}>
                  <Box sx={getListItemIconContainerStyles(open, activeTab, item.title_en)}>
                    <item.icon
                      sx={{
                        color: open ? 'black' : activeTab === item.title_en ? 'white' : 'black',
                        height: '20px',
                        width: '20px',
                      }}
                    />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.title.fa}
                  sx={getListItemTextStyles(open, activeTab, item.title_en)}
                />
              </ListItemButton>
            </ListItem>
          ),
      )}
    </List>
  );
};

export default DrawerActivableList;
