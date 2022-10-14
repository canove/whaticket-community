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
import { Card, CardContent, InputAdornment, TextField } from "@material-ui/core";
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
    marginTop: 10
  },
  selectStyle: {
    width: "100%",
    marginTop: -10
  },

  root: {
    width: 200,
    transform: 'scale(1.2)',
    marginBlock: 40,
    padding: theme.spacing(2),
    display: 'inline-block',

  },
  title: {
    width: "100%",
    display: 'flex',
    fontSize: 14,
    padding: theme.spacing(3),
  },

  search: {
    width: "40%",
    display: 'flex',
    fontSize: 14,
    marginLeft: 50,

  },

}));

const Dashboard = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  const [loading, setLoading] = useState(false);
  const [registerCount, setRegisterCount] = useState(0)
  const [sentCount, setSentCount] = useState(0)
  const [deliveredCount, setDeliveredCount] = useState(0)
  const [readCount, setReadCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [fileId, setFileId] = useState("");
  const [files, setFiles] = useState([]);
  const [date, setDate] = useState("");
  const [categoryCount, setCategoryCount] = useState([]);
  const [searchParam, setSearchParam] = useState("");

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
    setDate("");
  }, [fileId]);

  useEffect(() => {
    setFileId("");
  }, [date]);

	useEffect(() => {
		const handleFilter = async () => {
			setLoading(true);
      try {
        setLoading(true);
        const { data } = await api.get(`/registers/list?fileId=${fileId}&date=${date}`);
          setRegisterCount(data.register.count);
          setSentCount(data.sent.count);
          setDeliveredCount(data.delivered.count);
          setReadCount(data.read.count);
          setErrorCount(data.error.count);
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
      try {
        setLoading(true);

        const { data } = await api.get('file/list?status=5');
        setFiles(data.reports);

        setLoading(false);
      } catch (err) {
        toastError(err);
      }
      try {
        setLoading(true);

        const { data } = await api.get('file/list?status=6');
        setFiles(files.concat(data.reports));
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };
    handleFiles();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectOption = (_, newValue) => {
      if (newValue) {
          setFileId(newValue.id);
      } else {
          setFileId("");
      }
  };

  const renderOptionLabel = option => {
      if (option.number) {
        return `${option.name} - ${option.number}`;
      } else {
        return `${option.name}`;
      }
  };

  const getGridSize = () => {
    if (categoryCount.length === 1){
      return 12
    }
    if (categoryCount.length === 2){
      return 6
    }
    if (categoryCount.length === 3){
      return 4
    }
    return 12
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
  };


  return (
    <div>
      <MainHeader>
        <Title>{i18n.t("dashboard.title")}</Title>
      </MainHeader>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper
              className={classes.customFixedHeightPaper}
            >
              <Typography style={{display:"inlineBlock"}}  component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.file")}
              </Typography>
              <Autocomplete
                  onChange={(e, newValue) => handleSelectOption(e, newValue)}
                  className={classes.selectStyle}
                  options={files}
                  getOptionLabel={renderOptionLabel}
                  renderInput={(params) =>
                      <TextField
                          {...params}
                          label={i18n.t("dashboard.file")}
                          InputLabelProps={{ required: true}}
                      />
                  }
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              className={classes.customFixedHeightPaper}
            >
              <Typography style={{display:"inlineBlock"}} component="h3" variant="h6" color="primary" paragraph>
                {i18n.t("dashboard.date")}
              </Typography>
              <TextField
                className={classes.selectStyle}
                onChange={(e) => { setDate(e.target.value) }}
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
          <Grid item xs={6}>
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
          <Grid item xs={6}>
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
          { categoryCount && categoryCount.length > 0 &&
            <Grid item xs={12}>
              <Typography component="h3" variant="h6" color="primary" paragraph>
                  {i18n.t("dashboard.messages.category.title")}
              </Typography>
            </Grid>}
          { categoryCount && categoryCount.map((category) => (

             <Grid item xs={getGridSize()} key={category.name} >
              <Paper className={classes.customFixedHeightPaper}
                style={{ overflow: "hidden" }}
              >
                <Typography component="h3" variant="h6" color="primary" paragraph>
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
        <Grid item xs={12} >
            <Paper className={classes.title}>
                 <Typography component="h3" variant="h6" color="primary" >
                  Tempo de Atendimento
                </Typography>
                  <Grid>
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

                      <div>
                        <Card elevation={5} className={classes.root}>
                          <CardContent>
                            <Typography align="center" variant="h6" component="h2">Cliente</Typography><br/>
                            <Typography align="center" variant="h5" component="h2"> 03:00 hrs </Typography>
                          </CardContent>
                        </Card>
                        <Card elevation={5} className={classes.root}>
                          <CardContent>
                            <Typography align="center" variant="h6" component="h2">Cliente</Typography><br/>
                            <Typography align="center" variant="h5" component="h2"> 03:00 hrs </Typography>
                          </CardContent>
                        </Card>
                        <Card elevation={5} className={classes.root}>
                          <CardContent>
                            <Typography align="center" variant="h6" component="h2">Cliente</Typography><br/>
                            <Typography align="center" variant="h5" component="h2"> 03:00 hrs </Typography>
                          </CardContent>
                        </Card>
                      </div>
                      <Typography component="h3" variant="h6">
                        Tempo total de Atendimentos: 09:00 hrs.
                      </Typography>

                  </Grid>
            </Paper>
          </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
