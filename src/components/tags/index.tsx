'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AddRounded,
  CollectionsBookmarkRounded,
  EditRounded,
  ImageNotSupportedRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  PowerSettingsNewRounded,
  SaveRounded,
  TuneRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { addTag, editTag, getTags, toggleTagStatus } from '@/api/admin/seller/service';
import type { TagDTO } from '@/api/admin/seller/dto';
import { getFrameCategories } from '@/api/frame/service';
import type { FrameCategoryDTO, FramesByBucketDTO } from '@/api/frame/dto';
import CustomTextField from '@/components/shared/custom-text-field';
import FrameDetailsDialog from '@/components/shared/frame-details-dialog';
import { useLang } from '@/hooks/LanContext';
import useText from '@/hooks/useText';
import { useNotification } from '@/hooks/useNotification';

interface TagsTabProps {
  setActiveTagId: React.Dispatch<React.SetStateAction<number | null>>;
  userId: number | null;
}

type Notice = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

const GOLD = '#B58A32';
const GOLD_DARK = '#8B6A25';
const GOLD_LIGHT = '#FBF7EC';
const GOLD_BORDER = '#E8D7A7';

const EMPTY_NOTICE: Notice = {
  open: false,
  message: '',
  severity: 'success',
};

const goldContainedSx = {
  bgcolor: GOLD,
  color: '#fff',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: GOLD_DARK,
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    bgcolor: '#E8E1D1',
    color: '#9B9485',
  },
};

const goldOutlinedSx = {
  borderColor: GOLD_BORDER,
  color: GOLD_DARK,
  '&:hover': {
    borderColor: GOLD,
    bgcolor: alpha(GOLD, 0.06),
  },
};

const buttonWithLeftIconSx = {
  columnGap: 0.75,
  '& .MuiButton-endIcon': { m: 0 },
};

function interpolate(text: string, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

function frameCover(frame: FramesByBucketDTO | null): string | null {
  if (!frame) return null;
  return frame.cover || frame.covers?.[0] || frame.image || frame.images?.[0] || null;
}

function BannerSlider({ banners }: { banners: string[] }) {
  const theme = useTheme();
  const swiperId = useId().replace(/:/g, '');
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const prevClass = `tag-banner-prev-${swiperId}`;
  const nextClass = `tag-banner-next-${swiperId}`;

  if (!banners?.length) {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: '4 / 1',
          display: 'grid',
          placeItems: 'center',
          borderRadius: { xs: 2.5, md: 3 },
          bgcolor: GOLD_LIGHT,
          border: `1px dashed ${GOLD_BORDER}`,
        }}
      >
        <Stack alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
          <ImageNotSupportedRounded sx={{ color: GOLD }} />
          <Typography variant="body2">{t('no_banner')}</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '4 / 1',
        overflow: 'hidden',
        borderRadius: { xs: 2.5, md: 3 },
        bgcolor: theme.palette.grey[50],
        position: 'relative',
        '& .swiper': { width: '100%', height: '100%' },
        '& .swiper-pagination-bullet': {
          bgcolor: '#ccc',
          opacity: 0.8,
          width: 6,
          height: 6,
          transition: 'all .3s ease',
        },
        '& .swiper-pagination-bullet-active': {
          bgcolor: GOLD,
          opacity: 1,
          width: 20,
          borderRadius: 4,
        },
      }}
    >
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={
          banners.length > 1 ? { nextEl: `.${nextClass}`, prevEl: `.${prevClass}` } : false
        }
        pagination={banners.length > 1 ? { clickable: true } : false}
        loop={banners.length > 1}
        dir="rtl"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={`${banner}-${index}`}>
            <Box
              component="img"
              src={banner}
              alt={interpolate(t('banner_alt'), { index: index + 1 })}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {banners.length > 1 && (
        <>
          <Box
            className={prevClass}
            role="button"
            aria-label={t('previous_slide')}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 30, sm: 34 },
              height: { xs: 30, sm: 34 },
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,.90)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.10)',
              border: '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer',
              color: '#444',
              transition: 'all .2s ease',
              '&:hover': {
                bgcolor: '#fff',
                transform: 'translateY(-50%) scale(1.05)',
                color: '#1a1a1a',
              },
              '&.swiper-button-disabled': { opacity: 0.45, cursor: 'default' },
            }}
          >
            <KeyboardArrowDownRounded sx={{ transform: 'rotate(-90deg)', fontSize: 20 }} />
          </Box>
          <Box
            className={nextClass}
            role="button"
            aria-label={t('next_slide')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 30, sm: 34 },
              height: { xs: 30, sm: 34 },
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,.90)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.10)',
              border: '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer',
              color: '#444',
              transition: 'all .2s ease',
              '&:hover': {
                bgcolor: '#fff',
                transform: 'translateY(-50%) scale(1.05)',
                color: '#1a1a1a',
              },
              '&.swiper-button-disabled': { opacity: 0.45, cursor: 'default' },
            }}
          >
            <KeyboardArrowDownRounded sx={{ transform: 'rotate(90deg)', fontSize: 20 }} />
          </Box>
        </>
      )}
    </Box>
  );
}

function FrameMiniCard({
  frame,
  empty = false,
  onClick,
}: {
  frame?: FramesByBucketDTO | null;
  empty?: boolean;
  onClick?: () => void;
}) {
  const cover = frameCover(frame ?? null);
  const { lang } = useLang();
  const { t } = useText('tags', lang);

  return (
    <Box
      component={frame && onClick ? 'button' : 'div'}
      type={frame && onClick ? 'button' : undefined}
      onClick={frame && onClick ? onClick : undefined}
      sx={{
        appearance: 'none',
        p: 0,
        width: '100%',
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: { xs: 2.5, md: 3 },
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
        cursor: frame && onClick ? 'pointer' : 'default',
        transition: 'transform .2s ease, border-color .2s ease, box-shadow .2s ease',
        '&:hover':
          frame && onClick
            ? {
                transform: { md: 'translateY(-2px)' },
                borderColor: GOLD_BORDER,
                boxShadow: '0 8px 22px rgba(50,40,15,.08)',
              }
            : undefined,
      }}
    >
      {cover ? (
        <>
          <Box
            component="img"
            src={cover}
            alt={
              frame?.model
                ? interpolate(t('frame_alt_with_model'), { model: frame.model })
                : t('frame_alt')
            }
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 'auto 0 0 0',
              px: 1,
              py: 0.7,
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.58))',
            }}
          >
            <Typography
              variant="caption"
              color="common.white"
              fontWeight={800}
              noWrap
              sx={{ display: 'block' }}
            >
              {frame?.model || t('without_model')}
            </Typography>
          </Box>
        </>
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          sx={{
            width: '100%',
            height: '100%',
            color: 'text.disabled',
            p: 1,
            textAlign: 'center',
          }}
        >
          <ImageNotSupportedRounded fontSize="small" />
          <Typography variant="caption">{empty ? t('empty_frame') : t('no_image')}</Typography>
        </Stack>
      )}
    </Box>
  );
}

function ManageCard({ onClick }: { onClick: () => void }) {
  const theme = useTheme();
  const { lang } = useLang();
  const { t } = useText('tags', lang);

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        appearance: 'none',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: { xs: 2.5, md: 3 },
        cursor: 'pointer',
        border: `1px dashed ${GOLD}`,
        bgcolor: GOLD_LIGHT,
        color: GOLD_DARK,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        transition: theme.transitions.create(['background-color', 'transform', 'border-color']),
        '&:hover': {
          bgcolor: alpha(GOLD, 0.12),
          borderColor: GOLD_DARK,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <TuneRounded />
      <Typography variant="caption" fontWeight={900}>
        {t('manage_collection')}
      </Typography>
    </Box>
  );
}

function BannerFileSlot({
  slot,
  file,
  onChange,
}: {
  slot: number;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const { lang } = useLang();
  const { t } = useText('tags', lang);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <Box>
      <Box
        sx={{
          aspectRatio: '4 / 1',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: file ? GOLD_BORDER : 'divider',
          bgcolor: file ? GOLD_LIGHT : 'grey.50',
          mb: 1,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {preview ? (
          <Box
            component="img"
            src={preview}
            alt={interpolate(t('banner_preview_alt'), { index: slot + 1 })}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t('banner_ratio_hint')}
          </Typography>
        )}
      </Box>

      <Button
        fullWidth
        component="label"
        variant="outlined"
        sx={{ ...goldOutlinedSx, justifyContent: 'space-between', minHeight: 42 }}
      >
        <span>{interpolate(t('banner_number'), { index: slot + 1 })}</span>
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ maxWidth: '60%' }}
        >
          {file?.name || t('not_selected')}
        </Typography>
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </Button>
    </Box>
  );
}

export default function TagsTab({ setActiveTagId, userId }: TagsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const { showNotification } = useNotification();
  const tRef = useRef(t);
  tRef.current = t;
  const tagsRequestIdRef = useRef(0);
  const didLoadCategoriesRef = useRef(false);

  const [categories, setCategories] = useState<FrameCategoryDTO[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBanners, setNewBanners] = useState<(File | null)[]>([null, null, null]);

  const [savedOrder, setSavedOrder] = useState<number[]>([]);
  const [draftOrder, setDraftOrder] = useState<number[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const [toggleTarget, setToggleTarget] = useState<TagDTO | null>(null);
  const [toggling, setToggling] = useState(false);
  const [notice, setNotice] = useState<Notice>(EMPTY_NOTICE);
  const [detailsFrame, setDetailsFrame] = useState<FramesByBucketDTO | null>(null);

  const serverSortedTags = useMemo(
    () => [...tags].sort((a, b) => a.position - b.position || a.id - b.id),
    [tags],
  );

  const reversedCategories = useMemo(() => [...categories].reverse(), [categories]);

  const orderedTags = useMemo(() => {
    if (!draftOrder.length) return serverSortedTags;

    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    const ordered = draftOrder
      .map((id) => tagById.get(id))
      .filter((tag): tag is TagDTO => Boolean(tag));

    const knownIds = new Set(ordered.map((tag) => tag.id));
    serverSortedTags.forEach((tag) => {
      if (!knownIds.has(tag.id)) ordered.push(tag);
    });

    return ordered;
  }, [draftOrder, serverSortedTags, tags]);

  const hasOrderChanges = useMemo(
    () =>
      draftOrder.length === savedOrder.length &&
      draftOrder.some((id, index) => id !== savedOrder[index]),
    [draftOrder, savedOrder],
  );

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const result = await getFrameCategories();
      const nextCategories = result ?? [];
      setCategories(nextCategories);
    } catch {
      showNotification(tRef.current('error_load_categories'), 'error');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadTags = useCallback(async (selectedCategoryId: number) => {
    const requestId = ++tagsRequestIdRef.current;
    setLoadingTags(true);

    try {
      const result = await getTags(selectedCategoryId);
      if (requestId !== tagsRequestIdRef.current) return;

      const nextTags = Array.isArray(result) ? result : [];
      const nextOrder = [...nextTags]
        .sort((a, b) => a.position - b.position || a.id - b.id)
        .map((tag) => tag.id);

      setTags(nextTags);
      setSavedOrder(nextOrder);
      setDraftOrder(nextOrder);
    } catch {
      if (requestId !== tagsRequestIdRef.current) return;
      setTags([]);
      setSavedOrder([]);
      setDraftOrder([]);
      showNotification(tRef.current('error_load_tags'), 'error');
    } finally {
      if (requestId === tagsRequestIdRef.current) {
        setLoadingTags(false);
      }
    }
  }, []);

  useEffect(() => {
    if (didLoadCategoriesRef.current) return;
    didLoadCategoriesRef.current = true;
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!reversedCategories.length) {
      setCategoryId('');
      return;
    }

    const urlCategoryId = Number(searchParams.get('category'));
    const urlCategoryExists =
      Number.isFinite(urlCategoryId) &&
      reversedCategories.some((category) => category.id === urlCategoryId);

    const nextCategoryId = urlCategoryExists ? urlCategoryId : reversedCategories[0].id;

    setCategoryId((current) => (current === nextCategoryId ? current : nextCategoryId));

    if (!urlCategoryExists) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set('category', String(nextCategoryId));
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    }
  }, [pathname, reversedCategories, router, searchParams]);

  useEffect(() => {
    if (typeof categoryId === 'number') {
      void loadTags(categoryId);
    } else {
      setTags([]);
      setSavedOrder([]);
      setDraftOrder([]);
    }
  }, [categoryId, loadTags]);

  const handleCategoryChange = (nextCategoryId: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('category', String(nextCategoryId));
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const openCreateDialog = () => {
    setNewName('');
    setNewBanners([null, null, null]);
    setCreateOpen(true);
  };

  const updateBanner = (slot: number, file: File | null) => {
    setNewBanners((previous) => {
      const next = [...previous];
      next[slot] = file;
      return next;
    });
  };

  const handleCreate = async () => {
    if (typeof categoryId !== 'number') {
      showNotification(t('select_category_first'), 'warning');
      return;
    }

    if (!userId) {
      showNotification(t('seller_id_unavailable'), 'error');
      return;
    }

    if (!newName.trim()) {
      showNotification(t('enter_collection_name'), 'warning');
      return;
    }

    const nextPosition = orderedTags.length + 1;

    setCreating(true);
    try {
      await addTag(
        categoryId,
        userId,
        nextPosition,
        newName.trim(),
        newBanners[0],
        newBanners[1],
        newBanners[2],
      );
      setCreateOpen(false);
      showNotification(t('tag_created_success'), 'success');
      await loadTags(categoryId);
    } catch {
      showNotification(t('tag_create_error'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const moveTag = (tagId: number, direction: 'up' | 'down') => {
    setDraftOrder((previous) => {
      const current = previous.length ? [...previous] : serverSortedTags.map((tag) => tag.id);
      const index = current.indexOf(tagId);
      if (index === -1) return previous;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return previous;

      [current[index], current[targetIndex]] = [current[targetIndex], current[index]];
      return current;
    });
  };

  const discardOrderChanges = () => {
    setDraftOrder([...savedOrder]);
  };

  const applyOrderChanges = async () => {
    if (!hasOrderChanges || savingOrder) return;

    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    const updates = draftOrder
      .map((id, index) => ({ tag: tagById.get(id), position: index + 1 }))
      .filter(
        (item): item is { tag: TagDTO; position: number } =>
          Boolean(item.tag) && Number(item.tag?.position) !== item.position,
      );

    setSavingOrder(true);
    try {
      await Promise.all(
        updates.map(({ tag, position }) => editTag(tag.id, position, null, null, null)),
      );

      showNotification(t('order_saved_success'), 'success');

      if (typeof categoryId === 'number') {
        await loadTags(categoryId);
      }
    } catch {
      showNotification(t('order_save_error'), 'error');
    } finally {
      setSavingOrder(false);
    }
  };

  const openTag = (tagId: number) => {
    setActiveTagId(tagId);
    router.push(`/dashboard/tags/${tagId}`);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;

    setToggling(true);
    try {
      await toggleTagStatus(toggleTarget.id);
      setTags((previous) =>
        previous.map((tag) =>
          tag.id === toggleTarget.id ? { ...tag, enabled: !tag.enabled } : tag,
        ),
      );
      showNotification(
        toggleTarget.enabled ? t('tag_disabled_success') : t('tag_enabled_success'),
        'success',
      );
      setToggleTarget(null);
    } catch {
      showNotification(t('toggle_status_error'), 'error');
    } finally {
      setToggling(false);
    }
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 0 } }} dir="rtl">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontSize: { xs: '1.45rem', md: '2rem' } }}
          >
            {t('tags')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {t('tags_subtitle')}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
            <InputLabel>{t('category')}</InputLabel>
            <Select
              value={categoryId}
              label={t('category')}
              disabled={loadingCategories}
              onChange={(event) => handleCategoryChange(Number(event.target.value))}
              sx={{
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
              }}
            >
              {reversedCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.faName || category.enName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            endIcon={<AddRounded />}
            onClick={openCreateDialog}
            disabled={typeof categoryId !== 'number' || !userId}
            sx={{
              ...goldContainedSx,
              ...buttonWithLeftIconSx,
              minHeight: 40,
              whiteSpace: 'nowrap',
            }}
          >
            {t('create_collection')}
          </Button>
        </Stack>
      </Stack>

      {loadingTags ? (
        <Box sx={{ py: 10, display: 'grid', placeItems: 'center' }}>
          <CircularProgress sx={{ color: GOLD }} />
        </Box>
      ) : !orderedTags.length ? (
        <Box
          sx={{
            py: 10,
            px: 2,
            borderRadius: 3,
            border: `1px dashed ${GOLD_BORDER}`,
            textAlign: 'center',
            bgcolor: GOLD_LIGHT,
          }}
        >
          <CollectionsBookmarkRounded sx={{ fontSize: 48, color: GOLD, mb: 1 }} />
          <Typography fontWeight={800}>{t('no_tags_for_category')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {t('create_first_tag_hint')}
          </Typography>
          <Button
            variant="outlined"
            endIcon={<AddRounded />}
            onClick={openCreateDialog}
            sx={{ ...goldOutlinedSx, ...buttonWithLeftIconSx }}
          >
            {t('create_collection')}
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {orderedTags.map((tag, index) => {
            const activeBundles = (tag.bundles ?? []).filter((bundle) => bundle.deletedAt === null);
            const frames = activeBundles.map((bundle) => bundle.frame);
            const previewFrames = frames.slice(0, 3);
            const position = index + 1;
            const isFirst = index === 0;
            const isLast = index === orderedTags.length - 1;

            return (
              <Box
                key={tag.id}
                sx={{
                  width: '100%',
                  minWidth: 0,
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  borderRadius: { xs: 3, md: 4 },
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: '0 8px 28px rgba(45,37,18,.045)',
                  transition: theme.transitions.create(['box-shadow', 'transform']),
                  '&:hover': {
                    boxShadow: '0 14px 38px rgba(45,37,18,.075)',
                    transform: { md: 'translateY(-2px)' },
                  },
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'stretch', md: 'flex-start' }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Typography
                        fontWeight={900}
                        sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' } }}
                        noWrap
                        title={tag.name}
                      >
                        {tag.name}
                      </Typography>

                      <Chip
                        size="small"
                        label={tag.enabled ? t('enabled') : t('disabled')}
                        sx={
                          tag.enabled
                            ? {
                                bgcolor: '#EDF7EF',
                                color: '#3B7A45',
                                fontWeight: 800,
                              }
                            : {
                                bgcolor: '#F3F3F3',
                                color: '#7A7A7A',
                                fontWeight: 800,
                              }
                        }
                      />

                      <Chip
                        size="small"
                        label={interpolate(t('frame_count'), {
                          count: frames.length.toLocaleString('fa-IR'),
                        })}
                        variant="outlined"
                        sx={{ borderColor: GOLD_BORDER, color: GOLD_DARK, fontWeight: 800 }}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
                      {tag.categoryFaName ||
                        tag.categoryEnName ||
                        interpolate(t('category_fallback'), { id: tag.categoryId })}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => moveTag(tag.id, 'up')}
                        disabled={isFirst || savingOrder}
                        sx={{
                          border: `1px solid ${GOLD_BORDER}`,
                          color: GOLD_DARK,
                          '&:hover': { bgcolor: GOLD_LIGHT },
                        }}
                      >
                        <KeyboardArrowUpRounded />
                      </IconButton>

                      <Chip
                        size="small"
                        label={interpolate(t('position_of'), {
                          position: position.toLocaleString('fa-IR'),
                          total: orderedTags.length.toLocaleString('fa-IR'),
                        })}
                        sx={{
                          minWidth: 112,
                          bgcolor: GOLD_LIGHT,
                          color: GOLD_DARK,
                          border: `1px solid ${GOLD_BORDER}`,
                          fontWeight: 900,
                        }}
                      />

                      <IconButton
                        size="small"
                        onClick={() => moveTag(tag.id, 'down')}
                        disabled={isLast || savingOrder}
                        sx={{
                          border: `1px solid ${GOLD_BORDER}`,
                          color: GOLD_DARK,
                          '&:hover': { bgcolor: GOLD_LIGHT },
                        }}
                      >
                        <KeyboardArrowDownRounded />
                      </IconButton>
                    </Stack>

                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <IconButton
                        onClick={() => openTag(tag.id)}
                        sx={{
                          border: `1px solid ${GOLD_BORDER}`,
                          color: GOLD_DARK,
                          '&:hover': { bgcolor: GOLD_LIGHT },
                        }}
                      >
                        <EditRounded />
                      </IconButton>

                      <IconButton
                        onClick={() => setToggleTarget(tag)}
                        sx={{
                          border: '1px solid',
                          borderColor: tag.enabled ? '#E9B6B6' : '#B9D9C0',
                          color: tag.enabled ? '#B84A4A' : '#3B7A45',
                          '&:hover': {
                            bgcolor: tag.enabled ? '#FFF4F4' : '#F2FAF4',
                          },
                        }}
                      >
                        <PowerSettingsNewRounded />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>

                <BannerSlider banners={tag.banners ?? []} />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      sm: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: { xs: 1, sm: 1.25, md: 1.5 },
                    mt: 1.5,
                  }}
                >
                  {[0, 1, 2].map((index) => {
                    const previewFrame = previewFrames[index] ?? null;
                    return (
                      <FrameMiniCard
                        key={index}
                        frame={previewFrame}
                        empty={!previewFrame}
                        onClick={previewFrame ? () => setDetailsFrame(previewFrame) : undefined}
                      />
                    );
                  })}
                  <ManageCard onClick={() => openTag(tag.id)} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <FrameDetailsDialog
        open={Boolean(detailsFrame)}
        frame={detailsFrame}
        onClose={() => setDetailsFrame(null)}
        bucketName={detailsFrame?.bucketName || ''}
        categoryName={
          detailsFrame?.category == null
            ? ''
            : categories.find((category) => category.id === detailsFrame.category)?.faName ||
              categories.find((category) => category.id === detailsFrame.category)?.enName ||
              ''
        }
      />

      <Dialog
        open={createOpen}
        onClose={creating ? undefined : () => setCreateOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={900}>{t('create_new_collection')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Box>
              <CustomTextField
                id="new-tag-name"
                title={t('collection_name')}
                value={newName}
                setValue={setNewName}
                hasStar
                placeholder={t('collection_name_placeholder')}
                inputProps={{ maxLength: 120 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.75, display: 'block' }}
              >
                {t('new_tag_position_hint')}
              </Typography>
            </Box>

            <Box>
              <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                {t('banners')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t('banners_create_hint')}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                {[0, 1, 2].map((slot) => (
                  <BannerFileSlot
                    key={slot}
                    slot={slot}
                    file={newBanners[slot]}
                    onChange={(file) => updateBanner(slot, file)}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={creating} color="inherit">
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCreate()}
            disabled={creating}
            sx={goldContainedSx}
          >
            {creating ? <CircularProgress size={20} color="inherit" /> : t('create_collection')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(toggleTarget)}
        onClose={toggling ? undefined : () => setToggleTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={900}>
          {toggleTarget?.enabled ? t('disable_collection') : t('enable_collection')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {interpolate(t('toggle_collection_confirm'), {
              action: toggleTarget?.enabled ? t('disable') : t('enable'),
              name: toggleTarget?.name ?? '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={() => setToggleTarget(null)} disabled={toggling} color="inherit">
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleToggle()}
            disabled={toggling}
            sx={
              toggleTarget?.enabled
                ? {
                    bgcolor: '#B84A4A',
                    '&:hover': { bgcolor: '#963B3B' },
                  }
                : goldContainedSx
            }
          >
            {toggling ? <CircularProgress size={20} color="inherit" /> : t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {hasOrderChanges && (
        <Box
          sx={{
            position: 'sticky',
            bottom: { xs: 12, sm: 16 },
            zIndex: 20,
            mt: 2,
            mx: 'auto',
            width: 'fit-content',
            maxWidth: '100%',
            px: 1.25,
            py: 1,
            borderRadius: 99,
            bgcolor: 'background.paper',
            border: `1px solid ${GOLD_BORDER}`,
            boxShadow: '0 12px 34px rgba(47,38,15,.16)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="body2" fontWeight={900} sx={{ px: 1 }}>
              {t('order_changed')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={discardOrderChanges}
                disabled={savingOrder}
                sx={goldOutlinedSx}
              >
                {t('discard_changes')}
              </Button>
              <Button
                size="small"
                variant="contained"
                endIcon={savingOrder ? undefined : <SaveRounded />}
                onClick={() => void applyOrderChanges()}
                disabled={savingOrder}
                sx={{ ...goldContainedSx, ...buttonWithLeftIconSx }}
              >
                {savingOrder ? <CircularProgress size={18} color="inherit" /> : t('apply_changes')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      <Snackbar
        open={notice.open}
        autoHideDuration={3500}
        onClose={() => setNotice((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() => setNotice((previous) => ({ ...previous, open: false }))}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
