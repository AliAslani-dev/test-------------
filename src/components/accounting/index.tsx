'use client';

import SX from './style';
import { fWC, tPD } from '@/utils';
import useText from '@/hooks/useText';
import { UserRole } from '@/constants';
import { useLang } from '@/hooks/LanContext';
import { AccountingDTO } from '@/api/order/dto';
import { ProvinceDTO } from '@/api/admin/user/dto';
import UserDialog from '../user/components/dialog';
import { ZarplusUserDTO } from '@/api/follower/dto';
import { UserTable } from '../user/components/table';
import { getZarplusUsers } from '@/api/follower/service';
import { Box, Skeleton, Typography } from '@mui/material';
import WholesaleOrderDialog from '../order/components/dialog';
import { getAccounting, getOrders } from '@/api/order/service';
import { getProvinces, getUsers } from '@/api/admin/user/service';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import WholesaleOrdersTable, { WholesaleOrderTable } from '../order/components/table';
import { makeWholesaleOrderTableColumns } from '../order/components/table/components/columns';
import useDashboard from '../../../hooks/useDashboard';

const GetItemBox = (title: string, value: string, type: 'gold' | 'rial') => (
  <Box sx={type === 'gold' ? SX.item_box : SX.item_box_rial}>
    <Box sx={SX.item_box_header}>
      <Box sx={type === 'gold' ? SX.item_box_indicator : SX.item_box_indicator_rial} />
      <Typography sx={SX.item_title}>{title}</Typography>
    </Box>
    <Typography sx={SX.item_value}>{value}</Typography>
  </Box>
);

const DEFAULT_ROWS_PER_PAGE = 25;

interface AccountingTabProps {
  userId: number | null;
  role: UserRole;
}

const AccountingTab: FunctionComponent<AccountingTabProps> = ({ userId, role }) => {
  const isAdmin = useMemo(() => {
    const adminRoles = ['banking-admin'];
    return adminRoles.includes(role ?? '');
  }, [role]);

  const { lang } = useLang();
  const { t } = useText('accounting', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<WholesaleOrderTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showingWholesaleOrder, setShowingWholesaleOrder] = useState<
    WholesaleOrderTable | undefined
  >(undefined);

  const [accountingData, setAccountingData] = useState<AccountingDTO[]>([]);

  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [provider, setProvider] = useState<UserTable | undefined>(undefined);

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
      const p = override?.page ?? page;
      const r = override?.rowsPerPage ?? rowsPerPage;

      const params = new URLSearchParams();
      if (p > 0) params.set('page', String(p));
      if (r !== DEFAULT_ROWS_PER_PAGE) params.set('rows', String(r));

      const s = params.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [page, rowsPerPage, pathname, router],
  );
  const { user } = useDashboard();
  const fetchData = useCallback(async () => {
    setData([]);
    setLoading(true);
    try {
      if ((isAdmin && userId) || (!isAdmin && user)) {
        const [result, userRes, accRes] = await Promise.all([
          getOrders(isAdmin ? (userId as number) : (user?.id as number), {}),
          getZarplusUsers(),
          getAccounting(isAdmin ? (userId as number) : (user?.id as number)),
        ]);

        setAccountingData(accRes ?? []);

        const users: ZarplusUserDTO[] = Array.isArray(userRes) ? userRes : [];
        const userMap = new Map<number, ZarplusUserDTO>(users.map((m) => [m.id, m]));

        const rows: WholesaleOrderTable[] = (result ?? []).map((row: any, index: number) => {
          const zarplusUserId: number = row.zarplusUserId ?? 0;
          const u = userMap.get(zarplusUserId);

          return {
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
            sendTypeId: row.sendTypeId,
            settlementTypeId: row.settlementTypeId,
            sendTypeAdditionalFields: row.sendTypeAdditionalFields,
            settlementTypeAdditionalFields: row.settlementTypeAdditionalFields,
            zarhubSendTypeAdditionalFields: row.zarhubSendTypeAdditionalFields,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            rowNumber: index + 1,
            actions: <></>,
          };
        });
        setData(rows);

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
      }
    } finally {
      setLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onViewRow = useCallback((row: WholesaleOrderTable) => {
    setShowingWholesaleOrder(row);
    setModalOpen(true);
  }, []);

  const columns = useMemo(() => makeWholesaleOrderTableColumns(onViewRow), [onViewRow]);

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

  const accountingCards = useMemo(() => {
    if (!accountingData || accountingData.length === 0) return [];

    const base = accountingData[0];
    const dataFetched = accountingData.length !== 0;
    const precisionFactor = dataFetched ? Math.pow(10, base.assetPrecision) : 1;

    return [
      {
        key: 'total_asset_credit',
        title: t('total_asset_credit'),
        value: dataFetched ? String(tPD(base.totalAssetCredit / precisionFactor)) : '۰',
        type: 'gold',
      },
      {
        key: 'total_rial_credit',
        title: t('total_rial_credit'),
        value: dataFetched ? String(tPD(fWC(base.totalRialCredit))) : '۰',
        type: 'rial',
      },

      {
        key: 'total_zarhub_asset_credit',
        title: t('total_zarhub_asset_credit'),
        value: dataFetched ? String(tPD(base.totalZarhubAssetCredit / precisionFactor)) : '۰',
        type: 'gold',
      },
      {
        key: 'total_zarhub_rial_credit',
        title: t('total_zarhub_rial_credit'),
        value: dataFetched ? String(tPD(fWC(base.totalZarhubRialCredit))) : '۰',
        type: 'rial',
      },

      {
        key: 'zarhub_share_asset',
        title: t('zarhub_share_asset'),
        value: dataFetched ? String(tPD(base.zarhubShareAsset / precisionFactor)) : '۰',
        type: 'gold',
      },
      {
        key: 'zarhub_share_rial',
        title: t('zarhub_share_rial'),
        value: dataFetched ? String(tPD(fWC(base.zarhubShareRial))) : '۰',
        type: 'rial',
      },

      {
        key: 'total_client_asset_credit',
        title: t('total_client_asset_credit'),
        value: dataFetched ? String(tPD(base.totalClientAssetCredit / precisionFactor)) : '۰',
        type: 'gold',
      },
      {
        key: 'total_client_rial_credit',
        title: t('total_client_rial_credit'),
        value: dataFetched ? String(tPD(fWC(base.totalClientRialCredit))) : '۰',
        type: 'rial',
      },
    ];
  }, [accountingData, t]);

  const isAccountingLoading = loading && accountingData.length === 0;

  if (isAdmin && !userId) {
    return (
      <Box sx={SX.tab_wrapper}>
        <Box sx={SX.header_container}>
          <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>
          <Typography color="text.secondary">{t('admin_select_user')}</Typography>
        </Box>
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

      <Box sx={SX.header_container}>
        <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>

        <Box sx={SX.context_badges_container}>
          {isAdmin && provider?.username && (
            <Box sx={SX.user_badge}>
              <Typography sx={SX.user_badge_label}>بنکداری:</Typography>
              <Typography sx={SX.user_badge_value} onClick={() => setProviderDialogOpen(true)}>
                {provider.username}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={SX.accounting_box}>
        {isAccountingLoading
          ? Array.from({ length: 8 }, (_, index) => (
              <Box key={`accounting-skeleton-${index}`} sx={SX.accounting_item_cell}>
                <Skeleton
                  variant="rounded"
                  sx={{
                    width: '100%',
                    maxWidth: '320px',
                    minHeight: '140px',
                    borderRadius: '16px',
                  }}
                />
              </Box>
            ))
          : accountingCards.map((card) => (
              <Box key={card.key} sx={SX.accounting_item_cell}>
                {GetItemBox(card.title, card.value, card.type as 'gold' | 'rial')}
              </Box>
            ))}
      </Box>

      <WholesaleOrdersTable
        data={data}
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

export default AccountingTab;
