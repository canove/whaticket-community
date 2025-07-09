import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import MessageForwardModal from "../MessageFowardModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [fowardMessage, setFowardMessage] = useState(false);

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

  const handleForwardMessage = () => {
    setFowardMessage(true);
  };

  const handleForwardMessageClose = () => {
    setFowardMessage(false);
    handleClose();
  };

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
      <MessageForwardModal
        message={message}
        onClose={handleForwardMessageClose}
        modalOpen={fowardMessage}
      />
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
        <MenuItem onClick={hanldeReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
        <MenuItem onClick={handleForwardMessage}>
          {i18n.t("messageOptionsMenu.forward")}
        </MenuItem>
        {message.fromMe && (
          <MenuItem onClick={handleOpenConfirmationModal}>
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;
