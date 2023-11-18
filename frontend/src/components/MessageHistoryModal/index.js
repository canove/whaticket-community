import React from "react";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { TableContainer, Table, TableBody, TableRow, TableCell, makeStyles } from "@material-ui/core";

import { parseISO, format } from "date-fns";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  timestamp: {
    minWidth: 250
  }
}));

const MessageHistoryModal = ({ open, onClose, oldMessages }) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">{i18n.t("messageHistoryModal.title")}</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table aria-label="message-history-table">
            <TableBody>
              {oldMessages?.map((oldMessage) => (
                <TableRow
                  key={oldMessage.id}
                >
                  <TableCell component="th" scope="row">
                    {oldMessage.body}
                  </TableCell>
                  <TableCell align="right" className={classes.timestamp}>
                    {format(parseISO(oldMessage.createdAt), "dd/MM HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={() => onClose(false)}
        >
          {i18n.t("messageHistoryModal.close")}
        </Button>
      </DialogActions>

    </Dialog>
  );
};

MessageHistoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  oldMessages: PropTypes.array
};

export default MessageHistoryModal;