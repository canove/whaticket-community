import React, { useState, useCallback, useEffect, useReducer, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import { green, yellow, red } from "@material-ui/core/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
	Card,
	CardContent,
	CardActionArea,
	CardMedia,
	CardActions,
	InputAdornment,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@material-ui/core";
import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	DeleteOutline,
	FiberManualRecord,
} from "@material-ui/icons";

import SearchIcon from "@material-ui/icons/Search";
import SettingsIcon from "@material-ui/icons/Settings";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { useTranslation } from 'react-i18next'
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import WhatsConfigModal from "../../components/WhatsConfigModal";
import OfficialWhatsAppModal from "../../components/OfficialWhatsAppModal";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
	},
	cardRoot: {
		maxWidth: 300,
		minWidth: 300,
		minHeight: 212,
		margin: "16px",
	  },
	cardMedia: {
		height: 140,
	},
	cardsPaper: {
		display: "flex",
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
		flexWrap: "wrap",
		justifyContent: "start",
	},
}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const reducer = (state, action) => {
	if (action.type === "LOAD_WHATSAPPS") {
		const whatsApps = action.payload;
		return [...whatsApps];
	}

	if (action.type === "UPDATE_WHATSAPPS") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);
		if (whatsAppIndex !== -1 || whatsApp.official === true) {
			state[whatsAppIndex] = whatsApp;
			return [...state];
		} else {
			return [whatsApp, ...state];
		}
	}

	if (action.type === "UPDATE_SESSION") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
			state[whatsAppIndex].status = whatsApp.status;
			state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
			state[whatsAppIndex].qrcode = whatsApp.qrcode;
			state[whatsAppIndex].retries = whatsApp.retries;
			return [...state];
		} else {
			return [...state];
		}
	}

	if (action.type === "DELETE_WHATSAPPS") {
		const whatsAppId = action.payload;

		const whatsAppIndex = state.findIndex(s => s.id === whatsAppId);
		if (whatsAppIndex !== -1) {
			state.splice(whatsAppIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const OfficialContacts = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [whatsApps, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);
	
	const { user } = useContext(AuthContext);

    const history = useHistory();
    const { connectionName } = useParams();

    const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
    const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);

    const [connections, setConnections] = useState([]);
    const [connectionId, setConnectionId] = useState("");
    const [searchParam, setSearchParam] = useState("");
	const [count, setCount] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);

	useEffect(() => {
		dispatch({ type: "RESET" });
	}, [pageNumber, searchParam]);

	useEffect(() => {
		setPageNumber(1);
	}, [searchParam]);

	 useEffect(() => {
		setLoading(true);
		const fetchWhats = async () => {
			try {
				const { data } = await api.get('/officialWhatsapps');
				setConnections(data);
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		};

		fetchWhats();
	}, []);

    useEffect(() => {
        const fetchWhats = async () => {
            try {
                const { data } = await api.get(`/officialWhatsapps/name/${connectionName}`);
				setConnectionId(data.id);
            } catch (err) {
                toastError(err);
            }
        }

        if (connectionName) fetchWhats();
    }, [connectionName]);

	useEffect(() => {
		setLoading(true);
		const fetchPhoneNumbers = async () => {
			try {
				const { data } = await api.get('/whatsapp/list/', {
					params: {
						official: true,
						connectionId
					}
				});
				dispatch({ type: "LOAD_WHATSAPPS", payload: data.whatsapps });
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		}

		if (connectionId) fetchPhoneNumbers();
	}, [connectionId]);

    useEffect(() => {
		const socket = openSocket();

		socket.on(`officialwhatsapp${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}
		});

		socket.on(`officialwhatsapp${user.companyId}`, data => {
			if (data.action === "delete") {
				dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

    const handleCloseWhatsAppModal = () => {
        setSelectedWhatsApp(null);
        setWhatsAppModalOpen(false);
    }

    const handleOpenWhatsAppModal = () => {
        setSelectedWhatsApp(null);
        setWhatsAppModalOpen(true);
    }

    const handleEditWhatsApp = (whatsApp) => {
        setSelectedWhatsApp(whatsApp);
        setWhatsAppModalOpen(true);
    }

	const getQuality = (quality) => {
		if (quality === "GREEN") return <FiberManualRecord fontSize="small" style={{ color: green[500] }} />;
		if (quality === "YELLOW") return <FiberManualRecord fontSize="small" style={{ color: yellow[500] }} />;
		if (quality === "RED") return <FiberManualRecord fontSize="small" style={{ color: red[500] }} />;

		return "INDEFINIDA";
	}

	return (
		<>
			{ !connectionName &&
				<MainContainer>
					<MainHeader>
						<Title>{i18n.t("officialPages.officialContacts.title")}</Title>
					</MainHeader>
					<Paper className={classes.cardsPaper} variant="outlined">
						{ connections && connections.map(connection => (
							<Card key={connection.id} className={classes.cardRoot} onClick={() => { history.push(`/WhatsContacts/${connection.name}`); }}>
								<CardActionArea style={{ height: "100%" }}>
									<CardContent>
										<Typography gutterBottom variant="h5" component="h2" style={{ textAlign: "center" }} >
											{ connection.name }
										</Typography>
									</CardContent>
								</CardActionArea>
							</Card>
						))}
						{/* <Card className={classes.cardRoot} onClick={() => { history.push('/WhatsContacts/All'); }}>
							<CardActionArea style={{ height: "100%" }} >
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2" style={{ textAlign: "center" }} >
										Ver Todos
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card> */}
					</Paper>
				</MainContainer>
			}
			{ connectionName &&
                <MainContainer>
                    <OfficialWhatsAppModal
                        open={whatsAppModalOpen}
                        onClose={handleCloseWhatsAppModal}
                        whatsAppId={selectedWhatsApp?.id}
                        connectionId={connectionId}
                    />
                    <MainHeader>
						<Title>{i18n.t("officialPages.officialContacts.title")}</Title>
						<MainHeaderButtonsWrapper>
							{/* <div
								style={{
								display: "flex",
								flexDirection: "row",
								flexWrap: "wrap",
								alignItems: "end"
								}}
							>
								<TextField
									style={{
										width: "200px",
                                        marginRight: "5px"
									}}
									placeholder={i18n.t("officialPages.officialContacts.search")}
									type="search"
									value={searchParam}
									onChange={handleSearch}
									InputProps={{
										startAdornment: (
										<InputAdornment position="start">
											<SearchIcon style={{ color: "gray" }} />
										</InputAdornment>
										),
									}}
								/>
								<Button
									variant="contained"
									color="primary"
									onClick={handleOpenWhatsAppModal}
                                    disabled={connectionName === "All"}
								>
									{i18n.t("connections.buttons.add")}
								</Button>
							</div> */}
							<Button
								variant="contained"
								color="primary"
								onClick={handleOpenWhatsAppModal}
                                // disabled={connectionName === "All"}
							>
								{i18n.t("connections.buttons.add")}
							</Button>
						</MainHeaderButtonsWrapper>
					</MainHeader>
					<Paper className={classes.mainPaper} variant="outlined">
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell align="center">
										{i18n.t("officialPages.officialContacts.phoneNumber")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("officialPages.officialContacts.connection")}
									</TableCell>
									<TableCell align="center">
										Ultima Atualização
									</TableCell>
									<TableCell align="center">
										{i18n.t("officialPages.officialContacts.actions")}
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{loading ? (
									<TableRowSkeleton columns={4} />
								) : (
									<>
										{whatsApps?.length > 0 &&
											whatsApps.map(whatsApp => {
												if (whatsApp.official && whatsApp.officialWhatsappId === connectionId) {
													return (
														<TableRow key={whatsApp.id}>
															<TableCell align="center">{whatsApp.name}</TableCell>
															<TableCell align="center">{connectionName}</TableCell>
															<TableCell align="center">{format(parseISO(whatsApp.updatedAt), "dd/MM/yyyy HH:mm")}</TableCell>
															<TableCell align="center">
																<IconButton
																	size="small"
																	onClick={() => handleEditWhatsApp(whatsApp)}
																>
																	<Edit />
																</IconButton>
															</TableCell>
														</TableRow>
													)
												}
											}
										)}
									</>
								)}
							</TableBody>
						</Table>
						{/* <div
							style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
						>
							<Button
								variant="outlined"
								onClick={() => { setPageNumber(prevPageNumber => prevPageNumber - 1) }}
								disabled={ pageNumber === 1}
							>
								{i18n.t("connections.buttons.previousPage")}
							</Button>
							<Typography
								style={{ display: "inline-block", fontSize: "1.25rem" }}
							>
								{ pageNumber } / { Math.ceil(count / 10) }
							</Typography>
							<Button
								variant="outlined"
								onClick={() => { setPageNumber(prevPageNumber => prevPageNumber + 1) }}
								disabled={ pageNumber >= Math.ceil(count / 10) }
							>
								{i18n.t("connections.buttons.nextPage")}
							</Button>
						</div> */}
					</Paper>
                </MainContainer>
			}
		</>
	);
};

export default OfficialContacts;
