import theme from '@/styles/Theme';
import { SXMap } from '@/constants';

const SX: SXMap = {
  tab_wrapper: {
    justifySelf: 'center',
    width: { xs: '100%', lg: '900px' },
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: { xs: '20px', md: '40px 0' },
    mt: {xs: 2, md: 0}
  },
  tab_title: {
    alignSelf: 'center',
    fontSize: '24px',
    fontWeight: 800,
    color: '#1a1a1a',
    mb: 3
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    border: '1px solid rgb(220, 220, 220)',
    padding: { xs: '20px', md: '32px' },
    bgcolor: 'rgba(242, 243, 246, 0.32)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section_title: {
    fontSize: '16px',
    fontWeight: 700,
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  inner_fields_wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: '20px',
  },
  qr_container: {
    background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e0e0e0',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'scale(1.02)' }
  },
  qr_image: {
    width: '150px',
    height: '150px',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  },
  pdf_container: {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #eee',
  },
  continue_button: {
    mt: 3,
    alignSelf: 'center',
    width: '240px',
    height: '52px',
    borderRadius: '14px',
    fontWeight: 700,
    fontSize: '16px',
    boxShadow: 0,
    ":hover": {
      boxShadow: 0
    }
  },
};

export default SX;