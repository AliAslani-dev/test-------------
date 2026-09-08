import { SXMap } from '@/constants';

export const getListItemButtonStyles = (open: boolean, bgcolor?: string) => {
  return open
    ? {
        minHeight: 44,
        px: 0.25,
        mr: 2.25,
        ml: 2,
        borderRadius: 5,
        '&:hover': {
          bgcolor: 'primary.alpha',
        },
        backgroundColor: bgcolor,
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
  iconBgColor?: string,
  bgColor?: string,
) => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: open ? iconBgColor : bgColor,
    borderRadius: 4,
    width: 44,
    height: 44,
  };
};
export const getListItemTextStyles = (open: boolean) => {
  return {
    width: open ? 'initial' : 0,
    pl: open ? 2 : 0,
    opacity: open ? 1 : 0,
    color: 'black',
  };
};

const SX: SXMap = {
  list: {
    px: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  list_item: { display: 'block' },
  list_item_icon: {
    minWidth: 0,
    mr: 0.5,
    justifyContent: 'center',
  },
};

export default SX;
