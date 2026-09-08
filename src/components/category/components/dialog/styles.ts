import theme from '@/styles/Theme';
import { alpha } from '@mui/material';
import { MAIN_COLOR } from '@/constants';

const SX = {
  dialog_content_wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: { xs: 'start', sm: 'space-between' },
    gap: '16px',
    padding: { xs: '20px', sm: '32px' },
    minHeight: 0,
    flex: 1,
  },
  inputs_wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '20px',
  },
  add_field_button: {
    width: '100%',
    height: '48px',
    borderRadius: 3,
    fontSize: { xs: '14px', sm: '14px', md: '16px', lg: '16px' },
    fontWeight: 500,
    boxShadow: '0',
    backgroundColor: 'initial',
    color: alpha(MAIN_COLOR, 0.9),
    border: '2px dashed rgba(203, 175, 113, 0.35)',
    ':hover': {
      boxShadow: 'none',
      border: 'none',
      backgroundColor: alpha(MAIN_COLOR, 0.9),
      color: theme.palette.common.white,
    },
  },
  continue_button: {
    width: '100%',
    height: '48px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0',
    marginTop: '24px',
    backgroundColor: alpha(MAIN_COLOR, 0.9),
  },
};

export default SX;
