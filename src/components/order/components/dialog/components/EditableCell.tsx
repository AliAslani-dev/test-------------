import { TextField, Typography, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { convertToEnglishNumber } from '../utils/formatters';
import { EditableCellProps } from '../types';

export const EditableCell = ({
  value,
  type,
  canEdit,
  status,
  placeholder,
  onChange,
  unit,
  isVariant = false,
}: EditableCellProps) => {
  if (isVariant && type === 'quantity') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        {canEdit && (
          <IconButton size="small" onClick={() => onChange(Number(value) + 1)}>
            <AddIcon fontSize="small" />
          </IconButton>
        )}

        {canEdit ? (
          <TextField
            type="text"
            size="small"
            variant="standard"
            value={value}
            onChange={(e) => {
              let val = convertToEnglishNumber(e.target.value);
              val = val.replace(/[^0-9]/g, '');
              onChange(val);
            }}
            inputProps={{
              inputMode: 'numeric',
              style: { textAlign: 'center', fontWeight: 800, color: '#9C7A2B' },
            }}
            sx={{ width: 40 }}
          />
        ) : (
          <Typography sx={{ fontWeight: 800, color: '#9C7A2B', width: 24, textAlign: 'center' }}>
            {status === 0 ? '—' : value}
          </Typography>
        )}

        {canEdit && (
          <IconButton size="small" onClick={() => onChange(Math.max(0, Number(value) - 1))}>
            <RemoveIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  if (type === 'text') {
    if (canEdit) {
      return (
        <TextField
          size="small"
          fullWidth
          variant="standard"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ '& input': { fontSize: '0.8rem', color: '#333' } }}
        />
      );
    }
    return (
      <Typography sx={{ fontSize: '0.8rem', color: '#333', textAlign: 'right' }}>
        {value}
      </Typography>
    );
  }

  // Weight type
  if (canEdit) {
    return (
      <TextField
        type="text"
        size="small"
        variant="standard"
        value={value}
        onChange={(e) => onChange(convertToEnglishNumber(e.target.value))}
        inputProps={{
          inputMode: 'decimal',
          style: { textAlign: 'center', fontWeight: 800, color: '#9C7A2B' },
        }}
        sx={{ width: 60 }}
      />
    );
  }

  return (
    <Typography sx={{ fontWeight: 800, color: '#9C7A2B', width: 60, textAlign: 'center' }}>
      {status === 0 ? '—' : value}
      {unit && <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: 4 }}>{unit}</span>}
    </Typography>
  );
};
