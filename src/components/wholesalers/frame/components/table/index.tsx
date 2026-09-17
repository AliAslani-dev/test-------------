'use client';

import useText from '@/hooks/useText';
import DataTable from '@/components/shared/table';
import { ProductVariant } from '@/api/product/dto';
import { FunctionComponent, ReactNode } from 'react';
import type { Column } from '@/components/shared/table';

export type ProductTable = {
  rowNumber: number;

  id: number;
  bucketId: number;
  model: string;
  archived: boolean;
  image: string;
  images: string[];
  variants: ProductVariant[];
  actions: React.ReactElement;
};

interface ProductTableProps {
  data: ProductTable[];
  loading: boolean;
  columns: Column<ProductTable>[];
  onRowClick?: (row: ProductTable) => void;
  renderCollapsibleRow?: (row: ProductTable) => ReactNode;
  totalRows?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const ProductsTable: FunctionComponent<ProductTableProps> = ({
  data,
  loading,
  columns,
  onRowClick,
  renderCollapsibleRow,
  totalRows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useText('frame');
  return (
    <DataTable<ProductTable>
      columns={columns}
      rows={data}
      rowCount={totalRows}
      direction={'rtl'}
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy={'id'}
      initialOrder={'desc'}
      getRowId={(row) => row.id}
      ariaLabel={t('table.products_table')}
      emptyMessage={t('table.no_data_to_display')}
      loading={loading}
      onRowClick={onRowClick}
      renderCollapsibleRow={renderCollapsibleRow}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};

export default ProductsTable;
