'use client';

import Image from 'next/image';
import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import { useNotification } from '@/hooks/useNotification';
import { useEffect, useMemo, useRef, useState } from 'react';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { Box, Typography, IconButton, Stack, alpha } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

type Props = {
  value?: File[];
  defaultValueUrl?: string[];
  onChange?: (files: File[]) => void;
  width?: number | string;
  height?: number | string;
  accept?: string;
  disabled?: boolean;
  maxFiles?: number;
  suportedCountHelperText?: string;
  maxFileSizeBytes?: number;
  maxFileSizeBytesErrorMessage?: string;
  supportedSizeText?: string;
};

const ACCEPT_DEFAULT = 'image/*';
const MAX_FILE_SIZE_BYTES_DEFAULT = 1024 * 1024; // 1 MB

export default function MultipleImageUploader({
  value,
  defaultValueUrl,
  onChange,
  width = '100%',
  height = 260,
  accept = ACCEPT_DEFAULT,
  disabled = false,
  maxFiles = 5,
  suportedCountHelperText,
  maxFileSizeBytes = MAX_FILE_SIZE_BYTES_DEFAULT,
  maxFileSizeBytesErrorMessage,
  supportedSizeText,
}: Props) {
  const { lang } = useLang();
  const { t } = useText('base', lang);
  const { showNotification } = useNotification();

  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const files = value ?? internalFiles;

  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrls = useMemo(() => {
    if (files.length === 0 && defaultValueUrl?.length) {
      return [...defaultValueUrl];
    }

    return files.map((f) => URL.createObjectURL(f));
  }, [files, defaultValueUrl]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const canAddMore = files.length < maxFiles;

  const pick = () => {
    if (disabled || !canAddMore) return;
    inputRef.current?.click();
  };

  const addFiles = (incoming: File[]) => {
    if (!incoming.length || !canAddMore) return;

    const oversized = incoming.filter((f) => f.size > maxFileSizeBytes);
    if (oversized.length) {
      showNotification(maxFileSizeBytesErrorMessage ?? t('image_uploader.size_limit'), 'warning');
    }

    const valid = incoming.filter((f) => f.type.startsWith('image/') && f.size <= maxFileSizeBytes);

    const remainingSlots = Math.max(0, maxFiles - files.length);
    const limited = valid.slice(0, remainingSlots);
    if (!limited.length) return;

    const updated = [...files, ...limited];
    setInternalFiles(updated);
    onChange?.(updated);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length) addFiles(incoming);
    e.currentTarget.value = '';
  };

  const deleteCurrent = () => {
    const newFiles = files.filter((_, i) => i !== currentIndex);
    setInternalFiles(newFiles);
    onChange?.(newFiles);

    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const next = () => setCurrentIndex((i) => (i + 1 >= previewUrls.length ? 0 : i + 1));
  const prev = () => setCurrentIndex((i) => (i - 1 < 0 ? previewUrls.length - 1 : i - 1));

  const hasImages = previewUrls.length > 0;
  const previewUrl = hasImages ? previewUrls[currentIndex] : null;

  return (
    <Box
      ref={containerRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={pick}
      sx={{
        width,
        height,
        minHeight: height,
        borderRadius: 2,
        border: (t) =>
          `2px dashed ${dragOver ? t.palette.primary.main : alpha(t.palette.text.primary, 0.25)}`,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && canAddMore) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled || !canAddMore) return;

        const incoming = Array.from(e.dataTransfer.files ?? []);
        addFiles(incoming);
      }}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        multiple
        onChange={onInputChange}
        disabled={disabled || !canAddMore}
      />

      {!hasImages ? (
        <Box sx={{ textAlign: 'center', px: 2, userSelect: 'none' }}>
          <UploadRoundedIcon fontSize="large" />
          <Typography variant="body1" fontSize={12} fontWeight={600} mt={1}>
            {t('image_uploader.drop_your_image_here_or_browse')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" fontSize={10} color="text.secondary">
              {t('image_uploader.supported_formats')}
            </Typography>
            <Typography variant="caption" fontSize={10} color="text.secondary">
              {supportedSizeText ?? t('image_uploader.supported_size')}
            </Typography>
            <Typography variant="caption" fontSize={10} color="text.secondary">
              {suportedCountHelperText ?? t('image_uploader.supported_count')}
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              p: '15px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'white',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Image
                src={previewUrl!}
                alt="Selected"
                fill
                sizes="100vw"
                loader={({ src }) => src}
                style={{ objectFit: 'contain', pointerEvents: 'none' }}
              />
            </Box>
          </Box>

          {!disabled && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                top: 14,
                right: 12,
                bgcolor: (t) => alpha(t.palette.background.paper, 0.7),
                backdropFilter: 'blur(6px)',
                borderRadius: 999,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCurrent();
                }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}

          {previewUrls.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.7)',
                }}
              >
                <ArrowBackIosNewRoundedIcon fontSize="small" />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.7)',
                }}
              >
                <ArrowForwardIosRoundedIcon fontSize="small" />
              </IconButton>
            </>
          )}

          {previewUrls.length > 1 && (
            <Stack
              direction="row"
              sx={{
                position: 'absolute',
                bottom: 5,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {previewUrls.map((_, i) => (
                <Box
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  sx={{
                    width: i === currentIndex ? 18 : 6,
                    height: 6,
                    borderRadius: 999,
                    cursor: 'pointer',
                    bgcolor: i === currentIndex ? 'primary.main' : 'grey.400',
                    transition: '0.2s',
                  }}
                />
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
