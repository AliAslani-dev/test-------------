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
} from '@/api/order/dto';
import { useLang } from '@/hooks/LanContext';

export type WholesaleOrderTable = {
  rowNumber: number;
  id: number;
  title: string | null;
  bucketName: string;
  bucketId: number;
  status: WholesaleOrderStatusType;
  userId: number;
  zarplusUserId: number;
  zarplusUser: string;
  items: WholesalerOrderItem[];
  finalItems: WholesalerOrderItem[] | null;
  finalGoldCredit: number | null;
  finalRialCredit: number | null;
  sendTypeId: number | null;
  sendTypeAdditionalFields: SendTypeAdditionalFields | null;
  settlementTypeAdditionalFields: SettlementTypeAdditionalFields | null;
  zarhubSendTypeAdditionalFields: SendTypeAdditionalFields | null;
  settlementTypeId: number | null;
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
  const { lang } = useLang();
  const { t } = useText('order', lang);

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
      ariaLabel={t('table.view_requests_table')}
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
      horizontalScrollKey="orders"
    />
  );
};

export default WholesaleOrdersTable;
