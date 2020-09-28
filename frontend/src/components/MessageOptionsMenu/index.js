import React, { useState } from "react";

import { toast } from "react-toastify";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const MessageOptionsMenu = ({ messageId, menuOpen, handleClose, anchorEl }) => {
	const [confirmationOpen, setConfirmationOpen] = useState(false);

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${messageId}`);
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				toast.error(err.response.data.error);
			}
		}
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	return (
		<>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				setOpen={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<Menu
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
					{i18n.t("messageOptionsMenu.delete")}
				</MenuItem>
				<MenuItem disabled> {i18n.t("messageOptionsMenu.reply")}</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
