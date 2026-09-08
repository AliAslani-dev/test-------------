'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { CategoryField } from '@/api/admin/category/dto';
import { useLang } from '@/hooks/LanContext';

export type CategoryTable = {
  id: number;
  enName: string;
  faName: string;
  fields: null | CategoryField[];
  actions: React.ReactElement;
};

interface CategoryTableProps {
  data: CategoryTable[];
  loading: boolean;
  columns: Column<CategoryTable>[];
  onRowClick?: (row: CategoryTable) => void;
}

const CategoriesTable: FunctionComponent<CategoryTableProps> = ({
  data,
  loading,
  columns,
  onRowClick,
}) => {
  const { lang } = useLang();
  const { t } = useText('category', lang);
  return (
    <DataTable<CategoryTable>
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
      fillAvailableViewport
      viewportMinHeight={180}
      viewportBottomGap={8}
      horizontalScrollKey="categories"
    />
  );
};

export default CategoriesTable;
