import React, { useContext, useState } from "react";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import MainHeader from "../../components/MainHeader";
import ReportsWhatsappSelect from "../../components/ReportsWhatsappSelect";
import Title from "../../components/Title";

import Typography from "@material-ui/core/Typography";

import { AuthContext } from "../../context/Auth/AuthContext";

import { useEffect } from "react";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import Chart from "./Chart";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
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
}));

function esFechaValida(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha instanceof Date && !isNaN(fecha.getTime());
}

function segundosAHorasMinutos(segundos) {
  const horas = Math.floor(segundos / 3600);
  segundos %= 3600;
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60);

  return `${horas}h ${minutos}m ${segundosRestantes}s`;
}

const Reports = () => {
  const classes = useStyles();

  const [createdTicketsCount, setCreatedTicketsCount] = useState(null);
  const [selectedWhatsappIds, setSelectedWhatsappIds] = useState([]);
  const [createdTicketsChartData, setCreatedTicketsChartData] = useState(null);
  const [
    createdTicketsClosedInTheRangeTimeChartData,
    setCreatedTicketsClosedInTheRangeTimeChartData,
  ] = useState(null);

  const [tprPromedio, setTprPromedio] = useState(null);
  const [tdrPromedio, setTdrPromedio] = useState(null);
  const [
    createdTicketsClosedInTheRangeTimeCount,
    setCreatedTicketsClosedInTheRangeTimeCount,
  ] = useState(null);

  // const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    localStorage.getItem("ReportsWhatsappSelect") &&
      setSelectedWhatsappIds(
        JSON.parse(localStorage.getItem("ReportsWhatsappSelect"))
      );
  }, []);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (esFechaValida(fromDate) && esFechaValida(toDate)) {
      console.log({ fromDate, toDate, selectedWhatsappIds });

      (async () => {
        try {
          const { data } = await api.get("/generalReport", {
            params: {
              fromDate,
              toDate,
              selectedWhatsappIds: JSON.stringify(selectedWhatsappIds),
            },
          });

          setCreatedTicketsCount(data.createdTicketsCount);
          setCreatedTicketsChartData(data.createdTicketsChartData);
          setCreatedTicketsClosedInTheRangeTimeChartData(
            data.createdTicketsClosedInTheRangeTimeChartData
          );
          setTprPromedio(data.tprPromedio);
          setCreatedTicketsClosedInTheRangeTimeCount(
            data.createdTicketsClosedInTheRangeTimeCount
          );
          setTdrPromedio(data.tdrPromedio);

          console.log(data);
        } catch (error) {
          console.log(error);
          toastError(error);
        }
      })();
    }
  }, [fromDate, toDate, selectedWhatsappIds]);

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <MainHeader>
          <Title>Reportes</Title>
          <div
            style={{
              marginLeft: "2.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <TextField
              id="date"
              label="Desde"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="date"
              label="Hasta"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <div style={{ minWidth: 250 }}>
              {/* <UsersSelect
                selectedUserIds={selectedUserIds}
                onChange={(value) => {
                  setSelectedUserIds(value);
                }}
              /> */}
              <ReportsWhatsappSelect
                style={{ marginLeft: 6 }}
                selectedWhatsappIds={selectedWhatsappIds || []}
                userWhatsapps={whatsApps || []}
                onChange={(values) => setSelectedWhatsappIds(values)}
              />
            </div>
          </div>
        </MainHeader>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Tickets creados
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {createdTicketsCount !== null && createdTicketsCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Tiempo primera respuesta
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {tprPromedio ? segundosAHorasMinutos(tprPromedio) : "-"}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Tickets resueltos
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {createdTicketsClosedInTheRangeTimeCount}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h3" variant="h6" color="primary" paragraph>
                Tiempo de resolución
              </Typography>
              <Grid item>
                <Typography component="h1" variant="h4">
                  {tdrPromedio ? segundosAHorasMinutos(tdrPromedio) : "-"}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart
                title={"Ticket creados"}
                total={createdTicketsCount}
                chartData={createdTicketsChartData}
              />
            </Paper>
          </Grid>
          {/* <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart
                title={"Tiempo primera respuesta"}
                total={tprPromedio ? segundosAHorasMinutos(tprPromedio) : "-"}
              />
            </Paper>
          </Grid> */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart
                title={"Tickets resueltos"}
                total={createdTicketsClosedInTheRangeTimeCount}
                chartData={createdTicketsClosedInTheRangeTimeChartData}
              />
            </Paper>
          </Grid>
          {/* <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Chart
                title={"Tiempo de resolución"}
                total={tdrPromedio ? segundosAHorasMinutos(tdrPromedio) : "-"}
              />
            </Paper>
          </Grid> */}
        </Grid>
      </Container>
    </div>
  );
};

export default Reports;
