'use client';

import useText from '@/hooks/useText';
import { UserRole } from '@/constants';
import { useLang } from '@/hooks/LanContext';
import useDashboard from '../../../hooks/useDashboard';
import { getOrders, inProgressOrder } from '@/api/order/service';
import { Box, Typography } from '@mui/material';
import { ProvinceDTO } from '@/api/admin/user/dto';
import UserDialog from '../user/components/dialog';
import { ZarplusUserDTO } from '@/api/follower/dto';
import { UserTable } from '../user/components/table';
import WholesaleOrderDialog from './components/dialog';
import SX from '@/components/shared/common-styles/tabs';
import { getZarplusUsers } from '@/api/follower/service';
import CustomTextField from '../shared/custom-text-field';
import { getProvinces, getUsers } from '@/api/admin/user/service';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import WholesaleOrdersTable, { WholesaleOrderTable } from './components/table';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { makeWholesaleOrderTableColumns } from './components/table/components/columns';

const DEFAULT_ROWS_PER_PAGE = 25;

interface WholesaleOrderTabProps {
  userId: number | null;
  role: UserRole;
}

const WholesaleOrderTab: FunctionComponent<WholesaleOrderTabProps> = ({ userId, role }) => {
  const isAdmin = useMemo(() => {
    const adminRoles = ['banking-admin'];
    return adminRoles.includes(role ?? '');
  }, [role]);

  const { lang } = useLang();
  const { t } = useText('order', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<WholesaleOrderTable[]>([]);
  const [filteredData, setFilteredData] = useState<WholesaleOrderTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showingWholesaleOrder, setShowingWholesaleOrder] = useState<
    WholesaleOrderTable | undefined
  >(undefined);

  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [provider, setProvider] = useState<UserTable | undefined>(undefined);

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

  const handleCloseProviderDialog = () => {
    setProviderDialogOpen(false);
  };

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
  const { user } = useDashboard();
  const fetchData = useCallback(async () => {
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      if ((isAdmin && userId) || (!isAdmin && user)) {
        const [result, userRes] = await Promise.all([
          getOrders(isAdmin ? (userId as number) : (user?.id as number), {}),
          getZarplusUsers(),
        ]);

        const users: ZarplusUserDTO[] = Array.isArray(userRes) ? userRes : [];
        const userMap = new Map<number, ZarplusUserDTO>(users.map((m) => [m.id, m]));

        if (isAdmin) {
          let [providers, provinces] = await Promise.all([
            getUsers('banking-provider'),
            getProvinces(),
          ]);
          provinces = Array.isArray(provinces) ? provinces : [];
          const provinceMap = new Map<string, ProvinceDTO>(provinces.map((m) => [m.name, m]));

          const filteredProviders = providers?.map((provider) => {
            const province = provinceMap.get(provider.province ?? '');

            return {
              id: provider.id,
              username: provider.username,
              email: provider.email,
              role: provider.role,
              logo: provider.logo,
              sellerMobile: provider.sellerMobile,
              sellerFullName: provider.sellerFullName,
              fullName: provider.fullName,
              mobile: provider.mobile,
              nationalCode: provider.nationalCode,
              refererName: provider.refererName,
              city: provider.city,
              address: provider.address,
              description: provider.description,
              showcase: provider.showcase,
              signedContract: provider.signedContract,
              businessLicense: provider.businessLicense,
              businessLicenseImage: provider.businessLicenseImage,
              enabled: provider.enabled,
              domainPrefix: provider.domain,
              domain: provider.domain,
              provinceId: province?.id ?? null,
              province: province?.name ?? '',
              postingByUser: false,
              goldenPosId: null,
              goldenPosTerminalNumber: null,
              client: 'admin',
              zeroStock: false,
              actions: <></>,
            } as unknown as UserTable;
          });
          const currentProvider = filteredProviders?.filter((prov) => prov.id === userId);
          if (currentProvider && currentProvider.length > 0) setProvider(currentProvider[0]);
        }

        const rows: WholesaleOrderTable[] = (result ?? []).map((row: any, index) => {
          const zarplusUserId: number = row.zarplusUserId ?? 0;
          const u = userMap.get(zarplusUserId);

          return {
            rowNumber: index + 1,
            id: row.id,
            title: row.title,
            bucketName: row.bucketName,
            bucketId: row.bucketId,
            userId: row.userId,
            zarplusUserId: row.zarplusUserId,
            zarplusUser: u?.defaultBucketName ?? t('unknown_user'),
            items: row.items,
            finalItems: row.finalItems,
            finalGoldCredit: row.finalGoldCredit,
            finalRialCredit: row.finalRialCredit,
            status: row.status,
            settlementTypeId: row.settlementTypeId,
            sendTypeId: row.sendTypeId,
            sendTypeAdditionalFields: row.sendTypeAdditionalFields,
            settlementTypeAdditionalFields: row.settlementTypeAdditionalFields,
            zarhubSendTypeAdditionalFields: row.zarhubSendTypeAdditionalFields,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            actions: <></>,
          };
        });

        setData(rows);
      }
    } finally {
      setLoading(false);
    }
  }, [role, userId]);

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

  const onEditRow = useCallback(
    async (row: WholesaleOrderTable) => {
      if (row.status === 1) {
        setShowingWholesaleOrder(row);
        setModalOpen(true);
        return;
      }

      if (row.status !== 0 || editingOrderId !== null) return;

      setEditingOrderId(row.id);

      try {
        await inProgressOrder(row.id);

        const updatedRow: WholesaleOrderTable = {
          ...row,
          status: 1 as WholesaleOrderTable['status'],
          updatedAt: new Date(),
        };

        setData((prev) => prev.map((item) => (item.id === row.id ? updatedRow : item)));

        setShowingWholesaleOrder(updatedRow);

        setModalOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setEditingOrderId(null);
      }
    },
    [editingOrderId],
  );

  const columns = useMemo(
    () => makeWholesaleOrderTableColumns(onViewRow, onEditRow, editingOrderId),
    [onViewRow, onEditRow, editingOrderId],
  );

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

  if (isAdmin && !userId) {
    return (
      <Box sx={SX.tab_wrapper}>
        <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>
        <Typography color="text.secondary">{t('admin_select_user')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={SX.tab_wrapper}>
      <WholesaleOrderDialog
        open={modalOpen}
        onClose={handleCloseDialog}
        showingWholesaleOrder={showingWholesaleOrder}
        setShowingWholesaleOrder={setShowingWholesaleOrder}
        onRefreshList={fetchData}
      />

      {isAdmin && (
        <UserDialog
          open={providerDialogOpen}
          mode={'view'}
          onClose={handleCloseProviderDialog}
          showingUser={provider}
          setShowingUser={setProvider}
        />
      )}

      {isAdmin ? (
        <Typography sx={SX.tab_title}>
          {t('tab_title')} (
          <Typography
            component="span"
            sx={{
              ...SX.tab_title,
              cursor: 'pointer',
              textDecoration: 'underline',
              color: 'rgb(30, 32, 172)',
              '&:hover .MuiTypography-root': {
                color: 'primary.main',
              },
            }}
            onClick={() => setProviderDialogOpen(true)}
          >
            {provider?.username ?? ''}
          </Typography>
          )
        </Typography>
      ) : (
        <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>
      )}

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
