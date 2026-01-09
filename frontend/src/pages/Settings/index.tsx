import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Business as BusinessIcon,
    Notifications as NotificationsIcon,
    Schedule as ScheduleIcon,
    Message as MessageIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

const Settings: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Company settings
    const [companySettings, setCompanySettings] = useState({
        companyName: 'Whaticket Enterprise',
        companyEmail: 'contato@empresa.com',
        companyPhone: '(11) 99999-9999',
        timezone: 'America/Sao_Paulo',
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        soundNotifications: true,
        desktopNotifications: false,
        newTicketAlert: true,
        messageAlert: true,
    });

    // Ticket settings
    const [ticketSettings, setTicketSettings] = useState({
        autoCloseTime: 24,
        maxTicketsPerUser: 10,
        requireQueueSelection: true,
        showContactInfo: true,
        enableRatings: true,
    });

    // Message settings
    const [messageSettings, setMessageSettings] = useState({
        greetingMessage: 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudar?',
        farewellMessage: 'Obrigado pelo contato! Tenha um ótimo dia!',
        absenceMessage: 'No momento estamos fora do horário de atendimento. Retornaremos em breve.',
        enableGreeting: true,
        enableFarewell: true,
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(true);
            toast.success('Configurações salvas com sucesso!');
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configurações
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Gerencie as configurações do sistema
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Configurações salvas com sucesso!
                </Alert>
            )}

            <Card>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab icon={<BusinessIcon />} label="Empresa" iconPosition="start" />
                    <Tab icon={<NotificationsIcon />} label="Notificações" iconPosition="start" />
                    <Tab icon={<ScheduleIcon />} label="Tickets" iconPosition="start" />
                    <Tab icon={<MessageIcon />} label="Mensagens" iconPosition="start" />
                </Tabs>

                <CardContent>
                    {/* Company Settings Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h6" gutterBottom>
                            Informações da Empresa
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome da Empresa"
                                    value={companySettings.companyName}
                                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email de Contato"
                                    value={companySettings.companyEmail}
                                    onChange={(e) => setCompanySettings({ ...companySettings, companyEmail: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Telefone"
                                    value={companySettings.companyPhone}
                                    onChange={(e) => setCompanySettings({ ...companySettings, companyPhone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Fuso Horário</InputLabel>
                                    <Select
                                        value={companySettings.timezone}
                                        label="Fuso Horário"
                                        onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                                    >
                                        <MenuItem value="America/Sao_Paulo">São Paulo (GMT-3)</MenuItem>
                                        <MenuItem value="America/Manaus">Manaus (GMT-4)</MenuItem>
                                        <MenuItem value="America/Recife">Recife (GMT-3)</MenuItem>
                                        <MenuItem value="America/Fortaleza">Fortaleza (GMT-3)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Notification Settings Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Typography variant="h6" gutterBottom>
                            Preferências de Notificação
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.emailNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Notificações por Email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.soundNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, soundNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Notificações Sonoras"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.desktopNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, desktopNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Notificações no Desktop"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.newTicketAlert}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, newTicketAlert: e.target.checked })}
                                        />
                                    }
                                    label="Alertar sobre novos tickets"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.messageAlert}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, messageAlert: e.target.checked })}
                                        />
                                    }
                                    label="Alertar sobre novas mensagens"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Ticket Settings Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Typography variant="h6" gutterBottom>
                            Configurações de Tickets
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Fechar ticket automaticamente após (horas)"
                                    value={ticketSettings.autoCloseTime}
                                    onChange={(e) => setTicketSettings({ ...ticketSettings, autoCloseTime: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Máximo de tickets por usuário"
                                    value={ticketSettings.maxTicketsPerUser}
                                    onChange={(e) => setTicketSettings({ ...ticketSettings, maxTicketsPerUser: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={ticketSettings.requireQueueSelection}
                                            onChange={(e) => setTicketSettings({ ...ticketSettings, requireQueueSelection: e.target.checked })}
                                        />
                                    }
                                    label="Exigir seleção de fila"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={ticketSettings.showContactInfo}
                                            onChange={(e) => setTicketSettings({ ...ticketSettings, showContactInfo: e.target.checked })}
                                        />
                                    }
                                    label="Exibir informações do contato"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={ticketSettings.enableRatings}
                                            onChange={(e) => setTicketSettings({ ...ticketSettings, enableRatings: e.target.checked })}
                                        />
                                    }
                                    label="Habilitar avaliações de atendimento"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Message Settings Tab */}
                    <TabPanel value={tabValue} index={3}>
                        <Typography variant="h6" gutterBottom>
                            Mensagens Automáticas
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={messageSettings.enableGreeting}
                                            onChange={(e) => setMessageSettings({ ...messageSettings, enableGreeting: e.target.checked })}
                                        />
                                    }
                                    label="Enviar mensagem de saudação"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Mensagem de Saudação"
                                    value={messageSettings.greetingMessage}
                                    onChange={(e) => setMessageSettings({ ...messageSettings, greetingMessage: e.target.value })}
                                    disabled={!messageSettings.enableGreeting}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={messageSettings.enableFarewell}
                                            onChange={(e) => setMessageSettings({ ...messageSettings, enableFarewell: e.target.checked })}
                                        />
                                    }
                                    label="Enviar mensagem de despedida"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Mensagem de Despedida"
                                    value={messageSettings.farewellMessage}
                                    onChange={(e) => setMessageSettings({ ...messageSettings, farewellMessage: e.target.value })}
                                    disabled={!messageSettings.enableFarewell}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Mensagem de Ausência"
                                    value={messageSettings.absenceMessage}
                                    onChange={(e) => setMessageSettings({ ...messageSettings, absenceMessage: e.target.value })}
                                    helperText="Enviada fora do horário de atendimento"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <Divider sx={{ my: 3 }} />

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : 'Salvar Configurações'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Settings;
