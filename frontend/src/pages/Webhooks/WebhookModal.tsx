import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Typography,
    Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Webhook } from '@/types/webhook';
import { toast } from 'react-toastify';
import webhookService from '@/services/webhookService';

interface WebhookModalProps {
    open: boolean;
    onClose: () => void;
    webhookId?: number;
    onSave: () => void;
}

const eventsList = [
    { value: 'ticket.created', label: 'Ticket Criado' },
    { value: 'ticket.updated', label: 'Ticket Atualizado' },
    { value: 'message.received', label: 'Mensagem Recebida' },
    { value: 'message.sent', label: 'Mensagem Enviada' },
];

const WebhookModal: React.FC<WebhookModalProps> = ({ open, onClose, webhookId, onSave }) => {
    const [webhook, setWebhook] = React.useState<Webhook | null>(null);

    React.useEffect(() => {
        if (webhookId) {
            webhookService.show(webhookId).then(setWebhook);
        } else {
            setWebhook(null);
        }
    }, [webhookId, open]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: webhook?.name || '',
            url: webhook?.url || '',
            token: webhook?.token || '',
            enabled: webhook?.enabled ?? true,
            events: webhook?.events || [],
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Obrigatório'),
            url: Yup.string().url('URL inválida').required('Obrigatório'),
            events: Yup.array().min(1, 'Selecione pelo menos um evento'),
        }),
        onSubmit: async (values) => {
            try {
                if (webhookId) {
                    await webhookService.update(webhookId, values);
                    toast.success('Webhook atualizado com meio!');
                } else {
                    await webhookService.create(values);
                    toast.success('Webhook criado com sucesso!');
                }
                onSave();
                onClose();
            } catch (err) {
                toast.error('Erro ao salvar webhook');
            }
        },
    });

    const handleEventChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        if (checked) {
            formik.setFieldValue('events', [...formik.values.events, value]);
        } else {
            formik.setFieldValue('events', formik.values.events.filter((e) => e !== value));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{webhookId ? 'Editar Webhook' : 'Novo Webhook'}</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        label="Nome"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="url"
                        label="URL"
                        value={formik.values.url}
                        onChange={formik.handleChange}
                        error={formik.touched.url && Boolean(formik.errors.url)}
                        helperText={formik.touched.url && formik.errors.url}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="token"
                        label="Token de Autenticação (Opcional)"
                        value={formik.values.token}
                        onChange={formik.handleChange}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formik.values.enabled}
                                onChange={formik.handleChange}
                                name="enabled"
                            />
                        }
                        label="Ativo"
                    />

                    <Box mt={2}>
                        <Typography variant="subtitle1">Eventos Disparadores</Typography>
                        <FormGroup>
                            {eventsList.map((evt) => (
                                <FormControlLabel
                                    key={evt.value}
                                    control={
                                        <Checkbox
                                            checked={formik.values.events.includes(evt.value)}
                                            onChange={handleEventChange}
                                            value={evt.value}
                                        />
                                    }
                                    label={evt.label}
                                />
                            ))}
                        </FormGroup>
                        {formik.touched.events && formik.errors.events && (
                            <Typography color="error" variant="caption">
                                {formik.errors.events as string}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default WebhookModal;
