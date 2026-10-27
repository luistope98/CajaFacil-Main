"use client";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
};

export default function DeleteConfirmModal({ open, onClose, onConfirm, title, itemName }: Props) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, px: 1, py: 1, maxWidth: 400 }
      }}
    >
      <DialogContent>
        <Stack alignItems="center" spacing={2} sx={{ mt: 1 }}>
          {/* Icono de advertencia estilizado */}
          <Box 
            sx={{ 
              bgcolor: "rgba(197, 22, 29, 0.1)", 
              color: "#C5161D", 
              p: 2, 
              borderRadius: "50%",
              display: "flex"
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 40 }} />
          </Box>

          <Box textAlign="center">
            <Typography variant="h6" fontWeight={900} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ¿Estás seguro de que deseas eliminar la sede <strong>{itemName}</strong>? 
              Esta acción no se puede deshacer.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 1.5 }}>
        <Button 
          fullWidth
          onClick={onClose}
          sx={{ 
            textTransform: "none", 
            fontWeight: 700, 
            color: "#6B7280",
            bgcolor: "#F3F4F6",
            "&:hover": { bgcolor: "#E5E7EB" }
          }}
        >
          Cancelar
        </Button>
        <Button 
          fullWidth
          variant="contained"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          sx={{ 
            textTransform: "none", 
            fontWeight: 900, 
            bgcolor: "#C5161D",
            boxShadow: "none",
            "&:hover": { bgcolor: "#A11218", boxShadow: "none" }
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}