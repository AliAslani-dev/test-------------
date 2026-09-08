import theme from '@/styles/Theme';
import { SXMap } from '@/constants';

const SX: SXMap = {
  tab_wrapper: {
    position: 'relative',

    width: '100%',
    minWidth: 0,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',

    gap: '16px',

    padding: {
      xs: '40px 20px 20px',
      sm: '40px 20px 20px',
      md: '20px 5px 5px',
    },
  },

  tab_title: {
    fontSize: {
      xs: '18px',
      sm: '18px',
      md: '20px',
      lg: '20px',
    },
    fontWeight: 600,
  },

  filter_box: {
    width: '100%',
    minWidth: 0,

    mt: '20px',

    display: 'flex',

    flexDirection: {
      xs: 'column',
      sm: 'row',
    },

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

  accordion: {
    marginBottom: '16px',

    boxShadow: 'none',

    '&::before': {
      display: 'none',
    },

    border: '2px solid #F1F5FA',
    borderRadius: 3,
  },

  accordion_summary: {
    width: '100%',
    height: '100%',

    display: 'flex',
    alignItems: 'center',

    borderRadius: 3,
  },

  filters_wrapper_header: {
    width: '100%',
    height: '100%',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginLeft: '20px',
  },

  filters_title: {
    fontSize: {
      xs: '14px',
      sm: '14px',
      md: '18px',
      lg: '18px',
    },
    fontWeight: 500,
  },

  remove_filters_button: {
    width: {
      xs: '100px',
      sm: '100px',
      md: '120px',
      lg: '120px',
    },

    height: {
      xs: '28px',
      sm: '28px',
      md: '32px',
      lg: '32px',
    },

    borderRadius: '8px',

    fontSize: {
      xs: '12px',
      sm: '12px',
      md: '14px',
      lg: '14px',
    },

    fontWeight: 500,
    boxShadow: 'none',

    backgroundColor: '#c20400',

    '&:hover': {
      boxShadow: 'none',
    },
  },

  accordion_details: {
    padding: {
      xs: '14px',
      sm: '14px',
      md: '18px',
      lg: '18px',
    },
  },

  filter_inputs_container: {
    width: '100%',
    minWidth: 0,

    display: 'flex',
    flexDirection: 'column',

    gap: '20px',
  },

  filter_inputs_patch: {
    width: '100%',
    minWidth: 0,

    display: 'flex',

    flexDirection: {
      xs: 'column',
      sm: 'column',
      md: 'row',
      lg: 'row',
    },

    gap: '20px',
  },

  table_buttons_container: {
    position: 'relative',

    width: '100%',
    minWidth: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',

    gap: '10px',
  },

  add_button: {
    width: '140px',
    height: '40px',

    fontSize: '14px',
    fontWeight: 600,

    borderWidth: '2px',
    borderRadius: '8px',

    color: theme.palette.common.black,
    backgroundColor: 'rgb(203, 203, 236)',

    boxShadow: 'none',

    '&:hover': {
      boxShadow: 'none',
    },
  },

  refresh_button_container: {
    width: '40px',
    height: '40px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    bgcolor: 'rgb(203, 203, 236)',
    borderRadius: '8px',

    cursor: 'pointer',
  },

  refresh_button: {
    fontSize: 20,
    color: theme.palette.common.black,
  },
};

export default SX;
