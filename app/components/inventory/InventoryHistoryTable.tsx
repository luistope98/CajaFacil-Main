"use client";

import {
  Box, Chip, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import type { InventoryMovement, InventoryType } from "@/app/user/inventario/types/inventory.types";

type Props = {
  movements: InventoryMovement[];
  totalCount: number;
};

const TYPE_CONFIG: Record<InventoryType, { label: string; color: string; bg: string }> = {
  IN: { label: "Entrada", color: "#059669", bg: "rgba(16,185,129,0.10)" },
  OUT: { label: "Salida", color: "#dc2626", bg: "rgba(239,68,68,0.10)" },
  RETURN: { label: "Devolución", color: "#2563eb", bg: "rgba(37,99,235,0.10)" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default function InventoryHistoryTable({ movements, totalCount }: Props) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <Typography fontWeight={700} fontSize="0.95rem">
          Historial de movimientos
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {totalCount} registro{totalCount !== 1 ? "s" : ""}
          </Typography>
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              <TableCell sx={styles.th}>Fecha</TableCell>
              <TableCell sx={styles.th}>Producto</TableCell>
              <TableCell sx={styles.th}>Tipo</TableCell>
              <TableCell sx={{ ...styles.th, textAlign: "center" }}>Cantidad</TableCell>
              <TableCell sx={styles.th}>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                  No hay movimientos en este período
                </TableCell>
              </TableRow>
            ) : (
              movements.map((m) => {
                const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.OUT;
                return (
                  <TableRow key={m.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(m.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} fontSize="0.875rem">{m.product.name}</Typography>
                      {m.product.skus?.[0]?.sku && (
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {m.product.skus[0].sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: "0.75rem", borderRadius: 1.5,
                          color: cfg.color, bgcolor: cfg.bg,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography fontWeight={700} fontSize="0.875rem">{m.quantity}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260, display: "block" }}>
                        {m.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

const styles = {
  th: {
    fontWeight: 700,
    fontSize: "0.75rem",
    color: "text.secondary",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    py: 1.5,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
};
