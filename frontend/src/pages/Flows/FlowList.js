import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  FileCopy as CopyIcon,
  Visibility as ViewIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../../services/api';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';

const FlowList = () => {
  const history = useHistory();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [flowStats, setFlowStats] = useState(null);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/flows');
      setFlows(data.flows || []);
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
      toast.error('Erro ao carregar fluxos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = () => {
    history.push('/flows/new');
  };

  const handleEditFlow = (flow) => {
    history.push(`/flows/${flow.id}/edit`);
  };

  const handleViewFlow = (flow) => {
    history.push(`/flows/${flow.id}`);
  };

  const handleMenuOpen = (event, flow) => {
    setMenuAnchor(event.currentTarget);
    setSelectedFlow(flow);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedFlow(null);
  };

  const handleToggleFlow = async (flow) => {
    try {
      await api.patch(`/flows/${flow.id}/toggle`, {
        isActive: !flow.isActive
      });
      
      toast.success(
        flow.isActive 
          ? 'Fluxo pausado com sucesso' 
          : 'Fluxo ativado com sucesso'
      );
      
      fetchFlows();
    } catch (error) {
      console.error('Erro ao alterar status do fluxo:', error);
      toast.error('Erro ao alterar status do fluxo');
    }
    handleMenuClose();
  };

  const handleDuplicateFlow = async () => {
    try {
      if (!newFlowName.trim()) {
        toast.error('Nome do fluxo é obrigatório');
        return;
      }

      await api.post(`/flows/${selectedFlow.id}/duplicate`, {
        name: newFlowName.trim()
      });

      toast.success('Fluxo duplicado com sucesso');
      setDuplicateDialogOpen(false);
      setNewFlowName('');
      fetchFlows();
    } catch (error) {
      console.error('Erro ao duplicar fluxo:', error);
      toast.error('Erro ao duplicar fluxo');
    }
    handleMenuClose();
  };

  const handleDeleteFlow = async () => {
    try {
      await api.delete(`/flows/${selectedFlow.id}`);
      toast.success('Fluxo deletado com sucesso');
      setDeleteDialogOpen(false);
      fetchFlows();
    } catch (error) {
      console.error('Erro ao deletar fluxo:', error);
      toast.error('Erro ao deletar fluxo');
    }
    handleMenuClose();
  };

  const handleViewStats = async (flow) => {
    try {
      const { data } = await api.get(`/flows/${flow.id}`);
      setFlowStats(data.statistics);
      setStatsDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivado';
      default:
        return status;
    }
  };

  const getTriggerTypeLabel = (type) => {
    switch (type) {
      case 'keyword':
        return 'Palavra-chave';
      case 'intent':
        return 'Intenção';
      case 'event':
        return 'Evento';
      case 'manual':
        return 'Manual';
      default:
        return type;
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Fluxos de Automação</Title>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateFlow}
        >
          Novo Fluxo
        </Button>
      </MainHeader>

      <Box sx={{ mt: 2 }}>
        {loading && <LinearProgress />}
        
        {flows.length === 0 && !loading ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nenhum fluxo criado ainda
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Crie seu primeiro fluxo de automação para começar
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateFlow}
              >
                Criar Primeiro Fluxo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Gatilho</TableCell>
                  <TableCell>Nós</TableCell>
                  <TableCell>Execuções</TableCell>
                  <TableCell>Última Atualização</TableCell>
                  <TableCell width={100}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flows.map((flow) => (
                  <TableRow key={flow.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {flow.name}
                        </Typography>
                        {flow.description && (
                          <Typography variant="caption" color="textSecondary">
                            {flow.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getStatusLabel(flow.status)}
                        color={getStatusColor(flow.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTriggerTypeLabel(flow.triggerType)}
                      </Typography>
                      {flow.triggerType === 'keyword' && flow.triggerConfig?.keywords && (
                        <Box sx={{ mt: 0.5 }}>
                          {flow.triggerConfig.keywords.slice(0, 3).map((keyword, index) => (
                            <Chip
                              key={index}
                              size="small"
                              label={keyword}
                              variant="outlined"
                              sx={{ mr: 0.5, fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {flow.triggerConfig.keywords.length > 3 && (
                            <Typography variant="caption" color="textSecondary">
                              +{flow.triggerConfig.keywords.length - 3} mais
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flow.statistics?.nodeCount || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {flow.statistics?.totalExecutions || 0}
                        </Typography>
                        {flow.statistics?.activeExecutions > 0 && (
                          <Typography variant="caption" color="primary">
                            {flow.statistics.activeExecutions} ativas
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(flow.updatedAt).toLocaleDateString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={flow.isActive ? 'Pausar' : 'Ativar'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFlow(flow)}
                          color={flow.isActive ? 'success' : 'default'}
                        >
                          {flow.isActive ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, flow)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Menu de Ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewFlow(selectedFlow)}>
          <ViewIcon sx={{ mr: 1 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={() => handleEditFlow(selectedFlow)}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          setDuplicateDialogOpen(true);
          setNewFlowName(`${selectedFlow?.name} - Cópia`);
        }}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <MenuItem onClick={() => handleViewStats(selectedFlow)}>
          <StatsIcon sx={{ mr: 1 }} />
          Estatísticas
        </MenuItem>
        <MenuItem 
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Deletar
        </MenuItem>
      </Menu>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar o fluxo "{selectedFlow?.name}"?
          </Typography>
          {selectedFlow?.statistics?.activeExecutions > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Este fluxo possui {selectedFlow.statistics.activeExecutions} execução(ões) ativa(s).
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteFlow} color="error" variant="contained">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Duplicação */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
        <DialogTitle>Duplicar Fluxo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome do novo fluxo"
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDuplicateFlow} variant="contained">
            Duplicar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Estatísticas */}
      <Dialog 
        open={statsDialogOpen} 
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Estatísticas do Fluxo</DialogTitle>
        <DialogContent>
          {flowStats && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {flowStats.totalExecutions}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total de Execuções
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {flowStats.completedExecutions}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {flowStats.activeExecutions}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ativas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {flowStats.successRate}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Taxa de Sucesso
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default FlowList;