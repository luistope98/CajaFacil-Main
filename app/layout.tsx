import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/app/theme';
import "./globals.css";
import AppShell from "./components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caja Fácil",
  description: "Caja fácil para tu negocio",
  icons: {
    icon: "/favicon.svg",
  },
};
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400","500", "700", "900"], 
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"], 
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="...">
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline /> 
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}