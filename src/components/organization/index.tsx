'use client';

import SX from './styles';
import useText from '@/hooks/useText';
import { Box, Button, Typography } from '@mui/material';
import { getOrganizations } from '@/api/admin/organization/service';
import OrganizationsTable, { OrganizationTable } from './components/table';
import OrganizationDialog, { OrganizationModalMode } from './components/dialog';
import { makeOrganizationTableColumns } from './components/table/components/columns';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/hooks/LanContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CustomTextField from '@/components/shared/custom-text-field';

const DEFAULT_ROWS_PER_PAGE = 25;

const OrganizationTab: FunctionComponent = () => {
  const { lang } = useLang();
  const { t } = useText('organization', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<OrganizationTable[]>([]);
  const [filteredData, setFilteredData] = useState<OrganizationTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<OrganizationModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingOrganization, setShowingOrganization] = useState<OrganizationTable | undefined>(
    undefined,
  );

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
    setLoading(true);
    try {
      const result = await getOrganizations();
      const mappedData = (result ?? []).map((row) => ({
        id: row.id,
        enName: row.enName,
        faName: row.faName,
        commission: row.commission,
        isEnabled: row.isEnabled,
        actions: <></>,
      })) as OrganizationTable[];
      setData(mappedData);
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
        const faName = (r.faName ?? '').toString().toLowerCase();
        const enName = (r.enName ?? '').toString().toLowerCase();
        return faName.includes(q) || enName.includes(q);
      }),
    );
  }, [data, filter]);

  const onViewRow = useCallback((row: OrganizationTable) => {
    setShowingOrganization(row);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const onEditRow = useCallback((row: OrganizationTable) => {
    setShowingOrganization(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const onLocalToggle = useCallback((id: number, next: boolean) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, isEnabled: next } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, isEnabled: next } : r)));
  }, []);

  const columns = useMemo(
    () => makeOrganizationTableColumns(onViewRow, onEditRow, onLocalToggle),
    [onViewRow, onEditRow, onLocalToggle],
  );

  const onAdded = (organization: OrganizationTable) => {
    setData((prev) => [organization, ...prev]);
    setFilteredData((prev) => [organization, ...prev]);
  };

  const onEdited = (id: number, patch: Partial<OrganizationTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleOpenAdd = () => {
    setShowingOrganization(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setModalMode('add');
    setShowingOrganization(undefined);
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
      <OrganizationDialog
        open={modalOpen}
        mode={modalMode}
        setMode={setModalMode}
        onClose={handleCloseDialog}
        showingOrganization={showingOrganization}
        setShowingOrganization={setShowingOrganization}
        onAdded={onAdded}
        onEdited={onEdited}
      />

      <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>

      <Box sx={SX.filter_box}>
        <CustomTextField
          id="filter"
          title={t('filter.filter_title')}
          value={filter}
          setValue={handleFilterChange}
          placeholder={t('filter.placeholder')}
        />
      </Box>

      <Box sx={SX.table_buttons_container}>
        <Button sx={SX.add_button} variant="contained" onClick={handleOpenAdd}>
          {t('add_organization')}
        </Button>
      </Box>

      <OrganizationsTable
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

export default OrganizationTab;
