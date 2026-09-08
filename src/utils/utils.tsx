import { Typography, TypographyProps } from '@mui/material';

export const NegNumText = ({ children, sx, ...props }: TypographyProps) => (
  <Typography
    {...props}
    sx={{
      direction: 'ltr',
      unicodeBidi: 'isolate',
      textAlign: 'center',
      ...sx,
    }}
  >
    {children}
  </Typography>
);
