import React from 'react';
import {
  TableRow,
  TableCell,
  Avatar,
  Typography,
  Autocomplete,
  TextField,
  IconButton,
  Box,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { EditableCell } from './EditableCell';
import { DescriptionField } from './DescriptionField';
import { OrderTableRowProps } from '../types';
import { tPD } from '@/utils';

export const OrderTableRow = ({
  item,
  index,
  catalogFrames,
  canEdit,
  status,
  onUpdateItem,
  onRemoveItem,
  onFrameSelect,
  t,
}: OrderTableRowProps) => {
  // @ts-ignore - برای دسترسی به property های مختلف
  const isVariant = !!item.variant;
  // @ts-ignore
  const isProduct = !!item.product && !isVariant;
  // @ts-ignore
  const isFrame = !!item.frame && !isProduct && !isVariant;

  // @ts-ignore
  const imageUrl =
    item.product?.image ||
    item.product?.images?.[0] ||
    item.frame?.cover ||
    item.frame?.covers?.[0];
  const validImage = imageUrl && imageUrl !== '/images/BlurProduct.jpg' ? imageUrl : null;

  const handleFrameSelectWrapper = (_: any, val: any) => onFrameSelect(item.uid, val);

  const rawValue = isVariant ? item.finalQuantity || 0 : item.finalWeight || 0;

  return (
    <React.Fragment>
      <TableRow hover sx={{ '& > *': { borderBottom: 'none !important' } }}>
        <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary', px: 1 }}>
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
          {item.isNew && canEdit ? (
            <Autocomplete
              size="small"
              options={catalogFrames}
              getOptionLabel={(opt: any) => opt?.model || ''}
              onChange={handleFrameSelectWrapper}
              renderInput={(params) => (
                <TextField {...params} variant="standard" placeholder={t('dialog.frame')} />
              )}
            />
          ) : (
            <Typography sx={{ fontWeight: isFrame ? 800 : 500, fontSize: '0.9rem' }}>
              {item.frame?.model}
            </Typography>
          )}
        </TableCell>

        <TableCell align="center">
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
            {item.frame?.carat ? tPD(item.frame.carat) : '—'}
          </Typography>
        </TableCell>

        <TableCell align="center">
          {item.isNew && item.frame && canEdit ? (
            <Autocomplete
              size="small"
              options={item.availableProducts || []}
              getOptionLabel={(opt: any) => opt?.model || ''}
              onChange={(_: any, val: any) => {
                onUpdateItem(item.uid, 'product', val);
                onUpdateItem(item.uid, 'variant', null);
              }}
              renderInput={(params) => (
                <TextField {...params} variant="standard" placeholder={t('dialog.product')} />
              )}
            />
          ) : (
            <Typography
              sx={{
                color: item.product ? 'inherit' : 'text.disabled',
                fontWeight: isProduct ? 800 : 500,
                fontSize: '0.9rem',
              }}
            >
              {item.product?.model || '—'}
            </Typography>
          )}
        </TableCell>

        <TableCell align="center">
          {item.isNew && item.product && canEdit ? (
            <Autocomplete
              size="small"
              options={item.product?.variants || []}
              getOptionLabel={(opt: any) => `${opt?.weight || 0} ${t('dialog.grams')}`}
              onChange={(_: any, val: any) => onUpdateItem(item.uid, 'variant', val)}
              renderInput={(params) => (
                <TextField {...params} variant="standard" placeholder={t('dialog.variant')} />
              )}
            />
          ) : (
            <Typography
              sx={{
                color: item.variant ? 'inherit' : 'text.disabled',
                fontWeight: isVariant ? 800 : 500,
                fontSize: '0.9rem',
              }}
            >
              {item.variant?.weight ? `${tPD(item.variant.weight)} ${t('dialog.grams')}` : '—'}
            </Typography>
          )}
        </TableCell>

        <TableCell align="center" sx={{ borderRight: '1px dashed #e0e0e0' }}>
          <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.9rem' }}>
            {isVariant ? tPD(item.galleryQuantity || 0) : tPD(item.galleryWeight || 0)}
            <span style={{ fontSize: '0.8rem', marginLeft: '4px', opacity: 0.7 }}>
              {'  '}
              {isVariant ? t('dialog.count') : t('dialog.grams')}
            </span>
          </Typography>
        </TableCell>

        <TableCell align="center" sx={{ minWidth: 110, p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <EditableCell
              value={canEdit ? rawValue : tPD(rawValue)}
              type={isVariant ? 'quantity' : 'weight'}
              canEdit={canEdit}
              status={status}
              onChange={(val) => {
                if (isVariant) {
                  onUpdateItem(item.uid, 'finalQuantity', val);
                } else {
                  onUpdateItem(item.uid, 'finalWeight', val);
                }
              }}
              unit={` ${isVariant ? t('dialog.count') : t('dialog.grams')}`}
              isVariant={isVariant}
            />
          </Box>
        </TableCell>

        <TableCell align="center" sx={{ width: 60, minWidth: 60, p: 0 }}>
          {canEdit && (
            <IconButton color="error" onClick={() => onRemoveItem(item.uid, item.isNew)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </TableCell>

        <TableCell sx={{ width: 24, minWidth: 24, p: 0 }} />
      </TableRow>

      <TableRow>
        <TableCell colSpan={2} />
        <TableCell colSpan={6} sx={{ pt: 0, pb: 2 }}>
          <DescriptionField
            galleryDescription={item.galleryDescription}
            wholesalerDescription={item.wholesalerDescription}
            canEdit={canEdit}
            onWholesalerChange={(val) => onUpdateItem(item.uid, 'wholesalerDescription', val)}
            t={t}
          />
        </TableCell>
        <TableCell colSpan={2} sx={{ p: 0 }} />
      </TableRow>
    </React.Fragment>
  );
};
