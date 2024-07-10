import React, { useEffect, useState } from "react";

import Dialog from "@material-ui/core/Dialog";

import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import TicketListItem from "../TicketListItem";

import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

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
  const [loading, setLoading] = useState(false);
  const [ticketsData, setTicketsData] = useState([]);

  useEffect(() => {
    console.log("tickets", tickets);

    const delayDebounceFn = setTimeout(async () => {
      if (tickets.length > 0) {
        setLoading(true);

        // await new Promise((resolve) => setTimeout(resolve, 5000));

        const { data } = await api.get("/getATicketsList", {
          params: {
            ticketIds: JSON.stringify(tickets.map((ticket) => ticket.id)),
          },
        });

        setTicketsData(data.tickets);

        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      setTicketsData([]);
    };
  }, [tickets]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent dividers style={{ width: "900px" }}>
        <TableContainer component={Paper}>
          {ticketsData.map((ticket) => (
            <div style={{ overflow: "hidden" }} key={ticket.id}>
              <TicketListItem
                ticket={ticket}
                key={ticket.id}
                openInANewWindowOnSelect={true}
              />
            </div>
          ))}
        </TableContainer>
        {loading && (
          <CircularProgress
            color="primary"
            size={50}
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketListModal;
