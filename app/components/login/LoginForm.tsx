"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/src/schemas/auth";
import { useLogin } from "@/src/hooks/useLogin";
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomInput from "../ui/CustomInput";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { performLogin, loading } = useLogin(setError);

  const onSubmit = (data: LoginFormValues) => {
    performLogin(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
      <Typography
        sx={{
          fontFamily: "var(--font-poppins)",
          fontWeight: 700,
          fontSize: "88px",
          lineHeight: "100%",
          letterSpacing: "0px",
          textTransform: "none",
        }}
      >
        <span style={{ color: "#003B73" }}>C</span>
        <span style={{ color: "#1E9BFF" }}>F</span>
      </Typography>

      <Typography
        variant="h1"
        sx={{
          position: "relative",
          zIndex: 1,
          color: "rgba(32, 32, 32, 1)",
          fontFamily: "var(--font-inter)",
          fontWeight: 700,
          fontSize: "30px",
          lineHeight: "100%",
          textAlign: "center",
          mb: 4,
          mt: 3,
        }}
      >
        INICIAR SESIÓN
      </Typography>

      <CustomInput
        label="Ingresa tu número de celular"
        {...register("phone")}
        error={!!errors.phone}
        helperText={errors.phone?.message}
        inputProps={{ 'data-testid': 'login-phone-input' }}
      />

      <CustomInput
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        inputProps={{ 'data-testid': 'login-password-input' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ textAlign: "left", mb: 3 }}>
        <Link
          component="button"
          type="button"
          onClick={() => setForgotOpen(true)}
          sx={{ fontSize: "0.8rem", color: "#9CA3AF", textDecoration: "none", cursor: "pointer" }}
        >
          ¿Olvidaste la contraseña?
        </Link>
      </Box>

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Recuperar contraseña</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#6B7280" }}>
            Contacta al administrador del sistema para restablecer tu contraseña.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setForgotOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#0E3A6D",
              boxShadow: "none",
              "&:hover": { bgcolor: "#092a50", boxShadow: "none" },
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      <Button
        type="submit"
        disabled={loading}
        fullWidth
        variant="contained"
        sx={{
          bgcolor: "#0E3A6D",
          py: 1.5,
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "1rem",
          fontWeight: 600,
          "&:hover": { bgcolor: "#092a50" },
        }}
      >
        {loading ? "Cargando..." : "Ingresar"}
      </Button>

      <Box
        sx={{
          mt: { xs: 6, md: 10 },
          color: "#9CA3AF",
          display: "flex",
          justifyContent: "center",
          gap: 2,
          fontSize: "0.75rem",
        }}
      >
        <Typography variant="caption" display="block">
          @Copyright CajaFácil 2025.
        </Typography>
        <Link href="/terms" color="inherit" target="_blank" rel="noopener noreferrer">
          Manejo de datos y Términos y condiciones
        </Link>
      </Box>
    </Box>
  );
}
