import { format } from "date-fns";
import React, { useContext, useState } from "react";

import { differenceInDays, differenceInHours } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import MainHeader from "../../components/MainHeader";
import ReportsWhatsappSelect from "../../components/ReportsWhatsappSelect";
import TicketListModal from "../../components/TicketListModal";
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
    height: 250,
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

const responseTimesRanges = [
  { label: "0 - 1 Horas", min: 0, max: 1, type: "hours" },
  { label: "1 - 2 Horas", min: 1, max: 2, type: "hours" },
  { label: "2 - 3 Horas", min: 2, max: 3, type: "hours" },
  { label: "3 - 4 Horas", min: 3, max: 4, type: "hours" },
  { label: "4 - 5 Horas", min: 4, max: 5, type: "hours" },
  { label: "0 - 5 Horas", min: 0, max: 5, type: "hours" },
  { label: "5 - 10 Horas", min: 5, max: 10, type: "hours" },
  { label: "10 - 15 Horas", min: 10, max: 15, type: "hours" },
  { label: "15 - 20 Horas", min: 15, max: 20, type: "hours" },
  { label: "20 - 24 Horas", min: 20, max: 24, type: "hours" },
  { label: "0 - 24 Horas", min: 0, max: 24, type: "hours" },
  { label: "1 - 2 Días", min: 1, max: 2, type: "days" },
  { label: "2 - 3 Días", min: 2, max: 3, type: "days" },
  { label: "3 - 4 Días", min: 3, max: 4, type: "days" },
  { label: "4 - x Días", min: 4, max: Infinity, type: "days" },
];

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

  const [responseTimesData, setResponseTimesData] = useState(null);
  const [responseTimes, setResponseTimes] = useState(null);
  const [ticketListModalOpen, setTicketListModalOpen] = useState(false);
  const [ticketListModalTitle, setTicketListModalTitle] = useState("");
  const [ticketListModalTickets, setTicketListModalTickets] = useState([]);
  const [
    ticketsWithAllMessagesInverseFilteredThatAreGroups,
    setTicketsWithAllMessagesInverseFilteredThatAreGroups,
  ] = useState(0);
  const [
    ticketsWithAllMessagesInverseFilteredThatAreIndividuals,
    setTicketsWithAllMessagesInverseFilteredThatAreIndividuals,
  ] = useState(0);
  const [
    ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups,
    setTicketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups,
  ] = useState(0);
  const [
    ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals,
    setTicketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals,
  ] = useState(0);

  const [fromDate, setFromDate] = useState(
    format(new Date(), "yyyy-MM-dd") + " 00:00:00"
  );
  const { whatsApps } = useContext(WhatsAppsContext);
  const [toDate, setToDate] = useState(
    format(new Date(), "yyyy-MM-dd") + " 23:59:59"
  );

  useEffect(() => {
    console.log("whatsApps", whatsApps);
  }, [whatsApps]);

  useEffect(() => {
    localStorage.getItem("ReportsWhatsappSelect") &&
      setSelectedWhatsappIds(
        JSON.parse(localStorage.getItem("ReportsWhatsappSelect"))
      );
  }, []);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
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
                fromDate: format(
                  new Date(fromDate),
                  "yyyy-MM-dd'T'HH:mm:ssXXX"
                ),
                toDate: format(new Date(toDate), "yyyy-MM-dd'T'HH:mm:ssXXX"),
                selectedWhatsappIds: JSON.stringify(selectedWhatsappIds),
              },
            });

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

            const { data: data2 } = await api.get(
              "/getOpenOrPendingTicketsWithLastMessages",
              {
                params: {
                  selectedWhatsappIds: JSON.stringify(selectedWhatsappIds),
                },
              }
            );

            const ticketsWithAllMessages = data2.ticketsWithAllMessages;

            console.log("ticketsWithAllMessages", ticketsWithAllMessages);

            const ticketsWithAllMessagesFiltered =
              data2.ticketsWithAllMessages.filter((t) => {
                let ticketMessages = t.messages?.filter((m) => {
                  return !m.isPrivate;
                });

                if (ticketMessages.length === 0) {
                  return false;
                }

                const lastTicketMessage =
                  ticketMessages[ticketMessages.length - 1];

                if (
                  whatsApps.find(
                    (w) => w.number === lastTicketMessage.contact?.number
                  ) ||
                  lastTicketMessage?.contact?.isCompanyMember ||
                  lastTicketMessage?.fromMe
                ) {
                  return false;
                }

                return true;
              });

            const ticketsWithAllMessagesInverseFiltered =
              data2.ticketsWithAllMessages.filter((t) => {
                let ticketMessages = t.messages?.filter((m) => {
                  return !m.isPrivate;
                });

                if (ticketMessages.length === 0) {
                  return true;
                }

                const lastTicketMessage =
                  ticketMessages[ticketMessages.length - 1];

                if (
                  whatsApps.find(
                    (w) => w.number === lastTicketMessage.contact?.number
                  ) ||
                  lastTicketMessage?.contact?.isCompanyMember ||
                  lastTicketMessage?.fromMe
                ) {
                  return true;
                }

                return false;
              });

            console.log(
              "--- ticketsWithAllMessagesInverseFiltered: ",
              ticketsWithAllMessagesInverseFiltered
            );

            const ticketsWithAllMessagesInverseFilteredThatAreGroups =
              ticketsWithAllMessagesInverseFiltered.filter((t) => t.isGroup);

            const ticketsWithAllMessagesInverseFilteredThatAreIndividuals =
              ticketsWithAllMessagesInverseFiltered.filter((t) => !t.isGroup);

            console.log(
              "--- ticketsWithAllMessagesInverseFilteredThatAreGroups: ",
              ticketsWithAllMessagesInverseFilteredThatAreGroups.length
            );

            setTicketsWithAllMessagesInverseFilteredThatAreGroups(
              ticketsWithAllMessagesInverseFilteredThatAreGroups.length
            );

            console.log(
              "--- ticketsWithAllMessagesInverseFilteredThatAreIndividuals: ",
              ticketsWithAllMessagesInverseFilteredThatAreIndividuals.length
            );

            setTicketsWithAllMessagesInverseFilteredThatAreIndividuals(
              ticketsWithAllMessagesInverseFilteredThatAreIndividuals.length
            );

            const ticketsWithAllMessagesFilteredWithFirstLastUserMessage =
              ticketsWithAllMessagesFiltered.map((t) => {
                let ticketMessages = t.messages.filter((m) => {
                  return !m.isPrivate;
                });
                let firstLastMessageThatIsFromTheClient;

                for (let i = ticketMessages.length - 1; i >= 0; i--) {
                  if (
                    !whatsApps.find(
                      (w) => w.number === ticketMessages.contact?.number
                    ) &&
                    !ticketMessages[i]?.contact?.isCompanyMember &&
                    !ticketMessages[i]?.fromMe
                  ) {
                    firstLastMessageThatIsFromTheClient = ticketMessages[i];
                  } else {
                    break;
                  }
                }

                return {
                  ticket: t,
                  firstLastUserMessage: firstLastMessageThatIsFromTheClient,
                  firstLastUserMessageTime: new Date(
                    firstLastMessageThatIsFromTheClient.timestamp * 1000
                  ),
                  days: differenceInDays(
                    new Date(),
                    new Date(
                      firstLastMessageThatIsFromTheClient.timestamp * 1000
                    )
                  ),
                  hours: differenceInHours(
                    new Date(),
                    new Date(
                      firstLastMessageThatIsFromTheClient.timestamp * 1000
                    )
                  ),
                };
              });

            console.log(
              "ticketsWithAllMessagesFiltered",
              ticketsWithAllMessagesFiltered
            );
            console.log(
              "ticketsWithAllMessagesFilteredWithFirstLastUserMessage",
              ticketsWithAllMessagesFilteredWithFirstLastUserMessage
            );

            const ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups =
              ticketsWithAllMessagesFilteredWithFirstLastUserMessage.filter(
                (t) => t.ticket?.isGroup
              );

            const ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals =
              ticketsWithAllMessagesFilteredWithFirstLastUserMessage.filter(
                (t) => !t.ticket?.isGroup
              );

            console.log(
              "--- ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups: ",
              ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups.length
            );

            setTicketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups(
              ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups.length
            );

            console.log(
              "--- ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals: ",
              ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals.length
            );

            setTicketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals(
              ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals.length
            );

            const responseTimesData = responseTimesRanges.map((range) => ({
              label: range.label,
              count: 0,
              tickets: [],
            }));

            ticketsWithAllMessagesFilteredWithFirstLastUserMessage.forEach(
              (item) => {
                responseTimesRanges.forEach((range, index) => {
                  if (range.type === "hours") {
                    if (
                      item.days === 0 &&
                      item.hours >= range.min &&
                      item.hours < range.max
                    ) {
                      responseTimesData[index].count += 1;
                      responseTimesData[index].tickets.push(item.ticket);
                    }
                  } else if (range.type === "days") {
                    if (item.days >= range.min && item.days < range.max) {
                      responseTimesData[index].count += 1;
                      responseTimesData[index].tickets.push(item.ticket);
                    }
                  }
                });
              }
            );

            console.log("responseTimesData", responseTimesData);
            setResponseTimesData(
              ticketsWithAllMessagesFilteredWithFirstLastUserMessage
            );
            setResponseTimes(responseTimesData);

            setLoading(false);
          } catch (error) {
            console.log(error);
            toastError(error);
          }
        })();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fromDate, toDate, selectedWhatsappIds, whatsApps]);

  const exportToExcel = () => {
    try {
      const dataToExport = createdTicketsData.map((ticket) => ({
        NÚMERO: ticket.id,
        CREACIÓN_FECHA: format(
          new Date(ticket.createdAt.replace("Z", "")),
          "dd-MM-yyyy"
        ),
        CREACIÓN_HORA: format(
          new Date(ticket.createdAt.replace("Z", "")),
          "HH:mm"
        ),
        CONTACTO: ticket.contact?.name,
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
          </div>
        </MainHeader>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <Typography
                component="h3"
                variant="h6"
                color="primary"
                paragraph
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Tiempo de respuesta total</span>
                <span style={{ color: "black" }}>
                  Tickets Totales:{" "}
                  {responseTimesData ? responseTimesData.length : 0}
                </span>
              </Typography>
              <div style={{ flexGrow: 1 }}>
                <Grid container spacing={3} style={{ fontSize: 18 }}>
                  {responseTimes ? (
                    <>
                      <Grid item xs={4}>
                        {responseTimes.slice(0, 5).map((range) => (
                          <div key={range.label}>
                            <span>{range.label}</span>
                            {": "}
                            <IconButton
                              size="small"
                              color="primary"
                              style={{ fontWeight: "bold" }}
                              onClick={() => {
                                setTicketListModalOpen(true);
                                setTicketListModalTickets(range.tickets);
                                setTicketListModalTitle(range.label);
                              }}
                            >
                              {range.count}{" "}
                              {range.count > 0 && (
                                <span
                                  style={{
                                    color: "black",
                                    fontSize: "12px",
                                    display: "inline-block",
                                    marginLeft: 5,
                                  }}
                                >
                                  (
                                  {Math.round(
                                    (range.count * 100) /
                                      responseTimes
                                        .slice(0, 5)
                                        .reduce(
                                          (acc, range) => acc + range.count,
                                          0
                                        )
                                  )}
                                  %)
                                </span>
                              )}
                            </IconButton>
                          </div>
                        ))}

                        <div style={{ fontWeight: "bold", marginTop: 5 }}>
                          Porcentaje:{" "}
                          {Math.round(
                            (responseTimes
                              .slice(0, 5)
                              .reduce((acc, range) => acc + range.count, 0) *
                              100) /
                              responseTimesData.length
                          )}
                          %
                        </div>
                      </Grid>
                      <Grid item xs={4}>
                        {responseTimes.slice(5, 10).map((range, index) => (
                          <div key={range.label}>
                            <span>{range.label}</span>
                            {": "}
                            <IconButton
                              size="small"
                              color="primary"
                              style={{ fontWeight: "bold" }}
                              onClick={() => {
                                setTicketListModalOpen(true);
                                setTicketListModalTickets(range.tickets);
                                setTicketListModalTitle(range.label);
                              }}
                            >
                              {range.count}{" "}
                              {index !== 0 && range.count > 0 && (
                                <span
                                  style={{
                                    color: "black",
                                    fontSize: "12px",
                                    display: "inline-block",
                                    marginLeft: 5,
                                  }}
                                >
                                  (
                                  {Math.round(
                                    (range.count * 100) /
                                      responseTimes
                                        .slice(6, 10)
                                        .reduce(
                                          (acc, range) => acc + range.count,
                                          0
                                        )
                                  )}
                                  %)
                                </span>
                              )}
                            </IconButton>
                          </div>
                        ))}
                        <div style={{ fontWeight: "bold", marginTop: 5 }}>
                          Porcentaje:{" "}
                          {Math.round(
                            (responseTimes
                              .slice(6, 10)
                              .reduce((acc, range) => acc + range.count, 0) *
                              100) /
                              responseTimesData.length
                          )}
                          %
                        </div>
                      </Grid>
                      <Grid item xs={4}>
                        {responseTimes.slice(10, 15).map((range, index) => (
                          <div key={range.label}>
                            <span>{range.label}</span>
                            {": "}
                            <IconButton
                              size="small"
                              color="primary"
                              style={{ fontWeight: "bold" }}
                              onClick={() => {
                                setTicketListModalOpen(true);
                                setTicketListModalTickets(range.tickets);
                                setTicketListModalTitle(range.label);
                              }}
                            >
                              {range.count}
                              {index !== 0 && range.count > 0 && (
                                <span
                                  style={{
                                    color: "black",
                                    fontSize: "12px",
                                    display: "inline-block",
                                    marginLeft: 5,
                                  }}
                                >
                                  (
                                  {Math.round(
                                    (range.count * 100) /
                                      responseTimes
                                        .slice(11, 15)
                                        .reduce(
                                          (acc, range) => acc + range.count,
                                          0
                                        )
                                  )}
                                  %)
                                </span>
                              )}
                            </IconButton>
                          </div>
                        ))}
                        <div style={{ fontWeight: "bold", marginTop: 5 }}>
                          Porcentaje:{" "}
                          {Math.round(
                            (responseTimes
                              .slice(11, 15)
                              .reduce((acc, range) => acc + range.count, 0) *
                              100) /
                              responseTimesData.length
                          )}
                          %
                        </div>
                      </Grid>

                      <TicketListModal
                        modalOpen={ticketListModalOpen}
                        onClose={() => setTicketListModalOpen(false)}
                        title={ticketListModalTitle}
                        tickets={ticketListModalTickets}
                      />
                    </>
                  ) : null}
                </Grid>
              </div>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper className={classes.customFixedHeightPaper}>
              <Typography
                component="h3"
                variant="h6"
                color="primary"
                paragraph
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Distribución de respuesta total</span>
              </Typography>

              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell align="center"></TableCell>
                    <TableCell
                      align="center"
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                    >
                      Con respuesta
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                    >
                      Sin respuesta
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell
                      align="center"
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                    >
                      Individuales
                    </TableCell>
                    <TableCell align="center" style={{ fontSize: "18px" }}>
                      <div>
                        <div>
                          {
                            ticketsWithAllMessagesInverseFilteredThatAreIndividuals
                          }
                          {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals +
                            ticketsWithAllMessagesInverseFilteredThatAreIndividuals >
                            0 && (
                            <span
                              style={{
                                color: "black",
                                fontSize: "12px",
                                display: "inline-block",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {Math.round(
                                (ticketsWithAllMessagesInverseFilteredThatAreIndividuals *
                                  100) /
                                  (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals +
                                    ticketsWithAllMessagesInverseFilteredThatAreIndividuals)
                              )}
                              %)
                            </span>
                          )}
                        </div>
                        {ticketsWithAllMessagesInverseFilteredThatAreGroups +
                          ticketsWithAllMessagesInverseFilteredThatAreIndividuals >
                          0 && (
                          <span
                            style={{
                              color: "black",
                              fontSize: "12px",
                              display: "inline-block",
                              marginLeft: 5,
                            }}
                          >
                            (
                            {Math.round(
                              (ticketsWithAllMessagesInverseFilteredThatAreIndividuals *
                                100) /
                                (ticketsWithAllMessagesInverseFilteredThatAreGroups +
                                  ticketsWithAllMessagesInverseFilteredThatAreIndividuals)
                            )}
                            %)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="center" style={{ fontSize: "18px" }}>
                      <div>
                        <div>
                          {
                            ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals
                          }
                          {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals +
                            ticketsWithAllMessagesInverseFilteredThatAreIndividuals >
                            0 && (
                            <span
                              style={{
                                color: "black",
                                fontSize: "12px",
                                display: "inline-block",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {Math.round(
                                (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals *
                                  100) /
                                  (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals +
                                    ticketsWithAllMessagesInverseFilteredThatAreIndividuals)
                              )}
                              %)
                            </span>
                          )}
                        </div>

                        {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                          ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals >
                          0 && (
                          <span
                            style={{
                              color: "black",
                              fontSize: "12px",
                              display: "inline-block",
                              marginLeft: 5,
                            }}
                          >
                            (
                            {Math.round(
                              (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals *
                                100) /
                                (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                                  ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals)
                            )}
                            %)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontSize: "18px", color: "#2576d2" }}
                    >
                      {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals +
                        ticketsWithAllMessagesInverseFilteredThatAreIndividuals}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      align="center"
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                    >
                      Grupos
                    </TableCell>
                    <TableCell align="center" style={{ fontSize: "18px" }}>
                      <div>
                        <div>
                          {ticketsWithAllMessagesInverseFilteredThatAreGroups}
                          {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                            ticketsWithAllMessagesInverseFilteredThatAreGroups >
                            0 && (
                            <span
                              style={{
                                color: "black",
                                fontSize: "12px",
                                display: "inline-block",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {Math.round(
                                (ticketsWithAllMessagesInverseFilteredThatAreGroups *
                                  100) /
                                  (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                                    ticketsWithAllMessagesInverseFilteredThatAreGroups)
                              )}
                              %)
                            </span>
                          )}
                        </div>
                        {ticketsWithAllMessagesInverseFilteredThatAreGroups +
                          ticketsWithAllMessagesInverseFilteredThatAreIndividuals >
                          0 && (
                          <span
                            style={{
                              color: "black",
                              fontSize: "12px",
                              display: "inline-block",
                              marginLeft: 5,
                            }}
                          >
                            (
                            {Math.round(
                              (ticketsWithAllMessagesInverseFilteredThatAreGroups *
                                100) /
                                (ticketsWithAllMessagesInverseFilteredThatAreGroups +
                                  ticketsWithAllMessagesInverseFilteredThatAreIndividuals)
                            )}
                            %)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="center" style={{ fontSize: "18px" }}>
                      <div>
                        <div>
                          {
                            ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups
                          }
                          {ticketsWithAllMessagesInverseFilteredThatAreGroups +
                            ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups >
                            0 && (
                            <span
                              style={{
                                color: "black",
                                fontSize: "12px",
                                display: "inline-block",
                                marginLeft: 5,
                              }}
                            >
                              (
                              {Math.round(
                                (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups *
                                  100) /
                                  (ticketsWithAllMessagesInverseFilteredThatAreGroups +
                                    ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups)
                              )}
                              %)
                            </span>
                          )}
                        </div>

                        {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                          ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals >
                          0 && (
                          <span
                            style={{
                              color: "black",
                              fontSize: "12px",
                              display: "inline-block",
                              marginLeft: 5,
                            }}
                          >
                            (
                            {Math.round(
                              (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups *
                                100) /
                                (ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                                  ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals)
                            )}
                            %)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontSize: "18px", color: "#2576d2" }}
                    >
                      {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                        ticketsWithAllMessagesInverseFilteredThatAreGroups}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      align="center"
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontSize: "18px", color: "#2576d2" }}
                    >
                      {ticketsWithAllMessagesInverseFilteredThatAreGroups +
                        ticketsWithAllMessagesInverseFilteredThatAreIndividuals}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontSize: "18px", color: "#2576d2" }}
                    >
                      {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                        ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ fontSize: "18px", color: "#2576d2" }}
                    >
                      {ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreGroups +
                        ticketsWithAllMessagesFilteredWithFirstLastUserMessageThatAreIndividuals +
                        ticketsWithAllMessagesInverseFilteredThatAreGroups +
                        ticketsWithAllMessagesInverseFilteredThatAreIndividuals}
                    </TableCell>
                  </TableRow>
                  {/* {loading && <TableRowSkeleton columns={4} />} */}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <MainHeader>
              <div
                style={{
                  display: "flex",
                  marginTop: "1rem",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex" }}>
                  <div
                    style={{
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
                    </div>
                  </div>
                </div>
                {/* <Button
                  variant="contained"
                  color="primary"
                  onClick={exportToExcel}
                >
                  Exportar
                </Button> */}
              </div>
            </MainHeader>
          </Grid>

          <Grid item xs={12}>
            <MainHeader>
              <div
                style={{
                  display: "flex",
                  marginTop: "1rem",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex" }}></div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={exportToExcel}
                >
                  Exportar
                </Button>
              </div>
            </MainHeader>
          </Grid>

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
                T. primera respuesta prom
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
                T. de resolución prom
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
                title="Ticket creados en el tiempo"
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
                title="Tickets resueltos en el tiempo"
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
