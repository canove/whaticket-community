import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '@/services/api';

interface Campaign {
    id: number;
    name: string;
    message: string;
    status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
    scheduledAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    _count?: { contacts: number };
    sentCount?: number;
}

const statusColors: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
    draft: 'default',
    scheduled: 'primary',
    running: 'warning',
    completed: 'success',
    cancelled: 'error',
};

const statusLabels: Record<string, string> = {
    draft: 'Rascunho',
    scheduled: 'Agendada',
    running: 'Executando',
    completed: 'Concluída',
    cancelled: 'Cancelada',
};

const Campaigns: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Campaign | null>(null);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/campaigns');
            setCampaigns(data);
        } catch (err) {
            toast.error('Erro ao carregar campanhas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (campaign?: Campaign) => {
        if (campaign) {
            setEditing(campaign);
            setName(campaign.name);
            setMessage(campaign.message);
        } else {
            setEditing(null);
            setName('');
            setMessage('');
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleSave = async () => {
        if (!name.trim() || !message.trim()) {
            toast.warning('Preencha todos os campos');
            return;
        }

        setSaving(true);
        try {
            if (editing) {
                await api.put(`/campaigns/${editing.id}`, { name, message });
                toast.success('Campanha atualizada!');
            } else {
                await api.post('/campaigns', { name, message });
                toast.success('Campanha criada!');
            }
            handleCloseModal();
            fetchCampaigns();
        } catch (err) {
            toast.error('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleStart = async (id: number) => {
        try {
            await api.post(`/campaigns/${id}/start`);
            toast.success('Campanha iniciada!');
            fetchCampaigns();
        } catch (err) {
            toast.error('Erro ao iniciar campanha');
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await api.post(`/campaigns/${id}/cancel`);
            toast.success('Campanha cancelada');
            fetchCampaigns();
        } catch (err) {
            toast.error('Erro ao cancelar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir campanha?')) return;
        try {
            await api.delete(`/campaigns/${id}`);
            toast.success('Excluída!');
            fetchCampaigns();
        } catch (err) {
            toast.error('Erro ao excluir');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180 },
        {
            field: 'message',
            headerName: 'Mensagem',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" noWrap title={params.value}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: '_count',
            headerName: 'Contatos',
            width: 100,
            valueGetter: (value: any) => value?.contacts || 0,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={statusLabels[params.value] || params.value}
                    color={statusColors[params.value] || 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Criada em',
            width: 140,
            valueGetter: (value: string) => new Date(value).toLocaleDateString('pt-BR'),
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            renderCell: (params) => (
                <Box>
                    {params.row.status === 'draft' && (
                        <>
                            <IconButton size="small" onClick={() => handleOpenModal(params.row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleStart(params.row.id)} color="success">
                                <PlayIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                    {params.row.status === 'running' && (
                        <IconButton size="small" onClick={() => handleCancel(params.row.id)} color="warning">
                            <StopIcon fontSize="small" />
                        </IconButton>
                    )}
                    {['draft', 'completed', 'cancelled'].includes(params.row.status) && (
                        <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Campanhas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Nova Campanha
                </Button>
            </Box>

            <Paper sx={{ height: 'calc(100% - 60px)' }}>
                <DataGrid
                    rows={campaigns}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                    }}
                />
            </Paper>

            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Nome da Campanha"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Mensagem"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            multiline
                            rows={5}
                            fullWidth
                            helperText="Use {nome} para personalizar com o nome do contato"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Campaigns;
