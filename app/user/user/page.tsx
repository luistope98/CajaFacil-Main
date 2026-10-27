"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import { useAuthStore } from "@/src/store/useAuthStore";
import { posService } from "@/src/services/posService";
import { userService } from "@/src/services/userService";
import type { Pos } from "@/app/user/admin/pos/types/pos.types";

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box sx={{ color: "#0B5FFF", mt: 0.2, flexShrink: 0 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700, display: "block" }}>
                    {label}
                </Typography>
                <Typography fontWeight={700}>{value ?? "—"}</Typography>
            </Box>
        </Box>
    );
}

export default function UserPage() {
    const storeUser = useAuthStore((s) => s.user);
    const setAuth = useAuthStore((s) => s.setAuth);
    const token = useAuthStore((s) => s.token);
    const isNotAdmin = storeUser?.role !== "ADMIN";

    const [form, setForm] = useState({
        name: storeUser?.name ?? "",
        lastName: storeUser?.lastName ?? "",
        phone: storeUser?.phone ?? "",
        email: storeUser?.email ?? "",
    });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [pos, setPos] = useState<Pos | null>(null);
    const [loadingPos, setLoadingPos] = useState(false);

    useEffect(() => {
        if (!storeUser?.posId) return;
        setLoadingPos(true);
        posService
            .getById(storeUser.posId)
            .then(setPos)
            .catch(() => setPos(null))
            .finally(() => setLoadingPos(false));
    }, [storeUser?.posId]);

    const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p) => ({ ...p, [k]: e.target.value }));

    const isDirty = useMemo(() => {
        return (
            form.name !== (storeUser?.name ?? "") ||
            form.lastName !== (storeUser?.lastName ?? "") ||
            form.phone !== (storeUser?.phone ?? "") ||
            form.email !== (storeUser?.email ?? "")
        );
    }, [form, storeUser]);

    const avatarLetter = (storeUser?.name?.[0] ?? storeUser?.username?.[0] ?? "U").toUpperCase();
    const fullName = `${storeUser?.name ?? ""} ${storeUser?.lastName ?? ""}`.trim();

    return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
            <Box sx={{ width: "100%", maxWidth: 640 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight={900}>
                            Mi perfil
                        </Typography>
                        <Typography sx={{ color: "#6B7280", mt: 0.4 }}>
                            Información de tu cuenta.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<SaveRoundedIcon />}
                        disabled={!isDirty}
                        onClick={() => setConfirmOpen(true)}
                        sx={{
                            height: 44,
                            px: 2.2,
                            borderRadius: 3,
                            textTransform: "none",
                            fontWeight: 800,
                            bgcolor: "#0B5FFF",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#0747C6", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: "rgba(11,95,255,0.35)", color: "white" },
                        }}
                    >
                        Guardar cambios
                    </Button>
                </Stack>

                {/* User card */}
                <Card
                    elevation={0}
                    sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.06)", bgcolor: "white", p: 3, mb: 2.5 }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                fontWeight: 900,
                                fontSize: 22,
                                bgcolor: "rgba(11,95,255,0.12)",
                                color: "#0B5FFF",
                            }}
                        >
                            {avatarLetter}
                        </Avatar>
                        <Box>
                            <Typography fontWeight={900} fontSize={18} lineHeight={1.1}>
                                {fullName || storeUser?.username}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#6B7280" }}>
                                {storeUser?.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                                Username
                            </Typography>
                            <Typography fontWeight={800}>{storeUser?.username ?? "—"}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                                Rol
                            </Typography>
                            <Box mt={0.5}>
                                <Chip
                                    label={storeUser?.role ?? "—"}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 900,
                                        bgcolor: storeUser?.role === "ADMIN" ? "rgba(11,95,255,0.12)" : "rgba(0,0,0,0.08)",
                                        color: storeUser?.role === "ADMIN" ? "#0B5FFF" : "#374151",
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: "grid", gap: 2 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                            <TextField size="small" label="Nombre" value={form.name} onChange={setField("name")} fullWidth />
                            <TextField size="small" label="Apellido" value={form.lastName} onChange={setField("lastName")} fullWidth />
                        </Box>
                        <TextField size="small" label="Teléfono" value={form.phone} onChange={setField("phone")} fullWidth disabled={isNotAdmin} />
                        <TextField size="small" label="Email" value={form.email} onChange={setField("email")} fullWidth disabled={isNotAdmin} />
                    </Box>
                </Card>

                {/* POS card */}
                <Card
                    elevation={0}
                    sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.06)", bgcolor: "white", p: 3 }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "rgba(11,95,255,0.10)",
                                color: "#0B5FFF",
                                flexShrink: 0,
                            }}
                        >
                            <StorefrontOutlinedIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography fontWeight={900} fontSize={16}>
                                Mi Sede
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6B7280" }}>
                                Punto de venta asignado
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {loadingPos ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={24} sx={{ color: "#0B5FFF" }} />
                        </Box>
                    ) : !pos ? (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
                            <Typography variant="body2" sx={{ color: "#6B7280" }}>
                                No tienes una sede asignada.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                                    Nombre
                                </Typography>
                                <Typography fontWeight={900} fontSize={15}>{pos.name}</Typography>
                                {pos.description && (
                                    <Typography variant="body2" sx={{ color: "#6B7280" }}>{pos.description}</Typography>
                                )}
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <InfoRow icon={<LocationOnOutlinedIcon fontSize="small" />} label="Dirección" value={pos.address} />
                                <InfoRow icon={<BadgeOutlinedIcon fontSize="small" />} label="NIT / Tax ID" value={pos.taxId} />
                                <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Teléfono" value={pos.phone} />
                                <InfoRow label="Stock mínimo" icon={<span style={{ fontSize: 16 }}>📦</span>} value={pos.minStock ?? "No configurado"} />
                            </Box>
                        </Stack>
                    )}
                </Card>

                <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ fontWeight: 900 }}>Confirmar cambios</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ color: "#6B7280", mt: 0.5 }}>
                            ¿Estás seguro que deseas guardar los cambios en tu perfil?
                        </Typography>
                        {saveError && (
                            <Typography sx={{ color: "#C5161D", mt: 1, fontSize: "0.85rem" }}>
                                {saveError}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            disabled={saving}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            disabled={saving}
                            onClick={async () => {
                                setSaving(true);
                                setSaveError(null);
                                try {
                                    const updated = await userService.updateMe(form);
                                    if (storeUser && token) {
                                        setAuth({ ...storeUser, ...updated }, token);
                                    }
                                    setConfirmOpen(false);
                                } catch {
                                    setSaveError("No se pudieron guardar los cambios. Intenta de nuevo.");
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            sx={{
                                textTransform: "none",
                                fontWeight: 800,
                                bgcolor: "#0B5FFF",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#0747C6", boxShadow: "none" },
                            }}
                        >
                            {saving ? "Guardando..." : "Sí, guardar"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
