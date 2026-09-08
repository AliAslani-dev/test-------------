'use client';

import useText from '@/hooks/useText';
import { UserRole } from '@/constants';
import { useLang } from '@/hooks/LanContext';
import SX from '@/components/shared/common-styles/tabs';
import CustomTextField from '../shared/custom-text-field';
import FramesTable, { FrameTable } from './components/table';
import FrameDialog, { FrameModalMode } from './components/dialog';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { makeFrameTableColumns } from './components/table/components/columns';
import { FrameCaratDTO, FrameCategoryDTO, FrameGenderCategoryDTO } from '@/api/frame/dto';
import { FunctionComponent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getFramesByBucket,
  getArchivedFramesByBucket,
  getFrameCategories,
  getFrameCarats,
  getFrameGenderCategories,
} from '@/api/frame/service';

const DEFAULT_ROWS_PER_PAGE = 25;
const DEBOUNCE_DELAY = 800;

interface FrameTabProps {
  role: UserRole;
  bucketId: number | null;
  setActiveBucketId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveFrameId: React.Dispatch<React.SetStateAction<number | null>>;
}

const FrameTab: FunctionComponent<FrameTabProps> = ({
  role,
  bucketId,
  setActiveBucketId,
  setActiveFrameId,
}) => {
  if (!bucketId) return <></>;

  const { lang } = useLang();
  const { t } = useText('frame', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : 0;
  });

  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    const r = searchParams.get('rows');
    return r ? parseInt(r, 10) : DEFAULT_ROWS_PER_PAGE;
  });

  const [filterInput, setFilterInput] = useState<string>(() => searchParams.get('filter') || '');
  const [archivedStatusFilter, setArchivedUserStatusFilter] = useState<'archived' | 'unarchived'>(
    () => {
      const s = searchParams.get('status');
      return s === 'archived' ? 'archived' : 'unarchived';
    },
  );

  const [bucketName, setBucketName] = useState<string>('');
  const [data, setData] = useState<FrameTable[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [debouncedFilter, setDebouncedFilter] = useState<string>(filterInput);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterInput);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [filterInput]);

  const [modalMode, setModalMode] = useState<FrameModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingFrame, setShowingFrame] = useState<FrameTable | undefined>(undefined);
  const [categories, setCategories] = useState<FrameCategoryDTO[]>([]);

  const updateUrl = useCallback(
    (override?: { page?: number; rowsPerPage?: number; filter?: string; status?: string }) => {
      const p = override?.page ?? page;
      const r = override?.rowsPerPage ?? rowsPerPage;
      const f = override?.filter !== undefined ? override.filter : debouncedFilter;
      const s = override?.status ?? archivedStatusFilter;

      const params = new URLSearchParams();
      if (p > 0) params.set('page', String(p));
      if (r !== DEFAULT_ROWS_PER_PAGE) params.set('rows', String(r));
      if (f) params.set('filter', f);
      if (s && s !== 'unarchived') params.set('status', s);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [page, rowsPerPage, debouncedFilter, archivedStatusFilter, pathname, router],
  );

  useEffect(() => {
    updateUrl({ filter: debouncedFilter });
  }, [debouncedFilter, updateUrl]);

  const fetchData = useCallback(async () => {
    if (!bucketId) return;
    setLoading(true);

    try {
      const apiParams = {
        page: page + 1,
        per_page: rowsPerPage,
        filter: debouncedFilter || undefined,
      };

      const [framesResponse, caratsResponse, categoriesRes, genderCategoriesRes] =
        await Promise.all([
          archivedStatusFilter === 'unarchived'
            ? getFramesByBucket(bucketId, apiParams)
            : getArchivedFramesByBucket(bucketId, apiParams),
          getFrameCarats(),
          getFrameCategories(),
          getFrameGenderCategories(),
        ]);

      if (framesResponse && framesResponse.meta) {
        setTotalRows(framesResponse.meta.total);
      } else {
        setTotalRows(0);
      }

      if (framesResponse) {
        setBucketName(framesResponse.bucketName);
      }

      const carats: FrameCaratDTO[] = Array.isArray(caratsResponse) ? caratsResponse : [];
      const caratsMap = new Map<string, FrameCaratDTO>(carats.map((c) => [String(c.value), c]));

      const categoriesList: FrameCategoryDTO[] = Array.isArray(categoriesRes) ? categoriesRes : [];
      setCategories(categoriesList);
      const categoriesMap = new Map<number, FrameCategoryDTO>(categoriesList.map((m) => [m.id, m]));

      const genderCategories: FrameGenderCategoryDTO[] = Array.isArray(genderCategoriesRes)
        ? genderCategoriesRes
        : [];
      const genderCategoriesMap = new Map<number, FrameGenderCategoryDTO>(
        genderCategories.map((m) => [m.id, m]),
      );

      const framesData = framesResponse?.frames ?? [];
      const rows: FrameTable[] = framesData.map((row: any) => {
        const caratValue = String(row.carat ?? row.caratValue ?? '');
        const ca = caratsMap.get(caratValue);

        const categoryId: number = row.category ?? 0;
        const c = categoriesMap.get(categoryId);

        const genderCategoryId: number = row.genderCategory ?? 0;
        const gc = genderCategoriesMap.get(genderCategoryId);

        return {
          id: row.id,
          bucketId: row.bucketId,
          model: row.model,
          wage: row.wage,
          profit: row.profit,
          discount: row.discount,
          caratValue,
          carat: ca?.amount ?? '',
          categoryId,
          category: c?.faName ?? '',
          genderCategoryId,
          genderCategory: gc?.faName ?? '',
          additionalFields: row.additionalFields,
          minWeight: row.minWeight,
          maxWeight: row.maxWeight,
          totalWeight: row.totalWeight,
          archived: row.archived,
          images: row.images,
          blur: row.blur,
          cover: row.cover,
          covers: row.covers,
          actions: <></>,
        };
      });

      setData(rows);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [bucketId, page, rowsPerPage, debouncedFilter, archivedStatusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const handleRowsPerPageChange = (newRows: number) => {
    const r = parseInt(String(newRows), 10);
    setRowsPerPage(r);
    setPage(0);
    updateUrl({ rowsPerPage: r, page: 0 });
  };

  const handleFilterChange = (val: string) => {
    setFilterInput(val);
    setPage(0);
  };

  const handleStatusChange = (val: 'archived' | 'unarchived') => {
    setArchivedUserStatusFilter(val);
    setPage(0);
    updateUrl({ status: val, page: 0 });
  };

  const onViewRow = useCallback((row: FrameTable) => {
    setShowingFrame(row);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const onEditRow = useCallback((row: FrameTable) => {
    setShowingFrame(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const onShowProducts = useCallback(
    (row: FrameTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveBucketId(row.bucketId);
      setActiveFrameId(row.id);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveBucketId, setActiveFrameId],
  );

  const onLocalArchiveToggle = useCallback((id: number, next: boolean) => {
    setData((prev) => prev.filter((r) => r.id !== id));
    setTotalRows((prev) => Math.max(0, prev - 1));
  }, []);

  const columns = useMemo(
    () => makeFrameTableColumns(onViewRow, onEditRow, onShowProducts, onLocalArchiveToggle),
    [onViewRow, onEditRow, onShowProducts, onLocalArchiveToggle],
  );

  const onAdded = () => {
    fetchData();
  };

  const onEdited = (id: number, patch: Partial<FrameTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleOpenAdd = () => {
    setShowingFrame(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setTimeout(() => {
      setModalMode('add');
      setShowingFrame(undefined);
    }, 300);
  };

  return (
    <Box sx={SX.tab_wrapper}>
      <FrameDialog
        open={modalOpen}
        mode={modalMode}
        onClose={handleCloseDialog}
        showingFrame={showingFrame}
        onAdded={onAdded}
        onEdited={onEdited}
        bucketId={bucketId}
        categories={categories}
      />
      <Typography sx={SX.tab_title}>
        {bucketName ? `${bucketName} (${t('tab_title')})` : t('tab_title')}
      </Typography>

      <Box sx={SX.filter_box}>
        <CustomTextField
          id="filter"
          title={t('filter.filter_title')}
          value={filterInput}
          setValue={handleFilterChange}
          placeholder={t('filter.placeholder')}
        />
        <Box sx={SX.select}>
          <Typography sx={SX.select_title}>{t('status_filter.title')}</Typography>
          <Select
            size="small"
            fullWidth
            labelId="role-label"
            id="role"
            value={archivedStatusFilter}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E7E6E6',
              },
            }}
            onChange={(e) => handleStatusChange(e.target.value as 'archived' | 'unarchived')}
          >
            <MenuItem value={'unarchived'}>{t('status_filter.unarchived')}</MenuItem>
            <MenuItem value={'archived'}>{t('status_filter.archived')}</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box sx={SX.table_buttons_container}>
        <Button sx={SX.add_button} variant="contained" onClick={handleOpenAdd}>
          {t('add_frame')}
        </Button>
      </Box>

      <FramesTable
        data={data}
        loading={loading}
        columns={columns}
        page={page}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
};

export default FrameTab;
