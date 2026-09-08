'use client';

import useText from '@/hooks/useText';
import { UserRole } from '@/constants';
import { FunctionComponent } from 'react';
import { useLang } from '@/hooks/LanContext';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';

export type UserTable = {
  id: number;
  username: string | null;
  email: string | null;
  role: UserRole;

  logo: string;
  sellerMobile: string | null;
  sellerFullName: null | string;
  fullName: null | string;
  mobile: null | string;
  nationalCode: null | string;
  refererName: null | string;
  provinceId: null | number;
  province: string;
  city: null | string;
  address: null | string;
  description: null | string;
  showcase: null | string;
  domain: null | string;
  signedContract: null | boolean;
  businessLicense: null | boolean;
  businessLicenseImage: null | string;
  birthDate: null | string;
  closed: boolean;

  enabled: boolean;
  actions: React.ReactElement;
};

interface UserTableProps {
  data: UserTable[];
  loading: boolean;
  columns: Column<UserTable>[];
  onRowClick?: (row: UserTable) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const UsersTable: FunctionComponent<UserTableProps> = ({
  data,
  loading,
  columns,
  onRowClick,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { lang } = useLang();
  const { t } = useText('user', lang);

  return (
    <DataTable<UserTable>
      columns={columns}
      rows={data}
      direction="rtl"
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy="id"
      initialOrder="desc"
      getRowId={(row) => row.id}
      ariaLabel={t('table.users_table')}
      emptyMessage={t('table.no_data_to_display')}
      loading={loading}
      onRowClick={onRowClick}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      fillAvailableViewport
      viewportMinHeight={180}
      viewportBottomGap={8}
      horizontalScrollKey="users"
    />
  );
};

export default UsersTable;
