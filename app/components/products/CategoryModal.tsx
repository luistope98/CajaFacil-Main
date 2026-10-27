"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => void;
};

export default function CategoryModal({ open, onClose, onSave }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: "", description: "" });
      setTouched(false);
    }
  }, [open]);

  const error = touched && !form.name.trim() ? "El nombre es obligatorio" : "";

  const handleConfirm = () => {
    setTouched(true);
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth 
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Nueva Categoría
        {fullScreen && <IconButton onClick={onClose}><CloseIcon /></IconButton>}
      </DialogTitle>
      
      <DialogContent dividers={fullScreen}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre de la categoría"
            fullWidth
            size="small"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={Boolean(error)}
            helperText={error}
            autoFocus
          />
          <TextField
            label="Descripción (opcional)"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, flexDirection: fullScreen ? 'column' : 'row', gap: 1 }}>
        <Button onClick={onClose} fullWidth={fullScreen}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm} 
          disabled={!form.name.trim()}
          fullWidth={fullScreen}
          sx={{ bgcolor: "#0B5FFF", fontWeight: 800 }}
        >
          Crear Categoría
        </Button>
      </DialogActions>
    </Dialog>
  );
}