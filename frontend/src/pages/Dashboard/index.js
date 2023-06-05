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
  dateStyleLeft: {
    display: "inline-block",
    width: "40%",
    marginTop: -10,
    marginRight: 20,
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

  categoryStyle: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  var userQueueIds = [];
  let lastGrid = 0;

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

  const [fileId, setFileId] = useState("");
  const [date, setDate] = useState("");
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");

  const [loggedInUsersQuantity, setLoggedInUsersQuantity] = useState(0);
  
  const [updatingPage, setUpdatingPage] = useState(false);

  const [billingTotalMonthValue, setBillingTotalMonthValue] = useState(0);
  const [lastMonthTotalValue, setLastMonthTotalValue] = useState(0);
  const [expectedTotalMonthValue, setExpectedTotalMonthValue] = useState(0);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  const GetTickets = (status, showAll, withUnreadMessages, connectionFileId) => {
    const { count, loading } = useTickets({
      status: status,
      showAll: showAll,
      withUnreadMessages: withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
      connectionFileId: connectionFileId
    });

    return loading ? <CircularProgress /> : count;
  };

  const handleFilter = async () => {
    setLoading(true);
    setCategoryCount([]);

    if (initialDate && finalDate) {
      const i = new Date(+startOfDay(parseISO(initialDate)));
      const f = new Date(+endOfDay(parseISO(finalDate)));

      const thirtyDays = 31 * 24 * 60 * 60 * 1000;

      if (f.getTime() - i.getTime() >= thirtyDays) {
        toast.error(i18n.t("dashboard.moreThanThirtyDaysError"))
      }
    }

    try {
      const { data } = await api.get("/registers/list", {
        params: { fileId, date, initialDate, finalDate, categoryId },
      });

      setRegisterCount(data.reports.total || "0");
      setSentCount(data.reports.sent || "0");
      setDeliveredCount(data.reports.delivered || "0");
      setReadCount(data.reports.read || "0");
      setErrorCount(data.reports.error || "0");
      setInteractionCount(data.reports.interaction || "0");
      setNoWhatsCount(data.reports.noWhats || "0");
      setQueueCount(data.reports.queue || "0");

      setCategoryCount(data.category);

      setSentMessageCount(data.messages.sent || "0");
      setReceivedMessageCount(data.messages.received || "0");

      setLoggedInUsersQuantity(data.loggedInUsersQuantity || "0");
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
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

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/connectionFiles/");
      setCategories(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    handleFilter();
  }, [fileId, date, initialDate, finalDate, categoryId]);

  useEffect(() => {
    fetchCategories();
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
    await fetchBilling();

    setUpdatingPage(false);
  };

  const getGridSize = (index) => {
    if (categoryCount.length === 1) return 12;
    if (categoryCount.length === 2) return 6;
    if (categoryCount.length === 3) return 4;

    if (!categoryCount[index+2] && ((index+1) % 3 === 1)) {
      if (categoryCount[index+1]) {
        lastGrid = 6;
      } else {
        lastGrid = 12;
      }
    }

    if (lastGrid) return lastGrid;

    return 4;
  };

  const formatToBRL = (quantity) => {
    if (!quantity) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);

    let money = quantity.toFixed(2);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
  }

  const handleSelectOption = (_, newValue) => {
    if (newValue) {
      setCategoryId(newValue.id);
    } else {
      setCategoryId("");
    }
  };

  const renderOptionLabel = (option) => {
    return option.name;
  };

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
          <Grid item xs={4}>
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
                InputLabelProps={{ shrink: true }}
                type="date"
              />
            </Paper>
          </Grid>
          <Grid item xs={4}>
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
                  className={classes.dateStyleLeft}
                  onChange={(e) => {
                    setInitialDate(e.target.value);
                    setDate("");
                    setFileId("");
                  }}
                  value={initialDate}
                  label={i18n.t("dashboard.initialDate")}
                  InputLabelProps={{ shrink: true }}
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
                  InputLabelProps={{ shrink: true }}
                  type="date"
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.customFixedHeightPaper}>
              <Typography
                style={{ display: "inlineBlock" }}
                component="h3"
                variant="h6"
                color="primary"
                paragraph
              >
                {"Categoria (Whatsapp)"}
              </Typography>
              <div>
                <Autocomplete
                  onChange={(e, newValue) => handleSelectOption(e, newValue)}
                  className={classes.selectStyle}
                  options={categories}
                  value={categories.find((c) => c.id === categoryId) || null}
                  getOptionLabel={renderOptionLabel}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={"Categoria (Whatsapp)"}
                      // InputLabelProps={{ required: true }}
                    />
                  )}
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.messages.inAttendance.title")}
              </Typography>
              <Grid item>
              <Typography component="h1" variant="h4">
                {GetTickets("open", "true", "false", categoryId)}
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
                  {GetTickets("pending", "true", "false", categoryId)}
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
                  {GetTickets("closed", "true", "false", categoryId)}
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
                  {loading ? <CircularProgress /> : queueCount}
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
                {"Usuários Logados"}
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {loading ? <CircularProgress /> : loggedInUsersQuantity}
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
                  {loading ? <CircularProgress /> : registerCount}
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
                  {loading ? <CircularProgress /> : sentCount}
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
                  {loading ? <CircularProgress /> : deliveredCount}
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
                  {loading ? <CircularProgress /> : readCount}
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
                {i18n.t("dashboard.messages.mistake.title")} / Blacklist
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {loading ? <CircularProgress /> : errorCount}
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
                  {loading ? <CircularProgress /> : interactionCount}
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
                  {loading ? <CircularProgress /> : noWhatsCount}
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
                  {loading ? <CircularProgress /> : sentMessageCount}
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
                  {loading ? <CircularProgress /> : receivedMessageCount}
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
            categoryCount.map((category, index) => (
              <Grid item xs={getGridSize(index)} key={category.name}>
                <Paper
                  className={classes.categoryStyle}
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
          { user.companyId !== 1 && user.superAdmin &&
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
      </Container>
    </div>
  );
};

export default Dashboard;
