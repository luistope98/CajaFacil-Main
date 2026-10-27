import {
  Box,
  Container,
  Typography,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

// Replace the `content` field of each section with the final text when available.
// The structure and layout are ready.
const SECTIONS: { title: string; content: string }[] = [
  {
    title: "1. Aceptación de los términos",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin fermentum, arcu vel dignissim tincidunt, velit nunc tempor lorem, nec pulvinar nisl libero vel enim.",
  },
  {
    title: "2. Uso del servicio",
    content:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
  },
  {
    title: "3. Manejo de datos personales",
    content:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
  {
    title: "4. Privacidad y confidencialidad",
    content:
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit.",
  },
  {
    title: "5. Responsabilidades del usuario",
    content:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.",
  },
  {
    title: "6. Limitación de responsabilidad",
    content:
      "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.",
  },
  {
    title: "7. Modificaciones",
    content:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  },
  {
    title: "8. Contacto",
    content:
      "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  },
];

export default function TermsPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F9FAFB",
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: { xs: "56px", md: "72px" },
              lineHeight: 1,
              mb: 1,
            }}
          >
            <span style={{ color: "#003B73" }}>C</span>
            <span style={{ color: "#1E9BFF" }}>F</span>
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <GavelRoundedIcon sx={{ color: "#0E3A6D", fontSize: 28 }} />
            <Typography
              variant="h4"
              sx={{
                fontFamily: "var(--font-inter)",
                fontWeight: 800,
                color: "#0E3A6D",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Términos y Condiciones
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Manejo de datos · Política de privacidad · Condiciones de uso
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "#9CA3AF", mt: 0.5, display: "block" }}
          >
            Última actualización: próximamente
          </Typography>
        </Box>

        {/* Intro card */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 3,
            p: { xs: 2.5, md: 4 },
            mb: 3,
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#374151", lineHeight: 1.8, fontStyle: "italic" }}
          >
            Al utilizar Caja Fácil aceptas los términos y condiciones descritos
            en este documento. Te recomendamos leerlos detenidamente antes de
            usar la plataforma.
          </Typography>
        </Paper>

        {/* Sections */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#fff",
            mb: 4,
          }}
        >
          {SECTIONS.map((section, idx) => (
            <Box key={section.title}>
              <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0E3A6D",
                    mb: 1.5,
                    fontSize: "1rem",
                  }}
                >
                  {section.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#4B5563", lineHeight: 1.8 }}
                >
                  {section.content}
                </Typography>
              </Box>
              {idx < SECTIONS.length - 1 && (
                <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
              )}
            </Box>
          ))}
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button
            href="/login"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#0E3A6D",
              "&:hover": { bgcolor: "rgba(14,58,109,0.06)" },
            }}
          >
            Volver al inicio de sesión
          </Button>
          <Typography variant="caption" color="text.secondary">
            @Copyright CajaFácil 2025. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
