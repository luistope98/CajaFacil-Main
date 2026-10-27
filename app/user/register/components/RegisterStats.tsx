"use client";

import Grid from "@mui/material/GridLegacy";
import { Card, Typography, Box } from "@mui/material";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

import type { RegisterRangeSummary } from "@/src/services/registerService";

interface Props {
  /** Total register count across the whole date range (not just the current page). */
  totalRegisters: number;
  /** Range-wide totals aggregated by the backend — never derived from a paginated slice. */
  summary: RegisterRangeSummary;
}

export default function RegisterStats({ totalRegisters, summary }: Props) {
  const stats = {
    totalRegisters,
    itemsSold: summary.itemsSold,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    net: summary.net,
  };

  const cards = [
    {
      label: "Registros",
      value: String(stats.totalRegisters),
      icon: <ReceiptLongRoundedIcon />,
      accent: "info",
    },
    {
      label: "Items vendidos",
      value: String(stats.itemsSold),
      icon: <Inventory2OutlinedIcon />,
      accent: "secondary",
    },
    {
      label: "Ingresos",
      value: `$${stats.totalIncome.toLocaleString("es-CO")}`,
      icon: <TrendingUpRoundedIcon />,
      accent: "success",
    },
    {
      label: "Egresos",
      value: `$${stats.totalExpense.toLocaleString("es-CO")}`,
      icon: <TrendingDownRoundedIcon />,
      accent: "error",
    },
    {
      label: "Neto",
      value: `${stats.net < 0 ? "-" : ""}$${Math.abs(stats.net).toLocaleString("es-CO")}`,
      icon: <AccountBalanceWalletRoundedIcon />,
      accent: stats.net >= 0 ? "primary" : "error",
    },
  ] as const;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((c) => (
        <Grid key={c.label} item xs={6} sm={4} md={2.4 as any}>
          <Card
            elevation={0}
            sx={(theme) => ({
              p: 2.2,
              borderRadius: 4,
              border: "1px solid rgba(0,0,0,0.06)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              transition: "transform 140ms ease, box-shadow 140ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              },

              ...(c.accent === "primary" && {
                "--badgeBg": theme.palette.primary.main + "1F",
                "--badgeColor": theme.palette.primary.main,
              }),
              ...(c.accent === "secondary" && {
                "--badgeBg": theme.palette.secondary.main + "1F",
                "--badgeColor": theme.palette.secondary.main,
              }),
              ...(c.accent === "success" && {
                "--badgeBg": theme.palette.success.main + "1F",
                "--badgeColor": theme.palette.success.main,
              }),
              ...(c.accent === "error" && {
                "--badgeBg": theme.palette.error.main + "1F",
                "--badgeColor": theme.palette.error.main,
              }),
              ...(c.accent === "info" && {
                "--badgeBg": theme.palette.info.main + "1F",
                "--badgeColor": theme.palette.info.main,
              }),
            })}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "var(--badgeBg)",
                  color: "var(--badgeColor)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Box sx={{ fontSize: 22, display: "grid", placeItems: "center" }}>{c.icon}</Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 900 }}>
                  {c.label}
                </Typography>
                <Typography variant="h6" fontWeight={950} sx={{ lineHeight: 1.1 }}>
                  {c.value}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                width: 8,
                height: 40,
                borderRadius: 99,
                bgcolor: "var(--badgeColor)",
                opacity: 0.22,
              }}
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}