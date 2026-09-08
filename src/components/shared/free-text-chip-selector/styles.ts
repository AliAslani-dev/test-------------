import theme from '@/styles/Theme';

const SX = {
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  },
  titles_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '8px',
    color: theme.palette.grey[500],
  },
  extra_title: {
    fontSize: '10px',
    fontWeight: 600,
    margin: '0 4px 8px 0',
    color: theme.palette.text.secondary,
  },
  star: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#EB1B35',
    margin: '-3px 4px 0 0',
  },
};

export default SX;
