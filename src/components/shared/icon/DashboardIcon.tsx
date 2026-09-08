import React from 'react';
import { SvgIcon, Box } from '@mui/material';
import { IconInterface } from './iconInterface';

const DashboardIcon: React.FunctionComponent<IconInterface> = ({
  color,
  bgColor,
  bgSize = 40,
  size = 22,
  hasBackground = false,
}) => {
  return (
    <>
      {hasBackground ? (
        <Box
          sx={{
            backgroundColor: bgColor,
            width: bgSize,
            height: bgSize,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon sx={{ color: color, width: size, height: size }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.25 19.25H4.58333C3.575 19.25 2.75 18.425 2.75 17.4167V4.58333C2.75 3.575 3.575 2.75 4.58333 2.75H8.25C9.25833 2.75 10.0833 3.575 10.0833 4.58333V17.4167C10.0833 18.425 9.25833 19.25 8.25 19.25ZM13.75 19.25H17.4167C18.425 19.25 19.25 18.425 19.25 17.4167V12.8333C19.25 11.825 18.425 11 17.4167 11H13.75C12.7417 11 11.9167 11.825 11.9167 12.8333V17.4167C11.9167 18.425 12.7417 19.25 13.75 19.25ZM19.25 7.33333V4.58333C19.25 3.575 18.425 2.75 17.4167 2.75H13.75C12.7417 2.75 11.9167 3.575 11.9167 4.58333V7.33333C11.9167 8.34167 12.7417 9.16667 13.75 9.16667H17.4167C18.425 9.16667 19.25 8.34167 19.25 7.33333Z"
                fill="currentColor"
              />
            </svg>
          </SvgIcon>
        </Box>
      ) : (
        <SvgIcon sx={{ color: color, width: size, height: size }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.25 19.25H4.58333C3.575 19.25 2.75 18.425 2.75 17.4167V4.58333C2.75 3.575 3.575 2.75 4.58333 2.75H8.25C9.25833 2.75 10.0833 3.575 10.0833 4.58333V17.4167C10.0833 18.425 9.25833 19.25 8.25 19.25ZM13.75 19.25H17.4167C18.425 19.25 19.25 18.425 19.25 17.4167V12.8333C19.25 11.825 18.425 11 17.4167 11H13.75C12.7417 11 11.9167 11.825 11.9167 12.8333V17.4167C11.9167 18.425 12.7417 19.25 13.75 19.25ZM19.25 7.33333V4.58333C19.25 3.575 18.425 2.75 17.4167 2.75H13.75C12.7417 2.75 11.9167 3.575 11.9167 4.58333V7.33333C11.9167 8.34167 12.7417 9.16667 13.75 9.16667H17.4167C18.425 9.16667 19.25 8.34167 19.25 7.33333Z"
              fill="currentColor"
            />
          </svg>
        </SvgIcon>
      )}
    </>
  );
};

export default DashboardIcon;
