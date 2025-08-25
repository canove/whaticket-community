import React, { createContext, useState, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";
import { ThemeProvider as StylesThemeProvider } from "@mui/styles";
import { CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const contextValue = useMemo(() => ({ darkMode, toggleTheme }), [darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <StylesThemeProvider theme={theme}>
        <MUIThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MUIThemeProvider>
      </StylesThemeProvider>
    </ThemeContext.Provider>
  );
};
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useThemeContext = () => useContext(ThemeContext);
