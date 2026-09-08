'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { useLang } from '@/hooks/LanContext';

export type BucketTable = {
  id: number;
  name: string;
  identifier: string;
  userId: number;
  user: string;
  showName: boolean;
  enabled: boolean;
  actions: React.ReactElement;
};

interface BucketTableProps {
  data: BucketTable[];
  loading: boolean;
  columns: Column<BucketTable>[];
  onRowClick?: (row: BucketTable) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const BucketsTable: FunctionComponent<BucketTableProps> = ({
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
  const { t } = useText('bucket', lang);

  return (
    <DataTable<BucketTable>
      columns={columns}
      rows={data}
      direction={'rtl'}
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy={'id'}
      initialOrder={'desc'}
      getRowId={(row) => row.id}
      ariaLabel={t('table.buckets_table')}
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
      horizontalScrollKey="buckets"
    />
  );
};

export default BucketsTable;
