import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import toastError from "../../errors/toastError";
import MessageHistoryModal from "../MessageHistoryModal";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage } = useContext(EditMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleReplyMessage = () => {
    setReplyingMessage(message);
    handleClose();
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleEditMessage = async () => {
    setEditingMessage(message);
    handleClose();
  }

  const handleOpenMessageHistoryModal = (e) => {
    setMessageHistoryOpen(true);
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
      <MessageHistoryModal
        open={messageHistoryOpen}
        onClose={setMessageHistoryOpen}
        oldMessages={message.oldMessages}
      >
      </MessageHistoryModal>
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
        {message.fromMe && [
          <MenuItem key="delete" onClick={handleOpenConfirmationModal}>
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>,
          <MenuItem key="edit" onClick={handleEditMessage}>
            {i18n.t("messageOptionsMenu.edit")}
          </MenuItem>
        ]}
        {message.oldMessages?.length > 0 && (
          <MenuItem key="history" onClick={handleOpenMessageHistoryModal}>
            {i18n.t("messageOptionsMenu.history")}
          </MenuItem>
        )}
        <MenuItem key="reply" onClick={handleReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;
