"use client";

import { Box, Card, CardActionArea, Typography, IconButton } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { useMemo, useRef } from "react";
import { ProductCategory } from "../../user/products/types/product.types";
import { getRandomPastelColor } from "@/app/utils/colors";
import CategoryIcon from "./CategoryIcon";

type Props = {
  categories: (ProductCategory & { itemsCount?: number })[];
  selectedId: number | undefined;
  onSelect: (id: number | undefined) => void;
  totalCount?: number;
};

const ACTIVE_BG = "#083D77";
const CARD_WIDTH = 160;
const SCROLL_DELTA = CARD_WIDTH * 2 + 16;

export default function CategoryCards({ categories, selectedId, onSelect, totalCount }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const categoryColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    categories.forEach((cat) => {
      colorMap[cat.id] = getRandomPastelColor();
    });
    return colorMap;
  }, [categories]);

  const scroll = (delta: number) => {
    if (scrollRef.current) scrollRef.current.scrollLeft += delta;
  };

  const allActive = selectedId === undefined;

  return (
    <Box sx={{ position: "relative", mb: 3, mx: { xs: 0, md: 2 } }}>
      {/* Left arrow — desktop only */}
      <IconButton
        onClick={() => scroll(-SCROLL_DELTA)}
        size="small"
        sx={{
          position: "absolute",
          left: -36,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
          display: { xs: "none", md: "flex" },
          "&:hover": { bgcolor: "#f5f5f5" },
        }}
      >
        <ChevronLeftRoundedIcon fontSize="small" />
      </IconButton>

      {/* Scrollable row */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollBehavior: "smooth",
          pb: 0.5,
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {/* "Todos" card */}
        <Card
          elevation={0}
          sx={{
            flexShrink: 0,
            width: CARD_WIDTH,
            borderRadius: 3,
            overflow: "hidden",
            cursor: "pointer",
            bgcolor: allActive ? ACTIVE_BG : "rgba(11,95,255,0.07)",
            color: allActive ? "white" : "text.primary",
            boxShadow: allActive
              ? "0px 14px 30px rgba(8,61,119,0.35)"
              : "0px 2px 10px rgba(0,0,0,0.04)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <CardActionArea
            onClick={() => onSelect(undefined)}
            sx={{ p: 2, height: 100, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", color: "inherit" }}
          >
            <Inventory2OutlinedIcon sx={{ color: allActive ? "white" : "#0B5FFF", mb: 0.5 }} />
            <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
              Todos
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.25 }}>
              {totalCount ?? 0} productos
            </Typography>
          </CardActionArea>
        </Card>

        {categories.map((cat) => {
          const isActive = cat.id === selectedId;
          return (
            <Card
              key={cat.id}
              elevation={0}
              sx={{
                flexShrink: 0,
                width: CARD_WIDTH,
                borderRadius: 3,
                overflow: "hidden",
                cursor: "pointer",
                bgcolor: isActive ? ACTIVE_BG : categoryColors[cat.id],
                color: isActive ? "white" : "text.primary",
                boxShadow: isActive
                  ? "0px 14px 30px rgba(8,61,119,0.35)"
                  : "0px 2px 10px rgba(0,0,0,0.04)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <CardActionArea
                onClick={() => onSelect(cat.id)}
                sx={{ p: 2, height: 100, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", color: "inherit" }}
              >
                <CategoryIcon name={cat.name} sx={{ color: isActive ? "white" : "inherit", mb: 0.5 }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {cat.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.25 }}>
                  {cat.itemsCount ?? 0} productos
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* Right arrow — desktop only */}
      <IconButton
        onClick={() => scroll(SCROLL_DELTA)}
        size="small"
        sx={{
          position: "absolute",
          right: -36,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
          display: { xs: "none", md: "flex" },
          "&:hover": { bgcolor: "#f5f5f5" },
        }}
      >
        <ChevronRightRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
