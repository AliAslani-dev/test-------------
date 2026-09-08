import { alpha } from '@mui/material';
import { MAIN_COLOR, SXMap } from '@/constants';

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
  inputs_inner_wrapper: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
    gap: '28px',
  },
  additional_fields_middle_inputs: {
    width: '100%',
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
    gap: '20px',
  },
  middle_inputs_side: {
    width: { xs: '100%', sm: '100%', md: '50%', lg: '50%' },
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
  variants_wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
};

export default SX;
