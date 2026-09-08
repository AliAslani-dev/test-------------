'use client';

import useText from '@/hooks/useText';
import { ProvinceDTO } from '@/api/admin/user/dto';
import SX from '@/components/shared/common-styles/tabs';
import { Box, Button, Typography } from '@mui/material';
import CustomTextField from '../shared/custom-text-field';
import UsersTable, { UserTable } from './components/table';
import UserDialog, { UserModalMode } from './components/dialog';
import { getProvinces, getUsers } from '@/api/admin/user/service';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { makeUserTableColumns } from './components/table/components/columns';
import { FunctionComponent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/hooks/LanContext';

interface UserTabProps {
  setActiveUserId: React.Dispatch<React.SetStateAction<number | null>>;
}

const DEFAULT_ROWS_PER_PAGE = 25;

const UserTab: FunctionComponent<UserTabProps> = ({ setActiveUserId }) => {
  const { lang } = useLang();
  const { t } = useText('user', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<UserTable[]>([]);
  const [filteredData, setFilteredData] = useState<UserTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<UserModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingUser, setShowingUser] = useState<UserTable | undefined>(undefined);

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
      const [usersRes, provincesRes] = await Promise.all([getUsers(), getProvinces()]);

      const provinces: ProvinceDTO[] = Array.isArray(provincesRes) ? provincesRes : [];
      const provinceMap = new Map<string, ProvinceDTO>(provinces.map((m) => [m.name, m]));

      const rows: UserTable[] = (usersRes ?? []).map((row: any) => {
        const province: string | null = row.province;
        const p = provinceMap.get(province ?? '');

        return {
          id: row.id,
          username: row.username,
          email: row.email,
          role: row.role,

          logo: row.logo,
          sellerMobile: row.sellerMobile,
          sellerFullName: row.sellerFullName,
          fullName: row.fullName,
          mobile: row.mobile,
          nationalCode: row.nationalCode,
          refererName: row.refererName,
          provinceId: p?.id ?? null,
          province: province ?? '',
          city: row.city,
          address: row.address,
          description: row.description,
          showcase: row.showcase,
          domain: row.domain,
          signedContract: row.signedContract,
          businessLicense: row.businessLicense,
          businessLicenseImage: row.businessLicenseImage,
          birthDate: row.birthDate,
          closed: row.closed,

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
        const username = (r.username ?? '').toString().toLowerCase();
        const email = (r.email ?? '').toString().toLowerCase();
        return username.includes(q) || email.includes(q);
      }),
    );
  }, [data, filter]);

  const onLocalToggle = useCallback((id: number, next: boolean) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
  }, []);

  const onLocalCloseStoreToggle = useCallback((id: number, next: boolean) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, closed: next } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, closed: next } : r)));
  }, []);

  const onEditRow = useCallback((row: UserTable) => {
    setShowingUser(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const onSeeOrdersRow = useCallback(
    (row: UserTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveUserId(row.id);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveUserId],
  );

  const onSeeRequestsRow = useCallback(
    (row: UserTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveUserId(row.id);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveUserId],
  );

  const onSeeAccountingRow = useCallback(
    (row: UserTable, e?: MouseEvent<HTMLAnchorElement>) => {
      setActiveUserId(row.id);

      if (e?.metaKey || e?.ctrlKey || e?.button === 1) return;
    },
    [setActiveUserId],
  );

  const columns = useMemo(
    () =>
      makeUserTableColumns(
        onLocalToggle,
        onLocalCloseStoreToggle,
        onEditRow,
        onSeeOrdersRow,
        onSeeRequestsRow,
        onSeeAccountingRow,
      ),
    [
      onLocalToggle,
      onLocalCloseStoreToggle,
      onEditRow,
      onSeeOrdersRow,
      onSeeRequestsRow,
      onSeeAccountingRow,
    ],
  );

  const onAdded = (user: UserTable) => {
    setData((prev) => [user, ...prev]);
    setFilteredData((prev) => [user, ...prev]);
  };

  const onEdited = (id: number, patch: Partial<UserTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setFilteredData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleOpenAdd = () => {
    setShowingUser(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setModalMode('add');
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
      <UserDialog
        open={modalOpen}
        mode={modalMode}
        setMode={setModalMode}
        onClose={handleCloseDialog}
        showingUser={showingUser}
        setShowingUser={setShowingUser}
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
          {t('add_user')}
        </Button>
      </Box>

      <UsersTable
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

export default UserTab;
