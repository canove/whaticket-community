import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../../services/api';
import FlowBuilder from '../../components/FlowBuilder/FlowBuilder';
import { Box, CircularProgress, Alert } from '@mui/material';

const FlowEditor = () => {
  const { flowId } = useParams();
  const history = useHistory();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isNewFlow = flowId === 'new';

  useEffect(() => {
    if (!isNewFlow) {
      fetchFlow();
    }
  }, [flowId]);

  const fetchFlow = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/flows/${flowId}`);
      setFlow(data);
    } catch (error) {
      console.error('Erro ao carregar fluxo:', error);
      setError('Erro ao carregar fluxo');
      toast.error('Erro ao carregar fluxo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (flowData) => {
    try {
      setLoading(true);
      
      if (isNewFlow) {
        // Criar novo fluxo
        const { data } = await api.post('/flows', flowData);
        toast.success('Fluxo criado com sucesso');
        history.push(`/flows/${data.id}/edit`);
      } else {
        // Atualizar fluxo existente
        await api.put(`/flows/${flowId}`, flowData);
        toast.success('Fluxo atualizado com sucesso');
        fetchFlow(); // Recarrega os dados
      }
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      toast.error('Erro ao salvar fluxo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    history.push('/flows');
  };

  if (loading && !flow) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <FlowBuilder 
      flow={flow}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
};

export default FlowEditor;