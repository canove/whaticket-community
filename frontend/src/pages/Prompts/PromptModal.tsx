import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Slider,
    Typography,
    Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Prompt } from '@/types/prompt';
import { toast } from 'react-toastify';
import promptService from '@/services/promptService';

interface PromptModalProps {
    open: boolean;
    onClose: () => void;
    promptId?: number;
    onSave: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ open, onClose, promptId, onSave }) => {
    const [prompt, setPrompt] = useState<Prompt | null>(null);

    useEffect(() => {
        if (promptId) {
            promptService.show(promptId).then(setPrompt);
        } else {
            setPrompt(null);
        }
    }, [promptId, open]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: prompt?.name || '',
            apiKey: prompt?.apiKey || '',
            prompt: prompt?.prompt || '',
            maxTokens: prompt?.maxTokens || 1000,
            temperature: prompt?.temperature || 0.7,
            voice: prompt?.voice || '',
            voiceKey: prompt?.voiceKey || '',
            voiceRegion: prompt?.voiceRegion || '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Obrigatório'),
            apiKey: Yup.string().required('Obrigatório'),
            prompt: Yup.string().required('Obrigatório'),
            maxTokens: Yup.number().required('Obrigatório'),
            temperature: Yup.number().required('Obrigatório'),
        }),
        onSubmit: async (values) => {
            try {
                if (promptId) {
                    await promptService.update(promptId, values);
                    toast.success('Prompt atualizado!');
                } else {
                    await promptService.create(values);
                    toast.success('Prompt criado!');
                }
                onSave();
                onClose();
            } catch (err) {
                toast.error('Erro ao salvar prompt');
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{promptId ? 'Editar Prompt' : 'Novo Prompt'}</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="name"
                                label="Nome"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="apiKey"
                                label="API Key (OpenAI/Gemini)"
                                value={formik.values.apiKey}
                                onChange={formik.handleChange}
                                error={formik.touched.apiKey && Boolean(formik.errors.apiKey)}
                                helperText={formik.touched.apiKey && formik.errors.apiKey}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                name="prompt"
                                label="System Prompt"
                                value={formik.values.prompt}
                                onChange={formik.handleChange}
                                error={formik.touched.prompt && Boolean(formik.errors.prompt)}
                                helperText={formik.touched.prompt && formik.errors.prompt}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                name="maxTokens"
                                label="Max Tokens"
                                value={formik.values.maxTokens}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography gutterBottom>Temperature: {formik.values.temperature}</Typography>
                            <Slider
                                value={formik.values.temperature}
                                onChange={(_, value) => formik.setFieldValue('temperature', value)}
                                step={0.1}
                                min={0}
                                max={2}
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Configurações de Voz (Opcional)</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                name="voice"
                                label="Voice"
                                value={formik.values.voice}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                name="voiceKey"
                                label="Voice Key"
                                value={formik.values.voiceKey}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                name="voiceRegion"
                                label="Voice Region"
                                value={formik.values.voiceRegion}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                    </Grid>
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

export default PromptModal;
