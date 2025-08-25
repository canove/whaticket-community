import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Container,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Tab,
  Tabs,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { toast } from "react-toastify";
import SaveIcon from "@mui/icons-material/Save";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ApiIcon from "@mui/icons-material/Api";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(3),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  tabPanel: {
    paddingTop: theme.spacing(2),
  },
  statusChip: {
    margin: theme.spacing(0.5),
  },
  saveButton: {
    marginTop: theme.spacing(2),
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="tabPanel">{children}</Box>}
    </div>
  );
}

const AISettings = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // OpenAI Settings
    openai_api_key: "",
    openai_model: "gpt-3.5-turbo",
    openai_temperature: 0.7,
    openai_max_tokens: 1000,
    openai_enabled: false,
    
    // Audio Transcription Settings
    audio_transcription_enabled: false,
    audio_transcription_provider: "openai",
    audio_auto_transcribe: true,
    transcription_language: "pt-BR",
    
    // AI Agent Settings
    ai_agent_enabled: false,
    ai_agent_prompt: "Você é um assistente inteligente. Ajude o usuário com suas dúvidas de forma clara e educada.",
    ai_sentiment_analysis: true,
    ai_auto_suggestions: true,
    
    // Analytics Settings
    analytics_enabled: true,
    analytics_data_retention_days: 90,
    analytics_real_time: true,
  });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    openai: false,
    transcription: false,
  });

  useEffect(() => {
    fetchAISettings();
    checkConnectionStatus();
  }, []);

  const fetchAISettings = async () => {
    try {
      const { data } = await api.get("/ai-settings");
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      toastError(err);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const { data } = await api.get("/ai-settings/status");
      setConnectionStatus(data);
    } catch (err) {
      console.error("Erro ao verificar status de conexão:", err);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/ai-settings", settings);
      toast.success("Configurações de IA salvas com sucesso!");
      checkConnectionStatus();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service) => {
    try {
      await api.post(`/ai-settings/test/${service}`);
      toast.success(`Conexão com ${service} testada com sucesso!`);
      checkConnectionStatus();
    } catch (err) {
      toastError(err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" gutterBottom>
        <SmartToyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Configurações de Inteligência Artificial
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<SmartToyIcon />} label="OpenAI & Chat" />
          <Tab icon={<RecordVoiceOverIcon />} label="Transcrição de Áudio" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<ApiIcon />} label="API & Integrações" />
        </Tabs>
      </Box>

      {/* Tab 1: OpenAI & Chat Settings */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Configurações do OpenAI" />
              <CardContent>
                <TextField
                  label="Chave da API OpenAI"
                  type="password"
                  value={settings.openai_api_key}
                  onChange={(e) => handleSettingChange("openai_api_key", e.target.value)}
                  fullWidth
                  className={classes.formField}
                  helperText="Sua chave de API da OpenAI"
                />
                
                <FormControl fullWidth className={classes.formField}>
                  <InputLabel>Modelo</InputLabel>
                  <Select
                    value={settings.openai_model}
                    onChange={(e) => handleSettingChange("openai_model", e.target.value)}
                  >
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                    <MenuItem value="gpt-4">GPT-4</MenuItem>
                    <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Temperatura"
                  type="number"
                  value={settings.openai_temperature}
                  onChange={(e) => handleSettingChange("openai_temperature", parseFloat(e.target.value))}
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  fullWidth
                  className={classes.formField}
                  helperText="Controla a criatividade das respostas (0-2)"
                />

                <TextField
                  label="Máximo de Tokens"
                  type="number"
                  value={settings.openai_max_tokens}
                  onChange={(e) => handleSettingChange("openai_max_tokens", parseInt(e.target.value))}
                  fullWidth
                  className={classes.formField}
                  helperText="Limite de tokens para respostas"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.openai_enabled}
                      onChange={(e) => handleSettingChange("openai_enabled", e.target.checked)}
                    />
                  }
                  label="Ativar integração OpenAI"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Agente IA Conversacional" />
              <CardContent>
                <TextField
                  label="Prompt do Sistema"
                  multiline
                  rows={6}
                  value={settings.ai_agent_prompt}
                  onChange={(e) => handleSettingChange("ai_agent_prompt", e.target.value)}
                  fullWidth
                  className={classes.formField}
                  helperText="Define como o agente IA deve se comportar"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.ai_agent_enabled}
                      onChange={(e) => handleSettingChange("ai_agent_enabled", e.target.checked)}
                    />
                  }
                  label="Ativar Agente IA"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.ai_sentiment_analysis}
                      onChange={(e) => handleSettingChange("ai_sentiment_analysis", e.target.checked)}
                    />
                  }
                  label="Análise de Sentimento"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.ai_auto_suggestions}
                      onChange={(e) => handleSettingChange("ai_auto_suggestions", e.target.checked)}
                    />
                  }
                  label="Sugestões Automáticas"
                />

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Status da Conexão:</Typography>
                  <Chip
                    label={connectionStatus.openai ? "Conectado" : "Desconectado"}
                    color={connectionStatus.openai ? "success" : "error"}
                    className={classes.statusChip}
                  />
                  <Button
                    size="small"
                    onClick={() => testConnection("openai")}
                    sx={{ ml: 1 }}
                  >
                    Testar Conexão
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Audio Transcription Settings */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Configurações de Transcrição" />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.audio_transcription_enabled}
                      onChange={(e) => handleSettingChange("audio_transcription_enabled", e.target.checked)}
                    />
                  }
                  label="Ativar Transcrição de Áudio"
                />

                <FormControl fullWidth className={classes.formField}>
                  <InputLabel>Provedor</InputLabel>
                  <Select
                    value={settings.audio_transcription_provider}
                    onChange={(e) => handleSettingChange("audio_transcription_provider", e.target.value)}
                  >
                    <MenuItem value="openai">OpenAI Whisper</MenuItem>
                    <MenuItem value="azure">Azure Speech</MenuItem>
                    <MenuItem value="google">Google Speech-to-Text</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth className={classes.formField}>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    value={settings.transcription_language}
                    onChange={(e) => handleSettingChange("transcription_language", e.target.value)}
                  >
                    <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                    <MenuItem value="en-US">English (US)</MenuItem>
                    <MenuItem value="es-ES">Español</MenuItem>
                    <MenuItem value="auto">Detecção Automática</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.audio_auto_transcribe}
                      onChange={(e) => handleSettingChange("audio_auto_transcribe", e.target.checked)}
                    />
                  }
                  label="Transcrição Automática"
                />

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Status:</Typography>
                  <Chip
                    label={connectionStatus.transcription ? "Ativo" : "Inativo"}
                    color={connectionStatus.transcription ? "success" : "default"}
                    className={classes.statusChip}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Informações sobre Transcrição" />
              <CardContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  A transcrição de áudio converte automaticamente mensagens de voz em texto,
                  facilitando o atendimento e melhorando a experiência do usuário.
                </Alert>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  <strong>Recursos disponíveis:</strong>
                </Typography>
                <ul>
                  <li>Transcrição automática em tempo real</li>
                  <li>Suporte a múltiplos idiomas</li>
                  <li>Processamento em fila para performance</li>
                  <li>Cache inteligente para economia de API</li>
                  <li>Fallback entre diferentes provedores</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Analytics Settings */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Configurações de Analytics" />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.analytics_enabled}
                      onChange={(e) => handleSettingChange("analytics_enabled", e.target.checked)}
                    />
                  }
                  label="Ativar Analytics"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.analytics_real_time}
                      onChange={(e) => handleSettingChange("analytics_real_time", e.target.checked)}
                    />
                  }
                  label="Analytics em Tempo Real"
                />

                <TextField
                  label="Retenção de Dados (dias)"
                  type="number"
                  value={settings.analytics_data_retention_days}
                  onChange={(e) => handleSettingChange("analytics_data_retention_days", parseInt(e.target.value))}
                  inputProps={{ min: 7, max: 365 }}
                  fullWidth
                  className={classes.formField}
                  helperText="Por quanto tempo manter dados analíticos"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Métricas Disponíveis" />
              <CardContent>
                <Typography variant="body2" color="textSecondary" paragraph>
                  O sistema coleta automaticamente as seguintes métricas:
                </Typography>
                <ul>
                  <li>Tempo médio de resposta</li>
                  <li>Taxa de resolução de tickets</li>
                  <li>Volume de atendimentos</li>
                  <li>Atividade dos usuários</li>
                  <li>Uso de transcrição de áudio</li>
                  <li>Performance do agente IA</li>
                  <li>Análise de sentimento</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: API & Integrations */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card className={classes.card}>
              <CardHeader title="API Pública e Integrações" />
              <CardContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Para gerenciar chaves de API e acessar a documentação completa,
                  acesse o Developer Portal através do menu principal.
                </Alert>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  <strong>APIs Disponíveis:</strong>
                </Typography>
                <ul>
                  <li>API de Mensagens</li>
                  <li>API de Contatos</li>
                  <li>API de Transcrições</li>
                  <li>API de Analytics</li>
                  <li>Webhooks para eventos</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
          className={classes.saveButton}
        >
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </Box>
    </Container>
  );
};

export default AISettings;