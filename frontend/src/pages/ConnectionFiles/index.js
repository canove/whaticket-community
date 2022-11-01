import React, { useState, useCallback, useEffect, useReducer, useContext } from "react";
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
} from "@material-ui/core";

import {
	Edit,
	DeleteOutline,
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTranslation } from 'react-i18next'
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConnectionFileModal from "../../components/ConnectionFileModal";

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
}));

const reducer = (state, action) => {
	if (action.type === "LOAD_CONNECTION_FILES") {
	  const connectionFiles = action.payload;
	  const newConnectionFiles = [];
  
	  connectionFiles.forEach((connectionFile) => {
		const connectionFileIndex = state.findIndex((c) => c.id === connectionFile.id);
		if (connectionFileIndex !== -1) {
		  state[connectionFileIndex] = connectionFile;
		} else {
		  newConnectionFiles.push(connectionFile);
		}
	  });
  
	  return [...state, ...newConnectionFiles];
	}
  
	if (action.type === "UPDATE_CONNECTION_FILES") {
	  const connectionFile = action.payload;
	  const connectionFileIndex = state.findIndex((c) => c.id === connectionFile.id);
  
	  if (connectionFileIndex !== -1) {
		state[connectionFileIndex] = connectionFile;
		return [...state];
	  } else {
		return [connectionFile, ...state];
	  }
	}
  
	if (action.type === "DELETE_CONNECTION_FILE") {
	  const connectionFileId = parseInt(action.payload);

	  const connectionFileIndex = state.findIndex((c) => c.id === connectionFileId);
	  if (connectionFileIndex !== -1) {
		state.splice(connectionFileIndex, 1);
	  }
	  return [...state];
	}
  
	if (action.type === "RESET") {
	  return [];
	}
}

const ConnectionFiles = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [connectionFiles, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);
	const [connectionFileModalOpen, setConnectionFileModalOpen] = useState(false);
	const [selectedConnectionFile, setSelectedConnectionFile] = useState(null);
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
	const { user } = useContext(AuthContext);

	useEffect(() => {
		dispatch({ type: "RESET" });
	}, []);

	useEffect(() => {
		setLoading(true);
		const fetchConnectionFiles = async () => {
			try {
				const { data } = await api.get(`/connectionFiles/`);
				dispatch({ type: "LOAD_CONNECTION_FILES", payload: data });
				setLoading(false);
			} catch (err) {
				setLoading(false);
				toastError(err);
			}
		};

		fetchConnectionFiles();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on(`connectionFile${user.companyId}`, data => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_CONNECTION_FILES", payload: data.connectionFile });
			}
		});

		socket.on(`connectionFile${user.companyId}`, data => {
			if (data.action === "delete") {
				dispatch({ type: "DELETE_CONNECTION_FILE", payload: data.connectionFileId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleOpenConnectionFileModal = () => {
		setSelectedConnectionFile(null);
		setConnectionFileModalOpen(true);
	};

	const handleCloseConnectionFileModal = useCallback(() => {
		setConnectionFileModalOpen(false);
		setSelectedConnectionFile(null);
	}, [setSelectedConnectionFile, setConnectionFileModalOpen]);

	const handleEditConnectionFile = connectionFile => {
		setSelectedConnectionFile(connectionFile);
		setConnectionFileModalOpen(true);
	};

	const handleOpenConfirmationModal = (action, connectionFileId) => {
		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: "Deletar Pasta",
				message: "Você realmente deseja deletar esta pasta?",
				connectionFileId: connectionFileId,
			});
		}

		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/connectionFiles/${confirmModalInfo.connectionFileId}`);
				toast.success("Pasta deletada com sucesso!");
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{ confirmModalInfo.message }
			</ConfirmationModal>
			<ConnectionFileModal
				open={connectionFileModalOpen}
				onClose={handleCloseConnectionFileModal}
				connectionFileId={selectedConnectionFile?.id}
			/>
			<MainHeader>
				<Title>{i18n.t("connectionsFiles.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenConnectionFileModal}
					>
						{i18n.t("connectionsFiles.buttons.create")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{i18n.t("connectionsFiles.table.icon")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connectionsFiles.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connectionsFiles.table.createdAt")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connectionsFiles.table.updatedAt")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connectionsFiles.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{ connectionFiles && connectionFiles.map(connectionFile => (
							<TableRow key={connectionFile.id}>
								<TableCell align="center">
									<img src={connectionFile.icon} style={{ maxWidth: "50px" }} />
								</TableCell>
								<TableCell align="center">{connectionFile.name}</TableCell>
								<TableCell align="center">
									{ format(parseISO(connectionFile.createdAt), "dd/MM/yy HH:mm") }
								</TableCell>
								<TableCell align="center">
									{ format(parseISO(connectionFile.updatedAt), "dd/MM/yy HH:mm") }
								</TableCell>
								<TableCell align="center">
									<IconButton
										size="small"
										onClick={() => handleEditConnectionFile(connectionFile)}
									>
										<Edit />
									</IconButton>
									<IconButton
										size="small"
										onClick={e => {
											handleOpenConfirmationModal("delete", connectionFile.id);
										}}
									>
										<DeleteOutline />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
						{ loading && <TableRowSkeleton columns={3} /> }
					</TableBody>
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default ConnectionFiles;
