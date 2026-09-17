'use client';

import { Box, Stack, Typography } from '@mui/material';

import { useEffect, useRef, useState } from 'react';

import type { Dispatch, FunctionComponent, SetStateAction } from 'react';

import type { AvailableCategoryDTO } from '@/api/zarhub/dto';

import { getAvailableCategories } from '@/api/zarhub/service';

import useText from '@/hooks/useText';

import ModeSwitcher from './ModeSwitcher';
import WholesalersContent from './WholesalersContent';
import CollectionsContent from './collections';
import TagsLoading from './collections/TagsLoading';

import type { PageMode } from './types';


interface WholesalersTabProps {
  setActiveWholesalerId?: Dispatch<SetStateAction<number | null>>;

  onOpenTagFrame?: (payload: any) => void;
}

const WholesalersTab: FunctionComponent<WholesalersTabProps> = ({
  setActiveWholesalerId: _setActiveWholesalerId,
  onOpenTagFrame,
}) => {
  const { t } = useText('wholesalers');

  const [pageMode, setPageMode] = useState<PageMode | null>(null);

  const [categories, setCategories] = useState<AvailableCategoryDTO[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const userChangedModeRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);

      try {
        const result = await getAvailableCategories();

        if (!mounted) {
          return;
        }

        const safeCategories = Array.isArray(result) ? result : [];

        setCategories(safeCategories);

        if (!userChangedModeRef.current) {
          setPageMode(safeCategories.length > 0 ? 'tags' : 'moreSales');
        }
      } catch (error) {
        console.error('Getting available categories failed.', error);

        if (!mounted) {
          return;
        }

        setCategories([]);

        if (!userChangedModeRef.current) {
          setPageMode('moreSales');
        }
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleModeChange = (nextMode: PageMode) => {
    if (nextMode === 'tags' && categories.length === 0) {
      return;
    }

    userChangedModeRef.current = true;

    setPageMode(nextMode);
  };

  const isTagsMode = pageMode === 'tags';

  const showCollectionHeader = pageMode === null || isTagsMode;

  return (
    <Box
      component="main"
      aria-label={isTagsMode ? 'صفحه کالکشن‌ها' : 'صفحه بنکداری‌ها'}
      sx={{
        position: 'relative',

        width: '100%',

        paddingX: {
          xs: '20px',
          sm: '20px',
          md: '20px',
          lg: 0,
        },

        display: 'flex',

        flexDirection: 'column',

        alignItems: 'center',

        gap: '18px',

        marginBottom: '100px',

        direction: 'rtl',
      }}
    >
      <Box
        sx={{
          width: {
            xs: '100%',
            lg: '1000px',
          },

          mt: {
            xs: '26px',
            lg: '26px',
          },

          display: 'flex',

          flexDirection: 'column',

          gap: 3,

          minWidth: 0,
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontWeight: 900,

                fontSize: {
                  xs: 20,
                  md: 26,
                },

                color: 'rgb(93, 93, 93)',
              }}
            >
              {showCollectionHeader ? 'کالکشن‌ها' : t('wholesalers')}
            </Typography>

            {showCollectionHeader ? (
              <Typography
                sx={{
                  mt: 0.7,

                  color: 'rgba(0,0,0,0.48)',

                  fontWeight: 500,

                  fontSize: {
                    xs: 12,
                    md: 14,
                  },

                  lineHeight: 1.9,
                }}
              >
                بسته‌های آماده سودده: ته‌بار، ترکیبی، مناسبتی و آنلاین
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <ModeSwitcher
          value={pageMode}
          onChange={handleModeChange}
          tagsDisabled={!categoriesLoading && categories.length === 0}
        />
      </Box>

      {pageMode === null ? (
        <Box
          sx={{
            width: {
              xs: '100%',
              lg: '1000px',
            },

            minWidth: 0,
          }}
        >
          <TagsLoading />
        </Box>
      ) : null}

      {/* {pageMode === 'tags' ? (
        <CollectionsContent
          categories={categories}
          categoriesLoading={categoriesLoading}
          onOpenFrame={onOpenTagFrame as any}
        />
      ) : null} */}

      {pageMode === 'moreSales' || pageMode === 'approved' ? (
        <WholesalersContent mode={pageMode} />
      ) : null}
    </Box>
  );
};

export default WholesalersTab;
