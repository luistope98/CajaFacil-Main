"use client";

import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useMemo, useState } from "react";

import type { Register, PaymentMethod, RegisterState, RegisterType } from "../types/register.types";

interface Props {
  registers: Register[];
  onView: (o: Register) => void;
  onEdit: (o: Register) => void;
  onDelete: (o: Register) => void;
}

function TypeChip({ type }: { type: RegisterType }) {
  const isIncome = type === "INCOME";
  return (
    <Chip
      label={isIncome ? "Ingreso" : "Egreso"}
      size="small"
      sx={{
        fontWeight: 900,
        borderRadius: 2,
        bgcolor: isIncome ? "rgba(34,197,94,0.15)" : "rgba(197,22,29,0.15)",
        color: isIncome ? "#15803D" : "#A11218",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    />
  );
}

function StateChip({ state }: { state: RegisterState }) {
  const styles =
    state === "COMPLETED"
      ? { bgcolor: "rgba(34,197,94,0.14)", color: "#15803D" }
      : state === "PENDING"
      ? { bgcolor: "rgba(59,130,246,0.14)", color: "#1D4ED8" }
      : { bgcolor: "rgba(197,22,29,0.12)", color: "#A11218" };

  const label =
    state === "COMPLETED" ? "Completado" : state === "PENDING" ? "Pendiente" : "Cancelado";

  return (
    <Chip
      label={label}
      size="small"
      sx={{ ...styles, fontWeight: 900, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
    />
  );
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

function PaymentChip({ pm }: { pm: PaymentMethod }) {
  return (
    <Chip
      label={PAYMENT_LABELS[pm] ?? pm}
      size="small"
      variant="outlined"
      sx={{ borderRadius: 2, fontWeight: 800 }}
    />
  );
}

export default function RegisterTable({ registers, onView, onEdit, onDelete }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registers.filter((o) => {
      const text = [
        o.id,
        o.type,
        o.paymentMethod,
        o.state,
        o.total,
        o.createdAt,
        o.description ?? "",
        `${o.items?.length ?? 0} items`,
      ]
        .map((x) => String(x).toLowerCase())
        .join(" ");
      return text.includes(q);
    });
  }, [registers, query]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, md: 5 },
        p: { xs: 1.5, md: 2.5 },
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por id, descripción, tipo, estado, método o total..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />,
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
        />
      </Box>

      {/* overflowX allows the table to scroll on narrow screens instead of breaking layout */}
      <TableContainer
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          overflowX: "auto",
        }}
      >
        <Table size="small" sx={{ minWidth: 420 }}>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "#F9FAFB", fontWeight: 700, color: "#6B7280" } }}>
              <TableCell>Registro</TableCell>
              {/* Tipo hidden on xs/sm — shown in mobile chips block instead */}
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Tipo</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Método</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Estado</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No hay registros para este período.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow
                  key={o.id}
                  hover
                  onDoubleClick={() => onView(o)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Typography fontWeight={900} variant="body2">
                      #{o.id}{o.description ? ` — ${o.description}` : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {new Date(o.createdAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                    </Typography>

                    {/* Mobile chips — hidden on md+ where dedicated columns appear */}
                    <Box sx={{ display: { xs: "flex", md: "none" }, gap: 0.8, mt: 0.8, flexWrap: "wrap" }}>
                      <TypeChip type={o.type} />
                      <PaymentChip pm={o.paymentMethod} />
                      <StateChip state={o.state} />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <TypeChip type={o.type} />
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <PaymentChip pm={o.paymentMethod} />
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <StateChip state={o.state} />
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      fontWeight={900}
                      variant="body2"
                      sx={{ color: o.type === "INCOME" ? "#15803D" : "#A11218", whiteSpace: "nowrap" }}
                    >
                      ${Math.round(Number(o.total)).toLocaleString("es-CO")}
                    </Typography>
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton size="small" onClick={() => onView(o)} sx={{ mr: 0.5, color: "#6B7280" }}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onEdit(o)} sx={{ mr: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(o)} color="error">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
