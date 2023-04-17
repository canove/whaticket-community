import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import DeletePeoplesModal from "../DeletePeoplesModal";
import SelectAdminModal from "../SelectAdminModal";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
	const history = useHistory();

	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const [deletePeoplesModal, setDeletePeoplesModal] = useState(false);
	const [selectAdminModal, setSelectAdminModal] = useState(false);
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const numberOfGroup = history.location.pathname.split('/')[2];

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleOpenTransferModal = e => {
		setTransferTicketModalOpen(true);
		handleClose();
	};

	const handleOpenDeletePeoplesModal = e => {
		setDeletePeoplesModal(true);
		handleClose();
	};

	const handleOpenSelectAdminModal = e => {
		setSelectAdminModal(true);
		handleClose();
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

	const handleOnlyAdm = async () => {
		const { data: { contact: { number } }, data } = await api.get(`/tickets/${numberOfGroup}`)
		// console.log(data);
		await api.put('/group/onlyAdmin', {
			chatID: `${number}@g.us`
		})
		window.location.reload();
	}

	const handleCloseDeletePeoplesModal = () => {
		if (isMounted.current) {
			setDeletePeoplesModal(false);
		}
	};

	const handleSelectAdminModal = () => {
		if (isMounted.current) {
			setSelectAdminModal(false);
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
				<Can
					role={user.profile}
					perform="ticket-options:deleteTicket"
					yes={() => (
						<MenuItem onClick={handleOpenConfirmationModal}>
							{i18n.t("ticketOptionsMenu.delete")}
						</MenuItem>
					)}
				/>
				<MenuItem onClick={handleOpenDeletePeoplesModal}>
					Remover pessoas
				</MenuItem>
				<MenuItem onClick={handleOpenSelectAdminModal}>
					Tornas pessoas admins
				</MenuItem>
				<MenuItem onClick={handleOnlyAdm}>
					Bloquear só para administradores falarem
				</MenuItem>
			</Menu>
			<ConfirmationModal
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
			</ConfirmationModal>
			<TransferTicketModal
				modalOpen={transferTicketModalOpen}
				onClose={handleCloseTransferTicketModal}
				ticketid={ticket.id}
				ticketWhatsappId={ticket.whatsappId}
			/>
			<DeletePeoplesModal
				modalOpen={deletePeoplesModal}
				onClose={handleCloseDeletePeoplesModal}
				ticketid={ticket.id}
				ticketWhatsappId={ticket.whatsappId}
			/>
			<SelectAdminModal
				modalOpen={selectAdminModal}
				onClose={handleSelectAdminModal}
				ticketid={ticket.id}
				ticketWhatsappId={ticket.whatsappId}
			/>
		</>
	);
};

export default TicketOptionsMenu;
