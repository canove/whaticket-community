import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    IconButton,
    Stack,
    Chip
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Webhook } from '@/types/webhook';
import webhookService from '@/services/webhookService';
import WebhookModal from './WebhookModal';
import { toast } from 'react-toastify';

const Webhooks: React.FC = () => {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWebhookId, setSelectedWebhookId] = useState<number | undefined>(undefined);

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const data = await webhookService.list();
            setWebhooks(data);
        } catch (error) {
            toast.error('Erro ao carregar webhooks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const handleOpenModal = (id?: number) => {
        setSelectedWebhookId(id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedWebhookId(undefined);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este webhook?')) {
            try {
                await webhookService.remove(id);
                toast.success('Webhook excluído');
                fetchWebhooks();
            } catch (error) {
                toast.error('Erro ao excluir webhook');
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', width: 200 },
        { field: 'url', headerName: 'URL', width: 300 },
        {
            field: 'enabled',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value ? 'Ativo' : 'Inativo'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'events',
            headerName: 'Eventos',
            width: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto' }}>
                    {(params.value as string[]).map((evt) => (
                        <Chip key={evt} label={evt} size="small" variant="outlined" />
                    ))}
                </Stack>
            ),
        },
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
                    Webhooks
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Novo Webhook
                </Button>
            </Stack>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={webhooks}
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

            <WebhookModal
                open={modalOpen}
                onClose={handleCloseModal}
                webhookId={selectedWebhookId}
                onSave={fetchWebhooks}
            />
        </Container>
    );
};

export default Webhooks;
