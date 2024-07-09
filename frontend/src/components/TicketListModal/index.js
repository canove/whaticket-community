import React from "react";

import Dialog from "@material-ui/core/Dialog";

import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import TicketListItem from "../TicketListItem";

import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
  collapseColumn: {
    width: 40, // Ajusta este valor según tus necesidades
  },
});

const TicketListModal = ({ modalOpen, onClose, title, tickets }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent dividers style={{ width: "900px" }}>
        <TableContainer component={Paper}>
          {tickets.map((ticket) => (
            <div onClick={handleClose} style={{ overflow: "hidden" }}>
              <TicketListItem ticket={ticket} key={ticket.id} />
            </div>
          ))}
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default TicketListModal;
