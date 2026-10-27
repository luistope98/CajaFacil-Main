"use client";

import {
  Box,
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { InventoryProduct } from "../../user/products/types/product.types";

type Props = {
  title: string;
  products: InventoryProduct[];
  onEdit?: (p: InventoryProduct) => void;
  onDelete?: (p: InventoryProduct) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
};

export default function ProductsTable({
  title,
  products,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
  totalCount,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const defaultSku = (p: InventoryProduct) =>
    p.skus?.find((s) => s.isDefault)?.sku ?? p.skus?.[0]?.sku ?? null;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: { xs: 1.5, sm: 2.5 },
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "white",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box>
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} productos encontrados
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Buscar producto..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: { md: 320 } }}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />,
            sx: { borderRadius: 3 },
          }}
        />
      </Box>

      <TableContainer sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "#F9FAFB", fontWeight: 600, fontSize: 12 } }}>
              <TableCell>SKU / CECO</TableCell>
              <TableCell>Nombre / Descripción</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {defaultSku(p) ?? "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.ceco}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.description}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 800,
                      bgcolor: p.stock <= 5 ? "error.light" : "primary.light",
                      color: p.stock <= 5 ? "error.main" : "white",
                    }}
                  >
                    {p.stock}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(
                    Math.round(Number(p.price ?? 0) * (1 + (p.taxRate ?? 0) / 100))
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => onEdit?.(p)} size="small" sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => onDelete?.(p)} size="small" color="error">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
