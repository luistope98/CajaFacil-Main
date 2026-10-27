"use client";

import { Box, Container, Typography, Grid, Paper, ButtonBase } from "@mui/material";
import { useRouter } from "next/navigation";

import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

export default function UserDashboard() {
  const router = useRouter();

  const menuOptions = [
    {
      title: "Punto de Venta (POS)",
      description: "Administra todas las sedes globales, crea nuevos puntos de venta y supervisa sus configuraciones.",
      icon: <PointOfSaleRoundedIcon sx={{ fontSize: 35 }} />,
      path: "/user/admin/pos",
      color: "#0B5FFF",
    },
    {
      title: "Gestión de Productos",
      description: "Control maestro de productos y categorías. Supervisa el inventario total de toda la red comercial.",
      icon: <Inventory2RoundedIcon sx={{ fontSize: 35 }} />,
      path: "/user/admin/products",
      color: "#10B981",
    },
    {
      title: "Gestión de Usuarios",
      description: "Gestión centralizada de personal: crea, edita y asigna roles o permisos a administradores y usuarios.",
      icon: <GroupAddRoundedIcon sx={{ fontSize: 35 }} />,
      path: "/user/admin/user",
      color: "#F59E0B",
    },
    {
      title: "Caja",
      description: "Consulta y gestiona los registros de caja de cada sede. Crea, edita y elimina ingresos y egresos.",
      icon: <ReceiptLongRoundedIcon sx={{ fontSize: 35 }} />,
      path: "/user/admin/caja",
      color: "#10B981",
    },
    {
      title: "Reportes y Estadísticas",
      description: "Reportes consolidados de ventas totales, rendimiento por sede y métricas clave de crecimiento.",
      icon: <BarChartRoundedIcon sx={{ fontSize: 35 }} />,
      path: "/user/reports",
      color: "#6366F1",
    }
  ];

  return (
    <Container maxWidth={false} sx={{ py: { xs: 4, md: 8 }, width: "95%", maxWidth: "1600px" }}>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography variant="overline" sx={{ color: '#0B5FFF', fontWeight: 900, letterSpacing: 1.5 }}>
           SISTEMA DE ADMINISTRACIÓN MASTER
        </Typography>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111827', mt: 0.5, mb: 1 }}>
          Panel de Control
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400, maxWidth: "800px" }}>
          Desde aquí tienes el control total de la plataforma. Gestiona infraestructuras, catálogos, personal y analiza el comportamiento global del negocio.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {menuOptions.map((option, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}> 
            <ButtonBase
              onClick={() => router.push(option.path)}
              sx={{ width: "100%", textAlign: "left", borderRadius: 5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  width: "100%",
                  minHeight: { xs: "auto", md: 160 },
                  borderRadius: 5,
                  border: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 2, md: 3 },
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.06)",
                    borderColor: option.color,
                    "& .arrow-icon": { transform: "translateX(5px)", opacity: 1 }
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 56, md: 75 },
                    height: { xs: 56, md: 75 },
                    flexShrink: 0,
                    borderRadius: 4,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: `${option.color}10`,
                    color: option.color,
                  }}
                >
                  {option.icon}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#111827", mb: 0.5 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {option.description}
                  </Typography>
                </Box>

                <ArrowForwardRoundedIcon 
                  className="arrow-icon"
                  sx={{ 
                    color: option.color, 
                    opacity: 0.2, 
                    transition: "all 0.2s",
                    display: { xs: 'none', md: 'block' } 
                  }} 
                />
              </Paper>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}