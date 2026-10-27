"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Divider,
  Stack,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";

import type { AdminUser } from "../types/adminUser.types";
import { posService } from "@/src/services/posService";
import type { Pos } from "@/app/user/admin/pos/types/pos.types";

export type UserRole = "ADMIN" | "USER";

export interface UserFormData {
  username: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
  role: UserRole;
  password?: string;
  isActive?: boolean;

  // ✅ 1 sede por usuario
  posId: number | ""; // "" = sin sede (UI)
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  initial?: AdminUser | null;
}

export default function UserModal({ open, onClose, onSave, initial }: Props) {
  const [posList, setPosList] = useState<Pos[]>([]);
  const [loadingPos, setLoadingPos] = useState(false);

  const [form, setForm] = useState<UserFormData>({
    username: initial?.username || "",
    name: initial?.name || "",
    lastName: initial?.lastName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    document: initial?.document || "",
    role: (initial?.role as UserRole) || "USER",
    password: "",
    isActive: initial?.isActive ?? true,
    posId: (initial as any)?.posId ?? "",
  });

  // Reset cuando abre / cambia initial
  useEffect(() => {
    if (!open) return;

    setForm({
      username: initial?.username || "",
      name: initial?.name || "",
      lastName: initial?.lastName || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      document: initial?.document || "",
      role: (initial?.role as UserRole) || "USER",
      password: "",
      isActive: initial?.isActive ?? true,
      posId: (initial as any)?.posId ?? "",
    });
  }, [initial, open]);

  // Cargar sedes POS al abrir
  useEffect(() => {
    if (!open) return;

    const loadPos = async () => {
      try {
        setLoadingPos(true);
        const data = await posService.getPos();
        setPosList(Array.isArray(data) ? data : []);
      } catch {
        setPosList([]);
      } finally {
        setLoadingPos(false);
      }
    };

    loadPos();
  }, [open]);

  const needsPos = form.role === "USER";
  const posInvalid = needsPos && (form.posId === "" || form.posId == null);

  const isEditing = !!initial;

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\d{10}$/;

  const passwordTouched = (form.password ?? "").length > 0;
  const passwordInvalid =
    passwordTouched &&
    ((form.password ?? "").length < 8 || !PASSWORD_REGEX.test(form.password ?? ""));

  const emailInvalid = form.email.trim().length > 0 && !EMAIL_REGEX.test(form.email.trim());
  // In create mode phone is required and must be 10 digits; in edit mode validate only if filled
  const phoneTouched = form.phone.trim().length > 0;
  const phoneInvalid = phoneTouched && !PHONE_REGEX.test(form.phone.trim());

  const canSave = useMemo(() => {
    const emailOk = form.email.trim() && EMAIL_REGEX.test(form.email.trim());
    const base =
      form.name.trim() &&
      form.lastName.trim() &&
      emailOk &&
      !posInvalid &&
      !passwordInvalid;

    if (isEditing) return base && !phoneInvalid;

    // For create: username, phone (10 digits) and a valid password are required
    const pwd = form.password ?? "";
    const passwordOk = pwd.length >= 8 && PASSWORD_REGEX.test(pwd);
    const phoneOk = PHONE_REGEX.test(form.phone.trim());
    return base && form.username.trim() && phoneOk && passwordOk;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, posInvalid, isEditing, passwordInvalid, phoneInvalid]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {initial ? "Editar Usuario" : "Nuevo Usuario"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography
              variant="caption"
              fontWeight={800}
              color="#0B5FFF"
              sx={{ display: "block", mb: 1 }}
            >
              DATOS BÁSICOS
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Username"
                fullWidth
                size="small"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={isEditing}
                helperText={isEditing ? "No se puede modificar" : undefined}
              />

              <TextField
                select
                label="Rol"
                fullWidth
                size="small"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as UserRole,
                  })
                }
              >
                <MenuItem value="USER">USER</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </TextField>
            </Box>

            {/* ✅ Sede (POS) */}
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                label="Sede (POS)"
                fullWidth
                size="small"
                value={form.posId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    posId: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                disabled={loadingPos}
                error={posInvalid}
                helperText={
                  posInvalid
                    ? "Para usuarios con rol USER debes seleccionar una sede."
                    : "Selecciona la sede donde operará este usuario."
                }
              >
                <MenuItem value="">
                  {loadingPos ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={14} />
                      <span>Cargando sedes...</span>
                    </Stack>
                  ) : (
                    "Sin sede"
                  )}
                </MenuItem>

                {posList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Nombre"
                fullWidth
                size="small"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                label="Apellido"
                fullWidth
                size="small"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
              <TextField
                label="Email"
                fullWidth
                size="small"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={emailInvalid}
                helperText={emailInvalid ? "Ingresa un correo electrónico válido" : undefined}
              />
              <TextField
                label="Teléfono"
                fullWidth
                size="small"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={phoneInvalid}
                helperText={
                  phoneInvalid
                    ? "El teléfono debe tener exactamente 10 dígitos"
                    : !isEditing
                    ? "Ej: 3001234567"
                    : undefined
                }
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                label="Documento"
                fullWidth
                size="small"
                value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                label={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                fullWidth
                size="small"
                type="password"
                value={form.password ?? ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!isEditing}
                error={passwordInvalid}
                helperText={
                  passwordInvalid
                    ? "Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
                    : isEditing
                    ? "Dejar vacío para no cambiar la contraseña"
                    : "Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
                }
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Switch
                  checked={form.isActive !== false}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label={form.isActive === false ? "Inactivo" : "Activo"}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          bgcolor: "#F9FAFB",
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}
      >
        <Button sx={{ width: { xs: "100%", sm: "auto" }, textTransform: "none" }} onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          disabled={!canSave}
          sx={{
            width: { xs: "100%", sm: "auto" },
            bgcolor: "#0B5FFF",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0747C6", boxShadow: "none" },
          }}
          onClick={() => onSave(form)}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
