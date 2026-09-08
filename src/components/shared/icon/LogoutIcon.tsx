import React from 'react';
import { SvgIcon, Box } from '@mui/material';
import { IconInterface } from './iconInterface';

const LogoutIcon: React.FunctionComponent<IconInterface> = ({
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
                d="M4.58333 4.58333H10.0833C10.5875 4.58333 11 4.17083 11 3.66667C11 3.1625 10.5875 2.75 10.0833 2.75H4.58333C3.575 2.75 2.75 3.575 2.75 4.58333V17.4167C2.75 18.425 3.575 19.25 4.58333 19.25H10.0833C10.5875 19.25 11 18.8375 11 18.3333C11 17.8292 10.5875 17.4167 10.0833 17.4167H4.58333V4.58333Z"
                fill="currentColor"
              />
              <path
                d="M18.9292 10.6793L16.3717 8.12182C16.0783 7.82848 15.5833 8.03015 15.5833 8.44265V10.0835H9.16667C8.6625 10.0835 8.25 10.496 8.25 11.0002C8.25 11.5043 8.6625 11.9168 9.16667 11.9168H15.5833V13.5576C15.5833 13.9701 16.0783 14.1718 16.3625 13.8785L18.92 11.321C19.1033 11.1468 19.1033 10.8535 18.9292 10.6793Z"
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
              d="M4.58333 4.58333H10.0833C10.5875 4.58333 11 4.17083 11 3.66667C11 3.1625 10.5875 2.75 10.0833 2.75H4.58333C3.575 2.75 2.75 3.575 2.75 4.58333V17.4167C2.75 18.425 3.575 19.25 4.58333 19.25H10.0833C10.5875 19.25 11 18.8375 11 18.3333C11 17.8292 10.5875 17.4167 10.0833 17.4167H4.58333V4.58333Z"
              fill="currentColor"
            />
            <path
              d="M18.9292 10.6793L16.3717 8.12182C16.0783 7.82848 15.5833 8.03015 15.5833 8.44265V10.0835H9.16667C8.6625 10.0835 8.25 10.496 8.25 11.0002C8.25 11.5043 8.6625 11.9168 9.16667 11.9168H15.5833V13.5576C15.5833 13.9701 16.0783 14.1718 16.3625 13.8785L18.92 11.321C19.1033 11.1468 19.1033 10.8535 18.9292 10.6793Z"
              fill="currentColor"
            />
          </svg>
        </SvgIcon>
      )}
    </>
  );
};

export default LogoutIcon;
