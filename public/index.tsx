import { StrictMode } from "react";
import { createRoot } from "react-dom/client";


import Dashboard from "../src/ui/Dashboard";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);


import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // For baseline styles
import { ScreenProtector } from "../src/ui/ScreenProtector";

// Define your custom theme
const theme = createTheme({
  colorSchemes: {
    dark: true
  },
  typography: {
    fontFamily: [
      'Manrope', // Your chosen font
      'sans-serif', // Fallback
    ].join(','),
    // You can also set base font size here (default is ~14px)
    // fontSize: 16, 
  },
});

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScreenProtector>
      <Dashboard />
      </ScreenProtector>
    </ThemeProvider>
  </StrictMode>
);
