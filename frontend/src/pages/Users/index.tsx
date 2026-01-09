import React, { useState, useEffect, useCallback } from 'react';
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
import userService from '@/services/userService';
import { User } from '@/types/auth';
import UserModal from './UserModal';
import { ptBR } from '@mui/x-data-grid/locales';

const Users: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { users } = await userService.list();
            setUsers(users);
        } catch (err) {
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (userId?: number) => {
        setSelectedUserId(userId || null);
        setModalOpen(true);
    };

    const handleDelete = async (userId: number) => {
        if (window.confirm('Deseja realmente excluir este usuário?')) {
            try {
                await userService.remove(userId);
                toast.success('Usuário excluído!');
                fetchUsers();
            } catch (err) {
                toast.error('Erro ao excluir usuário');
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nome', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'profile', headerName: 'Perfil', width: 130 },
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
                    Usuários
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Novo Usuário
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    loading={loading}
                    localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                />
            </Paper>

            <UserModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                userId={selectedUserId}
                onSave={fetchUsers}
            />
        </Box>
    );
};

export default Users;
