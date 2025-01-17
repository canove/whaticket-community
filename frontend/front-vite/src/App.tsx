import { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";
import { GlobalStyles } from "@mui/material";

const App = () => {
  const [locale, setLocale] = useState<typeof ptBR | undefined>(undefined);

  const theme = createTheme(
    {
      palette: {
        primary: { main: "#2576d2" },
      },
    },
    locale || {}
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    let browserLocale = "";
    if (i18nlocale) {
      browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);
    }

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          "::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "::-webkit-scrollbar-thumb": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#e8e8e8",
          },
        }}
      />
      <Routes />
    </ThemeProvider>
  );
};

export default App;
