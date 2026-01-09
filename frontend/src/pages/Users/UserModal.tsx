import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import userService from '@/services/userService';

interface UserModalProps {
    open: boolean;
    onClose: () => void;
    userId?: number | null;
    onSave: () => void;
}

const UserSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Nome muito curto').required('Obrigatório'),
    email: Yup.string().email('Email inválido').required('Obrigatório'),
    profile: Yup.string().required('Obrigatório'),
    password: Yup.string().test(
        'password-required',
        'Senha é obrigatória',
        function (value) {
            if (!this.resolve(Yup.ref('isEdit'))) { // If not edit (create), password required
                return !!value;
            }
            return true; // If edit, password optional
        }
    ).min(6, 'Senha muito curta'),
});

const UserModal: React.FC<UserModalProps> = ({
    open,
    onClose,
    userId,
    onSave,
}) => {
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            profile: 'user',
            isEdit: false,
        },
        validationSchema: UserSchema,
        onSubmit: async (values) => {
            try {
                const userData = { ...values };
                if (values.isEdit && !values.password) {
                    delete (userData as any).password;
                }
                delete (userData as any).isEdit;

                if (userId) {
                    await userService.update(userId, userData);
                    toast.success('Usuário atualizado com sucesso!');
                } else {
                    await userService.create(userData);
                    toast.success('Usuário criado com sucesso!');
                }
                onSave();
                handleClose();
            } catch (err: any) {
                toast.error(
                    err.response?.data?.message || 'Erro ao salvar usuário.'
                );
            }
        },
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const user = await userService.show(userId);
                formik.setValues({
                    name: user.name,
                    email: user.email,
                    profile: user.profile,
                    password: '',
                    isEdit: true,
                });
            } catch (err) {
                toast.error('Erro ao carregar usuário');
            }
        };

        if (open && userId) {
            fetchUser();
        } else {
            formik.resetForm();
            formik.setFieldValue('isEdit', false);
        }
    }, [userId, open]);

    const handleClose = () => {
        onClose();
        formik.resetForm();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                {userId ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="name"
                        name="name"
                        label="Nome"
                        variant="outlined"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        id="email"
                        name="email"
                        label="Email"
                        variant="outlined"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        id="password"
                        name="password"
                        label={userId ? "Senha (deixe em branco para manter)" : "Senha"}
                        type="password"
                        variant="outlined"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <FormControl fullWidth margin="normal" error={formik.touched.profile && Boolean(formik.errors.profile)}>
                        <InputLabel id="profile-label">Perfil</InputLabel>
                        <Select
                            labelId="profile-label"
                            id="profile"
                            name="profile"
                            label="Perfil"
                            value={formik.values.profile}
                            onChange={formik.handleChange}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="supervisor">Supervisor</MenuItem>
                        </Select>
                        {formik.touched.profile && formik.errors.profile && (
                            <FormHelperText>{formik.errors.profile}</FormHelperText>
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="error">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={formik.isSubmitting}
                    >
                        {userId ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserModal;
