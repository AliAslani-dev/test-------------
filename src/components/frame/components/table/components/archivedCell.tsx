'use client';

import { useState } from 'react';
import { FrameTable } from '..';
import useText from '@/hooks/useText';
import { Chip, Tooltip } from '@mui/material';
import { useNotification } from '@/hooks/useNotification';
import { frameToggleArchive, frameToggleUnarchive } from '@/api/frame/service';

type Props = {
  value: boolean;
  row: FrameTable;
  onLocalArchiveToggle?: (id: number, next: boolean) => void;
};

export default function FrameTableArchivedCell({ value, row, onLocalArchiveToggle }: Props) {
  const { t } = useText('frame');
  const { showNotification } = useNotification();
  const [busy, setBusy] = useState(false);

  const next = !value;

  return (
    // <Tooltip title={value ? t('table.unarchive') : t('table.archive')} placement={'right-start'}>
    <span>
      <Chip
        size="small"
        label={busy ? '...' : value ? t('table.unarchive') : t('table.archive')}
        variant="outlined"
        clickable={!busy}
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          try {
            if (next) {
              await frameToggleArchive(row.bucketId, row.id);
              onLocalArchiveToggle?.(row.id, next);
              showNotification(t('table.toggle_archived_success_notification'), 'success');
            } else {
              await frameToggleUnarchive(row.bucketId, row.id);
              onLocalArchiveToggle?.(row.id, next);
              showNotification(t('table.toggle_archived_success_notification'), 'success');
            }
          } catch (e) {
            showNotification(t('table.toggle_archived_error_notification'), 'error');
          } finally {
            setBusy(false);
          }
        }}
        sx={{
          color: value ? 'green' : 'red',
          borderColor: value ? 'green' : 'red',
          cursor: busy ? 'default' : 'pointer',
          width: '90px',
        }}
      />
    </span>
    // </Tooltip>
  );
}
