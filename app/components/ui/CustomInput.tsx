"use client";
import { forwardRef } from "react"; // 1. Importar forwardRef
import { TextField, TextFieldProps, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F0F2F5',
    borderRadius: '12px',
    '& fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: '1px solid #0E3A6D' },
    '&.Mui-error fieldset': { border: '1px solid #d32f2f' },
  },
  '& .MuiInputBase-input': { padding: '12px 16px' }
});

const CustomInput = forwardRef<HTMLDivElement, TextFieldProps>(
  ({ label, ...props }, ref) => {
    return (
      <Box sx={{ mb: 2, textAlign: 'left' }}>
        {label && (
          <Typography
            sx={{
              color: "rgba(32, 32, 32, 1)",
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "15px",
              mb: 1,
              ml: 1,
            }}
          >
            {label}
          </Typography>
        )}
        <StyledTextField
          {...props}
          inputRef={ref}
          fullWidth
          label=""
        />
      </Box>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;