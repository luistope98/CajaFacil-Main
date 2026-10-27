"use client";

import { Box, Button, Typography } from "@mui/material";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 5,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(99,102,241,0.10)",
          color: "#6366F1",
          mb: 1,
        }}
      >
        <BarChartRoundedIcon sx={{ fontSize: 40 }} />
      </Box>

      <Typography variant="h4" fontWeight={900} sx={{ color: "#111827" }}>
        Reportes y Estadísticas
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "#6B7280", maxWidth: 420, lineHeight: 1.7 }}
      >
        Esta sección aún no está lista. Estamos trabajando en ella para
        ofrecerte reportes completos y estadísticas detalladas del negocio.
      </Typography>

      <Box
        sx={{
          mt: 1,
          px: 2.5,
          py: 1,
          borderRadius: 3,
          bgcolor: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.18)",
        }}
      >
        <Typography variant="body2" fontWeight={700} sx={{ color: "#6366F1" }}>
          Próximamente disponible
        </Typography>
      </Box>

      <Button
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => router.push("/user/admin/dashboard")}
        sx={{
          mt: 2,
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 700,
          borderColor: "rgba(0,0,0,0.15)",
          color: "#374151",
          "&:hover": { borderColor: "rgba(0,0,0,0.25)", bgcolor: "rgba(0,0,0,0.02)" },
        }}
      >
        Volver al panel
      </Button>
    </Box>
  );
}
