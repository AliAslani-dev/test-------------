'use client';

import { tPD } from '@/utils';
import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import { ProductModalMode, UIProductVariant } from '..';
import { Box, Button, Typography } from '@mui/material';
import { DECIMAL_NUMBER_RE, NUMBER_RE } from '@/constants';
import CustomTextField from '@/components/shared/custom-text-field';
import SX from '@/components/product/components/dialog/variant/styles';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';

interface ProductDialogVariantProps {
  mode: ProductModalMode;
  index: number;
  setVariants: React.Dispatch<React.SetStateAction<UIProductVariant[]>>;
  initialState: UIProductVariant;
  rowKey: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const normalizeDecimal = (s: string) => s.trim().replace(',', '.');

const ProductDialogVariant: FunctionComponent<ProductDialogVariantProps> = ({
  mode,
  index,
  setVariants,
  initialState,
  rowKey,
}) => {
  const { lang } = useLang();
  const { t } = useText('product', lang);

  const [stock, setStock] = useState<string>(String(initialState.stock ?? '0'));
  const [weight, setWeight] = useState<string>(String(initialState.weight ?? '0'));
  const [extraPrice, setExtraPrice] = useState<string>(String(initialState.extraPrice ?? '0'));
  const [extraWage, setExtraWage] = useState<string>(String(initialState.extraWage ?? '0'));

  const weightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStock(String(initialState.stock ?? '0'));
    setWeight(String(initialState.weight ?? '0'));
    setExtraPrice(String(initialState.extraPrice ?? '0'));
    setExtraWage(String(initialState.extraWage ?? '0'));
  }, [initialState]);

  useEffect(() => {
    return () => {
      if (weightTimer.current) clearTimeout(weightTimer.current);
    };
  }, []);

  const isExisting = useMemo(
    () => (typeof initialState.id === 'number' ? initialState.id > 0 : false),
    [initialState.id],
  );

  // In edit mode, existing variants CAN be edited (except for weight).
  const allDisabled = mode === 'view';
  const weightDisabled = mode === 'view' || (mode === 'edit' && isExisting);

  const updateVariant = (patch: Partial<UIProductVariant>) => {
    setVariants((prev) => prev.map((v) => (v._key === rowKey ? { ...v, ...patch } : v)));
  };

  const handleStockChange = (value: string) => {
    setStock(value);

    const trimmed = value.trim();
    if (trimmed === '') return;
    if (!NUMBER_RE.test(trimmed)) return;

    const n = clamp(Math.floor(Number(trimmed)), 0, 99999);
    updateVariant({ stock: n });
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);

    if (weightTimer.current) clearTimeout(weightTimer.current);

    weightTimer.current = setTimeout(() => {
      const normalized = normalizeDecimal(value);
      if (normalized === '') return;
      if (!DECIMAL_NUMBER_RE.test(normalized)) return;

      const n = Number(normalized);
      if (Number.isNaN(n)) return;

      const four = Math.round(n * 1e4) / 1e4;
      updateVariant({ weight: clamp(four, 0, 99999) });
    }, 700);
  };

  const handleExtraWageChange = (value: string) => {
    setExtraWage(value);

    const trimmed = value.trim();
    if (trimmed === '') return;
    if (!NUMBER_RE.test(trimmed)) return;

    const n = clamp(Math.floor(Number(trimmed)), 0, 99999999999);
    updateVariant({ extraWage: n });
  };

  const handleExtraPriceChange = (value: string) => {
    setExtraPrice(value);

    const trimmed = value.trim();
    if (trimmed === '') return;
    if (!NUMBER_RE.test(trimmed)) return;

    const n = clamp(Math.floor(Number(trimmed)), 0, 99999999999);
    updateVariant({ extraPrice: n });
  };

  const canRemove = useMemo(() => {
    if (mode === 'view') return false;
    if (mode === 'add') return true;
    return !isExisting; // Cannot remove variants that already exist
  }, [mode, isExisting]);

  const onRemoveClick = () => {
    setVariants((prev) => prev.filter((v) => v._key !== rowKey));
  };

  const isEditableRow = !allDisabled;

  return (
    <Box
      sx={
        isEditableRow && (weight === '0' || weight === '' || stock === '' || stock === '0')
          ? SX.wrapper_error
          : SX.wrapper
      }
    >
      <Box sx={SX.header}>
        <Typography sx={SX.header_value}>
          {t('dialog.variant.product_variant_number') + ' ' + tPD(index + 1)}
        </Typography>

        {canRemove && (
          <Button onClick={onRemoveClick} variant="contained" sx={SX.remove_button}>
            {t('dialog.variant.remove_variant')}
          </Button>
        )}
      </Box>

      <Box sx={SX.inputs_wrapper}>
        <Box sx={SX.main_inputs}>
          <CustomTextField
            id={`weight-${rowKey}`}
            title={
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.palette.grey[500],
                  mb: '-3px',
                }}
              >
                {t('dialog.variant.weight')}{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 900,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    color: 'rgb(191, 5, 5)',
                  }}
                >
                  {t('dialog.variant.of_pure_gold')}
                </Box>{' '}
                ({t('dialog.variant.gram')})
              </Typography>
            }
            value={weight}
            setValue={handleWeightChange}
            numeric="decimal"
            decimalScale={4}
            min={0}
            max={99999}
            validate={(v) => DECIMAL_NUMBER_RE.test(normalizeDecimal(String(v)))}
            onBlurNormalized={(normalized) => {
              const norm = normalizeDecimal(normalized);
              if (norm === '' || !DECIMAL_NUMBER_RE.test(norm)) return;

              const n = Number(norm);
              if (Number.isNaN(n)) return;

              const four = Math.round(n * 1e4) / 1e4;
              updateVariant({ weight: clamp(four, 0, 99999) });
            }}
            disabled={weightDisabled}
          />

          <CustomTextField
            id={`stock-${rowKey}`}
            title={t('dialog.variant.stock')}
            value={stock}
            setValue={handleStockChange}
            numeric="int"
            min={0}
            max={99999}
            validate={(v) => NUMBER_RE.test(String(v).trim())}
            disabled={allDisabled}
          />
        </Box>

        <Box sx={SX.secondary_inputs}>
          <CustomTextField
            id={`extraWage-${rowKey}`}
            title={t('dialog.variant.extra_wage')}
            value={extraWage}
            setValue={handleExtraWageChange}
            numeric="int"
            min={0}
            max={99999999999}
            validate={(v) => NUMBER_RE.test(String(v).trim())}
            disabled={allDisabled}
          />

          <CustomTextField
            id={`extraPrice-${rowKey}`}
            title={t('dialog.variant.extra_price')}
            value={extraPrice}
            setValue={handleExtraPriceChange}
            numeric="int"
            min={0}
            max={99999999999}
            validate={(v) => NUMBER_RE.test(String(v).trim())}
            disabled={allDisabled}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDialogVariant;
