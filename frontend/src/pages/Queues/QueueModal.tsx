import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import queueService from '@/services/queueService';
import promptService from '@/services/promptService';
import { Prompt } from '@/types/prompt';
import { ChromePicker } from 'react-color';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

interface QueueModalProps {
    open: boolean;
    onClose: () => void;
    queueId?: number | null;
    onSave: () => void;
}

const QueueSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Nome muito curto').required('Obrigatório'),
    color: Yup.string().required('Obrigatório'),
    //   greetingMessage: Yup.string(),
});

const QueueModal: React.FC<QueueModalProps> = ({
    open,
    onClose,
    queueId,
    onSave,
}) => {
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
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
            color: '#000000',
            greetingMessage: '',
            promptId: '',
        },
        validationSchema: QueueSchema,
        onSubmit: async (values) => {
            try {
                const queueData = {
                    ...values,
                    promptId: values.promptId ? Number(values.promptId) : undefined,
                };
                if (queueId) {
                    await queueService.update(queueId, queueData);
                    toast.success('Fila atualizada com sucesso!');
                } else {
                    await queueService.create(queueData);
                    toast.success('Fila criada com sucesso!');
                }
                onSave();
                handleClose();
            } catch (err: any) {
                toast.error(
                    err.response?.data?.message || 'Erro ao salvar fila.'
                );
            }
        },
    });

    useEffect(() => {
        const fetchQueue = async () => {
            if (!queueId) return;
            try {
                const queues = await queueService.list();
                const queue = queues.find(q => q.id === queueId); // Assuming list returns all. 
                if (queue) {
                    formik.setValues({
                        name: queue.name,
                        color: queue.color,
                        greetingMessage: queue.greetingMessage || '',
                        promptId: (queue.promptId || '') as string,
                    });
                }
            } catch (err) {
                toast.error('Erro ao carregar fila');
            }
        };

        if (open && queueId) {
            fetchQueue();
        } else {
            formik.resetForm();
        }
    }, [queueId, open]);

    const handleClose = () => {
        onClose();
        formik.resetForm();
        setColorPickerOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                {queueId ? 'Editar Fila' : 'Nova Fila'}
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="name"
                        name="name"
                        label="Nome da Fila"
                        variant="outlined"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />

                    <Box mt={2} mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Cor:
                        </Typography>
                        <div
                            style={{
                                padding: '5px',
                                background: '#fff',
                                borderRadius: '1px',
                                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                display: 'inline-block',
                                cursor: 'pointer'
                            }}
                            onClick={() => setColorPickerOpen(!colorPickerOpen)}
                        >
                            <div style={{
                                width: '36px',
                                height: '14px',
                                borderRadius: '2px',
                                background: formik.values.color,
                            }} />
                        </div>
                        {colorPickerOpen && (
                            <Box sx={{ position: 'absolute', zIndex: 2 }}>
                                <Box sx={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }} onClick={() => setColorPickerOpen(false)} />
                                <ChromePicker
                                    color={formik.values.color}
                                    onChange={(color) => formik.setFieldValue('color', color.hex)}
                                    disableAlpha
                                />
                            </Box>
                        )}
                    </Box>

                    <TextField
                        fullWidth
                        margin="normal"
                        id="greetingMessage"
                        name="greetingMessage"
                        label="Mensagem de Saudação"
                        multiline
                        rows={4}
                        variant="outlined"
                        value={formik.values.greetingMessage}
                        onChange={formik.handleChange}
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
                        <FormHelperText>Selecione um prompt para ativar a IA nesta fila</FormHelperText>
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
                        {queueId ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default QueueModal;
