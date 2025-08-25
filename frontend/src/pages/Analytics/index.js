import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import GetAppIcon from "@mui/icons-material/GetApp";
import { format, subDays, subHours } from "date-fns";
import { ptBR } from "date-fns/locale";

import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  card: {
    height: "100%",
  },
  metricValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  metricChange: {
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  positive: {
    color: theme.palette.success.main,
  },
  negative: {
    color: theme.palette.error.main,
  },
  chartContainer: {
    height: 300,
    width: "100%",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  filterBar: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  exportButton: {
    marginLeft: theme.spacing(1),
  },
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("7d");
  const [metrics, setMetrics] = useState({
    overview: [],
    responseTime: [],
    ticketVolume: [],
    resolutionRate: [],
    userActivity: [],
    transcriptionUsage: [],
    aiAgentUsage: [],
    sentimentAnalysis: [],
  });
  const [kpis, setKpis] = useState({
    avgResponseTime: { value: 0, change: 0 },
    resolutionRate: { value: 0, change: 0 },
    ticketCount: { value: 0, change: 0 },
    activeUsers: { value: 0, change: 0 },
    transcriptions: { value: 0, change: 0 },
    aiInteractions: { value: 0, change: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [metricsResponse, kpisResponse] = await Promise.all([
        api.get(`/analytics/metrics?period=${period}`),
        api.get(`/analytics/kpis?period=${period}`),
      ]);

      setMetrics(metricsResponse.data);
      setKpis(kpisResponse.data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleExportReport = async (format = 'pdf') => {
    try {
      const response = await api.post(`/analytics/export`, {
        format,
        period,
      });
      
      // Download do arquivo
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${format}.${format}`;
      link.click();
      
      toast.success("Relatório exportado com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'time':
        return `${Math.round(value)}min`;
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'number':
        return value.toLocaleString('pt-BR');
      default:
        return value;
    }
  };

  const renderChangeIndicator = (change) => {
    if (change === 0) return null;
    
    return (
      <Box display="flex" alignItems="center" mt={1}>
        {change > 0 ? (
          <TrendingUpIcon className={`${classes.metricChange} ${classes.positive}`} />
        ) : (
          <TrendingDownIcon className={`${classes.metricChange} ${classes.negative}`} />
        )}
        <Typography 
          className={`${classes.metricChange} ${change > 0 ? classes.positive : classes.negative}`}
          sx={{ ml: 0.5 }}
        >
          {Math.abs(change).toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  const MetricCard = ({ title, value, change, type, icon: Icon, color = "primary" }) => (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography className={classes.metricValue}>
              {formatValue(value, type)}
            </Typography>
            {renderChangeIndicator(change)}
          </Box>
          <Box>
            <Icon style={{ fontSize: 40, color: color === "primary" ? "#1976d2" : color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className={classes.root}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={period}
              onChange={handlePeriodChange}
              label="Período"
              size="small"
            >
              <MenuItem value="1h">Última Hora</MenuItem>
              <MenuItem value="24h">Últimas 24h</MenuItem>
              <MenuItem value="7d">Últimos 7 dias</MenuItem>
              <MenuItem value="30d">Últimos 30 dias</MenuItem>
              <MenuItem value="90d">Últimos 90 dias</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Exportar Relatório PDF">
            <IconButton onClick={() => handleExportReport('pdf')} className={classes.exportButton}>
              <GetAppIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Atualizar Dados">
            <IconButton onClick={fetchAnalytics}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPIs Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <MetricCard
            title="Tempo Médio de Resposta"
            value={kpis.avgResponseTime.value}
            change={kpis.avgResponseTime.change}
            type="time"
            icon={AccessTimeIcon}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <MetricCard
            title="Taxa de Resolução"
            value={kpis.resolutionRate.value}
            change={kpis.resolutionRate.change}
            type="percentage"
            icon={CheckCircleIcon}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <MetricCard
            title="Total de Tickets"
            value={kpis.ticketCount.value}
            change={kpis.ticketCount.change}
            type="number"
            icon={MessageIcon}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <MetricCard
            title="Usuários Ativos"
            value={kpis.activeUsers.value}
            change={kpis.activeUsers.change}
            type="number"
            icon={PersonIcon}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <MetricCard
            title="Transcrições"
            value={kpis.transcriptions.value}
            change={kpis.transcriptions.change}
            type="number"
            icon={RecordVoiceOverIcon}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <MetricCard
            title="Interações IA"
            value={kpis.aiInteractions.value}
            change={kpis.aiInteractions.change}
            type="number"
            icon={SmartToyIcon}
            color="#00796b"
          />
        </Grid>
      </Grid>

      {loading ? (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Gráfico de Volume de Tickets */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Volume de Tickets" />
              <CardContent>
                <Box className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.ticketVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#1976d2"
                        fill="#1976d2"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Tempo de Resposta */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Tempo Médio de Resposta" />
              <CardContent>
                <Box className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.responseTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => `${value}min`} />
                      <Line
                        type="monotone"
                        dataKey="avgTime"
                        stroke="#2e7d32"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Taxa de Resolução */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Taxa de Resolução" />
              <CardContent>
                <Box className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.resolutionRate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" fill="#ed6c02" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Uso de Transcrição */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Uso de Transcrição de Áudio" />
              <CardContent>
                <Box className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.transcriptionUsage}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {metrics.transcriptionUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Análise de Sentimento */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Análise de Sentimento" />
              <CardContent>
                <Box className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.sentimentAnalysis} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="sentiment" />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#9c27b0" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Atividade dos Usuários */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="Atividade dos Usuários" />
              <CardContent>
                <Box className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#00796b"
                        fill="#00796b"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Status das Integrações */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Status das Integrações de IA" />
            <CardContent>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                  label="OpenAI API"
                  color="success"
                  icon={<SmartToyIcon />}
                />
                <Chip
                  label="Whisper Transcription"
                  color="success"
                  icon={<RecordVoiceOverIcon />}
                />
                <Chip
                  label="Sentiment Analysis"
                  color="success"
                  icon={<SentimentSatisfiedIcon />}
                />
                <Chip
                  label="Real-time Analytics"
                  color="success"
                  icon={<TrendingUpIcon />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;