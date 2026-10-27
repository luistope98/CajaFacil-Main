"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";

import type {
  Register,
  RegisterItem,
  RegisterType,
  PaymentMethod,
  RegisterState,
  CreateRegisterDTO,
} from "../types/register.types";

import { productService } from "@/src/services/productService";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { InventoryProduct } from "@/app/user/products/types/product.types";
import { calcFinalUnitPrice, calcLineSubtotal, calcLineTotal } from "@/app/utils/tax";

interface Props {
  onSubmit: (dto: CreateRegisterDTO, editingId?: number) => void;
  onCancel: () => void;
  initialRegister?: Register | null;
  /** Override the posId used for loading products (admin use case) */
  overridePosId?: number;
  /** When true, uses the admin product endpoint */
  isAdmin?: boolean;

  onDraftChange?: (draft: {
    type: RegisterType;
    description: string;
    paymentMethod: PaymentMethod;
    state: RegisterState;
    urlImage: string;
    items: RegisterItem[];
  }) => void;
}

const REGISTER_TYPES: Array<{ value: RegisterType; label: string }> = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Egreso" },
];

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "NEQUI", label: "Nequi" },
  { value: "DAVIPLATA", label: "Daviplata" },
  { value: "BREB", label: "Bre-B" },
  { value: "OTHER", label: "Otro" },
];

const REGISTER_STATES: Array<{ value: RegisterState; label: string }> = [
  { value: "COMPLETED", label: "Completado" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CANCELLED", label: "Cancelado" },
];

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtCOP = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

/** Final price per unit (with tax) — for display only */
function finalUnitPrice(it: RegisterItem): number {
  return calcFinalUnitPrice(toNumber(it.price), toNumber(it.taxRate ?? 0));
}

export default function RegisterForm({
  onSubmit,
  onCancel,
  initialRegister,
  overridePosId,
  isAdmin = false,
  onDraftChange,
}: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();

  const [type, setType] = useState<RegisterType>(initialRegister?.type ?? "INCOME");
  const [description, setDescription] = useState<string>(initialRegister?.description ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialRegister?.paymentMethod ?? "CASH"
  );
  const [state, setState] = useState<RegisterState>(initialRegister?.state ?? "COMPLETED");
  const [urlImage, setUrlImage] = useState<string>(initialRegister?.urlImage ?? "");

  const [items, setItems] = useState<RegisterItem[]>(initialRegister?.items ?? []);
  // Manual total — only used when type === "EXPENSE"
  const [expenseTotal, setExpenseTotal] = useState<number>(
    initialRegister?.type === "EXPENSE" ? Math.round(toNumber(initialRegister?.total)) : 0
  );

  const [searchOptions, setSearchOptions] = useState<InventoryProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [qty, setQty] = useState<number>(1);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ─── Barcode scanner (keyboard-wedge) ─────────────────────────────────────
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastScanned, setLastScanned] = useState("");

  const userPosId = (user as any)?.posId as number | undefined;
  const effectivePosId = overridePosId ?? userPosId;

  const isExpense = type === "EXPENSE";

  // ─── Product search ────────────────────────────────────────────────────────
  const doSearch = async (q: string) => {
    if (!effectivePosId) return;
    setSearchLoading(true);
    try {
      const results = isAdmin
        ? await productService.searchProductsAdmin(effectivePosId, q)
        : await productService.searchProducts(q);
      setSearchOptions(results);
    } catch {
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInput = (_: React.SyntheticEvent, value: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => doSearch(value), 300);
  };

  // ─── Enrich item names when editing ───────────────────────────────────────
  useEffect(() => {
    if (!initialRegister?.items?.length || !effectivePosId) return;
    const ids = (initialRegister.items as any[])
      .map((it) => it.productId)
      .filter(Boolean) as number[];
    if (!ids.length) return;

    const enrich = async () => {
      try {
        const fetched = isAdmin
          ? await productService.searchProductsAdmin(effectivePosId, "", 100, ids)
          : await productService.searchProducts("", 100, ids);
        setItems((prev) =>
          prev.map((it) => {
            if (it.name) return it;
            const found = fetched.find((p) => p.id === it.productId);
            return found ? { ...it, name: found.name } : it;
          })
        );
      } catch {
        // names fall back to "Producto #ID"
      }
    };
    enrich();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Report draft to parent (for "discard changes" detection) ─────────────
  useEffect(() => {
    onDraftChange?.({ type, description, paymentMethod, state, urlImage, items });
  }, [type, description, paymentMethod, state, urlImage, items, onDraftChange]);

  // ─── Totals ────────────────────────────────────────────────────────────────
  // Mirror the backend logic exactly:
  //   lineSubtotal = round(price × qty)
  //   lineTax      = round(lineSubtotal × taxRate/100)
  //   lineTotal    = lineSubtotal + lineTax  (stored in it.totalItem)
  //
  // Summary:
  //   total    = sum(it.totalItem)             ← source of truth
  //   subtotal = sum(round(price × qty))       ← base without IVA
  //   tax      = total - subtotal              ← derived, always adds up
  const total = useMemo(() => {
    if (isExpense) return Math.round(toNumber(expenseTotal));
    return items.reduce((acc, it) => acc + toNumber(it.totalItem), 0);
  }, [isExpense, items, expenseTotal]);

  const subtotal = useMemo(() => {
    if (isExpense) return Math.round(toNumber(expenseTotal));
    return items.reduce((acc, it) => acc + calcLineSubtotal(toNumber(it.price), it.quantity), 0);
  }, [isExpense, items, expenseTotal]);

  const tax = useMemo(() => {
    if (isExpense) return 0;
    return total - subtotal;
  }, [isExpense, total, subtotal]);

  const addProductToItems = (product: InventoryProduct, quantity: number) => {
    const productId = Number(product.id);
    const name = product.name ?? `Producto #${productId}`;
    const basePrice = toNumber(product.price);
    const taxRatePct = toNumber(product.taxRate ?? 0);

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === productId);
      if (idx >= 0) {
        const copy = [...prev];
        const mergedQty = copy[idx].quantity + quantity;
        copy[idx] = {
          ...copy[idx],
          quantity: mergedQty,
          totalItem: calcLineTotal(toNumber(copy[idx].price), toNumber(copy[idx].taxRate ?? 0), mergedQty),
        };
        return copy;
      }
      return [
        ...prev,
        {
          productId,
          quantity,
          price: basePrice,
          taxRate: taxRatePct,
          totalItem: calcLineTotal(basePrice, taxRatePct, quantity),
          name,
        },
      ];
    });
  };

  const addItem = () => {
    if (!selectedProduct || qty <= 0) return;
    addProductToItems(selectedProduct, qty);
    setSelectedProduct(null);
    setQty(1);
  };

  const processScan = async (raw: string) => {
    const code = raw.trim();
    setBarcodeInput("");
    if (!code) return;

    if (!effectivePosId) {
      setScanError("No hay POS asignado.");
      return;
    }

    setScanLoading(true);
    setScanError("");
    try {
      const results = isAdmin
        ? await productService.searchProductsAdmin(effectivePosId, code)
        : await productService.searchProducts(code);
      const found = results.find((p) => p.skus?.some((s) => s.sku === code));

      if (!found) {
        setScanError(`No se encontró un producto con el código "${code}".`);
        return;
      }

      addProductToItems(found, 1);
      setLastScanned(found.name);
    } catch {
      setScanError("Error al buscar el producto escaneado.");
    } finally {
      setScanLoading(false);
      barcodeInputRef.current?.focus();
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    processScan(barcodeInput);
  };

  useEffect(() => {
    if (!isExpense) barcodeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lastScanned) return;
    const t = setTimeout(() => setLastScanned(""), 2000);
    return () => clearTimeout(t);
  }, [lastScanned]);

  const updateQty = (productId: number, newQty: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.productId !== productId) return it;
        const q = Math.max(1, Number(newQty || 1));
        return { ...it, quantity: q, totalItem: calcLineTotal(toNumber(it.price), toNumber(it.taxRate ?? 0), q) };
      })
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  // ─── Type change ───────────────────────────────────────────────────────────
  const handleTypeChange = (newType: RegisterType) => {
    setType(newType);
    if (newType === "EXPENSE") setItems([]); // EXPENSE has no product items
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const canSave = useMemo(() => {
    const hasDescription = description.trim().length > 0;
    if (isExpense) return hasDescription && expenseTotal > 0;
    return hasDescription && items.length > 0;
  }, [description, isExpense, items, expenseTotal]);

  const handleSubmit = () => {
    const dto: CreateRegisterDTO = {
      type,
      description: description.trim(),
      paymentMethod,
      state,
      urlImage: urlImage.trim() ? urlImage.trim() : null,
      subtotal,
      tax,
      total,
      ...(isExpense ? {} : {
        items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
      }),
    };
    onSubmit(dto, initialRegister?.id);
  };

  // PURCHASE registers have their own dedicated flow (line items with
  // purchase price/tax per product) that this form doesn't model — editing
  // one here would silently reinterpret it as INCOME/EXPENSE and corrupt it.
  if (initialRegister?.type === "PURCHASE") {
    return (
      <Stack spacing={2} mt={2} alignItems="flex-start">
        <Typography fontWeight={900}>Este registro es una compra de inventario</Typography>
        <Typography variant="body2" color="text.secondary">
          Las compras no se pueden editar desde este formulario. Si necesitas revertirla, anúlala
          desde la tabla de registros; si necesitas otra compra, usa el botón &quot;Registrar Compra&quot;.
        </Typography>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>Cerrar</Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} mt={2}>
      {/* ── Header fields ──────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        <TextField
          select label="Tipo" size="small" value={type}
          onChange={(e) => handleTypeChange(e.target.value as RegisterType)}
        >
          {REGISTER_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Método de pago" size="small" value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        >
          {PAYMENT_METHODS.map((pm) => (
            <MenuItem key={pm.value} value={pm.value}>{pm.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Estado" size="small" value={state}
          onChange={(e) => setState(e.target.value as RegisterState)}
        >
          {REGISTER_STATES.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TextField
        label="Descripción" size="small" value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <TextField
        label="URL Imagen (opcional)" size="small" value={urlImage}
        onChange={(e) => setUrlImage(e.target.value)}
      />

      <Divider />

      {/* ── EXPENSE: manual total input ──────────────────────────────────── */}
      {isExpense && (
        <TextField
          label="Monto del egreso *"
          type="number"
          size="small"
          value={expenseTotal || ""}
          onChange={(e) => setExpenseTotal(Math.max(0, Number(e.target.value)))}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
            htmlInput: { min: 0 },
          }}
          helperText="Ingresa el valor total del egreso en pesos"
        />
      )}

      {/* ── INCOME: product search + items list ─────────────────────────── */}
      {!isExpense && (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.8,
              p: 1.5,
              borderRadius: 3,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Typography variant="subtitle2" fontWeight={900} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <QrCodeScannerRoundedIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
              Escanear código de barras
            </Typography>
            <TextField
              inputRef={barcodeInputRef}
              size="small"
              fullWidth
              autoComplete="off"
              disabled={!effectivePosId}
              placeholder="Escanea el código o escríbelo y presiona Enter"
              value={barcodeInput}
              onChange={(e) => {
                setBarcodeInput(e.target.value);
                if (scanError) setScanError("");
              }}
              onKeyDown={handleBarcodeKeyDown}
              slotProps={{
                input: {
                  endAdornment: scanLoading ? <CircularProgress size={16} /> : null,
                },
              }}
            />
            {scanError && (
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.error.main }}>
                {scanError}
              </Typography>
            )}
            {lastScanned && !scanError && (
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.success.main }}>
                ✓ {lastScanned} agregado
              </Typography>
            )}
          </Box>

          <Typography fontWeight={900}>Agregar item manualmente</Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr auto", sm: "2fr 1fr auto" }, gap: 2, alignItems: "flex-start" }}>
            <Autocomplete
              size="small"
              options={searchOptions}
              value={selectedProduct}
              loading={searchLoading}
              disabled={!effectivePosId}
              filterOptions={(x) => x}
              getOptionLabel={(o) => { const sku = o.skus?.find(s => s.isDefault)?.sku ?? o.skus?.[0]?.sku; return `${o.name}${sku ? ` (${sku})` : ""}`; }}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              onInputChange={handleSearchInput}
              onChange={(_, val) => setSelectedProduct(val)}
              onOpen={() => { if (searchOptions.length === 0) doSearch(""); }}
              noOptionsText="Escribe para buscar productos"
              loadingText="Buscando..."
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar producto"
                  helperText={!effectivePosId ? "No hay POS asignado." : ""}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchLoading ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              renderOption={(props, o) => {
                const finalP = Math.round(toNumber(o.price) * (1 + toNumber(o.taxRate ?? 0) / 100));
                return (
                  <li {...props} key={o.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{o.name + " - " + o.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${finalP.toLocaleString("es-CO")}{(() => { const sku = o.skus?.find(s => s.isDefault)?.sku ?? o.skus?.[0]?.sku; return sku ? ` · ${sku}` : ""; })()}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
            />

            <TextField
              size="small" type="number" label="Cant."
              value={qty === 0 ? "" : qty}
              onChange={(e) => {
                const val = e.target.value;
                setQty(val === "" ? 0 : Number(val));
              }}
              onBlur={() => {
                if (qty < 1) setQty(1);
              }}
              slotProps={{ htmlInput: { min: 1 } }}
              sx={{ width: { xs: 80, sm: "auto" } }}
            />

            <Button
              variant="contained" onClick={addItem}
              disabled={!selectedProduct || qty <= 0}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 900, height: 40, gridColumn: { xs: "1 / -1", sm: "auto" } }}
            >
              Agregar
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.2, bgcolor: theme.palette.grey[50], display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" fontWeight={800} color={theme.palette.text.secondary}>Items</Typography>
              <Typography variant="body2" fontWeight={900}>{items.length} item(s)</Typography>
            </Box>

            <Box sx={{ px: 2, py: 1.5, display: "grid", gap: 1.2 }}>
              {items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Agrega al menos 1 item.</Typography>
              ) : (
                items.map((it) => (
                  <Box
                    key={it.productId}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr auto", md: "2fr 1fr 1fr auto" },
                      gap: 1.5,
                      alignItems: "center",
                      p: { xs: 1, md: 0 },
                      borderRadius: { xs: 2, md: 0 },
                      bgcolor: { xs: "rgba(0,0,0,0.02)", md: "transparent" },
                      border: { xs: "1px solid rgba(0,0,0,0.05)", md: "none" },
                    }}
                  >
                    {/* Name + mobile sub-row */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900} variant="body2">
                        {it.name ?? `Producto #${it.productId}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fmtCOP(finalUnitPrice(it))} c/u
                      </Typography>
                      <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1.5, mt: 0.8, alignItems: "center" }}>
                        <TextField
                          size="small" type="number" label="Cant."
                          value={it.quantity}
                          onChange={(e) => updateQty(it.productId, Number(e.target.value))}
                          slotProps={{ htmlInput: { min: 1 } }}
                          sx={{ width: 80 }}
                        />
                        <Typography variant="body2" fontWeight={900}>{fmtCOP(it.totalItem)}</Typography>
                      </Box>
                    </Box>

                    {/* Qty — desktop */}
                    <TextField
                      size="small" type="number" label="Cant."
                      value={it.quantity}
                      onChange={(e) => updateQty(it.productId, Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 1 } }}
                      sx={{ display: { xs: "none", md: "flex" } }}
                    />

                    {/* Total item — desktop */}
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <Typography variant="body2" fontWeight={900}>{fmtCOP(it.totalItem)}</Typography>
                      <Typography variant="caption" color="text.secondary">Total item</Typography>
                    </Box>

                    {/* Delete */}
                    <IconButton
                      size="small" onClick={() => removeItem(it.productId)}
                      sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, justifySelf: "end" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </>
      )}

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        <TextField label="Base gravable (sin IVA)" size="small" value={fmtCOP(subtotal)} slotProps={{ input: { readOnly: true } }} />
        <TextField label="IVA" size="small" value={fmtCOP(tax)} slotProps={{ input: { readOnly: true } }} />
        <TextField
          label="Total"
          size="small"
          value={fmtCOP(total)}
          slotProps={{ input: { readOnly: true } }}
          sx={{ "& .MuiInputBase-input": { fontWeight: 900 } }}
        />
      </Box>

      <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} justifyContent="flex-end">
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!canSave}
          onClick={handleSubmit}
          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 3 }}
        >
          Guardar
        </Button>
      </Stack>
    </Stack>
  );
}
