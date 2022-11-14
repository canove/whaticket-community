import React, { useState, useCallback, useEffect, useReducer, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
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

const Connections = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [whatsApps, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);
	const [pageNumber, setPageNumber] = useState(1);
	const [count, setCount] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const { user } = useContext(AuthContext);

	const { connectionFileName } = useParams();
	const history = useHistory();
	const [connectionFiles, setConnectionFiles] = useState([]);
	const [connectionFileId, setConnectionFileId] = useState("");
	const [searchParam, setSearchParam] = useState("");
	const [status, setStatus] = useState("");

	const [service, setService] = useState("");
	const [services, setServices] = useState([]);
	const [newQrCodeServiceModalOpen, setNewQrCodeServiceModalOpen] = useState(false);
	const [selectedWhatsAppId, setSelectedWhatsAppId] = useState("");

	const [editWhatsModalOpen, setEditWhatsModalOpen] = useState(false);

	useEffect(() => {
		dispatch({ type: "RESET" });
	}, [pageNumber, searchParam, status]);

	useEffect(() => {
		setPageNumber(1);
	  }, [searchParam, status]);

	useEffect(() => {
		setLoading(true);
		const fetchWhats = async () => {
			try {
				const { data } = await api.get(`/whatsapp/list/`, {
					params: {
						official: false,
						pageNumber,
						connectionFileName,
						searchParam,
						status
					}
				});
				dispatch({ type: "LOAD_WHATSAPPS", payload: data.whatsapps });
				setCount(data.count);
				setHasMore(data.hasMore);
				setConnectionFileId(data.connectionFileId ? data.connectionFileId : "");
				setLoading(false);
			} catch (err) {
				setLoading(false);
				toastError(err);
			}
		};

		if (connectionFileName) {
			fetchWhats();
		} else {
			setSearchParam("");
			setStatus("");
		}
	}, [pageNumber, searchParam, connectionFileName, status]);

	useEffect(() => {
		const fetchConnectionFiles = async () => {
			try {
				const { data } = await api.get(`/connectionFiles/`);
				setConnectionFiles(data);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				toastError(err);
			}
		};

		const fetchServices = async () => {
			if (user.companyId !== 1) return;
			try {
				const { data } = await api.get(`/firebase/company/${user.companyId}`);
				setServices(data);
			} catch (err) {
				toastError(err);
			}
		}

		fetchConnectionFiles();
		fetchServices();
	}, [])

	useEffect(() => {
		const socket = openSocket();

		socket.on(`whatsapp${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}
		});

		socket.on(`whatsapp${user.companyId}`, data => {
			if (data.action === "delete") {
				dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
			}
		});

		socket.on(`whatsappSession${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_SESSION", payload: data.session });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleStartWhatsAppSession = async whatsAppId => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async whatsAppId => {
		if (user.companyId === 1) {
			setSelectedWhatsAppId(whatsAppId);
			setNewQrCodeServiceModalOpen(true);
		} else {
			try {
				await api.put(`/whatsappsession/${whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}
	};

	const handleCreateNewQRCodeWithService = async () => {
		const body = {
			service
		}

		try {
			await api.put(`/whatsappsession/${selectedWhatsAppId}`, body);
		} catch (err) {
			toastError(err);
		}

		handleNewQrCodeServiceModalClose();
	}

	const handleNewQrCodeServiceModalClose = () => {
		setNewQrCodeServiceModalOpen(false);
		setService("");
		setSelectedWhatsAppId("");
	}

	const handleServiceChange = (e) => {
		setService(e.target.value);
	}

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

	const handleOpenQrModal = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const clickOn = click => {
        if (click === true) {
            return "Sim";
        }
        if (click === false) {
            return "Não";
        }
        return click;
    };

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	const renderActionButtons = whatsApp => {
		return (
			<>
				{whatsApp.status === "qrcode" && (
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={() => handleOpenQrModal(whatsApp)}
					>
						{i18n.t("connections.buttons.qrcode")}
					</Button>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Button
							size="small"
							variant="outlined"
							color="primary"
							onClick={() => handleStartWhatsAppSession(whatsApp.id)}
						>
							{i18n.t("connections.buttons.tryAgain")}
						</Button>{" "}
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
					<Button
						size="small"
						variant="outlined"
						color="secondary"
						onClick={() => {
							handleOpenConfirmationModal("disconnect", whatsApp.id);
						}}
					>
						{i18n.t("connections.buttons.disconnect")}
					</Button>
				)}
				{whatsApp.status === "OPENING" && (
					<Button size="small" variant="outlined" disabled color="default">
						{i18n.t("connections.buttons.connecting")}
					</Button>
				)}
			</>
		);
	};

	const renderStatusToolTips = whatsApp => {
		return (
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} className={classes.buttonProgress} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar style={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</div>
		);
	};

	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	};

	const handleStatusChange = (e) => {
		setStatus(e.target.value);
	}

	const handleOpenEditWhatsModal = (whats) => {
		setSelectedWhatsApp(whats);
		setEditWhatsModalOpen(true);
	}

	const handleCloseEditWhatsModal = () => {
		setSelectedWhatsApp(null);
		setEditWhatsModalOpen(false);
	}

	return (
		<>
			{ !connectionFileName &&
				<MainContainer>
					<MainHeader>
						<Title>Conexões</Title>
					</MainHeader>
					<Paper className={classes.cardsPaper} variant="outlined">
						{ connectionFiles && connectionFiles.map(connectionFile => (
							<Card key={connectionFile.id} className={classes.cardRoot} onClick={() => { history.push(`/Connections/${connectionFile.name}`); }}>
								<CardActionArea style={{ height: "100%" }}>
									{ connectionFile.icon &&
										<CardMedia
											className={classes.cardMedia}
											image={connectionFile.icon}
										/>
									}
									<CardContent>
										<Typography gutterBottom variant="h5" component="h2" style={{ textAlign: "center" }} >
											{ connectionFile.name }
										</Typography>
									</CardContent>
								</CardActionArea>
							</Card>
						))}
						<Card className={classes.cardRoot} onClick={() => { history.push('/Connections/No Category'); }}>
							<CardActionArea style={{ height: "100%" }} >
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2" style={{ textAlign: "center" }} >
										{i18n.t("connectionsFiles.categories.noCategory")}
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					</Paper>
				</MainContainer>
			}
			{ connectionFileName &&
				<MainContainer>
					<ConfirmationModal
						title={confirmModalInfo.title}
						open={confirmModalOpen}
						onClose={setConfirmModalOpen}
						onConfirm={handleSubmitConfirmationModal}
					>
						{confirmModalInfo.message}
					</ConfirmationModal>
					<QrcodeModal
						open={qrModalOpen}
						onClose={handleCloseQrModal}
						whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
					/>
					<WhatsAppModal
						open={whatsAppModalOpen}
						onClose={handleCloseWhatsAppModal}
						whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
						connectionFileId={connectionFileId}
					/>
					<WhatsConfigModal
						open={editWhatsModalOpen}
						onClose={handleCloseEditWhatsModal}
						whatsappId={selectedWhatsApp?.id}
					/>
					<div className={classes.root}>
						<Dialog
							open={newQrCodeServiceModalOpen}
							onClose={handleNewQrCodeServiceModalClose}
							maxWidth="xs"
							fullWidth
							scroll="paper"
						>
							<DialogTitle>
								Selecione um Serviço
							</DialogTitle>
							<DialogContent>
								<div>
									<FormControl
										variant="outlined"
										className={classes.multFieldLine}
										margin="dense"
										fullWidth
									>
										<InputLabel>Serviço</InputLabel>
										<Select
											value={service}
											onChange={(e) => { handleServiceChange(e) }}
											label="Serviço"
										>
											<MenuItem value={""}>Nenhum</MenuItem>
											{ services && services.map(service => {
												if (service.data.isFull || !service.data.connected) return;
												return (
													<MenuItem value={service.data.service} key={service.data.service}>{service.data.service}</MenuItem>
												)
											}) }
										</Select>
									</FormControl>
								</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleNewQrCodeServiceModalClose}
									color="secondary"
									variant="outlined"
								>
									{i18n.t("whatsappModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
									onClick={handleCreateNewQRCodeWithService}
								>
									Criar QRCode
								</Button>
							</DialogActions>
						</Dialog>
					</div>
					<MainHeader>
						<Title>{i18n.t("connections.title")}</Title>
						<MainHeaderButtonsWrapper>
							<div
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
									}}
									placeholder="Pesquisar Número"
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
								<FormControl
									style={{
										margin: "0 10px",
									}}
								>
									<InputLabel id="status-select-label">
										Status
									</InputLabel>
									<Select
										labelId="status-select-label"
										id="status-select"
										value={status}
										label="Status"
										onChange={handleStatusChange}
										style={{width: "150px"}}
									>
										<MenuItem value={""}>Nenhum</MenuItem>
										<MenuItem value={"connected"}>Conectado</MenuItem>
										<MenuItem value={"disconnected"}>Desconectado</MenuItem>
									</Select>
								</FormControl>
								<Button
									variant="contained"
									color="primary"
									onClick={handleOpenWhatsAppModal}
								>
									{i18n.t("connections.buttons.add")}
								</Button>
							</div>
						</MainHeaderButtonsWrapper>
					</MainHeader>
					<Paper className={classes.mainPaper} variant="outlined">
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell align="center">
										Perfil
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.name")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.status")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.session")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.lastUpdate")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.createdAt")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("Business")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.default")}
									</TableCell>
									<TableCell align="center">
										{i18n.t("connections.table.actions")}
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{loading ? (
									<TableRowSkeleton columns={6} />
								) : (
									<>
										{whatsApps?.length > 0 &&
											whatsApps.map(whatsApp => (
												<TableRow key={whatsApp.id}>
													<TableCell align="center">
														<div
															style={{
																display: "flex",
																justifyContent: "center",
																alignItems: "center",
															}}
														>
															{whatsApp.whatsImage && 
															<img
																style={{
																	border: "1px solid rgba(0,0,0,0.5)",
																	borderRadius: "100%",
																	heigth: "30px",
																	marginRight: "5px",
																	width: "30px",
																}}
																src={whatsApp.whatsImage}
															/>
														}
															{whatsApp.whatsName}
														</div>
													</TableCell>
													<TableCell align="center">{whatsApp.name}</TableCell>
													<TableCell align="center">
														{renderStatusToolTips(whatsApp)}
													</TableCell>
													<TableCell align="center">
														{renderActionButtons(whatsApp)}
													</TableCell>
													<TableCell align="center">
														{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
													</TableCell>
													<TableCell align="center">
														{format(parseISO(whatsApp.createdAt), "dd/MM/yy HH:mm")}
													</TableCell>
													<TableCell align="center">{clickOn(whatsApp.business)}</TableCell>
													<TableCell align="center">
														{whatsApp.isDefault && (
															<div className={classes.customTableCell}>
																<CheckCircle style={{ color: green[500] }} />
															</div>
														)}
													</TableCell>
													<TableCell align="center">	
														{ whatsApp.status === "CONNECTED" && 
															<IconButton
																size="small"
																onClick={() => handleOpenEditWhatsModal(whatsApp)}
															>
																<SettingsIcon />
															</IconButton>
														}

														<IconButton
															size="small"
															onClick={() => handleEditWhatsApp(whatsApp)}
														>
															<Edit />
														</IconButton>
														
														<IconButton
															size="small"
															onClick={e => {
																handleOpenConfirmationModal("delete", whatsApp.id);
															}}
														>
															<DeleteOutline />
														</IconButton>
													</TableCell>
												</TableRow>
											))}
									</>
								)}
							</TableBody>
						</Table>
						<div
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
								disabled={ !hasMore }
							>
								{i18n.t("connections.buttons.nextPage")}
							</Button>
						</div>
					</Paper>
				</MainContainer>
			}
		</>
	);
};

export default Connections;
