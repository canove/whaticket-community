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
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

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

  const [tmaType, setTMAType] = useState("queue");
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");

  const [pdf, setPDF] = useState("");
  const [creatingPDF, setCreatingPDF] = useState(false);
  const [csv, setCSV] = useState("");
  const [creatingCSV, setCreatingCSV] = useState(false);

  useEffect(() => {
    setReports([]);
    setPDF("");
    setCSV("");
  }, [tmaType])

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/serviceTime/', {
        params: { tmaType, initialDate, finalDate }
      });
      setReports(data);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const createPDF = async () => {
    try {
      const { data } = await api.get('/serviceTime/exportPDF', {
        params: { tmaType, initialDate, finalDate }
      });
      setPDF(data);
      return data;
    } catch (err) {
      toastError(err);
    }

    return null;
  }

  const createCSV = async () => {
    try {
      const { data } = await api.get('/serviceTime/exportCSV', {
        params: { tmaType, initialDate, finalDate }
      });
      setCSV(data);
      return data;
    } catch (err) {
      toastError(err);
    }

    return null;
  }

  const filterReports = async () => {
    setPDF("");
    setCSV("");
    await fetchReports();
  }

  const downloadPDF = async () => {
    let newPDF = null;

    if (!pdf) {
        setCreatingPDF(true);
        newPDF = await createPDF();
        setCreatingPDF(false);
    }

    const linkSource = `data:application/pdf;base64,${newPDF ? newPDF : pdf}`;
    const downloadLink = document.createElement("a");
    const fileName = `report.pdf`;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  const downloadCSV = async () => {
    let newCSV = null;

    if (!csv) {
        setCreatingCSV(true);
        newCSV = await createCSV();
        setCreatingCSV(false);
    }

    const file = new Blob([newCSV ? newCSV : csv], { type: 'text/csv;charset=utf-8;' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, "report.csv");
    } else {
        const link = document.createElement("a"),
        url = URL.createObjectURL(file);
        link.href = url;
        link.download = "report.csv";
        document.body.appendChild(link);
        link.click();
        setTimeout(function() {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
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

    if (hoursString === "NaN" || minutesString === "NaN" || secondsString === "NaN") return "00:00:00";

    return `${hoursString}:${minutesString}:${secondsString}`;
  };

  const getUserServiceTime = (hists) => {
    let currentID = 0;

    const createdHist = hists.find(h => h.id > currentID);
    currentID = createdHist.id;

    const finalizedHist = hists.find(h => h.id > currentID);

    const createdAt = createdHist.ticketCreatedAt ?? createdHist.acceptedAt ?? createdHist.reopenedAt ?? createdHist.transferedAt;
    const finalizedAt = finalizedHist.finalizedAt ?? finalizedHist.transferedAt;

    if (!createdAt || !finalizedAt) return null;
  
    const createdAtDate = new Date(createdAt);
    const finalizedAtDate = new Date(finalizedAt);

    const serviceTime = finalizedAtDate.getTime() - createdAtDate.getTime();

    return serviceTime;
  }

  const getQueueServiceTime = (hists) => {
    let currentID = 0;

    const createdHist = hists.find(h => h.id > currentID);
    currentID = createdHist.id;

    const finalizedHist = hists.find(h => h.id > currentID);

    const createdAt = createdHist.ticketCreatedAt ?? createdHist.reopenedAt ?? createdHist.transferedAt;
    const finalizedAt = finalizedHist.finalizedAt ?? finalizedHist.transferedAt;

    if (!createdAt || !finalizedAt) return null;

    const createdAtDate = new Date(createdAt);
    const finalizedAtDate = new Date(finalizedAt);

    const serviceTime = finalizedAtDate.getTime() - createdAtDate.getTime();

    return serviceTime;
  }

  const processHistorics = (historics = []) => {   
    if (!historics || historics.length === 0) return "--:--:--";
 
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
        let serviceTime = 0;

        if (tmaType === "queue") {
          serviceTime = getQueueServiceTime(hists);
        }

        if (tmaType === "user") {
          serviceTime = getUserServiceTime(hists);
        }

        if (serviceTime === null) continue;

        ticketsServiceTime.push(serviceTime);
        continue;
      }

      if (hists.length > 2) {
        const histsArray = [];

        for (let i = 0; i < hists.length; i += 2) {
          histsArray.push(hists.slice(i, i + 2));
        }

        for (const newHists of histsArray) {
          if (newHists.length % 2 !== 0) continue;

          let serviceTime = 0;

          if (tmaType === "queue") {
            serviceTime = getQueueServiceTime(newHists);
          }

          if (tmaType === "user") {
            serviceTime = getUserServiceTime(newHists);
          }

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
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <FormControl style={{ display: "inline-flex", width: "150px" }}>
              <InputLabel>{"Tipo"}</InputLabel>
              <Select
                value={tmaType}
                defaultValue="queue"
                onChange={(e) => setTMAType(e.target.value)}
              >
                <MenuItem value={"queue"}>{"Fila"}</MenuItem>
                <MenuItem value={"user"}>{"Operador"}</MenuItem>
                <MenuItem value={"client"}>{"Cliente"}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              style={{ marginLeft: "8px" }}
              type="date"
              label={i18n.t("reports.form.initialDate")}
              value={initialDate}
              onChange={(e) => { setInitialDate(e.target.value) }}
              InputLabelProps={{ shrink: true, required: true }}
            />
            <TextField
              style={{ marginLeft: "8px" }}
              type="date"
              label={i18n.t("reports.form.finalDate")}
              value={finalDate}
              onChange={(e) => { setFinalDate(e.target.value) }}
              InputLabelProps={{ shrink: true, required: true }}
            />
            <Button
              style={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={ filterReports }
            >
              {"Filtrar"}
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={downloadPDF}
              disabled={creatingPDF}
            >
              {"Exportar PDF"}
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={downloadCSV}
              disabled={creatingCSV}
            >
              {"Exportar CSV"}
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        { tmaType === "queue" &&
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
                  <TableRow key={`queue-${report.id}`}>
                    <TableCell align="center">{report.name}</TableCell>
                    <TableCell align="center">{processHistorics(report.ticketHistorics)}</TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={2} />}
              </>
            </TableBody>
          </Table>
        }
        { tmaType === "user" &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">{"Usuário"}</TableCell>
                <TableCell align="center">{"Tempo de Atendimento"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {reports.map((report) => (
                  <TableRow key={`user-${report.id}`}>
                    <TableCell align="center">{report.name}</TableCell>
                    <TableCell align="center">{processHistorics(report.ticketHistorics)}</TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={2} />}
              </>
            </TableBody>
          </Table>
        }
        { tmaType === "client" &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">{"Tempo de Resposta"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">{formatTime(reports[0])}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      </Paper>
    </MainContainer>
  );
};

export default ServiceTimeReports;
