import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import whatsappService from '@/services/whatsappService';
import promptService from '@/services/promptService';
import { Prompt } from '@/types/prompt';
import { toast } from 'react-toastify';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

interface ConnectionModalProps {
    open: boolean;
    onClose: () => void;
    whatsappId?: number | null;
    onSave: () => void;
}

const ConnectionSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Nome muito curto').required('Obrigatório'),
    //   isDefault: Yup.boolean(),
});

const ConnectionModal: React.FC<ConnectionModalProps> = ({
    open,
    onClose,
    whatsappId,
    onSave,
}) => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await promptService.list();
                setPrompts(data);
            } catch (err) {
                toast.error('Erro ao carregar prompts');
            }
        })();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            isDefault: false,
            promptId: '',
        },
        validationSchema: ConnectionSchema,
        onSubmit: async (values) => {
            try {
                const whatsappData = {
                    ...values,
                    promptId: values.promptId ? Number(values.promptId) : undefined,
                };
                if (whatsappId) {
                    await whatsappService.update(whatsappId, whatsappData);
                    toast.success('Conexão atualizada com sucesso!');
                } else {
                    await whatsappService.create(whatsappData);
                    toast.success('Conexão criada com sucesso!');
                }
                onSave();
                handleClose();
            } catch (err: any) {
                toast.error(
                    err.response?.data?.message || 'Erro ao salvar conexão.'
                );
            }
        },
    });

    useEffect(() => {
        const fetchWhatsApp = async () => {
            if (!whatsappId) return;
            try {
                const whatsapp = await whatsappService.show(whatsappId);
                formik.setValues({
                    name: whatsapp.name,
                    isDefault: whatsapp.isDefault,
                    promptId: (whatsapp.promptId || '') as string,
                });
            } catch (err) {
                toast.error('Erro ao carregar conexão');
            }
        };

        if (open && whatsappId) {
            fetchWhatsApp();
        } else {
            formik.resetForm();
        }
    }, [whatsappId, open]);

    const handleClose = () => {
        onClose();
        formik.resetForm();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                {whatsappId ? 'Editar Conexão' : 'Nova Conexão'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="name"
                        name="name"
                        label="Nome da Conexão"
                        variant="outlined"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="prompt-select-label">Prompt (Inteligência Artificial)</InputLabel>
                        <Select
                            labelId="prompt-select-label"
                            id="promptId"
                            name="promptId"
                            value={formik.values.promptId}
                            label="Prompt (Inteligência Artificial)"
                            onChange={formik.handleChange}
                        >
                            <MenuItem value="">
                                <em>Nenhum</em>
                            </MenuItem>
                            {prompts.map((prompt) => (
                                <MenuItem key={prompt.id} value={prompt.id}>
                                    {prompt.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Selecione um prompt para ativar a IA nesta conexão</FormHelperText>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formik.values.isDefault}
                                onChange={formik.handleChange}
                                name="isDefault"
                                color="primary"
                            />
                        }
                        label="Padrão"
                    />
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
                        {whatsappId ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ConnectionModal;
