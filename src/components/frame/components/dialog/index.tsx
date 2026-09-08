'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { FrameTable } from '../table';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { useLang } from '@/hooks/LanContext';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { CategoryField } from '@/api/admin/category/dto';
import { useNotification } from '@/hooks/useNotification';
import { addFrame, editFrame } from '@/api/frame/service';
import SX from '@/components/frame/components/dialog/styles';
import { FrameCaratSelect } from '@/components/frame-carat/select';
import CustomTextField from '@/components/shared/custom-text-field';
import SearchableSelect from '@/components/shared/searchable-select';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { DECIMAL_NUMBER_RE, NAME_RE, PERCENT_NUMBER_RE } from '@/constants';
import MultipleImageUploader from '@/components/shared/multiple-images-uploader';
import { CategorySelect, GenderCategorySelect } from '@/components/category/components/select';
import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  FrameCaratDTO,
  FrameCategoryDTO,
  FrameGenderCategoryDTO,
  FrameAdditionalFields,
} from '@/api/frame/dto';

interface FrameDialogProps {
  open: boolean;
  onClose: () => void;
  mode: FrameModalMode;
  showingFrame: FrameTable | undefined;
  onAdded?: () => void;
  onEdited?: (id: number, patch: Partial<FrameTable>) => void;
  bucketId: number;
  categories: FrameCategoryDTO[];
}

export type FrameModalMode = 'add' | 'view' | 'edit';

const FrameDialog: FunctionComponent<FrameDialogProps> = ({
  open,
  onClose,
  mode,
  showingFrame,
  onAdded,
  onEdited,
  bucketId,
  categories,
}) => {
  if (!bucketId) return <></>;
  const { lang } = useLang();
  const { t } = useText('frame', lang);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const uploaderHeight = isMdUp ? 320 : isSmUp ? 240 : 260;

  const [model, setModel] = useState<string>('');
  const [wage, setWage] = useState<string>('0');
  const [profit, setProfit] = useState<string>('0');
  const [discount, setDiscount] = useState<string>('0');
  const [selectedCarat, setSelectedCarat] = useState<FrameCaratDTO | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FrameCategoryDTO | null>(null);
  const [selectedGenderCategory, setSelectedGenderCategory] =
    useState<FrameGenderCategoryDTO | null>(null);
  const [totalWeight, setTotalWeight] = useState<string>('');
  const [minWeight, setMinWeight] = useState<string>('');
  const [maxWeight, setMaxWeight] = useState<string>('');
  const [blur, setBlur] = useState<0 | 1>(0);
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [additionalFields, setAdditionalFields] = useState<FrameAdditionalFields>({});

  useEffect(() => {
    if (!open) return;

    if (mode === 'view' || mode === 'edit') {
      setModel(showingFrame?.model ?? '');
      setWage(showingFrame?.wage ?? '0');
      setProfit(showingFrame?.profit ?? '0');
      setDiscount(showingFrame?.discount ?? '0');
      setTotalWeight(showingFrame?.totalWeight ?? '');
      setMinWeight(showingFrame?.minWeight ?? '');
      setMaxWeight(showingFrame?.maxWeight ?? '');
      setBlur(showingFrame?.blur ?? 0);
      setImages(showingFrame?.covers ?? []);
      setFiles([]);

      if (showingFrame?.caratValue) {
        setSelectedCarat({
          amount: showingFrame.carat ?? '',
          value: showingFrame.caratValue,
        } as FrameCaratDTO);
      } else {
        setSelectedCarat(null);
      }

      if (showingFrame?.categoryId) {
        const fullCat = categories.find((c) => c.id === showingFrame.categoryId);
        if (fullCat) {
          setSelectedCategory(fullCat);
        } else {
          setSelectedCategory({
            id: showingFrame.categoryId,
            faName: showingFrame.category ?? '',
            enName: '',
            fields: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as FrameCategoryDTO);
        }
      } else {
        setSelectedCategory(null);
      }

      if (showingFrame?.genderCategoryId) {
        setSelectedGenderCategory({
          id: showingFrame.genderCategoryId,
          faName: showingFrame.genderCategory ?? '',
          enName: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FrameGenderCategoryDTO);
      } else {
        setSelectedGenderCategory(null);
      }

      setCategoryFields([]);
      setAdditionalFields({});
    } else {
      // mode === 'add'
      setModel('');
      setWage('0');
      setProfit('0');
      setDiscount('0');
      setTotalWeight('');
      setMinWeight('');
      setMaxWeight('');
      setSelectedCarat(null);
      setSelectedCategory(null);
      setSelectedGenderCategory(null);
      setAdditionalFields({});
      setCategoryFields([]);
      setBlur(0);
      setImages([]);
      setFiles([]);
    }
  }, [open, mode, showingFrame?.id, categories]);

  useEffect(() => {
    if (!open) return;

    if (!selectedCategory) {
      setCategoryFields([]);
      setAdditionalFields({});
      return;
    }

    const catInList = categories.find((c) => c.id === selectedCategory.id);
    if (!catInList) {
      if ((mode === 'view' || mode === 'edit') && showingFrame?.additionalFields) {
        setAdditionalFields(showingFrame.additionalFields as FrameAdditionalFields);
      }
      return;
    }

    const fields = (catInList as any).fields as CategoryField[] | null | undefined;
    if (!fields || !fields.length) {
      setCategoryFields([]);
      setAdditionalFields({});
      return;
    }

    setCategoryFields(fields);

    setAdditionalFields((prev) => {
      const hasPrev = Object.keys(prev).length > 0;

      const seed: FrameAdditionalFields = hasPrev
        ? prev
        : ((showingFrame?.additionalFields as FrameAdditionalFields | null) ?? {});

      const next: FrameAdditionalFields = {};
      for (const f of fields) {
        const name = f.name;
        next[name] = seed?.[name] ?? '';
      }
      return next;
    });
  }, [open, selectedCategory, categories, mode, showingFrame?.id, showingFrame?.additionalFields]);

  const buildAdditionalFieldsPayload = (): FrameAdditionalFields | null => {
    const entries = Object.entries(additionalFields || {})
      .map(([name, rawVal]) => [name, String(rawVal ?? '').trim()] as [string, string])
      .filter(([, v]) => v !== '');
    if (!entries.length) return null;
    return Object.fromEntries(entries);
  };

  const additionalFieldsChanged = useMemo(() => {
    if (mode !== 'edit' || !showingFrame) return false;

    const original = showingFrame.additionalFields as FrameAdditionalFields | null;
    const current = buildAdditionalFieldsPayload();

    if (!original && !current) return false;
    if (!original || !current) return true;

    const currentKeys = Object.keys(current);
    const originalKeys = Object.keys(original);

    if (currentKeys.length !== originalKeys.length) return true;

    for (const key of currentKeys) {
      if (current[key] !== original[key]) return true;
    }

    return false;
  }, [additionalFields, showingFrame, mode]);

  const hasAnyChanges = useMemo(() => {
    if (mode !== 'edit' || !showingFrame) return false;

    return (
      model.trim() !== (showingFrame.model ?? '').trim() ||
      wage !== (showingFrame.wage ?? '0') ||
      profit !== (showingFrame.profit ?? '0') ||
      discount !== (showingFrame.discount ?? '0') ||
      minWeight !== (showingFrame.minWeight ?? '') ||
      maxWeight !== (showingFrame.maxWeight ?? '') ||
      totalWeight !== (showingFrame.totalWeight ?? '') ||
      files.length > 0 ||
      blur !== showingFrame.blur ||
      additionalFieldsChanged
    );
  }, [
    model,
    wage,
    profit,
    discount,
    minWeight,
    maxWeight,
    totalWeight,
    files,
    blur,
    additionalFieldsChanged,
    showingFrame,
    mode,
  ]);

  const additionalFieldsValid = useMemo(() => {
    if (!categoryFields.length) return true;
    return categoryFields.every((f) => {
      const raw = additionalFields[f.name];
      const v = (raw ?? '').toString().trim();
      return v !== '';
    });
  }, [categoryFields, additionalFields]);

  const formIsValid = useMemo(() => {
    if (mode === 'view') return false;

    const modelValue = model.trim();
    const namesOk = NAME_RE.test(modelValue.trim());

    const isNum = (v: string, allowZero = false) =>
      DECIMAL_NUMBER_RE.test(v) && (allowZero || (v !== '0' && v !== ''));

    const numbersOK =
      isNum(wage, true) &&
      isNum(profit, true) &&
      PERCENT_NUMBER_RE.test(discount) &&
      isNum(totalWeight) &&
      isNum(minWeight) &&
      isNum(maxWeight);

    if (mode === 'add') {
      const imagesOk = files.length > 0;
      const hasCarat = !!selectedCarat?.value;
      const hasCategory = !!selectedCategory?.id;
      return namesOk && numbersOK && hasCarat && hasCategory && additionalFieldsValid && imagesOk;
    }

    if (mode === 'edit') {
      return namesOk && numbersOK && additionalFieldsValid && hasAnyChanges;
    }

    return false;
  }, [
    model,
    wage,
    profit,
    discount,
    totalWeight,
    minWeight,
    maxWeight,
    files,
    mode,
    selectedCarat,
    selectedCategory,
    additionalFieldsValid,
    hasAnyChanges,
  ]);

  const renderAdditionalField = (field: CategoryField) => {
    const value = additionalFields[field.name] ?? '';
    const hasOptions = Array.isArray(field.options) && field.options.length > 0;

    if (hasOptions) {
      return (
        <SearchableSelect<string>
          id={`frame-field-${field.name}`}
          title={field.name}
          hasStar
          loadOptions={async () => field.options ?? []}
          optionLabel={(opt) => opt}
          optionKey={(opt) => opt}
          multiple={false}
          value={value || null}
          onChange={(v) =>
            setAdditionalFields((prev) => ({
              ...prev,
              [field.name]: v ?? '',
            }))
          }
          disabled={mode === 'view'}
          placeholder={t('dialog.field_options_placeholder')}
        />
      );
    }

    return (
      <CustomTextField
        id={`frame-field-${field.name}`}
        value={value}
        setValue={(v) =>
          setAdditionalFields((prev) => ({
            ...prev,
            [field.name]: v,
          }))
        }
        title={field.name}
        validate={(v) => v.trim().length > 0}
        disabled={mode === 'view'}
        hasStar
      />
    );
  };

  const onButtonClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const additionalFieldsPayload = buildAdditionalFieldsPayload();

      if (mode === 'add') {
        if (!selectedCategory?.id || !selectedCarat) return;

        const concatedCategories = [selectedCategory.id];
        if (selectedGenderCategory?.id) concatedCategories.push(selectedGenderCategory.id);

        await addFrame(
          bucketId,
          concatedCategories,
          wage,
          profit,
          selectedCarat.value,
          model,
          discount,
          additionalFieldsPayload,
          Number(minWeight),
          Number(maxWeight),
          Number(totalWeight),
          blur,
          files[0],
          files[1],
          files[2],
        );

        showNotification(t('dialog.add.success_notification'), 'success');
        onAdded?.();
        handleClose();
      } else if (mode === 'edit') {
        if (!showingFrame?.id) return;

        const wageToSend = wage !== showingFrame.wage ? wage : undefined;
        const profitToSend = profit !== showingFrame.profit ? profit : undefined;
        const modelToSend = model !== showingFrame.model ? model : undefined;
        const discountToSend = discount !== showingFrame.discount ? discount : undefined;
        const minWeightToSend =
          minWeight !== showingFrame.minWeight ? Number(minWeight) : undefined;
        const maxWeightToSend =
          maxWeight !== showingFrame.maxWeight ? Number(maxWeight) : undefined;
        const totalWeightToSend =
          totalWeight !== showingFrame.totalWeight ? Number(totalWeight) : undefined;
        const afToSend = additionalFieldsChanged ? additionalFieldsPayload : undefined;

        const blurToSend = blur !== showingFrame.blur ? blur : undefined;

        await editFrame(
          bucketId,
          showingFrame.id,
          wageToSend,
          profitToSend,
          modelToSend,
          discountToSend,
          afToSend,
          minWeightToSend,
          maxWeightToSend,
          totalWeightToSend,
          blurToSend,
          files[0],
          files[1],
          files[2],
        );

        showNotification(t('dialog.edit.success_notification'), 'success');

        if (onEdited) {
          const patch: Partial<FrameTable> = {};

          if (modelToSend !== undefined) patch.model = modelToSend;
          if (wageToSend !== undefined) patch.wage = wageToSend;
          if (profitToSend !== undefined) patch.profit = profitToSend;
          if (discountToSend !== undefined) patch.discount = discountToSend;
          if (minWeightToSend !== undefined) patch.minWeight = String(minWeightToSend);
          if (maxWeightToSend !== undefined) patch.maxWeight = String(maxWeightToSend);
          if (totalWeightToSend !== undefined) patch.totalWeight = String(totalWeightToSend);
          if (afToSend !== undefined) patch.additionalFields = afToSend;
          if (blurToSend !== undefined) (patch as any).blur = blurToSend;

          if (files.length > 0) {
            const localUrls = files.map((f) => URL.createObjectURL(f));
            patch.covers = localUrls;
            patch.cover = localUrls[0];
          }

          onEdited(showingFrame.id, patch);
        }

        handleClose();
      }
    } catch (e) {
      showNotification(t(`dialog.${mode}.error_notification`), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleBlurChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlur(event.target.checked ? 1 : 0);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={'lg'}
      fullScreen={isMobile}
      scroll={'paper'}
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
                  maxFiles={3}
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
                  hasStar
                />
                <CategorySelect
                  value={selectedCategory}
                  setValue={setSelectedCategory}
                  disabled={mode !== 'add'}
                  hasStar
                />
                <GenderCategorySelect
                  value={selectedGenderCategory}
                  setValue={setSelectedGenderCategory}
                  disabled={mode !== 'add'}
                  hasStar={false}
                />
                <CustomTextField
                  id="total_weight"
                  title={t('dialog.total_weight')}
                  value={totalWeight}
                  setValue={setTotalWeight}
                  numeric={'decimal'}
                  decimalScale={4}
                  min={0}
                  max={99999}
                  validate={(v) => (DECIMAL_NUMBER_RE.test(v) && v !== '0') || v === ''}
                  disabled={mode === 'view'}
                  hasStar
                />
              </Box>
            </Box>

            <Box sx={SX.inputs_inner_wrapper}>
              <CustomTextField
                id="min_weight"
                title={t('dialog.min_weight')}
                value={minWeight}
                setValue={setMinWeight}
                numeric={'decimal'}
                decimalScale={4}
                min={0}
                max={99999}
                validate={(v) => (DECIMAL_NUMBER_RE.test(v) && v !== '0') || v === ''}
                disabled={mode === 'view'}
                hasStar
              />
              <CustomTextField
                id="max_weight"
                title={t('dialog.max_weight')}
                value={maxWeight}
                setValue={setMaxWeight}
                numeric={'decimal'}
                decimalScale={4}
                min={0}
                max={99999}
                validate={(v) => (DECIMAL_NUMBER_RE.test(v) && v !== '0') || v === ''}
                disabled={mode === 'view'}
                hasStar
              />
            </Box>

            <Box sx={SX.inputs_inner_wrapper}>
              <CustomTextField
                id="discount"
                title={t('dialog.discount')}
                value={discount}
                setValue={setDiscount}
                numeric={'decimal'}
                decimalScale={4}
                min={0}
                max={100}
                validate={(v) => PERCENT_NUMBER_RE.test(v)}
                disabled={mode === 'view'}
                hasStar
              />
              <FrameCaratSelect
                value={selectedCarat}
                setValue={setSelectedCarat}
                disabled={mode !== 'add'}
              />
            </Box>

            <Box sx={SX.inputs_inner_wrapper}>
              <CustomTextField
                id="wage"
                title={t('dialog.wage')}
                value={wage}
                setValue={setWage}
                numeric={'decimal'}
                decimalScale={4}
                min={0}
                max={100}
                validate={(v) => PERCENT_NUMBER_RE.test(v)}
                disabled={mode === 'view'}
                hasStar
              />
              <CustomTextField
                id="profit"
                title={t('dialog.profit')}
                value={profit}
                setValue={setProfit}
                numeric={'decimal'}
                decimalScale={4}
                min={0}
                max={100}
                validate={(v) => PERCENT_NUMBER_RE.test(v)}
                disabled={mode === 'view'}
                hasStar
              />
            </Box>

            {categoryFields.length > 0 &&
              (() => {
                const rows: CategoryField[][] = [];
                for (let i = 0; i < categoryFields.length; i += 2) {
                  rows.push(categoryFields.slice(i, i + 2));
                }

                return rows.map((row, idx) => (
                  <Box key={`additional-row-${idx}`} sx={SX.additional_fields_middle_inputs}>
                    <Box sx={SX.middle_inputs_side}>{row[0] && renderAdditionalField(row[0])}</Box>
                    <Box sx={SX.middle_inputs_side}>{row[1] && renderAdditionalField(row[1])}</Box>
                  </Box>
                ));
              })()}

            <FormControlLabel
              sx={{ mr: 0, mt: 2 }}
              control={
                <Checkbox
                  checked={blur === 1}
                  onChange={handleBlurChange}
                  disabled={mode === 'view'}
                  sx={{
                    color: '#ccc',
                    '&.Mui-checked': {
                      color: '#A67C00',
                    },
                    '&.Mui-disabled': {
                      color: '#eee',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    userSelect: 'none',
                    color: mode === 'view' ? 'text.disabled' : 'inherit',
                  }}
                >
                  {t('dialog.blur_accept_label')}
                </Typography>
              }
            />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, userSelect: 'none', mr: 5.25 }}>
              {t('dialog.note')}
            </Typography>
          </Box>

          {mode !== 'view' && (
            <LoadingButton
              onClick={onButtonClick}
              variant="contained"
              disabled={loading || !formIsValid}
              sx={SX.continue_button}
              loading={loading}
            >
              {t(`dialog.${mode}.button`)}
            </LoadingButton>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FrameDialog;
