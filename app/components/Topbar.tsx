"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { useUser } from "@/src/hooks/useUser";

type Props = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: Props) {
  const router = useRouter();
  
  const { user, logout, isAdmin, roleName } = useUser();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  
  const handleClose = () => setAnchorEl(null);

  if (!user) return null;

  const avatarLetter = (user.name?.[0] ?? user.username?.[0] ?? "U").toUpperCase();
  const fullName = `${user.name} ${user.lastName}`.trim();

  const handleLogout = () => {
    handleClose();
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    router.push("/");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Toolbar sx={{ minHeight: 64, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton edge="start" onClick={onMenuClick}>
            <MenuRoundedIcon />
          </IconButton>

          <Box
            onClick={() => router.push(isAdmin ? "/user/admin/dashboard" : "/user/dashboard")}
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              color: "#0B5FFF",
              bgcolor: "rgba(11,95,255,0.10)",
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(11,95,255,0.18)" },
            }}
          >
            CF
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleOpen(e);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.6,
              borderRadius: 3,
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              userSelect: "none",
            }}
          >
            <Avatar sx={{ width: 34, height: 34 }}>{avatarLetter}</Avatar>

            <Box sx={{ lineHeight: 1, display: { xs: "none", sm: "block" } }}>
              <Typography fontWeight={700} sx={{ fontSize: 14, lineHeight: 1.1 }}>
                {fullName || user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                {roleName}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                width: { xs: "calc(100vw - 32px)", sm: 280 },
                maxWidth: 320,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                overflow: "hidden",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.6, display: "flex", alignItems: "center", gap: 1.4 }}>
              <Avatar sx={{ width: 40, height: 40 }}>{avatarLetter}</Avatar>
              <Box>
                <Typography fontWeight={800} sx={{ lineHeight: 1.1 }}>
                  {fullName || user.username}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => {
                handleClose();
                router.push("/user/user");
              }}
              sx={{ py: 1.2 }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <PersonOutlineRoundedIcon fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.2 }}>
              <ListItemIcon sx={{ minWidth: 34 }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)" } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Cerrar sesión</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#6B7280" }}>
            ¿Estás seguro que deseas cerrar sesión?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setLogoutConfirmOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmLogout}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 3,
              bgcolor: "#0B5FFF",
              boxShadow: "none",
              "&:hover": { bgcolor: "#0747C6", boxShadow: "none" },
            }}
          >
            Sí, cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}