"use client";

import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

import type { AdminUser } from "../types/adminUser.types";
import type { Pos } from "@/app/user/admin/pos/types/pos.types";

interface Props {
  users: AdminUser[];
  posList: Pos[]; // ✅ para resolver nombre de sede
  onEdit: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
}

export default function UsersTable({ users, posList, onEdit, onDelete }: Props) {
  const [query, setQuery] = useState("");

  const posById = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of posList || []) map.set(p.id, p.name);
    return map;
  }, [posList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u: any) => {
      const posName = u?.pos?.name || (u?.posId ? posById.get(u.posId) : "") || "";

      return [
        u.username,
        u.name,
        u.lastName,
        u.email,
        u.phone,
        u.role,
        posName,
        u.posId ? String(u.posId) : "",
      ]
        .map((x) => String(x || "").toLowerCase())
        .some((x) => x.includes(q));
    });
  }, [users, query, posById]);

  const getPosLabel = (u: any) => {
    // Soporta: user.pos.name o user.posId
    if (u?.pos?.name) return u.pos.name;
    if (u?.posId) return posById.get(u.posId) || `POS #${u.posId}`;
    return "Sin sede";
    };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, md: 5 },
        p: { xs: 1.5, md: 2.5 },
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "white",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, username, email, rol o sede..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />,
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
        />
      </Box>

      <TableContainer sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "#F9FAFB", fontWeight: 700, color: "#6B7280" } }}>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>ID</TableCell>
              <TableCell>Usuario</TableCell>

              {/* Desktop */}
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Email</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Teléfono</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Sede</TableCell>

              {/* Tablet+ */}
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Rol</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Estado</TableCell>

              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((u: any) => {
              const posLabel = getPosLabel(u);

              return (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" }, color: "text.secondary", fontSize: 12 }}>
                    #{u.id}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={900} variant="body2">
                      {u.name} {u.lastName}
                    </Typography>

                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                      @{u.username}
                    </Typography>

                    {/* Mobile extra */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { xs: "block", md: "none" }, fontStyle: "italic" }}
                    >
                      {u.email}
                    </Typography>

                    {u.phone && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: { xs: "block", md: "none" } }}
                      >
                        {u.phone}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { xs: "block", md: "none" } }}
                    >
                      Sede: {posLabel}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 0.8, display: { xs: "flex", sm: "none" } }}>
                      <Chip label={u.role} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                      <Chip
                        label={u.isActive === false ? "INACTIVO" : "ACTIVO"}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{u.email}</TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="body2">{u.phone || "—"}</Typography>
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Chip label={posLabel} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    <Chip label={u.role} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Chip
                      label={u.isActive === false ? "INACTIVO" : "ACTIVO"}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onEdit(u)} sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(u)} color="error">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
