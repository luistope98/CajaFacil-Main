"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
  open,
  title = "Confirmar eliminación",
  description = "¿Seguro que quieres eliminar este item? Esta acción no se puede deshacer.",
  onCancel,
  onConfirm,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          m: isMobile ? 0 : 2,
          width: isMobile ? '100%' : 'calc(100% - 32px)',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Typography color="text.secondary" variant="body1">
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
        <Button 
          onClick={onCancel} 
          fullWidth={isMobile}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700,
            py: isMobile ? 1.5 : 1
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={onConfirm}
          fullWidth={isMobile}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 800,
            boxShadow: 'none',
            py: isMobile ? 1.5 : 1,
            '&:hover': { bgcolor: '#d32f2f', boxShadow: 'none' }
          }}
        >
          Eliminar Producto
        </Button>
      </DialogActions>
    </Dialog>
  );
}
