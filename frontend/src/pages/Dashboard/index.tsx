import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    WhatsApp as WhatsAppIcon,
    People as PeopleIcon,
    ConfirmationNumber as TicketIcon,
    HourglassEmpty as PendingIcon,
    ContactPhone as ContactIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/context/AuthContext';
import api from '@/services/api';

interface DashboardStats {
    totalTickets: number;
    openTickets: number;
    pendingTickets: number;
    closedTickets: number;
    totalContacts: number;
    totalUsers: number;
    totalConnections: number;
    connectedWhatsApps: number;
}

const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Avatar
                    sx={{
                        bgcolor: color,
                        width: 56,
                        height: 56,
                    }}
                >
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalTickets: 0,
        openTickets: 0,
        pendingTickets: 0,
        closedTickets: 0,
        totalContacts: 0,
        totalUsers: 0,
        totalConnections: 0,
        connectedWhatsApps: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Try to fetch real data, fallback to 0 if endpoints fail
                const [, , usersRes, whatsappsRes] = await Promise.allSettled([
                    api.get('/tickets?limit=1'),
                    api.get('/contacts?limit=1'),
                    api.get('/users'),
                    api.get('/whatsapp'),
                ]);

                const newStats: DashboardStats = {
                    totalTickets: 0,
                    openTickets: 0,
                    pendingTickets: 0,
                    closedTickets: 0,
                    totalContacts: 0,
                    totalUsers: 0,
                    totalConnections: 0,
                    connectedWhatsApps: 0,
                };

                if (usersRes.status === 'fulfilled') {
                    newStats.totalUsers = usersRes.value.data?.length || 0;
                }

                if (whatsappsRes.status === 'fulfilled') {
                    const whatsapps = whatsappsRes.value.data || [];
                    newStats.totalConnections = whatsapps.length;
                    newStats.connectedWhatsApps = whatsapps.filter(
                        (w: any) => w.status?.toUpperCase() === 'CONNECTED'
                    ).length;
                }

                setStats(newStats);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Bem-vindo ao Whaticket Enterprise. Aqui está um resumo do seu sistema.
                </Typography>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tickets Abertos"
                        value={stats.openTickets}
                        icon={<TicketIcon />}
                        color="#2196f3"
                        subtitle="Aguardando atendimento"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tickets Pendentes"
                        value={stats.pendingTickets}
                        icon={<PendingIcon />}
                        color="#ff9800"
                        subtitle="Em andamento"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Conexões WhatsApp"
                        value={`${stats.connectedWhatsApps}/${stats.totalConnections}`}
                        icon={<WhatsAppIcon />}
                        color="#25d366"
                        subtitle="Conectadas / Total"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Usuários"
                        value={stats.totalUsers}
                        icon={<PeopleIcon />}
                        color="#9c27b0"
                        subtitle="Cadastrados no sistema"
                    />
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Ações Rápidas
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <List>
                                <ListItem
                                    component="a"
                                    href="/tickets"
                                    sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            <TicketIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Ver Tickets"
                                        secondary="Gerencie os atendimentos"
                                    />
                                </ListItem>
                                <ListItem
                                    component="a"
                                    href="/connections"
                                    sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'success.main' }}>
                                            <WhatsAppIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Conexões WhatsApp"
                                        secondary="Configure suas conexões"
                                    />
                                </ListItem>
                                <ListItem
                                    component="a"
                                    href="/contacts"
                                    sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'info.main' }}>
                                            <ContactIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Contatos"
                                        secondary="Visualize seus contatos"
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Status do Sistema
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">Backend API</Typography>
                                    <Chip label="Online" color="success" size="small" />
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">Banco de Dados</Typography>
                                    <Chip label="Conectado" color="success" size="small" />
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">WebSocket</Typography>
                                    <Chip label="Ativo" color="success" size="small" />
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">WhatsApp Service</Typography>
                                    <Chip
                                        label={stats.connectedWhatsApps > 0 ? 'Conectado' : 'Aguardando'}
                                        color={stats.connectedWhatsApps > 0 ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
