'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { InvoiceItem, OrderDocuments } from '@/api/wallet/dto';

export type OrderTable = {
  id: number;

  bucketId: number | undefined;
  productId: number | undefined;

  defaultBucketName: string;
  logo: string;
  sellerMobile: string;
  domainPrefix: string;
  province: string;
  city: string;
  address: string;

  title: string;
  price: number;
  goldPrice: number;
  shopFaName: string;
  firstName: string;
  lastName: string;
  mobilePhone: string;
  shippingAddress: string;
  postalCode: string;
  paymentTypeTitleFa: string;
  invoiceShippingTotal: number;
  invoiceFinalTotal: string;
  invoiceItems: InvoiceItem[];
  saleDate: string;
  statusTitle: string;
  paymentStatusFa: string;
  type: string;
  fromMiniApps: 0 | 1 | 2 | 3 | 4;
  site: string;
  documents: OrderDocuments;
  image: string | null;
  orderCode: string;
  G: string;
  createdAt: Date;
  actions?: React.ReactElement;
  userInformationAction?: React.ReactElement;
};

interface OrderTableProps {
  data: OrderTable[];
  loading: boolean;
  columns: Column<OrderTable>[];
  onRowClick?: (row: OrderTable) => void;
  totalRows?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const OrdersTable: FunctionComponent<OrderTableProps> = ({
  data,
  loading,
  columns,
  onRowClick,
  totalRows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useText('order');
  return (
    <DataTable<OrderTable>
      columns={columns}
      rows={data}
      rowCount={totalRows}
      direction={'rtl'}
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy={'id'}
      initialOrder={'desc'}
      getRowId={(row) => row.id}
      ariaLabel={t('table.orders_table')}
      emptyMessage={t('table.no_data_to_display')}
      loading={loading}
      onRowClick={onRowClick}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};

export default OrdersTable;
