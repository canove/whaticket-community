import { format } from "date-fns";
import React, { useContext, useState } from "react";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import MainHeader from "../../components/MainHeader";
import ReportsWhatsappSelect from "../../components/ReportsWhatsappSelect";
import Title from "../../components/Title";

import Typography from "@material-ui/core/Typography";
import * as XLSX from "xlsx";

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
    // height: 120,
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

  const [loading, setLoading] = useState(false);
  const [selectedWhatsappIds, setSelectedWhatsappIds] = useState([]);

  const [createdTicketsData, setCreatedTicketsData] = useState(null);
  const [createdTicketsCount, setCreatedTicketsCount] = useState(null);
  const [createdTicketsChartData, setCreatedTicketsChartData] = useState(null);

  const [
    createdTicketsClosedInTheRangeTimeChartData,
    setCreatedTicketsClosedInTheRangeTimeChartData,
  ] = useState(null);
  const [
    createdTicketsClosedInTheRangeTimeData,
    setCreatedTicketsClosedInTheRangeTimeData,
  ] = useState(null);

  const [tprData, setTprData] = useState(null);
  const [tprPromedio, setTprPromedio] = useState(null);

  const [tdrData, setTdrData] = useState(null);
  const [tdrPromedio, setTdrPromedio] = useState(null);
  const [
    createdTicketsClosedInTheRangeTimeCount,
    setCreatedTicketsClosedInTheRangeTimeCount,
  ] = useState(null);

  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0] + " 00:00:00"
  );
  const { whatsApps } = useContext(WhatsAppsContext);
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0] + " 23:59:59"
  );

  useEffect(() => {
    localStorage.getItem("ReportsWhatsappSelect") &&
      setSelectedWhatsappIds(
        JSON.parse(localStorage.getItem("ReportsWhatsappSelect"))
      );
  }, []);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (esFechaValida(fromDate) && esFechaValida(toDate)) {
      // console.log({ fromDate, toDate, selectedWhatsappIds });
      console.log({
        fromDate: format(new Date(fromDate), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        toDate: format(new Date(toDate), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        selectedWhatsappIds,
      });

      (async () => {
        try {
          setLoading(true);

          const { data } = await api.get("/generalReport", {
            params: {
              fromDate: format(new Date(fromDate), "yyyy-MM-dd'T'HH:mm:ssXXX"),
              toDate: format(new Date(toDate), "yyyy-MM-dd'T'HH:mm:ssXXX"),
              selectedWhatsappIds: JSON.stringify(selectedWhatsappIds),
            },
          });

          setLoading(false);

          setCreatedTicketsData(data.createdTicketsData);
          setCreatedTicketsCount(data.createdTicketsCount);
          setCreatedTicketsChartData(data.createdTicketsChartData);

          setCreatedTicketsClosedInTheRangeTimeChartData(
            data.createdTicketsClosedInTheRangeTimeChartData
          );
          setCreatedTicketsClosedInTheRangeTimeData(
            data.createdTicketsClosedInTheRangeTimeData
          );

          setTprData(data.tprData);
          setTprPromedio(data.tprPromedio);

          setCreatedTicketsClosedInTheRangeTimeCount(
            data.createdTicketsClosedInTheRangeTimeCount
          );

          setTdrData(data.tdrData);
          setTdrPromedio(data.tdrPromedio);

          console.log(data);
        } catch (error) {
          console.log(error);
          toastError(error);
        }
      })();
    }
  }, [fromDate, toDate, selectedWhatsappIds]);

  const exportToExcel = () => {
    try {
      const dataToExport = createdTicketsData.map((ticket) => ({
        NÚMERO: ticket.id,
        CREACIÓN_FECHA: format(new Date(ticket.createdAt), "dd-MM-yyyy"),
        CREACIÓN_HORA: format(new Date(ticket.createdAt), "HH:mm"),
        CONEXIÓN: ticket.whatsapp?.name,
        USUARIO: ticket.user?.name,
        ESTADO: ticket.status,
      }));

      tprData.map((tpr) => {
        const ticketToAddTprData = dataToExport.find((d) => {
          return d.NÚMERO === tpr.ticket.id;
        });

        // console.log("ticketToAddTprData:", ticketToAddTprData, tpr);

        if (ticketToAddTprData) {
          ticketToAddTprData["TPR_MENSAJE_CLIENTE_CUERPO"] =
            tpr.tprFirstMessage.body;
          ticketToAddTprData["TPR_MENSAJE_USUARIO_FECHA"] = tpr
            .tprFirstUserMessage?.timestamp
            ? format(
                new Date(tpr.tprFirstUserMessage.timestamp * 1000),
                "dd-MM-yyyy"
              )
            : "-";
          ticketToAddTprData["TPR_MENSAJE_USUARIO_HORA"] = tpr
            .tprFirstUserMessage?.timestamp
            ? format(
                new Date(tpr.tprFirstUserMessage?.timestamp * 1000),
                "HH:mm"
              )
            : "-";
          ticketToAddTprData["TPR_MENSAJE_USUARIO_CUERPO"] = tpr
            .tprFirstUserMessage?.body
            ? tpr.tprFirstUserMessage?.body
            : "-";
          ticketToAddTprData["TPR_EN_SEGUNDOS"] = tpr.tprItem;
        }
      });

      createdTicketsClosedInTheRangeTimeData.map((i) => {
        const ticketToAddTdrData = dataToExport.find((d) => {
          return d.NÚMERO === i.id;
        });

        // console.log("ticketToAddTdrData:", ticketToAddTdrData, i);

        if (ticketToAddTdrData) {
          ticketToAddTdrData["CERRADO_FECHA"] = i.messages[
            i.messages.length - 1
          ]?.timestamp
            ? format(
                new Date(i.messages[i.messages.length - 1].timestamp * 1000),
                "dd-MM-yyyy"
              )
            : "-";
          ticketToAddTdrData["CERRADO_HORA"] = i.messages[i.messages.length - 1]
            ?.timestamp
            ? format(
                new Date(i.messages[i.messages.length - 1].timestamp * 1000),
                "HH:mm"
              )
            : "-";
        }
      });

      tdrData.map((tdr) => {
        const ticketToAddTdrData = dataToExport.find((d) => {
          return d.NÚMERO === tdr.ticket.id;
        });

        if (ticketToAddTdrData) {
          ticketToAddTdrData["TDR_EN_SEGUNDOS"] = tdr.tdrItem;
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${"WHATREST"}.xlsx`);
    } catch (error) {
      console.log("-----------error", error);
    }
  };

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <MainHeader>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex" }}>
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
                  type="datetime-local"
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
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <div>
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
                {loading && <CircularProgress color="primary" size={25} />}
              </div>
            </div>
            <Button variant="contained" color="primary" onClick={exportToExcel}>
              Exportar
            </Button>
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
