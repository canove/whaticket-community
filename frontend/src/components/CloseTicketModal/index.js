import React, { useState } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import ButtonWithSpinner from "../ButtonWithSpinner";

const CloseTicketModal = ({ modalOpen, onClose, onSubmit }) => {
  const [withFirma, setWithFirma] = useState(true);
  const [closeComment, setCloseComment] = useState("");

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="xs" scroll="paper">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleClose();
          onSubmit({ withFarewellMessage: withFirma, comment: closeComment });
        }}
      >
        <DialogTitle id="form-dialog-title">Cerrar ticket</DialogTitle>
        <DialogContent dividers style={{ width: "400px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p>¿Cerrar con firma?</p>

            <Switch
              checked={withFirma}
              onChange={(e) => setWithFirma(e.target.checked)}
            />
          </div>

          <div>
            <TextField
              label={"Comentario de cierre"}
              variant="outlined"
              multiline
              rows={5}
              fullWidth
              margin="dense"
              onChange={(e) => setCloseComment(e.target.value)}
              value={closeComment}
            />
          </div>

          {/* <CategorySelect
            selectedCategoryIds={selectedCategoryIds}
            onChange={(values) => setSelectedCategoryIds(values)}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <ButtonWithSpinner variant="contained" type="submit" color="primary">
            Guardar
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CloseTicketModal;
