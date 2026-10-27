"use client";

import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField,
  useMediaQuery, useTheme, IconButton, InputAdornment, Typography, Chip, Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useState } from "react";
import { InventoryProduct, ProductCategory, ProductSku } from "../../user/products/types/product.types";
import CategoryIcon from "./CategoryIcon";
import { productService } from "@/src/services/productService";
import { calcFinalUnitPrice } from "@/app/utils/tax";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  defaultCategoryId: number | undefined;
  categories: ProductCategory[];
  initialProduct?: InventoryProduct | null;
  /** Pass true + adminPosId when used inside the admin panel */
  isAdmin?: boolean;
  adminPosId?: number;
};

type NewSkuForm = { sku: string; notes: string };

export default function ProductModal({ open, onClose, onSave, defaultCategoryId, categories, initialProduct, isAdmin, adminPosId }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState({
    name: "", description: "", ceco: "",
    categoryId: defaultCategoryId,
    newStock: "0",
    adjustReason: "",
    subtotal: "0",
    tax: "0",
    netValue: "0",
    ico: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // SKU state
  const [skus, setSkus] = useState<ProductSku[]>([]);
  const [newSkuForm, setNewSkuForm] = useState<NewSkuForm>({ sku: "", notes: "" });
  const [skuError, setSkuError] = useState("");
  const [skuLoading, setSkuLoading] = useState(false);

  // For new products (not yet saved): queue SKUs to create after product is created
  const [pendingSkus, setPendingSkus] = useState<NewSkuForm[]>([]);

  const isEditing = Boolean(initialProduct);
  const originalStock = initialProduct?.stock ?? 0;
  const newStockNum = parseInt(form.newStock, 10);
  const stockDelta = isNaN(newStockNum) ? 0 : newStockNum - originalStock;
  const stockChanged = !isNaN(newStockNum) && newStockNum !== originalStock;

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setNewSkuForm({ sku: "", notes: "" });
    setSkuError("");
    setPendingSkus([]);

    if (initialProduct) {
      const basePrice = Math.round(Number(initialProduct.price ?? 0));
      const taxRate = initialProduct.taxRate ?? 0;
      const priceWithTax = calcFinalUnitPrice(basePrice, taxRate);
      setForm({
        name: initialProduct.name,
        description: initialProduct.description || "",
        ceco: initialProduct.ceco || "",
        categoryId: initialProduct.categoryId,
        newStock: String(initialProduct.stock),
        adjustReason: "",
        subtotal: String(priceWithTax),
        tax: String(taxRate),
        netValue: String(basePrice),
        ico: initialProduct.icoTaxAmount != null ? String(initialProduct.icoTaxAmount) : "",
      });
      setSkus(initialProduct.skus ?? []);
    } else {
      setForm({ name: "", description: "", ceco: "", categoryId: defaultCategoryId, newStock: "0", adjustReason: "", subtotal: "0", tax: "0", netValue: "0", ico: "" });
      setSkus([]);
    }
  }, [open, initialProduct, defaultCategoryId]);

  useEffect(() => {
    const net = parseFloat(form.netValue) || 0;
    const taxPct = parseFloat(form.tax) || 0;
    setForm(prev => ({ ...prev, subtotal: String(calcFinalUnitPrice(net, taxPct)) }));
  }, [form.netValue, form.tax]);

  const handleChange = (field: keyof typeof form) => (e: any) => {
    let value = e.target.value;
    if (field === "tax") {
      if (value !== "" && Number(value) < 0) value = "0";
      if (value !== "" && Number(value) > 100) value = "100";
    }
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const net = parseFloat(e.target.value) || 0;
    const taxPct = parseFloat(form.tax) || 0;
    setForm(prev => ({ ...prev, netValue: e.target.value, subtotal: String(calcFinalUnitPrice(net, taxPct)) }));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let taxPct = e.target.value;
    if (taxPct !== "" && Number(taxPct) < 0) taxPct = "0";
    if (taxPct !== "" && Number(taxPct) > 100) taxPct = "100";
    const net = parseFloat(form.netValue) || 0;
    setForm(prev => ({ ...prev, tax: taxPct, subtotal: String(calcFinalUnitPrice(net, parseFloat(taxPct) || 0)) }));
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const total = parseFloat(e.target.value) || 0;
    const taxPct = parseFloat(form.tax) || 0;
    setForm(prev => ({ ...prev, subtotal: e.target.value, netValue: String(Math.round(total / (1 + taxPct / 100))) }));
  };

  // ── SKU handlers ─────────────────────────────────────────────────────────────

  const handleAddSku = async () => {
    const sku = newSkuForm.sku.trim();
    if (!sku) { setSkuError("El SKU no puede estar vacío"); return; }

    if (isEditing && initialProduct) {
      // Product already exists → call API immediately
      setSkuLoading(true);
      try {
        const isFirst = skus.length === 0;
        const dto = { sku, notes: newSkuForm.notes.trim() || undefined, isDefault: isFirst };
        const created = isAdmin && adminPosId
          ? await productService.addSkuAdmin(initialProduct.id, adminPosId, dto)
          : await productService.addSku(initialProduct.id, dto);
        setSkus(prev => [...prev, created]);
        setNewSkuForm({ sku: "", notes: "" });
        setSkuError("");
      } catch {
        setSkuError("Error al agregar el SKU. Puede que ya exista.");
      } finally {
        setSkuLoading(false);
      }
    } else {
      // New product → queue for after creation
      const duplicate = pendingSkus.some(s => s.sku === sku);
      if (duplicate) { setSkuError("Ya agregaste ese SKU"); return; }
      setPendingSkus(prev => [...prev, { sku, notes: newSkuForm.notes.trim() }]);
      setNewSkuForm({ sku: "", notes: "" });
      setSkuError("");
    }
  };

  const handleRemoveSku = async (skuItem: ProductSku) => {
    if (isEditing && initialProduct) {
      try {
        if (isAdmin && adminPosId) {
          await productService.removeSkuAdmin(initialProduct.id, skuItem.id, adminPosId);
        } else {
          await productService.removeSku(initialProduct.id, skuItem.id);
        }
        setSkus(prev => prev.filter(s => s.id !== skuItem.id));
      } catch { /* silently ignore */ }
    }
  };

  const handleSetDefault = async (skuItem: ProductSku) => {
    if (!isEditing || !initialProduct || skuItem.isDefault) return;
    try {
      if (isAdmin && adminPosId) {
        await productService.updateSkuAdmin(initialProduct.id, skuItem.id, adminPosId, { isDefault: true });
      } else {
        await productService.updateSku(initialProduct.id, skuItem.id, { isDefault: true });
      }
      setSkus(prev => prev.map(s => ({ ...s, isDefault: s.id === skuItem.id })));
    } catch { /* silently ignore */ }
  };

  const handleRemovePending = (sku: string) => {
    setPendingSkus(prev => prev.filter(s => s.sku !== sku));
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const taxNum = parseFloat(form.tax);
  const stockNum = parseInt(form.newStock, 10);

  const icoNum = parseFloat(form.ico);

  const errors: Record<string, string> = {
    name: !form.name.trim() ? "El nombre del producto es obligatorio" : "",
    categoryId: !form.categoryId ? "Debes seleccionar una categoría" : "",
    tax: isNaN(taxNum) || taxNum < 0 || taxNum > 100 ? "El IVA debe ser un número entre 0 y 100" : "",
    netValue: isNaN(parseFloat(form.netValue)) || parseFloat(form.netValue) < 0
      ? "El precio debe ser un número válido mayor o igual a 0" : "",
    ico: form.ico.trim() && (isNaN(icoNum) || icoNum < 0)
      ? "El ICO debe ser un número válido mayor o igual a 0" : "",
    ...(!initialProduct
      ? { newStock: isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum) ? "El stock debe ser un número entero positivo" : "" }
      : {}),
    adjustReason: stockChanged && !form.adjustReason.trim() ? "Debes ingresar el motivo del ajuste de stock" : "",
  };

  const isValid = Object.values(errors).every(e => !e);
  const showErr = (field: string) => Boolean(touched[field] && errors[field]);
  const errMsg  = (field: string) => (touched[field] && errors[field]) || "";

  const handleSaveClick = () => {
    setTouched({ name: true, categoryId: true, tax: true, netValue: true, newStock: true, adjustReason: true, ico: true });
    if (!isValid) return;

    const productData: any = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      ceco: form.ceco.trim() || undefined,
      price: Number(form.netValue),
      taxRate: Number(form.tax),
      icoTaxAmount: form.ico.trim() ? Number(form.ico) : null,
      categoryId: Number(form.categoryId),
    };

    if (initialProduct) {
      if (stockChanged) {
        productData._stockAdjustment = {
          quantity: stockDelta,
          description: form.adjustReason.trim() || "Ajuste manual de stock",
        };
      }
    } else {
      productData.stock = stockNum;
      // Pass first pending SKU as the initial sku (backend creates it as default)
      if (pendingSkus.length > 0) {
        productData.sku = pendingSkus[0].sku;
        productData._extraSkus = pendingSkus.slice(1);
      }
    }

    onSave(productData);
  };

  // ── SKU list shared renderer ──────────────────────────────────────────────────
  const SkuList = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Existing SKUs (editing) */}
      {skus.map((s) => (
        <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2, bgcolor: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)" }}>
          <IconButton size="small" onClick={() => handleSetDefault(s)} title={s.isDefault ? "SKU principal" : "Marcar como principal"} sx={{ color: s.isDefault ? "warning.main" : "action.disabled" }}>
            {s.isDefault ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>{s.sku}</Typography>
            {s.notes && <Typography variant="caption" color="text.secondary" noWrap>{s.notes}</Typography>}
          </Box>
          {s.isDefault && <Chip label="Principal" size="small" color="warning" variant="outlined" sx={{ fontSize: 10, height: 20 }} />}
          <IconButton size="small" color="error" onClick={() => handleRemoveSku(s)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {/* Pending SKUs (creating) */}
      {pendingSkus.map((s) => (
        <Box key={s.sku} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2, bgcolor: "rgba(11,95,255,0.04)", border: "1px dashed rgba(11,95,255,0.3)" }}>
          <StarIcon fontSize="small" sx={{ color: pendingSkus[0].sku === s.sku ? "warning.main" : "action.disabled" }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>{s.sku}</Typography>
            {s.notes && <Typography variant="caption" color="text.secondary" noWrap>{s.notes}</Typography>}
          </Box>
          {pendingSkus[0].sku === s.sku && <Chip label="Principal" size="small" color="warning" variant="outlined" sx={{ fontSize: 10, height: 20 }} />}
          <IconButton size="small" color="error" onClick={() => handleRemovePending(s.sku)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}
      PaperProps={{ sx: { m: { xs: 1, md: 2 }, borderRadius: { xs: 3, md: 4 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {initialProduct ? "Editar Producto" : "Nuevo Producto"}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2.5, mt: 1, gridTemplateColumns: "1fr 1fr" }}>

          <TextField label="Nombre del Producto *" fullWidth size="small" sx={{ gridColumn: "span 2" }}
            value={form.name} onChange={handleChange("name")} error={showErr("name")} helperText={errMsg("name")} />

          <TextField label="Descripción (opcional)" fullWidth multiline rows={2} size="small" sx={{ gridColumn: "span 2" }}
            value={form.description} onChange={handleChange("description")} />

          <FormControl size="small" fullWidth sx={{ gridColumn: "span 2" }} error={showErr("categoryId")}>
            <InputLabel>Categoría *</InputLabel>
            <Select label="Categoría *" value={form.categoryId || ""} onChange={handleChange("categoryId")}>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CategoryIcon name={c.name} sx={{ fontSize: 18 }} /> {c.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {showErr("categoryId") && <FormHelperText>{errMsg("categoryId")}</FormHelperText>}
          </FormControl>

          {/* CECO */}
          <TextField label="CECO (opcional)" size="small" sx={{ gridColumn: "span 2" }}
            value={form.ceco} onChange={handleChange("ceco")} />

          {/* Stock section */}
          {initialProduct ? (
            <Box sx={{ gridColumn: "span 2", p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">STOCK ACTUAL</Typography>
                <Chip label={originalStock} size="small" sx={{ fontWeight: 800, bgcolor: "white", border: "1px solid rgba(0,0,0,0.12)" }} />
              </Box>
              <TextField label="Nuevo Stock" type="number" size="small" fullWidth
                value={form.newStock} onChange={handleChange("newStock")} slotProps={{ htmlInput: { min: 0 } }} />
              {stockChanged && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color={stockDelta > 0 ? "success.main" : "error.main"} fontWeight={700} sx={{ display: "block", mb: 1 }}>
                    {stockDelta > 0 ? `+${stockDelta}` : stockDelta} unidades — ajuste de inventario
                  </Typography>
                  <TextField label="Motivo del ajuste *" size="small" fullWidth
                    value={form.adjustReason} onChange={handleChange("adjustReason")}
                    error={showErr("adjustReason")} helperText={errMsg("adjustReason")}
                    placeholder="Ej: Reconteo físico, devolución, daño..." />
                </Box>
              )}
            </Box>
          ) : (
            <TextField label="Stock Inicial *" type="number" size="small"
              value={form.newStock} onChange={handleChange("newStock")}
              error={showErr("newStock")} helperText={errMsg("newStock") || "Usa 0 si aún no tienes existencias"}
              slotProps={{ htmlInput: { min: 0 } }} />
          )}

          {/* IVA */}
          <TextField label="IVA (%)" type="number" size="small"
            value={form.tax} onChange={handleTaxChange}
            error={showErr("tax")} helperText={errMsg("tax") || "Ej: 19. Usa 0 si no aplica"}
            slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { min: 0, max: 100 } }} />

          <TextField label="Precio sin IVA *" type="number" size="small"
            value={form.netValue} onChange={handleNetChange}
            error={showErr("netValue")} helperText={errMsg("netValue")}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />

          <TextField label="Precio con IVA (calculado)" size="small" onChange={handleTotalChange}
            value={form.subtotal} sx={{ gridColumn: "span 2" }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} />

          <TextField label="ICO (opcional)" type="number" size="small" sx={{ gridColumn: "span 2" }}
            value={form.ico} onChange={handleChange("ico")}
            error={showErr("ico")}
            helperText={errMsg("ico") || "Impuesto al consumo (Colombia): valor fijo en pesos por unidad. Déjalo vacío si no aplica."}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { min: 0 } }} />

          {/* ── SKU section ─────────────────────────────────────────────────── */}
          <Box sx={{ gridColumn: "span 2" }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
              Códigos SKU
            </Typography>

            {(skus.length > 0 || pendingSkus.length > 0) && (
              <Box sx={{ mb: 1.5 }}><SkuList /></Box>
            )}

            {/* Add SKU inline form */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <TextField
                  size="small" placeholder="SKU / Código *"
                  value={newSkuForm.sku}
                  onChange={(e) => { setNewSkuForm(prev => ({ ...prev, sku: e.target.value })); setSkuError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSku(); } }}
                  error={Boolean(skuError)}
                  helperText={skuError || ""}
                />
                <TextField
                  size="small" placeholder="Notas (opcional) — ej: Edición especial navidad"
                  value={newSkuForm.notes}
                  onChange={(e) => setNewSkuForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Box>
              <Button
                variant="outlined" size="small"
                startIcon={<AddIcon />}
                onClick={handleAddSku}
                disabled={skuLoading}
                sx={{ height: 40, mt: 0.3, borderRadius: 2, textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Agregar
              </Button>
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button variant="contained" onClick={handleSaveClick} sx={{ fontWeight: 700, px: 4 }}>
          {initialProduct ? "Actualizar" : "Crear Producto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
