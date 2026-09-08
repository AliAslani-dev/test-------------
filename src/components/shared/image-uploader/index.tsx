'use client';

import Image from 'next/image';
import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import { useNotification } from '@/hooks/useNotification';
import { useEffect, useMemo, useRef, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import FlipCameraAndroidOutlinedIcon from '@mui/icons-material/FlipCameraAndroidOutlined';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

type Props = {
  value?: File | null;
  defaultValueUrl?: string;
  onChange?: (file: File | null) => void;
  width?: number | string;
  height?: number | string;
  accept?: string;
  disabled?: boolean;
  variant?: 'default' | 'compact';
  maxFileSizeBytes?: number;
  maxFileSizeBytesErrorMessage?: string;
  supportedSizeText?: string;
};

const ACCEPT_DEFAULT = 'image/*';
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MB

export default function ImageUploader({
  value,
  defaultValueUrl,
  onChange,
  width,
  height,
  accept = ACCEPT_DEFAULT,
  disabled = false,
  variant = 'default',
  maxFileSizeBytes = MAX_FILE_SIZE_BYTES,
  maxFileSizeBytesErrorMessage,
  supportedSizeText,
}: Props) {
  const { lang } = useLang();
  const { t } = useText('base', lang);
  const { showNotification } = useNotification();

  const [internalFile, setInternalFile] = useState<File | null>(null);
  const file = value ?? internalFile;

  const isCompact = variant === 'compact';
  const resolvedWidth = width ?? (isCompact ? 40 : '100%');
  const resolvedHeight = height ?? (isCompact ? 40 : 260);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (defaultValueUrl) return defaultValueUrl;
    return null;
  }, [file, defaultValueUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl && file && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, file]);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const systemCameraInputRef = useRef<HTMLInputElement | null>(null);

  const pickGallery = () => !disabled && galleryInputRef.current?.click();
  const pickSystemCamera = () => !disabled && systemCameraInputRef.current?.click();

  const pick = () => {
    if (disabled) return;
    pickGallery();
  };

  const setFile = (f: File | null) => {
    if (!f) return;

    if (f.size > maxFileSizeBytes) {
      showNotification(t('image_uploader.size_limit'), 'warning');
      return;
    }

    if (!f.type.startsWith('image/')) return;

    setInternalFile(f);
    onChange?.(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) setFile(f);
    e.currentTarget.value = '';
  };

  const onDelete = () => {
    setInternalFile(null);
    onChange?.(null);
  };

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopStream = (s: MediaStream | null) => {
    if (!s) return;
    s.getTracks().forEach((tr) => tr.stop());
  };

  const closeCamera = () => {
    setCameraOpen(false);
    stopStream(cameraStream);
    setCameraStream(null);
  };

  useEffect(() => {
    if (disabled) closeCamera();
  }, [disabled]);

  useEffect(() => {
    const v = videoRef.current;
    if (!cameraOpen || !v || !cameraStream) return;

    v.srcObject = cameraStream;

    const tryPlay = async () => {
      try {
        await v.play();
      } catch {}
    };

    if (v.readyState >= 2) {
      void tryPlay();
    } else {
      v.onloadedmetadata = () => void tryPlay();
    }
  }, [cameraOpen, cameraStream]);

  const startCamera = async (facing: 'environment' | 'user') => {
    if (disabled) return;

    const canLive =
      typeof window !== 'undefined' &&
      window.isSecureContext &&
      !!navigator.mediaDevices?.getUserMedia;

    if (!canLive) {
      showNotification(t('https_request'), 'warning');
      pickSystemCamera();
      return;
    }

    try {
      stopStream(cameraStream);

      const base = { audio: false as const };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          ...base,
          video: {
            facingMode: { exact: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          ...base,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }

      setCameraStream(stream);
      setCameraFacing(facing);
    } catch {
      showNotification(t('camera_access'), 'warning');
      pickSystemCamera();
    }
  };

  const openAndStartCamera = async (facing: 'environment' | 'user') => {
    if (disabled) return;
    setCameraOpen(true);
    await startCamera(facing);
  };

  const canvasToJpegFileUnderLimit = async (
    canvas: HTMLCanvasElement,
    maxBytes: number,
    filename: string,
  ): Promise<File | null> => {
    const toBlob = (quality: number) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
      );

    let quality = 0.9;
    let blob = await toBlob(quality);

    while (blob && blob.size > maxBytes && quality > 0.4) {
      quality = Math.round((quality - 0.1) * 10) / 10;
      blob = await toBlob(quality);
    }

    if (!blob) return null;
    if (blob.size > maxBytes) return null;

    return new File([blob], filename, { type: 'image/jpeg' });
  };

  const captureFromVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const maxDim = 1600;
    let tw = vw;
    let th = vh;

    if (Math.max(vw, vh) > maxDim) {
      const scale = maxDim / Math.max(vw, vh);
      tw = Math.round(vw * scale);
      th = Math.round(vh * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, tw, th);

    const filename = `camera_${Date.now()}.jpg`;
    const jpegFile = await canvasToJpegFileUnderLimit(canvas, maxFileSizeBytes, filename);

    if (!jpegFile) {
      showNotification(t('image_uploader.size_limit'), 'warning');
      return;
    }

    setFile(jpegFile);
    closeCamera();
  };

  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
    left: -9999,
  };

  return (
    <Box
      ref={containerRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : pick}
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pick();
              }
            }
      }
      sx={{
        width: resolvedWidth,
        height: resolvedHeight,
        minHeight: resolvedHeight,
        borderRadius: isCompact ? 1 : 2,
        border: (t) =>
          `${isCompact ? 1 : 2}px dashed ${
            dragOver ? t.palette.primary.main : alpha(t.palette.text.primary, 0.25)
          }`,
        bgcolor: (t) => alpha(t.palette.primary.main, isCompact ? 0.01 : 0.02),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
      }}
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0] ?? null;
        if (f) setFile(f);
      }}
    >
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept || 'image/*'}
        onChange={onInputChange}
        disabled={disabled}
        style={inputStyle}
      />

      <input
        ref={systemCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInputChange}
        disabled={disabled}
        style={inputStyle}
      />

      {!disabled && !isCompact && (
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
            minHeight: 34,
            alignItems: 'center',
            justifyContent: 'center',
            px: 0.5,
            zIndex: 5,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              void openAndStartCamera('environment');
            }}
            aria-label="Open camera"
            sx={{ minWidth: 34, minHeight: 34, p: 0.5 }}
          >
            <PhotoCameraOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              pickGallery();
            }}
            aria-label="Open gallery"
            sx={{ minWidth: 34, minHeight: 34, p: 0.5 }}
          >
            <PhotoLibraryOutlinedIcon fontSize="small" />
          </IconButton>

          {previewUrl && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete image"
              sx={{ minWidth: 34, minHeight: 34, p: 0.5 }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      )}

      {!previewUrl ? (
        isCompact ? (
          <UploadRoundedIcon fontSize="small" />
        ) : (
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
                {t('image_uploader.supported_size')}
              </Typography>
            </Box>
          </Box>
        )
      ) : (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: '100%',
            height: '100%',
            p: isCompact ? 0 : '10px',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 1,
              boxShadow: (t) => `0 0 0 1px ${alpha(t.palette.common.black, 0.06)}`,
              overflow: 'hidden',
            }}
          >
            <Image
              key={previewUrl ?? 'empty'}
              src={previewUrl || '/__placeholder__.png'}
              alt="Selected"
              fill
              sizes="100vw"
              loader={
                !!previewUrl && (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:'))
                  ? ({ src }) => src
                  : undefined
              }
              style={{ objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }}
              priority
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={cameraOpen}
        onClose={closeCamera}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>{t('camera')}</span>
          <IconButton onClick={closeCamera} aria-label="Close camera">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '3 / 4',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: (t) => alpha(t.palette.common.black, 0.06),
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<FlipCameraAndroidOutlinedIcon />}
            onClick={async () => {
              const next = cameraFacing === 'environment' ? 'user' : 'environment';
              await startCamera(next);
            }}
          >
            {t('camera_switch')}
          </Button>

          <Button variant="contained" onClick={captureFromVideo}>
            {t('capture')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
