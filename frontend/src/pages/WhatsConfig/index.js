import React, { useState, useContext, useCallback, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { 
    Button, 
    Checkbox, 
    Grid, 
    Input, 
    MenuItem, 
    Select, 
    Slider, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Typography 
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import GreetingMessageModal from "../../components/GreetingMessageModal";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";

import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,
	},
	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    selectWidth: {
        marginLeft: 10,
        width: 200,
    },
}));

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const reducer = (state, action) => {
    if (action.type === "LOAD_CONFIG") {
      const configs = action.payload;
      const newConfigs = [];
  
      configs.forEach((config) => {
        const configIndex = state.findIndex((c) => c.id === config.id);
        if (configIndex !== -1) {
          state[configIndex] = config;
        } else {
          newConfigs.push(config);
        }
      });
  
      return [...state, ...newConfigs];
    }
  
    if (action.type === "UPDATE_CONFIG") {
      const config = action.payload;
      const configIndex = state.findIndex((c) => c.id === config.id);
  
      if (configIndex !== -1) {
        state[configIndex] = config;
        return [...state];
      } else {
        return [config, ...state];
      }
    }
  
    if (action.type === "DELETE_CONFIG") {
      const configId = action.payload;
  
      const configIndex = state.findIndex((c) => c.id === configId);
      if (configIndex !== -1) {
        state.splice(configIndex, 1);
      }
      return [...state];
    }
  
    if (action.type === "RESET") {
      return [];
    }
  };

const WhatsConfig = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();
    const { whatsApps } = useContext(WhatsAppsContext);

    const [intervalValue, setIntervalValue] = useState(1);
    const [selectedConnection, setSelectedConnection] = useState([]);
    const [useGreetingMessage, setUseGreetingMessage] = useState(false);
    const [greetingMessages, setGreetingMessages] = useState([]);
    const [greetingMessageOpen, setGreetingMessageOpen] = useState(false);
    const [selectedGreetingMessage, setSelectedGreetingMessage] = useState(null);
    const [config, dispatch] = useReducer(reducer, []);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [deletedGreetingMessage, setDeletedGreetingMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    // Interval
    const handleIntervalSliderChange = (event, newValue) => {
        setIntervalValue(newValue);
    };

    const handleIntervalInputChange = (event) => {
        setIntervalValue(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleIntervalBlur = () => {
        if (intervalValue < 1) {
            setIntervalValue(1);
        } else if (intervalValue > 60) {
            setIntervalValue(60);
        }
    };

    // Connection
    const handleChangeConnection = (e) => {
		const {
			target: { value },
		} = e;

		if (value.includes('all')) {
			setSelectedConnection(['all']);
		} else {
			setSelectedConnection(typeof value === "string" ? value.split(",") : value);
		}
	}

    // Greeting Message
    const handleCheckboxChange = () => {
        setUseGreetingMessage(!useGreetingMessage);
    }

    const handleGreetingMessageOpenModal = () => {
        setSelectedGreetingMessage(null);
        setGreetingMessageOpen(true);
    }

    const handleCloseGreetingMessageModal = useCallback(() => {
        setGreetingMessageOpen(false);
        setSelectedGreetingMessage(null);
    }, [setSelectedGreetingMessage, setGreetingMessageOpen]);

    const handleEditGreetingMessage = (greetingMessageText, index) => {
		setSelectedGreetingMessage([greetingMessageText, index]);
		setGreetingMessageOpen(true);
	};

    const getGreetingMessage = (text, type, index) => {
        if (type === "CREATE") {
            if (config) {
                setGreetingMessages([...greetingMessages, {configId: config.id, greetingMessage: text}]);
            } else {
                setGreetingMessages([...greetingMessages, {greetingMessage: text}]);
            }
        }

        if (type === "EDIT") {
            let array = greetingMessages;
            array[index] = text;

            setGreetingMessages(array);
        }
    }

    const handleOpenConfirmationModal = (greetingMessage, index) => {
        setDeletedGreetingMessage([greetingMessage, index]);
        setConfirmationOpen(true);
    }

    const handleCloseConfirmationModal = () => {
        setConfirmationOpen(false);
    }

    const handleDeleteMessage = async () => {
        if (deletedGreetingMessage[0].id == null) {
            let array = greetingMessages;
            array.splice(deletedGreetingMessage[1], 1);
            setGreetingMessages(array);
        } else {
            try {
                await api.delete(`whatsconfig/deleteMessage/${deletedGreetingMessage[0].id}`)
                let array = greetingMessages;
                array.splice(deletedGreetingMessage[1], 1);
                setGreetingMessages(array);
            } catch (err) {
                toastError(err);
            }
        }

        setDeletedGreetingMessage([]);
    }

    // Config
    const handleSaveConfig = async () => {
        setSaving(true);
        const configBody = {
            triggerInterval: intervalValue,
            whatsappIds: selectedConnection.includes('all') ? null : selectedConnection.join(),
            useGreetingMessages: useGreetingMessage,
            greetingMessages: greetingMessages
        }
        try {
            if (config.length > 0) {
                await api.put(`/whatsconfig/${config[0].id}`, configBody);
                toast.success("Config Alterada com Sucesso!");
            } else {
                await api.post(`/whatsconfig/`, configBody);
                toast.success("Config Salva com Sucesso!");
            }
        } catch (err) {
            toastError(err);
        }
        setSaving(false);
    }

    const handleDeleteConfig = async () => {
        setSaving(true);
        try {
            await api.delete(`/whatsconfig/${config[0].id}`);
            toast.success("Config Deletada com Sucesso!");
        } catch (err) {
            toastError(err);
        }
        setSaving(false);
    }

    useEffect(() => {
        if (config.length > 0) {
            setIntervalValue(config[0].triggerInterval);
            setGreetingMessages(config[0].greetingMessages);
            setSelectedConnection(config[0].whatsappIds.split(','));
            if (config[0].greetingMessages.length > 0) {
                setUseGreetingMessage(true);
            } else {
                setUseGreetingMessage(false);
            }
        }
    }, [config]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/whatsconfig/');
                dispatch({ type: "LOAD_CONFIG", payload: data });
            } catch (err) {
                toastError(err);
            }
        }
        fetchConfig();
    }, [saving]);

    useEffect(() => {
        const socket = openSocket();
    
        socket.on("config", (data) => {
          if (data.action === "update" || data.action === "create") {
            dispatch({ type: "UPDATE_CONFIG", payload: data.config });
          }
    
          if (data.action === "delete") {
            dispatch({ type: "DELETE_CONFIG", payload: +data.configId });
          }
        });
    
        return () => {
          socket.disconnect();
        };
      }, []);

	return (
	    <MainContainer>
            <ConfirmationModal
                title='Deletar Mensagem'
                open={confirmationOpen}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleDeleteMessage}
            >
                Você tem certeza que deseja deletar esta mensagem de saudação?
            </ConfirmationModal>
            <GreetingMessageModal
				open={greetingMessageOpen}
				onClose={handleCloseGreetingMessageModal}
				greetingMessageText={selectedGreetingMessage ? selectedGreetingMessage : ''}
                getGreetingMessage={getGreetingMessage}
			/>
            <MainHeader>
                <Title>{i18n.t("settingsWhats.title")}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleSaveConfig}
                        disabled={selectedConnection.length === 0}
                    >
                        Salvar
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleDeleteConfig}
                        disabled={!config[0]}
                    >
                        Deletar
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.paper}
                variant="outlined"
            >
                <Typography variant="subtitle1" gutterBottom>
                	{i18n.t("settingsWhats.connections")}
				</Typography>
				<Select
                    className={classes.selectWidth}
					labelId="type-select-label"
					id="type-select"
					value={selectedConnection}
					label="Type"
					onChange={handleChangeConnection}
					multiple
				>
					<MenuItem value={"all"}>{i18n.t("settingsWhats.all")}</MenuItem>
					{whatsApps && whatsApps.map((whats, index) => {
						if (whats.official === false) {
							if (whats.status === "OPENING") {
								return (
									<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
								)
							}
						} return null
					})}
				</Select>
            </Paper>
            <Paper
                className={classes.paper}
                variant="outlined"
            >
                <Typography id="input-slider" gutterBottom>
                    {i18n.t("settingsWhats.triggerTime")} (30seg - 1h)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <Slider
                            value={typeof intervalValue === 'number' ? intervalValue : 0}
                            onChange={handleIntervalSliderChange}
                            aria-labelledby="input-slider"
                            step={1}
                            min={0.5}
                            max={60}
                            valueLabelDisplay="auto"
                            disabled={selectedConnection.length === 0}
                        />
                    </Grid>
                    <Grid item>
                        <Input
                            value={intervalValue}
                            margin="dense"
                            onChange={handleIntervalInputChange}
                            onBlur={handleIntervalBlur}
                            inputProps={{
                            step: 1,
                            min: 0.5,
                            max: 60,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                            }}
                            disabled={selectedConnection.length === 0}
                        />
                    </Grid>
                </Grid>
            </Paper>
            <Paper
                className={classes.paper}
                variant="outlined"
            >
                <Typography variant="subtitle1" gutterBottom>
                	Usar mensagem de saudação? 
				</Typography>
                <Checkbox
                    {...label}
                    defaultChecked
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    color="primary"
                    onChange={handleCheckboxChange}
                    checked={useGreetingMessage}
                    disabled={selectedConnection.length === 0}
                />
            </Paper>
            { useGreetingMessage === true && selectedConnection.length !== 0 && (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGreetingMessageOpenModal}
                    >
                        Criar Mensagem
                    </Button>
                    <Paper
                        className={classes.paper}
                        variant="outlined"
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mensagem de Saudação</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            { greetingMessages && greetingMessages.map((greetingMessage, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{greetingMessage.greetingMessage}</TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={(e) => {handleEditGreetingMessage(greetingMessage, index)}}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                onClick={(e) => {handleOpenConfirmationModal(greetingMessage, index)}}
                                            >
                                                Deletar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            </TableBody>
                        </Table>
                    </Paper>
                </>
            )}
    </MainContainer>
	);
};

export default WhatsConfig;
