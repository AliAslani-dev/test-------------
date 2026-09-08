'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { NAME_RE } from '@/constants';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { CategoryTable } from '../table';
import CloseIcon from '@mui/icons-material/Close';
import { CategoryField } from '@/api/admin/category/dto';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import SX from '@/components/category/components/dialog/styles';
import CustomTextField from '@/components/shared/custom-text-field';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { addCategory, editCategory } from '@/api/admin/category/service';
import FreeTextChipSelector from '@/components/shared/free-text-chip-selector';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useLang } from '@/hooks/LanContext';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  mode: CategoryModalMode;
  setMode: React.Dispatch<React.SetStateAction<CategoryModalMode>>;
  showingCategory: CategoryTable | undefined;
  setShowingCategory: React.Dispatch<React.SetStateAction<CategoryTable | undefined>>;
  onAdded?: (category: CategoryTable) => void;
  onEdited?: (id: number, patch: Partial<CategoryTable>) => void;
}
export type CategoryModalMode = 'add' | 'view' | 'edit';

const CategoryDialog: FunctionComponent<CategoryDialogProps> = ({
  open,
  onClose,
  mode,
  setMode,
  showingCategory,
  setShowingCategory,
  onAdded,
  onEdited,
}) => {
  const { lang } = useLang();
  const { t } = useText('category', lang);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [faName, setFaName] = useState<string>('');
  const [enName, setEnName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  type LocalField = { name: string; options: string[] };
  const [fields, setFields] = useState<LocalField[]>([]);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' || mode === 'view') {
      setFaName(showingCategory?.faName ?? '');
      setEnName(showingCategory?.enName ?? '');

      const incoming = showingCategory?.fields ?? [];
      setFields(
        incoming.map((f) => ({
          name: f.name,
          options: f.options ?? [],
        })),
      );
    } else {
      setFaName('');
      setEnName('');
      setFields([]);
    }
  }, [open, mode, showingCategory?.id]);

  const fieldsValid = useMemo(() => fields.every((f) => f.name.trim().length > 0), [fields]);

  const addFormIsValid = useMemo(() => {
    return NAME_RE.test(faName.trim()) && NAME_RE.test(enName.trim()) && fieldsValid;
  }, [faName, enName, fieldsValid]);

  const editFormIsValid = useMemo(() => {
    if (!NAME_RE.test(faName.trim()) && !NAME_RE.test(enName.trim())) return false;
    if (!fieldsValid) return false;

    const namesUnchanged = faName === showingCategory?.faName && enName === showingCategory?.enName;

    const normalizedOriginal = (showingCategory?.fields ?? []).map((f) => ({
      name: f.name.trim(),
      options: (f.options ?? []).slice().sort(),
    }));

    const normalizedCurrent = fields.map((f) => ({
      name: f.name.trim(),
      options: f.options.slice().sort(),
    }));

    const fieldsUnchanged =
      JSON.stringify(normalizedOriginal) === JSON.stringify(normalizedCurrent);

    if (namesUnchanged && fieldsUnchanged) return false;

    return true;
  }, [faName, enName, fieldsValid, fields, showingCategory]);

  const onButtonClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const normalizedFields: CategoryField[] = fields
        .map((f) => {
          const name = f.name.trim();
          if (!name) return null;
          const base: CategoryField = { name };
          if (f.options.length) {
            base.options = f.options;
          }
          return base;
        })
        .filter((f): f is CategoryField => f !== null);

      switch (mode) {
        case 'add': {
          const created = await addCategory(enName, faName, normalizedFields);
          showNotification(t('dialog.add.success_notification'), 'success');

          const data = (created?.data ?? created) as Partial<CategoryTable> | undefined;
          const newCategory: CategoryTable = {
            id: data?.id ?? Date.now(),
            faName: data?.faName ?? faName,
            enName: data?.enName ?? enName,
            fields: normalizedFields,
            actions: <></>,
          };
          onAdded?.(newCategory);
          handleClose();
          break;
        }

        case 'edit': {
          if (!showingCategory?.id) {
            setLoading(false);
            break;
          }

          const originalFields = (showingCategory.fields ?? []).map((f) => ({
            name: f.name.trim(),
            options: (f.options ?? []).slice().sort(),
          }));
          const currentFields = normalizedFields.map((f) => ({
            name: f.name.trim(),
            options: (f.options ?? []).slice().sort(),
          }));
          const fieldsChanged = JSON.stringify(originalFields) !== JSON.stringify(currentFields);

          await editCategory(
            showingCategory.id,
            enName === showingCategory.enName ? null : enName,
            faName === showingCategory.faName ? null : faName,
            fieldsChanged ? normalizedFields : null,
          );

          showNotification(t('dialog.edit.success_notification'), 'success');

          onEdited?.(showingCategory.id, {
            faName,
            enName,
            fields: normalizedFields,
          });

          handleClose();
          break;
        }

        default:
          break;
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

  const handleClose = () => {
    if (loading) return;
    onClose();
    setFaName('');
    setEnName('');
    setFields([]);
  };

  const onAddFieldButtonClick = () => {
    setFields((prev) => [...prev, { name: '', options: [] }]);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      slots={isMobile ? { transition: Slide } : undefined}
      slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
      sx={{
        ...DialogSX.dialog,
        ...(isMobile && DialogSX.bottom_sheet_dialog),
      }}
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
            <CustomTextField
              id="faName"
              value={faName}
              setValue={setFaName}
              title={t('dialog.fa_name')}
              validate={(v) => NAME_RE.test(v.trim())}
              disabled={mode === 'view'}
              hasStar
            />
            <CustomTextField
              id="enName"
              value={enName}
              setValue={setEnName}
              title={t('dialog.en_name')}
              validate={(v) => NAME_RE.test(v.trim())}
              disabled={mode === 'view'}
              hasStar
            />
          </Box>

          {fields.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {fields.map((field, index) => (
                <Box
                  key={index}
                  sx={{
                    borderRadius: 2,
                    border: '2px solid rgba(203, 175, 113, 0.35)',
                    p: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
                    alignItems: { xs: 'initial', sm: 'initial', md: 'center', lg: 'center' },
                    gap: 1.5,
                    bgcolor: 'rgba(203, 175, 113, 0.04)',
                  }}
                >
                  <Box sx={{ width: { xs: '100%', sm: '100%', md: '35%', lg: '35%' } }}>
                    <CustomTextField
                      id={`field-name-${index}`}
                      value={field.name}
                      setValue={(v) =>
                        setFields((prev) =>
                          prev.map((f, i) => (i === index ? { ...f, name: v } : f)),
                        )
                      }
                      title={t('dialog.field_name')}
                      validate={(v) => v.trim().length > 0}
                      disabled={mode === 'view'}
                      hasStar
                    />
                  </Box>

                  <FreeTextChipSelector
                    id={`field-options-${index}`}
                    title={t('dialog.field_options')}
                    value={field.options}
                    setValue={(updater) =>
                      setFields((prev) =>
                        prev.map((f, i) => {
                          if (i !== index) return f;

                          const nextOptions =
                            typeof updater === 'function' ? updater(f.options) : updater;

                          return { ...f, options: nextOptions };
                        }),
                      )
                    }
                    disabled={mode === 'view'}
                    placeholder={t('dialog.field_options_placeholder')}
                  />

                  {mode !== 'view' && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: { xs: '0', sm: '0', md: '25px', lg: '25px' },
                      }}
                    >
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => setFields((prev) => prev.filter((_, i) => i !== index))}
                      >
                        {t('dialog.field_remove')}
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {mode !== 'view' && (
            <Button onClick={onAddFieldButtonClick} variant="contained" sx={SX.add_field_button}>
              {t('dialog.adding_field')}
            </Button>
          )}

          {mode !== 'view' && (
            <LoadingButton
              onClick={onButtonClick}
              variant="contained"
              disabled={
                loading ||
                (mode === 'add' && !addFormIsValid) ||
                (mode === 'edit' && !editFormIsValid)
              }
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

export default CategoryDialog;
