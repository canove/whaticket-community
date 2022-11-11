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

import { AuthContext } from "../../context/Auth/AuthContext";
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
    const { user } = useContext(AuthContext);
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
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
		dispatch({ type: "RESET" });
	}, []);

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
		const value = e.target.value;
        const allIndex = value.indexOf('all');

		if (allIndex !== -1 && allIndex === (value.length - 1)) {
			setSelectedConnection(['all']);
		} else {
            if ((allIndex || allIndex === 0) && allIndex !== -1) {
				value.splice(allIndex, 1);
			}
			setSelectedConnection(typeof value === "string" ? value.split(",") : value);
		}
	}

    // Active
    const handleActiveCheckboxChange = () => {
        setIsActive(!isActive);
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
        const configData = {
            triggerInterval: intervalValue,
            whatsappIds: selectedConnection.includes('all') ? null : selectedConnection.join(),
            useGreetingMessages: useGreetingMessage,
            greetingMessages: greetingMessages,
            active: isActive,
        }
        try {
            if (config.length > 0) {
                await api.put(`/whatsconfig/${config[0].id}`, configData);
                toast.success(i18n.t("settingsWhats.confirmation.update"));
            } else {
                await api.post(`/whatsconfig/`, configData);
                toast.success(i18n.t("settingsWhats.confirmation.saved"));
            }
        } catch (err) {
            toastError(err);
        }
        setSaving(!saving);
    }

    const [disconnectedWhatsapps, setDisconnectedWhatsapps] = useState([]);
    const [deletedWhatsapps, setDeletedWhatsapps] = useState([]);

    useEffect(() => {
        if (config.length > 0) {
            setIsActive(config[0].active);
            setIntervalValue(config[0].triggerInterval);
            setGreetingMessages(config[0].greetingMessages);
            setUseGreetingMessage(config[0].useGreetingMessages);

            if (config[0].whatsappIds === null) {
                setSelectedConnection(['all']);
            } else {
                let array = config[0].whatsappIds.split(',');
                setSelectedConnection(array);

                let connectedArray = [];
                let disconnectArray = [];
                let deletedArray = [];

                array.forEach(whatsId => {
                    let whatsExists = false;
                    whatsApps.forEach(whats => {
                        if (whats.id === whatsId) {
                            whatsExists = true;
                            if (whats.status === "CONNECTED") {
                                connectedArray.push(whats.id);
                            } else {
                                disconnectArray.push(whats.name);
                            }
                        }
                    })

                    if (whatsExists === false) {
                        deletedArray.push(whatsId);
                    }
                })
                setSelectedConnection(connectedArray);
                setDisconnectedWhatsapps(disconnectArray);
                setDeletedWhatsapps(deletedArray);
            }
        }
    }, [config, whatsApps]);

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

        socket.on(`config${user.companyId}`, (data) => {
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
// eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

	return (
	    <MainContainer>
            <ConfirmationModal
                title={i18n.t("settingsWhats.confirmation.title")}
                open={confirmationOpen}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleDeleteMessage}
            >
                {i18n.t("settingsWhats.confirmation.confirmDelete")}
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
                       {i18n.t("settingsWhats.buttons.save")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <Paper
                    className={classes.paper}
                    variant="outlined"
                >
                    <Typography variant="subtitle1" gutterBottom>
                       {i18n.t("settingsWhats.buttons.activConfig")}
                    </Typography>
                    <Checkbox
                        {...label}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        color="primary"
                        onChange={handleActiveCheckboxChange}
                        checked={isActive}
                    />
                </Paper>
                <Paper
                    className={classes.mainPaper}
                    variant="outlined"
                >
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
                                    if (whats.status === "CONNECTED") {
                                        return (
                                            <MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
                                        )
                                    }
                                } return null
                            })}
                        </Select>
                    </Paper>
                    { disconnectedWhatsapps.length > 0 &&
                        <Paper
                            className={classes.paper}
                            variant="outlined"
                        >
                            <Typography variant="subtitle1" gutterBottom>
                                 {i18n.t("settingsWhats.disconnected")}
                            </Typography>

                            { disconnectedWhatsapps.length > 0 && disconnectedWhatsapps.map((disconnectWhats, index) => {
                                return (
                                    <Typography key={index} variant="subtitle1" gutterBottom>
                                        { disconnectWhats };
                                    </Typography>
                                )
                            })}
                        </Paper>
                    }
                    { deletedWhatsapps.length > 0 &&
                        <Paper
                            className={classes.paper}
                            variant="outlined"
                        >
                            <Typography variant="subtitle1" gutterBottom>
                                {i18n.t("settingsWhats.delete")}
                            </Typography>
                        </Paper>
                    }
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
                            />
                        </Grid>
                    </Grid>
                </Paper>
                <Paper
                    className={classes.paper}
                    variant="outlined"
                >
                    <Typography variant="subtitle1" gutterBottom>
                       {i18n.t("settingsWhats.salutation")}
                    </Typography>
                    <Checkbox
                        {...label}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                        color="primary"
                        onChange={handleCheckboxChange}
                        checked={useGreetingMessage}
                    />
                </Paper>
                { useGreetingMessage === true && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGreetingMessageOpenModal}
                        >
                           {i18n.t("settingsWhats.buttons.created")}
                        </Button>
                        <Paper
                            className={classes.paper}
                            variant="outlined"
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{i18n.t("settingsWhats.modal.salutation")}</TableCell>
                                        <TableCell>{i18n.t("settingsWhats.modal.actions")}</TableCell>
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
                                                    {i18n.t("settingsWhats.modal.edit")}
                                                </Button>
                                                <Button
                                                    onClick={(e) => {handleOpenConfirmationModal(greetingMessage, index)}}
                                                >
                                                    {i18n.t("settingsWhats.modal.delete")}
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
            </Paper>
        </MainContainer>
	);
};

export default WhatsConfig;
