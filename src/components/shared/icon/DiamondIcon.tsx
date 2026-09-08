import React from 'react';
import { SvgIcon, Box } from '@mui/material';
import { IconInterface } from './iconInterface';

const DiamondIcon: React.FunctionComponent<IconInterface> = ({
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
                d="M11.1467 2.75H10.8533L8.4425 7.5625H13.5575L11.1467 2.75ZM15.0883 7.5625H19.8183L17.9208 3.7675C17.6092 3.14417 16.9767 2.75 16.28 2.75H12.6775L15.0883 7.5625ZM19.5983 8.9375H11.6875V18.425L19.5983 8.9375ZM10.3125 18.425V8.9375H2.40167L10.3125 18.425ZM6.91167 7.5625L9.31334 2.75H5.72C5.02334 2.75 4.39084 3.14417 4.07917 3.7675L2.18167 7.5625H6.91167Z"
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
              d="M11.1467 2.75H10.8533L8.4425 7.5625H13.5575L11.1467 2.75ZM15.0883 7.5625H19.8183L17.9208 3.7675C17.6092 3.14417 16.9767 2.75 16.28 2.75H12.6775L15.0883 7.5625ZM19.5983 8.9375H11.6875V18.425L19.5983 8.9375ZM10.3125 18.425V8.9375H2.40167L10.3125 18.425ZM6.91167 7.5625L9.31334 2.75H5.72C5.02334 2.75 4.39084 3.14417 4.07917 3.7675L2.18167 7.5625H6.91167Z"
              fill="currentColor"
            />
          </svg>
        </SvgIcon>
      )}
    </>
  );
};

export default DiamondIcon;
