import { Box, Typography, TextField } from '@mui/material';

interface DescriptionFieldProps {
  galleryDescription: string;
  wholesalerDescription: string;
  canEdit: boolean;
  onWholesalerChange: (value: string) => void;
  t: (key: string) => string;
}

export const DescriptionField = ({
  galleryDescription,
  wholesalerDescription,
  canEdit,
  onWholesalerChange,
  t,
}: DescriptionFieldProps) => (
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
    {galleryDescription && (
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', textAlign: 'right' }}>
        <Box component="span" sx={{ fontWeight: 600 }}>
          {t('dialog.gallery_description')}{' '}
        </Box>
        {galleryDescription}
      </Typography>
    )}
    {canEdit ? (
      <TextField
        size="small"
        fullWidth
        variant="standard"
        placeholder={t('dialog.wholesaler_note_placeholder')}
        value={wholesalerDescription}
        onChange={(e) => onWholesalerChange(e.target.value)}
        sx={{ '& input': { fontSize: '0.8rem', color: '#333' } }}
      />
    ) : (
      wholesalerDescription && (
        <Typography sx={{ fontSize: '0.8rem', color: '#333', textAlign: 'right' }}>
          {wholesalerDescription}
        </Typography>
      )
    )}
  </Box>
);
