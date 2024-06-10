import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";

const NewPrivateNoteModal = ({
  modalOpen,
  onClose,
  ticketId,
  actualUserName,
  ticketPrivateNote,
}) => {
  const [loading, setLoading] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState("");

  useEffect(() => {
    if (ticketPrivateNote) {
      setTextFieldValue(ticketPrivateNote);
    }
  }, [ticketPrivateNote]);

  const handleSaveTicket = async (contactId) => {
    const textFieldValueToSave = textFieldValue.trim();

    if (textFieldValueToSave === "") {
      return;
    }
    setLoading(true);

    try {
      await api.post(`/privateMessages/${ticketId}`, {
        body: `*${actualUserName}:*\n${textFieldValueToSave.trim()}`,
      });
    } catch (err) {
      toastError(err);
    }
    setLoading(false);

    handleClose();
    return;
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">Nota privada</DialogTitle>
        <DialogContent dividers>
          <TextField
            style={{ width: "300px" }}
            onChange={(e) => setTextFieldValue(e.target.value)}
            value={textFieldValue}
            multiline
            minRows={5}
            fullWidth
            variant="outlined"
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={false}
            onClick={() => {
              handleSaveTicket();
            }}
            color="primary"
            loading={loading}
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewPrivateNoteModal;
