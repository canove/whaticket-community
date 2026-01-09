import React, { useState, useEffect, DragEvent } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import tagService from '@/services/tagService';
import ticketService from '@/services/ticketService';
import { Tag } from '@/types/tag';
import { Ticket } from '@/types/ticket';

interface KanbanColumn {
    id: string;
    name: string;
    color: string;
    tickets: Ticket[];
}

const Kanban: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState<KanbanColumn[]>([]);
    const [dragging, setDragging] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tags, ticketsResponse] = await Promise.all([
                tagService.list(),
                ticketService.list({ status: 'open' }),
            ]);

            const tickets = ticketsResponse.tickets || [];

            // Create columns: one per tag + "Sem Etiqueta"
            const tagColumns: KanbanColumn[] = tags.map((tag: Tag) => ({
                id: `tag-${tag.id}`,
                name: tag.name,
                color: tag.color,
                tickets: tickets.filter((t: Ticket) =>
                    t.tags?.some((tt: any) => tt.tagId === tag.id || tt.tag?.id === tag.id)
                ),
            }));

            // Add "No Tag" column for untagged tickets
            const taggedTicketIds = new Set(
                tagColumns.flatMap(col => col.tickets.map(t => t.id))
            );
            const untaggedTickets = tickets.filter(
                (t: Ticket) => !taggedTicketIds.has(t.id)
            );

            const allColumns: KanbanColumn[] = [
                {
                    id: 'no-tag',
                    name: 'Sem Etiqueta',
                    color: '#95a5a6',
                    tickets: untaggedTickets,
                },
                ...tagColumns,
            ];

            setColumns(allColumns);
        } catch (err) {
            toast.error('Erro ao carregar dados do Kanban');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: DragEvent, ticketId: number) => {
        e.dataTransfer.setData('ticketId', ticketId.toString());
        setDragging(ticketId.toString());
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: DragEvent, column: KanbanColumn) => {
        e.preventDefault();
        const ticketId = parseInt(e.dataTransfer.getData('ticketId'));
        setDragging(null);

        if (!ticketId) return;

        try {
            // Find current column and remove ticket from it
            const currentColumn = columns.find(col =>
                col.tickets.some(t => t.id === ticketId)
            );

            if (currentColumn?.id === column.id) return; // Same column

            // If moving to a tag column, attach tag
            if (column.id.startsWith('tag-')) {
                const tagId = parseInt(column.id.replace('tag-', ''));

                // Remove from old tag if it was in a tag column
                if (currentColumn?.id.startsWith('tag-')) {
                    const oldTagId = parseInt(currentColumn.id.replace('tag-', ''));
                    await tagService.detachFromTicket(oldTagId, ticketId);
                }

                await tagService.attachToTicket(tagId, ticketId);
            } else if (column.id === 'no-tag' && currentColumn?.id.startsWith('tag-')) {
                // Moving to "no tag" - remove current tag
                const oldTagId = parseInt(currentColumn.id.replace('tag-', ''));
                await tagService.detachFromTicket(oldTagId, ticketId);
            }

            // Refresh data
            await fetchData();
            toast.success('Ticket movido!');
        } catch (err) {
            toast.error('Erro ao mover ticket');
            console.error(err);
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Agora';
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Kanban
            </Typography>

            <Box sx={{
                display: 'flex',
                gap: 2,
                height: 'calc(100% - 50px)',
                overflowX: 'auto',
                pb: 2,
            }}>
                {columns.map((column) => (
                    <Paper
                        key={column.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column)}
                        sx={{
                            minWidth: 280,
                            maxWidth: 280,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'background.default',
                            borderTop: `4px solid ${column.color}`,
                        }}
                    >
                        <Box sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: column.color,
                                    }}
                                />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {column.name}
                                </Typography>
                            </Box>
                            <Chip
                                label={column.tickets.length}
                                size="small"
                                sx={{ bgcolor: column.color, color: 'white' }}
                            />
                        </Box>

                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}>
                            {column.tickets.map((ticket) => (
                                <Card
                                    key={ticket.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                                    sx={{
                                        cursor: 'grab',
                                        opacity: dragging === ticket.id.toString() ? 0.5 : 1,
                                        '&:hover': {
                                            boxShadow: 3,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                                                {ticket.contact?.name?.[0] || '?'}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
                                                {ticket.contact?.name || 'Contato'}
                                            </Typography>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {ticket.lastMessage || 'Sem mensagens'}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mt: 1,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTime(ticket.updatedAt)}
                                                </Typography>
                                            </Box>
                                            <Tooltip title="Ver ticket">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/tickets?id=${ticket.id}`)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}

                            {column.tickets.length === 0 && (
                                <Box sx={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                    fontSize: 14,
                                }}>
                                    Nenhum ticket
                                </Box>
                            )}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

export default Kanban;
