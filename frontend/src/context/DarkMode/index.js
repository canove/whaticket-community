import React, { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ptBR } from "@mui/material/locale";

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const theme = useMemo(
    () =>
      createTheme(adaptV4Theme({
        palette: {
          mode: "light",
          primary: {
            main: "#25D366",
            dark: "#1DAB57",
            light: "#4ADE80",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#F59E0B",
            dark: "#D97706",
            contrastText: "#ffffff",
          },
          background: {
            default: "#FAFAF9",
            paper: "#ffffff",
          },
          text: {
            primary: "#292524",
            secondary: "#78716C",
          },
          divider: "#E7E5E4",
          success: { main: "#25D366", dark: "#1DAB57" },
          warning: { main: "#F59E0B", dark: "#D97706" },
          error: { main: "#DC2626", dark: "#B91C1C" },
          info: { main: "#6366F1", dark: "#4F46E5" },
        },
        typography: {
          fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
          h4: {
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 700,
            letterSpacing: "-0.6px",
            color: "#292524",
          },
          h5: {
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#292524",
          },
          h6: {
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: 600,
            color: "#292524",
          },
          subtitle1: {
            fontWeight: 500,
            color: "#57534E",
          },
          subtitle2: {
            fontWeight: 600,
            fontSize: "0.8125rem",
            color: "#78716C",
            letterSpacing: "0.3px",
          },
          body1: {
            color: "#292524",
          },
          body2: {
            color: "#57534E",
          },
          caption: {
            color: "#A8A29E",
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 10,
        },
        overrides: {
          MuiCssBaseline: {
            "@global": {
              "*, *::before, *::after": {
                boxSizing: "border-box",
              },
              body: {
                backgroundColor: "#FAFAF9",
                "-webkit-font-smoothing": "antialiased",
                "-moz-osx-font-smoothing": "grayscale",
              },
              "::selection": {
                backgroundColor: "rgba(37,211,102,0.15)",
                color: "#1C1917",
              },
            },
          },
          MuiButton: {
            root: {
              textTransform: "none",
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 600,
              borderRadius: 10,
              fontSize: 14,
              padding: "8px 18px",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            },
            contained: {
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              },
            },
            containedPrimary: {
              backgroundColor: "#25D366",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#1DAB57",
                boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
              },
            },
            outlinedPrimary: {
              borderColor: "#D6D3D1",
              color: "#292524",
              "&:hover": {
                borderColor: "#25D366",
                backgroundColor: "rgba(37,211,102,0.04)",
              },
            },
            textPrimary: {
              color: "#25D366",
              "&:hover": {
                backgroundColor: "rgba(37,211,102,0.06)",
              },
            },
          },
          MuiIconButton: {
            root: {
              transition: "all 0.15s ease",
              color: "#78716C",
              "&:hover": {
                backgroundColor: "rgba(41, 37, 36, 0.04)",
              },
            },
          },
          MuiPaper: {
            rounded: {
              borderRadius: 12,
            },
            outlined: {
              border: "1px solid #E7E5E4",
            },
            elevation1: {
              boxShadow: "0 1px 3px rgba(28, 25, 23, 0.05), 0 1px 2px rgba(28, 25, 23, 0.03)",
            },
            elevation2: {
              boxShadow: "0 4px 12px rgba(28, 25, 23, 0.06), 0 1px 3px rgba(28, 25, 23, 0.04)",
            },
            elevation4: {
              boxShadow: "0 8px 24px rgba(28, 25, 23, 0.08), 0 2px 6px rgba(28, 25, 23, 0.04)",
            },
            elevation8: {
              boxShadow: "0 16px 40px rgba(28, 25, 23, 0.1), 0 4px 12px rgba(28, 25, 23, 0.05)",
            },
          },
          MuiTableHead: {
            root: {
              "& .MuiTableCell-head": {
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 12,
                color: "#78716C",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                borderBottom: "1px solid #E7E5E4",
                backgroundColor: "#FAFAF9",
              },
            },
          },
          MuiTableCell: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 14,
              color: "#292524",
              borderBottom: "1px solid #F5F5F4",
              padding: "12px 16px",
            },
          },
          MuiTableRow: {
            root: {
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "#FAFAF9 !important",
              },
            },
          },
          MuiOutlinedInput: {
            root: {
              borderRadius: 10,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              backgroundColor: "#ffffff",
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              "& $notchedOutline": {
                borderColor: "#D6D3D1",
                transition: "border-color 0.2s ease",
              },
              "&:hover $notchedOutline": {
                borderColor: "#A8A29E",
              },
              "&$focused $notchedOutline": {
                borderColor: "#25D366",
                borderWidth: 1.5,
              },
              "&$focused": {
                boxShadow: "0 0 0 3px rgba(37,211,102,0.1)",
              },
            },
          },
          MuiInputLabel: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: "#78716C",
              "&$focused": {
                color: "#25D366",
              },
            },
          },
          MuiCircularProgress: {
            colorPrimary: {
              color: "#25D366",
            },
          },
          MuiLinearProgress: {
            colorPrimary: {
              backgroundColor: "rgba(37,211,102,0.12)",
            },
            barColorPrimary: {
              backgroundColor: "#25D366",
            },
          },
          MuiChip: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 500,
              borderRadius: 8,
              height: 28,
            },
          },
          MuiMenuItem: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 14,
              borderRadius: 6,
              margin: "2px 6px",
              padding: "8px 12px",
              transition: "background-color 0.12s ease",
              "&:hover": {
                backgroundColor: "#F5F5F4",
              },
            },
          },
          MuiTypography: {
            colorPrimary: {
              color: "#25D366",
            },
          },
          MuiListSubheader: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
            },
          },
          MuiBadge: {
            colorPrimary: {
              backgroundColor: "#25D366",
            },
            colorError: {
              backgroundColor: "#DC2626",
            },
          },
          MuiDialog: {
            paper: {
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(28, 25, 23, 0.14), 0 8px 20px rgba(28, 25, 23, 0.06)",
            },
          },
          MuiDialogTitle: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              padding: "20px 24px 12px",
            },
          },
          MuiDialogContent: {
            root: {
              padding: "8px 24px 16px",
            },
          },
          MuiDialogActions: {
            root: {
              padding: "12px 24px 20px",
            },
          },
          MuiListItem: {
            root: {
              "&$selected": {
                backgroundColor: "rgba(37,211,102,0.06)",
                "&:hover": {
                  backgroundColor: "rgba(37,211,102,0.1)",
                },
              },
              "&:hover": {
                backgroundColor: "#F5F5F4",
              },
            },
          },
          MuiDivider: {
            root: {
              backgroundColor: "#E7E5E4",
            },
          },
          MuiTab: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 500,
              textTransform: "none",
              minWidth: "auto",
              padding: "6px 16px",
            },
          },
          MuiTabs: {
            indicator: {
              backgroundColor: "#25D366",
              height: 2.5,
              borderRadius: 2,
            },
          },
          MuiTooltip: {
            tooltip: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: "#292524",
              borderRadius: 8,
              padding: "6px 12px",
            },
            arrow: {
              color: "#292524",
            },
          },
          MuiAvatar: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 600,
            },
          },
          MuiSwitch: {
            colorPrimary: {
              "&$checked": {
                color: "#25D366",
              },
              "&$checked + $track": {
                backgroundColor: "#25D366",
              },
            },
          },
          MuiSelect: {
            root: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
            },
          },
          MuiMenu: {
            paper: {
              borderRadius: 12,
              border: "1px solid #E7E5E4",
              boxShadow: "0 8px 24px rgba(28,25,23,0.1), 0 2px 8px rgba(28,25,23,0.04)",
              marginTop: 4,
            },
          },
          MuiPopover: {
            paper: {
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(28,25,23,0.1), 0 2px 8px rgba(28,25,23,0.04)",
            },
          },
        },
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "3px",
            backgroundColor: "#D6D3D1",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#A8A29E",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        },
      }, ptBR)),
    []
  );

  return (
    <ThemeContext.Provider value={{}}>
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
