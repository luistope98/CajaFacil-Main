"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import type { StockItem } from "@/app/user/inventario/types/inventory.types";

type Props = {
  open: boolean;
  item: StockItem | null;
  onClose: () => void;
  onSave: (productId: number, quantity: number, description: string) => Promise<void>;
};

export default function StockAdjustmentModal({ open, item, onClose, onSave }: Props) {
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity("");
      setDescription("");
      setError("");
    }
  }, [open]);

  const parsedQty = parseInt(quantity, 10);
  const isValid = !isNaN(parsedQty) && parsedQty !== 0 && description.trim().length > 0;
  const newStock = item ? item.stock + (isNaN(parsedQty) ? 0 : parsedQty) : 0;
  const isNegative = !isNaN(parsedQty) && parsedQty < 0;

  const handleSave = async () => {
    if (!item || !isValid) return;
    if (newStock < 0) {
      setError(`El stock no puede ser negativo. Máximo a restar: ${item.stock}`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(item.id, parsedQty, description.trim());
      onClose();
    } catch {
      setError("Error al ajustar el stock. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", pb: 1 }}>
        Ajustar Stock
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "12px !important" }}>
        {item && (
          <Box sx={{ bgcolor: "#F8FAFC", borderRadius: 2, p: 2, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} fontSize="0.95rem">{item.name}</Typography>
            {item.skus?.[0]?.sku && (
              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                {item.skus[0].sku}
              </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">Stock actual:</Typography>
              <Typography fontWeight={700} color="#0B5FFF">{item.stock}</Typography>
              {!isNaN(parsedQty) && parsedQty !== 0 && (
                <>
                  <Typography color="text.secondary">→</Typography>
                  <Typography fontWeight={700} color={newStock < 0 ? "#dc2626" : "#059669"}>
                    {newStock}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        )}

        <TextField
          label="Cantidad"
          type="number"
          value={quantity}
          onChange={(e) => { setQuantity(e.target.value); setError(""); }}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ display: "flex", mr: 0.5, color: isNegative ? "#dc2626" : "#059669" }}>
                  {isNegative ? <RemoveRoundedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />}
                </Box>
              ),
            },
          }}
          helperText="Positivo para entrada (+), negativo para salida (−)"
        />

        <TextField
          label="Motivo / Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="Ej: Conteo físico, merma, devolución de proveedor..."
        />

        {error && (
          <Typography variant="caption" color="error" sx={{ mt: -1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={saving} sx={styles.cancelBtn}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isValid || saving}
          sx={styles.saveBtn}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? "Guardando..." : "Guardar ajuste"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const styles = {
  cancelBtn: {
    borderRadius: 3, textTransform: "none", fontWeight: 700,
    color: "#111827", border: "1px solid rgba(0,0,0,0.12)", bgcolor: "white",
    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
  },
  saveBtn: {
    borderRadius: 3, textTransform: "none", fontWeight: 800,
    bgcolor: "#0B5FFF", "&:hover": { bgcolor: "#0747C6" },
  },
};
