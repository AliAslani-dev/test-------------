'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { NAME_RE } from '@/constants';
import Slide from '@mui/material/Slide';
import { ProductTable } from '../table';
import { LoadingButton } from '@mui/lab';
import ProductDialogVariant from './variant';
import { useLang } from '@/hooks/LanContext';
import CloseIcon from '@mui/icons-material/Close';
import { ProductVariant } from '@/api/product/dto';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import SX from '@/components/product/components/dialog/styles';
import CustomTextField from '@/components/shared/custom-text-field';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import MultipleImageUploader from '@/components/shared/multiple-images-uploader';
import {
  addProduct,
  editProduct,
  addProductVariant,
  editProductVariant,
} from '@/api/product/service';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  mode: ProductModalMode;
  showingProduct: ProductTable | undefined;
  onAdded?: () => void;
  onCommitted?: () => void | Promise<void>;
  bucketId: number;
  frameId: number;
}

export type ProductModalMode = 'add' | 'view' | 'edit';
export type UIProductVariant = ProductVariant & { _key: string };

const makeStableKey = () =>
  globalThis.crypto?.randomUUID?.() ?? `tmp_${Math.random().toString(36).slice(2)}`;

const makeDraftVariant = (id: number): UIProductVariant => ({
  id,
  stock: 0,
  weight: 0,
  extraPrice: 0,
  extraWage: 0,
  _key: makeStableKey(),
});

const ProductDialog: FunctionComponent<ProductDialogProps> = ({
  open,
  onClose,
  mode,
  showingProduct,
  onAdded,
  onCommitted,
  bucketId,
  frameId,
}) => {
  if (!bucketId || !frameId) return <></>;

  const { lang } = useLang();
  const { t } = useText('product', lang);
  const { showNotification } = useNotification();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const uploaderHeight = isMdUp ? 280 : isSmUp ? 240 : 215;

  const [model, setModel] = useState<string>('');
  const [variants, setVariants] = useState<UIProductVariant[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const variantCounter = useRef(-1);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' || mode === 'view') {
      setModel(showingProduct?.model ?? '');

      const initial: UIProductVariant[] = (showingProduct?.variants ?? []).map(
        (v: ProductVariant) => ({
          ...v,
          _key: makeStableKey(),
        }),
      );

      setVariants(initial);
      setImages(showingProduct?.images ?? []);
      setFiles([]);
      return;
    }

    setModel('');
    setVariants([]);
    setImages([]);
    setFiles([]);
  }, [open, mode, showingProduct?.id]);

  const addModeFormIsValid = useMemo(() => {
    if (mode !== 'add') return true;
    const modelOk = NAME_RE.test(model.trim());
    const imagesOk = files.length > 0;
    return modelOk && imagesOk;
  }, [mode, model, files]);

  const hasChanges = useMemo(() => {
    if (mode !== 'edit' || !showingProduct) return false;

    if (model.trim() !== showingProduct.model) return true;

    if (files.length > 0) return true;

    const originalVariantsMap = new Map(showingProduct.variants.map((v) => [v.id, v]));

    for (const v of variants) {
      // It's a newly added variant
      if (!v.id || v.id <= 0) return true;

      // Existing variant updated
      const orig = originalVariantsMap.get(v.id);
      if (orig) {
        if (
          Number(v.stock) !== Number(orig.stock) ||
          Number(v.extraPrice) !== Number(orig.extraPrice) ||
          Number(v.extraWage) !== Number(orig.extraWage)
        ) {
          return true;
        }
      }
    }

    return false;
  }, [mode, showingProduct, model, files, variants]);

  // Validates weights are > 0 and Unique across all variants
  const validateVariantWeightsUnique = (list: UIProductVariant[]) => {
    const seen = new Map<string, number[]>();
    let ok = true;

    for (let i = 0; i < list.length; i++) {
      const w = Number(list[i].weight);

      if (!Number.isFinite(w) || w <= 0) {
        ok = false;
        showNotification(
          `${t('dialog.variant_no')} ${i + 1}: ${t('dialog.enter_the_weight')}.`,
          'error',
        );
        continue;
      }

      const key = String(w);
      const arr = seen.get(key);
      if (arr) arr.push(i);
      else seen.set(key, [i]);
    }

    for (const [, idxs] of seen.entries()) {
      if (idxs.length > 1) {
        ok = false;
        const rows = idxs.map((x) => x + 1).join(', ');
        showNotification(
          `${t('dialog.same_weight_in_rows')} ${rows} ${t('dialog.is_not_allowed')}.`,
          'error',
        );
      }
    }

    return ok;
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setModel('');
    setVariants([]);
    setImages([]);
    setFiles([]);
  };

  const onAddVariantButtonClick = () => {
    variantCounter.current = variantCounter.current - 1;
    setVariants((prev) => prev.concat([makeDraftVariant(variantCounter.current)]));
  };

  const onButtonClick = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (mode === 'add') {
        if (!NAME_RE.test(model.trim())) {
          showNotification(t('dialog.invalid_product_name'), 'error');
          return;
        }
        if (files.length === 0) {
          showNotification(t('dialog.select_at_least_one_image'), 'error');
          return;
        }
        if (!validateVariantWeightsUnique(variants)) return;

        const created = await addProduct(
          bucketId,
          frameId,
          model.trim(),
          files[0],
          files[1],
          files[2],
          files[3],
          files[4],
        );

        const productId = created?.product_id;
        if (!productId) {
          showNotification(t('dialog.product_created_but_no_product_id_received'), 'error');
          return;
        }

        await Promise.all(
          variants.map((v) =>
            addProductVariant(
              bucketId,
              frameId,
              productId,
              Number(v.stock ?? 0),
              Number(v.weight ?? 0),
              Number(v.extraPrice ?? 0),
              Number(v.extraWage ?? 0),
            ),
          ),
        );

        showNotification(t('dialog.add.success_notification'), 'success');
        onAdded?.();
        handleClose();
        return;
      }

      if (mode === 'edit') {
        const productId = Number(showingProduct?.id ?? 0);
        if (!productId) return;

        if (!validateVariantWeightsUnique(variants)) return;

        const promises: Promise<any>[] = [];

        const modelToSend = model.trim() !== showingProduct?.model ? model.trim() : undefined;
        if (modelToSend !== undefined || files.length > 0) {
          promises.push(
            editProduct(
              bucketId,
              productId,
              modelToSend,
              files[0],
              files[1],
              files[2],
              files[3],
              files[4],
            ),
          );
        }

        const originalVariantsMap = new Map(showingProduct?.variants.map((v) => [v.id, v]));

        for (const v of variants) {
          if (!v.id || v.id <= 0) {
            promises.push(
              addProductVariant(
                bucketId,
                frameId,
                productId,
                Number(v.stock ?? 0),
                Number(v.weight ?? 0),
                Number(v.extraPrice ?? 0),
                Number(v.extraWage ?? 0),
              ),
            );
          } else {
            const orig = originalVariantsMap.get(v.id);
            if (orig) {
              if (
                Number(v.stock) !== Number(orig.stock) ||
                Number(v.extraPrice) !== Number(orig.extraPrice) ||
                Number(v.extraWage) !== Number(orig.extraWage)
              ) {
                promises.push(
                  editProductVariant(
                    bucketId,
                    v.id,
                    Number(v.stock ?? 0),
                    Number(v.extraPrice ?? 0),
                    Number(v.extraWage ?? 0),
                  ),
                );
              }
            }
          }
        }

        await Promise.all(promises);

        showNotification(t('dialog.edit.success_notification'), 'success');

        try {
          await onCommitted?.();
        } catch {}

        handleClose();
        return;
      }
    } catch (e) {
      showNotification(
        mode === 'add' ? t('dialog.add.error_notification') : t('dialog.edit.error_notification'),
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      scroll="paper"
      slots={isMobile ? { transition: Slide } : undefined}
      slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
      sx={{
        ...DialogSX.dialog,
        ...(isMobile && DialogSX.bottom_sheet_dialog),
      }}
      PaperProps={{ sx: { touchAction: 'manipulation' } }}
    >
      <Box sx={DialogSX.header_container}>
        <DialogTitle sx={DialogSX.header_title}>{t(`dialog.${mode}.title`)}</DialogTitle>
        <IconButton onClick={handleClose} aria-label={t('dialog.close')}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={DialogSX.dialog_content}>
        <Box sx={SX.dialog_content_wrapper}>
          <Box sx={SX.inputs_wrapper}>
            <Box sx={SX.top_inputs}>
              <Box sx={SX.image_container}>
                <MultipleImageUploader
                  value={files}
                  onChange={(f) => {
                    setFiles(f);
                    if (f && f.length > 0) setImages([]);
                  }}
                  defaultValueUrl={images.length !== 0 ? images : undefined}
                  disabled={mode === 'view'}
                  height={uploaderHeight}
                  suportedCountHelperText={t('dialog.image_uploader_suported_count_helper_text')}
                  maxFileSizeBytes={5 * 1024 * 1024}
                  supportedSizeText={t('dialog.image_uploader_supported_size_text')}
                  maxFileSizeBytesErrorMessage={t(
                    'dialog.image_uploader_max_file_size_bytes_error_message',
                  )}
                />
              </Box>

              <Box sx={SX.top_right_inputs}>
                <CustomTextField
                  id="model"
                  value={model}
                  setValue={setModel}
                  title={t('dialog.model')}
                  validate={(v) => NAME_RE.test(v.trim())}
                  disabled={mode === 'view'}
                  hasStar={mode === 'add'}
                />
              </Box>
            </Box>
          </Box>

          <Typography sx={SX.variant_title}>{t('dialog.variant_title')}</Typography>

          <Box sx={SX.variants_wrapper}>
            {variants.map((v, i) => (
              <ProductDialogVariant
                key={v._key}
                rowKey={v._key}
                index={i}
                initialState={v}
                setVariants={setVariants}
                mode={mode}
              />
            ))}
          </Box>

          {mode !== 'view' && (
            <Button
              onClick={onAddVariantButtonClick}
              variant="contained"
              sx={SX.add_variant_button}
            >
              {t('dialog.add_variant')}
            </Button>
          )}

          {mode !== 'view' && (
            <LoadingButton
              onClick={onButtonClick}
              variant="contained"
              loading={loading}
              disabled={
                loading ||
                (mode === 'add' && !addModeFormIsValid) ||
                (mode === 'edit' && !hasChanges)
              }
              sx={SX.continue_button}
            >
              {t(`dialog.${mode}.button`)}
            </LoadingButton>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
