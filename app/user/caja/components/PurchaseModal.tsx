"use client";

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useRef, useState } from "react";
import { productService } from "@/src/services/productService";
import { registerService, type PurchaseItemDTO, type PaymentMethod } from "@/src/services/registerService";
import type { InventoryProduct } from "@/app/user/products/types/product.types";
import { calcLineSubtotal, calcLineTax, calcLineTotal } from "@/app/utils/tax";

type LineItem = {
  product: InventoryProduct;
  quantity: number;
  purchasePrice: number;
  taxRate: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  BREB: "Breb",
  OTHER: "Otro",
};

function toNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function PurchaseModal({ open, onClose, onSuccess }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Product search
  const [searchOptions, setSearchOptions] = useState<InventoryProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Line items
  const [items, setItems] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [qtyInput, setQtyInput] = useState("1");
  const [priceInput, setPriceInput] = useState("");
  const [taxInput, setTaxInput] = useState("0");

  // Register fields
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSearchInput = (_: any, value: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      if (!value.trim()) return;
      setSearchLoading(true);
      try {
        const results = await productService.searchProducts(value);
        setSearchOptions(results);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const qty = parseInt(qtyInput, 10);
    const price = parseFloat(priceInput);
    const tax = parseFloat(taxInput) || 0;

    if (isNaN(qty) || qty <= 0) { setError("La cantidad debe ser mayor a 0"); return; }
    if (isNaN(price) || price <= 0) { setError("El precio de compra debe ser mayor a 0"); return; }

    const exists = items.find(i => i.product.id === selectedProduct.id);
    if (exists) { setError("Este producto ya está en la lista"); return; }

    setItems(prev => [...prev, { product: selectedProduct, quantity: qty, purchasePrice: price, taxRate: tax }]);
    setSelectedProduct(null);
    setQtyInput("1");
    setPriceInput("");
    setTaxInput("0");
    setError("");
  };

  const handleRemoveItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const subtotal = items.reduce((s, i) => s + calcLineSubtotal(i.purchasePrice, i.quantity), 0);
  const tax = items.reduce((s, i) => s + calcLineTax(calcLineSubtotal(i.purchasePrice, i.quantity), i.taxRate), 0);
  const total = subtotal + tax;

  const handleSave = async () => {
    if (!description.trim()) { setError("Ingresa una descripción"); return; }
    if (items.length === 0) { setError("Agrega al menos un producto"); return; }

    setSaving(true);
    setError("");
    try {
      const purchaseItems: PurchaseItemDTO[] = items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        purchasePrice: i.purchasePrice,
        taxRate: i.taxRate,
      }));

      await registerService.create({
        type: "PURCHASE",
        description: description.trim(),
        paymentMethod,
        state: "COMPLETED",
        purchaseItems,
      });

      // Reset
      setItems([]);
      setDescription("");
      setPaymentMethod("CASH");
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al registrar la compra");
    } finally {
      setSaving(false);
    }
  };

  const defaultSku = (p: InventoryProduct) =>
    p.skus?.find(s => s.isDefault)?.sku ?? p.skus?.[0]?.sku ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: { xs: 3, md: 4 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Registrar Compra de Inventario
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Description + payment method */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Descripción *"
              size="small"
              fullWidth
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Compra de mercancía semana 20"
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Método de pago</InputLabel>
              <Select
                label="Método de pago"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(k => (
                  <MenuItem key={k} value={k}>{PAYMENT_LABELS[k]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Product search row */}
          <Typography variant="subtitle2" fontWeight={800}>Productos comprados</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr 1fr auto" }, gap: 1.5, alignItems: "flex-start" }}>
            <Autocomplete
              size="small"
              options={searchOptions}
              value={selectedProduct}
              loading={searchLoading}
              filterOptions={x => x}
              getOptionLabel={o => {
                const sku = defaultSku(o);
                return `${o.name}${sku ? ` (${sku})` : ""}`;
              }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              onInputChange={handleSearchInput}
              onChange={(_, val) => { setSelectedProduct(val); if (val) setPriceInput(""); }}
              noOptionsText="Escribe para buscar"
              loadingText="Buscando..."
              renderInput={params => (
                <TextField {...params} label="Buscar producto"
                  slotProps={{ input: { ...params.InputProps, endAdornment: (<>{searchLoading ? <CircularProgress size={14} /> : null}{params.InputProps.endAdornment}</>) } }}
                />
              )}
            />
            <TextField
              size="small" type="number" label="Cantidad"
              value={qtyInput}
              onChange={e => setQtyInput(e.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              size="small" type="number" label="Precio compra *"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
            />
            <TextField
              size="small" type="number" label="IVA (%)"
              value={taxInput}
              onChange={e => setTaxInput(e.target.value)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { min: 0, max: 100 } }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddItem}
              disabled={!selectedProduct}
              sx={{ height: 40, borderRadius: 2, textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
            >
              Agregar
            </Button>
          </Box>

          {/* Items table */}
          {items.length > 0 && (
            <TableContainer sx={{ borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { bgcolor: theme.palette.grey[50], fontWeight: 600, fontSize: 12 } }}>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">P. Compra</TableCell>
                    <TableCell align="right">IVA</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map(item => {
                    const itemTotal = calcLineTotal(item.purchasePrice, item.taxRate, item.quantity);
                    const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
                    return (
                      <TableRow key={item.product.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>{item.product.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{defaultSku(item.product) ?? item.product.ceco}</Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{fmt(item.purchasePrice)}</TableCell>
                        <TableCell align="right">{item.taxRate}%</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(itemTotal)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.product.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, pr: 1 }}>
              {[
                ["Subtotal", subtotal],
                ["IVA compra", tax],
              ].map(([label, value]) => (
                <Box key={label as string} sx={{ display: "flex", gap: 6, color: "text.secondary" }}>
                  <Typography variant="body2">{label}</Typography>
                  <Typography variant="body2">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(toNum(value))}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ width: 220, my: 0.5 }} />
              <Box sx={{ display: "flex", gap: 6 }}>
                <Typography variant="subtitle2" fontWeight={800}>Total</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="primary">
                  {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(total)}
                </Typography>
              </Box>
            </Box>
          )}

          {error && (
            <Typography variant="caption" color="error" fontWeight={600}>{error}</Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || items.length === 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ fontWeight: 700, px: 4, bgcolor: theme.palette.primary.main, "&:hover": { bgcolor: theme.palette.primary.dark } }}
        >
          {saving ? "Registrando..." : "Registrar Compra"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
