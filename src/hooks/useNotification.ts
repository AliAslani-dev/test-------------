import { useSnackbar, VariantType } from 'notistack';
import React from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'default' | 'info';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = React.useCallback(
    (message: any, type: NotificationType) => {
      enqueueSnackbar(message, { variant: type, autoHideDuration: 5000 });
    },
    [enqueueSnackbar],
  );

  return { showNotification };
};
