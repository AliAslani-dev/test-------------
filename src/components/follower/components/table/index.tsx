'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { useLang } from '@/hooks/LanContext';
import { FollowRequestStatusType } from '@/api/follower/dto';

export type FollowRequestTable = {
  id: number;
  approved: FollowRequestStatusType;
  userId: number;
  zarplusUserId: number;
  zarplusUser: string;
  createdAt: Date;
  actions: React.ReactElement;
  accounting: React.ReactElement;
};

interface FollowRequestsTableProps {
  data: FollowRequestTable[];
  loading: boolean;
  columns: Column<FollowRequestTable>[];
  onRowClick?: (row: FollowRequestTable) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const FollowRequestsTable: FunctionComponent<FollowRequestsTableProps> = ({
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
  const { t } = useText('followers', lang);

  return (
    <DataTable<FollowRequestTable>
      columns={columns}
      rows={data}
      direction={'rtl'}
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy={'id'}
      initialOrder={'desc'}
      getRowId={(row) => row.id}
      ariaLabel={t('table.follow_requests_table')}
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
      horizontalScrollKey="followers"
    />
  );
};

export default FollowRequestsTable;
