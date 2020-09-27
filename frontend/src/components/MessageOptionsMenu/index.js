import React, { useState } from "react";

// import { toast } from "react-toastify";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

// import { i18n } from "../../translate/i18n";
// import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const MessageOptionsMenu = ({ messageId, menuOpen, handleClose, anchorEl }) => {
	const [confirmationOpen, setConfirmationOpen] = useState(false);

	const handleDeleteMessage = async () => {
		console.log("message deleted", messageId);

		// try {
		// 	await api.delete(`/messages/${message.id}`);
		// } catch (err) {
		// 	toast.error("Erro ao deletar o message");
		// }
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	return (
		<>
			<ConfirmationModal
				title={`Delete message?`}
				open={confirmationOpen}
				setOpen={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				This action cannot be reverted.
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
					Delete Message
				</MenuItem>
				<MenuItem onClick={e => console.log("clicked reply")}>
					Reply Message
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
