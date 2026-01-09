import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Contact } from '@/types/contact';
import contactService from '@/services/contactService';
import { toast } from 'react-toastify';

interface ContactModalProps {
    open: boolean;
    onClose: () => void;
    contactId?: number | null;
    onSave?: (contact: Contact) => void;
}

const ContactSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Nome muito curto').required('Obrigatório'),
    number: Yup.string()
        .matches(/^[0-9]+$/, 'Apenas números')
        .min(10, 'Número inválido')
        .required('Obrigatório'),
    email: Yup.string().email('Email inválido'),
});

const ContactModal: React.FC<ContactModalProps> = ({
    open,
    onClose,
    contactId,
    onSave,
}) => {
    const formik = useFormik({
        initialValues: {
            name: '',
            number: '',
            email: '',
        },
        validationSchema: ContactSchema,
        onSubmit: async (values) => {
            try {
                let contact: Contact;
                if (contactId) {
                    contact = await contactService.update(contactId, values);
                    toast.success('Contato atualizado com sucesso!');
                } else {
                    contact = await contactService.create(values);
                    toast.success('Contato criado com sucesso!');
                }
                if (onSave) {
                    onSave(contact);
                }
                handleClose();
            } catch (err: any) {
                toast.error(
                    err.response?.data?.message || 'Erro ao salvar contato.'
                );
            }
        },
    });

    useEffect(() => {
        const fetchContact = async () => {
            if (!contactId) return;
            try {
                const contact = await contactService.show(contactId);
                formik.setValues({
                    name: contact.name,
                    number: contact.number,
                    email: contact.email || '',
                });
            } catch (err) {
                toast.error('Erro ao carregar contato');
            }
        };

        if (open && contactId) {
            fetchContact();
        } else {
            formik.resetForm();
        }
    }, [contactId, open]);

    const handleClose = () => {
        onClose();
        formik.resetForm();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{contactId ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Nome"
                                variant="outlined"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="number"
                                name="number"
                                label="Número (Whatsapp)"
                                variant="outlined"
                                placeholder="5511999999999"
                                value={formik.values.number}
                                onChange={formik.handleChange}
                                error={formik.touched.number && Boolean(formik.errors.number)}
                                helperText={formik.touched.number && formik.errors.number}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email"
                                variant="outlined"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>
                    </Grid>
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
                        {contactId ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContactModal;
