import React, { useState, useEffect, useReducer } from "react";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
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
import { WifiOff, DeleteOutline } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import SessionModal from "../../components/SessionModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_SESSIONS") {
		const sessions = action.payload;

		return [...sessions];
	}

	if (action.type === "UPDATE_SESSIONS") {
		const session = action.payload;
		const sessionIndex = state.findIndex(s => s.id === session.id);

		if (sessionIndex !== -1) {
			state[sessionIndex] = session;
			return [...state];
		} else {
			return [session, ...state];
		}
	}

	if (action.type === "DELETE_SESSION") {
		const sessionId = action.payload;

		const sessionIndex = state.findIndex(s => s.id === sessionId);
		if (sessionIndex !== -1) {
			state.splice(sessionIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const useStyles = makeStyles(theme => ({
	// root: {
	// 	display: "flex",
	// 	alignItems: "center",
	// 	justifyContent: "center",
	// 	padding: theme.spacing(4),
	// },

	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},

	// paper: {
	// 	padding: theme.spacing(2),
	// 	margin: theme.spacing(1),
	// 	display: "flex",
	// 	width: 400,
	// 	height: 270,
	// 	overflow: "auto",
	// 	flexDirection: "column",
	// 	alignItems: "center",
	// 	justifyContent: "center",
	// },

	// fixedHeight: {
	// 	height: 640,
	// },
}));

const WhatsAuth = () => {
	const classes = useStyles();

	const [sessions, dispatch] = useReducer(reducer, []);

	const [sessionModalOpen, setSessionModalOpen] = useState(false);
	// const [sessionModalOpen, setSessionModalOpen] = useState(false);
	const [selectedSession, setSelectedSession] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	// const [deletingSession, setDeletingSession] = useState(null);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/whatsapp/session/");
				dispatch({ type: "LOAD_SESSIONS", payload: data });
			} catch (err) {
				console.log(err);
				if (err.response && err.response.data && err.response.data.error) {
					toast.error(err.response.data.error);
				}
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.on("session", data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_SESSIONS", payload: data.session });
			}
		});

		socket.on("session", data => {
			if (data.action === "delete") {
				dispatch({ type: "DELETE_SESSION", payload: data.sessionId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleDisconnectSession = async sessionId => {
		try {
			await api.put(`/whatsapp/session/${sessionId}`, {
				session: "",
				status: "pending",
			});
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				toast.error(err.response.data.error);
			}
		}
	};

	const handleOpenSessionModal = session => {
		setSelectedSession(null);
		setSessionModalOpen(true);
	};

	const handleCloseSessionModal = () => {
		setSessionModalOpen(false);
		setSelectedSession(null);
	};

	const handleEditUser = session => {
		setSelectedSession(session);
		setSessionModalOpen(true);
	};

	const handleDeleteSession = async sessionId => {
		try {
			await api.delete(`/whatsapp/session/${sessionId}`);
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				toast.error(err.response.data.error);
			}
		}
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={selectedSession && `Delete ${selectedSession.name}?`}
				open={confirmModalOpen}
				setOpen={setConfirmModalOpen}
				onConfirm={e => handleDeleteSession(selectedSession.id)}
			>
				Are you sure? It cannot be reverted.
			</ConfirmationModal>
			<SessionModal
				open={sessionModalOpen}
				onClose={handleCloseSessionModal}
				aria-labelledby="form-dialog-title"
				sessionId={selectedSession && selectedSession.id}
			/>
			<MainHeader>
				<Title>Connections</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenSessionModal}
					>
						Add Whatsapp
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper
				className={classes.mainPaper}
				variant="outlined"
				// onScroll={handleScroll}
			>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">Name</TableCell>
							<TableCell align="center">Status</TableCell>
							<TableCell align="center">Last update</TableCell>
							<TableCell align="center">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{false ? (
							<TableRowSkeleton />
						) : (
							<>
								{sessions &&
									sessions.length > 0 &&
									sessions.map((session, index) => (
										<TableRow key={session.id}>
											<TableCell align="center">{session.name}</TableCell>
											<TableCell align="center">
												{session.status === "qrcode" ? (
													<Button
														size="small"
														variant="contained"
														color="primary"
														onClick={() => handleEditUser(session)}
													>
														QR CODE
													</Button>
												) : (
													session.status
												)}
											</TableCell>
											<TableCell align="center">
												{format(parseISO(session.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleDisconnectSession(session.id)}
												>
													<WifiOff />
												</IconButton>

												<IconButton
													size="small"
													onClick={e => {
														setConfirmModalOpen(true);
														setSelectedSession(session);
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

			{/* <div className={classes.root}>
				{sessions &&
					sessions.length > 0 &&
					sessions.map(session => {
						if (session.status === "disconnected")
							return (
								<Paper className={classes.paper}>
									<Qrcode qrCode={qrCode} />
								</Paper>
							);
						else {
							return (
								<Paper className={classes.paper}>
									<SessionInfo session={session} />
								</Paper>
							);
						}
					})}
			</div> */}
		</MainContainer>
	);
};

export default WhatsAuth;
