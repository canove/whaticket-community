import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import makeStyles from '@mui/styles/makeStyles';
import Hidden from "@mui/material/Hidden";
import { MessageSquareText as WhatsAppIcon } from "lucide-react";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    backgroundColor: "#F7F8FA",
  },

  chatPapper: {
    display: "flex",
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 0,
    overflow: "hidden",
    boxShadow: "none",
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
    [theme.breakpoints.down('md')]: {
      display: "none",
    },
  },
  messagessWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },

  welcomeMsg: {
    backgroundColor: "#F7F8FA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 16,
    height: "100%",
    textAlign: "center",
    borderRadius: 0,
    borderLeft: "1px solid #E5E9EF",
    padding: 40,
  },

  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: "linear-gradient(135deg, #25D366 0%, #1DAB57 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    boxShadow: "0 8px 24px rgba(37,211,102,0.25)",
    "& svg": {
      color: "#ffffff",
      fontSize: 38,
    },
  },

  welcomeTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 28,
    color: "#0A0F1E",
    letterSpacing: "-0.5px",
    margin: 0,
  },

  welcomeSubtitle: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 15,
    color: "#9BA3B0",
    margin: 0,
    maxWidth: 320,
    lineHeight: 1.6,
  },

  ticketsManager: {},
  ticketsManagerClosed: {
    [theme.breakpoints.down('md')]: {
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
          <Grid item xs={12} md={8} className={classes.messagessWrapper}>
            {ticketId ? (
              <Ticket />
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg} elevation={0}>
                  <div className={classes.welcomeIcon}>
                    <WhatsAppIcon size={38} />
                  </div>
                  <h2 className={classes.welcomeTitle}>
                    {i18n.t("chat.noTicketMessage")}
                  </h2>
                  <p className={classes.welcomeSubtitle}>
                    Selecione uma conversa à esquerda para começar a atender.
                  </p>
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
