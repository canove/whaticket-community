import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useParams } from "react-router-dom";

import Ticket from "../../components/Ticket/";
import TicketsManager from "../../components/TicketsManager/";

import Hidden from "@material-ui/core/Hidden";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    // // backgroundColor: "#eee",
    // padding: theme.spacing(4),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
  },

  chatPapper: {
    // backgroundColor: "red",
    display: "flex",
    height: "100%",
  },

  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
  },
  contactsWrapperSmall: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  messagessWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },
  welcomeMsg: {
    backgroundColor: "#eee",
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    borderRadius: 0,
  },
  ticketsManager: {},
  ticketsManagerClosed: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
          {/* <Grid item xs={4} className={classes.contactsWrapper}> */}
          {/* LEFT | TICKETS VIEW ADMINISTRATION */}
          <Grid
            item
            xs={12}
            md={4}
            className={
              ticketId ? classes.contactsWrapperSmall : classes.contactsWrapper
            }
          >
            <TicketsManager />
          </Grid>
          {/* LEFT | TICKETS VIEW ADMINISTRATION */}

          {/* RIGHT | SELECTED TICKET */}
          <Grid item xs={12} md={8} className={classes.messagessWrapper}>
            {/* <Grid item xs={8} className={classes.messagessWrapper}> */}
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg}>
                  {/* <Paper square variant="outlined" className={classes.welcomeMsg}> */}
                  <span>{i18n.t("chat.noTicketMessage")}</span>
                </Paper>
              </Hidden>
            )}
          </Grid>
          {/* - RIGHT | SELECTED TICKET */}
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
