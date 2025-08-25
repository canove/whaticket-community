import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  Message as MessageIcon,
  Image as MediaIcon,
  Input as InputIcon,
  AccountTree as ConditionIcon,
  WebHook as WebhookIcon,
  SmartToy as AIIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const FlowBuilder = ({ flow, onSave, onClose }) => {
  const [nodes, setNodes] = useState(flow?.nodes || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flowData, setFlowData] = useState({
    name: flow?.name || '',
    description: flow?.description || '',
    triggerType: flow?.triggerType || 'keyword',
    triggerConfig: flow?.triggerConfig || {
      keywords: ['oi', 'olá'],
      matchType: 'contains',
      caseSensitive: false
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const nodeTypes = [
    { type: 'start', label: 'Início', icon: StartIcon, color: '#4caf50' },
    { type: 'send_text', label: 'Enviar Texto', icon: MessageIcon, color: '#2196f3' },
    { type: 'send_media', label: 'Enviar Mídia', icon: MediaIcon, color: '#ff9800' },
    { type: 'wait_input', label: 'Aguardar Entrada', icon: InputIcon, color: '#9c27b0' },
    { type: 'condition', label: 'Condição', icon: ConditionIcon, color: '#ff5722' },
    { type: 'webhook', label: 'Webhook', icon: WebhookIcon, color: '#607d8b' },
    { type: 'ai_node', label: 'IA', icon: AIIcon, color: '#e91e63' },
    { type: 'end', label: 'Fim', icon: EndIcon, color: '#f44336' }
  ];

  const getNodeType = (type) => nodeTypes.find(nt => nt.type === type);

  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData('nodeType', nodeType);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    const rect = canvasRef.current.getBoundingClientRect();
    
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position: {
        x: e.clientX - rect.left - 75, // Centro do nó
        y: e.clientY - rect.top - 25
      },
      data: {
        label: getNodeType(nodeType)?.label || nodeType,
        config: getDefaultNodeConfig(nodeType)
      }
    };

    setNodes(prev => [...prev, newNode]);
  }, []);

  const getDefaultNodeConfig = (type) => {
    switch (type) {
      case 'send_text':
        return { text: 'Digite sua mensagem aqui...' };
      case 'send_media':
        return { mediaUrl: '', caption: '' };
      case 'wait_input':
        return { message: 'Aguardando sua resposta...' };
      case 'condition':
        return { 
          conditions: [
            { variable: 'last_user_message', operator: 'contains', value: '', nextNodeId: null }
          ],
          defaultPath: { nextNodeId: null }
        };
      case 'webhook':
        return { url: '', method: 'POST', headers: {}, body: {} };
      case 'ai_node':
        return { prompt: 'Responda de forma útil e amigável: {{last_user_message}}' };
      case 'end':
        return { message: 'Obrigado pelo contato!' };
      default:
        return {};
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const handleNodeUpdate = (nodeId, updates) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, ...updates }
          : node
      )
    );
  };

  const handleNodeDelete = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setSelectedNode(null);
    setDrawerOpen(false);
  };

  const handleNodeMouseDown = (e, nodeId) => {
    setIsDragging(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      handleNodeUpdate(isDragging, { position: newPosition });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    const flowToSave = {
      ...flowData,
      nodes
    };
    onSave(flowToSave);
  };

  const NodePalette = () => (
    <Paper sx={{ width: 250, height: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Componentes
      </Typography>
      <List>
        {nodeTypes.map((nodeType) => {
          const IconComponent = nodeType.icon;
          return (
            <ListItem
              key={nodeType.type}
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType.type)}
              sx={{
                cursor: 'grab',
                '&:hover': { bgcolor: 'action.hover' },
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon>
                <IconComponent sx={{ color: nodeType.color }} />
              </ListItemIcon>
              <ListItemText primary={nodeType.label} />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

  const FlowCanvas = () => (
    <Box
      ref={canvasRef}
      sx={{
        flex: 1,
        position: 'relative',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: '#f5f5f5',
        backgroundImage: `
          linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        minHeight: 600,
        overflow: 'hidden'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Nodes */}
      {nodes.map((node) => {
        const nodeType = getNodeType(node.type);
        const IconComponent = nodeType?.icon || MessageIcon;
        
        return (
          <Paper
            key={node.id}
            sx={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              width: 150,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDragging === node.id ? 'grabbing' : 'grab',
              border: 2,
              borderColor: nodeType?.color || '#2196f3',
              bgcolor: 'white',
              '&:hover': {
                boxShadow: 3
              }
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onClick={() => handleNodeClick(node)}
          >
            <IconComponent sx={{ color: nodeType?.color, mr: 1 }} />
            <Typography variant="caption" noWrap>
              {node.data.label}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );

  const FlowSettings = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configurações do Fluxo
      </Typography>
      
      <TextField
        fullWidth
        label="Nome do Fluxo"
        value={flowData.name}
        onChange={(e) => setFlowData(prev => ({ ...prev, name: e.target.value }))}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Descrição"
        value={flowData.description}
        onChange={(e) => setFlowData(prev => ({ ...prev, description: e.target.value }))}
        margin="normal"
        multiline
        rows={3}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de Gatilho</InputLabel>
        <Select
          value={flowData.triggerType}
          onChange={(e) => setFlowData(prev => ({ ...prev, triggerType: e.target.value }))}
        >
          <MenuItem value="keyword">Palavra-chave</MenuItem>
          <MenuItem value="intent">Intenção</MenuItem>
          <MenuItem value="event">Evento</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
        </Select>
      </FormControl>

      {flowData.triggerType === 'keyword' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Palavras-chave
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {flowData.triggerConfig.keywords?.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                onDelete={() => {
                  const newKeywords = flowData.triggerConfig.keywords.filter((_, i) => i !== index);
                  setFlowData(prev => ({
                    ...prev,
                    triggerConfig: { ...prev.triggerConfig, keywords: newKeywords }
                  }));
                }}
              />
            ))}
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Nova palavra-chave"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                const newKeywords = [...(flowData.triggerConfig.keywords || []), e.target.value];
                setFlowData(prev => ({
                  ...prev,
                  triggerConfig: { ...prev.triggerConfig, keywords: newKeywords }
                }));
                e.target.value = '';
              }
            }}
          />
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!flowData.name}
        >
          Salvar Fluxo
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Node Palette */}
      <NodePalette />
      
      {/* Main Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">
            {flowData.name || 'Novo Fluxo'}
          </Typography>
          <Box>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Paper>
        
        {/* Canvas */}
        <FlowCanvas />
        
        {/* Status */}
        <Paper sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {nodes.length} nós no fluxo
          </Typography>
          {nodes.length === 0 && (
            <Alert severity="info" sx={{ py: 0 }}>
              Arraste componentes da paleta para criar seu fluxo
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        {selectedNode ? (
          <NodeSettings
            node={selectedNode}
            onUpdate={(updates) => handleNodeUpdate(selectedNode.id, updates)}
            onDelete={() => handleNodeDelete(selectedNode.id)}
            onClose={() => setDrawerOpen(false)}
          />
        ) : (
          <FlowSettings />
        )}
      </Drawer>
    </Box>
  );
};

// Componente para configurações de nó individual
const NodeSettings = ({ node, onUpdate, onDelete, onClose }) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate({ 
      data: { 
        ...node.data, 
        config: newConfig,
        label
      } 
    });
  };

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    onUpdate({ 
      data: { 
        ...node.data, 
        label: newLabel,
        config
      } 
    });
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'send_text':
        return (
          <TextField
            fullWidth
            label="Mensagem"
            value={config.text || ''}
            onChange={(e) => handleConfigChange('text', e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="Digite a mensagem que será enviada..."
            helperText="Use {{variáveis}} para personalizar: {{nome}}, {{telefone}}, etc."
          />
        );
      
      case 'send_media':
        return (
          <>
            <TextField
              fullWidth
              label="URL da Mídia"
              value={config.mediaUrl || ''}
              onChange={(e) => handleConfigChange('mediaUrl', e.target.value)}
              margin="normal"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <TextField
              fullWidth
              label="Legenda"
              value={config.caption || ''}
              onChange={(e) => handleConfigChange('caption', e.target.value)}
              margin="normal"
              multiline
              rows={2}
              placeholder="Legenda da mídia..."
            />
          </>
        );

      case 'wait_input':
        return (
          <TextField
            fullWidth
            label="Mensagem de Espera"
            value={config.message || ''}
            onChange={(e) => handleConfigChange('message', e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="Mensagem mostrada enquanto aguarda resposta..."
          />
        );

      case 'webhook':
        return (
          <>
            <TextField
              fullWidth
              label="URL do Webhook"
              value={config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              margin="normal"
              placeholder="https://api.exemplo.com/webhook"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Método HTTP</InputLabel>
              <Select
                value={config.method || 'POST'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </Select>
            </FormControl>
          </>
        );

      case 'ai_node':
        return (
          <TextField
            fullWidth
            label="Prompt para IA"
            value={config.prompt || ''}
            onChange={(e) => handleConfigChange('prompt', e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="Instruções para a IA..."
            helperText="Use {{variáveis}} para incluir dados do usuário"
          />
        );

      case 'end':
        return (
          <TextField
            fullWidth
            label="Mensagem Final"
            value={config.message || ''}
            onChange={(e) => handleConfigChange('message', e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="Mensagem de despedida..."
          />
        );

      default:
        return (
          <Typography color="textSecondary">
            Nenhuma configuração específica para este tipo de nó.
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Configurar Nó
        </Typography>
        <IconButton onClick={onClose} size="small">
          <SettingsIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        label="Rótulo do Nó"
        value={label}
        onChange={(e) => handleLabelChange(e.target.value)}
        margin="normal"
        size="small"
      />

      <Divider sx={{ my: 2 }} />

      {renderConfigFields()}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          fullWidth
        >
          Excluir Nó
        </Button>
      </Box>
    </Box>
  );
};

export default FlowBuilder;