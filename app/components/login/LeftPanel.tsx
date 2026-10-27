import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function LeftPanel() {
  return (
    <Box
      sx={{
        bgcolor: "#0E3A6D",
        color: "white",
        p: { xs: 4, md: 8 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-15%",
          left: "10%",
          width: "120px",
          height: "320px",
          bgcolor: "rgba(217, 217, 217, 0.1)",
          borderRadius: "115px",
          transform: "rotate(35deg)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "17%",
          width: "120px",
          height: "500px",
          bgcolor: "rgba(217, 217, 217, 0.1)",
          borderRadius: "115px",
          transform: "rotate(35deg)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              color: "white",
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "48px",
              lineHeight: "100%",
            }}
          >
            Transforma tu Negocio con <br />
            <Box
              component="span"
              sx={{
                fontWeight: 900,
                fontStyle: "normal",
                display: "inline-block",
                fontSize: "48px",
                lineHeight: "100%",
                letterSpacing: "0px",
              }}
            >
              CF
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{
            mb: 4,
            position: "relative",
            width: "100%",
            flex: 1,
            minHeight: 160,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0px 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          <Image
            src="/login_image.png"
            alt="Dashboard"
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
      </Box>

      <Typography
        variant="h1"
        sx={{
          position: "relative",
          zIndex: 1,
          color: "white",
          fontFamily: "var(--font-inter)",
          fontWeight: 300,
          fontSize: "15px",
          lineHeight: "100%",
          textAlign: "center",
        }}
      >
        La forma fácil de automatizar y administrar tu almacenamiento
      </Typography>
    </Box>
  );
}
