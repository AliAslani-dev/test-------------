import theme from '@/styles/Theme';

const SX = {
  dialog_content_wrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: { xs: 'start', sm: 'space-between' },
    gap: '16px',
    padding: { xs: '20px', sm: '32px' },
    overflow: 'auto',
  },
  inputs_wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '20px',
  },
  inner_inputs_wrapper: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    width: '100%',
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
    backgroundColor: '#cbaf71',
  },
  select: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  },
  select_title: {
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '8px',
    color: theme.palette.grey[500],
  },
};

export default SX;
