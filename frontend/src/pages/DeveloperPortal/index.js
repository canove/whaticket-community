import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ApiIcon from "@mui/icons-material/Api";
import CodeIcon from "@mui/icons-material/Code";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SecurityIcon from "@mui/icons-material/Security";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HttpIcon from "@mui/icons-material/Http";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  tabPanel: {
    paddingTop: theme.spacing(2),
  },
  apiKeyCard: {
    marginBottom: theme.spacing(2),
  },
  codeBlock: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  permissionChip: {
    margin: theme.spacing(0.25),
  },
  hiddenKey: {
    fontFamily: "monospace",
    letterSpacing: "0.1em",
  },
  endpointCard: {
    marginBottom: theme.spacing(2),
  },
  methodChip: {
    fontWeight: "bold",
    minWidth: 60,
  },
}));

function TabPanel({ children, value, index, ...other }) {
  const classes = useStyles();
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box className={classes.tabPanel}>{children}</Box>}
    </div>
  );
}

const DeveloperPortal = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [apiKeys, setApiKeys] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [newKey, setNewKey] = useState({
    name: "",
    description: "",
    permissions: [],
    expiresAt: "",
    rateLimit: 1000,
  });

  const availablePermissions = [
    { value: "messages.read", label: "Ler Mensagens" },
    { value: "messages.write", label: "Enviar Mensagens" },
    { value: "contacts.read", label: "Ler Contatos" },
    { value: "contacts.write", label: "Criar/Editar Contatos" },
    { value: "transcriptions.read", label: "Ler Transcrições" },
    { value: "analytics.read", label: "Ler Analytics" },
    { value: "webhooks.manage", label: "Gerenciar Webhooks" },
  ];

  const apiEndpoints = [
    {
      method: "POST",
      path: "/api/v2/messages",
      description: "Enviar uma mensagem",
      permissions: ["messages.write"],
      example: `{
  "to": "5511999999999",
  "message": "Olá! Como posso ajudá-lo?"
}`,
    },
    {
      method: "GET",
      path: "/api/v2/messages",
      description: "Listar mensagens",
      permissions: ["messages.read"],
      example: null,
    },
    {
      method: "GET",
      path: "/api/v2/contacts",
      description: "Listar contatos",
      permissions: ["contacts.read"],
      example: null,
    },
    {
      method: "POST",
      path: "/api/v2/contacts",
      description: "Criar contato",
      permissions: ["contacts.write"],
      example: `{
  "name": "João Silva",
  "number": "5511999999999",
  "email": "joao@exemplo.com"
}`,
    },
    {
      method: "GET",
      path: "/api/v2/transcriptions",
      description: "Listar transcrições",
      permissions: ["transcriptions.read"],
      example: null,
    },
    {
      method: "GET",
      path: "/api/v2/analytics/usage",
      description: "Obter estatísticas de uso da API",
      permissions: ["analytics.read"],
      example: null,
    },
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data } = await api.get("/api-keys");
      setApiKeys(data);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateKey = async () => {
    setLoading(true);
    try {
      await api.post("/api-keys", newKey);
      toast.success("API Key criada com sucesso!");
      setCreateDialogOpen(false);
      setNewKey({
        name: "",
        description: "",
        permissions: [],
        expiresAt: "",
        rateLimit: 1000,
      });
      fetchApiKeys();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (window.confirm("Tem certeza que deseja deletar esta API Key?")) {
      try {
        await api.delete(`/api-keys/${keyId}`);
        toast.success("API Key deletada com sucesso!");
        fetchApiKeys();
      } catch (err) {
        toastError(err);
      }
    }
  };

  const handleToggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copiada para a área de transferência!");
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "GET": return "success";
      case "POST": return "primary";
      case "PUT": return "warning";
      case "DELETE": return "error";
      default: return "default";
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h4" gutterBottom>
        <ApiIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Developer Portal
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Gerencie suas API Keys e acesse a documentação completa da API pública do Whaticket.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<SecurityIcon />} label="API Keys" />
          <Tab icon={<LibraryBooksIcon />} label="Documentação" />
          <Tab icon={<CodeIcon />} label="Exemplos de Código" />
        </Tabs>
      </Box>

      {/* Tab 1: API Keys Management */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Suas API Keys"
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Nova API Key
                  </Button>
                }
              />
              <CardContent>
                {apiKeys.length === 0 ? (
                  <Alert severity="info">
                    Você ainda não possui API Keys. Crie uma para começar a usar a API.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Chave</TableCell>
                          <TableCell>Permissões</TableCell>
                          <TableCell>Rate Limit</TableCell>
                          <TableCell>Última Utilização</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell>
                              <Typography variant="body1">{key.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {key.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Typography
                                  className={classes.hiddenKey}
                                  variant="body2"
                                >
                                  {visibleKeys[key.id] ? key.key : "••••••••••••••••"}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleKeyVisibility(key.id)}
                                >
                                  {visibleKeys[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopyKey(key.key)}
                                >
                                  <ContentCopyIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                {key.permissions.map((permission, index) => (
                                  <Chip
                                    key={index}
                                    label={permission}
                                    size="small"
                                    className={classes.permissionChip}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{key.rateLimit}/hora</TableCell>
                            <TableCell>
                              {key.lastUsedAt ? (
                                format(new Date(key.lastUsedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                              ) : (
                                "Nunca utilizada"
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedKey(key);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteKey(key.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: API Documentation */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>URL Base:</strong> {window.location.origin}/api/v2
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardHeader title="Autenticação" />
              <CardContent>
                <Typography paragraph>
                  Todas as requisições devem incluir o cabeçalho de autenticação:
                </Typography>
                <SyntaxHighlighter language="bash" style={tomorrow} className={classes.codeBlock}>
{`curl -H "Authorization: Bearer SEU_API_KEY_AQUI" \\
     -H "Content-Type: application/json" \\
     ${window.location.origin}/api/v2/messages`}
                </SyntaxHighlighter>
              </CardContent>
            </Card>

            <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Endpoints Disponíveis
            </Typography>

            {apiEndpoints.map((endpoint, index) => (
              <Accordion key={index} className={classes.endpointCard}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Chip
                      label={endpoint.method}
                      color={getMethodColor(endpoint.method)}
                      className={classes.methodChip}
                      size="small"
                    />
                    <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
                      {endpoint.path}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {endpoint.description}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Permissões necessárias:
                    </Typography>
                    <Box mb={2}>
                      {endpoint.permissions.map((permission, idx) => (
                        <Chip
                          key={idx}
                          label={permission}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>

                    {endpoint.example && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Exemplo de requisição:
                        </Typography>
                        <SyntaxHighlighter language="bash" style={tomorrow} className={classes.codeBlock}>
{`curl -X ${endpoint.method} \\
  -H "Authorization: Bearer SEU_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${endpoint.example}' \\
  ${window.location.origin}${endpoint.path}`}
                        </SyntaxHighlighter>
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Code Examples */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="JavaScript / Node.js" />
              <CardContent>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
{`const axios = require('axios');

const api = axios.create({
  baseURL: '${window.location.origin}/api/v2',
  headers: {
    'Authorization': 'Bearer SEU_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Enviar mensagem
async function sendMessage(to, message) {
  try {
    const response = await api.post('/messages', {
      to,
      message
    });
    console.log('Mensagem enviada:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}

// Listar contatos
async function getContacts() {
  try {
    const response = await api.get('/contacts');
    console.log('Contatos:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}`}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Python" />
              <CardContent>
                <SyntaxHighlighter language="python" style={tomorrow}>
{`import requests

class WhaticketAPI:
    def __init__(self, api_key):
        self.base_url = '${window.location.origin}/api/v2'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def send_message(self, to, message):
        url = f'{self.base_url}/messages'
        data = {
            'to': to,
            'message': message
        }
        
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def get_contacts(self):
        url = f'{self.base_url}/contacts'
        response = requests.get(url, headers=self.headers)
        return response.json()

# Uso
api = WhaticketAPI('SEU_API_KEY')
result = api.send_message('5511999999999', 'Olá!')
print(result)`}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="PHP" />
              <CardContent>
                <SyntaxHighlighter language="php" style={tomorrow}>
{`<?php

class WhaticketAPI {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        $this->baseUrl = '${window.location.origin}/api/v2';
    }
    
    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $options = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json'
            ]
        ];
        
        if ($method === 'POST' && $data) {
            $options[CURLOPT_POST] = true;
            $options[CURLOPT_POSTFIELDS] = json_encode($data);
        }
        
        $curl = curl_init();
        curl_setopt_array($curl, $options);
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        return json_decode($response, true);
    }
    
    public function sendMessage($to, $message) {
        return $this->makeRequest('POST', '/messages', [
            'to' => $to,
            'message' => $message
        ]);
    }
    
    public function getContacts() {
        return $this->makeRequest('GET', '/contacts');
    }
}

// Uso
$api = new WhaticketAPI('SEU_API_KEY');
$result = $api->sendMessage('5511999999999', 'Olá!');
?>`}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="cURL" />
              <CardContent>
                <SyntaxHighlighter language="bash" style={tomorrow}>
{`# Enviar mensagem
curl -X POST \\
  ${window.location.origin}/api/v2/messages \\
  -H "Authorization: Bearer SEU_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "5511999999999",
    "message": "Olá! Como posso ajudá-lo?"
  }'

# Listar contatos
curl -X GET \\
  ${window.location.origin}/api/v2/contacts \\
  -H "Authorization: Bearer SEU_API_KEY"

# Obter transcrições
curl -X GET \\
  ${window.location.origin}/api/v2/transcriptions \\
  -H "Authorization: Bearer SEU_API_KEY"

# Verificar uso da API
curl -X GET \\
  ${window.location.origin}/api/v2/analytics/usage \\
  -H "Authorization: Bearer SEU_API_KEY"`}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialog for creating new API Key */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Nova API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={newKey.name}
            onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={2}
            value={newKey.description}
            onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Permissões</InputLabel>
            <Select
              multiple
              value={newKey.permissions}
              onChange={(e) => setNewKey({ ...newKey, permissions: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availablePermissions.map((permission) => (
                <MenuItem key={permission.value} value={permission.value}>
                  <Checkbox checked={newKey.permissions.indexOf(permission.value) > -1} />
                  <ListItemText primary={permission.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Rate Limit (requisições/hora)"
            type="number"
            fullWidth
            value={newKey.rateLimit}
            onChange={(e) => setNewKey({ ...newKey, rateLimit: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Data de Expiração (opcional)"
            type="datetime-local"
            fullWidth
            value={newKey.expiresAt}
            onChange={(e) => setNewKey({ ...newKey, expiresAt: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateKey} variant="contained" disabled={loading}>
            {loading ? "Criando..." : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeveloperPortal;