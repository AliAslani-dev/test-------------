'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { useLang } from '@/hooks/LanContext';

export type BucketProviderTable = {
  id: number;
  name: string;
  identifier: string;
  enabled: boolean;
  actions: React.ReactElement;
};

interface BucketProviderTableProps {
  data: BucketProviderTable[];
  loading: boolean;
  columns: Column<BucketProviderTable>[];
  onRowClick?: (row: BucketProviderTable) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const BucketProvidersTable: FunctionComponent<BucketProviderTableProps> = ({
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
    <DataTable<BucketProviderTable>
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
      horizontalScrollKey="buckets-provider"
    />
  );
};

export default BucketProvidersTable;
