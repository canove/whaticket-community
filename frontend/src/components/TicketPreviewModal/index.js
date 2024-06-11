import { Dialog, Paper } from "@material-ui/core";
import { default as React } from "react";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import MessagesList from "../MessagesList";

import { makeStyles } from "@material-ui/core";

import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";

const useStyles = makeStyles((theme) => ({
  root: {
    maxHeight: "100%",
  },
  ticketInfo: {
    maxWidth: "50%",
    flexBasis: "50%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "80%",
      flexBasis: "80%",
    },
  },
  ticketActionButtons: {
    maxWidth: "50%",
    flexBasis: "50%",
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
      flexBasis: "100%",
      marginBottom: "5px",
    },
  },
}));

export default function TicketPreviewModal(props) {
  const { onClose, ticket, open } = props;

  const classes = useStyles();

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      {ticket && (
        <Paper
          variant="outlined"
          style={{
            width: 600,
            overflow: "hidden",
          }}
          elevation={0}
        >
          <TicketHeader loading={!ticket ? true : false} withArrow={false}>
            <div className={classes.ticketInfo}>
              <TicketInfo contact={ticket.contact} ticket={ticket} />
            </div>
            {/* <div className={classes.ticketActionButtons}>
              <TicketActionButtons ticket={ticket} />
            </div> */}
          </TicketHeader>

          <div style={{ maxHeight: "37.5rem", overflow: "auto" }}>
            <ReplyMessageProvider>
              <MessagesList
                ticketId={ticket.id}
                isGroup={ticket.isGroup}
                isAPreview={true}
              ></MessagesList>
            </ReplyMessageProvider>
          </div>
        </Paper>
      )}
    </Dialog>
  );
}
