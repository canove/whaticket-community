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
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import Title from "../../components/Title";
import MainHeader from "../../components/MainHeader";

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
  titleStyle: {
    marginLeft: 20,
    marginTop: 10,
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

        let response = await api.get(`/registers/list?fileId=${fileId}`);
        setRegisterCount(response.data.count);
        console.log(response);

        response = await api.get(`/registers/list?type=sent&fileId=${fileId}`);
        setSentCount(response.data.count);

        response = await api.get(`/registers/list?type=delivered&fileId=${fileId}`);
        setDeliveredCount(response.data.count);

        response = await api.get(`/registers/list?type=read&fileId=${fileId}`);
        setReadCount(response.data.count);

        response = await api.get(`/registers/list?type=error&fileId=${fileId}`);
        setErrorCount(response.data.count);

        setLoading(false);
      } catch (err) {
        toastError(err);
      }
	  };
		handleFilter();
	}, [fileId]);

  const handleChange = (e) => {
    setFileId(e.target.value);
  };

  useEffect(() => {
    const handleFiles = async () => {
      setLoading(true);
      try {
        setLoading(true);

        const { data } = await api.get('file/list?Status=5');
        setFiles(data);

        setLoading(false);
      } catch (err) {
        toastError(err);
      }
      try {
        setLoading(true);

        const { data } = await api.get('file/list?Status=6');
        setFiles(files.concat(data));
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };
    handleFiles();
  }, []);

  return (
    <div>
      <MainHeader>
        <div className={classes.titleStyle}>
          <Title>{i18n.t("dashboard.title")}</Title>
            <FormControl className={classes.multFieldLine}>
              <InputLabel id="demo-dashboard">
                {i18n.t("dashboard.file")}
              </InputLabel>
              <Select
                className={classes.multFieldLine}
                labelId="demo-dashboard-label"
                id="demo-dashboard"
                value={fileId}
                onChange={handleChange}
              >
                <MenuItem value={""}>Todos</MenuItem>
                {files && files.map((file, index) => {
                  return (
                    <MenuItem key={index} value={file.id}>
                      {file.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
        </div>
      </MainHeader>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
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
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
