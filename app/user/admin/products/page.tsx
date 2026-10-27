"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Box, Typography, CircularProgress, MenuItem, TextField,
    Paper, InputAdornment, Button, useTheme, useMediaQuery,
    Snackbar, Alert, Pagination
} from "@mui/material";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import CategoryCards from "@/app/components/products/CategoryCards";
import ProductsTable from "@/app/components/products/ProductsTable";
import ProductModal from "@/app/components/products/ProductModal";
import CategoryModal from "@/app/components/products/CategoryModal";
import ConfirmDeleteDialog from "@/app/components/products/ConfirmDeleteDialog";

import { productService } from "@/src/services/productService";
import { posService } from "@/src/services/posService";
import { categoryService } from "@/src/services/categoryService";
import { InventoryProduct, ProductCategory } from "@/app/user/products/types/product.types";
import { Pos } from "@/app/user/admin/pos/types/pos.types";

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [allPos, setAllPos] = useState<Pos[]>([]);
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<{ categoryId: number | null; count: number }[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);

    const [selectedPosId, setSelectedPosId] = useState<number>();
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
    const [searchQuery, setSearchQuery] = useState("");
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [loadingPos, setLoadingPos] = useState(true);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [importing, setImporting] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);

    const [openProductModal, setOpenProductModal] = useState(false);
    const [openCategoryModal, setOpenCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState<InventoryProduct | null>(null);

    const [notification, setNotification] = useState({
        open: false, message: "", severity: "success" as "success" | "error"
    });
    const showNotify = (message: string, severity: "success" | "error") =>
        setNotification({ open: true, message, severity });

    useEffect(() => {
        posService.getPos()
            .then(setAllPos)
            .catch(() => {})
            .finally(() => setLoadingPos(false));
    }, []);

    const loadProducts = useCallback(async (posId: number, p: number, catId?: number, q?: string) => {
        setLoadingProducts(true);
        try {
            const res = await productService.getProductsByPosAdmin(posId, p, PAGE_SIZE, catId, q);
            setProducts(res.data);
            setTotalRecords(res.total);
            setTotalPages(res.pages);
            setCategoryCounts(res.categoryCounts);
        } catch {
            // load failed
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    const fetchFullData = useCallback(async (posId: number) => {
        setLoadingInventory(true);
        try {
            const catData = await categoryService.getAllAdmin(posId);
            setCategories(catData);
            if (catData.length === 0) {
                setProducts([]);
                setTotalRecords(0);
                setTotalPages(1);
                setCategoryCounts([]);
                setSelectedCategoryId(undefined);
                return;
            }
            if (selectedCategoryId && !catData.find(c => c.id === selectedCategoryId)) {
                setSelectedCategoryId(undefined);
            }
            await loadProducts(posId, 1, undefined);
            setPage(1);
        } catch {
            // load failed
        } finally {
            setLoadingInventory(false);
        }
    }, [loadProducts, selectedCategoryId]);

    useEffect(() => {
        if (selectedPosId) fetchFullData(selectedPosId);
    }, [selectedPosId]);

    const categoriesWithCount = useMemo(() => {
        return categories.map((cat) => ({
            ...cat,
            itemsCount: categoryCounts.find(c => String(c.categoryId) === String(cat.id))?.count ?? 0,
        }));
    }, [categories, categoryCounts]);

    const currentPosName = allPos.find(p => p.id === selectedPosId)?.name || "";

    const handleSearchChange = (q: string) => {
        setSearchQuery(q);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        const trimmed = q.trim();
        if (trimmed.length > 0 && trimmed.length < 3) return;
        searchDebounce.current = setTimeout(() => {
            if (!selectedPosId) return;
            setPage(1);
            loadProducts(selectedPosId, 1, selectedCategoryId, trimmed || undefined);
        }, 400);
    };

    const handleCategorySelect = (id: number | undefined) => {
        setSelectedCategoryId(id);
        setSearchQuery("");
        setPage(1);
        if (selectedPosId) loadProducts(selectedPosId, 1, id);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        if (selectedPosId) loadProducts(selectedPosId, value, selectedCategoryId, searchQuery.trim() || undefined);
    };

    const handleSaveProduct = async (data: any) => {
        if (!selectedPosId) return;
        try {
            const { _stockAdjustment, _extraSkus, ...rest } = data;
            const payload = {
                name: rest.name, description: rest.description,
                ceco: rest.ceco,
                price: Number(rest.price), taxRate: Number(rest.taxRate),
                icoTaxAmount: rest.icoTaxAmount ?? null,
                categoryId: Number(rest.categoryId), posId: selectedPosId,
                ...(rest.sku ? { sku: rest.sku } : {}),
            };

            if (editingProduct) {
                const res = await productService.updateAdmin(editingProduct.id, payload);
                if (_stockAdjustment) {
                    await productService.adjustStockAdmin(editingProduct.id, _stockAdjustment.quantity, _stockAdjustment.description, selectedPosId);
                    res.stock = (res.stock ?? 0) + _stockAdjustment.quantity;
                }
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...res } : p));
                showNotify("Producto actualizado con éxito", "success");
            } else {
                const created = await productService.createAdmin({ ...payload, stock: Number(rest.stock ?? 0) });
                if (_extraSkus?.length && created?.id) {
                    for (const s of _extraSkus) {
                        await productService.addSkuAdmin(created.id, selectedPosId, { sku: s.sku, notes: s.notes });
                    }
                }
                showNotify("Producto creado con éxito", "success");
                setPage(1);
                await loadProducts(selectedPosId, 1, selectedCategoryId);
            }

            setOpenProductModal(false);
            setEditingProduct(null);
        } catch {
            showNotify("Error al procesar la solicitud", "error");
        }
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedPosId) return;
        try {
            setImporting(true);
            await productService.bulkImportAdmin(file, selectedPosId);
            setPage(1);
            await loadProducts(selectedPosId, 1, selectedCategoryId);
            showNotify("Importación masiva completada correctamente", "success");
        } catch {
            showNotify("Error al importar el archivo Excel", "error");
        } finally {
            setImporting(false);
            if (event.target) event.target.value = "";
        }
    };

    const handleDownloadTemplate = async () => {
        if (!selectedPosId) return;
        try {
            setDownloadingTemplate(true);
            await productService.downloadTemplateAdmin(selectedPosId);
        } catch {
            showNotify("Error al descargar el template", "error");
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleSaveCategory = async (catData: { name: string; description?: string }) => {
        if (!selectedPosId) return;
        try {
            const newCat = await categoryService.createAdmin({ ...catData, posId: selectedPosId });
            setCategories(prev => [...prev, newCat]);
            setOpenCategoryModal(false);
            showNotify("Categoría creada", "success");
            fetchFullData(selectedPosId);
        } catch {
            showNotify("Error al crear categoría", "error");
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete || !selectedPosId) return;
        try {
            await productService.deleteAdmin(productToDelete.id, selectedPosId);
            setOpenDeleteDialog(false);
            showNotify("Producto eliminado", "success");
            await loadProducts(selectedPosId, page, selectedCategoryId);
        } catch {
            showNotify("Error al eliminar el producto", "error");
        }
    };

    if (loadingPos) return <Box sx={styles.center}><CircularProgress sx={{ color: "#0B5FFF" }} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ ...styles.headerPaper, flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2 }}>
                <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>Panel Administrativo</Typography>
                    <Typography color="text.secondary">Gestión de productos por sede</Typography>
                </Box>
                <TextField
                    select label="Seleccionar Sede"
                    value={selectedPosId || ""}
                    onChange={(e) => { setSelectedPosId(Number(e.target.value)); setSelectedCategoryId(undefined); setPage(1); }}
                    sx={{ width: { xs: "100%", md: 320 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><StorefrontOutlinedIcon sx={{ color: "#0B5FFF" }} /></InputAdornment> } }}
                >
                    {allPos.map((pos) => <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>)}
                </TextField>
            </Paper>

            {!selectedPosId ? (
                <Box sx={styles.emptyState}>
                    <Box sx={styles.iconCircle}><StorefrontOutlinedIcon sx={{ fontSize: 40 }} /></Box>
                    <Typography variant="h5" fontWeight={800}>Configuración Requerida</Typography>
                    <Typography color="text.secondary" textAlign="center">Selecciona una sede para visualizar los productos.</Typography>
                </Box>
            ) : loadingInventory ? (
                <Box sx={{ ...styles.center, height: '40vh' }}>
                    <CircularProgress size={30} sx={{ color: "#0B5FFF", mb: 2 }} />
                    <Typography color="text.secondary">Sincronizando {currentPosName}...</Typography>
                </Box>
            ) : (
                <Box sx={{ mt: 4 }}>
                    {/* Toolbar */}
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" }, mb: 4, gap: 2 }}>
                        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
                            Sede: <span style={{ color: "#0B5FFF" }}>{currentPosName}</span>
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", flexDirection: { xs: "column", sm: "row" }, width: { xs: "100%", lg: "auto" } }}>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" onChange={handleFileImport} />

                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadOutlinedIcon />}
                                onClick={handleDownloadTemplate}
                                disabled={downloadingTemplate}
                                sx={styles.secondaryBtn}
                            >
                                {downloadingTemplate ? "Descargando..." : "Template"}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={importing ? <CircularProgress size={18} color="inherit" /> : <FileUploadOutlinedIcon />}
                                sx={styles.secondaryBtn}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={importing}
                            >
                                {importing ? "Importando..." : "Importar"}
                            </Button>

                            <Button variant="outlined" startIcon={<CategoryOutlinedIcon />} onClick={() => setOpenCategoryModal(true)} sx={styles.secondaryBtn}>
                                Nueva Categoría
                            </Button>
                            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditingProduct(null); setOpenProductModal(true); }} sx={styles.primaryBtn}>
                                Nuevo Producto
                            </Button>
                        </Box>
                    </Box>

                    {/* Category cards */}
                    <CategoryCards
                        categories={categoriesWithCount}
                        selectedId={selectedCategoryId}
                        onSelect={handleCategorySelect}
                        totalCount={totalRecords}
                    />

                    {/* Products table */}
                    <Box sx={{ mt: 3, position: "relative" }}>
                        {loadingProducts && (
                            <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", zIndex: 1, borderRadius: 4 }}>
                                <CircularProgress size={32} sx={{ color: "#0B5FFF" }} />
                            </Box>
                        )}
                        <ProductsTable
                            title={selectedCategoryId ? `Productos en ${categories.find(c => c.id === selectedCategoryId)?.name || ''}` : "Todos los productos"}
                            products={products}
                            onEdit={(p) => { setEditingProduct(p); setOpenProductModal(true); }}
                            onDelete={(p) => { setProductToDelete(p); setOpenDeleteDialog(true); }}
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            totalCount={totalRecords}
                        />
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "space-between", mt: 2, gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            {totalRecords} producto{totalRecords !== 1 ? "s" : ""} en total
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
                </Box>
            )}

            <ProductModal open={openProductModal} onClose={() => setOpenProductModal(false)} defaultCategoryId={selectedCategoryId} categories={categories} initialProduct={editingProduct} onSave={handleSaveProduct} isAdmin adminPosId={selectedPosId} />
            <CategoryModal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} onSave={handleSaveCategory} />
            <ConfirmDeleteDialog open={openDeleteDialog} title="Eliminar de Sede" description={`¿Eliminar permanentemente de ${currentPosName}?`} onCancel={() => setOpenDeleteDialog(false)} onConfirm={handleDeleteProduct} />

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 3, fontWeight: 600, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

const styles = {
    center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' },
    headerPaper: { p: { xs: 2, sm: 3 }, borderRadius: 4, display: 'flex', border: '1px solid rgba(0,0,0,0.08)', bgcolor: '#fff' },
    emptyState: { minHeight: '45vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 4, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.01)', border: '2px dashed rgba(0,0,0,0.08)', p: 4 },
    iconCircle: { width: 80, height: 80, borderRadius: 4, display: 'grid', placeItems: 'center', bgcolor: '#fff', color: '#0B5FFF', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
    primaryBtn: { height: 44, borderRadius: 3, textTransform: "none", fontWeight: 800, bgcolor: "#0B5FFF", px: 3 },
    secondaryBtn: { height: 44, borderRadius: 3, textTransform: "none", fontWeight: 700, color: "#111827", bgcolor: "white", border: "1px solid rgba(0,0,0,0.12)", px: 2 }
};
