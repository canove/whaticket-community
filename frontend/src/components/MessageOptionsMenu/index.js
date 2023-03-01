import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl, whatsapp }) => {
  const { i18n } = useTranslation();
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message);
    handleClose();
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleResendMessage = async () => {
    try {
      await api.post("/messages/resend", { message });
    } catch (err) {
      toastError(err);
    }
    
    handleClose();
  }

  return (
    <>
      <ConfirmationModal
        title={i18n.t("messageOptionsMenu.confirmationModal.title")}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteMessage}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        {message.fromMe && (
          <MenuItem onClick={handleOpenConfirmationModal}>
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>
        )}
        <MenuItem onClick={hanldeReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
        {(message.ack === 5 && whatsapp && (whatsapp.status === "CONNECTED" || (whatsapp.official && !whatsapp.deleted))) && (
          <MenuItem onClick={handleResendMessage}>
            Reenviar
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;
