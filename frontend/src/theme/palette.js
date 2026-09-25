const palette = {
  light: {
    primary: {
      main: "#212121",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#616161",
      dark: "#424242",
    },
    success: { main: "#2E7D32" },
    error: { main: "#D32F2F" },
    text: { secondary: "rgba(0, 0, 0, 0.6)" },
    background: {
      default: "#F5F5F5",
      paper: "#FAFAFA",
      chat: "#F5F5F5",
    },
    action: { selected: "rgba(0, 0, 0, 0.08)" },
    cards: { background: "#FFF" },
    appBar: { background: "#000000" },
    scrollbar: { thumb: "rgba(0,0,0,.1)" },
    userMessage: { main: "#E0E0E0" },
    contactMessage: { main: "#FFFFFF" },
    timestamp: { background: "#EEEEEE" },
    queue: { fallback: "#7C7C7C" },
  },
  dark: {
    primary: {
      main: "#FFFFFF",
      dark: "#E0E0E0",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    secondary: {
      main: "#BDBDBD",
      dark: "#9E9E9E",
    },
    success: { main: "#66BB6A" },
    error: { main: "#F44336" },
    background: {
      default: "#242424",
      paper: "#1E1E1E",
      chat: "#121212",
    },
    action: { selected: "#383838" },
    cards: { background: "#2C2C2C" },
    appBar: { background: "#000000" },
    scrollbar: { thumb: "hsla(0,0%,100%,.16)" },
    userMessage: { main: "#424242" },
    contactMessage: { main: "#2C2C2C" },
    timestamp: { background: "#242424" },
    queue: { fallback: "#7C7C7C" },
  },
};

export default palette;
