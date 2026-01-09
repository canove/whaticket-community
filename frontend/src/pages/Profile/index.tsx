import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    Grid,
    Divider,
    Alert,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/context/AuthContext';
import api from '@/services/api';

const ProfileSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Nome muito curto')
        .max(50, 'Nome muito longo')
        .required('Nome é obrigatório'),
    email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
});

const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Senha atual é obrigatória'),
    newPassword: Yup.string()
        .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
        .required('Nova senha é obrigatória'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Senhas não conferem')
        .required('Confirmação é obrigatória'),
});

const Profile: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const profileFormik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
        validationSchema: ProfileSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setProfileSuccess(false);
                await api.put(`/users/${user?.id}`, {
                    name: values.name,
                    email: values.email,
                });
                updateUser({ name: values.name, email: values.email });
                setProfileSuccess(true);
                toast.success('Perfil atualizado com sucesso!');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
            }
        },
    });

    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: PasswordSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                setPasswordSuccess(false);
                await api.put(`/users/${user?.id}/password`, {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                });
                setPasswordSuccess(true);
                resetForm();
                toast.success('Senha alterada com sucesso!');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Erro ao alterar senha');
            }
        },
    });

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Meu Perfil
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Gerencie suas informações pessoais e senha
            </Typography>

            {/* Profile Info Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'primary.main',
                                fontSize: '2rem',
                                mr: 3,
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {user?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    bgcolor: user?.profile === 'admin' ? 'success.main' : 'info.main',
                                    color: 'white',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    display: 'inline-block',
                                    mt: 1,
                                }}
                            >
                                {user?.profile?.toUpperCase()}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Informações Pessoais
                    </Typography>

                    {profileSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Perfil atualizado com sucesso!
                        </Alert>
                    )}

                    <Box component="form" onSubmit={profileFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nome Completo"
                                    name="name"
                                    value={profileFormik.values.name}
                                    onChange={profileFormik.handleChange}
                                    error={profileFormik.touched.name && Boolean(profileFormik.errors.name)}
                                    helperText={profileFormik.touched.name && profileFormik.errors.name}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={profileFormik.values.email}
                                    onChange={profileFormik.handleChange}
                                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={profileFormik.isSubmitting}
                                >
                                    {profileFormik.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>

            {/* Password Card */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Alterar Senha
                    </Typography>

                    {passwordSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Senha alterada com sucesso!
                        </Alert>
                    )}

                    <Box component="form" onSubmit={passwordFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Senha Atual"
                                    name="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordFormik.values.currentPassword}
                                    onChange={passwordFormik.handleChange}
                                    error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                                    helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    edge="end"
                                                >
                                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nova Senha"
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordFormik.values.newPassword}
                                    onChange={passwordFormik.handleChange}
                                    error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                                    helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Confirmar Nova Senha"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordFormik.values.confirmPassword}
                                    onChange={passwordFormik.handleChange}
                                    error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                                    helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<LockIcon />}
                                    disabled={passwordFormik.isSubmitting}
                                >
                                    {passwordFormik.isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Profile;
