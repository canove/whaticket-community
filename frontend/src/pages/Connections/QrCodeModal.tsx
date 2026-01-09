import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    CircularProgress,
    Box,
    DialogActions,
    Button,
    Alert,
} from '@mui/material';
import { useSocket } from '@/context/SocketContext';
import { QRCodeSVG } from 'qrcode.react';
import whatsappService from '@/services/whatsappService';
import { toast } from 'react-toastify';

interface QrContextModalProps {
    open: boolean;
    onClose: () => void;
    whatsappId: number | null;
}

const QrCodeModal: React.FC<QrContextModalProps> = ({
    open,
    onClose,
    whatsappId,
}) => {
    const { socket } = useSocket();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('INICIANDO...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!whatsappId || !open) return;

        setQrCode(null);
        setStatus('INICIANDO...');
        setError(null);

        // Start session to get QR code
        const startSession = async () => {
            try {
                const result = await whatsappService.startSession(whatsappId);
                if ((result as any)?.qrCode) {
                    setQrCode((result as any).qrCode);
                    setStatus('LER QR CODE');
                } else {
                    setStatus((result as any)?.status || 'AGUARDANDO...');
                }
            } catch (err: any) {
                console.error('Error starting session:', err);
                setError(err.response?.data?.message || 'Erro ao iniciar sessão');
                setStatus('ERRO');
            }
        };

        startSession();
    }, [whatsappId, open]);

    useEffect(() => {
        if (!whatsappId || !socket || !open) return;

        // Backend emits sessionId and qrCode (not whatsappId and qrcode)
        const handleQrCode = (data: { sessionId: number; qrCode: string }) => {
            console.log('Received QR code event:', data);
            if (data.sessionId === whatsappId) {
                setQrCode(data.qrCode);
                setStatus('LER QR CODE');
                setError(null);
            }
        };

        // Handle session/connection updates
        const handleSession = (data: { sessionId: number; status: string; qrcode?: string }) => {
            console.log('Received session event:', data);
            if (data.sessionId === whatsappId) {
                setStatus(data.status.toUpperCase());
                if (data.qrcode) {
                    setQrCode(data.qrcode);
                }
                if (data.status.toUpperCase() === 'CONNECTED') {
                    onClose();
                }
            }
        };

        const handleConnection = (data: { sessionId: number; status: string }) => {
            console.log('Received connection event:', data);
            if (data.sessionId === whatsappId) {
                setStatus(data.status.toUpperCase());
                if (data.status.toUpperCase() === 'CONNECTED') {
                    toast.success('WhatsApp conectado com sucesso!');
                    onClose();
                }
            }
        };

        socket.on('whatsapp:qrcode', handleQrCode);
        socket.on('whatsapp:session', handleSession);
        socket.on('whatsapp:connection', handleConnection);

        return () => {
            socket.off('whatsapp:qrcode', handleQrCode);
            socket.off('whatsapp:session', handleSession);
            socket.off('whatsapp:connection', handleConnection);
        };
    }, [whatsappId, socket, open, onClose]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Conexão WhatsApp</DialogTitle>
            <DialogContent>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={300}
                >
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}

                    {qrCode ? (
                        <>
                            <QRCodeSVG value={qrCode} size={250} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                Abra o WhatsApp no seu celular e escaneie o QR Code
                            </Typography>
                        </>
                    ) : !error ? (
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography variant="body2" color="textSecondary">
                                Gerando QR Code...
                            </Typography>
                        </Box>
                    ) : null}

                    <Typography
                        variant="body1"
                        color={status === 'CONNECTED' ? 'success.main' : 'textSecondary'}
                        sx={{ mt: 3, fontWeight: 'bold' }}
                    >
                        Status: {status}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default QrCodeModal;

