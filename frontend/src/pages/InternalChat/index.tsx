import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { useAuthStore } from '@/context/AuthContext';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Message {
    id: number;
    body: string;
    fromUserId: number;
    toUserId: number;
    read: boolean;
    createdAt: string;
}

const InternalChat: React.FC = () => {
    const { user: currentUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
            const interval = setInterval(() => fetchMessages(selectedUser.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.users?.filter((u: User) => u.id !== currentUser?.id) || []);
        } catch (err) {
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: number) => {
        try {
            const { data } = await api.get(`/internal-chat/${userId}`);
            setMessages(data);
        } catch (err) {
            console.error('Erro ao carregar mensagens:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            const { data } = await api.post('/internal-chat', {
                toUserId: selectedUser.id,
                body: newMessage.trim(),
            });
            setMessages((prev) => [...prev, data]);
            setNewMessage('');
        } catch (err) {
            toast.error('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', p: 2 }}>
            {/* Users List */}
            <Paper sx={{ width: 280, mr: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">Equipe</Typography>
                </Box>
                <List sx={{ overflow: 'auto', height: 'calc(100% - 56px)' }}>
                    {users.map((user) => (
                        <ListItem
                            key={user.id}
                            component="button"
                            onClick={() => setSelectedUser(user)}
                            sx={{
                                border: 'none',
                                width: '100%',
                                bgcolor: selectedUser?.id === user.id ? 'action.selected' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar>{user.name[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={user.name} secondary={user.email} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Chat Area */}
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedUser ? (
                    <>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>{selectedUser.name[0]}</Avatar>
                            <Typography variant="h6">{selectedUser.name}</Typography>
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                            {messages.map((msg) => (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.fromUserId === currentUser?.id ? 'flex-end' : 'flex-start',
                                        mb: 1,
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 1.5,
                                            maxWidth: '70%',
                                            bgcolor: msg.fromUserId === currentUser?.id ? 'primary.main' : 'grey.100',
                                            color: msg.fromUserId === currentUser?.id ? 'white' : 'text.primary',
                                        }}
                                    >
                                        <Typography variant="body2">{msg.body}</Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                textAlign: 'right',
                                                mt: 0.5,
                                                opacity: 0.8,
                                            }}
                                        >
                                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                            <div ref={messagesEndRef} />
                        </Box>

                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Digite sua mensagem..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                size="small"
                                multiline
                                maxRows={4}
                            />
                            <IconButton color="primary" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Selecione um usuário para conversar</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default InternalChat;
