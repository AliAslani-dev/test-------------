'use client';

import useText from '@/hooks/useText';
import { UserRole } from '@/constants';
import { useLang } from '@/hooks/LanContext';
import useDashboard from '../../../hooks/useDashboard';
import { TwoFStatusDTO } from '@/api/auth/dto';
import { ProvinceDTO } from '@/api/admin/user/dto';
import UserDialog from '../user/components/dialog';
import { ZarplusUserDTO } from '@/api/follower/dto';
import ZarplusUserDialog from './components/dialog';
import { UserTable } from '../user/components/table';
import SX from '@/components/shared/common-styles/tabs';
import CustomTextField from '../shared/custom-text-field';
import { getProvinces, getUsers } from '@/api/admin/user/service';
import { Box, Typography, Select, MenuItem } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getFollowRequests, getZarplusUsers } from '@/api/follower/service';
import FollowRequestsTable, { FollowRequestTable } from './components/table';
import { makeFollowRequestTableColumns } from './components/table/components/columns';
import { FunctionComponent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_ROWS_PER_PAGE = 25;

interface FollowersTabProps {
  userId: number;
  role: UserRole;
  setActiveZarPlusUserId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveUserId: React.Dispatch<React.SetStateAction<number | null>>;
}

const FollowersTab: FunctionComponent<FollowersTabProps> = ({
  userId,
  role,
  setActiveZarPlusUserId,
  setActiveUserId,
}) => {
  if (!userId) return <></>;
  const isAdmin = useMemo(() => {
    const adminRoles = ['banking-admin'];
    return adminRoles.includes(role ?? '');
  }, [role]);

  const { lang } = useLang();
  const { t } = useText('followers', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<FollowRequestTable[]>([]);
  const [zarplusUsers, setZarplusUsers] = useState<ZarplusUserDTO[]>([]);
  const [filteredData, setFilteredData] = useState<FollowRequestTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showingUser, setShowingUser] = useState<ZarplusUserDTO | undefined>(undefined);

  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [provider, setProvider] = useState<UserTable | undefined>(undefined);

  const [filter, setFilter] = useState<string>(() => searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<string>(
    () => searchParams.get('status') ?? 'all',
  );

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
    (override?: { q?: string; status?: string; page?: number; rowsPerPage?: number }) => {
      const q = override?.q ?? filter;
      const s_val = override?.status ?? statusFilter;
      const p = override?.page ?? page;
      const r = override?.rowsPerPage ?? rowsPerPage;

      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (s_val !== 'all') params.set('status', s_val);
      if (p > 0) params.set('page', String(p));
      if (r !== DEFAULT_ROWS_PER_PAGE) params.set('rows', String(r));

      const s = params.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [filter, statusFilter, page, rowsPerPage, pathname, router],
  );
  const { user } = useDashboard();
  const fetchData = useCallback(async () => {
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      if ((isAdmin && userId) || (!isAdmin && user)) {
        const [result, userRes] = await Promise.all([
          getFollowRequests(isAdmin ? (userId as number) : (user?.id as number)),
          getZarplusUsers(),
        ]);

        setZarplusUsers(userRes ?? []);

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

        const rows: FollowRequestTable[] = (result ?? []).map((row: any) => {
          const zarplusUserId: number = row.zarplusUserId ?? 0;
          const u = userMap.get(zarplusUserId);

          return {
            id: row.id,
            approved: row.approved,
            userId: row.userId,
            zarplusUserId: row.zarplusUserId,
            zarplusUser: u?.defaultBucketName ?? t('unknown_user'),
            createdAt: row.createdAt,
            actions: <></>,
            accounting: <></>,
          };
        });

        setData(rows);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, userId, isAdmin, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Filtering (Search String + Status Dropdown)
  useEffect(() => {
    const q = filter.trim().toLowerCase();
    let result = data;

    // 1. Filter by Search Query
    if (q) {
      result = result.filter((r) => {
        const name = (r.zarplusUser ?? '').toString().toLowerCase();
        return name.includes(q);
      });
    }

    // 2. Filter by Numeric Approval Status (-1, 0, 1)
    if (statusFilter !== 'all') {
      const numericStatus = parseInt(statusFilter, 10);
      result = result.filter((r) => r.approved === numericStatus);
    }

    setFilteredData(result);
  }, [data, filter, statusFilter]);

  const onViewRow = useCallback(
    (row: FollowRequestTable) => {
      const users: ZarplusUserDTO[] = zarplusUsers;
      const userMap = new Map<number, ZarplusUserDTO>(users.map((m) => [m.id, m]));
      const zarplusUserId: number = row.zarplusUserId ?? 0;
      const u = userMap.get(zarplusUserId);

      setShowingUser(u);
      setModalOpen(true);
    },
    [zarplusUsers],
  );

  const onChangeStatus = useCallback((id: number, patch: Partial<FollowRequestTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const onSeeGalleryAccountingRow = useCallback(
    (row: FollowRequestTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveZarPlusUserId(row.zarplusUserId);
      setActiveUserId(userId);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveZarPlusUserId, setActiveUserId, userId],
  );
  const columns = useMemo(
    () =>
      makeFollowRequestTableColumns(
        userId,
        isAdmin,
        onChangeStatus,
        onViewRow,
        onSeeGalleryAccountingRow,
      ),
    [userId, isAdmin, onChangeStatus, onViewRow, onSeeGalleryAccountingRow],
  );

  const handleCloseDialog = () => {
    setModalOpen(false);
    setShowingUser(undefined);
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

  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(0);
    updateUrl({ status: v, page: 0 });
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
      <ZarplusUserDialog open={modalOpen} onClose={handleCloseDialog} showingUser={showingUser} />

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
        <Box sx={{ width: '100%', flex: 1 }}>
          <CustomTextField
            id="filter"
            title={t('filter.name')}
            value={filter}
            setValue={handleFilterChange}
            placeholder={t('filter.placeholder')}
          />
        </Box>

        <Box sx={{ ...SX.select, flex: 1 }}>
          <Typography sx={SX.select_title}>{t('filter.status_title')}</Typography>
          <Select
            size="small"
            fullWidth
            labelId="status-label"
            id="status"
            value={statusFilter}
            sx={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E7E6E6',
              },
            }}
            onChange={(e) => handleStatusChange(e.target.value as string)}
          >
            <MenuItem value="all">{t('filter.all')}</MenuItem>
            <MenuItem value="1">{t('filter.approved')}</MenuItem>
            <MenuItem value="0">{t('filter.waiting')}</MenuItem>
            <MenuItem value="-1">{t('filter.rejected')}</MenuItem>
          </Select>
        </Box>
      </Box>

      <FollowRequestsTable
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

export default FollowersTab;
