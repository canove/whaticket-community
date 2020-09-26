import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const history = useHistory();

	const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
		} catch (err) {
			toast.error("Erro ao deletar o ticket");
		}
	};

	const handleTransferTicket = e => {
		console.log("transfered");
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	return (
		<>
			<Menu
				id="menu-appbar"
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				keepMounted
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				<MenuItem onClick={handleOpenConfirmationModal}>
					{i18n.t("ticketOptionsMenu.delete")}
				</MenuItem>
				<MenuItem onClick={handleTransferTicket}>
					{i18n.t("ticketOptionsMenu.transfer")}
				</MenuItem>
			</Menu>
			<ConfirmationModal
				title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
					ticket.id
				} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
					ticket.contact.name
				}?`}
				open={confirmationOpen}
				setOpen={setConfirmationOpen}
				onConfirm={handleDeleteTicket}
			>
				{i18n.t("ticketOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
		</>
	);
};

export default TicketOptionsMenu;
