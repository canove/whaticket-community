import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    QrCode as QrCodeIcon,
    PowerSettingsNew as DisconnectIcon,
    WhatsApp as WhatsAppIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

import whatsappService from '@/services/whatsappService';
import { WhatsApp } from '@/types/whatsapp';
import ConnectionModal from './ConnectionModal';
import QrCodeModal from './QrCodeModal';
import { useSocket } from '@/context/SocketContext';

const Connections: React.FC = () => {
    const [whatsapps, setWhatsapps] = useState<WhatsApp[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedWhatsApp, setSelectedWhatsApp] = useState<WhatsApp | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<WhatsApp | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { socket } = useSocket();

    const fetchWhatsApps = async () => {
        setLoading(true);
        try {
            const data = await whatsappService.list();
            setWhatsapps(data);
        } catch (err) {
            toast.error('Erro ao carregar conexões');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWhatsApps();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleWhatsAppUpdate = (data: { whatsapp: WhatsApp }) => {
            setWhatsapps((prev) =>
                prev.map((w) => (w.id === data.whatsapp.id ? data.whatsapp : w))
            );
        };

        const handleWhatsAppDelete = (data: { whatsappId: number }) => {
            setWhatsapps((prev) => prev.filter((w) => w.id !== data.whatsappId));
        };

        socket.on('whatsapp:update', handleWhatsAppUpdate);
        socket.on('whatsapp:session', () => {
            // Request full list refresh on session update to ensure consistent state
            fetchWhatsApps();
        });
        socket.on('whatsapp:connection', () => {
            // Refresh when connection status changes
            fetchWhatsApps();
        });
        socket.on('whatsapp:delete', handleWhatsAppDelete);

        return () => {
            socket.off('whatsapp:update', handleWhatsAppUpdate);
            socket.off('whatsapp:session');
            socket.off('whatsapp:connection');
            socket.off('whatsapp:delete', handleWhatsAppDelete);
        };
    }, [socket]);

    const handleOpenModal = (whatsapp?: WhatsApp) => {
        setSelectedWhatsApp(whatsapp || null);
        setModalOpen(true);
    };

    const handleOpenQrModal = (whatsapp: WhatsApp) => {
        setSelectedWhatsApp(whatsapp);
        setQrModalOpen(true);
    };

    const handleDisconnect = async (whatsappId: number | undefined) => {
        if (!whatsappId) return;
        if (confirm('Deseja realmente desconectar?')) {
            try {
                await whatsappService.disconnect(whatsappId);
                toast.success('Desconexão solicitada!');
            } catch (err) {
                toast.error('Erro ao desconectar');
            }
        }
    };

    const handleRestart = async (whatsappId: number | undefined) => {
        if (!whatsappId) return;
        try {
            await whatsappService.restart(whatsappId);
            toast.success('Reinicialização solicitada!');
        } catch (err) {
            toast.error('Erro ao reiniciar conexão');
        }
    };

    const handleTestConnection = async (whatsappId: number | undefined) => {
        if (!whatsappId) return;
        try {
            const data = await whatsappService.getStatus(whatsappId);
            if (data.connected) {
                toast.success('Conexão ativa e funcionando!');
            } else {
                toast.warn(`Conexão instável: ${data.status}`);
            }
        } catch (err) {
            toast.error('Erro ao testar conexão');
        }
    };

    const handleDeleteClick = (whatsapp: WhatsApp) => {
        setDeleteTarget(whatsapp);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget?.id) return;
        setDeleting(true);
        try {
            await whatsappService.remove(deleteTarget.id);
            toast.success('Conexão excluída!');
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            fetchWhatsApps();
        } catch (err) {
            toast.error('Erro ao excluir conexão');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    const renderStatus = (whatsapp: WhatsApp) => {
        const { status, number } = whatsapp;
        // Status can be upper or lowercase, handle both
        const normalizedStatus = status?.toUpperCase();

        if (normalizedStatus === 'QRCODE') {
            return (
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenQrModal(whatsapp)}
                    startIcon={<QrCodeIcon />}
                >
                    LER QR CODE
                </Button>
            );
        }
        if (normalizedStatus === 'CONNECTED') {
            return (
                <Box textAlign="center">
                    <Chip label="Conectado" color="success" size="small" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                        {number}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDisconnect(whatsapp.id)}
                        startIcon={<DisconnectIcon />}
                        sx={{ mt: 1 }}
                    >
                        Desconectar
                    </Button>
                    <Box mt={1} display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Reiniciar Conexão">
                            <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleRestart(whatsapp.id)}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Testar Conexão">
                            <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleTestConnection(whatsapp.id)}
                            >
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            );
        }
        if (normalizedStatus === 'DISCONNECTED' || !status) {
            return (
                <Box textAlign="center">
                    <Chip label="Desconectado" color="default" size="small" sx={{ mb: 1 }} />
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleOpenQrModal(whatsapp)}
                        startIcon={<WhatsAppIcon />}
                        sx={{ mt: 1 }}
                    >
                        Conectar
                    </Button>
                </Box>
            );
        }
        if (normalizedStatus === 'OPENING') {
            return (
                <Box textAlign="center">
                    <CircularProgress size={24} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                        Conectando...
                    </Typography>
                </Box>
            );
        }
        return (
            <Chip label={status || 'Desconhecido'} size="small" />
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1">
                    Conexões
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Adicionar WhatsApp
                </Button>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : whatsapps.length === 0 ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py={8}
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'divider'
                    }}
                >
                    <WhatsAppIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Nenhuma conexão configurada
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3} textAlign="center" maxWidth={400}>
                        Adicione sua primeira conexão WhatsApp para começar a receber e enviar mensagens.
                    </Typography>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenModal()}
                        size="large"
                    >
                        Adicionar WhatsApp
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {whatsapps.map((whatsapp) => (
                        <Grid item xs={12} sm={6} md={4} key={whatsapp.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                    {whatsapp.isDefault && (
                                        <Chip
                                            label="Padrão"
                                            color="info"
                                            size="small"
                                            sx={{ position: 'absolute', top: 10, right: 10 }}
                                        />
                                    )}

                                    <WhatsAppIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />

                                    <Typography variant="h6" gutterBottom>
                                        {whatsapp.name}
                                    </Typography>

                                    <Box minHeight={80} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                        {renderStatus(whatsapp)}
                                    </Box>

                                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 2 }}>
                                        Atualizado em: {format(parseISO(whatsapp.updatedAt), 'dd/MM/yyyy HH:mm')}
                                    </Typography>

                                </CardContent>
                                <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
                                    <Tooltip title="Editar">
                                        <IconButton size="small" onClick={() => handleOpenModal(whatsapp)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Excluir">
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(whatsapp)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ConnectionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                whatsappId={selectedWhatsApp?.id || null}
                onSave={fetchWhatsApps}
            />

            <QrCodeModal
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                whatsappId={selectedWhatsApp?.id || null}
            />

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Excluir Conexão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir a conexão <strong>{deleteTarget?.name}</strong>?
                        Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={deleting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
                        {deleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Connections;
