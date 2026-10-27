"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import RegisterForm from "./RegisterForm";
import type { Register, CreateRegisterDTO } from "../types/register.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateRegisterDTO, editingId?: number) => void;
  initialRegister?: Register | null;
  overridePosId?: number;
  isAdmin?: boolean;
}

type ConfirmState = {
  open: boolean;
};

function stableStringify(obj: any) {
  // stringify estable para comparar (sin reordenar keys en objetos anidados complejos)
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export default function RegisterModal({ open, onClose, onSubmit, initialRegister, overridePosId, isAdmin }: Props) {
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });

  // Guardamos un “snapshot” de lo que había al abrir para comparar cambios
  const initialSnapshot = useMemo(() => {
    if (!open) return "";
    return stableStringify({
      id: initialRegister?.id ?? null,
      type: initialRegister?.type ?? null,
      description: initialRegister?.description ?? "",
      paymentMethod: initialRegister?.paymentMethod ?? null,
      state: initialRegister?.state ?? null,
      urlImage: initialRegister?.urlImage ?? null,
      items: (initialRegister?.items ?? []).map((it: any) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRegister?.id]);

  // El form nos reporta el "current draft" para saber si hay cambios
  const [draftSnapshot, setDraftSnapshot] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setConfirm({ open: false });
      setDraftSnapshot("");
    }
  }, [open]);

  const hasChanges = useMemo(() => {
    if (!open) return false;
    if (!draftSnapshot) return false;
    return draftSnapshot !== initialSnapshot;
  }, [draftSnapshot, initialSnapshot, open]);

  const requestClose = () => {
    // si no hay cambios, cerrar directo
    if (!hasChanges) {
      onClose();
      return;
    }
    // si hay cambios, confirmar
    setConfirm({ open: true });
  };

  const discardChangesAndClose = () => {
    setConfirm({ open: false });
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: { xs: 3, md: 5 },
            border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden",
            m: { xs: 1, md: 2 },
            width: { xs: "calc(100% - 16px)", md: "auto" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 950,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {initialRegister ? `Editar registro #${initialRegister.id}` : "Nuevo registro"}

          <IconButton onClick={requestClose} sx={{ borderRadius: 3 }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "white" }}>
          <RegisterForm
            key={initialRegister?.id ?? "new"}
            initialRegister={initialRegister}
            onSubmit={(dto, editingId) => onSubmit(dto, editingId)}
            onCancel={requestClose}
            overridePosId={overridePosId}
            isAdmin={isAdmin}
            // 👇 nuevo: el form nos reporta snapshot del draft
            onDraftChange={(draft) => {
              setDraftSnapshot(
                stableStringify({
                  id: initialRegister?.id ?? null,
                  type: draft.type,
                  description: draft.description ?? "",
                  paymentMethod: draft.paymentMethod,
                  state: draft.state,
                  urlImage: draft.urlImage ?? null,
                  items: (draft.items ?? []).map((it: any) => ({
                    productId: it.productId,
                    quantity: it.quantity,
                  })),
                })
              );
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ✅ Confirm discard dialog */}
      <Dialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false })}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0.5,
            border: "1px solid rgba(0,0,0,0.06)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberRoundedIcon sx={{ color: "#C5161D" }} />
          Descartar cambios
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: "#6B7280" }}>
            Tienes cambios sin guardar. ¿Quieres descartarlos?
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 1.4,
              borderRadius: 3,
              bgcolor: "rgba(197,22,29,0.06)",
              border: "1px solid rgba(197,22,29,0.18)",
            }}
          >
            <Typography variant="body2" fontWeight={900} sx={{ color: "#A11218" }}>
              Si sales, perderás los cambios.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1.2 }}>
          <Button
            onClick={() => setConfirm({ open: false })}
            sx={{ textTransform: "none", fontWeight: 900, borderRadius: 3 }}
          >
            Seguir editando
          </Button>

          <Button
            onClick={discardChangesAndClose}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 3,
              bgcolor: "#C5161D",
              boxShadow: "none",
              "&:hover": { bgcolor: "#A11218", boxShadow: "none" },
            }}
          >
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}