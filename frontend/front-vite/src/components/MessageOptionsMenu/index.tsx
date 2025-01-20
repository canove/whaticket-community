import { useState, useContext } from "react";

import MenuItem from "@mui/material/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import Menu from "@mui/material/Menu";

import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import type { Error } from "../../types/Error";

interface Message {
  id: string;
  fromMe: boolean;
  // Add other properties of the message object as needed
}

interface MessageOptionsMenuProps {
  message: Message;
  menuOpen: boolean;
  handleClose: () => void;
  anchorEl: null | HTMLElement;
}

const MessageOptionsMenu: React.FC<MessageOptionsMenuProps> = ({
  message,
  menuOpen,
  handleClose,
  anchorEl,
}) => {
  const context = useContext(ReplyMessageContext);
  if (!context) {
    throw new Error("ReplyMessageContext is null");
  }
  const { setReplyingMessage } = context;
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err as Error);
    }
  };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message as unknown as string);
    handleClose();
  };

  const handleOpenConfirmationModal = () => {
    setConfirmationOpen(true);
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
      <Menu
        anchorEl={anchorEl}
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
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;
