import theme from '@/styles/Theme';
import { SXMap } from '@/constants';

const SX: SXMap = {
  tab_wrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: { xs: '40px 20px 20px 20px', sm: '40px 20px 20px 20px', md: '20px 5px 5px 5px' },
  },
  header: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: '12px',
  },
  header_value: {
    fontSize: { xs: '18px', sm: '18px', md: '20px', lg: '20px' },
    fontWeight: 600,
  },
  filters_wrapper: {
    position: 'relative',
    width: '100%',
    mb: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inner_filter_box: {
    width: '100%',
    display: 'flex',
    flexDirection: { xs: 'row', sm: 'row' },
    gap: '10px',
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
  buttons_container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  refresh_button_container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    width: '40px',
    bgcolor: 'rgb(203, 203, 236)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  refresh_button: { fontSize: 20, color: theme.palette.common.black },
  add_button: {
    fontSize: '14px',
    fontWeight: 600,
    borderWidth: '2px',
    borderRadius: '8px',
    width: '140px',
    height: '40px',
    color: theme.palette.common.black,
    backgroundColor: 'rgb(203, 203, 236)',
    boxShadow: 'none',
    ':hover': { boxShadow: 'none' },
  },
};

export default SX;
