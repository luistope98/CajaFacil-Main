"use client";

import { Box, Button, Card, Typography, CircularProgress, Stack } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

import { useUser } from "@/src/hooks/useUser";
import { dashboardService } from "@/src/services/dashboardService";
import { reportService } from "@/src/services/reportService";

// Configuración de Estilos y Colores
const CHART_COLORS = ["#2F5597", "#FB7185", "#14B8A6", "#F59E0B", "#8B5CF6", "#6366F1"];
const STOCK_GOAL = 1000; // Meta de inventario para el cálculo de progreso

function KpiCard({ value, label, accent, icon }: any) {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", bgcolor: "white", p: 2.4 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>{value}</Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>{label}</Typography>
        </Box>
        <Box sx={{ width: 34, height: 34, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: `${accent}1A`, color: accent }}>
          {icon}
        </Box>
      </Box>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', py: 4, textAlign: 'center' }}>
      <InfoOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 40, mb: 1 }} />
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </Box>
  );
}

function SimpleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 2, px: 1.2, py: 0.8, fontSize: 13, color: "#111827" }}>
      {payload[0].name ? `${payload[0].name}: ` : ''}{payload[0].value}
    </Box>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res);
      } catch {
        // dashboard load failed silently
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Memorizar cálculos financieros para los KPIs
  const financials = useMemo(() => {
    const openingBalance = data?.cash?.openingBalance || 0;
    const income = data?.cash?.totalIncome || 0;
    const expense = data?.cash?.totalExpense || 0;
    const purchase = data?.cash?.totalPurchase || 0;
    const balance = data?.cash?.currentBalance ?? (openingBalance + income - expense - purchase);
    const totalOutflows = expense + purchase;
    const totalStock = data?.inventory?.stockByCategory?.reduce((a: any, b: any) => a + b.totalStock, 0) || 0;

    return {
      openingBalance,
      income,
      expense,
      purchase,
      totalOutflows,
      balance,
      totalStock,
      isBelowMinCash: data?.cash?.isBelowMinCash ?? false,
      incomeProg: income > 0 ? 100 : 0,
      outflowProg: income > 0 ? Math.round((totalOutflows / income) * 100) : 0,
      balanceProg: income > 0 ? Math.round((balance / income) * 100) : 0,
      stockProg: Math.round((totalStock / STOCK_GOAL) * 100),
    };
  }, [data]);

  const pieData = useMemo(() => {
    return data?.inventory?.stockByCategory?.map((item: any, index: number) => ({
      name: item.category,
      value: item.totalStock,
      color: CHART_COLORS[index % CHART_COLORS.length]
    })) || [];
  }, [data]);

  const mostSoldData = useMemo(() => {
    return data?.inventory?.mostSoldProducts?.map((item: any) => ({
      name: item.name ?? `ID: ${item.productId}`,
      value: item.totalSold,
    })) || [];
  }, [data]);

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: "#0B5FFF" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.1, fontSize: { xs: '2rem', md: '3rem' } }}>
            Hola {user.name},
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 0.6 }}>Bienvenido al dashboard central de operaciones.</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={downloading ? <CircularProgress size={16} /> : <FileDownloadOutlinedIcon />}
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            try {
              await reportService.downloadRegisterReport("weekly");
            } catch {
              // download failed silently
            } finally {
              setDownloading(false);
            }
          }}
          sx={{ height: 44, px: 2, borderRadius: 3, textTransform: "none", fontWeight: 700, borderColor: "rgba(0,0,0,0.12)", color: "#111827", bgcolor: "white" }}
        >
          {downloading ? "Descargando..." : "Descargar Reporte"}
        </Button>
      </Box>

      {/* KPI Cards Dinámicas */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2.5, mb: 4 }}>
        <KpiCard
          value={`$${Math.round(financials.income).toLocaleString('es-CO')}`}
          label="Ventas totales"
          accent="#1E3A8A"
          icon={<CheckBoxOutlinedIcon sx={{ fontSize: 20 }} />}
        />
        <KpiCard
          value={`$${Math.round(financials.totalOutflows).toLocaleString('es-CO')}`}
          label="Egresos + Compras"
          accent="#FB7185"
          icon={<GpsFixedRoundedIcon sx={{ fontSize: 20 }} />}
        />
        <KpiCard
          value={`$${Math.round(financials.balance).toLocaleString('es-CO')}`}
          label="Balance actual"
          accent={financials.isBelowMinCash ? "#EF4444" : "#14B8A6"}
          icon={<ShowChartRoundedIcon sx={{ fontSize: 20 }} />}
        />
        <KpiCard
          value={financials.totalStock.toLocaleString('es-CO')}
          label="Total stock"
          accent="#F59E0B"
          icon={<FlagOutlinedIcon sx={{ fontSize: 20 }} />}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1.1fr 1fr 1fr" }, gap: 2.5 }}>
        
        {/* Gráfico Stock */}
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", p: 2.4, height: { xs: "auto", lg: 380 }, minHeight: { xs: 300, lg: "unset" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography fontWeight={900} fontSize={20}>Stock por Categoría</Typography>
              <Typography sx={{ color: "#6B7280", mt: 0.4 }}>Distribución de inventario</Typography>
            </Box>
          </Box>
          {pieData.length > 0 ? (
            <>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={65} outerRadius={90} paddingAngle={5}>
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<SimpleTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap", overflowY: 'auto', maxHeight: 80 }}>
                {pieData.map((d: any) => (
                  <Box key={d.name} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color }} />
                    <Typography variant="caption" fontWeight={600}>{d.name}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : <EmptyState message="Sin datos de stock disponibles" />}
        </Card>

        {/* Top Ventas */}
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", p: 2.4, height: { xs: "auto", lg: 380 }, minHeight: { xs: 300, lg: "unset" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography fontWeight={900} fontSize={20}>Top 5 Más Vendidos</Typography>
          </Box>
          {mostSoldData.length > 0 ? (
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostSoldData} layout="vertical">
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} width={80} />
                  <Tooltip content={<SimpleTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#2F5597" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : <EmptyState message="No hay registros de ventas" />}
        </Card>

        {/* Flujo de Caja */}
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", p: 2.4, height: { xs: "auto", lg: 380 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography fontWeight={900} fontSize={20}>Resumen de Caja</Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Stack spacing={1.5}>
              {financials.openingBalance > 0 && (
                <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(107, 114, 128, 0.06)', borderRadius: 2.5, border: '1px solid rgba(107,114,128,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="#6B7280" fontWeight={700}>APERTURA</Typography>
                  <Typography fontWeight={800}>${Math.round(financials.openingBalance).toLocaleString('es-CO')}</Typography>
                </Box>
              )}
              <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2.5, border: '1px solid rgba(16, 185, 129, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="#10B981" fontWeight={700}>+ VENTAS</Typography>
                <Typography fontWeight={800} color="#10B981">${Math.round(financials.income).toLocaleString('es-CO')}</Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2.5, border: '1px solid rgba(239,68,68,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="#EF4444" fontWeight={700}>− EGRESOS</Typography>
                <Typography fontWeight={800} color="#EF4444">${Math.round(financials.expense).toLocaleString('es-CO')}</Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 2.5, border: '1px solid rgba(245,158,11,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="#D97706" fontWeight={700}>− COMPRAS</Typography>
                <Typography fontWeight={800} color="#D97706">${Math.round(financials.purchase).toLocaleString('es-CO')}</Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5, bgcolor: financials.isBelowMinCash ? 'rgba(239,68,68,0.08)' : 'rgba(11, 95, 255, 0.06)', borderRadius: 2.5, border: `1px solid ${financials.isBelowMinCash ? 'rgba(239,68,68,0.2)' : 'rgba(11,95,255,0.15)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color={financials.isBelowMinCash ? '#DC2626' : '#0B5FFF'} fontWeight={700}>
                  {financials.isBelowMinCash ? '⚠ BALANCE (BAJO MÍN)' : 'BALANCE ACTUAL'}
                </Typography>
                <Typography variant="h6" fontWeight={900} color={financials.isBelowMinCash ? '#DC2626' : '#0B5FFF'}>
                  ${Math.round(financials.balance).toLocaleString('es-CO')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>

      </Box>
    </Box>
  );
}

const Divider = ({ sx }: any) => <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', ...sx }} />;
