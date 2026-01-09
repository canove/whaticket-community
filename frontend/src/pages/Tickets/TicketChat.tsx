import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Avatar, IconButton, Paper, CircularProgress } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Ticket } from '@/types/ticket';
import { Message as MessageType } from '@/types/message';
import api from '@/services/api';
import { useSocket } from '@/context/SocketContext'; // Adjust path if needed
import MessageInput from './MessageInput';
import Message from './Message';
import { toast } from 'react-toastify';

interface TicketChatProps {
    ticket?: Ticket | null;
}

const TicketChat: React.FC<TicketChatProps> = ({ ticket }) => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState(false);
    const { socket } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!ticket) return;

        setLoading(true);
        setMessages([]);

        const fetchMessages = async () => {
            try {
                const { data } = await api.get<{ messages: MessageType[] }>(`/messages/${ticket.id}`, {
                    params: { pageNumber: 1 } // TODO: Implement infinite scroll
                });
                // Backend returns oldest first or newest first? 
                // Usually newest first (desc) for pagination, but chat needs oldest first (asc).
                // If backend returns DESC, we reverse. Let's assume backend returns array.
                // Whaticket legacy returns { messages: [], count: ... } and usually DESC.

                // Let's reverse to show oldest at top, newest at bottom
                setMessages(data.messages.reverse());
                scrollToBottom();
            } catch (err) {
                toast.error('Erro ao carregar mensagens');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [ticket?.id]);

    useEffect(() => {
        if (!socket || !ticket) return;

        // Join the ticket room to receive updates
        socket.emit('join:ticket', ticket.id);

        const handleMessage = (data: { message: MessageType; ticket: Ticket; contact: any }) => {
            if (data.ticket.id === ticket.id) {
                setMessages((prev) => {
                    // Avoid duplicates if necessary, though typical handleMessage adds to end
                    if (prev.find(m => m.id === data.message.id)) return prev;
                    return [...prev, data.message];
                });
                scrollToBottom();
            }
        };

        socket.on('appMessage', handleMessage);
        socket.on('message:created', handleMessage);

        return () => {
            socket.emit('leave:ticket', ticket.id);
            socket.off('appMessage', handleMessage);
            socket.off('message:created', handleMessage);
        };
    }, [socket, ticket]);

    if (!ticket) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f0f2f5',
                    flexDirection: 'column'
                }}
            >
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    Whaticket Enterprise
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Selecione um ticket para iniciar o atendimento.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#efe7dd' }}> {/* Whatsapp BG color ish */}

            {/* Header */}
            <Paper square elevation={1} sx={{ p: 1, px: 2, display: 'flex', alignItems: 'center', bgcolor: '#f0f2f5', zIndex: 1 }}>
                <Avatar src={ticket.contact?.profilePicUrl} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" component="div">
                        {ticket.contact?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {ticket.user ? `Atribuído a: ${ticket.user.name}` : 'Aguardando fila'}
                    </Typography>
                </Box>
                <IconButton>
                    <MoreVertIcon />
                </IconButton>
            </Paper>

            {/* Messages Area */}
            <Box
                ref={messagesContainerRef}
                sx={{
                    flexGrow: 1,
                    p: 2,
                    overflowY: 'auto',
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', // WhatsApp generic bg
                    backgroundRepeat: 'repeat'
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    messages.map((msg) => (
                        <Message key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 1, bgcolor: '#f0f2f5' }}>
                <MessageInput
                    ticketId={ticket.id}
                    disabled={ticket.status === 'closed'} // Disable if closed? Or allow reopen? Usually allow.
                />
            </Box>
        </Box>
    );
};

export default TicketChat;
