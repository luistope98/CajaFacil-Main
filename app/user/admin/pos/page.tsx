"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography, CircularProgress } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { posService } from "@/src/services/posService";

import PosTable from "./components/posTable";
import PosModal, { PosFormData } from "./components/posModal";
import DeleteConfirmModal from "./components/deleteConfirmModal";

import type { Pos } from "./types/pos.types";

// Interfaz para el error de Axios/API
interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

export default function PosPage() {
  const [posList, setPosList] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Pos | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Pos | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await posService.getPos();
      setPosList(Array.isArray(data) ? data : data ? [data] : []);
    } catch {
      // load failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData: PosFormData) => {

    const dto = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      address: formData.address.trim(),
      taxId: formData.taxId.trim(),
      phone: formData.phone.trim(),
      minStock: formData.minStock ? Number(formData.minStock) : undefined,
      minCash: formData.minCash ? Number(formData.minCash) : undefined,
      openingBalance: formData.openingBalance !== "" ? Number(formData.openingBalance) : undefined,
    };

    try {
      if (editingPos) {
        await posService.update(editingPos.id, dto);
      } else {
        await posService.create(dto);
      }
      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      // Tipado seguro para errores
      const error = err as ApiError;
      const errorMsg = error.response?.data?.message || "Error al procesar la sede";
      alert(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    }
  };

  const askDelete = (p: Pos) => {
    setItemToDelete(p);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await posService.delete(itemToDelete.id);
      loadData();
    } catch {
      alert("No se pudo eliminar la sede. Es posible que tenga registros asociados.");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <Box sx={{ pt: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}> 
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }} 
        spacing={2} 
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
            Sedes (POS)
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 0.4 }}>
            Administración global de puntos de venta.
          </Typography>
        </Box>

        <Button
          variant="contained"
          // Cambiado: No usamos casting a any, usamos la lógica de ancho responsivo de sx
          sx={{
            width: { xs: "100%", sm: "auto" },
            height: 44, 
            borderRadius: 3, 
            fontWeight: 900, 
            bgcolor: "#0B5FFF",
            textTransform: "none", 
            px: 3, 
            boxShadow: "none",
            "&:hover": { bgcolor: "#0747C6", boxShadow: "none" }
          }}
          startIcon={<AddRoundedIcon />}
          onClick={() => { setEditingPos(null); setModalOpen(true); }}
        >
          Nueva Sede
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: "#0B5FFF" }} />
        </Box>
      ) : (
        <PosTable 
          posList={posList} 
          onEdit={(p) => { setEditingPos(p); setModalOpen(true); }} 
          onDelete={askDelete} 
        />
      )}

      <PosModal 
        key={editingPos ? `edit-${editingPos.id}` : "new-pos"} 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initial={editingPos} 
        onSave={handleSave} 
      />
      
      <DeleteConfirmModal 
        open={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        title="Eliminar Sede" 
        itemName={itemToDelete?.name || ""} 
      />
    </Box>
  );
}