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

const ReportsTicket = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketId, setTicketId] = useState();
  const [disableButton, setDisableButton] = useState(true);
  const [pdf, setPdf] = useState();

  const filterReports = async () => {
    setDisableButton(true);
    await fetchReports(ticketId);
    await createPdf();
    setDisableButton(false);
  }

  const createPdf = async () => {
    if (!ticketId) {
      toast.error("Select a ticket");
    } else {
      try {
        const { data } = await api.get(`/tickets-export-report?ticketId=${ticketId}`);
        setPdf(data);
      } catch (err) {
        toastError(err)
      }
    }
  }

  const downloadPdf = () => {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const downloadLink = document.createElement("a");
    const fileName = `report.pdf`;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        try {
          const { data } = await api.get("/tickets")
          setTickets(data.tickets)
          setLoading(false)
        } catch (err) {
          setLoading(false)
          toastError(err)
        }
      }
      fetchTickets()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [])

  const fetchReports = async (ticketId) => {
    if (!ticketId) {
      toast.error("Select a ticket");
    } else {
      try {
        setLoading(true);
        const { data } = await api.get(`tickets-report?ticketId=${ticketId}`);
        setReports(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    }
  };

  const handleSelectOption = (e, newValue) => {
    setTicketId(newValue);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("reportsTicket.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Autocomplete
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            className={classes.root}
            options={tickets.map(ticket => ((ticket.id).toString()))}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("ID da Chamada")}
                InputLabelProps={{ required: true }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={ filterReports }
          >
            {i18n.t("reports.buttons.filter")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={ downloadPdf }
            disabled={ disableButton }
          >
            {i18n.t("reports.buttons.exportPdf")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("reports.table.messageId")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("reports.table.messageBody")}
              </TableCell>
              <TableCell align="center">{i18n.t("reports.table.read")}</TableCell>
              <TableCell align="center">
                {i18n.t("reports.table.ticketId")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell align="center">{report.id}</TableCell>
                  <TableCell align="center">{report.body}</TableCell>
                  <TableCell align="center">{report.read}</TableCell>
                  <TableCell align="center">{report.ticketId}</TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ReportsTicket;
