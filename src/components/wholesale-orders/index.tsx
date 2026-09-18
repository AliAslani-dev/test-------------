'use client';

import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import { Box, Typography } from '@mui/material';
import WholesaleOrderDialog from './components/dialog';
import SX from '@/components/shared/common-styles/tabs';
import { getBuyerOrders } from '@/api/zarhub/service';

import CustomTextField from '../shared/custom-text-field';
import CloneOrderDialog from './components/clone-order-dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import WholesaleOrdersTable, { WholesaleOrderTable } from './components/table';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { makeWholesaleOrderTableColumns } from './components/table/components/columns';
import useDashboard from '../../../hooks/useDashboard';
const DEFAULT_ROWS_PER_PAGE = 25;

const WholesaleOrderTab: FunctionComponent = () => {
  const { userId: currentUserId } = useDashboard(); 

    const { lang } = useLang();
    const { t } = useText('wholesaleOrder', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<WholesaleOrderTable[]>([]);
  const [filteredData, setFilteredData] = useState<WholesaleOrderTable[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);

  const [showingWholesaleOrder, setShowingWholesaleOrder] = useState<
    WholesaleOrderTable | undefined
  >(undefined);

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
    if (!currentUserId) return;

    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const [result] = await Promise.all([getBuyerOrders(currentUserId, {})]);
      const rows: WholesaleOrderTable[] = (result ?? []).map((row: any) => {
        return {
          id: row.id,
          title: row.title,
          bucketName: row.bucketName,
          bucketId: row.bucketId,
          userId: row.userId,
          zarplusUserId: row.zarplusUserId,
          items: row.items,
          finalItems: row.finalItems,
          finalGoldCredit: row.finalGoldCredit,
          finalRialCredit: row.finalRialCredit,
          settlementTypeId: row.settlementTypeId,
          sendTypeId: row.sendTypeId,
          sendTypeAdditionalFields: row.sendTypeAdditionalFields,
          settlementTypeAdditionalFields: row.settlementTypeAdditionalFields,
          zarhubSendTypeAdditionalFields: row.zarhubSendTypeAdditionalFields,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          status: row.status,
          actions: <></>,
        };
      });

      setData(rows);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

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
        const name = (r.bucketName ?? '').toString().toLowerCase();
        return name.includes(q);
      }),
    );
  }, [data, filter]);

  const onViewRow = useCallback((row: WholesaleOrderTable) => {
    setShowingWholesaleOrder(row);
    setModalOpen(true);
  }, []);

  const columns = useMemo(() => makeWholesaleOrderTableColumns(onViewRow), [onViewRow]);

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

  const handleCloseDialog = () => {
    setModalOpen(false);
    setShowingWholesaleOrder(undefined);
  };

  const handleOpenClone = () => {
    setModalOpen(false);
    setIsCloneDialogOpen(true);
  };

  return (
    <Box sx={SX.tab_wrapper}>
      <WholesaleOrderDialog
        open={modalOpen}
        onClose={handleCloseDialog}
        showingWholesaleOrder={showingWholesaleOrder}
        setShowingWholesaleOrder={setShowingWholesaleOrder}
        onRefreshList={fetchData}
        onCloneClick={handleOpenClone}
      />

      <CloneOrderDialog
        open={isCloneDialogOpen}
        onClose={() => {
          setIsCloneDialogOpen(false);
          setShowingWholesaleOrder(undefined);
        }}
        initialOrder={showingWholesaleOrder}
      />

      <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>

      <Box sx={SX.filter_box}>
        <CustomTextField
          id="filter"
          title={t('filter.name')}
          value={filter}
          setValue={handleFilterChange}
          placeholder={t('filter.placeholder')}
        />
      </Box>

      <WholesaleOrdersTable
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

export default WholesaleOrderTab;