'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { useLang } from '@/hooks/LanContext';

export type OrganizationTable = {
  id: number;
  enName: string;
  faName: string;
  commission: number;
  isEnabled: boolean;
  actions: React.ReactElement;
};

interface OrganizationsTableProps {
  data: OrganizationTable[];
  loading: boolean;
  columns: Column<OrganizationTable>[];
  onRowClick?: (row: OrganizationTable) => void;
  page?: number; // ✅ اضافه کن
  rowsPerPage?: number; // ✅ اضافه کن
  onPageChange?: (page: number) => void; // ✅ اضافه کن
  onRowsPerPageChange?: (rowsPerPage: number) => void; // ✅ اضافه کن
}

const OrganizationsTable: FunctionComponent<OrganizationsTableProps> = ({
  data,
  loading,
  columns,
  onRowClick,
  page, // ✅ اضافه کن
  rowsPerPage, // ✅ اضافه کن
  onPageChange, // ✅ اضافه کن
  onRowsPerPageChange, // ✅ اضافه کن
}) => {
  const { lang } = useLang();
  const { t } = useText('organization', lang);

  return (
    <DataTable<OrganizationTable>
      columns={columns}
      rows={data}
      direction="rtl"
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy="id"
      initialOrder="desc"
      getRowId={(row) => row.id}
      ariaLabel={t('table.organizations_table')}
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
      horizontalScrollKey="organizations"
    />
  );
};

export default OrganizationsTable;