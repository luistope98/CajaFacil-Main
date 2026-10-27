"use client";

import {
  Box, Button, Typography, CircularProgress, Container,
  Snackbar, Alert, Pagination
} from "@mui/material";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import CategoryCards from "../../components/products/CategoryCards";
import ProductsTable from "../../components/products/ProductsTable";
import ProductModal from "../../components/products/ProductModal";
import CategoryModal from "../../components/products/CategoryModal";
import ConfirmDeleteDialog from "../../components/products/ConfirmDeleteDialog";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { InventoryProduct, ProductCategory } from "./types/product.types";
import { productService } from "@/src/services/productService";
import { categoryService } from "@/src/services/categoryService";
import { useUser } from "@/src/hooks/useUser";

const PAGE_SIZE = 20;

export default function ProductsPage() {
    const router = useRouter();
    const { isAdmin, user, hasPos } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<{ categoryId: number | null; count: number }[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [importing, setImporting] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
    const [searchQuery, setSearchQuery] = useState("");
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [openProductModal, setOpenProductModal] = useState(false);
    const [openCategoryModal, setOpenCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState<InventoryProduct | null>(null);

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error"
    });

    const showNotify = (message: string, severity: "success" | "error") => {
        setNotification({ open: true, message, severity });
    };

    const loadProducts = useCallback(async (p: number, catId?: number, q?: string) => {
        if (!user?.posId) return;
        setLoadingProducts(true);
        try {
            const res = await productService.getProductsByPos(user.posId, p, PAGE_SIZE, catId, q);
            setProducts(res.data);
            setTotalRecords(res.total);
            setTotalPages(res.pages);
            setCategoryCounts(res.categoryCounts);
        } catch {
            // load failed
        } finally {
            setLoadingProducts(false);
        }
    }, [user]);

    const handleSearchChange = (q: string) => {
        setSearchQuery(q);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        const trimmed = q.trim();
        if (trimmed.length > 0 && trimmed.length < 3) return; // wait for 3+ chars
        searchDebounce.current = setTimeout(() => {
            setPage(1);
            loadProducts(1, selectedCategoryId, trimmed || undefined);
        }, 400);
    };

    const loadData = useCallback(async () => {
        if (!user) return;
        if (!hasPos && !isAdmin) { setLoading(false); return; }

        try {
            setLoading(true);
            const catData = await categoryService.getAll();
            setCategories(catData);
            if (catData.length === 0) { setLoading(false); return; }
            await loadProducts(1, undefined);
        } catch {
            // load failed
        } finally {
            setLoading(false);
        }
    }, [hasPos, isAdmin, user, loadProducts]);

    useEffect(() => {
        if (user) loadData();
    }, [user, loadData]);

    const categoriesWithCount = useMemo(() => {
        return categories.map((cat) => ({
            ...cat,
            itemsCount: categoryCounts.find(c => String(c.categoryId) === String(cat.id))?.count ?? 0,
        }));
    }, [categories, categoryCounts]);

    const handleCategorySelect = (id: number | undefined) => {
        setSelectedCategoryId(id);
        setPage(1);
        setSearchQuery("");
        loadProducts(1, id);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        loadProducts(value, selectedCategoryId, searchQuery.trim() || undefined);
    };

    const selectedCategoryName = selectedCategoryId
        ? (categories.find((c) => String(c.id) === String(selectedCategoryId))?.name ?? "Productos")
        : "Todos los productos";

    const handleSaveProduct = async (productData: any) => {
        try {
            const { _stockAdjustment, _extraSkus, id, ...rest } = productData;
            const payload = {
                ...rest,
                price: Number(rest.price),
                taxRate: Number(rest.taxRate),
            };

            if (editingProduct) {
                const updated = await productService.update(editingProduct.id, payload);
                if (_stockAdjustment) {
                    await productService.adjustStock(editingProduct.id, _stockAdjustment.quantity, _stockAdjustment.description);
                    updated.stock = (updated.stock ?? 0) + _stockAdjustment.quantity;
                }
                setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                showNotify("Producto actualizado con éxito", "success");
            } else {
                const created = await productService.create({ ...payload, stock: Number(rest.stock ?? 0) });
                // Create any additional SKUs queued beyond the first one
                if (_extraSkus?.length && created?.id) {
                    for (const s of _extraSkus) {
                        await productService.addSku(created.id, { sku: s.sku, notes: s.notes });
                    }
                }
                showNotify("Producto creado con éxito", "success");
                setPage(1);
                await loadProducts(1, selectedCategoryId);
            }

            setOpenProductModal(false);
            setEditingProduct(null);
        } catch {
            showNotify("Error al guardar producto", "error");
        }
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setImporting(true);
            await productService.bulkImport(file);
            setPage(1);
            await loadProducts(1, selectedCategoryId);
            showNotify("Productos importados correctamente", "success");
        } catch {
            showNotify("Error al importar el archivo Excel", "error");
        } finally {
            setImporting(false);
            if (event.target) event.target.value = "";
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true);
            await productService.downloadTemplate();
        } catch {
            showNotify("Error al descargar el template", "error");
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleSaveCategory = async (catData: { name: string; description?: string }) => {
        try {
            const newCat = await categoryService.create(catData);
            setCategories(prev => [...prev, newCat]);
            setOpenCategoryModal(false);
            showNotify("Categoría creada", "success");
            loadData();
        } catch { showNotify("Error al crear categoría", "error"); }
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        try {
            await productService.delete(productToDelete.id);
            setOpenDeleteDialog(false);
            showNotify("Producto eliminado", "success");
            await loadProducts(page, selectedCategoryId);
        } catch { showNotify("Error al eliminar el producto", "error"); }
    };

    if (loading) {
        return (
            <Box sx={styles.fullCenter}>
                <CircularProgress sx={{ color: "#0B5FFF" }} />
            </Box>
        );
    }

    if (!isAdmin && !hasPos) {
        return (
            <Box sx={styles.fullCenter}>
                <Box sx={{ ...styles.iconBox, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <ContactSupportOutlinedIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" fontWeight={800} textAlign="center">Sin Punto de Venta Asociado</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 450, textAlign: 'center', mt: 1 }}>
                    Actualmente no tienes un punto de venta asignado.
                </Typography>
            </Box>
        );
    }

    if (isAdmin) {
        return (
            <Box sx={styles.fullCenter}>
                <Box sx={{ ...styles.iconBox, bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#f57c00' }}>
                    <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" fontWeight={800}>Área de Usuario</Typography>
                <Button variant="contained" onClick={() => router.push('/user/admin/dashboard')} sx={styles.adminBtn}>
                    Ir a Panel de Administración
                </Button>
            </Box>
        );
    }

    if (categories.length === 0) {
        return (
            <Box sx={styles.fullCenter}>
                <Box sx={styles.iconBox}><CategoryOutlinedIcon sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h5" fontWeight={800}>Configuración Inicial</Typography>
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenCategoryModal(true)} sx={styles.primaryBtn}>
                    Crear mi primera categoría
                </Button>
                <CategoryModal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} onSave={handleSaveCategory} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", mb: 4, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Mi Inventario</Typography>
                    <Typography color="text.secondary">Control de existencias y categorías</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", width: { xs: '100%', sm: 'auto' } }}>
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
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        sx={styles.secondaryBtn}
                    >
                        {importing ? "Importando..." : "Importar"}
                    </Button>

                    <Button variant="outlined" startIcon={<CategoryOutlinedIcon />} onClick={() => setOpenCategoryModal(true)} sx={styles.secondaryBtn}>
                        Categoría
                    </Button>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditingProduct(null); setOpenProductModal(true); }} sx={styles.primaryBtn}>
                        Producto
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
            <Box sx={{ mt: 2, position: "relative" }}>
                {loadingProducts && (
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", zIndex: 1, borderRadius: 4 }}>
                        <CircularProgress size={32} sx={{ color: "#0B5FFF" }} />
                    </Box>
                )}
                <ProductsTable
                    title={selectedCategoryName}
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

            <ProductModal
                open={openProductModal}
                onClose={() => setOpenProductModal(false)}
                defaultCategoryId={selectedCategoryId}
                categories={categories}
                initialProduct={editingProduct}
                onSave={handleSaveProduct}
            />
            <CategoryModal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} onSave={handleSaveCategory} />
            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="Eliminar producto"
                description={productToDelete ? `¿Seguro que quieres eliminar "${productToDelete.name}"?` : ""}
                onCancel={() => { setOpenDeleteDialog(false); setProductToDelete(null); }}
                onConfirm={handleDeleteConfirm}
            />

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
        </Container>
    );
}

const styles = {
    fullCenter: {
        height: '75vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2, px: 3
    },
    iconBox: {
        width: 80, height: 80, bgcolor: 'rgba(11,95,255,0.08)',
        borderRadius: 4, display: 'grid', placeItems: 'center', color: '#0B5FFF'
    },
    primaryBtn: {
        height: 48, px: 3, borderRadius: 3, textTransform: "none", fontWeight: 800, bgcolor: "#0B5FFF",
        "&:hover": { bgcolor: "#0747C6" },
    },
    secondaryBtn: {
        height: 48, px: 2.5, borderRadius: 3, textTransform: "none", fontWeight: 700,
        borderColor: "rgba(0,0,0,0.12)", color: "#111827", bgcolor: "white",
    },
    adminBtn: {
        mt: 1, bgcolor: "#111827", borderRadius: 3, px: 4, py: 1.2,
        fontWeight: 800, textTransform: 'none',
        "&:hover": { bgcolor: "#000" }
    }
};
