import React, { useContext, useState } from "react";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import useTickets from "../../hooks/useTickets";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import Chart from "./Chart";
import ChartPerUser from "./ChartPerUser";
import ChartPerConnection from "./ChartPerConnection";
import ChartPerQueue from "./ChatsPerQueue";
import NewContactsChart from "./NewContactsChart";
import ContactsWithTicketsChart from "./ContactsWithTicketsChart";

const useStyles = makeStyles(theme => ({
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    fixedHeightPaper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: 240,
    },
    customFixedHeightPaper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: 120,
    },
}));

const Dashboard = () => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const userQueueIds = user.queues.map(q => q.id) || [];

    const ticketsInAttendance = useTickets({
        status: "open",
        showAll: "true",
        withUnreadMessages: "false",
        queueIds: JSON.stringify(userQueueIds),
    });


    const ticketsWaiting = useTickets({
        status: "pending",
        showAll: "true",
        withUnreadMessages: "false",
        queueIds: JSON.stringify(userQueueIds),
    });

    const ticketsClosed = useTickets({
        status: "closed",
        showAll: "true",
        withUnreadMessages: "false",
        queueIds: JSON.stringify(userQueueIds),
    });

    return (
        <Container maxWidth="lg" className={classes.container}>

            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Paper className={classes.customFixedHeightPaper}>
                        <Typography component="h3" variant="h6" color="primary" paragraph>
                            {i18n.t("dashboard.messages.inAttendance.title")}
                        </Typography>
                        <Typography component="h1" variant="h4">
                            {ticketsInAttendance.count}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={classes.customFixedHeightPaper}>
                        <Typography component="h3" variant="h6" color="primary" paragraph>
                            {i18n.t("dashboard.messages.waiting.title")}
                        </Typography>
                        <Typography component="h1" variant="h4">
                            {ticketsWaiting.count}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={classes.customFixedHeightPaper}>
                        <Typography component="h3" variant="h6" color="primary" paragraph>
                            {i18n.t("dashboard.messages.closed.title")}
                        </Typography>
                        <Typography component="h1" variant="h4">
                            {ticketsClosed.count}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <Chart tickets={ticketsInAttendance.tickets} />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ChartPerUser ticketsByUser={ticketsInAttendance.tickets}  />
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ChartPerConnection ticketsByConnection={ticketsInAttendance.tickets}  />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                   <Paper className={classes.fixedHeightPaper}>
                     <ChartPerQueue ticketsByQueue={ticketsInAttendance.tickets}  />
                   </Paper>
               </Grid> 
               
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <NewContactsChart  />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ContactsWithTicketsChart  />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
