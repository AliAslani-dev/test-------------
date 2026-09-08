import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExportExcelParams } from '../types';
import { getStatusDetails } from './statusUtils';
import { formatPersianDate } from './formatters';

export const generateExcelFile = async (params: ExportExcelParams): Promise<void> => {
  const {
    order,
    items,
    totalInitialWeight,
    totalFinalWeight,
    nonZeroGalleryItemsCount,
    nonZeroFinalItemsCount,
    finalGoldCredit,
    finalRialCredit,
    displaySettlementName,
    displaySendName,
    t,
  } = params;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(t('excel.sheet_name') || 'Order', {
    views: [{ rightToLeft: true }],
  });

  // Set column widths
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

  // Header
  const { label: statusLabel } = getStatusDetails(order.status);
  const titleDisplayStr = order.title ? ` - ${order.title}` : '';

  const titleRow = worksheet.addRow([
    `${t('excel.order_from')} ${order.zarplusUser}${titleDisplayStr} - ${t('excel.order_number')} ${order.id}`,
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

  // Dates
  const createdStr = `${t('excel.created_at')} ${formatPersianDate(order.createdAt)}`;
  const updatedStr = `${t('excel.updated_at')} ${formatPersianDate(order.updatedAt)}`;

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

  // Column Headers
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

  // Data Rows
  items.forEach((item, index) => {
    const isVariant = !!item.variant;
    const variantVal = item.variant?.weight ? item.variant.weight : '—';
    const variantUnit = item.variant?.weight ? t('excel.grams') : '';
    const gReqVal = isVariant ? item.galleryQuantity : item.galleryWeight;
    const gReqUnit = isVariant ? t('excel.count') : t('excel.grams');
    let wFinVal: string | number = '—';
    let wFinUnit = '';

    if (order.status !== 0) {
      wFinVal = isVariant ? item.finalQuantity || 0 : item.finalWeight || 0;
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

  // Summary Rows
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
    order.status === 0 ? '—' : totalFinalWeight.toFixed(3),
    order.status === 0 ? '' : t('excel.grams'),
    true,
  );

  addSummaryRow(
    t('excel.active_rows_count'),
    nonZeroGalleryItemsCount,
    t('excel.rows'),
    order.status === 0 ? '—' : nonZeroFinalItemsCount,
    order.status === 0 ? '' : t('excel.rows'),
    true,
  );

  if (finalGoldCredit !== undefined && finalGoldCredit !== null && order.status >= 2) {
    addSummaryRow(
      t('excel.final_gold_credit'),
      '—',
      '',
      finalGoldCredit.toFixed(3),
      t('excel.grams'),
      true,
    );
  }

  if (finalRialCredit !== undefined && finalRialCredit !== null && order.status >= 2) {
    addSummaryRow(
      t('excel.final_rial_credit'),
      '—',
      '',
      finalRialCredit.toLocaleString(),
      t('excel.rial'),
      true,
    );
  }

  // Settlement & Send Types
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
    }

    if (order.settlementTypeAdditionalFields) {
      Object.entries(order.settlementTypeAdditionalFields).forEach(([key, value]) => {
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
      });
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

      if (order.sendTypeAdditionalFields) {
        Object.entries(order.sendTypeAdditionalFields).forEach(([key, value]) => {
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
        });
      }
    }
  }

  // Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(
    blob,
    `${order.id}-${t('excel.order_from').replaceAll(':', '')} ${order.zarplusUser}-${createdStr.split(',')[0]}.xlsx`,
  );
};
