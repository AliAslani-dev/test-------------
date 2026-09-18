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
  continue_button: {
    width: '100%',
    height: '48px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0',
    marginTop: '24px',
    marginBottom: '24px',
    backgroundColor: '#cbaf71',
  },
  print_preview_wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  print_page: {
    width: '100%',
    maxWidth: '148mm',
    aspectRatio: '148 / 210',
    border: '2px solid rgb(239, 239, 239)',
    borderRadius: '16px',
    backgroundColor: '#fff',
    padding: { xs: '12px', sm: '20px' },
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
  },
};

export default SX;
