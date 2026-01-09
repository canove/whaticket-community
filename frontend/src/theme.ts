import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

let theme = createTheme(
    {
        palette: {
            mode: 'light',
            primary: {
                main: '#128c7e',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#25d366',
                contrastText: '#ffffff',
            },
            error: {
                main: '#dc3545',
            },
            warning: {
                main: '#ffca2c',
            },
            info: {
                main: '#0dcaf0',
            },
            success: {
                main: '#198754',
            },
            background: {
                default: '#f4f6f8',
                paper: '#ffffff',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 700,
            },
            h2: {
                fontWeight: 700,
            },
            h3: {
                fontWeight: 600,
            },
            h4: {
                fontWeight: 600,
            },
            h5: {
                fontWeight: 500,
            },
            h6: {
                fontWeight: 500,
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: {
                        borderRadius: 12,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
    },
    ptBR,
);

theme = responsiveFontSizes(theme);

export default theme;
