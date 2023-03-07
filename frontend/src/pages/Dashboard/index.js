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
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import Title from "../../components/Title";
import MainHeader from "../../components/MainHeader";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import { GrUpdate } from "react-icons/gr";
import { green } from "@material-ui/core/colors";
import RegisterChart from "./RegisterChart";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { toast } from "react-toastify";

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
  customFixedHeightBilling: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
    border: "none",
    boxShadow: "none"
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
  dateStyle: {
    display: "inline-block",
    width: "40%",
    marginTop: -10,
  },
  circleLoading: {
    opacity: "70%",
    position: "absolute",
    top: "-40%",
    left: "2rem",
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
    marginTop: "10px",
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
  const [queueCount, setQueueCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState([]);

  const [sentMessageCount, setSentMessageCount] = useState(0);
  const [receivedMessageCount, setReceivedMessageCount] = useState(0);

  // const [files, setFiles] = useState([]);

  const [fileId, setFileId] = useState("");
  const [date, setDate] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");

  const [tickets, setTickets] = useState([]);
  const [biggerTickets, setBiggerTickets] = useState([]);
  const [smallerTickets, setSmallerTickets] = useState([]);
  const [averageTime, setAverageTime] = useState(0);

  const [config, setConfig] = useState(null);
  const [connectedWhatsapps, setConnectedWhatsapps] = useState([]);

  const [updatingPage, setUpdatingPage] = useState(false);

  const [billingTotalMonthValue, setBillingTotalMonthValue] = useState(0);
  const [lastMonthTotalValue, setLastMonthTotalValue] = useState(0);
  const [expectedTotalMonthValue, setExpectedTotalMonthValue] = useState(0);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

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

  const handleFilter = async () => {
    if (initialDate && finalDate) {
      const i = new Date(+startOfDay(parseISO(initialDate)));
      const f = new Date(+endOfDay(parseISO(finalDate)));

      const thirtyDays = 31 * 24 * 60 * 60 * 1000;

      if (f.getTime() - i.getTime() >= thirtyDays) {
        toast.error(i18n.t("dashboard.moreThanThirtyDaysError"))
      }
    }

    setLoading(true);
    try {
      setLoading(true);

      const { data } = await api.get("/registers/list", {
        params: { fileId, date, initialDate, finalDate },
      });

      setRegisterCount(data.reports.total);
      setSentCount(data.reports.sent || "0");
      setDeliveredCount(data.reports.delivered || "0");
      setReadCount(data.reports.read || "0");
      setErrorCount(data.reports.error || "0");
      setInteractionCount(data.reports.interaction || "0");
      setNoWhatsCount(data.reports.noWhats || "0");
      setQueueCount(data.reports.queue || "0");

      // let queueCounter = 0;

      // if (data.reports.fileQueue) queueCounter += Number(data.reports.fileQueue);
      // if (data.reports.registerQueue) queueCounter += Number(data.reports.registerQueue);

      // setQueueCount(queueCounter);

      setCategoryCount(data.category);
      setConnectedWhatsapps(data.connectedWhatsapps);

      setSentMessageCount(data.messages.sent || "0");
      setReceivedMessageCount(data.messages.received || "0");

      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const fetchConfig = async () => {
    try {
      const { data } = await api.get("/whatsconfig/");
      setConfig(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      toastError(err);
    }
  };

  const fetchBilling = async () => {
    try {
      const { data } = await api.get("/billings/dashboard", {
        params: { selectedCompany }
      });
      setBillingTotalMonthValue(data.monthTotalValue);
      setLastMonthTotalValue(data.lastMonthTotalValue);
      setExpectedTotalMonthValue(data.expectedTotalMonthValue);
    } catch (err) {
      toastError(err);
    }
  }

  // const handleFiles = async () => {
  //   setLoading(true);
  //   let allFiles = [];

  //   try {
  //     const { data } = await api.get("file/list?status=5");
  //     allFiles = [...allFiles, ...data.reports];
  //     setLoading(false);
  //   } catch (err) {
  //     toastError(err);
  //     setLoading(false);
  //   }

  //   try {
  //     const { data } = await api.get("file/list?status=6");
  //     allFiles = [...allFiles, ...data.reports];
  //     setLoading(false);
  //   } catch (err) {
  //     toastError(err);
  //     setLoading(false);
  //   }

  //   setFiles(allFiles);
  // };

  const fetchAverangeTime = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tickets/time", {
        params: { searchParam },
      });
      setTickets(data.averageTimes);

      if (data.averageTimes.length >= 6) {
        setBiggerTickets(data.averageTimes.slice(0, 3));

        const smallerTickets = data.averageTimes.slice(-3);
        smallerTickets.sort((a, b) => {
          return a.averageMilliseconds - b.averageMilliseconds;
        });

        setSmallerTickets(smallerTickets);
      }

      setAverageTime(data.totalAverageTime);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [fileId, date, initialDate, finalDate]);

  useEffect(() => {
    fetchAverangeTime();
  }, [searchParam]);

  useEffect(() => {
    fetchConfig();
    // handleFiles();
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [selectedCompany]);

  useEffect(() => {
		if (user.companyId === 1) {
			const fetchCompanies = async () => {
				try {
					const { data } = await api.get(`/company/`);
					setCompanies(data.companies);
				} catch (err) {
					toastError(err);
				}
			}
			fetchCompanies();
		}
	}, [user]);

  const updatePage = async () => {
    setUpdatingPage(true);

    await handleFilter();
    // await handleFiles();
    await fetchAverangeTime();
    await fetchConfig();
    await fetchBilling();

    setUpdatingPage(false);
  };

  // const handleSelectOption = (_, newValue) => {
  //   if (newValue) {
  //     setFileId(newValue.id);
  //     setDate("");
  //   } else {
  //     setFileId("");
  //   }
  // };

  // const renderOptionLabel = (option) => {
  //   if (option.number) {
  //     return `${option.name} - ${option.number}`;
  //   } else {
  //     return `${option.name}`;
  //   }
  // };

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

  const getAverageDeliveryTime = () => {
    if (!config || !config.active)
      return i18n.t("dashboard.messages.averageDeliveryTime.noConfig");

    let triggerIntervalCount = 0;
    let connectedWhatsappsCount = 0;

    let totalTriggerInterval = 0;

    connectedWhatsapps.forEach((whats) => {
      connectedWhatsappsCount += 1;
      triggerIntervalCount += 1;

      if (whats.connectionFile && whats.connectionFile.triggerInterval) {
        totalTriggerInterval += whats.connectionFile.triggerInterval;
      } else {
        totalTriggerInterval += config.triggerInterval;
      }
    });

    let queueCountInt = parseInt(queueCount);

    if (queueCountInt > 0 && connectedWhatsappsCount === 0)
      return i18n.t(
        "dashboard.messages.averageDeliveryTime.noConnectedWhatsapps"
      );
    if (queueCountInt === 0 && connectedWhatsappsCount === 0) return "00:00:00";

    const triggerInterval = totalTriggerInterval / triggerIntervalCount;

    const averageDeliveryTimeMinutes =
      (queueCountInt / connectedWhatsappsCount) * triggerInterval;
    const averageDeliveryTimeMilliseconds = averageDeliveryTimeMinutes * 60000;
    const averageDeliveryTime = formatTime(averageDeliveryTimeMilliseconds);

    return averageDeliveryTime;
  };

  const formatToBRL = (quantity) => {
    if (!quantity) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);

    let money = quantity.toFixed(2);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
  }

  return (
    <div>
      <MainHeader>
        <Title>{i18n.t("dashboard.title")}</Title>
        <div
          style={{
            marginLeft: "10px",
            marginRight: 0,
          }}
        >
          <IconButton size="small" onClick={updatePage} disabled={updatingPage}>
            <GrUpdate />
            {updatingPage && (
              <div>
                <CircularProgress className={classes.circleLoading} />
              </div>
            )}
          </IconButton>
        </div>
      </MainHeader>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          {/* <Grid item xs={6}>
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
                value={files.find((f) => f.id === fileId) || null}
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
          </Grid> */}
          <Grid item xs={6}>
            <Paper className={classes.customFixedHeightPaper}>
              <Typography
                style={{ display: "inlineBlock" }}
                component="h3"
                variant="h6"
                color="primary"
                paragraph
              >
                {i18n.t("dashboard.dateTitle")}
              </Typography>
              <TextField
                className={classes.selectStyle}
                onChange={(e) => {
                  setDate(e.target.value);
                  setFileId("");
                  setInitialDate("");
                  setFinalDate("");
                }}
                value={date}
                label={i18n.t("dashboard.date")}
                InputLabelProps={{ shrink: true, required: true }}
                type="date"
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
                {i18n.t("dashboard.periodTitle")}
              </Typography>
              <div>
                <TextField
                  className={classes.dateStyle}
                  onChange={(e) => {
                    setInitialDate(e.target.value);
                    setDate("");
                    setFileId("");
                  }}
                  value={initialDate}
                  label={i18n.t("dashboard.initialDate")}
                  InputLabelProps={{ shrink: true, required: true }}
                  type="date"
                />
                <TextField
                  className={classes.dateStyle}
                  onChange={(e) => {
                    setFinalDate(e.target.value);
                    setDate("");
                    setFileId("");
                  }}
                  value={finalDate}
                  label={i18n.t("dashboard.finalDate")}
                  InputLabelProps={{ shrink: true, required: true }}
                  type="date"
                />
              </div>
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
          <Grid item xs={6}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.queue.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {queueCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.averageDeliveryTime.title")}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {getAverageDeliveryTime()}
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
          <Grid item xs={4}>
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
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Mensagens Trafegadas Enviadas
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {sentMessageCount}
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
                Mensagens Trafegadas Recebidas
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {receivedMessageCount}
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
          { user.companyId === 1 && 
            <Grid item xs={12}>
              <Paper className={classes.paperTime}>
                <Typography component="h3" variant="h6" color="primary">
                  Custos
                </Typography>
                <FormControl
									variant="outlined"
									margin="dense"
									fullWidth
								>
									<InputLabel id="company-selection-label">{i18n.t("userModal.form.company")}</InputLabel>
									<Select
										label="Empresa"
										name="company"
										labelId="company-selection-label"
										id="company-selection"
										value={selectedCompany}
										onChange={(e) => { setSelectedCompany(e.target.value) }}
									>
                    <MenuItem value={null}>{""}</MenuItem>
										{ companies && companies.map(company => {
											return (
												<MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
											)
										}) }
									</Select>
								</FormControl>
                <Grid item>
                  <Typography component="h2" variant="h6">
                    Custo Mês Corrente: {formatToBRL(billingTotalMonthValue)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography component="h2" variant="h6">
                  Custo Previsto: {formatToBRL(expectedTotalMonthValue)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography component="h2" variant="h6">
                    Ultimo Mês: {formatToBRL(lastMonthTotalValue)}
                  </Typography>
                </Grid>
              </Paper>
            </Grid>
          }
          { user.companyId !== 1 && user.email === 'r64bits@gmail.com' &&
            <Grid item xs={12}>
              <Paper className={classes.paperTime}>
                <Typography component="h3" variant="h6" color="primary">
                  Custos
                </Typography>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                  <Grid item xs={3}>
                    <Paper
                      className={classes.customFixedHeightBilling}
                      style={{ overflow: "hidden" }}
                    >
                      <Typography component="h3" variant="h6" color="primary" paragraph>
                        Custo Mês Corrente
                      </Typography>
                      <Grid item>
                        <Typography component="h1" variant="h4">
                        {formatToBRL(billingTotalMonthValue)}
                        </Typography>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper
                      className={classes.customFixedHeightBilling}
                      style={{ overflow: "hidden" }}
                    >
                      <Typography component="h3" variant="h6" color="primary" paragraph>
                        Custo Previsto
                      </Typography>
                      <Grid item>
                        <Typography component="h1" variant="h4">
                        {formatToBRL(expectedTotalMonthValue)}
                        </Typography>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper
                      className={classes.customFixedHeightBilling}
                      style={{ overflow: "hidden" }}
                    >
                      <Typography component="h3" variant="h6" color="primary" paragraph>
                        Ultimo Mês
                      </Typography>
                      <Grid item>
                        <Typography component="h1" variant="h4">
                        {formatToBRL(lastMonthTotalValue)}
                        </Typography>
                      </Grid>
                    </Paper>
                  </Grid>
                </div>
              </Paper>
            </Grid>
          }
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <RegisterChart />
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
            {tickets && tickets.length < 6 && (
              <div className={classes.averageTickets}>
                {tickets.map((ticket, index) => (
                  <Card
                    className={classes.averageTicket}
                    key={index}
                    elevation={5}
                  >
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
            )}
            {tickets && tickets.length >= 6 && (
              <>
                <Typography align="center" variant="h6" component="h2">
                  Maiores Tempos Médios
                </Typography>
                <div className={classes.averageTickets}>
                  {biggerTickets.map((ticket, index) => (
                    <Card
                      className={classes.averageTicket}
                      key={index}
                      elevation={5}
                    >
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
                    <Card
                      className={classes.averageTicket}
                      key={index}
                      elevation={5}
                    >
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
            )}
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
