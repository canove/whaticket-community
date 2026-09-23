import { alpha, createTheme } from "@material-ui/core/styles";

import palette from "./palette";

const borderRadius = {
  small: "8px",
  medium: "16px",
  input: "10px",
  pill: "999px",
};

const createAppTheme = (type) => {
  const colors = palette[type];
  const isDark = type === "dark";
  const { palette: basePalette } = createTheme({ palette: { type, ...colors } });
  const shadowColor = (opacity) =>
    alpha(basePalette.common.black, isDark ? opacity * 2 : opacity);

  return createTheme({
    palette: {
      type,
      ...colors,
      tintedBackground: alpha(colors.primary.main, isDark ? 0.08 : 0.04),
    },

    typography: {
      sectionLabel: {
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: basePalette.text.secondary,
      },
    },

    borderRadius,

    sizing: {
      appBar: 54,
    },

    border: {
      divider: `1px solid ${basePalette.divider}`,
      ring: `0 0 0 2px ${colors.background.paper}`,
    },

    elevation: {
      light: `0 2px 6px -2px ${shadowColor(0.25)}`,
    },

    scrollbarStyles: {
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: colors.scrollbar.thumb,
      },
    },

    overrides: {
      MuiButton: {
        root: {
          borderRadius: 32,
          fontSize: "13px",
          textTransform: "none",
        },
        outlined: {
          backgroundColor: colors.cards.background,
        },
      },
      MuiOutlinedInput: {
        root: {
          borderRadius: borderRadius.input,
          backgroundColor: colors.cards.background,
        },
      },
      MuiMenu: {
        paper: {
          borderRadius: borderRadius.input,
        },
      },
      MuiDialogTitle: {
        root: {
          color: colors.primary.main,
        },
      },
      MuiPaper: {
        outlined: {
          "&$rounded": {
            borderRadius: borderRadius.medium,
          },
        },
      },
    },
  });
};

export default createAppTheme;
