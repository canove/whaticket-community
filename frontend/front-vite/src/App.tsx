import { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

const App = () => {
  const [locale, setLocale] = useState<typeof ptBR | undefined>(undefined);

  const theme = createTheme(
    {
      //@ts-ignore
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#e8e8e8",
        },
      },
      palette: {
        primary: { main: "#2576d2" },
      },
    },
    locale
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
      <Routes />
    </ThemeProvider>
  );
};

export default App;
