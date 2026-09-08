'use client';

import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import { UserDTO } from '@/api/admin/user/dto';
import { getUsers } from '@/api/admin/user/service';
import SX from '@/components/shared/common-styles/tabs';
import { Box, Button, Typography } from '@mui/material';
import CustomTextField from '../shared/custom-text-field';
import { getAdminBucket } from '@/api/admin/bucket/service';
import BucketsTable, { BucketTable } from './components/table';
import BucketDialog, { BucketModalMode } from './components/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { makeBucketTableColumns } from './components/table/components/columns';
import { FunctionComponent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface BucketTabProps {
  setActiveBucketId: React.Dispatch<React.SetStateAction<number | null>>;
}

const DEFAULT_ROWS_PER_PAGE = 25;

const BucketTab: FunctionComponent<BucketTabProps> = ({ setActiveBucketId }) => {
  const { lang } = useLang();
  const { t } = useText('bucket', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<BucketTable[]>([]);
  const [filteredData, setFilteredData] = useState<BucketTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<BucketModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingBucket, setShowingBucket] = useState<BucketTable | undefined>(undefined);

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
      const [bucketRes, userRes] = await Promise.all([getAdminBucket(), getUsers()]);

      const users: UserDTO[] = Array.isArray(userRes) ? userRes : [];
      const userMap = new Map<number, UserDTO>(users.map((m) => [m.id, m]));

      const rows: BucketTable[] = (bucketRes ?? []).map((row: any) => {
        const userId: number = row.user?.id ?? row.userId ?? 0;
        const u = userMap.get(userId);
        return {
          id: row.id,
          name: row.name,
          identifier: row.identifier,
          showName: row.showName,
          userId,
          user: u?.username ?? '',
          enabled: row.enabled,
          actions: <></>,
        };
      });

      setData(rows);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 100);
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
        const username = (r.user ?? '').toString().toLowerCase();
        return name.includes(q) || username.includes(q);
      }),
    );
  }, [data, filter]);

  const onLocalToggle = useCallback((id: number, next: boolean) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
  }, []);

  const onViewRow = useCallback((row: BucketTable) => {
    setShowingBucket(row);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const onEditRow = useCallback((row: BucketTable) => {
    setShowingBucket(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const onShowFrames = useCallback(
    (row: BucketTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveBucketId(row.id);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveBucketId],
  );

  const columns = useMemo(
    () => makeBucketTableColumns(onLocalToggle, onViewRow, onShowFrames),
    [onLocalToggle, onViewRow, onShowFrames],
  );

  const onAdded = (bucket: BucketTable) => {
    setData((prev) => [bucket, ...prev]);
    setFilteredData((prev) => [bucket, ...prev]);
  };

  const onEdited = (id: number, patch: Partial<BucketTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleOpenAdd = () => {
    setShowingBucket(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setModalMode('add');
    setShowingBucket(undefined);
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
      <BucketDialog
        open={modalOpen}
        mode={modalMode}
        setMode={setModalMode}
        onClose={handleCloseDialog}
        showingBucket={showingBucket}
        setShowingBucket={setShowingBucket}
        onAdded={onAdded}
        onEdited={onEdited}
      />

      <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>

      <Box sx={SX.filter_box}>
        <CustomTextField
          id="filter"
          title={t('filter.admin.name')}
          value={filter}
          setValue={handleFilterChange}
          placeholder={t('filter.admin.placeholder')}
        />
      </Box>

      <Box sx={SX.table_buttons_container}>
        <Button sx={SX.add_button} variant="contained" onClick={handleOpenAdd}>
          {t('add_bucket')}
        </Button>
      </Box>

      <BucketsTable
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

export default BucketTab;
