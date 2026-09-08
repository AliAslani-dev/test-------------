'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import { useLang } from '@/hooks/LanContext';
import DataTable from '@/components/shared/table';
import type { Column } from '@/components/shared/table';
import { FrameAdditionalFields } from '@/api/frame/dto';

export type FrameTable = {
  id: number;
  bucketId: number;
  categoryId: number;
  category: string;
  genderCategoryId: number | null;
  genderCategory: string | null;
  model: string;
  wage: string;
  profit: string;
  discount: string;
  caratValue: string;
  carat: string;
  minWeight: string;
  maxWeight: string;
  totalWeight: string;
  images: string[];
  blur: 0 | 1;
  cover: string;
  covers: string[];
  archived: boolean;
  additionalFields: FrameAdditionalFields | null;
  actions: React.ReactElement;
};

interface FrameTableProps {
  data: FrameTable[];
  loading: boolean;
  columns: Column<FrameTable>[];
  onRowClick?: (row: FrameTable) => void;
  totalRows?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const FramesTable: FunctionComponent<FrameTableProps> = ({
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
  const { lang } = useLang();
  const { t } = useText('frame', lang);
  return (
    <DataTable<FrameTable>
      columns={columns}
      rows={data}
      rowCount={totalRows}
      direction={'rtl'}
      minWidth={600}
      defaultRowsPerPage={25}
      initialOrderBy={'id'}
      initialOrder={'desc'}
      getRowId={(row) => row.id}
      ariaLabel={t('table.frames_table')}
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
      horizontalScrollKey="frames"
    />
  );
};

export default FramesTable;
