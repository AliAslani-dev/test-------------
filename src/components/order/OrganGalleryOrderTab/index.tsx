'use client';

import SX from './styles';
import JDate from 'jalali-date';
import useText from '@/hooks/useText';
import { flushSync } from 'react-dom';
import { UserRole } from '@/constants';
import { UserDTO } from '@/api/admin/user/dto';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import { getOrders } from '@/api/wallet/service';
import { getUsers } from '@/api/admin/user/service';
import { useNotification } from '@/hooks/useNotification';
import { ProductTable } from '../product/components/table';
import ProductDialog from '../all-orders/components/dialog';
import OrdersTable, { OrderTable } from './components/table';
import OrderDocumentDialog from './components/document-dialog';
import OrderUserInformationDialog from './components/user-dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { makeOrderTableColumns } from './components/table/components/columns';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductCaratDTO, ProductCategoryDTO, ProductGenderCategoryDTO } from '@/api/product/dto';
import { useReactToPrint } from 'react-to-print';
import FactorPreview from './components/dialog/factor';
import {
  getProductById,
  getProductCarats,
  getProductCategories,
  getProductGenderCategories,
} from '@/api/product/service';
import { getProfile } from '@/api/profile/service';
import DatePicker from '@/components/shared/date-picker';
import { OrderStatus, OrdersFilters } from '@/api/wallet/dto';
import useDashboard from '../../../../hooks/useDashboard';

const DEFAULT_ROWS_PER_PAGE = 25;

const normalizeJalaliDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const y = parts[0];
  const m = parts[1].padStart(2, '0');
  const d = parts[2].padStart(2, '0');
  return `${y}/${m}/${d}`;
};

const getGregorianFilter = (jDateStr: string): string | undefined => {
  const normalized = normalizeJalaliDate(jDateStr);
  if (!normalized || normalized.length !== 10) return undefined;
  const parts = normalized.split('/');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
  if (m < 1 || m > 12) return undefined;
  if (d < 1 || d > 31) return undefined;

  try {
    const date = JDate.to_gregorian(y, m, d);
    const gy = date.getFullYear();
    const gm = String(date.getMonth() + 1).padStart(2, '0');
    const gd = String(date.getDate()).padStart(2, '0');
    return `${gy}-${gm}-${gd}`;
  } catch (error) {
    return undefined;
  }
};

const convertDDate = (source: Date | undefined) => {
  if (source) {
    let [year, month, day] = JDate.toJalali(source).map(String);
    month = String(month).padStart(2, '0');
    day = String(day).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  return undefined;
};

interface OrderTabProps {
  userId: number | null;
  role: UserRole;
}

const OrderTab: FunctionComponent<OrderTabProps> = ({ userId, role }) => {
  const { userId: currentUserId } = useDashboard();

  const isAdmin = useMemo(() => {
    const adminRoles = [
      'admin',
      'zarplus-admin',
      'modopod-admin',
      'zarplus-marketer',
      'board-member',
      'customer-development',
    ];
    return adminRoles.includes(role);
  }, [role]);

  if (isAdmin && !userId) return <></>;

  const isMarketer = useMemo(() => {
    const adminRoles = ['zarplus-marketer'];
    return adminRoles.includes(role);
  }, [role]);
  const isBoardMember = useMemo(() => {
    const _roles = ['board-member'];
    return _roles.includes(role);
  }, [role]);
  const isCustomerDevelopment = useMemo(() => {
    const _roles = ['customer-development'];
    return _roles.includes(role);
  }, [role]);

  const { t } = useText('order');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();

  const [page, setPage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : 0;
  });

  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    const r = searchParams.get('rows');
    return r ? parseInt(r, 10) : DEFAULT_ROWS_PER_PAGE;
  });

  const [selectedType, setSelectedType] = useState<number | 'ALL'>(() => {
    const tParam = searchParams.get('types');
    return tParam ? parseInt(tParam, 10) : 'ALL';
  });

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>(() => {
    const sParam = searchParams.get('status');
    return (sParam as OrderStatus) || 'ALL';
  });

  const [debouncedFrom, setDebouncedFrom] = useState<string | undefined>('');
  const [debouncedTo, setDebouncedTo] = useState<string | undefined>('');
  const [customDFromDate, setCustomDFromDate] = useState<Date | undefined>(undefined);
  const [customDToDate, setCustomDToDate] = useState<Date | undefined>(undefined);

  const [data, setData] = useState<OrderTable[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const printContentRef = useRef<HTMLDivElement | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrderTable | undefined>(undefined);
  const [printingId, setPrintingId] = useState<number | null>(null);

  const [userInformationDialogOpen, setUserInformationDialogOpen] = useState(false);
  const [userInformationOrder, setUserInformationOrder] = useState<OrderTable | undefined>(
    undefined,
  );

  const [documentDialogId, setDocumentDialogId] = useState<number | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productDialogLoading, setProductDialogLoading] = useState(false);
  const [showingProduct, setShowingProduct] = useState<ProductTable | undefined>(undefined);
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
  const bucketName = useRef('');

  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: printingOrder ? `order-${printingOrder.id}` : 'order',
    onAfterPrint: () => setPrintingId(null),
    onPrintError: () => setPrintingId(null),
    pageStyle: `
      @page {
        size: 148.5mm 210mm;
        margin: 0 !important;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          /* FORCE MOBILE PRINT ENGINE TO SEE A DESKTOP 750px LAYOUT AND SHRINK IT */
          width: 750px !important;
          height: 1055px !important;
          overflow: hidden !important;
        }
      }
    `,
  });

  useEffect(() => {
    const finalCustomDates: { from: string | undefined; to: string | undefined } = {
      from: convertDDate(customDFromDate),
      to: convertDDate(customDToDate),
    };

    setDebouncedFrom(finalCustomDates.from ? finalCustomDates.from : debouncedFrom);
    setDebouncedTo(finalCustomDates.to ? finalCustomDates.to : debouncedTo);
  }, [customDFromDate, customDToDate]);

  useEffect(() => {
    if (printingId !== null && printingOrder) {
      const timer = setTimeout(() => {
        handlePrint();
        setTimeout(() => setPrintingId(null), 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printingId, printingOrder, handlePrint]);

  const onPrintRow = useCallback(
    (row: OrderTable) => {
      flushSync(() => {
        setPrintingOrder(row);
        setPrintingId(row.id);
      });
      handlePrint();
    },
    [handlePrint],
  );

  const updateUrl = useCallback(
    (override?: {
      page?: number;
      rowsPerPage?: number;
      types?: number | 'ALL';
      status?: OrderStatus | 'ALL';
      from?: string;
      to?: string;
    }) => {
      const p = override?.page ?? page;
      const r = override?.rowsPerPage ?? rowsPerPage;
      const ty = override?.types !== undefined ? override.types : selectedType;
      const st = override?.status !== undefined ? override.status : selectedStatus;
      const f = override?.from !== undefined ? override.from : debouncedFrom;
      const tVal = override?.to !== undefined ? override.to : debouncedTo;

      const params = new URLSearchParams();
      if (p > 0) params.set('page', String(p));
      if (r !== DEFAULT_ROWS_PER_PAGE) params.set('rows', String(r));
      if (ty !== 'ALL') params.set('types', String(ty));
      if (st && st !== 'ALL') params.set('status', st);
      if (f && f.length === 10) params.set('from', f);
      if (tVal && tVal.length === 10) params.set('to', tVal);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [page, rowsPerPage, selectedType, selectedStatus, debouncedFrom, debouncedTo, pathname, router],
  );

  useEffect(() => {
    updateUrl({ from: debouncedFrom, to: debouncedTo });
  }, [debouncedFrom, debouncedTo]);

  const documentOrder = useMemo(() => {
    return data.find((order) => order.id === documentDialogId);
  }, [data, documentDialogId]);

  const fetchData = useCallback(async () => {
    const apiFromDate = getGregorianFilter(debouncedFrom ? debouncedFrom : '');
    const apiToDate = getGregorianFilter(debouncedTo ? debouncedTo : '');

    const isFromInvalid = debouncedFrom !== '' && apiFromDate === undefined;
    const isToInvalid = debouncedTo !== '' && apiToDate === undefined;

    if (isFromInvalid || isToInvalid) {
      setData([]);
      setTotalRows(0);
      setLoading(false);
      return;
    }

    setData([]);
    setLoading(true);
    try {
      const apiParams: OrdersFilters = {
        page: page + 1,
        per_page: rowsPerPage,
        from: apiFromDate,
        to: apiToDate,
      };

      if (selectedType !== 'ALL') {
        apiParams.types = [selectedType];
      }

      if (selectedStatus !== 'ALL') {
        apiParams.status = selectedStatus;
      }

      if (isAdmin && userId) {
        const [ordersRes, userRes] = await Promise.all([getOrders(userId, apiParams), getUsers()]);

        if (ordersRes && ordersRes.meta) {
          setTotalRows(ordersRes.meta.total);
        } else {
          setTotalRows(0);
        }

        const users: UserDTO[] = Array.isArray(userRes) ? userRes : [];
        const userMap = new Map<number, UserDTO>(users.map((m) => [m.id, m]));
        setUsername(userMap.get(userId)?.username ?? '');

        const rows: OrderTable[] = (ordersRes?.orders ?? []).map((row: any, index) => {
          const userId: number = row.userId ?? 0;
          const u = userMap.get(userId);

          return {
            id: row.id,
            title: row.invoiceItems?.[0]?.title ?? '',
            price: row.invoiceItems?.[0]?.price ?? 0,
            goldPrice: row.invoiceItems[0].goldPrice,
            shopFaName: row.shopFaName,
            firstName: row.firstName,
            lastName: row.lastName,
            mobilePhone: row.mobilePhone,
            shippingAddress: row.shippingAddress,
            postalCode: row.postalCode,
            createdAt: row.createdAt,
            paymentTypeTitleFa: row.paymentTypeTitleFa,
            invoiceShippingTotal: row.invoiceShippingTotal,
            invoiceFinalTotal: row.invoiceFinalTotal,
            invoiceItems: row.invoiceItems,
            saleDate: row.saleDate,
            statusTitle: row.statusTitle,
            paymentStatusFa: row.paymentStatusFa,
            type: row.type,
            fromMiniApps: row.fromMiniApps,
            site: row.site,
            image: row.image,
            orderCode: row.orderCode,
            G: row.G,
            documents: row.documents || {},
            productId: (row.invoiceItems?.[0] || {}).productId,
            bucketId: Number(row.bucketId),
            defaultBucketName: u?.defaultBucketName ?? '',
            logo: u?.logo ?? '',
            sellerMobile: u?.sellerMobile ?? '',
            province: u?.province ?? '',
            city: u?.city ?? '',
            address: u?.address ?? '',
            domainPrefix: u?.domainPrefix ?? '',
          };
        });

        setData(rows);
      } else if (!isAdmin) {
        if (currentUserId) {
          const [result, profileRes] = await Promise.all([
            getOrders(currentUserId, apiParams),
            getProfile(),
          ]);

          if (result && result.meta) {
            setTotalRows(result.meta.total);
          } else {
            setTotalRows(0);
          }

          setData(
            (result?.orders ?? []).map((row: any) => ({
              id: row.id,
              title: row.invoiceItems?.[0]?.title ?? '',
              price: row.invoiceItems?.[0]?.price ?? 0,
              goldPrice: row.invoiceItems[0].goldPrice,
              shopFaName: row.shopFaName,
              firstName: row.firstName,
              lastName: row.lastName,
              mobilePhone: row.mobilePhone,
              shippingAddress: row.shippingAddress,
              postalCode: row.postalCode,
              createdAt: row.createdAt,
              invoiceShippingTotal: row.invoiceShippingTotal,
              paymentTypeTitleFa: row.paymentTypeTitleFa,
              invoiceFinalTotal: row.invoiceFinalTotal,
              invoiceItems: row.invoiceItems,
              saleDate: row.saleDate,
              statusTitle: row.statusTitle,
              paymentStatusFa: row.paymentStatusFa,
              type: row.type,
              fromMiniApps: row.fromMiniApps,
              site: row.site,
              image: row.image,
              orderCode: row.orderCode,
              G: row.G,
              documents: row.documents || {},
              productId: (row.invoiceItems?.[0] || {}).productId,
              bucketId: Number(row.bucketId),
              defaultBucketName: profileRes?.defaultBucketName ?? '',
              logo: profileRes?.logo ?? '',
              sellerMobile: profileRes?.sellerMobile ?? '',
              province: profileRes?.province ?? '',
              city: profileRes?.city ?? '',
              address: profileRes?.address ?? '',
              domainPrefix: profileRes?.domainPrefix ?? '',
            })) as OrderTable[],
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    role,
    userId,
    currentUserId,
    page,
    rowsPerPage,
    pathname,
    router,
    isAdmin,
    debouncedFrom,
    debouncedTo,
    selectedType,
    selectedStatus,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeChange = (newType: number | 'ALL') => {
    setSelectedType(newType);
    setPage(0);
    updateUrl({ types: newType, page: 0 });
  };

  const handleStatusChange = (newStatus: OrderStatus | 'ALL') => {
    setSelectedStatus(newStatus);
    setPage(0);
    updateUrl({ status: newStatus, page: 0 });
  };

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

  const onViewRow = useCallback(async (row: OrderTable) => {
    if (!row.productId || !row.bucketId) {
      showNotification(t('no_product_id_error'), 'error');
      return;
    }

    setProductModalOpen(true);
    setProductDialogLoading(true);
    setShowingProduct(undefined);

    try {
      const [productRespons, caratsResponse, categoriesRes, genderCategoriesRes] =
        await Promise.all([
          getProductById(row.bucketId, row.productId),
          getProductCarats(),
          getProductCategories(),
          getProductGenderCategories(),
        ]);

      const carats: ProductCaratDTO[] = Array.isArray(caratsResponse) ? caratsResponse : [];
      const caratsMap = new Map<string, ProductCaratDTO>(carats.map((c) => [String(c.value), c]));

      const categories: ProductCategoryDTO[] = Array.isArray(categoriesRes) ? categoriesRes : [];
      setCategories(categories);
      const categoriesMap = new Map<number, ProductCategoryDTO>(categories.map((m) => [m.id, m]));

      const genderCategories: ProductGenderCategoryDTO[] = Array.isArray(genderCategoriesRes)
        ? genderCategoriesRes
        : [];
      const genderCategoriesMap = new Map<number, ProductGenderCategoryDTO>(
        genderCategories.map((m) => [m.id, m]),
      );

      if (productRespons && productRespons.products) {
        bucketName.current = productRespons.bucketName;
        const productDetails = productRespons.products;

        const caratValue = String(productDetails.carat ?? '');
        const ca = caratsMap.get(caratValue);

        const categoryId: number = productDetails.category ?? 0;
        const c = categoriesMap.get(categoryId);

        const genderCategoryId: number = productDetails.genderCategory ?? 0;
        const gc = genderCategoriesMap.get(genderCategoryId);

        const productTableData: ProductTable = {
          id: productDetails.id,
          bucketId: productDetails.bucketId,
          sku: productDetails.sku,
          model: productDetails.model,
          wage: productDetails.wage,
          profit: productDetails.profit,
          discount: productDetails.discount,
          archived: productDetails.archived,
          caratValue,
          carat: ca?.amount ?? '',
          categoryId,
          category: c?.faName ?? '',
          genderCategoryId,
          genderCategory: gc?.faName ?? '',
          variants: productDetails.variants ?? [],
          additionalFields: productDetails.additionalFields ?? {},
          image: productDetails.image ?? '',
          aiImage: productDetails.aiImage,
          aiStatus: productDetails.aiStatus,
          aiImageRequested: productDetails.aiImageRequested,
          images: productDetails.images ?? [],
          activeShops: productDetails.activeShops ?? {},
          actions: <></>,
        };
        setShowingProduct(productTableData);
      }
    } catch (error) {
      console.error('Failed to fetch product details', error);
    } finally {
      setProductDialogLoading(false);
    }
  }, []);

  const handleLocalDataChange = useCallback((id: number, patch: Partial<OrderTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleCloseUserInformationDialog = () => {
    setUserInformationDialogOpen(false);
    setUserInformationOrder(undefined);
  };

  const onUserInformationRow = useCallback((row: OrderTable) => {
    setUserInformationOrder(row);
    setUserInformationDialogOpen(true);
  }, []);

  const onUploadRow = useCallback((row: OrderTable) => {
    setDocumentDialogId(row.id);
  }, []);

  const handleCloseDocumentDialog = () => {
    setDocumentDialogId(null);
  };

  const onChangeOrderStatus = (id: number, patch: Partial<OrderTable>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleCloseProductDialog = () => {
    setProductModalOpen(false);
  };

  const columns = useMemo(
    () =>
      makeOrderTableColumns(
        isAdmin,
        isMarketer || isBoardMember || isCustomerDevelopment,
        printingId,
        onUploadRow,
        onPrintRow,
        onUserInformationRow,
        onChangeOrderStatus,
        onViewRow,
      ),
    [
      isAdmin,
      isMarketer,
      isBoardMember,
      isCustomerDevelopment,
      printingId,
      onUploadRow,
      onPrintRow,
      onUserInformationRow,
      onChangeOrderStatus,
      onViewRow,
    ],
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              header, nav, aside, footer, 
              .MuiDrawer-root, .MuiAppBar-root, 
              [class*="MuiDrawer"], [class*="MuiAppBar"],
              .hide-on-print {
                display: none !important;
              }

              .print-source-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                /* FORCE MOBILE TO MIMIC PC WIDTH */
                width: 750px !important;
                height: 1055px !important;
                margin: 0 !important;
                padding: 0 !important;
                clip: auto !important;
                clip-path: none !important;
                overflow: visible !important;
                white-space: normal !important;
                z-index: 999999 !important;
                background: white !important;
              }

              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          `,
        }}
      />

      <div
        className="print-source-container"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          clipPath: 'inset(50%)',
          border: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          ref={printContentRef}
          style={{
            width: '750px',
            height: '1055px',
            backgroundColor: '#fff',
            overflow: 'hidden',
          }}
        >
          {printingOrder && <FactorPreview data={printingOrder} />}
        </div>
      </div>

      <Box sx={SX.tab_wrapper} className="hide-on-print">
        <OrderDocumentDialog
          open={!!documentDialogId}
          onClose={handleCloseDocumentDialog}
          showingOrder={documentOrder}
          onEdited={handleLocalDataChange}
          justForView={isMarketer || isBoardMember || isCustomerDevelopment}
        />

        <OrderUserInformationDialog
          open={userInformationDialogOpen}
          onClose={handleCloseUserInformationDialog}
          showingOrder={userInformationOrder}
        />

        <ProductDialog
          open={productModalOpen}
          onClose={handleCloseProductDialog}
          showingProduct={showingProduct}
          categories={categories}
          bucketName={bucketName.current}
          isLoading={productDialogLoading}
        />

        <Box sx={SX.header}>
          {isAdmin ? (
            <Typography sx={SX.header_value}>{t('tab_title') + ' (' + username + ')'}</Typography>
          ) : (
            <Typography sx={SX.header_value}>{t('tab_title')}</Typography>
          )}
        </Box>

        <Box sx={SX.filters_wrapper}>
          <Box sx={SX.inner_filter_box}>
            <Box sx={SX.select}>
              <Typography sx={SX.select_title}>{t('filter.type.title') || 'نوع سفارش'}</Typography>
              <Select
                size="small"
                fullWidth
                value={selectedType}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E7E6E6',
                  },
                }}
                onChange={(e) => handleTypeChange(e.target.value as number | 'ALL')}
              >
                <MenuItem value={0}>زرپلاس - آنلاین</MenuItem>
                <MenuItem value={1}>زرپلاس - حضوری</MenuItem>
                <MenuItem value={2}>زرپلاس - کارتخوان</MenuItem>
                <MenuItem value={3}>کیف پول زرپلاس - خرید طلا</MenuItem>
                <MenuItem value={4}>کیف پول زرپلاس - فروش طلا</MenuItem>
                <MenuItem value={'ALL'}>تمام موارد</MenuItem>
              </Select>
            </Box>
            <Box sx={SX.select}>
              <Typography sx={SX.select_title}>{t('filter.status.title') || 'وضعیت'}</Typography>
              <Select
                size="small"
                fullWidth
                value={selectedStatus}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E7E6E6',
                  },
                }}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus | 'ALL')}
              >
                <MenuItem value={'در انتظار'}>در انتظار</MenuItem>
                <MenuItem value={'در حال آماده سازی'}>در حال آماده سازی</MenuItem>
                <MenuItem value={'ارسال شده'}>ارسال شده</MenuItem>
                <MenuItem value={'لغو شده'}>لغو شده</MenuItem>
                <MenuItem value={'تکمیل شده'}>تکمیل شده</MenuItem>
                <MenuItem value={'مرجوعی'}>مرجوعی</MenuItem>
                <MenuItem value={'در انتظار تایید ادمین'}>در انتظار تایید ادمین</MenuItem>
                <MenuItem value={'ALL'}>تمام موارد</MenuItem>
              </Select>
            </Box>
          </Box>
          <Box sx={SX.inner_filter_box} display="flex">
            <Box sx={{ flex: 1 }}>
              <DatePicker
                value={customDFromDate}
                setValue={setCustomDFromDate}
                title={'از تاریخ'}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                value={customDToDate}
                setValue={setCustomDToDate}
                title={'تا تاریخ (اختیاری)'}
              />
            </Box>
          </Box>
        </Box>

        <OrdersTable
          data={data}
          loading={loading}
          columns={columns}
          page={page}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </>
  );
};

export default OrderTab;