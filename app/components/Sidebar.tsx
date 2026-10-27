"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Skeleton,
} from "@mui/material";

import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";

import { useUser } from "@/src/hooks/useUser";

export const drawerWidth = 280;

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout, isAdmin, roleName } = useUser();

  const navItems = isAdmin
    ? [
        { label: "Panel de Control", href: "/user/admin/dashboard", icon: <GridViewRoundedIcon /> },
        { label: "Productos", href: "/user/admin/products", icon: <Inventory2OutlinedIcon /> },
        { label: "Inventario", href: "/user/admin/inventario", icon: <WarehouseOutlinedIcon /> },
        { label: "Caja", href: "/user/admin/caja", icon: <ReceiptLongOutlinedIcon /> },
        { label: "Usuarios", href: "/user/admin/user", icon: <PeopleOutlineRoundedIcon /> },
        { label: "Sedes (POS)", href: "/user/admin/pos", icon: <StorefrontOutlinedIcon /> },
      ]
    : [
        { label: "Dashboard", href: "/user/dashboard", icon: <GridViewRoundedIcon /> },
        { label: "Productos", href: "/user/products", icon: <Inventory2OutlinedIcon /> },
        { label: "Inventario", href: "/user/inventario", icon: <WarehouseOutlinedIcon /> },
        { label: "Caja", href: "/user/caja", icon: <ReceiptLongOutlinedIcon /> },
      ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "#fff",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                color: "#0B5FFF",
                bgcolor: "rgba(11,95,255,0.10)",
              }}
            >
              CF
            </Box>

            <Box>
              <Typography fontWeight={800} sx={{ lineHeight: 1.1 }}>
                Caja Fácil
              </Typography>
              {user ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
                  {roleName}
                </Typography>
              ) : (
                <Skeleton width={80} height={15} sx={{ mt: 0.5 }} />
              )}
            </Box>
          </Box>
        </Box>

        <Divider />
        <Box sx={{ px: 1.5, pt: 2 }}>
          <List sx={{ display: "grid", gap: 0.8 }}>
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    onClick={onClose}
                    sx={{
                      borderRadius: 2,
                      px: 1.8,
                      py: 1.2,
                      gap: 1,
                      bgcolor: isActive ? "rgba(11,95,255,0.10)" : "transparent",
                      color: isActive ? "#0B5FFF" : "text.primary",
                      "&:hover": {
                        bgcolor: isActive ? "rgba(11,95,255,0.14)" : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        color: isActive ? "#0B5FFF" : "rgba(0,0,0,0.54)",
                        mr: 1.2,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '0.875rem'
                      }}
                    />
                  </ListItemButton>
                );
              })}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
}
