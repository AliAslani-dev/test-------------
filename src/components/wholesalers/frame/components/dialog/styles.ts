import theme from '@/styles/Theme';
import { alpha } from '@mui/material';
import { SXMap } from '@/constants';

const SX: SXMap = {
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

  top_inputs: {
    width: '100%',
    display: 'grid',
    gridTemplateAreas: {
      xs: `"image" "model"`,
      sm: `"image" "model"`,
      md: `"model image"`,
      lg: `"model image"`,
    },
    gridTemplateColumns: {
      xs: '1fr',
      sm: '1fr',
      md: '1fr minmax(320px, 360px)',
      lg: '1fr minmax(340px, 380px)',
    },
    alignItems: { xs: 'stretch', sm: 'stretch', md: 'start', lg: 'start' },
    columnGap: { md: '24px', lg: '28px' },
    rowGap: { xs: '16px', sm: '18px' },
  },

  top_right_inputs: {
    gridArea: 'model',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingTop: { md: '4px', lg: '6px' },
  },

  image_container: {
    gridArea: 'image',
    width: '100%',
    justifySelf: { xs: 'stretch', sm: 'stretch', md: 'end', lg: 'end' },

    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '14px',
    backgroundColor: 'rgba(0,0,0,0.015)',

    padding: { xs: '10px', sm: '12px', md: '12px', lg: '14px' },

    maxWidth: { md: 380, lg: 420 },
  },

  variant_title: {
    marginTop: '40px',
    fontSize: { xs: '20px', sm: '20px', md: '24px', lg: '24px' },
    fontWeight: 500,
  },

  add_variant_button: {
    width: '100%',
    height: '48px',
    borderRadius: 3,
    fontSize: { xs: '14px', sm: '14px', md: '16px', lg: '16px' },
    fontWeight: 500,
    boxShadow: '0',
    backgroundColor: 'initial',
    color: alpha('#9C7A2B', 0.9),
    border: '2px dashed rgba(203, 175, 113, 0.35)',
    ':hover': {
      boxShadow: 'none',
      border: 'none',
      backgroundColor: alpha('#9C7A2B', 0.9),
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
    backgroundColor: alpha('#9C7A2B', 0.9),
  },

  variants_wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
};

export default SX;
