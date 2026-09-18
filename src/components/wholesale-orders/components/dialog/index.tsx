'use client';

import { tPD } from '@/utils';
import theme from '@/styles/Theme';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import useText from '@/hooks/useText';
import Slide from '@mui/material/Slide';
import { FunctionComponent } from 'react';
import { WholesaleOrderTable } from '../table';
import SortIcon from '@mui/icons-material/Sort';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DialogSX from '@/components/shared/dialog/styles';
import React, { useMemo, useState, useEffect } from 'react';
import { PurchaseSettlementTypeSelect, SendTypeSelect } from '../select';
import { PurchaseSettlementTypeDTO, SendTypeDTO } from '@/api/zarhub/dto';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CustomTextField from '@/components/shared/custom-text-field';
import { useNotification } from '@/hooks/useNotification';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Chip,
  alpha,
} from '@mui/material';
import {
  approveOrder,
  rejectOrder,
  receiveOrder,
  getPurchaseSettlementTypes,
  getSendTypes,
} from '@/api/zarhub/service';
import { getAccounting } from '@/api/order/service';
interface WholesaleOrderDialogProps {
  open: boolean;
  onClose: () => void;
  showingWholesaleOrder: WholesaleOrderTable | undefined;
  setShowingWholesaleOrder?: React.Dispatch<React.SetStateAction<WholesaleOrderTable | undefined>>;
  onRefreshList?: () => void;
  onCloneClick?: () => void;
}

type DisplayItem = {
  uid: string;
  frame: any | null;
  product: any | null;
  variant: any | null;

  galleryWeight: number | string;
  galleryQuantity: number | string;

  finalWeight: number | string;
  finalQuantity: number | string;

  galleryDescription: string;
  wholesalerDescription: string;
};

// Helper for status chip rendering
const getStatusDetails = (statusValue: number) => {
  let label = 'نامشخص';
  let colorKey: 'success' | 'error' | 'info' | 'warning' | 'grey' = 'grey';

  if (statusValue === 6) {
    label = 'نهایی شده';
    colorKey = 'success';
  } else if (statusValue === 5) {
    label = 'دریافت شده';
    colorKey = 'success';
  } else if (statusValue === 4) {
    label = 'ارسال شده';
    colorKey = 'info';
  } else if (statusValue === 3) {
    label = 'در انتظار ارسال';
    colorKey = 'success';
  } else if (statusValue === 2) {
    label = 'تایید شده توسط بنکدار';
    colorKey = 'success';
  } else if (statusValue === 1) {
    label = 'در حال بررسی';
    colorKey = 'info';
  } else if (statusValue === 0) {
    label = 'ثبت شده';
    colorKey = 'warning';
  } else if (statusValue === -1) {
    label = 'رد شده توسط بنکدار';
    colorKey = 'error';
  } else if (statusValue === -2) {
    label = 'رد شده توسط گالری';
    colorKey = 'error';
  }

  return { label, colorKey };
};

const WholesaleOrderDialog: FunctionComponent<WholesaleOrderDialogProps> = ({
  open,
  onClose,
  showingWholesaleOrder,
  setShowingWholesaleOrder,
  onRefreshList,
  onCloneClick,
}) => {
  const { t } = useText('wholesaleOrder');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showNotification } = useNotification();

  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);

  const [settlementType, setSettlementType] = useState<PurchaseSettlementTypeDTO | null>(null);
  const [sendType, setSendType] = useState<SendTypeDTO | null>(null);

  const [accountingData, setAccountingData] = useState<any[]>([]);

  // State for dynamic additional fields
  const [sendTypeAdditionalFieldsValues, setSendTypeAdditionalFieldsValues] = useState<
    Record<string, string>
  >({});
  const [settlementTypeAdditionalFieldsValues, setSettlementTypeAdditionalFieldsValues] = useState<
    Record<string, string>
  >({});

  const [allSettlementTypes, setAllSettlementTypes] = useState<PurchaseSettlementTypeDTO[]>([]);
  const [allSendTypes, setAllSendTypes] = useState<SendTypeDTO[]>([]);

  const [exporting, setExporting] = useState(false);

  const status = showingWholesaleOrder?.status ?? -1;
  const canDoAction = status === 0 || status === 2 || status === 4;

  const finalGoldCredit = (showingWholesaleOrder as any)?.finalGoldCredit;
  const finalRialCredit = (showingWholesaleOrder as any)?.finalRialCredit;
  const orderTitle = (showingWholesaleOrder as any)?.title;

  useEffect(() => {
    setSendTypeAdditionalFieldsValues({});
  }, [sendType]);

  useEffect(() => {
    setSettlementTypeAdditionalFieldsValues({});
  }, [settlementType]);

  useEffect(() => {
    if (open && status > 2) {
      getPurchaseSettlementTypes().then((res) => setAllSettlementTypes(res || []));
      getSendTypes().then((res) => setAllSendTypes(res || []));
    }

    if (open && status === 2) {
      let uId = (showingWholesaleOrder as any)?.userId || (showingWholesaleOrder as any)?.galleryId;
      if (!uId) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        if (stored) uId = Number(stored);
      }

      if (uId) {
        getAccounting(uId).then((res) => {
          if (res) setAccountingData(res);
        });
      }
    }
  }, [open, status, showingWholesaleOrder]);

  const availableAssetDebt = useMemo(() => {
    if (accountingData && accountingData.length > 0) {
      const targetAsset = accountingData[0];
      const precisionFactor = targetAsset ? Math.pow(10, targetAsset.precision) : 1;
      return String(tPD(targetAsset.availableAssetDebtAmount / precisionFactor));
    }
    return tPD(0);
  }, [accountingData]);

  useEffect(() => {
    if (showingWholesaleOrder && open) {
      const finalItemsList: any[] | null = (showingWholesaleOrder as any).finalItems || null;
      const hasFinalItems = status >= 2 && finalItemsList !== null;

      let finalItemsPool = hasFinalItems ? [...finalItemsList] : [];

      const getItemKey = (x: any) => {
        if (x.variant?.id) return `v_${x.variant.id}`;
        if (x.product?.id) return `p_${x.product.id}`;
        if (x.frame?.id) return `f_${x.frame.id}`;
        return `unknown_${Math.random()}`;
      };

      const initial: DisplayItem[] = showingWholesaleOrder.items.map((item) => {
        const gWeight = 'weight' in item ? item.weight : 0;
        const gQuantity = 'quantity' in item ? item.quantity : 0;

        let fWeight: number | string = '-';
        let fQuantity: number | string = '-';
        let wDesc = '';
        const gDesc = item.description || '';

        if (hasFinalItems) {
          const itemKey = getItemKey(item);
          const matchIndex = finalItemsPool.findIndex((f) => getItemKey(f) === itemKey);

          if (matchIndex !== -1) {
            const match = finalItemsPool[matchIndex];
            fWeight = 'weight' in match ? match.weight : 0;
            fQuantity = 'quantity' in match ? match.quantity : 0;

            const finalDesc = match.description || '';
            if (finalDesc.includes('\n---\n')) {
              wDesc = finalDesc.split('\n---\n')[1] || '';
            } else if (finalDesc !== gDesc) {
              wDesc = finalDesc;
            }

            finalItemsPool.splice(matchIndex, 1);
          } else {
            fWeight = 0;
            fQuantity = 0;
          }
        }

        return {
          uid: Math.random().toString(36).substring(7),
          frame: item.frame,
          product: 'product' in item ? item.product : null,
          variant: 'variant' in item ? item.variant : null,
          galleryWeight: gWeight,
          galleryQuantity: gQuantity,
          finalWeight: fWeight,
          finalQuantity: fQuantity,
          galleryDescription: gDesc,
          wholesalerDescription: wDesc,
        };
      });

      if (hasFinalItems && finalItemsPool.length > 0) {
        finalItemsPool.forEach((f) => {
          const finalDesc = f.description || '';
          let parsedWDesc = finalDesc;
          let gDesc = '';

          if (finalDesc.includes('\n---\n')) {
            const parts = finalDesc.split('\n---\n');
            gDesc = parts[0];
            parsedWDesc = parts[1] || '';
          }

          initial.push({
            uid: Math.random().toString(36).substring(7),
            frame: f.frame,
            product: 'product' in f ? f.product : null,
            variant: 'variant' in f ? f.variant : null,
            galleryWeight: 0,
            galleryQuantity: 0,
            finalWeight: 'weight' in f ? f.weight : 0,
            finalQuantity: 'quantity' in f ? f.quantity : 0,
            galleryDescription: gDesc,
            wholesalerDescription: parsedWDesc,
          });
        });
      }

      setDisplayItems(initial);
    } else {
      setDisplayItems([]);
    }
  }, [showingWholesaleOrder, open, status]);

  const handleClose = () => {
    setSettlementType(null);
    setSendType(null);
    setSendTypeAdditionalFieldsValues({});
    setSettlementTypeAdditionalFieldsValues({});
    onClose();
  };

  const totalInitialWeight = useMemo(() => {
    if (!showingWholesaleOrder?.items) return 0;
    return displayItems.reduce((sum, item) => {
      if (item.variant && item.galleryQuantity) {
        return (
          sum +
          ((Number(item.variant.weight || 0) * Number(item.frame.carat)) / 750) *
            Number(item.galleryQuantity)
        );
      }
      if (item.galleryWeight) {
        return sum + (Number(item.galleryWeight) * Number(item.frame.carat)) / 750;
      }
      return sum;
    }, 0);
  }, [displayItems]);

  const totalFinalWeight = useMemo(() => {
    return displayItems.reduce((sum, item) => {
      const carat = Number(item.frame?.carat || 0);

      if (item.variant && item.finalQuantity !== '-') {
        return (
          sum + ((Number(item.variant.weight || 0) * carat) / 750) * Number(item.finalQuantity)
        );
      }

      if (!item.variant && item.finalWeight !== '-') {
        return sum + (Number(item.finalWeight) * carat) / 750;
      }

      return sum;
    }, 0);
  }, [displayItems]);

  const nonZeroGalleryItemsCount = useMemo(() => {
    return displayItems.filter((item) => {
      if (item.variant) {
        return Number(item.galleryQuantity) > 0;
      }
      return Number(item.galleryWeight) > 0;
    }).length;
  }, [displayItems]);

  const nonZeroFinalItemsCount = useMemo(() => {
    return displayItems.filter((item) => {
      if (item.variant) {
        return item.finalQuantity !== '-' && Number(item.finalQuantity) > 0;
      }
      return item.finalWeight !== '-' && Number(item.finalWeight) > 0;
    }).length;
  }, [displayItems]);

  const displaySettlementName = useMemo(() => {
    if (!showingWholesaleOrder?.settlementTypeId) return '—';
    return (
      allSettlementTypes.find((t) => t.id === showingWholesaleOrder.settlementTypeId)?.name || '—'
    );
  }, [showingWholesaleOrder?.settlementTypeId, allSettlementTypes]);

  const displaySendName = useMemo(() => {
    if (!showingWholesaleOrder?.sendTypeId) return '—';
    return allSendTypes.find((t) => t.id === showingWholesaleOrder.sendTypeId)?.name || '—';
  }, [showingWholesaleOrder?.sendTypeId, allSendTypes]);

  const handleSortAndGroup = () => {
    setDisplayItems((prev) => {
      return [...prev].sort((a, b) => {
        const typeA = a.variant ? 3 : a.product ? 2 : 1;
        const typeB = b.variant ? 3 : b.product ? 2 : 1;
        if (typeA !== typeB) return typeA - typeB;

        const frameA = a.frame?.id || 0;
        const frameB = b.frame?.id || 0;
        if (frameA !== frameB) return frameA - frameB;

        const prodA = a.product?.id || 0;
        const prodB = b.product?.id || 0;
        if (prodA !== prodB) return prodA - prodB;

        const varA = a.variant?.id || 0;
        const varB = b.variant?.id || 0;
        return varA - varB;
      });
    });
  };

  const executeAction = async (actionFn: () => Promise<any>) => {
    setLoadingAction(true);
    try {
      await actionFn();
      if (onRefreshList) onRefreshList();
      handleClose();
    } catch (err: any) {
      console.error(err);

      const errorDescriptionFa = err?.response?.data?.description?.fa || err?.description?.fa;

      if (errorDescriptionFa) {
        showNotification(errorDescriptionFa, 'error');
      } else {
        showNotification('مشکلی پیش آمده است', 'error');
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const onReject = () => {
    if (!showingWholesaleOrder) return;
    executeAction(() => rejectOrder(showingWholesaleOrder.id));
  };

  const isAdditionalFieldsValid = useMemo(() => {
    let isValid = true;
    if (sendType && sendType.additionalFields) {
      isValid =
        isValid &&
        sendType.additionalFields.every((field) => {
          const val = sendTypeAdditionalFieldsValues[field.name] || '';

          const normalizedName = field.name.replace(/\u200c/g, '').replace(/\s+/g, '');
          if (normalizedName === 'کدپستی') {
            const enVal = val.replace(/[۰-۹]/g, (d: any) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
            return val.trim().length > 0 && /^\d{10}$/.test(enVal);
          }

          return val !== undefined && val.trim() !== '';
        });
    }
    if (settlementType && settlementType.additionalFields) {
      isValid =
        isValid &&
        settlementType.additionalFields.every((field) => {
          const val = settlementTypeAdditionalFieldsValues[field.name];
          return val !== undefined && val.trim() !== '';
        });
    }
    return isValid;
  }, [
    sendType,
    sendTypeAdditionalFieldsValues,
    settlementType,
    settlementTypeAdditionalFieldsValues,
  ]);

  const onApprove = () => {
    if (!showingWholesaleOrder || !settlementType || !sendType) return;

    const payloadSendFields =
      sendType.additionalFields && sendType.additionalFields.length > 0
        ? sendTypeAdditionalFieldsValues
        : undefined;

    const payloadSettlementFields =
      settlementType.additionalFields && settlementType.additionalFields.length > 0
        ? settlementTypeAdditionalFieldsValues
        : undefined;

    executeAction(() =>
      approveOrder(
        showingWholesaleOrder.id,
        settlementType.id,
        sendType.id,
        payloadSendFields,
        payloadSettlementFields,
      ),
    );
  };

  const onReceive = () => {
    if (!showingWholesaleOrder) return;
    executeAction(() => receiveOrder(showingWholesaleOrder.id));
  };

  const handleExportExcel = async () => {
    if (!showingWholesaleOrder) return;
    setExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(t('excel.sheet_name') || 'Order', {
        views: [{ rightToLeft: true }],
      });

      // --- 1. MANUALLY SET COLUMN WIDTHS ---
      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 20;
      worksheet.getColumn(5).width = 10;
      worksheet.getColumn(6).width = 8;
      worksheet.getColumn(7).width = 10;
      worksheet.getColumn(8).width = 8;
      worksheet.getColumn(9).width = 10;
      worksheet.getColumn(10).width = 8;
      worksheet.getColumn(11).width = 30;
      worksheet.getColumn(12).width = 30;

      // --- 2. ADD TOP KEY VALUES (Order, Status, Dates) ---
      const { label: statusLabel } = getStatusDetails(status);

      const titleDisplayStr = orderTitle ? ` - ${orderTitle}` : '';

      const titleRow = worksheet.addRow([
        `${t('excel.order_from')} ${showingWholesaleOrder.bucketName}${titleDisplayStr} - ${t('excel.order_number')} ${tPD(showingWholesaleOrder.id)}`,
        '',
        '',
        '',
        '',
        '',
        '',
        `${t('excel.status')} ${statusLabel}`,
        '',
        '',
        '',
        '',
      ]);

      const tRow = titleRow.number;
      worksheet.mergeCells(`A${tRow}:E${tRow}`);
      worksheet.mergeCells(`H${tRow}:L${tRow}`);

      titleRow.font = { bold: true, size: 13, color: { argb: 'FF9C7A2B' } };
      titleRow.height = 35;
      titleRow.alignment = { vertical: 'middle' };

      const formatPersianDate = (val: any) => {
        if (!val) return '—';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      };

      const createdStr = `${t('excel.created_at')} ${formatPersianDate((showingWholesaleOrder as any).createdAt)}`;
      const updatedStr = `${t('excel.updated_at')} ${formatPersianDate((showingWholesaleOrder as any).updatedAt)}`;

      const dateRow = worksheet.addRow([
        createdStr,
        '',
        '',
        '',
        '',
        '',
        '',
        updatedStr,
        '',
        '',
        '',
        '',
      ]);

      const dRow = dateRow.number;
      worksheet.mergeCells(`A${dRow}:E${dRow}`);
      worksheet.mergeCells(`H${dRow}:L${dRow}`);

      dateRow.font = { size: 11, color: { argb: 'FF555555' } };
      dateRow.height = 25;
      dateRow.alignment = { vertical: 'middle' };

      worksheet.addRow([]);

      // --- 3. ADD COLUMN HEADERS WITH MERGED TITLES ---
      const headerRow = worksheet.addRow([
        t('excel.row'),
        t('excel.frame'),
        t('excel.carat'),
        t('excel.product'),
        t('excel.weight_of_variant'),
        '',
        t('excel.gallery_numbers'),
        '',
        t('excel.wholesaler_numbers'),
        '',
        t('excel.gallery_description'),
        t('excel.wholesaler_note_placeholder'),
      ]);

      const hRow = headerRow.number;
      worksheet.mergeCells(`E${hRow}:F${hRow}`);
      worksheet.mergeCells(`G${hRow}:H${hRow}`);
      worksheet.mergeCells(`I${hRow}:J${hRow}`);

      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 25;
      headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9C7A2B' } };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // --- 4. ADD DATA ROWS ---
      displayItems.forEach((item, index) => {
        const isVariant = !!item.variant;

        const variantVal = item.variant?.weight ? item.variant.weight : '—';
        const variantUnit = item.variant?.weight ? t('excel.grams') : '';

        const gReqVal = isVariant ? item.galleryQuantity : item.galleryWeight;
        const gReqUnit = isVariant ? t('excel.count') : t('excel.grams');

        let wFinVal: string | number = '—';
        let wFinUnit = '';
        if (item.finalQuantity !== '-' && item.finalWeight !== '-') {
          wFinVal = isVariant ? item.finalQuantity : item.finalWeight;
          wFinUnit = isVariant ? t('excel.count') : t('excel.grams');
        }

        const row = worksheet.addRow([
          index + 1,
          item.frame?.model || '—',
          item.frame?.carat || '—',
          item.product?.model || '—',
          variantVal,
          variantUnit,
          gReqVal,
          gReqUnit,
          wFinVal,
          wFinUnit,
          item.galleryDescription || '—',
          item.wholesalerDescription || '—',
        ]);

        row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          };
        });
      });

      worksheet.addRow([]);

      // --- 5. SUMMARY ROWS LOGIC ---
      const addSummaryRow = (
        label: string,
        val1: any,
        unit1: string,
        val2: any,
        unit2: string,
        boldVal: boolean = false,
      ) => {
        const r = worksheet.addRow(['', '', '', label, '', '', val1, unit1, val2, unit2, '', '']);
        const rowNum = r.number;
        worksheet.mergeCells(`D${rowNum}:F${rowNum}`);

        r.alignment = { vertical: 'middle', horizontal: 'center' };
        r.getCell(4).font = { bold: true, color: { argb: 'FF555555' } };
        r.getCell(7).font = { bold: true };
        r.getCell(8).font = { bold: true, color: { argb: 'FF888888' } };
        r.getCell(9).font = { bold: true, color: { argb: boldVal ? 'FF9C7A2B' : 'FF000000' } };
        r.getCell(10).font = { bold: true, color: { argb: 'FF888888' } };

        [4, 5, 6, 7, 8, 9, 10].forEach((col) => {
          r.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' },
          };
          r.getCell(col).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
        });
      };

      addSummaryRow(
        t('excel.total_initial_amount'),
        totalInitialWeight.toFixed(3),
        t('excel.grams'),
        status < 2 ? '—' : totalFinalWeight.toFixed(3),
        status < 2 ? '' : t('excel.grams'),
        true,
      );

      addSummaryRow(
        t('excel.active_rows_count'),
        nonZeroGalleryItemsCount,
        t('excel.rows'),
        status < 2 ? '—' : nonZeroFinalItemsCount,
        status < 2 ? '' : t('excel.rows'),
        true,
      );

      if (typeof finalGoldCredit === 'number' && status >= 2) {
        addSummaryRow(
          t('excel.final_gold_credit'),
          '—',
          '',
          finalGoldCredit.toFixed(3),
          t('excel.grams'),
          true,
        );
      }

      if (typeof finalRialCredit === 'number' && status >= 2) {
        addSummaryRow(
          t('excel.final_rial_credit'),
          '—',
          '',
          finalRialCredit.toLocaleString(),
          t('excel.rial'),
          true,
        );
      }

      // --- 6. SELECTIVE AMOUNTS (Settlement & Send Types) ---
      if (displaySettlementName !== '—' || displaySendName !== '—') {
        worksheet.addRow([]);

        const typeStyles = (r: ExcelJS.Row) => {
          const rowNum = r.number;
          worksheet.mergeCells(`D${rowNum}:F${rowNum}`);
          worksheet.mergeCells(`G${rowNum}:J${rowNum}`);
          r.alignment = { vertical: 'middle', horizontal: 'center' };
          r.getCell(4).font = { bold: true, color: { argb: 'FF9C7A2B' } };
          r.getCell(7).font = { bold: true };
        };

        if (displaySettlementName !== '—') {
          const sRow = worksheet.addRow([
            '',
            '',
            '',
            t('excel.settlement_type'),
            '',
            '',
            displaySettlementName,
            '',
            '',
            '',
            '',
            '',
          ]);
          typeStyles(sRow);

          if (showingWholesaleOrder?.settlementTypeAdditionalFields) {
            Object.entries(showingWholesaleOrder.settlementTypeAdditionalFields).forEach(
              ([key, value]) => {
                const addFRow = worksheet.addRow([
                  '',
                  '',
                  '',
                  key,
                  '',
                  '',
                  value as string,
                  '',
                  '',
                  '',
                  '',
                  '',
                ]);
                typeStyles(addFRow);
              },
            );
          }
        }

        if (displaySendName !== '—') {
          const dRow = worksheet.addRow([
            '',
            '',
            '',
            t('excel.send_type'),
            '',
            '',
            displaySendName,
            '',
            '',
            '',
            '',
            '',
          ]);
          typeStyles(dRow);

          if (showingWholesaleOrder?.sendTypeAdditionalFields) {
            Object.entries(showingWholesaleOrder.sendTypeAdditionalFields).forEach(
              ([key, value]) => {
                const addFRow = worksheet.addRow([
                  '',
                  '',
                  '',
                  key,
                  '',
                  '',
                  value as string,
                  '',
                  '',
                  '',
                  '',
                  '',
                ]);
                typeStyles(addFRow);
              },
            );
          }

          if (showingWholesaleOrder?.zarhubSendTypeAdditionalFields) {
            Object.entries(showingWholesaleOrder.zarhubSendTypeAdditionalFields).forEach(
              ([key, value]) => {
                const addFRow = worksheet.addRow([
                  '',
                  '',
                  '',
                  key,
                  '',
                  '',
                  value as string,
                  '',
                  '',
                  '',
                  '',
                  '',
                ]);
                typeStyles(addFRow);
              },
            );
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(
        blob,
        `سفارش از بنکداری ${showingWholesaleOrder.bucketName}_${showingWholesaleOrder.id}.xlsx`,
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  const { label: statusLabel, colorKey: statusColorKey } = getStatusDetails(status);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullScreen={isMobile}
      slots={isMobile ? { transition: Slide } : undefined}
      slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
      sx={{
        ...DialogSX.dialog,
        ...(isMobile ? DialogSX.bottom_sheet_dialog : {}),
        '& .MuiPaper-root': {
          ...(DialogSX.dialog['& .MuiPaper-root'] as any),
          ...(isMobile ? (DialogSX.bottom_sheet_dialog['& .MuiPaper-root'] as any) : {}),
          width: isMobile ? '100%' : 'calc(100vw - 24px)',
          maxWidth: '1600px',
          height: isMobile ? 'auto' : 'calc(100vh - 24px)',
          maxHeight: isMobile ? '90%' : 'auto',
          m: isMobile ? 0 : 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: '20px 20px 0 0', sm: '16px' },
        },
      }}
    >
      <Box sx={{ ...DialogSX.header_container, flexShrink: 0 }}>
        <DialogTitle sx={DialogSX.header_title}>
          {t('dialog.order_details')} {orderTitle ? ` - ${orderTitle}` : ''}
        </DialogTitle>
        <IconButton onClick={handleClose}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          ...DialogSX.dialog_content,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: { xs: 1, sm: 3 },
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {showingWholesaleOrder && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              gap: 1.5,
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#9C7A2B' }}>
                  {t('dialog.order_from')} {showingWholesaleOrder.bucketName}
                </Typography>
                <Chip
                  label={statusLabel}
                  size="small"
                  sx={(theme) => {
                    if (statusColorKey === 'grey') {
                      return {
                        bgcolor: alpha(theme.palette.grey[500], 0.16),
                        color: theme.palette.grey[700],
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                      };
                    }

                    const baseColorPalette = theme.palette[statusColorKey] as {
                      main: string;
                      dark: string;
                    };
                    return {
                      bgcolor: alpha(baseColorPalette.main, 0.16),
                      color: baseColorPalette.dark,
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                    };
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleExportExcel}
                  disabled={exporting || displayItems.length === 0}
                  endIcon={<DownloadIcon sx={{ mr: '3px' }} />}
                  sx={{
                    color: '#9C7A2B',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: 'transparent', opacity: 0.8 },
                  }}
                >
                  {exporting ? t('dialog.submitting') : t('dialog.export_excel') || 'خروجی اکسل'}
                </Button>

                {onCloneClick && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onCloneClick}
                    sx={{
                      color: '#9C7A2B',
                      borderColor: '#9C7A2B',
                      fontWeight: 700,
                      borderRadius: 2,
                      '&:hover': { borderColor: '#7A5C1F', backgroundColor: '#fcfcfc' },
                    }}
                  >
                    {t('dialog.clone_order_button')}
                  </Button>
                )}
                <Button
                  endIcon={<SortIcon />}
                  onClick={handleSortAndGroup}
                  sx={{ color: 'text.secondary', fontWeight: 600, gap: 1 }}
                >
                  {t('dialog.sort_group')}
                </Button>
              </Box>
            </Box>

            <Paper
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid #f0f0f0',
                boxShadow: 'none',
              }}
            >
              <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 1200,
                    '& .MuiTableCell-root': { borderBottom: '1px solid #f4f4f4' },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          width: 50,
                          px: 1,
                        }}
                      >
                        {t('dialog.row')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          width: 60,
                          px: 1,
                        }}
                      >
                        {t('dialog.image')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          minWidth: 160,
                        }}
                      >
                        {t('dialog.frame')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          minWidth: 100,
                        }}
                      >
                        {t('dialog.carat') || 'عیار'}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          minWidth: 160,
                        }}
                      >
                        {t('dialog.product')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          minWidth: 160,
                        }}
                      >
                        {t('dialog.weight_of_variant')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: 'text.secondary',
                          borderRight: '1px dashed #e0e0e0',
                          minWidth: 140,
                        }}
                      >
                        {t('dialog.gallery_numbers')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#fafafa',
                          fontWeight: 800,
                          color: '#9C7A2B',
                          minWidth: 160,
                        }}
                      >
                        {t('dialog.wholesaler_numbers')}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {displayItems.map((item, index) => {
                      const isVariant = !!item.variant;
                      const isProduct = !!item.product && !isVariant;
                      const isFrame = !!item.frame && !isProduct && !isVariant;

                      const imageUrl =
                        item.product?.image ||
                        item.product?.images?.[0] ||
                        item.frame?.cover ||
                        item.frame?.covers?.[0];
                      const validImage =
                        imageUrl && imageUrl !== '/images/BlurProduct.jpg' ? imageUrl : null;
                      const hasWholesalerValues =
                        item.finalQuantity !== '-' && item.finalWeight !== '-';

                      return (
                        <React.Fragment key={item.uid}>
                          <TableRow hover sx={{ '& > *': { borderBottom: 'none !important' } }}>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: 800, color: 'text.secondary', px: 1 }}
                            >
                              {tPD(index + 1)}
                            </TableCell>
                            <TableCell align="center" sx={{ px: 1 }}>
                              <Avatar
                                src={validImage || undefined}
                                variant="rounded"
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: '#f4f4f4',
                                  color: '#ccc',
                                  border: '1px solid #eee',
                                  mx: 'auto',
                                }}
                              >
                                {!validImage && <Inventory2OutlinedIcon />}
                              </Avatar>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                sx={{ fontWeight: isFrame ? 800 : 500, fontSize: '0.9rem' }}
                              >
                                {item.frame?.model || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                {item.frame?.carat ? tPD(item.frame.carat) : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  color: item.product ? 'inherit' : 'text.disabled',
                                  fontWeight: isProduct ? 800 : 500,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {item.product?.model || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  color: item.variant ? 'inherit' : 'text.disabled',
                                  fontWeight: isVariant ? 800 : 500,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {item.variant?.weight
                                  ? `${tPD(item.variant.weight)} ${t('dialog.grams')}`
                                  : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderRight: '1px dashed #e0e0e0' }}>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: 'text.secondary',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {isVariant
                                  ? tPD(item.galleryQuantity || 0)
                                  : tPD(item.galleryWeight || 0)}
                                <span
                                  style={{ fontSize: '0.8rem', marginLeft: '4px', opacity: 0.7 }}
                                >
                                  {'   '}
                                  {isVariant ? t('dialog.count') : t('dialog.grams')}
                                </span>
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {hasWholesalerValues ? (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  gap={1}
                                >
                                  <Typography
                                    sx={{ fontWeight: 800, color: '#9C7A2B', textAlign: 'center' }}
                                  >
                                    {isVariant ? tPD(item.finalQuantity) : tPD(item.finalWeight)}
                                  </Typography>
                                  <Typography
                                    sx={{ color: '#9C7A2B', fontSize: '0.8rem', opacity: 0.8 }}
                                  >
                                    {isVariant ? t('dialog.count') : t('dialog.grams')}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  sx={{ fontWeight: 800, color: '#ccc', textAlign: 'center' }}
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell colSpan={2} />
                            <TableCell colSpan={6} sx={{ pt: 0, pb: 2 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  gap: 0.5,
                                  pr: 1.5,
                                  borderRight: '2px solid #e0e0e0',
                                }}
                              >
                                {item.galleryDescription && (
                                  <Typography
                                    sx={{
                                      fontSize: '0.8rem',
                                      color: 'text.secondary',
                                      textAlign: 'right',
                                    }}
                                  >
                                    <Box component="span" sx={{ fontWeight: 600 }}>
                                      {t('dialog.gallery_description')}{' '}
                                    </Box>
                                    {item.galleryDescription}
                                  </Typography>
                                )}
                                {item.wholesalerDescription && (
                                  <Typography
                                    sx={{
                                      fontSize: '0.8rem',
                                      color: '#333',
                                      textAlign: 'right',
                                      mt: 0.5,
                                    }}
                                  >
                                    <Box component="span" sx={{ fontWeight: 600 }}>
                                      {t('dialog.wholesaler_note_placeholder')}{' '}
                                    </Box>
                                    {item.wholesalerDescription}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}

                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell colSpan={5} />
                      <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {t('dialog.total_initial_amount')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 800,
                          color: 'text.secondary',
                          borderRight: '1px dashed #e0e0e0',
                        }}
                      >
                        {tPD(totalInitialWeight.toFixed(3))} {t('dialog.grams')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}
                      >
                        {status < 2
                          ? '—'
                          : `${tPD(totalFinalWeight.toFixed(3))} ${t('dialog.grams')}`}
                      </TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell colSpan={5} />
                      <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {t('dialog.active_rows_count')}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 800,
                          color: 'text.secondary',
                          borderRight: '1px dashed #e0e0e0',
                        }}
                      >{`${tPD(nonZeroGalleryItemsCount)} ${t('dialog.rows')}`}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}
                      >
                        {status < 2 ? '—' : `${tPD(nonZeroFinalItemsCount)} ${t('dialog.rows')}`}
                      </TableCell>
                    </TableRow>

                    {typeof finalGoldCredit === 'number' && status >= 2 && (
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell colSpan={5} />
                        <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {t('dialog.final_gold_credit')}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 800,
                            color: 'text.secondary',
                            borderRight: '1px dashed #e0e0e0',
                          }}
                        >
                          —
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}
                        >
                          {tPD(finalGoldCredit.toFixed(3))} {t('dialog.grams')}
                        </TableCell>
                      </TableRow>
                    )}

                    {typeof finalRialCredit === 'number' && status >= 2 && (
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell colSpan={5} />
                        <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {t('dialog.final_rial_credit')}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 800,
                            color: 'text.secondary',
                            borderRight: '1px dashed #e0e0e0',
                          }}
                        >
                          —
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}
                        >
                          {tPD(finalRialCredit.toLocaleString())} {t('dialog.rial')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {(canDoAction || status > 2) && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', md: 'flex-end' },
                  gap: 1.5,
                  pt: 1,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: { xs: 1.5, md: 0.5, lg: 1.5 },
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  {status === 2 && (
                    <>
                      <Box sx={{ width: { xs: '100%', sm: '250px' } }}>
                        <PurchaseSettlementTypeSelect
                          value={settlementType}
                          setValue={setSettlementType}
                          title={`نوع تسویه (موجودی کیف پول: ${availableAssetDebt})`}
                        />
                      </Box>
                      <Box sx={{ width: { xs: '100%', sm: '250px' } }}>
                        <SendTypeSelect
                          value={sendType}
                          setValue={setSendType}
                          title={'نوع تسویه:'}
                        />
                      </Box>

                      {/* Render custom dynamic inputs mapped from settlementType.additionalFields */}
                      {settlementType?.additionalFields?.map((field) => (
                        <Box
                          key={`settlement-${field.name}`}
                          sx={{ width: { xs: '100%', sm: '250px' } }}
                        >
                          <CustomTextField
                            id={`dynamic-field-settlement-${field.name}`}
                            title={field.name}
                            value={settlementTypeAdditionalFieldsValues[field.name] || ''}
                            setValue={(val) => {
                              setSettlementTypeAdditionalFieldsValues((prev) => ({
                                ...prev,
                                [field.name]: val,
                              }));
                            }}
                            validate={(val) => val.trim().length > 0}
                            hasStar
                          />
                        </Box>
                      ))}

                      {/* Render custom dynamic inputs mapped from sendType.additionalFields */}
                      {sendType?.additionalFields?.map((field) => (
                        <Box key={`send-${field.name}`} sx={{ width: { xs: '100%', sm: '250px' } }}>
                          <CustomTextField
                            id={`dynamic-field-send-${field.name}`}
                            title={field.name}
                            value={sendTypeAdditionalFieldsValues[field.name] || ''}
                            setValue={(val) => {
                              setSendTypeAdditionalFieldsValues((prev) => ({
                                ...prev,
                                [field.name]: val,
                              }));
                            }}
                            validate={(val) => {
                              if (val.trim().length === 0) return true;

                              const normalizedName = field.name
                                .replace(/\u200c/g, '')
                                .replace(/\s+/g, '');
                              if (normalizedName === 'کدپستی') {
                                const enVal = val.replace(/[۰-۹]/g, (d: any) =>
                                  '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString(),
                                );
                                return /^\d{10}$/.test(enVal);
                              }

                              return val.trim().length > 0;
                            }}
                            hasStar
                          />
                        </Box>
                      ))}
                    </>
                  )}

                  {status > 2 && (
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                      >
                        {t('dialog.settlement_type')}:{' '}
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                          {displaySettlementName}
                        </Box>
                      </Typography>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                      >
                        {t('dialog.send_type')}:{' '}
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                          {displaySendName}
                        </Box>
                      </Typography>

                      {showingWholesaleOrder?.settlementTypeAdditionalFields &&
                        Object.entries(showingWholesaleOrder.settlementTypeAdditionalFields).map(
                          ([key, value]) => (
                            <Typography
                              key={`settlement-detail-${key}`}
                              sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                            >
                              {key}:{' '}
                              <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                                {value as React.ReactNode}
                              </Box>
                            </Typography>
                          ),
                        )}

                      {showingWholesaleOrder?.sendTypeAdditionalFields &&
                        Object.entries(showingWholesaleOrder.sendTypeAdditionalFields).map(
                          ([key, value]) => (
                            <Typography
                              key={`send-detail-${key}`}
                              sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                            >
                              {key}:{' '}
                              <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                                {value as React.ReactNode}
                              </Box>
                            </Typography>
                          ),
                        )}

                      {showingWholesaleOrder?.zarhubSendTypeAdditionalFields &&
                        Object.entries(showingWholesaleOrder.zarhubSendTypeAdditionalFields).map(
                          ([key, value]) => (
                            <Typography
                              key={`send-detail-${key}`}
                              sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                            >
                              {key}:{' '}
                              <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                                {value as React.ReactNode}
                              </Box>
                            </Typography>
                          ),
                        )}
                    </Box>
                  )}
                </Box>

                {canDoAction && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      width: { xs: '100%', md: 'auto' },
                      ml: { md: 'auto' },
                      mt: { xs: 1, md: 0 },
                    }}
                  >
                    {(status === 0 || status === 2) && (
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth={isMobile}
                        disabled={loadingAction}
                        onClick={onReject}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        {t('dialog.cancel_order')}
                      </Button>
                    )}

                    {status === 2 && (
                      <Button
                        variant="contained"
                        fullWidth={isMobile}
                        onClick={onApprove}
                        disabled={
                          loadingAction || !settlementType || !sendType || !isAdditionalFieldsValid
                        }
                        sx={{
                          bgcolor: '#9C7A2B',
                          '&:hover': { bgcolor: '#7A5C1F' },
                          px: 4,
                          borderRadius: 2,
                          fontWeight: 800,
                          boxShadow: 'none',
                        }}
                      >
                        {t('dialog.approve_order')}
                      </Button>
                    )}

                    {status === 4 && (
                      <Button
                        variant="contained"
                        fullWidth={isMobile}
                        onClick={onReceive}
                        disabled={loadingAction}
                        sx={{
                          bgcolor: '#9C7A2B',
                          '&:hover': { bgcolor: '#7A5C1F' },
                          px: 4,
                          borderRadius: 2,
                          fontWeight: 800,
                          boxShadow: 'none',
                        }}
                      >
                        {t('dialog.receive_order')}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WholesaleOrderDialog;
