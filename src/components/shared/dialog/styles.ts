const SX = {
  dialog: {
    '& .MuiPaper-root': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '16px',
      padding: 0,
      height: '632px',
      width: { xs: '100%', sm: '520px', md: '1000px', lg: '1000px' },
    },
  },
  bottom_sheet_dialog: {
    '& .MuiDialog-container': {
      alignItems: 'flex-end',
    },
    '& .MuiPaper-root': {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      margin: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'auto',
      maxHeight: '90vh',
      overflow: 'hidden',
    },
  },
  header_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '15px 15px 10px 15px',
    padding: '5px 15px 10px 15px',
    borderRadius: '10px',
  },
  header_title: {
    fontSize: '16px',
    fontWeight: 600,
    padding: '0',
  },
  dialog_content: {
    position: 'relative',
    display: 'block',
    padding: 0,
    width: '100%',
    height: 'auto',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },

  close_icon: {
    position: 'absolute',
    top: '20px',
    left: '31px',
    backgroundColor: '#fff',
  },
};

export default SX;
