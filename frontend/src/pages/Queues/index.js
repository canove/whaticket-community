import React, { useEffect, useState } from "react";

import {
	Button,
	IconButton,
	makeStyles,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";

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
}));

const Queues = () => {
	const classes = useStyles();

	const [queues, setQueue] = useState([]);
	const [loading, setLoading] = useState(false);

	const [queueModalOpen, setQueueModalOpen] = useState(false);
	const [selectedQueue, setSelectedQueue] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/queue");

				setQueue(data);
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	const handleOpenQueueModal = () => {
		setQueueModalOpen(true);
		setSelectedQueue(null);
	};

	const handleCloseQueueModal = () => {
		setQueueModalOpen(false);
		setSelectedQueue(null);
	};

	const handleEditQueue = queue => {
		setSelectedQueue(queue);
		setQueueModalOpen(true);
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedQueue(null);
	};

	const handleDeleteQueue = async queueId => {
		try {
			await api.delete(`/queue/${queueId}`);
			toast.success(i18n.t("Queue deleted successfully!"));
		} catch (err) {
			toastError(err);
		}
		setSelectedQueue(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedQueue &&
					`${i18n.t("queues.confirmationModal.deleteTitle")} ${
						selectedQueue.name
					}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteQueue(selectedQueue.id)}
			>
				{i18n.t("queues.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<QueueModal
				open={queueModalOpen}
				onClose={handleCloseQueueModal}
				queueId={selectedQueue?.id}
			/>
			<MainHeader>
				<Title>{i18n.t("queues.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenQueueModal}
					>
						{i18n.t("queues.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{i18n.t("queues.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("queues.table.color")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("queues.table.greeting")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("queues.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<>
							{queues.map(queue => (
								<TableRow key={queue.id}>
									<TableCell align="center">{queue.name}</TableCell>
									<TableCell align="center">
										<div className={classes.customTableCell}>
											<span
												style={{
													backgroundColor: queue.color,
													width: 60,
													height: 20,
													alignSelf: "center",
												}}
											/>
										</div>
									</TableCell>
									<TableCell align="center">
										<div className={classes.customTableCell}>
											<Typography
												style={{ width: 300, align: "center" }}
												noWrap
												variant="body2"
											>
												{queue.greetingMessage}
											</Typography>
										</div>
									</TableCell>
									<TableCell align="center">
										<IconButton
											size="small"
											onClick={() => handleEditQueue(queue)}
										>
											<Edit />
										</IconButton>

										<IconButton
											size="small"
											onClick={() => {
												setSelectedQueue(queue);
												setConfirmModalOpen(true);
											}}
										>
											<DeleteOutline />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{loading && <TableRowSkeleton />}
						</>
					</TableBody>
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default Queues;
