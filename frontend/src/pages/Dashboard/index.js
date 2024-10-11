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
import { isBefore, parseISO } from "date-fns";
import { TextField } from "@material-ui/core";
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [error, setError] = useState(false);
    const userQueueIds = user.queues?.map(q => q.id) || [];

    const handleStartDateChange = (event) => {
        setSelectedStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setSelectedEndDate(event.target.value);
    };

    const validateDates = (start, end) => {
        if (start && end && isBefore(parseISO(end), parseISO(start))) {
            setError(true);
        } else {
            setError(false);
        }
    };

    const handleFilterClick = () => {
        validateDates(selectedStartDate, selectedEndDate);
        if (!error) {
            setStartDate(selectedStartDate);
            setEndDate(selectedEndDate);
        }
    };

    const ticketsInAttendance = useTickets({
        status: "open",
        showAll: "true",
        withUnreadMessages: "false",
        queueIds: JSON.stringify(userQueueIds),
        startDate,
        endDate,
    });

    const ticketsWaiting = useTickets({
        status: "pending",
        showAll: "true",
        withUnreadMessages: "false",
        queueIds: JSON.stringify(userQueueIds),
        startDate,
        endDate,
    });

    const ticketsClosed = useTickets({
        status: "closed",
        showAll: "true",
        withUnreadMessages: "false",
        queueIds: JSON.stringify(userQueueIds),
        startDate,
        endDate,
    });

    return (
        <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>
    <Grid container spacing={3} item xs={12}>
        <Grid item xs={6} sm={4}>
            <TextField
                label="Data Inicial"
                type="date"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
            />
        </Grid>
        <Grid item xs={6} sm={4}>
            <TextField
                label="Data Final"
                type="date"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={error}
                helperText={error && "A data final deve ser posterior à data inicial"}
            />
        </Grid>
        <Grid item xs={6} sm={4}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleFilterClick}
                disabled={error}
            >
                Filtrar
            </Button>
        </Grid>
    </Grid>
    <Grid item xs={12} style={{ marginBottom: '16px' }}> {/* Adiciona espaço entre as linhas */}
        {error && (
            <Typography color="error">
                A data inicial não pode ser posterior à data final.
            </Typography>
        )}
    </Grid>
</Grid>

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
                        <Chart tickets={ticketsInAttendance.tickets} startDate={startDate} endDate={endDate} />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ChartPerUser ticketsByUser={ticketsInAttendance.tickets} startDate={startDate} endDate={endDate} />
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ChartPerConnection ticketsByConnection={ticketsInAttendance.tickets} startDate={startDate} endDate={endDate} />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ChartPerQueue ticketsByQueue={ticketsInAttendance.tickets} startDate={startDate} endDate={endDate} />
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <NewContactsChart startDate={startDate} endDate={endDate} />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.fixedHeightPaper}>
                        <ContactsWithTicketsChart startDate={startDate} endDate={endDate} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
