'use client';

import Image from 'next/image';
import theme from '@/styles/Theme';
import { EMAIL_RE, MAIN_COLOR } from '@/constants';
import { LoadingButton } from '@mui/lab';
import { login } from '@/api/auth/service';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useNotification';
import { useState, useMemo, FunctionComponent } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import CustomTextField from '@/components/shared/custom-text-field';

const LoginForm: FunctionComponent = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const formIsValid = useMemo(
    () => EMAIL_RE.test(email) && password.length > 0,
    [email, password],
  );

  const onButtonClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await login(email, password);
      showNotification('ورود با موفقیت انجام شد.', 'success');
      router.replace('/dashboard');
    } catch (e: any) {
      if (e.response?.data?.description?.fa) {
        showNotification(e.response.data.description.fa, 'error');
      } else {
        showNotification('مشکلی پیش آمده است.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',

        background:
          'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(243, 235, 222) 40%,rgb(245, 218, 164) 100%)',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            position: 'relative',
            flex: 0.8,
            minHeight: '100%',
            overflow: 'hidden',
            bgcolor: 'rgb(36,27,25)',
          }}
        >
          <Image
            src="/images/LoginImage.jpeg"
            alt="Login Image"
            fill
            style={{ objectFit: 'cover' }}
          />

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              bottom: { md: 70, lg: 40 },
              right: { md: 20, lg: 40 },
            }}
          >
            <Typography
              sx={{
                fontSize: { md: '30px', lg: '45px' },
                fontWeight: 900,
                color: '#b69b63',
              }}
            >
              سامانه مدیریت زرهاب
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontSize: { md: '17px', lg: '20px' },
                color: 'rgb(233, 233, 233)',
              }}
            >
              مدیریت محصول، موجودی، فروش و تسویه‌حساب
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          flex: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 430,
            borderRadius: '28px',
            background: 'rgb(255, 255, 255)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.65)',
            boxShadow: {
              xs: '0 4px 28px rgba(0,0,0,0.08)',
              sm: '0 4px 28px rgba(0,0,0,0.08)',
              md: '0',
              lg: '0',
            },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            py: { xs: 6, sm: 8 },
            px: { xs: 3, sm: 6 },
          }}
        >
          <Image
            src="/logos/ZarHubEnIcon.png"
            width={190}
            height={81.6}
            alt="Logo"
            style={{ margin: '0 auto' }}
          />
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{ fontSize: { xs: '22px', sm: '30px' }, fontWeight: 500, color: '#433' }}
            >
              داشبورد
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '30px', sm: '36px' },
                fontWeight: 900,
                color: '#b69b63',
              }}
            >
              زرهاب
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CustomTextField
              id="email"
              value={email}
              setValue={setEmail}
              title="ایمیل"
              validate={(v) => EMAIL_RE.test(String(v).trim())}
            />

            <CustomTextField
              id="password"
              isPassword
              value={password}
              setValue={setPassword}
              title="رمز عبور"
              validate={(v) => v.length > 0}
            />
          </Box>

          <LoadingButton
            onClick={onButtonClick}
            loading={loading}
            disabled={!formIsValid}
            variant="contained"
            sx={{
              height: '50px',
              mt: 1,
              fontSize: '16px',
              fontWeight: 700,
              borderRadius: '14px',
              background: MAIN_COLOR,
              color: '#fff',
              boxShadow: '0',
            }}
          >
            ورود
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;