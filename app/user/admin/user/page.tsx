"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography, CircularProgress } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { userService } from "@/src/services/userService";
import { posService } from "@/src/services/posService";

import type { AdminUser } from "./types/adminUser.types";
import type { Pos } from "@/app/user/admin/pos/types/pos.types";

import UsersTable from "./components/usersTable";
import UserModal, { UserFormData } from "./components/userModal";
import DeleteConfirmModal from "./components/deleteConfirmModal";

interface ApiError {
  response?: { data?: { message?: string | string[] } };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posList, setPosList] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    const data = await userService.findAll();
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadPos = async () => {
    const data = await posService.getPos();
    setPosList(Array.isArray(data) ? data : []);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUsers(), loadPos()]);
    } catch {
      // load failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const posById = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of posList) map.set(p.id, p.name);
    return map;
  }, [posList]);

  const handleSave = async (form: UserFormData) => {
    if (form.role === "USER" && (form.posId === "" || form.posId == null)) {
      alert("Para usuarios con rol USER debes seleccionar una sede (POS).");
      return;
    }

    const dto: any = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
      posId: form.role === "USER" ? Number(form.posId) : null,
      isActive: form.isActive ?? true,
    };

    if (!editingUser) {
      // CREATE — all fields required by the backend
      dto.username = form.username.trim();
      dto.password = form.password!.trim();
      dto.phone = form.phone.trim();
      dto.document = form.document.trim();
    } else {
      // UPDATE — only send optional fields if they have a value
      if (form.phone.trim()) dto.phone = form.phone.trim();
      if (form.document.trim()) dto.document = form.document.trim();
      // Only send password if admin explicitly filled it in
      if (form.password?.trim()) dto.password = form.password.trim();
    }

    try {
      if (editingUser) {
        await userService.update(editingUser.id, dto);
      } else {
        await userService.create(dto);
      }

      setModalOpen(false);
      setEditingUser(null);

      await loadUsers();
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.response?.data?.message || "Error al guardar el usuario";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const askDelete = (u: AdminUser) => {
    setItemToDelete(u);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await userService.delete(itemToDelete.id);
      await loadUsers();
    } catch {
      alert("No se pudo eliminar el usuario. Es posible que tenga datos asociados.");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const getPosName = (u: any) => {
    if (u?.pos?.name) return u.pos.name;
    if (u?.posId) return posById.get(u.posId) || `POS #${u.posId}`;
    return "Sin sede";
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
          <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: "1.8rem", md: "2.125rem" } }}>
            Usuarios
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 0.4 }}>
            Administra usuarios, roles y la sede (POS) asignada.
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{
            width: { xs: "100%", sm: "auto" },
            height: 44,
            borderRadius: 3,
            fontWeight: 900,
            bgcolor: "#0B5FFF",
            textTransform: "none",
            px: 3,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0747C6", boxShadow: "none" },
          }}
          startIcon={<AddRoundedIcon />}
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#0B5FFF" }} />
        </Box>
      ) : (
        <UsersTable
          users={users}
          posList={posList}
          onEdit={(u) => {
            setEditingUser(u);
            setModalOpen(true);
          }}
          onDelete={askDelete}
        />
      )}

      <UserModal
        key={editingUser ? `edit-${editingUser.id}` : "new-user"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={
          editingUser
            ? ({
                ...editingUser,
                posId: (editingUser as any).posId ?? (editingUser as any)?.pos?.id ?? null,
              } as any)
            : null
        }
        onSave={handleSave}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        itemName={itemToDelete ? `${itemToDelete.name} ${itemToDelete.lastName} (${getPosName(itemToDelete)})` : ""}
      />
    </Box>
  );
}
