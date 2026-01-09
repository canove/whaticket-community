import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import contactService from '@/services/contactService';
import { Contact } from '@/types/contact';
import ContactModal from './ContactModal';
import { PaginationModel } from '@/types/common';

const Contacts: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [searchParam, setSearchParam] = useState('');

    const [paginationModel, setPaginationModel] = useState<PaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { contacts, count } = await contactService.list({
                searchParam,
                pageNumber: (paginationModel.page + 1).toString(),
            });
            setContacts(contacts);
            setTotal(count);
        } catch (err) {
            toast.error('Erro ao carregar contatos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchContacts();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchParam, paginationModel.page, paginationModel.pageSize]);

    const handleEdit = (id: number) => {
        setSelectedContactId(id);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Deseja realmente excluir este contato?')) {
            try {
                await contactService.remove(id);
                toast.success('Contato excluído!');
                fetchContacts();
            } catch (err) {
                toast.error('Erro ao excluir contato');
            }
        }
    };

    const handleSave = () => {
        fetchContacts();
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'profilePicUrl',
            headerName: '',
            width: 60,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" justifyContent="center" width="100%">
                    {params.value && <img src={params.value as string} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
                </Box>
            )
        },
        { field: 'name', headerName: 'Nome', flex: 1 },
        { field: 'number', headerName: 'WhatsApp', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        onClick={() => handleEdit(params.row.id as number)}
                        color="primary"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDelete(params.row.id as number)}
                        color="error"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" component="h1">
                    Contatos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedContactId(null);
                        setModalOpen(true);
                    }}
                >
                    Novo Contato
                </Button>
            </Stack>

            <Paper sx={{ p: 2 }}>
                <TextField
                    placeholder="Pesquisar..."
                    size="small"
                    fullWidth
                    value={searchParam}
                    onChange={(e) => setSearchParam(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                <div style={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={contacts}
                        columns={columns}
                        rowCount={total}
                        loading={loading}
                        paginationModel={paginationModel}
                        paginationMode="server"
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                    />
                </div>
            </Paper>

            <ContactModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                contactId={selectedContactId}
                onSave={handleSave}
            />
        </Box>
    );
};

export default Contacts;
