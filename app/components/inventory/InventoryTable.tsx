"use client";

import {
  Box, Chip, IconButton, InputAdornment, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import type { StockItem } from "@/app/user/inventario/types/inventory.types";

type Props = {
  items: StockItem[];
  minStock?: number | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAdjust: (item: StockItem) => void;
  totalCount: number;
};

export default function InventoryTable({ items, minStock, searchQuery, onSearchChange, onAdjust, totalCount }: Props) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
      {/* Table toolbar */}
      <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <Typography fontWeight={700} fontSize="0.95rem">
          Stock actual
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {totalCount} producto{totalCount !== 1 ? "s" : ""}
          </Typography>
        </Typography>
        <TextField
          size="small"
          placeholder="Buscar producto o SKU..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: { xs: "100%", sm: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              <TableCell sx={styles.th}>Producto</TableCell>
              <TableCell sx={styles.th}>SKU</TableCell>
              <TableCell sx={{ ...styles.th, textAlign: "center" }}>Stock</TableCell>
              <TableCell sx={{ ...styles.th, textAlign: "right" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isLow = minStock != null && item.stock <= minStock;
                return (
                  <TableRow key={item.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Typography fontWeight={600} fontSize="0.875rem">{item.name}</Typography>
                      {item.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260, display: "block" }}>
                          {item.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {item.skus?.[0]?.sku ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        <Chip
                          label={item.stock}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: isLow ? "rgba(239,68,68,0.10)" : "rgba(16,185,129,0.10)",
                            color: isLow ? "#dc2626" : "#059669",
                            borderRadius: 1.5,
                            fontSize: "0.8rem",
                          }}
                        />
                        {isLow && (
                          <Tooltip title="Stock bajo">
                            <WarningAmberRoundedIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Tooltip title="Ajustar stock">
                        <IconButton size="small" onClick={() => onAdjust(item)} sx={{ color: "#0B5FFF" }}>
                          <TuneRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
