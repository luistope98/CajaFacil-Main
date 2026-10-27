"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Box, CircularProgress, InputAdornment, MenuItem,
  Pagination, Paper, Snackbar, Tab, Tabs, TextField, Typography,
} from "@mui/material";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import InventoryTable from "@/app/components/inventory/InventoryTable";
import InventoryHistoryTable from "@/app/components/inventory/InventoryHistoryTable";
import StockAdjustmentModal from "@/app/components/inventory/StockAdjustmentModal";

import { inventoryService } from "@/src/services/inventoryService";
import { posService } from "@/src/services/posService";
import type { Pos } from "@/app/user/admin/pos/types/pos.types";
import type { InventoryMovement, StockItem } from "@/app/user/inventario/types/inventory.types";

const PAGE_SIZE = 20;

export default function AdminInventarioPage() {
  const [allPos, setAllPos] = useState<Pos[]>([]);
  const [selectedPosId, setSelectedPosId] = useState<number | undefined>();
  const [loadingPos, setLoadingPos] = useState(true);
  const [tab, setTab] = useState(0);

  // Stock tab
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [stockPages, setStockPages] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [stockSearch, setStockSearch] = useState("");
  const [loadingStock, setLoadingStock] = useState(false);
  const stockDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // History tab
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPages, setHistPages] = useState(1);
  const [histPage, setHistPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Adjustment modal
  const [adjustItem, setAdjustItem] = useState<StockItem | null>(null);

  const [notification, setNotification] = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });
  const showNotify = (message: string, severity: "success" | "error") =>
    setNotification({ open: true, message, severity });

  useEffect(() => {
    posService.getPos()
      .then(setAllPos)
      .catch(() => {})
      .finally(() => setLoadingPos(false));
  }, []);

  const loadStock = useCallback(async (posId: number, page: number, search?: string) => {
    setLoadingStock(true);
    try {
      const res = await inventoryService.getStockAdmin(posId, page, PAGE_SIZE, search);
      setStockItems(res.data);
      setStockTotal(res.total);
      setStockPages(res.pages);
    } catch {
      // load failed silently
    } finally {
      setLoadingStock(false);
    }
  }, []);

  const loadHistory = useCallback(async (posId: number, page: number) => {
    setLoadingHistory(true);
    try {
      const res = await inventoryService.getHistoryAdmin(posId, page, PAGE_SIZE);
      setMovements(res.data);
      setHistTotal(res.total);
      setHistPages(res.pages);
    } catch {
      // load failed silently
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const handlePosChange = (posId: number) => {
    setSelectedPosId(posId);
    setStockPage(1);
    setHistPage(1);
    setStockSearch("");
    setMovements([]);
    setTab(0);
    loadStock(posId, 1);
  };

  const handleTabChange = (_: React.SyntheticEvent, val: number) => {
    setTab(val);
    if (val === 1 && selectedPosId && movements.length === 0) loadHistory(selectedPosId, 1);
  };

  const handleStockSearch = (q: string) => {
    if (!selectedPosId) return;
    setStockSearch(q);
    if (stockDebounce.current) clearTimeout(stockDebounce.current);
    const trimmed = q.trim();
    if (trimmed.length > 0 && trimmed.length < 3) return;
    stockDebounce.current = setTimeout(() => {
      setStockPage(1);
      loadStock(selectedPosId, 1, trimmed || undefined);
    }, 400);
  };

  const handleStockPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    if (!selectedPosId) return;
    setStockPage(value);
    loadStock(selectedPosId, value, stockSearch.trim() || undefined);
  };

  const handleHistPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    if (!selectedPosId) return;
    setHistPage(value);
    loadHistory(selectedPosId, value);
  };

  const handleAdjustSave = async (productId: number, quantity: number, description: string) => {
    if (!selectedPosId) return;
    await inventoryService.adjustStockAdmin(productId, quantity, description, selectedPosId);
    showNotify("Stock ajustado correctamente", "success");
    await loadStock(selectedPosId, stockPage, stockSearch.trim() || undefined);
  };

  const currentPosName = allPos.find((p) => p.id === selectedPosId)?.name ?? "";

  if (loadingPos) {
    return (
      <Box sx={styles.center}>
        <CircularProgress sx={{ color: "#0B5FFF" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: "1600px", margin: "0 auto" }}>
      {/* Header */}
      <Paper elevation={0} sx={styles.headerPaper}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={styles.iconBox}>
            <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>Inventario</Typography>
            <Typography color="text.secondary">Gestión de stock por sede</Typography>
          </Box>
        </Box>
        <TextField
          select
          label="Seleccionar Sede"
          value={selectedPosId ?? ""}
          onChange={(e) => handlePosChange(Number(e.target.value))}
          sx={{ width: { xs: "100%", md: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <StorefrontOutlinedIcon sx={{ color: "#0B5FFF" }} />
                </InputAdornment>
              ),
            },
          }}
        >
          {allPos.map((pos) => (
            <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {!selectedPosId ? (
        <Box sx={styles.emptyState}>
          <Box sx={styles.iconCircle}><StorefrontOutlinedIcon sx={{ fontSize: 40 }} /></Box>
          <Typography variant="h5" fontWeight={800}>Configuración Requerida</Typography>
          <Typography color="text.secondary" textAlign="center">
            Selecciona una sede para visualizar el inventario.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Typography variant="h5" fontWeight={800}>
              Sede: <span style={{ color: "#0B5FFF" }}>{currentPosName}</span>
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{ mb: 3, borderBottom: "1px solid rgba(0,0,0,0.08)", "& .MuiTab-root": { textTransform: "none", fontWeight: 700 } }}
          >
            <Tab label="Stock actual" />
            <Tab label="Historial de movimientos" />
          </Tabs>

          {/* Stock tab */}
          {tab === 0 && (
            <>
              <Box sx={{ position: "relative" }}>
                {loadingStock && (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", zIndex: 1, borderRadius: 4 }}>
                    <CircularProgress size={32} sx={{ color: "#0B5FFF" }} />
                  </Box>
                )}
                <InventoryTable
                  items={stockItems}
                  searchQuery={stockSearch}
                  onSearchChange={handleStockSearch}
                  onAdjust={(item) => setAdjustItem(item)}
                  totalCount={stockTotal}
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "space-between", mt: 2, gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {stockTotal} producto{stockTotal !== 1 ? "s" : ""}
                </Typography>
                {stockPages > 1 && (
                  <Pagination count={stockPages} page={stockPage} onChange={handleStockPageChange} color="primary" shape="rounded" size="small" siblingCount={0} />
                )}
              </Box>
            </>
          )}

          {/* History tab */}
          {tab === 1 && (
            <>
              <Box sx={{ position: "relative" }}>
                {loadingHistory && (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", zIndex: 1, borderRadius: 4 }}>
                    <CircularProgress size={32} sx={{ color: "#0B5FFF" }} />
                  </Box>
                )}
                <InventoryHistoryTable movements={movements} totalCount={histTotal} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "space-between", mt: 2, gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {histTotal} movimiento{histTotal !== 1 ? "s" : ""}
                </Typography>
                {histPages > 1 && (
                  <Pagination count={histPages} page={histPage} onChange={handleHistPageChange} color="primary" shape="rounded" size="small" siblingCount={0} />
                )}
              </Box>
            </>
          )}
        </Box>
      )}

      <StockAdjustmentModal
        open={!!adjustItem}
        item={adjustItem}
        onClose={() => setAdjustItem(null)}
        onSave={handleAdjustSave}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3, fontWeight: 600, boxShadow: "0px 4px 20px rgba(0,0,0,0.1)" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const styles = {
  center: {
    display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", height: "60vh",
  },
  headerPaper: {
    p: { xs: 2, sm: 3 }, borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", bgcolor: "#fff",
    display: "flex", flexDirection: { xs: "column", md: "row" },
    justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2,
  },
  iconBox: {
    width: 56, height: 56, bgcolor: "rgba(11,95,255,0.08)",
    borderRadius: 3, display: "grid", placeItems: "center", color: "#0B5FFF",
  },
  emptyState: {
    minHeight: "45vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2, mt: 4,
    borderRadius: 4, bgcolor: "rgba(0,0,0,0.01)", border: "2px dashed rgba(0,0,0,0.08)", p: 4,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 4, display: "grid", placeItems: "center",
    bgcolor: "#fff", color: "#0B5FFF", boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
  },
};
