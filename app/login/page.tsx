"use client";
import {Grid, Box } from '@mui/material';
import LeftPanel from '@/app/components/login/LeftPanel';
import LoginForm from '@/app/components/login/LoginForm';

export default function LoginPage() {
  return (
    <Box 
      component="main" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'white'
      }}
    >
      <Grid 
        container 
        sx={{ 
          maxWidth: '1200px', 
          width: '100%',
          minHeight: '80vh', 
          m: 2 
        }}
      >
        <Grid
          size={{ xs: 0, md: 6 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            borderRadius: '40px',
            overflow: 'hidden',
            boxShadow: '0px 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <LeftPanel />
        </Grid>
        <Grid 
          size={{ xs: 12, md: 6 }} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 4,
            bgcolor: 'transparent'
          }}
        >
          <LoginForm />
        </Grid>

      </Grid>
    </Box>
  );
}