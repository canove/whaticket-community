import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";
import Hidden from "@mui/material/Hidden";
import type { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  chatContainer: {
    flex: 1,
    // // backgroundColor: "#eee",
    // padding: theme.spacing(4),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    backgroundColor: theme.palette.background.default,
  },

  chatPapper: {
    // backgroundColor: "red",
    display: "flex",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
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
    backgroundColor: theme.palette.background.paper,
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
            {/* <Grid item xs={8} className={classes.messagessWrapper}> */}
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <>
                {/* @ts-ignore */}
                <Hidden only={["sm", "xs"]}>
                  <Paper className={classes.welcomeMsg}>
                    {/* <Paper square variant="outlined" className={classes.welcomeMsg}> */}
                    <span>{i18n.t("chat.noTicketMessage")}</span>
                  </Paper>
                </Hidden>
              </>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
