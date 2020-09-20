import React, { useState, useEffect, useReducer, useCallback } from "react";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

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
} from "@material-ui/core";
import { Edit, DeleteOutline, CheckCircle } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_WHATSAPPS") {
		const whatsApps = action.payload;

		return [...whatsApps];
	}

	if (action.type === "UPDATE_WHATSAPPS") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
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

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
}));

const Connections = () => {
	const classes = useStyles();

	const [whatsApps, dispatch] = useReducer(reducer, []);

	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [deletingWhatsApp, setDeletingWhatsApp] = useState(null);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/whatsapp/");
				dispatch({ type: "LOAD_WHATSAPPS", payload: data });
			} catch (err) {
				console.log(err);
				if (err.response && err.response.data && err.response.data.error) {
					toast.error(err.response.data.error);
				}
			}
		};
		fetchSession();
	}, []);

	// useEffect(() => {
	// 	const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

	// 	socket.on("whatsapp", data => {
	// 		if (data.action === "update") {
	// 			dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
	// 		}
	// 	});

	// 	socket.on("whatsapp", data => {
	// 		if (data.action === "delete") {
	// 			dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
	// 		}
	// 	});

	// 	socket.on("whatsappSession", data => {
	// 		if (data.action === "update") {
	// 			dispatch({ type: "UPDATE_SESSION", payload: data.session });
	// 		}
	// 	});

	// 	return () => {
	// 		socket.disconnect();
	// 	};
	// }, []);

	// const handleDisconnectSession = async whatsAppId => {
	// 	try {
	// 		await api.put(`/whatsapp/whatsApp/${whatsAppId}`, {
	// 			whatsApp: "",
	// 			status: "pending",
	// 		});
	// 	} catch (err) {
	// 		console.log(err);
	// 		if (err.response && err.response.data && err.response.data.error) {
	// 			toast.error(err.response.data.error);
	// 		}
	// 	}
	// };

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
		setQrModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleDeleteWhatsApp = async whatsAppId => {
		try {
			await api.delete(`/whatsapp/${whatsAppId}`);
			toast.success("Deleted!");
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				toast.error(err.response.data.error);
			}
		}
		setDeletingWhatsApp(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={deletingWhatsApp && `Delete ${deletingWhatsApp.name}?`}
				open={confirmModalOpen}
				setOpen={setConfirmModalOpen}
				onConfirm={() => handleDeleteWhatsApp(deletingWhatsApp.id)}
			>
				Are you sure? It cannot be reverted.
			</ConfirmationModal>
			{/* <QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={
					selectedWhatsApp && !whatsAppModalOpen && selectedWhatsApp.id
				}
			/> */}
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={selectedWhatsApp && !qrModalOpen && selectedWhatsApp.id}
			/>
			<MainHeader>
				<Title>Connections</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenWhatsAppModal}
					>
						Add Whatsapp
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">Name</TableCell>
							<TableCell align="center">Status</TableCell>
							<TableCell align="center">Last update</TableCell>
							<TableCell align="center">Default</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{false ? (
							<TableRowSkeleton />
						) : (
							<>
								{whatsApps &&
									whatsApps.length > 0 &&
									whatsApps.map((whatsApp, index) => (
										<TableRow key={whatsApp.id}>
											<TableCell align="center">{whatsApp.name}</TableCell>
											<TableCell align="center">
												{whatsApp.status === "qrcode" ? (
													<Button
														size="small"
														variant="contained"
														color="primary"
														onClick={() => handleOpenQrModal(whatsApp)}
													>
														QR CODE
													</Button>
												) : (
													whatsApp.status
												)}
											</TableCell>
											<TableCell align="center">
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												{whatsApp.isDefault && (
													<CheckCircle style={{ color: green[500] }} />
												)}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
												>
													<Edit />
												</IconButton>

												<IconButton
													size="small"
													onClick={e => {
														setConfirmModalOpen(true);
														setDeletingWhatsApp(whatsApp);
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
			</Paper>
		</MainContainer>
	);
};

export default Connections;
