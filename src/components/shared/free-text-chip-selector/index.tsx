'use client';

import SX from './styles';
import useText from '@/hooks/useText';
import { useMemo, useState } from 'react';
import { useLang } from '@/hooks/LanContext';
import { alpha, useTheme } from '@mui/material/styles';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';

export interface FreeTextChipSelectorProps {
  id?: string;
  title: string;
  value: string[];
  setValue: React.Dispatch<React.SetStateAction<string[]>>;

  extraTitle?: string;
  hasStar?: boolean;
  disabled?: boolean;
  placeholder?: string;
  limitTags?: number;

  normalize?: (s: string) => string;
  validateToken?: (s: string) => boolean;

  caseInsensitiveDedup?: boolean;
  commitKeys?: string[];
  pasteSeparators?: RegExp;
  commitOnSpace?: boolean;
  maxItems?: number;
}

const defaultNormalize = (s: string) => s.replace(/\s+/g, ' ').trim();

export default function FreeTextChipSelector({
  id = 'free-text-chips',
  title,
  value,
  setValue,
  extraTitle,
  hasStar = false,
  disabled = false,
  placeholder,
  limitTags = 4,

  normalize = defaultNormalize,
  validateToken,
  caseInsensitiveDedup = true,
  commitKeys = ['Enter'],
  pasteSeparators = /[,\n;]/,
  commitOnSpace = false,
  maxItems,
}: FreeTextChipSelectorProps) {
  const { lang } = useLang();
  const { t } = useText('base', lang);
  const ePlaceholder = placeholder ?? t('free_text_chip_selector.placeholder');

  const theme = useTheme();
  const [input, setInput] = useState('');

  const toKey = (s: string) => (caseInsensitiveDedup ? s.toLowerCase() : s);
  const existing = useMemo(
    () => new Set(value.map((v) => toKey(normalize(v)))),
    [value, normalize],
  );

  const canAddMore = (n = 1) =>
    typeof maxItems === 'number' ? value.length + n <= maxItems : true;

  const addToken = (raw: string) => {
    const token = normalize(raw);
    if (!token) return;
    if (validateToken && !validateToken(token)) return;
    const key = toKey(token);
    if (existing.has(key)) return;
    if (!canAddMore()) return;
    setValue((prev) => [...prev, token]);
  };

  const addTokens = (raws: string[]) => {
    const cleaned = raws
      .map(normalize)
      .filter(Boolean)
      .filter((t) => (validateToken ? validateToken(t) : true))
      .filter((t) => !existing.has(toKey(t)));

    if (!cleaned.length) return;
    const room =
      typeof maxItems === 'number' ? Math.max(0, maxItems - value.length) : cleaned.length;
    setValue((prev) => [...prev, ...cleaned.slice(0, room)]);
  };

  const tryCommitFromInput = () => {
    if (!input.trim()) return;
    addToken(input);
    setInput('');
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData?.getData('text') ?? '';
    const parts = text.split(pasteSeparators);
    if (parts.length > 1) {
      e.preventDefault();
      addTokens(parts);
    }
  };

  return (
    <Box sx={SX.wrapper}>
      <Box sx={SX.titles_container}>
        <Typography sx={SX.title}>{title}</Typography>
        {extraTitle && <Typography sx={SX.extra_title}>{extraTitle}</Typography>}
        {hasStar && <Typography sx={SX.star}>*</Typography>}
      </Box>

      <Autocomplete
        sx={{
          width: '100%',
          minWidth: 0,
          '& .MuiAutocomplete-inputRoot': {
            alignItems: 'center',
            paddingTop: '2px',
            paddingBottom: '2px',
          },
        }}
        id={id}
        multiple
        freeSolo
        open={false}
        options={[]}
        value={value}
        onChange={(_, newVal) => setValue(newVal as string[])}
        inputValue={input}
        onInputChange={(_, v) => setInput(v)}
        limitTags={limitTags}
        filterOptions={(x) => x}
        renderTags={(selected, getTagProps) =>
          (selected as string[]).map((opt, index) => {
            const { key, onDelete, ...chipProps } = getTagProps({ index }) as any;
            return (
              <Chip
                key={key}
                {...chipProps}
                label={opt}
                size="small"
                tabIndex={-1}
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.preventDefault()}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  onDelete?.(e);
                }}
                sx={{
                  direction: theme.direction,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  '& .MuiChip-label': { px: 1 },
                  '& .MuiChip-deleteIcon': { display: 'none' },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                    color: theme.palette.error.main,
                  },
                }}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            fullWidth
            placeholder={value.length ? '' : ePlaceholder}
            disabled={disabled}
            onKeyDown={(e) => {
              if ((commitOnSpace && e.key === ' ') || commitKeys.includes(e.key)) {
                if (!(e as any).isComposing) {
                  e.preventDefault();
                  tryCommitFromInput();
                }
              } else if (e.key === 'Tab') {
                if (input.trim() && !(e as any).isComposing) {
                  tryCommitFromInput();
                }
              }
            }}
            onPaste={handlePaste}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E7E6E6' },
              },
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000',
                color: '#000',
                opacity: 1,
              },
            }}
          />
        )}
      />
    </Box>
  );
}
