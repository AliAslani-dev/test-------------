'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useDashboardContext } from '../../../../contexts/DashboardContext';
import { CategoryDTO } from '@/api/admin/category/dto';
import type { FrameDTO } from '@/api/zarhub/dto';
import type { ProductCategoryDTO, ProductGenderCategoryDTO } from '@/api/product/dto';
import { getCategories } from '@/api/admin/category/service';
import { getFrameGenderCategories } from '@/api/frame/service';
import { getFramesByBucket } from '@/api/frame/service';

import CustomTextField from '@/components/shared/custom-text-field';
import FrameCard from '@/components/wholesalers/collections/FrameCard';
import FrameCardSkeleton from '@/components/wholesalers/collections/FrameCardSkeleton';

interface WholesalerFramesTabProps {
  wholesalerId: number;
}

const GOLD = '#A67C00';

export default function WholesalerFramesTab({ wholesalerId }: WholesalerFramesTabProps) {
  const router = useRouter();

  const { userId } = useDashboardContext();
  const [frames, setFrames] = useState<FrameDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [genderCategories, setGenderCategories] = useState<ProductGenderCategoryDTO[]>([]);

  const [filterInput, setFilterInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [genderFilter, setGenderFilter] = useState<number | ''>('');

  // دسته‌بندی‌ها و جنسیت‌ها برای مپ کردن id به نام فارسی
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [categoriesRes, genderRes] = await Promise.all([
          getCategories(),
          getFrameGenderCategories(),
        ]);
        if (!mounted) return;
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setGenderCategories(Array.isArray(genderRes) ? genderRes : []);
      } catch (e) {
        console.error('Getting zarhub categories failed.', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // قاب‌های این بنکدار
  useEffect(() => {
    if (!wholesalerId || !userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const result = await getFramesByBucket(wholesalerId, {
          page: 1,
          per_page: 25,
        });
        if (!mounted) return;
        setFrames(Array.isArray(result) ? result : []);
      } catch (e) {
        console.error('Getting wholesaler frames failed.', e);
        if (mounted) setFrames([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [wholesalerId, userId]);

  const categoryIdToFaName = useMemo(() => {
    const obj: Record<number, string> = {};
    for (const c of categories) obj[c.id] = c.faName;
    return obj;
  }, [categories]);

  const genderIdToFaName = useMemo(() => {
    const obj: Record<number, string> = {};
    for (const g of genderCategories) obj[g.id] = g.faName;
    return obj;
  }, [genderCategories]);

  const filteredFrames = useMemo(() => {
    const q = filterInput.trim().toLowerCase();

    return frames.filter((frame) => {
      if (q && !frame.model.toLowerCase().includes(q)) return false;
      if (categoryFilter !== '' && frame.category !== categoryFilter) return false;
      if (genderFilter !== '' && frame.genderCategory !== genderFilter) return false;
      return true;
    });
  }, [frames, filterInput, categoryFilter, genderFilter]);

  const bucketName = frames[0]?.bucketName || '';

  const handleOpenFrame = (frameId: number) => {
    router.push(`/dashboard/wholesalers/${wholesalerId}/${frameId}`);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        px: { xs: 2, sm: 2, md: 2, lg: 0 },
        direction: 'rtl',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', lg: '1000px' },
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          mt: 3,
          mb: 6,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              noWrap
              title={bucketName}
              sx={{ fontWeight: 900, fontSize: { xs: 20, md: 26 }, color: 'rgb(93, 93, 93)' }}
            >
              {bucketName || 'قاب‌های بنکداری'}
            </Typography>

            {!loading && (
              <Typography
                sx={{ mt: 0.5, color: 'rgba(0,0,0,0.48)', fontWeight: 500, fontSize: 13 }}
              >
                {filteredFrames.length.toLocaleString('fa-IR')} قاب
              </Typography>
            )}
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => router.push('/dashboard/wholesalers')}
            sx={{
              appearance: 'none',
              border: '1px solid rgba(0,0,0,0.08)',
              bgcolor: '#fff',
              borderRadius: 999,
              px: { xs: 1.2, sm: 1.6 },
              py: 0.8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'rgba(0,0,0,0.65)',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: { xs: 11, sm: 12 },
              flexShrink: 0,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
            }}
          >
            <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
            بازگشت به بنکداری‌ها
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
          <Box sx={{ flex: 2 }}>
            <CustomTextField
              id="wholesaler-frame-filter"
              title=""
              value={filterInput}
              setValue={setFilterInput}
              placeholder="جستجو با نام قاب ..."
              InputProps={{
                startAdornment: (
                  <SearchRoundedIcon sx={{ color: GOLD, mr: 0.5 }} fontSize="small" />
                ),
              }}
            />
          </Box>

          <FormControl size="small" sx={{ flex: 1, minWidth: 160, mt: '2px' }}>
            <InputLabel>دسته‌بندی</InputLabel>
            <Select
              value={categoryFilter}
              label="دسته‌بندی"
              onChange={(e) =>
                setCategoryFilter(String(e.target.value) === '' ? '' : Number(e.target.value))
              }
            >
              <MenuItem value="">همه</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.faName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: 1, minWidth: 160, mt: '2px' }}>
            <InputLabel>جنسیت</InputLabel>
            <Select
              value={genderFilter}
              label="جنسیت"
              onChange={(e) =>
                setGenderFilter(String(e.target.value) === '' ? '' : Number(e.target.value))
              }
            >
              <MenuItem value="">همه</MenuItem>
              {genderCategories.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.faName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: { xs: 1.5, md: 2.5 },
            justifyItems: 'center',
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <FrameCardSkeleton key={index} />)
            : filteredFrames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  categoryName={
                    frame.category != null ? (categoryIdToFaName[frame.category] ?? '') : ''
                  }
                  genderName={
                    frame.genderCategory != null
                      ? (genderIdToFaName[frame.genderCategory] ?? '')
                      : ''
                  }
                  caratName={frame.carat}
                  onClick={() => handleOpenFrame(frame.id)}
                />
              ))}
        </Box>

        {!loading && filteredFrames.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(0,0,0,0.45)', fontWeight: 600, fontSize: 13 }}>
              قابی برای نمایش وجود ندارد
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
