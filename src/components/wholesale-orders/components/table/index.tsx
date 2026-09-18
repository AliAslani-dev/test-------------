'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import {
  SendTypeAdditionalFields,
  SettlementTypeAdditionalFields,
  WholesaleOrderStatusType,
  WholesalerOrderItem,
  ZarhubSendTypeAdditionalFields,
} from '@/api/zarhub/dto';

export type WholesaleOrderTable = {
  id: number;
  title: string | null;
  bucketName: string;
  bucketId: number;
  status: WholesaleOrderStatusType;
  userId: number;
  zarplusUserId: number;
  items: WholesalerOrderItem[];
  finalItems: WholesalerOrderItem[] | null;
  finalRialCredit: number | null;
  finalGoldCredit: number | null;
  sendTypeId: number | null;
  settlementTypeId: number | null;
  sendTypeAdditionalFields: SendTypeAdditionalFields | null;
  settlementTypeAdditionalFields: SettlementTypeAdditionalFields | null;
  zarhubSendTypeAdditionalFields: ZarhubSendTypeAdditionalFields | null;
  createdAt: Date;
  updatedAt: Date;
  actions: React.ReactElement;
};

interface WholesaleOrderTableProps {
  data: WholesaleOrderTable[];
  loading: boolean;
  columns: Column<WholesaleOrderTable>[];
  onRowClick?: (row: WholesaleOrderTable) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const WholesaleOrdersTable: FunctionComponent<WholesaleOrderTableProps> = ({
  data,
  loading,
  columns,
  onRowClick,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useText('wholesaleOrder');

  return (
    <DataTable<WholesaleOrderTable>
      columns={columns}
      rows={data}
      direction={'rtl'}
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy={'id'}
      initialOrder={'desc'}
      getRowId={(row) => row.id}
      ariaLabel={t('table.wholesaler_orders_table')}
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

export default WholesaleOrdersTable;
