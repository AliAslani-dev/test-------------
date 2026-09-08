'use client';

import SX from './styles';
import useText from '@/hooks/useText';
import { Box, Button, Typography } from '@mui/material';
import { getCategories } from '@/api/admin/category/service';
import CategoriesTable, { CategoryTable } from './components/table';
import CategoryDialog, { CategoryModalMode } from './components/dialog';
import { makeCategoryTableColumns } from './components/table/components/columns';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/hooks/LanContext';

const CategoryTab: FunctionComponent = () => {
  const { lang } = useLang();
  const { t } = useText('category', lang);
  const [data, setData] = useState<CategoryTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<CategoryModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingCategory, setShowingCategory] = useState<CategoryTable | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setData([]);
    setLoading(true);
    try {
      const result = await getCategories();
      setData(
        (result ?? []).map((row: any) => ({
          id: row.id,
          enName: row.enName,
          faName: row.faName,
          fields: row.fields,
        })) as CategoryTable[],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onViewRow = useCallback((row: CategoryTable) => {
    setShowingCategory(row);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const onEditRow = useCallback((row: CategoryTable) => {
    setShowingCategory(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const columns = useMemo(
    () => makeCategoryTableColumns(onViewRow, onEditRow),
    [onViewRow, onEditRow],
  );

  const onAdded = (category: CategoryTable) => {
    setData((prev) => [category, ...prev]);
  };

  const onEdited = (id: number, patch: Partial<CategoryTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleOpenAdd = () => {
    setShowingCategory(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setModalMode('add');
    setShowingCategory(undefined);
  };

  return (
    <Box sx={SX.tab_wrapper}>
      <CategoryDialog
        open={modalOpen}
        mode={modalMode}
        setMode={setModalMode}
        onClose={handleCloseDialog}
        showingCategory={showingCategory}
        setShowingCategory={setShowingCategory}
        onAdded={onAdded}
        onEdited={onEdited}
      />

      <Box sx={SX.header}>
        <Typography sx={SX.header_value}>{t('tab_title')}</Typography>

        <Box sx={SX.buttons_container}>
          <Button sx={SX.add_button} variant="contained" onClick={handleOpenAdd}>
            {t('add_category')}
          </Button>
          {/* <Box
            sx={{
              ...SX.refresh_button_container,
              pointerEvents: loading ? 'none' : 'auto',
            }}
            onClick={fetchData}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fetchData()}
            aria-label={t('refresh')}
            aria-disabled={loading}
          >
            <RefreshIcon sx={SX.refresh_button} />
          </Box> */}
        </Box>
      </Box>
      <CategoriesTable
        data={data}
        loading={loading}
        columns={columns}
        // onRowClick={onViewRow}
      />
    </Box>
  );
};

export default CategoryTab;
