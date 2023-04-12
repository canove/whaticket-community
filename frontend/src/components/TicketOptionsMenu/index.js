import React, { useContext, useEffect, useRef, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTranslation } from "react-i18next";
import Can from "../Can";
import { toast } from "react-toastify";

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
	// const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const { i18n } = useTranslation();

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	// const handleDeleteTicket = async () => {
	// 	try {
	// 		await api.delete(`/tickets/${ticket.id}`);
	// 	} catch (err) {
	// 		toastError(err);
	// 	}
	// };

	const handleBlacklistContact = async () => {
		try {
			await api.post(`/contacts/blacklist/${ticket.contactId}`);
			toast.success("Número adicionado à blacklist.");
		} catch (err) {
			toastError(err);
		}
	}

	// const handleOpenConfirmationModal = e => {
	// 	setConfirmationOpen(true);
	// 	handleClose();
	// };

	const handleOpenBlacklistConfirmationModal = e => {
		setBlacklistModalOpen(true);
		handleClose();
	}

	const handleOpenTransferModal = e => {
		setTransferTicketModalOpen(true);
		handleClose();
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

	return (
		<>
			<Menu
				id="menu-appbar"
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
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
				<MenuItem onClick={handleOpenTransferModal}>
					{i18n.t("ticketOptionsMenu.transfer")}
				</MenuItem>
				<MenuItem onClick={handleOpenBlacklistConfirmationModal}>
					{"Adicionar a Blacklist"}
				</MenuItem>
				{/* <Can
					permission="ticket-options:deleteTicket"
					item={
						<MenuItem onClick={handleOpenConfirmationModal}>
							{i18n.t("ticketOptionsMenu.delete")}
						</MenuItem>
					}
				/> */}
			</Menu>
			{/* <ConfirmationModal
				title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
					ticket.id
				} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
					ticket.contact.name
				}?`}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteTicket}
			>
				{i18n.t("ticketOptionsMenu.confirmationModal.message")}
			</ConfirmationModal> */}
			<ConfirmationModal
				title={`${ticket.contact.name} - ${ticket.contact.number}`}
				open={blacklistModalOpen}
				onClose={setBlacklistModalOpen}
				onConfirm={handleBlacklistContact}
			>
				{"Você tem certeza que deseja adicionar este contato à blacklist?"}
			</ConfirmationModal>
			<TransferTicketModal
				modalOpen={transferTicketModalOpen}
				onClose={handleCloseTransferTicketModal}
				ticketid={ticket.id}
			/>
		</>
	);
};

export default TicketOptionsMenu;
