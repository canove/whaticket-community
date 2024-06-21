import React, { useContext, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../ConfirmationModal";

const MessageOptionsMenu = ({
  message,
  menuOpen,
  handleClose,
  anchorEl,
  canChangeTheIsCompanyMemberFromTheContact,
}) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleChangeIsCompanyMember = async (nextValue) => {
    try {
      await api.put(`/contacts/${message.contact?.id}`, {
        ...message.contact,
        isCompanyMember: nextValue,
      });
      handleClose();
    } catch (err) {
      toastError(err);
      handleClose();
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
        {canChangeTheIsCompanyMemberFromTheContact && (
          <MenuItem
            onClick={() =>
              handleChangeIsCompanyMember(!message.contact?.isCompanyMember)
            }
          >
            {message.contact?.isCompanyMember
              ? "Desmarcar contacto como mienbro"
              : "Marcar contacto como mienbro"}
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
