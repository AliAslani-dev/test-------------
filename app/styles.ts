import { SXMap } from '@/constants';

const SX: SXMap = {
  main_wrapper: {
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  drawer: {
    p: 1.5,
    boxSizing: 'border-box',
    borderLeft: 'none',
    boxShadow: 'none',
  },
  drawer_wrapper: {
    height: 1,
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid',
    borderColor: '#F1F5FA',
    borderRadius: 6,
    bgcolor: 'background.paper',
    overflow: 'hidden',
  },
  toolbar: { px: 2, py: 4 },
  talasys_wrapper: {
    display: 'flex',
    gap: 1.25,
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  talasys_user_wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
  talasys_value: { fontSize: 20, fontWeight: 600 },
  user_value: { fontSize: 16, fontWeight: 300 },
  lists_wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },

  mobile_app_bar: {
    width: '100%',
    backgroundColor: 'white',
    color: 'black',
    top: 0,
    left: 0,
    right: 0,
  },
  mobile_app_bar_wrapper: {
    width: '100%',
    height: '64px',
    minHeight: '64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginInline: '32px',
  },

  mobile_search_bar_container: {
    mt: '30px',
    padding: '0 20px 0 20px',
    justifySelf: { xs: 'center', sm: 'flex-end' },
  },

  top_fix_header: {
    height: '80px',
    width: '100%',
    position: 'sticky',
    top: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    zIndex: (theme) => theme.zIndex.appBar,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-25px',
      left: 0,
      right: 0,
      height: '25px',
      backgroundColor: 'white',
    },
    borderBottom: '1px solid',
    borderColor: (theme) => theme.palette.divider,
  },
};

export default SX;
