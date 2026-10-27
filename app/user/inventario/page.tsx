"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Box, CircularProgress, Container, Pagination,
  Snackbar, Tab, Tabs, Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import InventoryTable from "@/app/components/inventory/InventoryTable";
import InventoryHistoryTable from "@/app/components/inventory/InventoryHistoryTable";
import StockAdjustmentModal from "@/app/components/inventory/StockAdjustmentModal";

import { inventoryService } from "@/src/services/inventoryService";
import { useUser } from "@/src/hooks/useUser";
import type { InventoryMovement, StockItem } from "./types/inventory.types";
import { Button } from "@mui/material";

const PAGE_SIZE = 20;

export default function InventarioPage() {
  const router = useRouter();
  const { user, isAdmin, hasPos } = useUser();

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stock tab
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [stockPages, setStockPages] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [stockSearch, setStockSearch] = useState("");
  const [loadingStock, setLoadingStock] = useState(true);
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

  const loadStock = useCallback(async (page: number, search?: string) => {
    setLoadingStock(true);
    try {
      const res = await inventoryService.getStock(page, PAGE_SIZE, search);
      setStockItems(res.data);
      setStockTotal(res.total);
      setStockPages(res.pages);
    } catch {
      // load failed silently
    } finally {
      setLoadingStock(false);
    }
  }, []);

  const loadHistory = useCallback(async (page: number) => {
    setLoadingHistory(true);
    try {
      const res = await inventoryService.getHistory(page, PAGE_SIZE);
      setMovements(res.data);
      setHistTotal(res.total);
      setHistPages(res.pages);
    } catch {
      // load failed silently
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(false);
    loadStock(1);
  }, [user, loadStock]);

  const handleTabChange = (_: React.SyntheticEvent, val: number) => {
    setTab(val);
    if (val === 1 && movements.length === 0) loadHistory(1);
  };

  const handleStockSearch = (q: string) => {
    setStockSearch(q);
    if (stockDebounce.current) clearTimeout(stockDebounce.current);
    const trimmed = q.trim();
    if (trimmed.length > 0 && trimmed.length < 3) return;
    stockDebounce.current = setTimeout(() => {
      setStockPage(1);
      loadStock(1, trimmed || undefined);
    }, 400);
  };

  const handleStockPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setStockPage(value);
    loadStock(value, stockSearch.trim() || undefined);
  };

  const handleHistPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setHistPage(value);
    loadHistory(value);
  };

  const handleAdjustSave = async (productId: number, quantity: number, description: string) => {
    await inventoryService.adjustStock(productId, quantity, description);
    showNotify("Stock ajustado correctamente", "success");
    await loadStock(stockPage, stockSearch.trim() || undefined);
  };

  if (loading) {
    return (
      <Box sx={styles.fullCenter}>
        <CircularProgress sx={{ color: "#0B5FFF" }} />
      </Box>
    );
  }

  if (!hasPos && !isAdmin) {
    return (
      <Box sx={styles.fullCenter}>
        <Box sx={{ ...styles.iconBox, bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          <ContactSupportOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h5" fontWeight={800} textAlign="center">Sin Punto de Venta Asociado</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 450, textAlign: "center", mt: 1 }}>
          Actualmente no tienes un punto de venta asignado.
        </Typography>
      </Box>
    );
  }

  if (isAdmin) {
    return (
      <Box sx={styles.fullCenter}>
        <Box sx={{ ...styles.iconBox, bgcolor: "rgba(255,152,0,0.1)", color: "#f57c00" }}>
          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h5" fontWeight={800}>Área de Usuario</Typography>
        <Button variant="contained" onClick={() => router.push("/user/admin/inventario")} sx={styles.adminBtn}>
          Ir a Panel de Administración
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={styles.iconBox}>
            <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>Inventario</Typography>
            <Typography color="text.secondary">Control de stock y movimientos</Typography>
          </Box>
        </Box>
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
    </Container>
  );
}

const styles = {
  fullCenter: {
    height: "75vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2, px: 3,
  },
  iconBox: {
    width: 56, height: 56, bgcolor: "rgba(11,95,255,0.08)",
    borderRadius: 3, display: "grid", placeItems: "center", color: "#0B5FFF",
  },
  adminBtn: {
    mt: 1, bgcolor: "#111827", borderRadius: 3, px: 4, py: 1.2,
    fontWeight: 800, textTransform: "none",
    "&:hover": { bgcolor: "#000" },
  },
};
