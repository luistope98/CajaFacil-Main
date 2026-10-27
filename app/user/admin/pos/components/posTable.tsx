"use client";

import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Chip, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState } from "react";
import type { Pos } from "../types/pos.types";

interface PosTableProps {
    posList: Pos[];
    onEdit: (pos: Pos) => void;
    onDelete: (pos: Pos) => void;
}

export default function PosTable({ posList, onEdit, onDelete }: PosTableProps) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return posList.filter((p) => 
            [p.name, p.address, p.taxId].some((x) => 
                String(x || "").toLowerCase().includes(q)
            )
        );
    }, [posList, query]);

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                borderRadius: { xs: 2, md: 5 }, 
                p: { xs: 1.5, md: 2.5 }, 
                border: "1px solid rgba(0,0,0,0.06)",
                bgcolor: "white" 
            }}
        >
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar sede..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{ 
                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} /> 
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
            </Box>

            <TableContainer sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ "& th": { bgcolor: "#F9FAFB", fontWeight: 700, color: "#6B7280" } }}>
                            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>ID</TableCell>
                            <TableCell>Sede</TableCell>
                            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Dirección</TableCell>
                            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Alertas</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((p) => (
                            <TableRow key={p.id} hover>
                                <TableCell sx={{ display: { xs: "none", md: "table-cell" }, color: "text.secondary", fontSize: 12 }}>
                                    #{p.id}
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={900} variant="body2">{p.name}</Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                                        NIT: {p.taxId}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "block", md: "none" }, fontStyle: 'italic' }}>
                                        {p.address}
                                    </Typography>
                                </TableCell>
                                
                                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                                    {p.address}
                                </TableCell>
                                
                                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                                    <Stack direction="row" spacing={1}>
                                        <Chip label={`S: ${p.minStock}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                        <Chip label={`C: ${p.minCash}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                    </Stack>
                                </TableCell>
                                
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => onEdit(p)} sx={{ mr: 1 }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDelete(p)} color="error">
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}