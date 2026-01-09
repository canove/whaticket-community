import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Paper,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import tagService from '@/services/tagService';
import { Tag } from '@/types/tag';
import TagModal from './TagModal';
import { ptBR } from '@mui/x-data-grid/locales';

const Tags: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const data = await tagService.list();
            setTags(data);
        } catch (err) {
            toast.error('Erro ao carregar etiquetas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleOpenModal = (tagId?: number) => {
        setSelectedTagId(tagId || null);
        setModalOpen(true);
    };

    const handleDelete = async (tagId: number) => {
        if (window.confirm('Deseja realmente excluir esta etiqueta?')) {
            try {
                await tagService.remove(tagId);
                toast.success('Etiqueta excluída!');
                fetchTags();
            } catch (err) {
                toast.error('Erro ao excluir etiqueta');
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', flex: 1 },
        {
            field: 'color',
            headerName: 'Cor',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        bgcolor: params.value,
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 0 2px rgba(0,0,0,0.5)',
                    }}
                />
            ),
        },
        {
            field: '_count',
            headerName: 'Uso',
            width: 150,
            renderCell: (params: GridRenderCellParams) => {
                const count = params.value as { tickets: number; contacts: number };
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Tickets">
                            <Chip label={`${count?.tickets || 0} T`} size="small" variant="outlined" />
                        </Tooltip>
                        <Tooltip title="Contatos">
                            <Chip label={`${count?.contacts || 0} C`} size="small" variant="outlined" />
                        </Tooltip>
                    </Box>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            onClick={() => handleOpenModal(params.row.id)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(params.row.id)}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1">
                    Etiquetas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Nova Etiqueta
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={tags}
                    columns={columns}
                    loading={loading}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                />
            </Paper>

            <TagModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                tagId={selectedTagId}
                onSave={fetchTags}
            />
        </Box>
    );
};

export default Tags;
