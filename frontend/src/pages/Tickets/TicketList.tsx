import React, { useEffect, useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Divider,
    Paper,
    Box,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Badge,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Ticket } from '@/types/ticket';
import ticketService from '@/services/ticketService';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';

interface TicketListProps {
    onSelectTicket: (ticket: Ticket) => void;
    selectedTicketId?: number | null;
}

const TicketList: React.FC<TicketListProps> = ({ onSelectTicket, selectedTicketId }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState('pending');
    const [searchParam, setSearchParam] = useState('');
    const { socket } = useSocket();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const { tickets: data } = await ticketService.list({
                status: tab,
                searchParam,
                showAll: 'true',
            });
            setTickets(data);
        } catch (err) {
            toast.error('Erro ao carregar tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTickets();
        }, 500);
        return () => clearTimeout(timeout);
    }, [tab, searchParam]);

    useEffect(() => {
        if (!socket) return;

        const handleTicketUpdated = (data: Ticket) => {
            if (data.status === tab) {
                setTickets((prev) => {
                    const index = prev.findIndex((t) => t.id === data.id);
                    if (index !== -1) {
                        const newTickets = [...prev];
                        newTickets[index] = data;
                        // Move to top if updated? Usually yes for lastMessage
                        newTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                        return newTickets;
                    } else {
                        return [data, ...prev];
                    }
                });
            } else {
                // Status changed, remove from this list
                setTickets((prev) => prev.filter((t) => t.id !== data.id));
            }
        };

        const handleTicketCreated = (data: Ticket) => {
            if (data.status === tab) {
                setTickets((prev) => [data, ...prev]);
            }
        };

        socket.on('ticket:updated', handleTicketUpdated);
        socket.on('ticket:created', handleTicketCreated);
        // Legacy compatibility
        socket.on('ticket:update', handleTicketUpdated);

        return () => {
            socket.off('ticket:updated', handleTicketUpdated);
            socket.off('ticket:created', handleTicketCreated);
            socket.off('ticket:update', handleTicketUpdated);
        };
    }, [socket, tab]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 1 }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{ minHeight: '48px' }}
                >
                    <Tab label="Abertos" value="open" sx={{ minHeight: '48px', py: 0 }} />
                    <Tab label="Pendentes" value="pending" sx={{ minHeight: '48px', py: 0 }} />
                    <Tab label="Fechados" value="closed" sx={{ minHeight: '48px', py: 0 }} />
                </Tabs>
                <Box sx={{ p: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar tickets..."
                        value={searchParam}
                        onChange={(e) => setSearchParam(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                {tickets.length === 0 && !loading && (
                    <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                        Nenhum ticket encontrado.
                    </Typography>
                )}
                {tickets.map((ticket) => (
                    <React.Fragment key={ticket.id}>
                        <ListItem
                            alignItems="flex-start"
                            disablePadding
                            sx={{
                                cursor: 'pointer',
                                bgcolor: selectedTicketId === ticket.id ? 'action.selected' : 'inherit',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={() => onSelectTicket(ticket)}
                        >
                            <ListItemAvatar sx={{ mt: 1.5, ml: 1.5 }}>
                                <Avatar alt={ticket.contact?.name} src={ticket.contact?.profilePicUrl} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" width="100%">
                                        <Typography variant="subtitle2" component="span" noWrap sx={{ maxWidth: '70%' }}>
                                            {ticket.contact?.name || 'Desconhecido'}
                                        </Typography>
                                        {ticket.updatedAt && (
                                            <Typography variant="caption" color="text.secondary">
                                                {format(parseISO(ticket.updatedAt), 'HH:mm')}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" display="flex" flexDirection="column">
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                            noWrap
                                            sx={{
                                                fontWeight: ticket.unreadMessages > 0 ? 'bold' : 'normal',
                                            }}
                                        >
                                            {ticket.lastMessage || ''}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                            <Typography variant="caption" color="text.secondary">
                                                {ticket.user?.name || 'Fila'}
                                            </Typography>
                                            {ticket.unreadMessages > 0 && (
                                                <Badge badgeContent={ticket.unreadMessages} color="success" />
                                            )}
                                        </Box>
                                    </Box>
                                }
                                sx={{ my: 1, mr: 1 }}
                            />
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default TicketList;
