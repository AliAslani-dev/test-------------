import theme from '@/styles/Theme';

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
  row_two_col: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' },
    columnGap: { xs: 0, md: '24px' },
    rowGap: '16px',
    width: '100%',
  },
  uploader_wrapper: {
    width: '100%',
    border: '1px solid #E7E6E6',
    borderRadius: '8px',
    padding: '12px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  uploader_wrapper_header: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  uploader_title: {
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '4px',
    color: theme.palette.grey[500],
  },
  star: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#EB1B35',
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
};

export default SX;
