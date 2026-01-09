import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import tagService from '@/services/tagService';

interface TagModalProps {
    open: boolean;
    onClose: () => void;
    tagId: number | null;
    onSave: () => void;
}

const PRESET_COLORS = [
    '#e74c3c', // Red
    '#e67e22', // Orange
    '#f1c40f', // Yellow
    '#27ae60', // Green
    '#3498db', // Blue
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#34495e', // Dark Gray
    '#e91e63', // Pink
    '#795548', // Brown
];

const TagModal: React.FC<TagModalProps> = ({
    open,
    onClose,
    tagId,
    onSave,
}) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3498db');

    useEffect(() => {
        if (open) {
            if (tagId) {
                fetchTag();
            } else {
                setName('');
                setColor('#3498db');
            }
        }
    }, [open, tagId]);

    const fetchTag = async () => {
        if (!tagId) return;
        setLoading(true);
        try {
            const tag = await tagService.get(tagId);
            setName(tag.name);
            setColor(tag.color);
        } catch (err) {
            toast.error('Erro ao carregar etiqueta');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.warning('O nome é obrigatório');
            return;
        }

        setSaving(true);
        try {
            if (tagId) {
                await tagService.update(tagId, { name: name.trim(), color });
                toast.success('Etiqueta atualizada!');
            } else {
                await tagService.create({ name: name.trim(), color });
                toast.success('Etiqueta criada!');
            }
            onSave();
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Erro ao salvar etiqueta';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {tagId ? 'Editar Etiqueta' : 'Nova Etiqueta'}
                </DialogTitle>

                <DialogContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                            <TextField
                                label="Nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                autoFocus
                                required
                                inputProps={{ maxLength: 50 }}
                            />

                            <Box>
                                <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                                    Cor
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {PRESET_COLORS.map((presetColor) => (
                                        <Box
                                            key={presetColor}
                                            onClick={() => setColor(presetColor)}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '50%',
                                                bgcolor: presetColor,
                                                cursor: 'pointer',
                                                border: color === presetColor
                                                    ? '3px solid'
                                                    : '2px solid transparent',
                                                borderColor: color === presetColor
                                                    ? 'primary.main'
                                                    : 'transparent',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                    <TextField
                                        label="Cor personalizada"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        size="small"
                                        sx={{ width: 150 }}
                                    />
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: color,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Preview */}
                            <Box>
                                <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                                    Prévia
                                </Box>
                                <Box
                                    sx={{
                                        display: 'inline-block',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 2,
                                        bgcolor: color,
                                        color: 'white',
                                        fontWeight: 'bold',
                                        textShadow: '0 0 2px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {name || 'Nome da etiqueta'}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || saving}
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TagModal;
