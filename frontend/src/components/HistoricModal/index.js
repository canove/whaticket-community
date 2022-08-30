import React, { useEffect, useReducer, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { i18n } from "../../translate/i18n";
import { IconButton, makeStyles, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { format, parseISO } from "date-fns";
import MessagesList from "../../components/MessagesList";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    width: 200,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  multFieldLine: {
    width: 200,
    flexDirection: "column",
    display: "flex",
  },
  divStyle: {
    width: 300,
  },
  titleStyle: {
    marginLeft: 20,
    marginTop: 5,
  },
  whatsPaper: {
    width: 700
  }
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];
    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }};

const HistoricModal = ({ open, onClose, ticket }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [historic, setHistoric] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [messagesList, dispatch] = useReducer(reducer, []);
    const [tickets, setTicket] = useState();

useEffect(() => {
const handleOpenHistoricModal = async () => {
		setLoading(true);
		try {
			const { data } = await api.get(`/tickets/hist/${ticket.contactId}`);
			setHistoric(data);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};
handleOpenHistoricModal()
// eslint-disable-next-line react-hooks/exhaustive-deps
},[])

const renderMessage = async (ticketId) => {
		setLoading(true);
		try {
			const { data } = await api.get(`/messages/${ticketId}`);
	      dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
          setHasMore(data.hasMore);
          setLoading(false);
          setTicket(ticketId)

		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

const handleClose = () => {
    onClose();
  };

const handleBack = () =>{
    setTicket("");

  };

	return (
    <div className={classes.root}>
			<Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
        {i18n.t("historicTicket.historicModal.title")}
				</DialogTitle>
        <DialogContent dividers>
          {!tickets &&
            <Paper className={classes.mainPaper} variant="outlined">
              <Table size="small">
                <TableHead>
                    <TableRow>
                      <TableCell align="center">
                          {i18n.t("historicTicket.historicModal.name")}
                      </TableCell>
                      <TableCell align="center">
                          {i18n.t("historicTicket.historicModal.message")}
                      </TableCell>
                      <TableCell align="center">
                          {i18n.t("historicTicket.historicModal.status")}
                      </TableCell>
                      <TableCell align="center">
                          {i18n.t("historicTicket.historicModal.createAt")}
                      </TableCell>
                      <TableCell align="center">
                          {i18n.t("historicTicket.historicModal.actions")}
                      </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hasMore}
                    {historic && historic.map((hist, index) => {
                    return(
                  <TableRow key={index}>
                    <TableCell>{hist.user.name}</TableCell>
                    <TableCell>{hist.lastMessage}</TableCell>
                    <TableCell>{hist.status}</TableCell>
                    <TableCell>{format(parseISO(hist.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                    <TableCell>
                        <IconButton
                        onClick={(e) => {renderMessage(hist.id)}}

                        >
                            <VisibilityIcon />
                        </IconButton>
                    </TableCell>
                  </TableRow>
                    );
                        })}
                      {loading}
                </TableBody>
              </Table>
            </Paper>
              }
              {
              tickets &&
              <Paper className={classes.whatsPaper} variant="outlined">
                <ReplyMessageProvider>
                  <MessagesList
                    ticketId={tickets}
                    isGroup={false}
                  ></MessagesList>
                </ReplyMessageProvider>
              </Paper>
              }
        </DialogContent>
				<DialogActions>
            <Button
              color="primary"
              variant="contained"
              onClick={handleBack}
              disable={messagesList}
            >
            {i18n.t("historicTicket.historicModal.back")}
            </Button>
            <Button
              onClick={handleClose}
              color="secondary"
              variant="outlined"
            >
              {i18n.t("historicTicket.historicModal.closed")}
            </Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default HistoricModal;
