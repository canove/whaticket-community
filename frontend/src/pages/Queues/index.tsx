import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import queueService from '@/services/queueService';
import { Queue } from '@/types/queue';
import QueueModal from './QueueModal';
import { ptBR } from '@mui/x-data-grid/locales';

const Queues: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);

    const fetchQueues = async () => {
        setLoading(true);
        try {
            const data = await queueService.list();
            setQueues(data);
        } catch (err) {
            toast.error('Erro ao carregar filas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueues();
    }, []);

    const handleOpenModal = (queueId?: number) => {
        setSelectedQueueId(queueId || null);
        setModalOpen(true);
    };

    const handleDelete = async (queueId: number) => {
        if (window.confirm('Deseja realmente excluir esta fila?')) {
            try {
                await queueService.remove(queueId);
                toast.success('Fila excluída!');
                fetchQueues();
            } catch (err) {
                toast.error('Erro ao excluir fila');
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', flex: 1 },
        {
            field: 'color',
            headerName: 'Cor',
            width: 100,
            renderCell: (params) => (
                <Box
                    sx={{
                        bgcolor: params.value,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        border: '1px solid #ccc'
                    }}
                />
            )
        },
        { field: 'greetingMessage', headerName: 'Saudação', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenModal(params.row.id)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
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
                    Filas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Nova Fila
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={queues}
                    columns={columns}
                    loading={loading}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                />
            </Paper>

            <QueueModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                queueId={selectedQueueId}
                onSave={fetchQueues}
            />
        </Box>
    );
};

export default Queues;
