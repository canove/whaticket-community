import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import TableRowSkeleton from "../../components/TableRowSkeleton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    width: 200,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const ServiceTimeReports = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ticketHistorics');
      setReports(data.reports);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const filterReports = async () => {
    await fetchReports();
  }

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

  const getServiceTime = (hists) => {
    let currentID = 0;

    const createdHist = hists.find(h => h.id > currentID);
    currentID = createdHist.id;

    const finalizedHist = hists.find(h => h.id > currentID);

    const createdAt = createdHist.ticketCreatedAt ?? createdHist.reopenedAt ?? createdHist.transferedAt;
    const finalizedAt = finalizedHist.finalizedAt ?? finalizedHist.transferedAt;

    const createdAtDate = new Date(createdAt);
    const finalizedAtDate = new Date(finalizedAt);

    const serviceTime = finalizedAtDate.getTime() - createdAtDate.getTime();

    return serviceTime;
  }

  const getQueueServiceTime = (historics = []) => {    
    let tickets = [];

    for (const historic of historics) {
      const ticketIndex = tickets.findIndex(ticket => ticket.ticketId === historic.ticketId);

      if (ticketIndex === -1) {
        tickets.push({
          ticketId: historic.ticketId,
          historics: [historic]
        });
      } else {
        const newTicket = {
          ticketId: tickets[ticketIndex].ticketId,
          historics: [...tickets[ticketIndex].historics, historic]
        }
  
        tickets[ticketIndex] = newTicket;
      }
    }

    const ticketsServiceTime = [];

    for (const ticket of tickets) {
      const hists = ticket.historics;

      if (hists.length < 2) continue;

      if (hists.length === 2) {
        const serviceTime = getServiceTime(hists);
        ticketsServiceTime.push(serviceTime);
        continue;
      }

      if (hists.length > 2) {
        const histsArray = [];

        for (let i = 0; i < hists.length; i += 2) {
          histsArray.push(hists.slice(i, i + 2));
        }

        for (const newHists of histsArray) {
          // if (newHists.length % 2 !== 0) continue;
          const serviceTime = getServiceTime(newHists);
          ticketsServiceTime.push(serviceTime);
          continue;
        }
      }
    }

    let itemCount = 0;
    let milliseconds = 0;
    for (const time of ticketsServiceTime) {
      milliseconds += time;
      itemCount++;
    }

    const averageServiceTime = milliseconds / itemCount;

    return formatTime(averageServiceTime);
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{"Relatório de Tempo de Atendimento"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={ filterReports }
          >
            {"Filtrar"}
          </Button>
          <Button
            variant="contained"
            color="primary"
          >
            {"Exportar PDF"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{"Fila"}</TableCell>
              <TableCell align="center">{"Tempo de Atendimento"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell align="center">{report.name}</TableCell>
                  <TableCell align="center">{getQueueServiceTime(report.ticketHistorics)}</TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={2} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ServiceTimeReports;
