import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import useTickets from "../../hooks/useTickets";
import { AuthContext } from "../../context/Auth/AuthContext";
import Chart from "./Chart";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Card,
  CardContent,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import Title from "../../components/Title";
import MainHeader from "../../components/MainHeader";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
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
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  multFieldLine: {
    width: 200,
    flexDirection: "column",
    display: "flex",
    marginTop: 10,
  },
  selectStyle: {
    width: "100%",
    marginTop: -10,
  },

  root: {
    width: 200,
    transform: "scale(1.2)",
    marginBlock: 40,
    padding: theme.spacing(2),
    display: "inline-block",
  },

  title: {
    width: "100%",
    display: "flex",
    fontSize: 14,
    padding: theme.spacing(3),
  },

  paperTime: {
    padding: theme.spacing(2),
    marginTop: "24px",
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },

  search: {
    width: "20%",
    display: "flex",
    fontSize: 14,
    marginTop: "10px"
  },

  averageTickets: {
    display: "flex",
    marginTop: "10px",
    width: "100%",
    justifyContent: "start",
  },

  averageTicket: {
    marginLeft: "5px",
    marginRight: "5px",
    width: "100%",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  const [loading, setLoading] = useState(false);

  const [registerCount, setRegisterCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [noWhatsCount, setNoWhatsCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState([]);

  const [files, setFiles] = useState([]);

  const [fileId, setFileId] = useState("");
  const [date, setDate] = useState("");
  const [searchParam, setSearchParam] = useState("");

  const [tickets, setTickets] = useState([]);
  const [biggerTickets, setBiggerTickets] = useState([]);
  const [smallerTickets, setSmallerTickets] = useState([]);
  const [averageTime, setAverageTime] = useState(0);

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  const GetTickets = (status, showAll, withUnreadMessages) => {
    const { count } = useTickets({
      status: status,
      showAll: showAll,
      withUnreadMessages: withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
    });
    return count;
  };

  useEffect(() => {
    const handleFilter = async () => {
      setLoading(true);
      try {
        setLoading(true);
        const { data } = await api.get('/registers/list', {
          params: { fileId, date }
        });

        setRegisterCount(data.reports.total);
        setSentCount(data.reports.sent || "0");
        setDeliveredCount(data.reports.delivered || "0");
        setReadCount(data.reports.read || "0");
        setErrorCount(data.reports.error || "0");
        setInteractionCount(data.reports.interaction || "0");
        setNoWhatsCount(data.reports.noWhats || "0");
        
        setCategoryCount(data.category);

        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };
    handleFilter();
  }, [fileId, date]);

  useEffect(() => {
    const handleFiles = async () => {
      setLoading(true);
      let allFiles = [];

      try {
        const { data } = await api.get('file/list?status=5');
        allFiles = [...allFiles, ...data.reports];
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }

      try {
        const { data } = await api.get('file/list?status=6');
        allFiles = [...allFiles, ...data.reports];
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }

      setFiles(allFiles);
    };

    handleFiles();
  }, []);

  useEffect(() => {
    const fetchAverangeTime = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tickets/time", {
          params: { searchParam }
        });
        setTickets(data.averageTimes);

        if (data.averageTimes.length >= 6) {
          setBiggerTickets(data.averageTimes.slice(0, 3));

          const smallerTickets = data.averageTimes.slice(-3);
          smallerTickets.sort((a, b) => { return a.averageMilliseconds - b.averageMilliseconds } );

          setSmallerTickets(smallerTickets);
        }

        setAverageTime(data.totalAverageTime);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };

    fetchAverangeTime();
  }, [searchParam]);

  const handleSelectOption = (_, newValue) => {
    if (newValue) {
      setFileId(newValue.id);
      setDate("");
    } else {
      setFileId("");
    }
  };

  const renderOptionLabel = (option) => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const getGridSize = () => {
    if (categoryCount.length === 1) {
      return 12;
    }
    if (categoryCount.length === 2) {
      return 6;
    }
    if (categoryCount.length === 3) {
      return 4;
    }
    return 12;
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
  };

  const formatTime = (milliseconds) => {
    let seconds = milliseconds / 1000;

    let minutes = Math.floor(seconds / 60);
    seconds = Math.floor((seconds / 60 - minutes) * 60);

    let hours = Math.floor(minutes / 60);
    minutes = Math.floor((minutes / 60 - hours) * 60);

    let secondsString = seconds.toString();
    let minutesString = minutes.toString();
    let hoursString = hours.toString();

    if (secondsString.length === 1) {
      secondsString = `0${secondsString}`;
    }

    if (minutesString.length === 1) {
      minutesString = `0${minutesString}`;
    }

    if (hoursString.length === 1) {
      hoursString = `0${hoursString}`;
    }

    return `${hoursString}:${minutesString}:${secondsString}`;
  };

  return (
    <div>
      <MainHeader>
        <Title>{i18n.t("dashboard.title")}</Title>
      </MainHeader>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper className={classes.customFixedHeightPaper}>
              <Typography
                style={{ display: "inlineBlock" }}
                component="h3"
                variant="h6"
                color="primary"
                paragraph
              >
                {i18n.t("dashboard.file")}
              </Typography>
              <Autocomplete
                onChange={(e, newValue) => handleSelectOption(e, newValue)}
                className={classes.selectStyle}
                options={files}
                value={files.find(f => f.id === fileId) || null}
                getOptionLabel={renderOptionLabel}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={i18n.t("dashboard.file")}
                    InputLabelProps={{ required: true }}
                  />
                )}
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.customFixedHeightPaper}>
              <Typography
                style={{ display: "inlineBlock" }}
                component="h3"
                variant="h6"
                color="primary"
                paragraph
              >
                {i18n.t("dashboard.date")}
              </Typography>
              <TextField
                className={classes.selectStyle}
                onChange={(e) => {
                  setDate(e.target.value);
                  setFileId("");
                }}
                value={date}
                label={i18n.t("dashboard.date")}
                InputLabelProps={{ shrink: true, required: true }}
                type="date"
              />
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
              disabled={loading}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.inAttendance.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {GetTickets("open", "true", "false")}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.waiting.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {GetTickets("pending", "true", "false")}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.closed.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {GetTickets("closed", "true", "false")}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.imported.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {registerCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.sent.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {sentCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.handedOut.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {deliveredCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.read.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {readCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.mistake.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {errorCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Interações
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {interactionCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Sem Whatsapp
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {noWhatsCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          {categoryCount && categoryCount.length > 0 && (
            <Grid item xs={12}>
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.category.title")}
              </Typography>
            </Grid>
          )}
          {categoryCount &&
            categoryCount.map((category) => (
              <Grid item xs={getGridSize()} key={category.name}>
                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{ overflow: "hidden" }}
                >
                  <Typography
                    component="h3"
                    variant="h6"
                    color="primary"
                    paragraph
                  >
                    {category.name}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {category.count}
                    </Typography>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paperTime}>
            <div>
              <Typography component="h3" variant="h6" color="primary">
                Tempo de Atendimento
              </Typography>
              <TextField
                className={classes.search}
                placeholder={"Pesquisar"}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            { tickets && tickets.length < 6 &&
              <div className={classes.averageTickets}>
                {tickets.map((ticket, index) => (
                    <Card className={classes.averageTicket} key={index} elevation={5}>
                      <CardContent>
                        <Typography align="center" variant="h6" component="h2">
                          {ticket.user.name}
                        </Typography>
                        <br />
                        <Typography align="center" variant="h5" component="h2">
                          {formatTime(ticket.averageMilliseconds)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            }
            { tickets && tickets.length >= 6 &&
              <>
                <Typography align="center" variant="h6" component="h2">
                  Maiores Tempos Médios
                </Typography>
                <div className={classes.averageTickets}>
                  {biggerTickets.map((ticket, index) => (
                    <Card className={classes.averageTicket} key={index} elevation={5}>
                      <CardContent>
                        <Typography align="center" variant="h6" component="h2">
                          {ticket.user.name}
                        </Typography>
                        <br />
                        <Typography align="center" variant="h5" component="h2">
                          {formatTime(ticket.averageMilliseconds)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Typography align="center" variant="h6" component="h2">
                  Menores Tempos Médios
                </Typography>
                <div className={classes.averageTickets}>
                  {smallerTickets.map((ticket, index) => (
                    <Card className={classes.averageTicket} key={index} elevation={5}>
                      <CardContent>
                        <Typography align="center" variant="h6" component="h2">
                          {ticket.user.name}
                        </Typography>
                        <br />
                        <Typography align="center" variant="h5" component="h2">
                          {formatTime(ticket.averageMilliseconds)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            }
            <div style={{ marginTop: "10px" }}>
              <Typography component="h3" variant="h6">
                {tickets && tickets.length > 0
                  ? `Tempo Médio de Atendimentos: ${formatTime(averageTime)}`
                  : `Sem Tickets Resolvidos`}
              </Typography>
            </div>
          </Paper>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
