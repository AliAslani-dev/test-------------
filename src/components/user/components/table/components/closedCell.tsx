'use client';

import { UserTable } from '..';
import useText from '@/hooks/useText';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import DatePicker from '@/components/shared/date-picker';
import { useNotification } from '@/hooks/useNotification';
import { providerToggleStoreStatus } from '@/api/admin/user/service';
import { Chip, Tooltip, Dialog, DialogTitle, DialogContent, Typography, Box } from '@mui/material';

type Props = {
  value: boolean;
  row: UserTable;
  onLocalClosedToggle?: (id: number, next: boolean) => void;
};

export default function UserTableClosedCell({ value, row, onLocalClosedToggle }: Props) {
  const { t } = useText('user');
  const { showNotification } = useNotification();

  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [openingTime, setOpeningTime] = useState<Date | undefined>(undefined);

  const next = useMemo(() => !value, [value]);

  const confirmText = next
    ? 'با بستن موقت فروشگاه، محصولات شما دیگر برای فروش نمایش داده نمی‌شوند. آیا از اعمال این تغییر مطمئن هستید؟'
    : 'آیا مطمئن هستید می‌خواهید فروشگاه را باز کنید؟';

  return (
    <>
      <Tooltip title={value ? t('table.opening') : t('table.closing')} placement="right-start">
        <span>
          <Chip
            size="small"
            label={busy ? '...' : value ? t('table.close') : t('table.open')}
            variant="outlined"
            clickable={!busy}
            onClick={() => {
              if (busy) return;
              setOpeningTime(undefined);
              setConfirmOpen(true);
            }}
            sx={{
              color: !value ? 'green' : 'red',
              borderColor: !value ? 'green' : 'red',
              cursor: busy ? 'default' : 'pointer',
              width: '72px',
            }}
          />
        </span>
      </Tooltip>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (busy) return;
          setConfirmOpen(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{next === true ? 'تایید بستن فروشگاه' : 'تایید باز کردن فروشگاه'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ mb: 2 }}>{confirmText}</Typography>

          {next === true && (
            <Box sx={{ mb: 3, mt: 2 }}>
              <DatePicker
                value={openingTime}
                setValue={setOpeningTime}
                title="تاریخ بازگشایی خودکار (اختیاری)"
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pb: 1 }}>
            <LoadingButton
              variant="outlined"
              disabled={busy}
              onClick={() => setConfirmOpen(false)}
              sx={{
                borderColor: '#A67C00',
                color: 'black',
                ':hover': {
                  backgroundColor: 'rgb(233, 233, 233)',
                },
              }}
            >
              انصراف
            </LoadingButton>

            <LoadingButton
              variant="contained"
              loading={busy}
              sx={{
                backgroundColor: '#A67C00',
                boxShadow: 0,
                ':hover': {
                  boxShadow: 0,
                  backgroundColor: '#8c6800',
                },
              }}
              onClick={async () => {
                if (busy) return;

                setBusy(true);
                try {
                  const closedStatus = next ? 1 : 0;
                  const timeToOpen =
                    next && openingTime
                      ? `${openingTime.getFullYear()}-${String(openingTime.getMonth() + 1).padStart(2, '0')}-${String(openingTime.getDate()).padStart(2, '0')}`
                      : undefined;

                  await providerToggleStoreStatus(row.id, closedStatus, timeToOpen);

                  onLocalClosedToggle?.(row.id, next);

                  showNotification(t('table.status_toggle_success_notification'), 'success');
                  setConfirmOpen(false);
                } catch (e) {
                  showNotification(t('table.status_toggle_error_notification'), 'error');
                } finally {
                  setBusy(false);
                }
              }}
            >
              تأیید
            </LoadingButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
