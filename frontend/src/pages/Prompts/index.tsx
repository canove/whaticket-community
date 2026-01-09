import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    IconButton,
    Stack
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Prompt } from '@/types/prompt';
import promptService from '@/services/promptService';
import PromptModal from './PromptModal';
import { toast } from 'react-toastify';

const Prompts: React.FC = () => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPromptId, setSelectedPromptId] = useState<number | undefined>(undefined);

    const fetchPrompts = async () => {
        setLoading(true);
        try {
            const data = await promptService.list();
            setPrompts(data);
        } catch (error) {
            toast.error('Erro ao carregar prompts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    const handleOpenModal = (id?: number) => {
        setSelectedPromptId(id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedPromptId(undefined);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este prompt?')) {
            try {
                await promptService.remove(id);
                toast.success('Prompt excluído');
                fetchPrompts();
            } catch (error) {
                toast.error('Erro ao excluir prompt');
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', width: 200 },
        { field: 'apiKey', headerName: 'API Key', width: 200 }, // Maybe mask this later
        { field: 'maxTokens', headerName: 'Max Tokens', width: 120 },
        { field: 'temperature', headerName: 'Temp', width: 80 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <IconButton
                        color="primary"
                        onClick={() => handleOpenModal(params.row.id)}
                        size="small"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDelete(params.row.id)}
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Prompts Inteligentes
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Novo Prompt
                </Button>
            </Stack>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={prompts}
                    columns={columns}
                    loading={loading}
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Paper>

            <PromptModal
                open={modalOpen}
                onClose={handleCloseModal}
                promptId={selectedPromptId}
                onSave={fetchPrompts}
            />
        </Container>
    );
};

export default Prompts;
