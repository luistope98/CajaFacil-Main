"use client";

import { useState } from "react";
import { Box, CircularProgress } from "@mui/material";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import { useUser } from "@/src/hooks/useUser"; 

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const [open, setOpen] = useState(false);
  
  const { user, logout } = useUser();

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      <Topbar
        onMenuClick={() => setOpen(true)}
      />

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 9, md: 10 },
          px: { xs: 1.5, sm: 2, md: 4 },
          pb: 4,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
