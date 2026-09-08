'use client';

import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Popper, { PopperProps } from '@mui/material/Popper';
import type { SxProps, Theme } from '@mui/material/styles';
import SX from '@/components/shared/custom-text-field/styles';
import { createFilterOptions } from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { forwardRef, useEffect, useMemo, useRef, useState, ComponentType, JSX } from 'react';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';

type LoadOptions<T> = (query?: string) => Promise<T[]>;

interface CommonProps<T> {
  id: string;
  title: string;
  extraTitle?: string;
  hasStar?: boolean;

  loadOptions: LoadOptions<T>;
  optionLabel: (opt: T) => string;
  optionKey: (opt: T) => string | number;
  optionSecondary?: (opt: T) => string;
  getOptionDisabled?: (opt: T) => boolean;

  filterMode?: 'local' | 'remote';
  searchDebounceMs?: number;
  initialQuery?: string;

  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  errorText?: string;
  noOptionsText?: string;
  loadingText?: string;

  textFieldSx?: SxProps<Theme>;
  limitTags?: number;
}

interface SingleProps<T> extends CommonProps<T> {
  multiple?: false;
  value: T | null;
  onChange: (value: T | null) => void;
  validate?: (value: T | null) => boolean;
}

interface MultiProps<T> extends CommonProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
  validate?: (value: T[]) => boolean;
}

export type SearchableSelectProps<T> = SingleProps<T> | MultiProps<T>;

const PopperAligned = forwardRef<HTMLDivElement, PopperProps>(function PopperAligned(props, ref) {
  const theme = useTheme();
  const { anchorEl, style, modifiers, placement, ...rest } = props;

  const anchorWidth =
    (anchorEl && (anchorEl as HTMLElement).getBoundingClientRect().width) || undefined;

  return (
    <Popper
      ref={ref}
      anchorEl={anchorEl}
      {...rest}
      style={{ ...style, width: anchorWidth, minWidth: anchorWidth }}
      placement={theme.direction === 'rtl' ? 'bottom-end' : 'bottom-start'}
      {...({ strategy: 'fixed' } as any)}
      modifiers={[
        { name: 'offset', options: { offset: [75, 40] } },
        {
          name: 'flip',
          options: {
            fallbackPlacements: [theme.direction === 'rtl' ? 'top-end' : 'top-start'],
          },
        },
        { name: 'preventOverflow', options: { altAxis: true, padding: 8 } },
      ]}
      sx={{
        '& .MuiAutocomplete-paper': { direction: 'rtl', width: '100%' },
        '& .MuiAutocomplete-listbox': { direction: 'rtl', textAlign: 'right' },
      }}
    />
  );
}) as ComponentType<PopperProps>;

export default function SearchableSelect<T>(props: SingleProps<T>): JSX.Element;
export default function SearchableSelect<T>(props: MultiProps<T>): JSX.Element;
export default function SearchableSelect<T>(props: SearchableSelectProps<T>) {
  const {
    id,
    title,
    extraTitle,
    hasStar = false,

    loadOptions,
    optionLabel,
    optionKey,
    optionSecondary,
    getOptionDisabled,

    filterMode = 'local',
    searchDebounceMs = 300,
    initialQuery = '',

    placeholder = 'جستجو ...',
    disabled = false,
    allowClear = true,
    noOptionsText = 'موردی برای انتخاب وجود ندارد.',
    loadingText = 'در حال جستجو ...',
    textFieldSx,
    limitTags = 2,
  } = props;

  const isMulti = (props as MultiProps<T>).multiple === true;
  const currentValue = (props as any).value as T[] | (T | null);
  const emitChange = (props as any).onChange as ((v: T[]) => void) | ((v: T | null) => void);
  const validate = (props as any).validate as
    | ((v: T[]) => boolean)
    | ((v: T | null) => boolean)
    | undefined;

  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const reqSeq = useRef(0);

  const isError = useMemo(() => {
    if (!validate) return false;
    return !validate(currentValue as any);
  }, [validate, currentValue]);

  const runFetch = async (query?: string) => {
    const seq = ++reqSeq.current;
    setLoading(true);
    try {
      const data = await loadOptions(query);
      if (reqSeq.current === seq) {
        setOptions(Array.isArray(data) ? data : []);
        setFetchedOnce(true);
      }
    } catch {
      if (reqSeq.current === seq) {
        setOptions([]);
        setFetchedOnce(true);
      }
    } finally {
      if (reqSeq.current === seq) setLoading(false);
    }
  };

  useEffect(() => {
    if (filterMode === 'local') runFetch();
    else runFetch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode]);

  useEffect(() => {
    if (filterMode !== 'remote') return;
    const t = setTimeout(() => runFetch(inputValue.trim()), searchDebounceMs);
    return () => clearTimeout(t);
  }, [inputValue, filterMode, searchDebounceMs]);

  const filterOptions =
    filterMode === 'local'
      ? createFilterOptions<T>({
          stringify: (opt) => {
            const p = (s: string) => (s ?? '').toString();
            const main = p(optionLabel(opt));
            const sec = optionSecondary ? p(optionSecondary(opt)) : '';
            return `${main} ${sec}`.trim();
          },
          trim: true,
        })
      : (x: T[]) => x;

  const isOptionEqualToValue = (a: T, b: T) => optionKey(a) === optionKey(b);
  const safeGetLabel = (opt: T | null) => (opt ? optionLabel(opt) : '');

  const resolvedNoOptionsText = loading && !fetchedOnce ? loadingText : noOptionsText;

  const selectedCount = isMulti
    ? ((currentValue as T[])?.length ?? 0)
    : (currentValue as T | null)
      ? 1
      : 0;
  const effectivePlaceholder = isMulti && selectedCount > 0 ? '' : placeholder;

  return (
    <Box sx={SX.wrapper}>
      <Box sx={SX.titles_container}>
        <Typography sx={SX.title}>{title}</Typography>
        {extraTitle && <Typography sx={SX.extra_title}>{extraTitle}</Typography>}
        {hasStar && <Typography sx={SX.star}>*</Typography>}
      </Box>

      <Autocomplete
        id={id}
        size="small"
        fullWidth
        disabled={disabled}
        options={options}
        value={currentValue as any}
        multiple={isMulti}
        disableCloseOnSelect={isMulti}
        limitTags={isMulti ? limitTags : undefined}
        loading={loading}
        filterOptions={filterOptions}
        getOptionLabel={(opt) => safeGetLabel(opt)}
        getOptionDisabled={getOptionDisabled}
        isOptionEqualToValue={isOptionEqualToValue}
        noOptionsText={resolvedNoOptionsText}
        loadingText={loadingText}
        clearOnEscape
        disableClearable={!allowClear}
        onChange={(_, newVal) => (emitChange as any)(newVal)}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        PopperComponent={PopperAligned}
        ListboxProps={{ sx: { direction: 'rtl', textAlign: 'right' } }}
        renderTags={
          isMulti
            ? (selected, getTagProps) =>
                (selected as T[]).map((opt, index) => {
                  const tagProps = getTagProps({ index });

                  const { key: chipKey, onDelete, ...chipProps } = tagProps as any;

                  return (
                    <Chip
                      key={chipKey}
                      {...chipProps}
                      label={optionLabel(opt)}
                      size="small"
                      tabIndex={-1}
                      onMouseDown={(e: any) => e.preventDefault()}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onDelete?.(e);
                      }}
                      sx={{
                        direction: 'rtl',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        '& .MuiChip-label': { px: 1 },
                        '& .MuiChip-deleteIcon': { display: 'none' },
                        '&:hover': (theme) => ({
                          backgroundColor: alpha(theme.palette.error.main, 0.12),
                          color: theme.palette.error.main,
                        }),
                      }}
                    />
                  );
                })
            : undefined
        }
        renderOption={(optionProps, option, state) => {
          const { key: liKey, ...liProps } = optionProps as any;

          return (
            <li {...liProps} key={liKey}>
              {isMulti && (
                <Checkbox
                  checked={state.selected}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  sx={{ mr: 1 }}
                />
              )}
              <ListItemText
                primary={optionLabel(option)}
                secondary={optionSecondary?.(option)}
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={effectivePlaceholder}
            variant="outlined"
            // error={isError}
            // helperText={isError ? errorText : undefined}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E7E6E6' },
              },
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgb(124, 124, 124)',
                color: 'rgb(124, 124, 124)',
                opacity: 1,
              },
              ...(textFieldSx as any),
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
}
