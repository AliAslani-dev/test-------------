'use client';

import React, {
  Fragment,
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled, useTheme } from '@mui/material/styles';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import useText from '@/hooks/useText';
import { MAIN_COLOR } from '@/constants';
import { useLang } from '@/hooks/LanContext';

type Order = 'asc' | 'desc';

const RADIUS = 10;
const SCROLL_EDGE_TOLERANCE = 2;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: MAIN_COLOR,
    color: theme.palette.common.white,
    fontWeight: 600,

    '&:first-of-type': {
      borderStartStartRadius: RADIUS,
      backgroundClip: 'padding-box',
    },

    '&:last-of-type': {
      borderStartEndRadius: RADIUS,
      backgroundClip: 'padding-box',
    },
  },

  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },

  '& td, & th': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export type Column<T> = {
  id: keyof T;

  label: {
    en: string;
    fa: string;
  };

  align?: 'left' | 'right' | 'center' | 'inherit' | 'justify';

  render?: (value: T[keyof T], row: T) => React.ReactNode;

  sortable?: boolean;
  minWidth?: number;
  width?: number | string;
};

export type DataTableProps<T extends Record<string, any>> = {
  columns: Column<T>[];
  rows: T[];

  getRowId?: (row: T, index: number) => string | number;

  initialOrderBy?: keyof T;
  initialOrder?: Order;

  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;

  minWidth?: number;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';

  onRowClick?: (row: T) => void;

  emptyMessage?: string;
  ariaLabel?: string;
  direction?: 'rtl' | 'ltr';

  loading?: boolean;

  renderCollapsibleRow?: (row: T) => React.ReactNode;

  rowCount?: number;

  page?: number;
  rowsPerPage?: number;

  onPageChange?: (page: number) => void;

  onRowsPerPageChange?: (rowsPerPage: number) => void;

  fillAvailableViewport?: boolean;
  viewportMinHeight?: number;
  viewportBottomGap?: number;
  viewportBoundarySelector?: string;
  horizontalScrollKey?: string;
};

interface StickyViewportTableOptions {
  enabled: boolean;
  boundarySelector: string;
  bottomGap: number;
  minHeight: number;
}

interface StickyViewportTableLayout {
  stickyTop: number;
  height?: number;
}

const isElementVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);

  const rect = element.getBoundingClientRect();

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0
  );
};

const useStickyViewportTable = <T extends HTMLElement>(
  tableRef: RefObject<T | null>,
  { enabled, boundarySelector, bottomGap, minHeight }: StickyViewportTableOptions,
): StickyViewportTableLayout => {
  const [layout, setLayout] = useState<StickyViewportTableLayout>({
    stickyTop: 0,
    height: undefined,
  });

  useLayoutEffect(() => {
    if (!enabled) {
      setLayout({
        stickyTop: 0,
        height: undefined,
      });

      return;
    }

    let animationFrame = 0;

    const getBoundaryElements = () =>
      Array.from(document.querySelectorAll<HTMLElement>(boundarySelector));

    const measure = () => {
      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const tableElement = tableRef.current;

        if (!tableElement) {
          return;
        }

        const visualViewport = window.visualViewport;

        const viewportBottom = visualViewport
          ? visualViewport.offsetTop + visualViewport.height
          : window.innerHeight;

        const visibleBoundaries = getBoundaryElements().filter(isElementVisible);

        const stickyTop = visibleBoundaries.reduce((maximumBottom, element) => {
          const rect = element.getBoundingClientRect();

          return Math.max(maximumBottom, Math.ceil(rect.bottom));
        }, 0);

        const availableHeight = Math.max(
          minHeight,
          Math.floor(viewportBottom - stickyTop - bottomGap),
        );

        setLayout((previous) => {
          if (previous.stickyTop === stickyTop && previous.height === availableHeight) {
            return previous;
          }

          return {
            stickyTop,
            height: availableHeight,
          };
        });
      });
    };

    const resizeObserver = new ResizeObserver(measure);

    const tableElement = tableRef.current;

    if (tableElement) {
      resizeObserver.observe(tableElement);

      if (tableElement.parentElement) {
        resizeObserver.observe(tableElement.parentElement);
      }
    }

    getBoundaryElements().forEach((element) => {
      resizeObserver.observe(element);
    });

    window.addEventListener('scroll', measure, true);

    window.addEventListener('resize', measure);

    window.visualViewport?.addEventListener('resize', measure);

    window.visualViewport?.addEventListener('scroll', measure);

    measure();

    return () => {
      cancelAnimationFrame(animationFrame);

      resizeObserver.disconnect();

      window.removeEventListener('scroll', measure, true);

      window.removeEventListener('resize', measure);

      window.visualViewport?.removeEventListener('resize', measure);

      window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [boundarySelector, bottomGap, enabled, minHeight, tableRef]);

  return layout;
};

const getColumnCellStyle = (
  column: {
    width?: number | string;
    minWidth?: number;
  },
  hasFixedWidth: boolean,
): React.CSSProperties | undefined => {
  if (column.width !== undefined) {
    return {
      width: column.width,
      minWidth: column.width,
      maxWidth: column.width,
    };
  }

  if (hasFixedWidth && column.minWidth !== undefined) {
    return {
      width: column.minWidth,
      minWidth: column.minWidth,
      maxWidth: column.minWidth,
    };
  }

  if (column.minWidth !== undefined) {
    return {
      minWidth: column.minWidth,
    };
  }

  return undefined;
};

interface InternalRowProps<T extends Record<string, any>> {
  row: T;
  columns: Column<T>[];

  renderCell: (column: Column<T>, row: T) => React.ReactNode;

  defaultAlign: 'left' | 'right';

  onRowClick?: (row: T) => void;

  renderCollapsibleRow?: (row: T) => React.ReactNode;

  colSpan: number;
  hasFixedWidth: boolean;
}

function InternalRow<T extends Record<string, any>>({
  row,
  columns,
  renderCell,
  defaultAlign,
  onRowClick,
  renderCollapsibleRow,
  colSpan,
  hasFixedWidth,
}: InternalRowProps<T>) {
  const [open, setOpen] = useState(false);

  const collapsibleContent = renderCollapsibleRow ? renderCollapsibleRow(row) : null;

  const isCollapsible = Boolean(collapsibleContent);

  const iconAlign = defaultAlign === 'right' ? 'left' : 'right';

  return (
    <Fragment>
      <StyledTableRow
        hover
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',

          '& > *': {
            borderBottom: isCollapsible && open ? 'unset' : undefined,
          },
        }}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        <StyledTableCell
          sx={{
            width: '10px',
            padding: '0 8px',
          }}
          align={iconAlign}
        >
          {isCollapsible && (
            <IconButton
              aria-label={open ? 'collapse row' : 'expand row'}
              size="small"
              onClick={(event) => {
                event.stopPropagation();

                setOpen((previous) => !previous);
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </StyledTableCell>

        {columns.map((column) => {
          const cellStyle = getColumnCellStyle(column, hasFixedWidth);

          return (
            <StyledTableCell
              key={String(column.id)}
              align={column.align ?? defaultAlign}
              style={cellStyle}
            >
              <Box
                sx={
                  column.width !== undefined
                    ? {
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }
                    : column.minWidth !== undefined
                      ? {
                          minWidth: column.minWidth,
                          display: 'inline-block',
                        }
                      : undefined
                }
              >
                {renderCell(column, row)}
              </Box>
            </StyledTableCell>
          );
        })}
      </StyledTableRow>

      {isCollapsible && (
        <StyledTableRow>
          <StyledTableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              borderBottom: 'none',
            }}
            colSpan={colSpan}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              {collapsibleContent}
            </Collapse>
          </StyledTableCell>
        </StyledTableRow>
      )}
    </Fragment>
  );
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const firstValue = a[orderBy] as any;

  const secondValue = b[orderBy] as any;

  if (secondValue == null && firstValue != null) {
    return -1;
  }

  if (firstValue == null && secondValue != null) {
    return 1;
  }

  if (typeof firstValue === 'string' && typeof secondValue === 'string') {
    return secondValue.localeCompare(firstValue, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  if (secondValue < firstValue) {
    return -1;
  }

  if (secondValue > firstValue) {
    return 1;
  }

  return 0;
}

const getComparator = <T,>(order: Order, orderBy: keyof T): ((a: T, b: T) => number) =>
  order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
  const stabilized = array.map((element, index) => [element, index] as const);

  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    return order !== 0 ? order : a[1] - b[1];
  });

  return stabilized.map(([element]) => element);
}

const getScrollableAncestor = (element: HTMLElement | null): HTMLElement | null => {
  let current = element?.parentElement ?? null;

  while (current) {
    const style = window.getComputedStyle(current);

    const canScroll =
      /(auto|scroll|overlay)/.test(style.overflowY) && current.scrollHeight > current.clientHeight;

    if (canScroll) {
      return current;
    }

    current = current.parentElement;
  }

  return document.scrollingElement as HTMLElement | null;
};

const scrollAncestorBy = (sourceElement: HTMLElement, deltaY: number): void => {
  const scrollOwner = getScrollableAncestor(sourceElement);

  if (
    !scrollOwner ||
    scrollOwner === document.body ||
    scrollOwner === document.documentElement ||
    scrollOwner === document.scrollingElement
  ) {
    window.scrollBy({
      top: deltaY,
      left: 0,
      behavior: 'auto',
    });

    return;
  }

  scrollOwner.scrollBy({
    top: deltaY,
    left: 0,
    behavior: 'auto',
  });
};

const normalizeWheelDelta = (event: React.WheelEvent): number => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
};

export default function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  getRowId,

  initialOrderBy,
  initialOrder = 'asc',

  rowsPerPageOptions = [5, 10, 25, 50],

  defaultRowsPerPage = 10,

  minWidth = 700,
  stickyHeader = true,
  size = 'medium',

  onRowClick,

  emptyMessage,
  ariaLabel = 'table',
  direction,

  loading = false,

  renderCollapsibleRow,

  rowCount,

  page: controlledPage,

  rowsPerPage: controlledRowsPerPage,

  onPageChange,
  onRowsPerPageChange,

  fillAvailableViewport = false,
  viewportMinHeight = 160,
  viewportBottomGap = 8,

  viewportBoundarySelector = '[data-table-top-boundary]',

  horizontalScrollKey,
}: DataTableProps<T>) {
  const { lang } = useLang();

  const { t } = useText('table', lang);

  const theme = useTheme();

  const effectiveDirection = direction ?? (theme.direction as 'rtl' | 'ltr');

  const defaultAlign: 'left' | 'right' = effectiveDirection === 'rtl' ? 'right' : 'left';

  const tableShellRef = useRef<HTMLDivElement>(null);

  const tableScrollerRef = useRef<HTMLDivElement>(null);

  const horizontalPositionRef = useRef(0);

  const touchPositionRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const { stickyTop, height: viewportTableHeight } = useStickyViewportTable(tableShellRef, {
    enabled: fillAvailableViewport,

    minHeight: viewportMinHeight,

    bottomGap: viewportBottomGap,

    boundarySelector: viewportBoundarySelector,
  });

  const horizontalStorageKey = horizontalScrollKey
    ? `data-table-horizontal-scroll:${horizontalScrollKey}`
    : undefined;

  const hasFixedWidth = useMemo(
    () => columns.some((column) => column.width !== undefined),
    [columns],
  );

  const firstSortable = useMemo<keyof T | undefined>(() => {
    const column = columns.find((item) => item.sortable !== false);

    return column?.id as keyof T | undefined;
  }, [columns]);

  const [order, setOrder] = useState<Order>(initialOrder);

  const [orderBy, setOrderBy] = useState<keyof T | undefined>(initialOrderBy ?? firstSortable);

  const isPageControlled = controlledPage !== undefined;

  const isRowsPerPageControlled = controlledRowsPerPage !== undefined;

  const [internalPage, setInternalPage] = useState(0);

  const [internalRowsPerPage, setInternalRowsPerPage] = useState(defaultRowsPerPage);

  const page = isPageControlled ? controlledPage : internalPage;

  const rowsPerPage = isRowsPerPageControlled ? controlledRowsPerPage : internalRowsPerPage;

  useEffect(() => {
    if (isPageControlled) {
      return;
    }

    if (page > 0 && page * rowsPerPage >= rows.length) {
      setInternalPage(0);
    }
  }, [rows.length, rowsPerPage, page, isPageControlled]);

  useLayoutEffect(() => {
    const scroller = tableScrollerRef.current;

    if (!scroller) {
      return;
    }

    let position = horizontalPositionRef.current;

    if (horizontalStorageKey) {
      try {
        const storedValue = window.sessionStorage.getItem(horizontalStorageKey);

        const storedPosition = storedValue === null ? Number.NaN : Number(storedValue);

        if (Number.isFinite(storedPosition)) {
          position = storedPosition;
        }
      } catch {}
    }

    horizontalPositionRef.current = position;

    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        const currentScroller = tableScrollerRef.current;

        if (currentScroller) {
          currentScroller.scrollLeft = position;
        }
      });

      return () => cancelAnimationFrame(secondFrame);
    });

    return () => {
      cancelAnimationFrame(firstFrame);
    };
  }, [horizontalStorageKey]);

  const handleRequestSort = (property: keyof T) => {
    if (orderBy === property) {
      setOrder((previous) => (previous === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrder('asc');
      setOrderBy(property);
    }

    if (isPageControlled) {
      onPageChange?.(0);
    } else {
      setInternalPage(0);
    }
  };

  const sortedRows = useMemo(() => {
    if (!orderBy) {
      return rows;
    }

    return stableSort(rows, getComparator(order, orderBy));
  }, [rows, order, orderBy]);

  const visibleRows = useMemo(() => {
    if (rowCount !== undefined) {
      return rows;
    }

    const start = page * rowsPerPage;

    return sortedRows.slice(start, start + rowsPerPage);
  }, [rows, sortedRows, page, rowsPerPage, rowCount]);

  const renderCell = (column: Column<T>, row: T): React.ReactNode =>
    column.render ? column.render(row[column.id], row) : (row[column.id] as React.ReactNode);

  const iconHeaderAlign = defaultAlign === 'right' ? 'left' : 'right';

  const tableColSpan = columns.length + 1;

  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const nextHorizontalPosition = event.currentTarget.scrollLeft;

    if (nextHorizontalPosition === horizontalPositionRef.current) {
      return;
    }

    horizontalPositionRef.current = nextHorizontalPosition;

    if (horizontalStorageKey) {
      try {
        window.sessionStorage.setItem(horizontalStorageKey, String(nextHorizontalPosition));
      } catch {}
    }
  };

  const shouldDelegateVerticalScroll = (deltaY: number): boolean => {
    if (!fillAvailableViewport || deltaY === 0) {
      return false;
    }

    const scroller = tableScrollerRef.current;

    const shell = tableShellRef.current;

    if (!scroller || !shell) {
      return false;
    }

    const scrollingUp = deltaY < 0;

    const scrollingDown = deltaY > 0;

    const atTop = scroller.scrollTop <= SCROLL_EDGE_TOLERANCE;

    const atBottom =
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - SCROLL_EDGE_TOLERANCE;

    if (scrollingUp) {
      return atTop;
    }

    if (scrollingDown && atBottom) {
      return true;
    }

    const shellTop = shell.getBoundingClientRect().top;

    const isCurrentlyPinned = shellTop <= stickyTop + SCROLL_EDGE_TOLERANCE;

    if (scrollingDown && !isCurrentlyPinned && atTop) {
      return true;
    }

    return false;
  };

  const handleWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey) {
      return;
    }

    if (event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
      return;
    }

    const normalizedDeltaY = normalizeWheelDelta(event);

    if (!shouldDelegateVerticalScroll(normalizedDeltaY)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    scrollAncestorBy(event.currentTarget, normalizedDeltaY);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];

    if (!touch) {
      touchPositionRef.current = null;

      return;
    }

    touchPositionRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const previous = touchPositionRef.current;

    const touch = event.touches[0];

    if (!previous || !touch) {
      return;
    }

    const deltaX = previous.x - touch.clientX;

    const deltaY = previous.y - touch.clientY;

    touchPositionRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      return;
    }

    if (!shouldDelegateVerticalScroll(deltaY)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    scrollAncestorBy(event.currentTarget, deltaY);
  };

  const resetTouchPosition = () => {
    touchPositionRef.current = null;
  };

  return (
    <Paper
      ref={tableShellRef}
      elevation={0}
      dir={effectiveDirection}
      sx={{
        direction: effectiveDirection,

        width: '100%',
        minWidth: 0,

        display: 'flex',
        flexDirection: 'column',

        border: '1px solid',

        borderColor: theme.palette.grey[300],

        borderRadius: `${RADIUS}px`,

        bgcolor: 'background.paper',

        overflow: 'hidden',

        ...(fillAvailableViewport && viewportTableHeight !== undefined
          ? {
              position: 'sticky',

              top: `${stickyTop}px`,

              height: `${viewportTableHeight}px`,

              minHeight: `${viewportTableHeight}px`,

              maxHeight: `${viewportTableHeight}px`,

              zIndex: Math.max(theme.zIndex.appBar - 1, 1),
            }
          : null),
      }}
    >
      <TableContainer
        ref={tableScrollerRef}
        onScroll={handleTableScroll}
        onWheelCapture={handleWheelCapture}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetTouchPosition}
        onTouchCancel={resetTouchPosition}
        sx={{
          width: '100%',
          minWidth: 0,
          minHeight: 0,

          flex: fillAvailableViewport ? '1 1 auto' : undefined,

          overflowX: 'auto',

          overflowY: 'auto',

          WebkitOverflowScrolling: 'touch',

          scrollbarGutter: 'stable',

          overscrollBehaviorX: 'contain',

          overscrollBehaviorY: 'contain',
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          sx={{
            minWidth,

            tableLayout: hasFixedWidth ? 'fixed' : 'auto',
          }}
          size={size}
          aria-label={ariaLabel}
        >
          <TableHead>
            <TableRow>
              <StyledTableCell
                sx={{
                  width: '10px',
                  padding: '0 8px',
                }}
                align={iconHeaderAlign}
              />

              {columns.map((column) => {
                const isSortable = column.sortable !== false;

                const active = isSortable && orderBy === column.id;

                const align = column.align ?? defaultAlign;

                const cellStyle = getColumnCellStyle(column, hasFixedWidth);

                const currentLanguage = String(lang).toLowerCase();

                const label = currentLanguage === 'en' ? column.label.en : column.label.fa;

                return (
                  <StyledTableCell
                    key={String(column.id)}
                    align={align}
                    style={cellStyle}
                    sortDirection={active ? order : false}
                    sx={{
                      '& .MuiTableSortLabel-root': {
                        color: 'inherit',
                      },

                      '& .MuiTableSortLabel-root:hover': {
                        color: 'inherit',
                      },

                      '& .MuiTableSortLabel-icon': {
                        color: 'inherit !important',
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',

                        width: '100%',

                        justifyContent:
                          column.align ?? (defaultAlign === 'right' ? 'flex-end' : 'flex-start'),

                        alignItems: 'center',

                        color: 'inherit',

                        minWidth: 0,

                        ...(column.width !== undefined
                          ? {
                              overflow: 'hidden',

                              textOverflow: 'ellipsis',

                              whiteSpace: 'nowrap',
                            }
                          : column.minWidth !== undefined
                            ? {
                                minWidth: column.minWidth,
                              }
                            : null),
                      }}
                    >
                      {isSortable ? (
                        <TableSortLabel
                          active={active}
                          direction={active ? order : 'asc'}
                          onClick={() => handleRequestSort(column.id as keyof T)}
                        >
                          {label}
                        </TableSortLabel>
                      ) : (
                        label
                      )}
                    </Box>
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={tableColSpan}>
                  <Box py={6} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress aria-label="loading" />
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              <>
                {rows.length === 0 && (
                  <StyledTableRow>
                    <StyledTableCell colSpan={tableColSpan}>
                      <Box py={3} display="flex" justifyContent="center">
                        <Typography variant="body2" color="text.secondary">
                          {emptyMessage}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                )}

                {visibleRows.map((row, index) => {
                  const key = getRowId ? getRowId(row, index) : index;

                  return (
                    <InternalRow
                      key={key}
                      row={row}
                      columns={columns}
                      renderCell={renderCell}
                      defaultAlign={defaultAlign}
                      onRowClick={onRowClick}
                      renderCollapsibleRow={renderCollapsibleRow}
                      colSpan={tableColSpan}
                      hasFixedWidth={hasFixedWidth}
                    />
                  );
                })}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        dir="ltr"
        count={rowCount !== undefined ? rowCount : rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={(_event, newPage) => {
          if (isPageControlled) {
            onPageChange?.(newPage);
          } else {
            setInternalPage(newPage);
          }
        }}
        onRowsPerPageChange={(event) => {
          const newRowsPerPage = Number.parseInt(event.target.value, 10);

          if (isRowsPerPageControlled) {
            onRowsPerPageChange?.(newRowsPerPage);
          } else {
            setInternalRowsPerPage(newRowsPerPage);
          }

          if (isPageControlled) {
            onPageChange?.(0);
          } else {
            setInternalPage(0);
          }
        }}
        labelRowsPerPage={t('rows_per_page')}
        sx={{
          flexShrink: 0,

          borderTop: '1px solid',

          borderColor: 'divider',

          bgcolor: 'background.paper',

          overflowX: 'auto',
        }}
      />
    </Paper>
  );
}
