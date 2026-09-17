'use client';

import { Box, Stack, Typography } from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { AvailableCategoryDTO, TagDTO } from '@/api/zarhub/dto';

import { getLatestTags, getTags } from '@/api/zarhub/service';

// import type { OpenTagFramePayload } from '@/components/frame/types';

import AvailableCategories from './AvailableCategories';
import TagSection from './TagSection';
import TagsLoading from './TagsLoading';

interface CollectionsContentProps {
  categories: AvailableCategoryDTO[];

  categoriesLoading?: boolean;

  onOpenFrame: (payload: any) => void;
}

function hasBundles(tag: TagDTO) {
  return Array.isArray(tag.bundles) && tag.bundles.length > 0;
}

export default function CollectionsContent({
  categories,
  categoriesLoading = false,
  onOpenFrame,
}: CollectionsContentProps) {
  const [latestTags, setLatestTags] = useState<TagDTO[]>([]);

  const [latestTagsLoading, setLatestTagsLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const [categoryTags, setCategoryTags] = useState<TagDTO[]>([]);

  const [categoryTagsLoading, setCategoryTagsLoading] = useState(false);

  const categoryRequestRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loadLatest = async () => {
      setLatestTagsLoading(true);

      try {
        const result = await getLatestTags(3);

        if (!mounted) {
          return;
        }

        const safeTags = Array.isArray(result) ? result.filter(hasBundles).slice(0, 3) : [];

        setLatestTags(safeTags);
      } catch (error) {
        console.error('Loading latest tags failed.', error);

        if (mounted) {
          setLatestTags([]);
        }
      } finally {
        if (mounted) {
          setLatestTagsLoading(false);
        }
      }
    };

    loadLatest();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCategorySelect = useCallback(async (category: AvailableCategoryDTO) => {
    const requestId = ++categoryRequestRef.current;

    setSelectedCategoryId(category.id);

    setSelectedCategoryName(category.faName);

    setCategoryTags([]);

    setCategoryTagsLoading(true);

    try {
      const result = await getTags(category.id);

      if (categoryRequestRef.current !== requestId) {
        return;
      }

      const safeTags = Array.isArray(result) ? result.filter(hasBundles) : [];

      setCategoryTags(safeTags);
    } catch (error) {
      console.error('Loading category tags failed.', error);

      if (categoryRequestRef.current === requestId) {
        setCategoryTags([]);
      }
    } finally {
      if (categoryRequestRef.current === requestId) {
        setCategoryTagsLoading(false);
      }
    }
  }, []);

  const handleBack = useCallback(() => {
    categoryRequestRef.current += 1;

    setSelectedCategoryId(null);

    setSelectedCategoryName('');

    setCategoryTags([]);

    setCategoryTagsLoading(false);
  }, []);

  return (
    <Box
      sx={{
        width: {
          xs: '100%',
          lg: '1000px',
        },

        minWidth: 0,

        display: 'flex',

        flexDirection: 'column',
      }}
    >
      <Box
        component="section"
        sx={{
          width: '100%',
          minWidth: 0,
        }}
      >
        {selectedCategoryId ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{
              mb: {
                xs: 2,
                md: 2.5,
              },
            }}
          >
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                component="h2"
                sx={{
                  color: '#242424',

                  fontWeight: 900,

                  fontSize: {
                    xs: '1.15rem',
                    md: '1.4rem',
                  },
                }}
              >
                {selectedCategoryName}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,

                  color: '#999',

                  fontSize: 12,
                }}
              >
                کالکشن‌های این دسته‌بندی
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={handleBack}
              sx={{
                appearance: 'none',

                border: '1px solid rgba(0,0,0,0.08)',

                bgcolor: '#fff',

                borderRadius: 999,

                px: {
                  xs: 1.2,
                  sm: 1.6,
                },

                py: 0.8,

                cursor: 'pointer',

                display: 'flex',

                alignItems: 'center',

                gap: 0.5,

                color: 'rgba(0,0,0,0.65)',

                fontFamily: 'inherit',

                fontWeight: 800,

                fontSize: {
                  xs: 11,
                  sm: 12,
                },

                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.03)',
                },
              }}
            >
              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />
              جدیدترین کالکشن‌ها
            </Box>
          </Stack>
        ) : (
          <Box
            sx={{
              mb: {
                xs: 2,
                md: 2.5,
              },
            }}
          >
            <Typography
              component="h2"
              sx={{
                color: '#242424',

                fontWeight: 900,

                fontSize: {
                  xs: '1.15rem',
                  md: '1.4rem',
                },
              }}
            >
              جدیدترین کالکشن‌ها
            </Typography>
          </Box>
        )}

        {selectedCategoryId ? (
          categoryTagsLoading ? (
            <TagsLoading />
          ) : categoryTags.length > 0 ? (
            <Stack
              spacing={{
                xs: 4,
                md: 5,
              }}
              sx={{
                width: '100%',
                minWidth: 0,
              }}
            >
              {categoryTags.map((tag) => (
                <TagSection key={tag.id} tag={tag} onOpenFrame={onOpenFrame} />
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                width: '100%',

                py: {
                  xs: 5,
                  md: 7,
                },

                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  color: '#999',
                  fontWeight: 600,
                }}
              >
                در این دسته‌بندی کالکشنی جهت نمایش وجود ندارد
              </Typography>
            </Box>
          )
        ) : latestTagsLoading ? (
          <TagsLoading />
        ) : latestTags.length > 0 ? (
          <Stack
            spacing={{
              xs: 4,
              md: 5,
            }}
            sx={{
              width: '100%',
              minWidth: 0,
            }}
          >
            {latestTags.map((tag) => (
              <TagSection key={tag.id} tag={tag} onOpenFrame={onOpenFrame} />
            ))}
          </Stack>
        ) : (
          <Typography
            sx={{
              color: '#999',

              fontWeight: 600,

              py: 3,
            }}
          >
            در حال حاضر کالکشنی جهت نمایش وجود ندارد
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: '100%',
          minWidth: 0,

          mt: {
            xs: 6,
            md: 8,
          },
        }}
      >
        <AvailableCategories
          categories={categories}
          loading={categoriesLoading}
          selectedCategoryId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />
      </Box>
    </Box>
  );
}
