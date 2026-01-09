import React, { useState } from 'react';
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '@/services/api';
import { useAuthStore } from '@/context/AuthContext';
import { AuthResponse } from '@/types/auth';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email inválido').required('Obrigatório'),
    password: Yup.string().required('Obrigatório'),
});

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            try {
                setError(null);
                const { data } = await api.post<AuthResponse>('/auth/login', values);
                login(data.token, data.refreshToken, data.user);
                navigate('/');
            } catch (err: any) {
                setError(err.response?.data?.message || 'Erro ao realizar login');
            }
        },
    });

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Endereço de Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Entrando...' : 'Entrar'}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link component={RouterLink} to="/forgot-password" variant="body2">
                                    Esqueceu a senha?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link component={RouterLink} to="/signup" variant="body2">
                                    {"Não tem uma conta? Crie uma"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
            <Box sx={{ mt: 8, mb: 4 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    {'Copyright © '}
                    <Link color="inherit" href="https://whaticket.com/">
                        Whaticket Enterprise
                    </Link>{' '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;
