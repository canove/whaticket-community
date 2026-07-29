import React, { createContext, useState, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { createMuiTheme, ThemeProvider as MUIThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

const ThemeContext = createContext();

// Design system — a WhatsApp-official support inbox.
// Primary teal (modernized WhatsApp heritage), WhatsApp green for online/success,
// Meta blue reserved for the "official" badge. Inter for type, soft shapes.
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = useMemo(
    () =>
      createMuiTheme({
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "8px",
            backgroundColor: darkMode ? "#2A3A34" : "#D3DBD7",
          },
        },
        palette: {
          type: darkMode ? "dark" : "light",
          primary: {
            main: "#0E7C6B",
            dark: "#0B5C4E",
            light: "#3DA593",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#25D366",
            dark: "#1DA851",
            contrastText: "#053A22",
          },
          error: { main: "#E5484D" },
          background: darkMode
            ? { default: "#0E1512", paper: "#151E1A" }
            : { default: "#F5F7F6", paper: "#FFFFFF" },
          text: darkMode
            ? { primary: "#E7EDEA", secondary: "#9BB0A8" }
            : { primary: "#1B2B27", secondary: "#6B7B76" },
          divider: darkMode ? "rgba(255,255,255,0.08)" : "#E6EAE8",
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 700, letterSpacing: "-0.02em" },
          h5: { fontWeight: 700, letterSpacing: "-0.01em" },
          h6: { fontWeight: 700 },
          subtitle1: { fontWeight: 600 },
          subtitle2: { fontWeight: 600 },
          button: { fontWeight: 600, textTransform: "none" },
        },
        shape: { borderRadius: 10 },
        overrides: {
          MuiButton: {
            root: { borderRadius: 999, textTransform: "none", fontWeight: 600 },
            contained: {
              boxShadow: "none",
              "&:hover": { boxShadow: "0 2px 8px rgba(14,124,107,0.28)" },
            },
          },
          MuiPaper: {
            rounded: { borderRadius: 14 },
            elevation1: {
              boxShadow: darkMode
                ? "0 1px 2px rgba(0,0,0,0.4)"
                : "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)",
            },
          },
          MuiOutlinedInput: {
            root: { borderRadius: 10 },
          },
          MuiChip: {
            root: { fontWeight: 600 },
          },
          MuiTableCell: {
            head: {
              fontWeight: 700,
              color: darkMode ? "#9BB0A8" : "#6B7B76",
            },
          },
        },
      }),
    [darkMode]
  );

  const contextValue = useMemo(() => ({ darkMode, toggleTheme }), [darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useThemeContext = () => useContext(ThemeContext);
