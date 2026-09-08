'use client';

import './styles.css';
import { DatePicker as DP } from 'zaman';
import { FunctionComponent } from 'react';
import { Box, Typography } from '@mui/material';
import SX from '@/components/shared/date-picker/styles';

interface DatePickerProps {
  value: Date | undefined;
  setValue: (value: Date | undefined) => void;
  title: string;
  hasStar?: boolean;
  extraTitle?: string;
}

const DatePicker: FunctionComponent<DatePickerProps> = ({
  value,
  setValue,
  title,
  hasStar = false,
  extraTitle,
}) => {
  return (
    <Box sx={SX.wrapper}>
      <Box sx={SX.titles_container}>
        <Typography sx={SX.title}>{title}</Typography>
        {extraTitle && <Typography sx={SX.extra_title}>{extraTitle}</Typography>}
        {hasStar && <Typography sx={SX.star}>*</Typography>}
      </Box>

      <DP
        defaultValue={value}
        inputClass="date_picker_input"
        round="x4"
        position="center"
        onChange={(e) => {
          setValue(e.value);
        }}
      />
    </Box>
  );
};

export default DatePicker;
