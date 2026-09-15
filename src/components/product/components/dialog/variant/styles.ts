import { SXMap } from '@/constants';

const SX: SXMap = {
  wrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    padding: { xs: '20px', sm: '20px', md: '30px', lg: '30px' },
    border: '2px solid rgba(203, 175, 113, 0.35)',
    backgroundColor: 'rgba(203, 175, 113, 0.07)',
    borderRadius: 3,
  },
  wrapper_error: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    padding: { xs: '20px', sm: '20px', md: '30px', lg: '30px' },
    borderRadius: 3,

    backgroundColor: 'rgba(231, 116, 116, 0.07)',
    border: '2px solid rgba(203, 113, 113, 0.35)',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header_value: {
    fontSize: '16px',
    fontWeight: 500,
  },
  remove_button: {
    alignSelf: 'end',
    width: '120px',
    height: '32px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0',
    backgroundColor: '#c20400',
  },
  inputs_wrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  main_inputs: {
    position: 'relative',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  secondary_inputs: {
    position: 'relative',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
};

export default SX;
