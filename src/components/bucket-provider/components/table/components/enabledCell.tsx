'use client';

import { useState } from 'react';
import useText from '@/hooks/useText';
import { BucketProviderTable } from '..';
import { Chip, Tooltip } from '@mui/material';
import { useNotification } from '@/hooks/useNotification';
import { bucketToggleEnabled } from '@/api/bucket/service';
import { useLang } from '@/hooks/LanContext';

type Props = {
  value: boolean;
  row: BucketProviderTable;
  onLocalToggle?: (id: number, next: boolean) => void;
};

export default function BucketProviderTableEnabledCell({ value, row, onLocalToggle }: Props) {
  const { lang } = useLang();
  const { t } = useText('bucket', lang);
  const { showNotification } = useNotification();
  const [busy, setBusy] = useState(false);

  const next = !value;
  return (
    <Tooltip title={value ? t('table.disabling') : t('table.enabling')} placement={'right-start'}>
      <span>
        <Chip
          size="small"
          label={busy ? '...' : value ? t('table.enable') : t('table.disable')}
          variant="outlined"
          clickable={!busy}
          onClick={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await bucketToggleEnabled(row.id);
              onLocalToggle?.(row.id, next);
              showNotification(t('table.toggle_enabled_success_notification'), 'success');
            } catch (e) {
              showNotification(t('table.toggle_enabled_error_notification'), 'error');
            } finally {
              setBusy(false);
            }
          }}
          sx={{
            color: value ? 'green' : 'red',
            borderColor: value ? 'green' : 'red',
            cursor: busy ? 'default' : 'pointer',
            width: '72px',
          }}
        />
      </span>
    </Tooltip>
  );
}
