import theme from '@/styles/Theme';
import { AdminTab, ProviderTab, SXMap } from '@/constants';

export const getListItemButtonStyles = (
  open: boolean,
  activeTab: AdminTab | ProviderTab,
  title: string,
) => {
  return open
    ? {
        minHeight: 44,
        px: 0.25,
        mr: 2.25,
        ml: 2,
        borderRadius: 5,
        '&:hover': {
          bgcolor: activeTab == title ? 'black' : 'primary.alpha',
        },
        backgroundColor: activeTab == title ? 'black' : 'initial',
      }
    : {
        minHeight: 44,
        justifyContent: 'center',
        px: 0.25,
        mr: 2.25,
        ml: 2,
        borderRadius: 5,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'white',
        },
      };
};

export const getListItemIconContainerStyles = (
  open: boolean,
  activeTab: AdminTab | ProviderTab,
  title: string,
) => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: open ? '#E6E6F7' : activeTab == title ? 'black' : '#E6E6F7',
    borderRadius: 4,
    width: 44,
    height: 44,
  };
};

export const getListItemTextStyles = (
  open: boolean,
  activeTab: AdminTab | ProviderTab,
  title: string,
) => {
  return {
    width: open ? 'initial' : 0,
    pl: open ? 2 : 0,
    opacity: open ? 1 : 0,
    color: activeTab == title ? 'white' : 'black',
  };
};

export const getListStyles = (isProvider: boolean) => {
  return {
    px: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',

    [theme.breakpoints.up('md')]: {
      height: isProvider ? 'calc(100vh - 200px)' : 'calc(100vh - 160px)',
      overflowY: 'auto',
      overflowX: 'hidden',

      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
        marginBlock: '6px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: '100vw',
        border: '1px solid transparent',
        backgroundClip: 'content-box',
        transition: 'background-color 0.3s',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
      },
    },
  };
};

const SX: SXMap = {
  list_item: { display: 'block' },
  list_item_icon: {
    minWidth: 0,
    mr: 0.5,
    justifyContent: 'center',
  },
};

export default SX;
