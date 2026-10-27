"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import { useAuthStore } from "@/src/store/useAuthStore";
import { posService } from "@/src/services/posService";
import type { Pos } from "@/app/user/admin/pos/types/pos.types";

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box sx={{ color: "#0B5FFF", mt: 0.2, flexShrink: 0 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700, display: "block" }}>
                    {label}
                </Typography>
                <Typography fontWeight={800}>{value ?? "—"}</Typography>
            </Box>
        </Box>
    );
}

export default function MyPosPage() {
    const user = useAuthStore((s) => s.user);
    const [pos, setPos] = useState<Pos | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.posId) {
            setLoading(false);
            return;
        }

        posService
            .getById(user.posId)
            .then(setPos)
            .catch(() => setPos(null))
            .finally(() => setLoading(false));
    }, [user?.posId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
                <CircularProgress sx={{ color: "#0B5FFF" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
            <Box sx={{ width: "100%", maxWidth: 560 }}>
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={900}>
                        Mi Sede
                    </Typography>
                    <Typography sx={{ color: "#6B7280", mt: 0.4 }}>
                        Información de tu punto de venta asignado.
                    </Typography>
                </Box>

                {!pos ? (
                    <Card
                        elevation={0}
                        sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.06)", p: 4, textAlign: "center" }}
                    >
                        <StorefrontOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
                        <Typography fontWeight={700} sx={{ color: "#6B7280" }}>
                            No tienes una sede asignada.
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9CA3AF", mt: 0.5 }}>
                            Contacta al administrador para que te asigne una sede.
                        </Typography>
                    </Card>
                ) : (
                    <Card
                        elevation={0}
                        sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.06)", bgcolor: "white", p: 3 }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 3,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "rgba(11,95,255,0.10)",
                                    color: "#0B5FFF",
                                    flexShrink: 0,
                                }}
                            >
                                <StorefrontOutlinedIcon />
                            </Box>
                            <Box>
                                <Typography fontWeight={900} fontSize={20} lineHeight={1.1}>
                                    {pos.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                                    {pos.description}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2.5}>
                            <InfoRow
                                icon={<LocationOnOutlinedIcon fontSize="small" />}
                                label="Dirección"
                                value={pos.address}
                            />
                            <InfoRow
                                icon={<BadgeOutlinedIcon fontSize="small" />}
                                label="NIT / Tax ID"
                                value={pos.taxId}
                            />
                            <InfoRow
                                icon={<PhoneOutlinedIcon fontSize="small" />}
                                label="Teléfono"
                                value={pos.phone}
                            />

                            <Divider />

                            <InfoRow
                                icon={<InventoryOutlinedIcon fontSize="small" />}
                                label="Stock mínimo de alerta"
                                value={pos.minStock != null ? pos.minStock : "No configurado"}
                            />
                            <InfoRow
                                icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                                label="Caja mínima de alerta"
                                value={pos.minCash != null ? `$${Number(pos.minCash).toLocaleString("es-CO")}` : "No configurado"}
                            />
                        </Stack>
                    </Card>
                )}
            </Box>
        </Box>
    );
}
