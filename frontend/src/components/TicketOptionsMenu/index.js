import React, { useContext, useEffect, useRef, useState } from "react";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { Can } from "../Can";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
  const history = useHistory();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const [recoveringTheEntireConversation, setRecoveringTheEntireConversation] =
    useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

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

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenTransferModal = (e) => {
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
        {ticket.isGroup ? (
          <>
            <MenuItem
              onClick={async () => {
                try {
                  await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                    leftGroup: true,
                  });

                  await api.post(`/privateMessages/${ticket.id}`, {
                    body: `${user?.name} *Envio a resueltos* la conversación y *Salió del grupo*`,
                  });
                  history.push(`/tickets`);
                } catch (err) {
                  toastError(err);
                }
              }}
            >
              Salir del grupo y Resolver ticket
            </MenuItem>
            <MenuItem
              onClick={async () => {
                try {
                  await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                  });

                  await api.post(`/privateMessages/${ticket.id}`, {
                    body: `${user?.name} *Envio a resueltos* la conversación`,
                  });
                  history.push(`/tickets`);
                } catch (err) {
                  toastError(err);
                }
              }}
            >
              Resolver ticket
            </MenuItem>
          </>
        ) : (
          <>
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
          </>
        )}
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
    </>
  );
};

export default TicketOptionsMenu;
