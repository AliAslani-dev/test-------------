'use client';

import useText from '@/hooks/useText';
import { UserRole } from '@/constants';
import { Box, Button } from '@mui/material';
import { useLang } from '@/hooks/LanContext';
import { ProductVariant } from '@/api/product/dto';
import SX from '@/components/shared/common-styles/tabs';
import CustomTextField from '../shared/custom-text-field';
import { getProductsByFrame } from '@/api/product/service';
import ProductVariantsTable from './components/variants-table';
import ProductsTable, { ProductTable } from './components/table';
import ProductDialog, { ProductModalMode } from './components/dialog';
import FrameInfoBanner from './components/frame-info/FrameInfoBanner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { makeProductTableColumns } from './components/table/components/columns';
import { getFrameCategories, getFrameGenderCategories } from '@/api/frame/service';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FrameCategoryDTO, FrameGenderCategoryDTO, FramesByBucketDTO } from '@/api/frame/dto';

const DEFAULT_ROWS_PER_PAGE = 25;
const DEBOUNCE_DELAY = 800;

interface ProductTabProps {
  role: UserRole;
  bucketId: number | null;
  frameId: number | null;
}

const updateProductListWithVariants = (
  products: ProductTable[],
  productId: number,
  updatedVariants: ProductVariant[],
) => {
  const updatedVariantsMap = new Map(updatedVariants.map((v) => [v.id, v]));

  return products.map((product) => {
    if (product.id !== productId) return product;

    return {
      ...product,
      variants: product.variants.map((variant) => updatedVariantsMap.get(variant.id) || variant),
    };
  });
};

const ProductTab: FunctionComponent<ProductTabProps> = ({ role, bucketId, frameId }) => {
  if (!bucketId || !frameId) return <></>;

  const { lang } = useLang();
  const { t } = useText('product', lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAdmin = useMemo(() => {
    const adminRoles: UserRole[] = ['banking-admin'];
    return adminRoles.includes(role);
  }, [role]);

  const [page, setPage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : 0;
  });

  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    const r = searchParams.get('rows');
    return r ? parseInt(r, 10) : DEFAULT_ROWS_PER_PAGE;
  });

  const [filterInput, setFilterInput] = useState<string>(() => searchParams.get('filter') || '');
  const [debouncedFilter, setDebouncedFilter] = useState<string>(filterInput);

  const [frameData, setFrameData] = useState<FramesByBucketDTO | null>(null);
  const [data, setData] = useState<ProductTable[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [categoriesList, setCategoriesList] = useState<FrameCategoryDTO[]>([]);
  const [genderCategoriesList, setGenderCategoriesList] = useState<FrameGenderCategoryDTO[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filterInput), DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [filterInput]);

  const updateUrl = useCallback(
    (override?: { page?: number; rowsPerPage?: number; filter?: string }) => {
      const p = override?.page ?? page;
      const r = override?.rowsPerPage ?? rowsPerPage;
      const f = override?.filter !== undefined ? override.filter : debouncedFilter;

      const params = new URLSearchParams();
      if (p > 0) params.set('page', String(p));
      if (r !== DEFAULT_ROWS_PER_PAGE) params.set('rows', String(r));
      if (f) params.set('filter', f);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [page, rowsPerPage, debouncedFilter, pathname, router],
  );

  useEffect(() => {
    updateUrl({ filter: debouncedFilter });
  }, [debouncedFilter, updateUrl]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [categoriesRes, genderCategoriesRes] = await Promise.all([
          getFrameCategories(),
          getFrameGenderCategories(),
        ]);

        if (!mounted) return;

        setCategoriesList(Array.isArray(categoriesRes) ? categoriesRes : []);
        setGenderCategoriesList(Array.isArray(genderCategoriesRes) ? genderCategoriesRes : []);
      } catch (e) {
        if (!mounted) return;
        setCategoriesList([]);
        setGenderCategoriesList([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryIdToFaName = useMemo(() => {
    const obj: Record<number, string> = {};
    for (const c of categoriesList) obj[c.id] = c.faName;
    return obj;
  }, [categoriesList]);

  const genderIdToFaName = useMemo(() => {
    const obj: Record<number, string> = {};
    for (const g of genderCategoriesList) obj[g.id] = g.faName;
    return obj;
  }, [genderCategoriesList]);

  const resolvedCategoryFaName = useMemo(() => {
    const id = frameData?.category;
    if (id == null) return null;
    return categoryIdToFaName[id] ?? null;
  }, [frameData?.category, categoryIdToFaName]);

  const resolvedGenderFaName = useMemo(() => {
    const id = frameData?.genderCategory;
    if (id == null) return null;
    return genderIdToFaName[id] ?? null;
  }, [frameData?.genderCategory, genderIdToFaName]);

  const fetchData = useCallback(async () => {
    if (!bucketId || !frameId) return;

    setLoading(true);
    try {
      const apiParams = {
        page: page + 1,
        per_page: rowsPerPage,
        filter: debouncedFilter || undefined,
      };

      const productResponse = await getProductsByFrame(bucketId, frameId, apiParams);

      setTotalRows(productResponse?.meta?.total ?? 0);
      setFrameData(productResponse?.frame ?? null);

      const productsData = productResponse?.products ?? [];

      const rows: ProductTable[] = productsData.map((row: any, index) => ({
        rowNumber: index + 1 + page * rowsPerPage,
        id: row.id,
        bucketId: row.bucketId,
        model: row.model,
        archived: row.archived,
        image: row.image,
        images: row.images,
        variants: row.variants,
        actions: <></>,
      }));

      setData(rows);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFrameData(null);
      setTotalRows(0);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [bucketId, frameId, page, rowsPerPage, debouncedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const handleRowsPerPageChange = (newRows: number) => {
    const r = parseInt(String(newRows), 10);
    setRowsPerPage(r);
    setPage(0);
    updateUrl({ rowsPerPage: r, page: 0 });
  };

  const handleFilterChange = (val: string) => {
    setFilterInput(val);
    setPage(0);
  };

  const [modalMode, setModalMode] = useState<ProductModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [showingProduct, setShowingProduct] = useState<ProductTable | undefined>(undefined);

  const onViewRow = useCallback((row: ProductTable) => {
    setShowingProduct(row);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const onEditRow = useCallback((row: ProductTable) => {
    setShowingProduct(row);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const columns = useMemo(
    () => makeProductTableColumns(onViewRow, onEditRow),
    [onViewRow, onEditRow],
  );

  const onAdded = () => fetchData();

  const handleOpenAdd = () => {
    setShowingProduct(undefined);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setModalOpen(false);
    setModalMode('add');
    setShowingProduct(undefined);
  };

  const renderCollapsibleRow = useCallback((row: ProductTable) => {
    return (
      <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
        <ProductVariantsTable variants={row.variants} />
      </Box>
    );
  }, []);

  return (
    <Box sx={SX.tab_wrapper}>
      <ProductDialog
        open={modalOpen}
        mode={modalMode}
        onClose={handleCloseDialog}
        showingProduct={showingProduct}
        onAdded={onAdded}
        onCommitted={fetchData}
        bucketId={bucketId}
        frameId={frameId}
      />

      <FrameInfoBanner
        loading={loading}
        frame={frameData}
        categoryName={resolvedCategoryFaName}
        genderCategoryName={resolvedGenderFaName}
      />

      <Box sx={SX.filter_box}>
        <CustomTextField
          id="filter"
          title={t('filter.filter_title')}
          value={filterInput}
          setValue={handleFilterChange}
          placeholder={t('filter.placeholder')}
        />
      </Box>

      <Box sx={SX.table_buttons_container}>
        <Button sx={SX.add_button} variant="contained" onClick={handleOpenAdd}>
          {t('add_product')}
        </Button>
      </Box>

      <ProductsTable
        data={data}
        loading={loading}
        columns={columns}
        renderCollapsibleRow={renderCollapsibleRow}
        page={page}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
};

export default ProductTab;
