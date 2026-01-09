import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '@/services/api';

interface Schedule {
    id: number;
    body: string;
    sendAt: string;
    sentAt: string | null;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    contactId: number;
    contact?: { id: number; name: string; number: string };
    createdAt: string;
}

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    sent: 'success',
    failed: 'error',
    cancelled: 'default',
};

const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    sent: 'Enviado',
    failed: 'Falhou',
    cancelled: 'Cancelado',
};

const formatDateTimeLocal = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const Schedules: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Schedule | null>(null);
    const [body, setBody] = useState('');
    const [sendAt, setSendAt] = useState(formatDateTimeLocal(new Date()));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/schedules');
            setSchedules(data);
        } catch (err) {
            toast.error('Erro ao carregar agendamentos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (schedule?: Schedule) => {
        if (schedule) {
            setEditing(schedule);
            setBody(schedule.body);
            setSendAt(formatDateTimeLocal(new Date(schedule.sendAt)));
        } else {
            setEditing(null);
            setBody('');
            setSendAt(formatDateTimeLocal(new Date()));
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleSave = async () => {
        if (!body.trim() || !sendAt) {
            toast.warning('Preencha todos os campos');
            return;
        }

        setSaving(true);
        try {
            if (editing) {
                await api.put(`/schedules/${editing.id}`, { body, sendAt: new Date(sendAt).toISOString() });
                toast.success('Agendamento atualizado!');
            } else {
                toast.info('Selecione um contato na página de tickets para criar agendamentos');
            }
            handleCloseModal();
            fetchSchedules();
        } catch (err) {
            toast.error('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await api.post(`/schedules/${id}/cancel`);
            toast.success('Agendamento cancelado');
            fetchSchedules();
        } catch (err) {
            toast.error('Erro ao cancelar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir agendamento?')) return;
        try {
            await api.delete(`/schedules/${id}`);
            toast.success('Excluído!');
            fetchSchedules();
        } catch (err) {
            toast.error('Erro ao excluir');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'contact',
            headerName: 'Contato',
            width: 180,
            valueGetter: (value: any) => value?.name || '-',
        },
        {
            field: 'body',
            headerName: 'Mensagem',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'sendAt',
            headerName: 'Enviar em',
            width: 160,
            valueGetter: (value: string) => new Date(value).toLocaleString('pt-BR'),
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
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            renderCell: (params) => (
                <Box>
                    {params.row.status === 'pending' && (
                        <>
                            <IconButton size="small" onClick={() => handleOpenModal(params.row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleCancel(params.row.id)}>
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                    <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Agendamentos</Typography>
            </Box>

            <Paper sx={{ height: 'calc(100% - 60px)' }}>
                <DataGrid
                    rows={schedules}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'sendAt', sort: 'asc' }] },
                    }}
                />
            </Paper>

            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Mensagem"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            multiline
                            rows={4}
                            fullWidth
                        />
                        <TextField
                            label="Data/Hora de Envio"
                            type="datetime-local"
                            value={sendAt}
                            onChange={(e) => setSendAt(e.target.value)}
                            fullWidth
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
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

export default Schedules;
