"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import api from "@/src/services/api";
import type { Register, PaymentMethod, RegisterState, RegisterType } from "../types/register.types";

interface Props {
  open: boolean;
  onClose: () => void;
  register: Register | null;
  isAdmin?: boolean;
}

const TYPE_LABELS: Record<RegisterType, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Egreso",
  PURCHASE: "Compra",
};

const STATE_LABELS: Record<RegisterState, string> = {
  COMPLETED: "Completado",
  PENDING: "Pendiente",
  CANCELLED: "Cancelado",
};

/**
 * Axios responses with `responseType: "blob"` come back as a Blob even on
 * error (the JSON error body isn't auto-parsed), so the real backend message
 * has to be read out of the blob text instead of `error.response.data.message`.
 */
async function extractErrorMessage(error: any, fallback: string): Promise<string> {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) {
        return Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
      }
    } catch {
      // Response body wasn't JSON — fall through to the fallback message
    }
  }
  return error?.response?.data?.message ?? fallback;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  BREB: "Bre-B",
  OTHER: "Otro",
};

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: any) => `$${Math.round(toNum(v)).toLocaleString("es-CO")}`;

function StateChip({ state }: { state: RegisterState }) {
  const theme = useTheme();
  const map: Record<RegisterState, { bg: string; color: string }> = {
    COMPLETED: { bg: alpha(theme.palette.success.main, 0.14), color: theme.palette.success.main },
    PENDING: { bg: "rgba(59,130,246,0.14)", color: "#1D4ED8" },
    CANCELLED: { bg: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.dark },
  };
  const s = map[state];
  return (
    <Chip
      label={STATE_LABELS[state]}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 800, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
    />
  );
}

function PaymentChip({ pm }: { pm: PaymentMethod }) {
  return (
    <Chip
      label={PAYMENT_LABELS[pm] ?? pm}
      size="small"
      variant="outlined"
      sx={{ borderRadius: 2, fontWeight: 800, borderColor: "rgba(0,0,0,0.15)" }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Typography
      variant="caption"
      fontWeight={800}
      color={theme.palette.primary.main}
      sx={{ display: "block", mb: 1, letterSpacing: 0.5 }}
    >
      {children}
    </Typography>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.7 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ textAlign: "right", maxWidth: "60%" }}>{value}</Typography>
    </Box>
  );
}

export default function RegisterDetailModal({ open, onClose, register, isAdmin = false }: Props) {
  const theme = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!register) return null;

  const items: any[] = Array.isArray(register.items) ? register.items : [];
  const isIncome = register.type === "INCOME";
  const accentColor = isIncome ? theme.palette.success.main : theme.palette.error.dark;
  const accentBg = isIncome ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.error.main, 0.06);
  const canDownload = register.state === "COMPLETED";

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const url = isAdmin
        ? `/registers-web/admin/${register.id}/invoice?posId=${register.posId}`
        : `/registers-web/${register.id}/invoice`;
      const response = await api.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `factura-${register.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Defer revoke so the browser has time to read the URL before it's released
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 150);
    } catch (err) {
      setDownloadError(await extractErrorMessage(err, "Error al generar la factura"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, md: 4 },
          border: "1px solid rgba(0,0,0,0.07)",
          m: { xs: 1, md: 2 },
          overflow: "hidden",
        },
      }}
    >
      {/* ── Coloured header ──────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          bgcolor: accentBg,
          borderBottom: `1px solid rgba(0,0,0,0.07)`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: accentColor,
              display: "grid",
              placeItems: "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <ReceiptLongRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
              Registro #{register.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(register.createdAt).toLocaleString("es-CO", {
                timeZone: "America/Bogota",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Total badge */}
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>Total</Typography>
            <Typography variant="h5" fontWeight={950} sx={{ color: accentColor, lineHeight: 1.1 }}>
              {fmt(register.total)}
            </Typography>
          </Box>
          {canDownload && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.3 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleDownloadInvoice}
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <FileDownloadOutlinedIcon />}
                sx={{
                  borderRadius: 2, textTransform: "none", fontWeight: 700,
                  fontSize: "0.75rem", px: 1.5, py: 0.6, whiteSpace: "nowrap",
                  borderColor: downloadError ? theme.palette.error.main : "rgba(0,0,0,0.15)",
                  color: downloadError ? theme.palette.error.main : theme.palette.text.primary,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                {downloading ? "Generando..." : "Factura PDF"}
              </Button>
              {downloadError && (
                <Typography variant="caption" sx={{ color: theme.palette.error.main, fontSize: "0.65rem" }}>
                  {downloadError}
                </Typography>
              )}
            </Box>
          )}
          <IconButton onClick={onClose} size="small" sx={{ borderRadius: 2 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ pt: 2.5, pb: 3 }}>
        {/* ── Chips ─────────────────────────────────────────────────────── */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
          <Chip
            label={TYPE_LABELS[register.type]}
            size="small"
            sx={{
              fontWeight: 900,
              borderRadius: 2,
              bgcolor: isIncome ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.error.main, 0.15),
              color: accentColor,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          />
          <StateChip state={register.state} />
          <PaymentChip pm={register.paymentMethod} />
        </Stack>

        {/* ── Info grid ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              bgcolor: theme.palette.grey[50],
              borderRadius: 3,
              px: 2,
              py: 1.2,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <SectionLabel>DESCRIPCIÓN</SectionLabel>
            <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
              {register.description || "—"}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: theme.palette.grey[50],
              borderRadius: 3,
              px: 2,
              py: 1.2,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <SectionLabel>RESUMEN</SectionLabel>
            <InfoRow label="Subtotal" value={fmt(register.subtotal)} />
            <Divider sx={{ my: 0.3 }} />
            <InfoRow label="IVA" value={fmt(register.tax)} />
            <Divider sx={{ my: 0.3 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.5 }}>
              <Typography variant="body2" fontWeight={900}>Total</Typography>
              <Typography variant="body2" fontWeight={950} sx={{ color: accentColor, fontSize: "1rem" }}>
                {fmt(register.total)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Products table ────────────────────────────────────────────── */}
        {items.length > 0 && (
          <>
            <SectionLabel>PRODUCTOS ({items.length})</SectionLabel>

            <Box
              sx={{
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 3,
                overflow: "hidden",
                mb: 2,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 110px 110px",
                  gap: 1,
                  px: 2,
                  py: 1.2,
                  bgcolor: theme.palette.grey[50],
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {["Producto", "Cant.", "Precio c/u", "Total"].map((h) => (
                  <Typography key={h} variant="caption" fontWeight={700} color={theme.palette.text.secondary}
                    sx={{ textAlign: h !== "Producto" ? "right" : "left" }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              {/* Rows */}
              {items.map((it: any, idx: number) => {
                const name = it.product?.name || it.name || `Producto #${it.productId}`;
                const itemTotal = toNum(it.totalItem ?? it.total ?? 0);
                const unitPrice = it.quantity > 0 ? itemTotal / it.quantity : 0;

                return (
                  <Box
                    key={it.productId ?? idx}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 60px 110px 110px",
                      gap: 1,
                      px: 2,
                      py: 1.2,
                      alignItems: "center",
                      borderBottom: idx < items.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.015)" },
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                      {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="right">
                      {it.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="right">
                      {fmt(unitPrice)}
                    </Typography>
                    <Typography variant="body2" fontWeight={900} textAlign="right" sx={{ color: "#111827" }}>
                      {fmt(itemTotal)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* ── Image link ────────────────────────────────────────────────── */}
        {register.urlImage && (
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(11,95,255,0.04)",
              border: "1px solid rgba(11,95,255,0.12)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Imagen adjunta:{" "}
              <a
                href={register.urlImage}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.palette.primary.main, fontWeight: 700 }}
              >
                ver imagen →
              </a>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
