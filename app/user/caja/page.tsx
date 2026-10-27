"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Snackbar,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";

import RegisterStats from "../register/components/RegisterStats";
import RegisterTable from "../register/components/RegisterTable";
import RegisterModal from "../register/components/RegisterModal";
import RegisterDetailModal from "../register/components/RegisterDetailModal";
import PurchaseModal from "./components/PurchaseModal";

import type { Register, CreateRegisterDTO } from "../register/types/register.types";
import { registerService, type RegisterRangeSummary } from "@/src/services/registerService";

const EMPTY_SUMMARY: RegisterRangeSummary = { totalIncome: 0, totalExpense: 0, net: 0, itemsSold: 0 };

interface ApiError {
  response?: { data?: { message?: string | string[] } };
}

type Toast = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

// Colombia is UTC-5 with no DST. Subtract 5 h from UTC to get the local date,
// so date pickers and range defaults are correct regardless of browser timezone.
const COLOMBIA_OFFSET_MS = 5 * 60 * 60 * 1000;
function toColombiaDateString(d: Date): string {
  return new Date(d.getTime() - COLOMBIA_OFFSET_MS).toISOString().slice(0, 10);
}

const PAGE_SIZE = 20;

export default function CajaPage() {
  const theme = useTheme();
  const today = toColombiaDateString(new Date());
  const weekAgo = toColombiaDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [dateError, setDateError] = useState<string | null>(null);

  const [registers, setRegisters] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState<RegisterRangeSummary>(EMPTY_SUMMARY);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Register | null>(null);
  const [viewing, setViewing] = useState<Register | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const [toast, setToast] = useState<Toast>({ open: false, message: "", severity: "success" });
  const showToast = (message: string, severity: Toast["severity"] = "success") =>
    setToast({ open: true, message, severity });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Register | null>(null);
  const [deleting, setDeleting] = useState(false);

  function validateDates(start: string, end: string): string | null {
    if (!start || !end) return "Ambas fechas son requeridas.";
    if (start > today || end > today) return "No se pueden seleccionar fechas futuras.";
    if (start > end) return "La fecha de inicio debe ser menor o igual a la fecha fin.";
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 365) return "El rango máximo permitido es 1 año.";
    return null;
  }

  const load = async (start: string, end: string, p: number) => {
    const err = validateDates(start, end);
    if (err) { setDateError(err); return; }
    setDateError(null);
    try {
      setLoading(true);
      const res = await registerService.findByDateRange(start, end, p, PAGE_SIZE);
      setRegisters(res.data);
      setTotalPages(res.pages);
      setTotalRecords(res.total);
      setSummary(res.summary);
    } catch {
      setRegisters([]);
      setSummary(EMPTY_SUMMARY);
      showToast("No se pudieron cargar los registros.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(startDate, endDate, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    load(startDate, endDate, 1);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await load(startDate, endDate, page);
      showToast("Datos actualizados.", "info");
    } finally {
      setRefreshing(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    load(startDate, endDate, value);
  };

  const handleStartDate = (val: string) => {
    setStartDate(val);
    setDateError(validateDates(val, endDate));
  };

  const handleEndDate = (val: string) => {
    setEndDate(val);
    setDateError(validateDates(startDate, val));
  };

  const handleSubmit = async (dto: CreateRegisterDTO, editingId?: number) => {
    try {
      if (editingId) {
        await registerService.update(editingId, dto);
        showToast("Registro actualizado ✅", "success");
      } else {
        await registerService.create(dto);
        showToast("Registro creado ✅", "success");
      }
      setOpen(false);
      setEditing(null);
      await load(startDate, endDate, page);
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.response?.data?.message || "Error al guardar el registro";
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    }
  };

  const requestDelete = (r: Register) => {
    setDeleteTarget(r);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await registerService.remove(deleteTarget.id);
      showToast("Registro eliminado ✅", "success");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await load(startDate, endDate, page);
    } catch {
      showToast("No se pudo eliminar el registro.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ pt: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: "1.8rem", md: "2.125rem" } }}>
            Caja
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, mt: 0.4 }}>
            Registros por rango de fechas.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="outlined"
            startIcon={<ShoppingCartRoundedIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 900,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              width: { xs: "100%", sm: "auto" },
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06), borderColor: theme.palette.primary.dark },
            }}
            onClick={() => setPurchaseOpen(true)}
          >
            Registrar Compra
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 900,
              bgcolor: theme.palette.primary.main,
              boxShadow: "none",
              width: { xs: "100%", sm: "auto" },
              "&:hover": { bgcolor: theme.palette.primary.dark, boxShadow: "none" },
            }}
            onClick={() => { setEditing(null); setOpen(true); }}
          >
            Nuevo
          </Button>
        </Stack>
      </Stack>

      {/* Date range filters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr auto" },
          gap: 1.5,
          mb: 3,
          p: 2,
          borderRadius: 4,
          border: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "white",
          alignItems: "flex-start",
        }}
      >
        <TextField
          type="date"
          size="small"
          label="Desde"
          value={startDate}
          onChange={(e) => handleStartDate(e.target.value)}
          inputProps={{ max: today }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          type="date"
          size="small"
          label="Hasta"
          value={endDate}
          onChange={(e) => handleEndDate(e.target.value)}
          inputProps={{ max: today }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Stack
          direction="row"
          spacing={1}
          sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
        >
          <Button
            variant="outlined"
            onClick={handleSearch}
            disabled={!!dateError}
            fullWidth
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "rgba(0,0,0,0.12)",
              color: "#111827",
              bgcolor: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.2)" },
            }}
          >
            Buscar
          </Button>

          <Tooltip title={refreshing ? "Actualizando..." : "Actualizar"} arrow>
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing || loading || !!dateError}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.10)",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  color: theme.palette.primary.main,
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                  "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                }}
              >
                <RefreshRoundedIcon sx={{ animation: refreshing ? "spin 0.9s linear infinite" : "none" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {dateError && (
          <Typography variant="caption" sx={{ color: theme.palette.error.main, gridColumn: "1 / -1" }}>
            {dateError}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <>
          <RegisterStats totalRegisters={totalRecords} summary={summary} />
          <RegisterTable
            registers={registers}
            onView={(o) => setViewing(o)}
            onEdit={(o) => { setEditing(o); setOpen(true); }}
            onDelete={requestDelete}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: { md: "space-between" },
              alignItems: "center",
              mt: 2,
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {totalRecords} registro{totalRecords !== 1 ? "s" : ""} encontrado{totalRecords !== 1 ? "s" : ""}
            </Typography>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="small"
                siblingCount={0}
              />
            )}
          </Box>
        </>
      )}

      <RegisterDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        register={viewing}
      />

      <RegisterModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialRegister={editing}
      />

      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onSuccess={async () => {
          showToast("Compra registrada ✅", "success");
          await load(startDate, endDate, page);
        }}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => (deleting ? null : setDeleteDialogOpen(false))}
        PaperProps={{ sx: { borderRadius: 4, p: 0.5, border: "1px solid rgba(0,0,0,0.06)" } }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Confirmar eliminación</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            ¿Seguro que deseas eliminar el registro <b>#{deleteTarget?.id}</b>?
          </Typography>
          <Box sx={{ mt: 2, p: 1.4, borderRadius: 3, bgcolor: "rgba(197,22,29,0.06)", border: "1px solid rgba(197,22,29,0.18)" }}>
            <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.error.dark }}>
              Esta acción no se puede deshacer.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1.2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 900, borderRadius: 3 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={deleting}
            variant="contained"
            startIcon={deleting ? <CircularProgress size={16} sx={{ color: "white" }} /> : <DeleteRoundedIcon />}
            sx={{ textTransform: "none", fontWeight: 900, borderRadius: 3, bgcolor: theme.palette.error.main, boxShadow: "none", "&:hover": { bgcolor: theme.palette.error.dark, boxShadow: "none" } }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 800 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
