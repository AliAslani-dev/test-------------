import React from 'react';
import { SvgIcon, Box } from '@mui/material';
import { IconInterface } from './iconInterface';

const OrderIcon: React.FunctionComponent<IconInterface> = ({
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
                d="M17.4167 4.58333V17.4167H4.58333V4.58333H17.4167ZM17.4167 2.75H4.58333C3.575 2.75 2.75 3.575 2.75 4.58333V17.4167C2.75 18.425 3.575 19.25 4.58333 19.25H17.4167C18.425 19.25 19.25 18.425 19.25 17.4167V4.58333C19.25 3.575 18.425 2.75 17.4167 2.75Z"
                fill="currentColor"
              />
              <path
                d="M12.8333 15.5832H6.41666V13.7498H12.8333V15.5832ZM15.5833 11.9165H6.41666V10.0832H15.5833V11.9165ZM15.5833 8.24984H6.41666V6.4165H15.5833V8.24984Z"
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
              d="M17.4167 4.58333V17.4167H4.58333V4.58333H17.4167ZM17.4167 2.75H4.58333C3.575 2.75 2.75 3.575 2.75 4.58333V17.4167C2.75 18.425 3.575 19.25 4.58333 19.25H17.4167C18.425 19.25 19.25 18.425 19.25 17.4167V4.58333C19.25 3.575 18.425 2.75 17.4167 2.75Z"
              fill="currentColor"
            />
            <path
              d="M12.8333 15.5832H6.41666V13.7498H12.8333V15.5832ZM15.5833 11.9165H6.41666V10.0832H15.5833V11.9165ZM15.5833 8.24984H6.41666V6.4165H15.5833V8.24984Z"
              fill="currentColor"
            />
          </svg>
        </SvgIcon>
      )}
    </>
  );
};

export default OrderIcon;
