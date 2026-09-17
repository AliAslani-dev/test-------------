'use client';

import { tPD } from '@/utils';
import { getTwoFStatus } from '@/utils/auth';
import useText from '@/hooks/useText';
import { TwoFStatusDTO } from '@/api/auth/dto';
import { FrameDTO } from '@/api/zarhub/dto';
import { ProductCategoryDTO, ProductGenderCategoryDTO } from '@/api/product/dto';
import {
  getWholesalerFrameProducts,
  getZarhubCategories,
  getZarhubGenderCategories,
} from '@/api/zarhub/service';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunctionComponent, useCallback, useEffect, useMemo, useState, useRef } from 'react';

import {
  Box,
  Typography,
  Stack,
  Chip,
  useTheme,
  Pagination,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ProductDialog from './components/dialog';
import ProductGridCard from './components/ProductGridCard';
import { ProductTable } from './components/table';
import CustomTextField from '@/components/shared/custom-text-field';
import SX from '@/components/shared/common-styles/tabs';
import type { TagFrameContext } from './types';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded';
import VerticalAlignTopRoundedIcon from '@mui/icons-material/VerticalAlignTopRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

const FrameSkeleton = () => (
  <Box
    sx={{
      display: 'grid',

      gridTemplateColumns: {
        xs: '1fr',
        md: '1fr 280px',
        lg: '1fr 380px',
      },

      gap: {
        xs: 3,
        md: 3,
        lg: 4,
      },
    }}
  >
    <Box>
      <Box
        sx={{
          height: 300,

          bgcolor: 'rgba(0,0,0,0.04)',

          borderRadius: 4,

          mb: 4,
        }}
      />

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',

            sm: 'repeat(3, 1fr)',

            xl: 'repeat(5, 1fr)',
          },

          gap: 2,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            sx={{
              height: 280,

              bgcolor: 'rgba(0,0,0,0.04)',

              borderRadius: 4,
            }}
          />
        ))}
      </Box>
    </Box>

    <Box
      sx={{
        height: 480,

        bgcolor: 'rgba(0,0,0,0.04)',

        borderRadius: 4,
      }}
    />
  </Box>
);

const DataRow = ({ icon, label, value, isHighlight }: any) => (
  <Box
    sx={{
      display: 'flex',

      justifyContent: 'space-between',

      alignItems: 'center',

      py: 1.5,
    }}
  >
    <Box
      sx={{
        display: 'flex',

        alignItems: 'center',

        gap: 1,

        color: 'text.secondary',
      }}
    >
      <Box
        sx={{
          color: '#9C7A2B',

          display: 'flex',
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: '0.85rem',

          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
    </Box>

    <Typography
      sx={{
        fontWeight: 800,

        fontSize: '0.95rem',

        color: isHighlight ? '#d32f2f' : '#1a1a1a',
      }}
    >
      {value}
    </Typography>
  </Box>
);

function StickyFrameCard({ frame }: { frame: any }) {
  if (!frame) return null;

  const images = frame.covers?.length > 0 ? frame.covers : ['/images/BlurFrame.jpg'];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,

        border: '1px solid #eaeaea',

        bgcolor: 'white',

        overflow: 'hidden',

        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          position: 'relative',

          width: '100%',

          pt: '100%',

          bgcolor: 'white',

          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Box
          sx={{
            position: 'absolute',

            top: 0,
            left: 0,
            right: 0,
            bottom: 0,

            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',

              width: '100%',
              height: '100%',

              borderRadius: 4,

              overflow: 'hidden',

              bgcolor: '#f8f8f8',

              border: '1px solid rgba(0,0,0,0.03)',

              '& .swiper': {
                width: '100%',

                height: '100%',
              },

              '& .swiper-pagination-bullet-active': {
                backgroundColor: '#9C7A2B',

                opacity: 1,

                width: '20px',

                borderRadius: '4px',
              },
            }}
          >
            <Swiper
              modules={[SwiperPagination, Navigation]}
              pagination={{
                clickable: true,
              }}
              navigation={{
                nextEl: '.swiper-custom-next',

                prevEl: '.swiper-custom-prev',
              }}
              loop={images.length > 1}
            >
              {images.map((src: string, idx: number) => (
                <SwiperSlide
                  key={idx}
                  style={{
                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',

                      width: '100%',

                      height: '100%',
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Frame Image ${idx + 1}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 380px"
                      style={{
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>

            {images.length > 1 ? (
              <>
                <Box
                  className="swiper-custom-prev"
                  sx={{
                    position: 'absolute',

                    top: '50%',

                    right: 8,

                    transform: 'translateY(-50%)',

                    zIndex: 10,

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    width: 32,

                    height: 32,

                    borderRadius: '50%',

                    bgcolor: 'rgba(255, 255, 255, 0.9)',

                    backdropFilter: 'blur(8px)',

                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',

                    cursor: 'pointer',

                    color: '#444',
                  }}
                >
                  <ChevronRightRoundedIcon fontSize="small" />
                </Box>

                <Box
                  className="swiper-custom-next"
                  sx={{
                    position: 'absolute',

                    top: '50%',

                    left: 8,

                    transform: 'translateY(-50%)',

                    zIndex: 10,

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    width: 32,

                    height: 32,

                    borderRadius: '50%',

                    bgcolor: 'rgba(255, 255, 255, 0.9)',

                    backdropFilter: 'blur(8px)',

                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',

                    cursor: 'pointer',

                    color: '#444',
                  }}
                >
                  <ChevronLeftRoundedIcon fontSize="small" />
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2.5,

          bgcolor: '#fafafa',
        }}
      >
        <DataRow
          icon={<PercentRoundedIcon fontSize="small" />}
          label="اجرت"
          value={
            frame.wage && frame.profit
              ? `${tPD(Number((Number(frame.wage) + Number(frame.profit)).toFixed(3)))} %`
              : '—'
          }
        />

        <Divider
          sx={{
            opacity: 0.6,
          }}
        />

        <DataRow
          icon={<LocalOfferOutlinedIcon fontSize="small" />}
          label="تخفیف"
          value={frame.discount && frame.discount !== '0' ? `${tPD(frame.discount)} %` : '—'}
          isHighlight={!!(frame.discount && frame.discount !== '0')}
        />

        <Divider
          sx={{
            opacity: 0.6,
          }}
        />

        <DataRow
          icon={<VerticalAlignBottomRoundedIcon fontSize="small" />}
          label="حداقل وزن"
          value={frame.minWeight ? `${tPD(frame.minWeight)} گرم` : '—'}
        />

        <Divider
          sx={{
            opacity: 0.6,
          }}
        />

        <DataRow
          icon={<VerticalAlignTopRoundedIcon fontSize="small" />}
          label="حداکثر وزن"
          value={frame.maxWeight ? `${tPD(frame.maxWeight)} گرم` : '—'}
        />

        <Divider
          sx={{
            opacity: 0.6,
          }}
        />

        <DataRow
          icon={<ScaleRoundedIcon fontSize="small" />}
          label="وزن کل"
          value={frame.totalWeight ? `${tPD(frame.totalWeight)} گرم` : '—'}
        />
      </Box>
    </Paper>
  );
}

const DEFAULT_ROWS_PER_PAGE = 25;

const DEBOUNCE_DELAY = 800;

interface FrameTabProps {
  wholesalerId: number | null;

  frameId: number | null;

  tagContext?: TagFrameContext | null;
}

const FrameTab: FunctionComponent<FrameTabProps> = ({
  frameId,
  wholesalerId,
  tagContext = null,
}) => {
  const twof = getTwoFStatus<TwoFStatusDTO>();

  const theme = useTheme();

  const { t } = useText('frame');

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

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

  const [frameData, setFrameData] = useState<FrameDTO | null>(null);

  const [data, setData] = useState<ProductTable[]>([]);

  const [totalRows, setTotalRows] = useState(0);

  const [loading, setLoading] = useState(true);

  const [localCart, setLocalCart] = useState<any[]>([]);

  const isTagFrame = tagContext !== null;

  const orderBucketId = isTagFrame ? tagContext.bucketId : frameData?.bucketId || 0;

  const orderBucketName = isTagFrame ? 'کالکشن‌های زرهاب' : frameData?.bucketName || '';

  const orderSellerId = isTagFrame ? tagContext.sellerId : wholesalerId;

  useEffect(() => {
    const syncBasket = () => {
      try {
        const stored = localStorage.getItem('zarhub_basket');

        setLocalCart(stored ? JSON.parse(stored) : []);
      } catch {
        setLocalCart([]);
      }
    };

    syncBasket();

    window.addEventListener('storage', syncBasket);

    window.addEventListener('basket-updated', syncBasket);

    return () => {
      window.removeEventListener('storage', syncBasket);

      window.removeEventListener('basket-updated', syncBasket);
    };
  }, []);

  const saveToBasket = (newItems: any[]) => {
    try {
      const stored = localStorage.getItem('zarhub_basket');

      const currentCart = stored ? JSON.parse(stored) : [];

      const updatedCart = [...currentCart, ...newItems];

      localStorage.setItem('zarhub_basket', JSON.stringify(updatedCart));

      setLocalCart(updatedCart);

      window.dispatchEvent(new Event('basket-updated'));
    } catch (e) {
      console.error('Error saving to basket', e);
    }
  };

  const belongsToCurrentSource = useCallback(
    (item: any) => {
      if (isTagFrame) {
        return item.source_type === 'tag' && Number(item.tag_id) === Number(tagContext.tagId);
      }

      /**
       * Old entries without source_type
       * remain normal wholesaler entries.
       */
      return item.source_type !== 'tag';
    },
    [isTagFrame, tagContext?.tagId],
  );

  const currentFrameCart = useMemo(() => {
    if (!frameId) {
      return [];
    }

    return localCart.filter((item) => {
      if (!belongsToCurrentSource(item)) {
        return false;
      }

      if (item.frame_id) {
        return Number(item.frame_id) === Number(frameId);
      }

      return item.frame_model === frameData?.model;
    });
  }, [localCart, frameId, frameData?.model, belongsToCurrentSource]);

  const hasFrameInCart = currentFrameCart.some((item) => !item.product_id && !item.variant_id);

  const hasProductInCart = currentFrameCart.some((item) => item.product_id || item.variant_id);

  const handleClearCurrentFrameBasket = () => {
    try {
      const stored = localStorage.getItem('zarhub_basket');

      const currentCart = stored ? JSON.parse(stored) : [];

      const remainingGlobalItems = currentCart.filter((item: any) => {
        if (!belongsToCurrentSource(item)) {
          return true;
        }

        if (item.frame_id) {
          return Number(item.frame_id) !== Number(frameId);
        }

        return item.frame_model !== frameData?.model;
      });

      if (remainingGlobalItems.length === 0) {
        localStorage.removeItem('zarhub_basket');
      } else {
        localStorage.setItem(
          'zarhub_basket',

          JSON.stringify(remainingGlobalItems),
        );
      }

      setLocalCart(remainingGlobalItems);

      window.dispatchEvent(new Event('basket-updated'));
    } catch (e) {
      console.error('Error clearing frame basket', e);
    }
  };

  const [frameWeight, setFrameWeight] = useState('');

  const [frameDesc, setFrameDesc] = useState('');

  const [categoriesList, setCategoriesList] = useState<ProductCategoryDTO[]>([]);

  const [genderCategoriesList, setGenderCategoriesList] = useState<ProductGenderCategoryDTO[]>([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [showingProduct, setShowingProduct] = useState<ProductTable | undefined>(undefined);

  const gridRef = useRef<HTMLDivElement>(null);

  const [bannerStyles, setBannerStyles] = useState({
    left: '0px',
    right: '0px',
  });

  useEffect(() => {
    const updateBannerRect = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();

        const rightOffset = document.documentElement.clientWidth - rect.right;

        setBannerStyles({
          left: `${rect.left}px`,

          right: `${rightOffset}px`,
        });
      }
    };

    updateBannerRect();

    const timer = setTimeout(updateBannerRect, 100);

    const observer = new ResizeObserver(updateBannerRect);

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    window.addEventListener('resize', updateBannerRect);

    return () => {
      clearTimeout(timer);

      observer.disconnect();

      window.removeEventListener('resize', updateBannerRect);
    };
  }, [currentFrameCart.length, loading]);

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

      if (p > 0) {
        params.set('page', String(p));
      }

      if (r !== DEFAULT_ROWS_PER_PAGE) {
        params.set('rows', String(r));
      }

      if (f) {
        params.set('filter', f);
      }

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [page, rowsPerPage, debouncedFilter, pathname, router],
  );

  useEffect(() => {
    updateUrl({
      filter: debouncedFilter,
    });
  }, [debouncedFilter, updateUrl]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [categoriesRes, genderCategoriesRes] = await Promise.all([
          getZarhubCategories(),

          getZarhubGenderCategories(),
        ]);

        if (!mounted) {
          return;
        }

        setCategoriesList(Array.isArray(categoriesRes) ? categoriesRes : []);

        setGenderCategoriesList(Array.isArray(genderCategoriesRes) ? genderCategoriesRes : []);
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryIdToFaName = useMemo(() => {
    const obj: Record<number, string> = {};

    for (const c of categoriesList) {
      obj[c.id] = c.faName;
    }

    return obj;
  }, [categoriesList]);

  const genderIdToFaName = useMemo(() => {
    const obj: Record<number, string> = {};

    for (const g of genderCategoriesList) {
      obj[g.id] = g.faName;
    }

    return obj;
  }, [genderCategoriesList]);

  const resolvedCategoryFaName = useMemo(() => {
    const id = frameData?.category;

    if (id == null) {
      return null;
    }

    return categoryIdToFaName[id] ?? null;
  }, [frameData?.category, categoryIdToFaName]);

  const resolvedGenderFaName = useMemo(() => {
    const id = frameData?.genderCategory;

    if (id == null) {
      return null;
    }

    return genderIdToFaName[id] ?? null;
  }, [frameData?.genderCategory, genderIdToFaName]);

  const fetchData = useCallback(async () => {
    if (!wholesalerId || !frameId || !twof?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const apiParams = {
        page: page + 1,
        per_page: rowsPerPage,
        filter: debouncedFilter || undefined,
      };

      const productResponse = await getWholesalerFrameProducts(
        wholesalerId,

        twof.id,

        frameId,

        apiParams,
      );

      setTotalRows(productResponse?.meta?.total ?? 0);

      setFrameData(productResponse?.frame ?? null);

      const productsData = productResponse?.products ?? [];

      const rows: ProductTable[] = productsData.map((row: any, index: number) => ({
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
  }, [twof?.id, wholesalerId, frameId, page, rowsPerPage, debouncedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    updateUrl({
      page: newPage,
    });
  };

  const onViewRow = useCallback((row: ProductTable) => {
    setShowingProduct(row);

    setModalOpen(true);
  }, []);

  const handleCloseDialog = () => {
    setModalOpen(false);

    setShowingProduct(undefined);
  };

  const isFrameWeightValid = frameWeight !== '' && Number(frameWeight) > 0;

  const handleAddFrameToCart = () => {
    if (!wholesalerId || !orderSellerId) {
      return;
    }

    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      wholesaler_id: wholesalerId,
      order_seller_id: isTagFrame ? orderSellerId : undefined,
      bucket_id: orderBucketId,
      bucket_name: orderBucketName,
      source_type: isTagFrame ? 'tag' : 'wholesaler',
      tag_id: isTagFrame ? tagContext.tagId : undefined,
      frame_id: frameId,
      frame_model: frameData?.model || '',
      image_url: frameData?.covers?.[0] || '',
      carat: frameData?.carat || '750',
      weight: Number(frameWeight),
      description: frameDesc,
    };
    saveToBasket([newItem]);
    setFrameWeight('');
    setFrameDesc('');
  };

  const handleAddProductOrdersToCart = (payload: any[]) => {
    const enrichedPayload = payload.map((item) => ({
      ...item,

      wholesaler_id: wholesalerId,

      order_seller_id: isTagFrame ? orderSellerId : undefined,

      bucket_id: orderBucketId,

      bucket_name: orderBucketName,

      source_type: isTagFrame ? 'tag' : 'wholesaler',

      tag_id: isTagFrame ? tagContext.tagId : undefined,

      frame_id: frameId,
    }));

    saveToBasket(enrichedPayload);
  };

  if (frameId === null || wholesalerId === null || !twof?.id) {
    return null;
  }

  return (
    <Box
      sx={{
        ...SX.tab_wrapper,

        position: 'relative',

        width: '100%',

        overflow: 'visible !important',

        pb:
          currentFrameCart.length > 0
            ? {
                xs: 12,
                md: 10,
              }
            : 4,
      }}
    >
      <ProductDialog
        open={modalOpen}
        onClose={handleCloseDialog}
        showingProduct={showingProduct}
        hasFrameOrderLocked={hasFrameInCart}
        onAddToCart={handleAddProductOrdersToCart}
        wholesalerId={wholesalerId}
        orderSellerId={orderSellerId}
        bucketId={orderBucketId}
        bucketName={orderBucketName}
        frameModel={frameData?.model || ''}
        frameImageUrl={frameData?.covers?.[0] || ''}
        frameCarat={frameData?.carat || '750'}
        sourceType={isTagFrame ? 'tag' : 'wholesaler'}
        tagId={isTagFrame ? tagContext.tagId : null}
      />

      {loading && !frameData ? <FrameSkeleton /> : null}

      {!loading && frameData ? (
        <>
          <Box
            ref={gridRef}
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                md: 'minmax(0, 1fr) 280px',

                lg: 'minmax(0, 1fr) 380px',
              },

              gap: {
                xs: 3,
                md: 3,
                lg: 4,
              },

              alignItems: 'flex-start',
            }}
          >
            <Box
              sx={{
                display: 'flex',

                flexDirection: 'column',

                gap: 4,

                minWidth: 0,

                minHeight: '100vh',
              }}
            >
              <Box
                sx={{
                  position: 'relative',

                  p: {
                    xs: 2.5,

                    md: 4,
                  },

                  borderRadius: 4,

                  overflow: 'hidden',

                  border: '1px solid #eaeaea',

                  bgcolor: '#fafafa',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',

                    inset: 0,

                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(156,122,43,0.04) 100%)',

                    pointerEvents: 'none',
                  }}
                />

                <Box
                  sx={{
                    position: 'relative',

                    zIndex: 1,
                  }}
                >
                  <Typography
                    sx={{
                      color: 'text.secondary',

                      fontSize: '0.95rem',

                      mb: 0.5,
                    }}
                  >
                    {orderBucketName || '...'}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: {
                        xs: '1.5rem',

                        md: '1.8rem',
                      },

                      fontWeight: 900,

                      mb: 2.5,

                      color: '#1a1a1a',
                    }}
                  >
                    {frameData?.model || '...'}
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {resolvedCategoryFaName && (
                      <Chip
                        label={resolvedCategoryFaName}
                        size="small"
                        sx={{
                          bgcolor: 'white',

                          fontWeight: 700,

                          fontSize: '0.75rem',

                          border: '1px solid #eee',
                        }}
                      />
                    )}

                    {resolvedGenderFaName && (
                      <Chip
                        label={resolvedGenderFaName}
                        size="small"
                        sx={{
                          bgcolor: 'white',

                          fontWeight: 700,

                          fontSize: '0.75rem',

                          border: '1px solid #eee',
                        }}
                      />
                    )}

                    {frameData?.carat && (
                      <Chip
                        label={`${tPD(frameData.carat)}`}
                        size="small"
                        sx={{
                          bgcolor: '#fff9e6',

                          color: '#b8860b',

                          fontWeight: 800,

                          fontSize: '0.75rem',

                          border: '1px solid rgba(184, 134, 11, 0.2)',
                        }}
                      />
                    )}
                  </Stack>

                  <Box
                    sx={{
                      mt: 3,

                      pt: 3,

                      borderTop: '1px dashed rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,

                        mb: 1,

                        color: '#9C7A2B',

                        fontSize: '1.1rem',
                      }}
                    >
                      سفارش قاب پایه
                    </Typography>

                    {hasProductInCart && (
                      <Typography
                        sx={{
                          fontSize: '0.85rem',

                          color: '#d32f2f',

                          mb: 2,

                          fontWeight: 600,
                        }}
                      >
                        شما محصولاتی از این قاب را به سبد اضافه کرده‌اید. امکان سفارش مستقیم قاب
                        پایه وجود ندارد؛ برای اینکار سفارش‌ها را حذف کنید.
                      </Typography>
                    )}

                    <Box
                      sx={{
                        opacity: hasProductInCart ? 0.4 : 1,

                        pointerEvents: hasProductInCart ? 'none' : 'auto',

                        display: 'grid',

                        gridTemplateColumns: {
                          xs: '1fr',

                          sm: '1fr auto',
                        },

                        gridTemplateAreas: {
                          xs: `"weight" "desc" "button"`,

                          sm: `"weight button" "desc desc"`,
                        },

                        gap: {
                          xs: 2,

                          sm: 2.5,
                        },

                        alignItems: 'end',
                      }}
                    >
                      <Box
                        sx={{
                          gridArea: 'weight',

                          maxWidth: {
                            sm: '200px',
                          },
                        }}
                      >
                        <CustomTextField
                          id="frame-weight"
                          title="وزن درخواستی (گرم)"
                          value={frameWeight}
                          setValue={setFrameWeight}
                          numeric="decimal"
                          disabled={hasProductInCart}
                        />
                      </Box>

                      <Box
                        sx={{
                          gridArea: 'desc',
                        }}
                      >
                        <CustomTextField
                          id="frame-desc"
                          title="توضیحات (اختیاری)"
                          value={frameDesc}
                          rows={2}
                          setValue={setFrameDesc}
                          disabled={hasProductInCart}
                        />
                      </Box>

                      <Button
                        variant="contained"
                        disabled={!isFrameWeightValid || hasProductInCart}
                        onClick={handleAddFrameToCart}
                        sx={{
                          gridArea: 'button',

                          minWidth: {
                            xs: '100%',

                            sm: '140px',
                          },

                          borderRadius: 2,

                          bgcolor: '#9C7A2B',

                          fontWeight: 700,

                          '&:hover': {
                            bgcolor: '#7A5C1F',
                          },
                        }}
                      >
                        افزودن به سبد
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {data.length > 0 ? (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,

                      fontSize: '1.2rem',

                      mb: 3,
                    }}
                  >
                    سفارش از لیست کالاها و تنوع‌های قاب
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',

                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',

                        sm: 'repeat(3, 1fr)',

                        md: 'repeat(3, 1fr)',

                        lg: 'repeat(3, 1fr)',

                        xl: 'repeat(5, 1fr)',
                      },

                      gap: {
                        xs: 1.5,

                        md: 2.5,
                      },
                    }}
                  >
                    {data.map((product) => (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        onClick={() => onViewRow(product)}
                      />
                    ))}
                  </Box>

                  {totalRows > rowsPerPage ? (
                    <Box
                      sx={{
                        display: 'flex',

                        justifyContent: 'center',

                        mt: 4,
                      }}
                    >
                      <Pagination
                        count={Math.ceil(totalRows / rowsPerPage)}
                        page={page + 1}
                        onChange={(_, p) => handlePageChange(p - 1)}
                        color="primary"
                        dir={theme.direction}
                      />
                    </Box>
                  ) : null}
                </Box>
              ) : null}

              {data.length === 0 && !loading ? (
                <Box
                  sx={{
                    p: 4,

                    textAlign: 'center',

                    bgcolor: 'rgba(0,0,0,0.02)',

                    borderRadius: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    لیست کالاها برای این قاب ثبت نشده است.
                  </Typography>
                </Box>
              ) : null}
            </Box>

            <Box
              sx={{
                order: {
                  xs: -1,

                  md: 0,
                },

                position: {
                  md: 'sticky',
                },

                top: {
                  md: '124px',
                },

                zIndex: 10,
              }}
            >
              <StickyFrameCard frame={frameData} />
            </Box>
          </Box>

          {currentFrameCart.length > 0 ? (
            <Box
              sx={{
                position: 'fixed',

                bottom: {
                  xs: 0,
                  md: 12,
                },

                width: {
                  xs: '100%',

                  md: 'auto',
                },

                left: {
                  xs: 0,

                  md: bannerStyles.left,
                },

                right: {
                  xs: 0,

                  md: `calc(${bannerStyles.right} + 27px)`,
                },

                zIndex: 1100,

                bgcolor: 'rgba(255, 255, 255, 0.95)',

                backdropFilter: 'blur(12px)',

                borderTop: {
                  xs: '1px solid rgba(0,0,0,0.08)',

                  md: 'none',
                },

                border: {
                  md: '1px solid rgba(0,0,0,0.08)',
                },

                borderRadius: {
                  xs: 0,

                  md: 4,
                },

                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',

                p: {
                  xs: 2,

                  md: 2.5,
                },

                display: 'flex',

                justifyContent: 'center',

                transition: 'left 0.1s, right 0.1s',
              }}
            >
              <Box
                sx={{
                  width: '100%',

                  display: 'flex',

                  justifyContent: 'space-between',

                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',

                    alignItems: 'center',

                    gap: 1.5,
                  }}
                >
                  <ShoppingCartOutlinedIcon
                    sx={{
                      color: '#9C7A2B',

                      display: {
                        xs: 'none',

                        sm: 'block',
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 600,

                      color: '#1a1a1a',

                      fontSize: {
                        xs: '0.85rem',

                        md: '1.1rem',
                      },
                    }}
                  >
                    شما{' '}
                    <Typography
                      component="span"
                      sx={{
                        color: '#9C7A2B',

                        fontSize: {
                          xs: '1rem',

                          md: '1.3rem',
                        },

                        fontWeight: 900,
                      }}
                    >
                      {tPD(currentFrameCart.length)}
                    </Typography>{' '}
                    آیتم از این قاب در سبد سفارش دارید.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearCurrentFrameBasket}
                  sx={{
                    borderRadius: 2,

                    fontWeight: 700,
                  }}
                >
                  حذف سفارش‌ها
                </Button>
              </Box>
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
};

export default FrameTab;
