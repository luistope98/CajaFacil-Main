"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import type { Pos } from "../types/pos.types";

export interface PosFormData {
  name: string;
  description: string;
  address: string;
  taxId: string;
  phone: string;
  minStock: string;
  minCash: string;
  openingBalance: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: PosFormData) => void;
  initial?: Pos | null;
}

export default function PosModal({ open, onClose, onSave, initial }: Props) {
  const theme = useTheme();
  const [form, setForm] = useState<PosFormData>({
    name: initial?.name || "",
    description: initial?.description || "",
    address: initial?.address || "",
    taxId: String(initial?.taxId || ""),
    phone: String(initial?.phone || ""),
    minStock: String(initial?.minStock || ""),
    minCash: String(initial?.minCash || ""),
    openingBalance: String(initial?.openingBalance ?? ""),
  });

  const set = (field: keyof PosFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {initial ? "Editar Sede" : "Nueva Sede"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>

          <TextField
            label="Nombre"
            fullWidth
            size="small"
            value={form.name}
            onChange={set("name")}
            required
          />

          <TextField
            label="Descripción"
            fullWidth
            size="small"
            value={form.description}
            onChange={set("description")}
            placeholder="Ej: Sede principal, Local Norte..."
          />

          <TextField
            label="Dirección"
            fullWidth
            size="small"
            value={form.address}
            onChange={set("address")}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="NIT"
              size="small"
              value={form.taxId}
              onChange={set("taxId")}
            />
            <TextField
              label="Teléfono"
              size="small"
              value={form.phone}
              onChange={set("phone")}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Stock mínimo (alerta)"
              type="number"
              size="small"
              value={form.minStock}
              onChange={set("minStock")}
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <TextField
              label="Caja mínima (alerta)"
              type="number"
              size="small"
              value={form.minCash}
              onChange={set("minCash")}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Box>

          {!initial && (
            <TextField
              label="Saldo inicial de caja"
              type="number"
              size="small"
              fullWidth
              value={form.openingBalance}
              onChange={set("openingBalance")}
              helperText="Dinero que hay en caja al momento de crear la sede (opcional, por defecto $0)"
              slotProps={{ htmlInput: { min: 0 } }}
            />
          )}

        </Stack>
      </DialogContent>

      <DialogActions sx={{
        p: 2,
        bgcolor: theme.palette.grey[50],
        flexDirection: { xs: "column-reverse", sm: "row" },
        gap: 1,
      }}>
        <Button
          sx={{ width: { xs: "100%", sm: "auto" }, textTransform: "none" }}
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          sx={{
            width: { xs: "100%", sm: "auto" },
            bgcolor: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 700,
          }}
          onClick={() => onSave(form)}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
