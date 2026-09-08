'use client';

import { useRouter } from 'next/navigation';
import { DrawerItemType } from '../../data';
import { TwoFStatusDTO } from '@/api/auth/dto';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { removeToken } from '@/utils/auth';
import useDashboard from '../../../../../hooks/useDashboard';
import { USER_ROLES } from '@/constants/roles';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import SX, {
  getListItemTextStyles,
  getListItemButtonStyles,
  getListItemIconContainerStyles,
} from './styles';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNotification } from '@/hooks/useNotification';
import { getProfile, toggleStoreStatus } from '@/api/profile/service';
import DatePicker from '@/components/shared/date-picker';

interface DrawerClickableListProps {
  items: DrawerItemType[];
  open: boolean;
}

const CLOSED_TOGGLE_KEY = 'closedToggle';

const DrawerClickableList: FunctionComponent<DrawerClickableListProps> = ({ items, open }) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { hasRole } = useDashboard();
  const isProvider = hasRole(USER_ROLES.PROVIDER);

  const [profileLoading, setProfileLoading] = useState(false);
  const [isStoreClosed, setIsStoreClosed] = useState<boolean>(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingNextValue, setPendingNextValue] = useState<boolean | null>(null);

  const [openingTime, setOpeningTime] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!isProvider) return;

    let alive = true;

    (async () => {
      try {
        setProfileLoading(true);
        const profile = await getProfile();
        if (!alive) return;

        setIsStoreClosed(Boolean(profile?.closed));
      } catch (e) {
        console.error('getProfile failed', e);
      } finally {
        if (alive) setProfileLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isProvider]);

  const doToggle = async (nextValue: boolean) => {
    if (profileLoading || toggleLoading) return;

    try {
      setToggleLoading(true);

      const closedStatus = nextValue ? 1 : 0;
      const timeToOpen =
        nextValue && openingTime
          ? `${openingTime.getFullYear()}-${String(openingTime.getMonth() + 1).padStart(2, '0')}-${String(openingTime.getDate()).padStart(2, '0')}`
          : undefined;

      await toggleStoreStatus(closedStatus, timeToOpen);

      setIsStoreClosed(nextValue);
      showNotification('وضعیت فروشگاه با موفقیت تغییر کرد', 'success');
    } catch (e) {
      console.error('Store status toggling failed', e);
      showNotification('خطا در تغییر وضعیت فروشگاه', 'error');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleItemClick = (item: DrawerItemType) => {
    if (item.title_en === CLOSED_TOGGLE_KEY) {
      if (!isProvider) return;

      const nextValue = !isStoreClosed;
      setPendingNextValue(nextValue);
      setOpeningTime(undefined);
      setConfirmOpen(true);
      return;
    }

    if (item.title_en === 'logout') {
      removeToken();
      router.replace('/login');
      return;
    }
  };

  const dynamicItems = useMemo<DrawerItemType[]>(() => {
    const visibleItems = isProvider
      ? items
      : items.filter((it) => it.title_en !== CLOSED_TOGGLE_KEY);

    if (!isProvider) return visibleItems;

    return visibleItems.map((item) => {
      if (item.title_en !== CLOSED_TOGGLE_KEY) return item;

      if (isStoreClosed) {
        return {
          ...item,
          title: { ...item.title, fa: 'وضعیت (بسته)' },
          icon: LockIcon,
          color: '#DE0000',
          bgColor: '#FCDFDF',
          iconColor: '#DE0000',
          iconBgColor: '#fff',
        };
      }

      return {
        ...item,
        title: { ...item.title, fa: 'وضعیت (باز)' },
        icon: LockOpenIcon,
        color: '#0A7D3B',
        bgColor: '#DFF7E6',
        iconColor: '#0A7D3B',
        iconBgColor: '#fff',
      };
    });
  }, [items, isProvider, isStoreClosed]);

  return (
    <>
      <List sx={SX.list}>
        {dynamicItems.map((item) => {
          const isToggleItem = item.title_en === CLOSED_TOGGLE_KEY;
          const isLoading = isToggleItem && (profileLoading || toggleLoading);

          return (
            <ListItem key={item.title_en} disablePadding sx={SX.list_item}>
              <ListItemButton
                disableRipple
                disableTouchRipple
                sx={getListItemButtonStyles(open, item.bgColor)}
                onClick={() => handleItemClick(item)}
                disabled={isLoading}
              >
                <ListItemIcon sx={SX.list_item_icon}>
                  <Box sx={getListItemIconContainerStyles(open, item.iconBgColor, item.bgColor)}>
                    {isLoading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <item.icon sx={{ color: item.iconColor, height: '24px', width: '24px' }} />
                    )}
                  </Box>
                </ListItemIcon>

                <ListItemText
                  color={item.color}
                  primary={item.title.fa}
                  sx={getListItemTextStyles(open)}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (toggleLoading) return;
          setConfirmOpen(false);
          setPendingNextValue(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {pendingNextValue === true ? 'تایید بستن فروشگاه' : 'تایید باز کردن فروشگاه'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ mb: 2 }}>
            {pendingNextValue === true
              ? 'با بستن موقت فروشگاه، محصولات شما دیگر برای فروش نمایش داده نمی‌شوند. آیا از اعمال این تغییر مطمئن هستید؟'
              : 'آیا مطمئن هستید می‌خواهید فروشگاه را باز کنید؟'}
          </Typography>

          {pendingNextValue === true && (
            <Box sx={{ mb: 3, mt: 2 }}>
              <DatePicker
                value={openingTime}
                setValue={setOpeningTime}
                title={'تاریخ بازگشایی خودکار (اختیاری)'}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pb: 1 }}>
            <LoadingButton
              variant="outlined"
              disabled={toggleLoading}
              sx={{
                borderColor: '#A67C00',
                color: 'black',
                ':hover': {
                  backgroundColor: 'rgb(233, 233, 233)',
                },
              }}
              onClick={() => {
                setConfirmOpen(false);
                setPendingNextValue(null);
              }}
            >
              انصراف
            </LoadingButton>

            <LoadingButton
              variant="contained"
              loading={toggleLoading}
              disabled={toggleLoading}
              sx={{
                backgroundColor: '#A67C00',
                boxShadow: 0,
                ':hover': {
                  boxShadow: 0,
                  backgroundColor: '#8c6800',
                },
              }}
              onClick={async () => {
                if (pendingNextValue === null) return;
                setConfirmOpen(false);
                const next = pendingNextValue;
                setPendingNextValue(null);
                await doToggle(next);
              }}
            >
              تأیید
            </LoadingButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DrawerClickableList;
