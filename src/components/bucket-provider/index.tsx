'use client';

import useText from '@/hooks/useText';
import { Box, Typography } from '@mui/material';
import { getBucket } from '@/api/bucket/service';
import SX from '@/components/shared/common-styles/tabs';
import CustomTextField from '../shared/custom-text-field';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import BucketProvidersTable, { BucketProviderTable } from './components/table';
import BucketProviderDialog, { BucketProviderModalMode } from './components/dialog';
import { FunctionComponent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { makeBucketProviderTableColumns } from './components/table/components/columns';
import { useLang } from '@/hooks/LanContext';

interface BucketProviderTabProps {
  setActiveBucketProviderId: React.Dispatch<React.SetStateAction<number | null>>;
}

const DEFAULT_ROWS_PER_PAGE = 25;

const BucketProviderTab: FunctionComponent<BucketProviderTabProps> = ({
  setActiveBucketProviderId,
}) => {
  const { lang } = useLang();
  const { t } = useText('bucket', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<BucketProviderTable[]>([]);
  const [filteredData, setFilteredData] = useState<BucketProviderTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<BucketProviderModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingBucketProvider, setShowingBucketProvider] = useState<
    BucketProviderTable | undefined
  >(undefined);
  const [lan, setLan] = useState<'Fa' | 'En' | 'Tu'>('Fa');

  const [filter, setFilter] = useState<string>(() => searchParams.get('q') ?? '');
  const [page, setPage] = useState<number>(() => {
    const p = searchParams.get('page');
    const n = p ? parseInt(p, 10) : 0;
    return Number.isNaN(n) ? 0 : n;
  });
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    const r = searchParams.get('rows');
    const n = r ? parseInt(r, 10) : DEFAULT_ROWS_PER_PAGE;
    return Number.isNaN(n) ? DEFAULT_ROWS_PER_PAGE : n;
  });

  const updateUrl = useCallback(
    (override?: { q?: string; page?: number; rowsPerPage?: number }) => {
      const q = override?.q ?? filter;
      const p = override?.page ?? page;
      const r = override?.rowsPerPage ?? rowsPerPage;

      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (p > 0) params.set('page', String(p));
      if (r !== DEFAULT_ROWS_PER_PAGE) params.set('rows', String(r));

      const s = params.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [filter, page, rowsPerPage, pathname, router],
  );

  const fetchData = useCallback(async () => {
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const result = await getBucket();
      const rows = (result ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        identifier: row.identifier,
        enabled: row.enabled,
        actions: <></>,
      })) as BucketProviderTable[];

      setData(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const q = filter.trim().toLowerCase();
    if (!q) {
      setFilteredData(data);
      return;
    }

    setFilteredData(
      data.filter((r) => {
        const name = (r.name ?? '').toString().toLowerCase();
        return name.includes(q);
      }),
    );
  }, [data, filter]);

  const onLocalToggle = useCallback((id: number, next: boolean) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
  }, []);

  const onViewRow = useCallback((row: BucketProviderTable) => {
    setShowingBucketProvider(row);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const onEditRow = useCallback((row: BucketProviderTable) => {
    setShowingBucketProvider(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const onShowFrames = useCallback(
    (row: BucketProviderTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveBucketProviderId(row.id);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveBucketProviderId],
  );

  const columns = useMemo(
    () => makeBucketProviderTableColumns(onLocalToggle, onViewRow, onShowFrames),
    [onLocalToggle, onViewRow, onShowFrames],
  );

  const onAdded = (bucket: BucketProviderTable) => {
    setData((prev) => [bucket, ...prev]);
    setFilteredData((prev) => [bucket, ...prev]);
  };

  const onEdited = (id: number, patch: Partial<BucketProviderTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleOpenAdd = () => {
    setShowingBucketProvider(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setModalMode('add');
    setShowingBucketProvider(undefined);
  };

  const handleFilterChange = (v: string) => {
    const next = (v ?? '').toString();
    const nextTrimmed = next.trim();
    const prevTrimmed = filter.trim();

    setFilter(next);

    if (nextTrimmed === prevTrimmed) {
      updateUrl({ q: nextTrimmed });
      return;
    }

    setPage(0);
    updateUrl({ q: nextTrimmed, page: 0 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const handleRowsPerPageChange = (newRows: number) => {
    setRowsPerPage(newRows);
    setPage(0);
    updateUrl({ rowsPerPage: newRows, page: 0 });
  };

  return (
    <Box sx={SX.tab_wrapper}>
      <BucketProviderDialog
        open={modalOpen}
        mode={modalMode}
        setMode={setModalMode}
        onClose={handleCloseDialog}
        showingBucketProvider={showingBucketProvider}
        setShowingBucketProvider={setShowingBucketProvider}
        onAdded={onAdded}
        onEdited={onEdited}
      />

      <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>

      <Box sx={SX.filter_box}>
        <CustomTextField
          id="filter"
          title={t('filter.provider.name')}
          value={filter}
          setValue={handleFilterChange}
          placeholder={t('filter.provider.placeholder')}
        />
      </Box>

      {/* <Box sx={SX.table_buttons_container}> */}
      {/* <Button sx={SX.add_button} variant="contained" onClick={handleOpenAdd}> */}
      {/* {t('add_bucket')} */}
      {/* </Button> */}
      {/* </Box> */}
      <BucketProvidersTable
        data={filteredData}
        loading={loading}
        columns={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
};

export default BucketProviderTab;
