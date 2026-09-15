import { persianToEnglishNumber } from '@/utils';
import { FunctionComponent, useState, useMemo, ReactElement } from 'react';
import SX from '@/components/shared/custom-text-field/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  TextFieldProps,
} from '@mui/material';

type NumericMode = 'int' | 'decimal';

interface CustomTextFieldProps {
  id: string;
  title: ReactElement | string;
  value: string;
  setValue: (value: string) => void;
  hasStar?: boolean;
  extraTitle?: string;
  rows?: number;
  isPassword?: boolean;
  validate?: (value: string) => boolean;
  placeholder?: string;
  disabled?: boolean;

  numeric?: NumericMode;
  decimalScale?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  normalizeOnBlur?: boolean;

  onBlurNormalized?: (normalizedValue: string) => void;
  InputProps?: TextFieldProps['InputProps'];
  inputProps?: TextFieldProps['inputProps'];
}

const normalizeMinus = (raw: string, allowNegative: boolean) => {
  if (!allowNegative) return raw;
  let s = raw.trim().replace(/−/g, '-');
  if (s.endsWith('-') && !s.startsWith('-')) s = '-' + s.slice(0, -1);
  return s;
};

const sanitizeInt = (raw: string, allowNegative: boolean) => {
  let v = normalizeMinus(raw, allowNegative).replace(/,/g, '.');
  v = v.replace(/[^\d-]/g, '');
  if (!allowNegative) v = v.replace(/-/g, '');
  if ((v.match(/-/g) || []).length > 1) v = v.replace(/-/g, '');
  if (v.includes('-') && !v.startsWith('-')) v = v.replace(/-/g, '');
  return v;
};

const sanitizeDecimal = (raw: string, allowNegative: boolean) => {
  let v = normalizeMinus(raw, allowNegative).replace(/,/g, '.');
  v = v.replace(/[^\d\.\-]/g, '');

  if (!allowNegative) v = v.replace(/-/g, '');
  const minusCount = (v.match(/-/g) || []).length;
  if (minusCount > 1) v = v.replace(/-/g, '');
  if (v.includes('-') && !v.startsWith('-')) v = v.replace(/-/g, '');

  const firstDot = v.indexOf('.');
  if (firstDot !== -1) {
    const before = v.slice(0, firstDot + 1);
    const after = v.slice(firstDot + 1).replace(/\./g, '');
    v = before + after;
  }
  return v;
};

const clampNumber = (n: number, min?: number, max?: number) => {
  if (min != null && n < min) return min;
  if (max != null && n > max) return max;
  return n;
};

const roundToScale = (n: number, scale: number) => {
  const f = Math.pow(10, scale);
  return Math.round(n * f) / f;
};

const normalizeIntString = (v: string, allowNegative: boolean, min?: number, max?: number) => {
  if (v === '' || v === '-') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  const clamped = clampNumber(n, min, max);
  return String(Math.trunc(clamped));
};

const normalizeDecimalString = (
  v: string,
  scale: number | undefined,
  allowNegative: boolean,
  min?: number,
  max?: number,
) => {
  if (v === '' || v === '-' || v === '.' || v === '-.') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';

  let x = n;
  if (scale != null) x = roundToScale(x, scale);
  x = clampNumber(x, min, max);

  let s = scale != null ? x.toFixed(scale) : String(x);
  s = s
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
    .replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s;
};

const CustomTextField: FunctionComponent<CustomTextFieldProps> = ({
  id,
  title,
  value,
  setValue,
  extraTitle,
  hasStar = false,
  rows = 1,
  isPassword,
  validate,
  placeholder,
  disabled = false,

  numeric,
  decimalScale,
  min,
  max,
  allowNegative = false,
  normalizeOnBlur = true,

  onBlurNormalized,
  InputProps: InputPropsProp,
  inputProps: inputPropsProp,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const resolvedAllowNegative = useMemo(() => {
    if (allowNegative != null) return allowNegative;
    return numeric === 'decimal' ? true : false;
  }, [allowNegative, numeric]);

  const isError = validate
    ? typeof value === 'string'
      ? value.trim() === ''
        ? false
        : !validate(value.trim())
      : false
    : false;

  const handleChange = (raw: string) => {
    if (!numeric) {
      setValue(raw);
      return;
    }

    const converted = persianToEnglishNumber(raw);

    if (numeric === 'int') {
      setValue(sanitizeInt(converted, resolvedAllowNegative));
    } else {
      setValue(sanitizeDecimal(converted, resolvedAllowNegative));
    }
  };

  const handleBlur = () => {
    if (!normalizeOnBlur) {
      if (onBlurNormalized) onBlurNormalized(value);
      return;
    }

    if (!numeric) {
      if (onBlurNormalized) onBlurNormalized(value);
      return;
    }

    if (numeric === 'int') {
      const normalized = normalizeIntString(value, resolvedAllowNegative, min, max);
      setValue(normalized);
      if (onBlurNormalized) onBlurNormalized(normalized);
    } else {
      const normalized = normalizeDecimalString(
        value,
        decimalScale,
        resolvedAllowNegative,
        min,
        max,
      );
      setValue(normalized);
      if (onBlurNormalized) onBlurNormalized(normalized);
    }
  };

  const inputMode = numeric === 'int' ? 'numeric' : numeric === 'decimal' ? 'decimal' : undefined;

  const pattern =
    numeric === 'int'
      ? resolvedAllowNegative
        ? '^-?\\d*$'
        : '^\\d*$'
      : numeric === 'decimal'
        ? resolvedAllowNegative
          ? '^-?(\\d+([\\.,]\\d*)?|[\\.,]\\d*)$'
          : '^(\\d+([\\.,]\\d*)?|[\\.,]\\d*)$'
        : undefined;

  const showPasswordType = isPassword && !showPassword ? 'password' : 'text';

  const resolvedMuiInputProps = isPassword
    ? {
        ...InputPropsProp,
        endAdornment: InputPropsProp?.endAdornment ?? (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword((prev) => !prev)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }
    : InputPropsProp;

  const isNumeric = !!numeric;

  const resolvedInputProps = {
    ...inputPropsProp,
    inputMode: inputPropsProp?.inputMode ?? inputMode,
    pattern: inputPropsProp?.pattern ?? pattern,
    dir: inputPropsProp?.dir ?? (isNumeric ? 'ltr' : undefined),
    onWheel: (event: any) => {
      (event.currentTarget as HTMLInputElement).blur();
      inputPropsProp?.onWheel?.(event);
    },
  };

  return (
    <Box sx={SX.wrapper}>
      <Box sx={SX.titles_container}>
        <Typography sx={SX.title} component={typeof title === 'string' ? 'span' : 'div'}>
          {title}
        </Typography>
        {extraTitle && <Typography sx={SX.extra_title}>{extraTitle}</Typography>}
        {hasStar && <Typography sx={SX.star}>*</Typography>}
      </Box>

      <TextField
        size="small"
        fullWidth
        id={id}
        variant="outlined"
        type={showPasswordType}
        value={value}
        multiline={rows !== 1}
        rows={rows}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        error={isError}
        placeholder={placeholder}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#E7E6E6' },
          },
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: 'rgb(124, 124, 124)',
            color: 'rgb(124, 124, 124)',
            opacity: 1,
          },
          ...(isNumeric && {
            '& .MuiInputBase-input': { direction: 'ltr', textAlign: 'right' },
          }),
        }}
        inputProps={resolvedInputProps}
        InputProps={resolvedMuiInputProps}
      />
    </Box>
  );
};

export default CustomTextField;
