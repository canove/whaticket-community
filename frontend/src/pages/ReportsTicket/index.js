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

import { format, parseISO } from "date-fns";

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
  const [ticket, setTicket] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [ticketId, setTicketId] = useState("");

  const [pdf, setPDF] = useState("");
  const [creatingPDF, setCreatingPDF] = useState(false);

  const filterReports = async () => {
    if (!ticketId) {
      toast.error(i18n.t("reportsTicket.errors.toastErr"));
      return;
    }

    setPDF("");
    await fetchReports(ticketId);
  }

  const createPDF = async () => {
    try {
      const { data } = await api.get(`/tickets-export-report?ticketId=${ticketId}`);
      setPDF(data);
      return data;
    } catch (err) {
      toastError(err)
    }
    return null;
  }

  const downloadPDF = async () => {
    if (!ticketId) {
      toast.error(i18n.t("reportsTicket.errors.toastErr"));
      return;
    }

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

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets/list")
        setTickets(data.tickets)
        setLoading(false)
      } catch (err) {
        setLoading(false)
        toastError(err)
      }
    }
    fetchTickets()
  }, [])

  const fetchReports = async (ticketId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`tickets-report?ticketId=${ticketId}`);
      setTicket(data);
      setReports(data.messages);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
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
                label={i18n.t("reportsTicket.buttons.ticketId")}
                InputLabelProps={{ required: true }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={ filterReports }
          >
            {i18n.t("reportsTicket.buttons.filterReports")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={ downloadPDF }
            disabled={ creatingPDF }
          >
            {i18n.t("reportsTicket.buttons.exportPdf")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("reportsTicket.grid.ticketId")}</TableCell>
              <TableCell align="center">{i18n.t("reportsTicket.grid.messageId")}</TableCell>
              <TableCell align="center">{i18n.t("reportsTicket.grid.bodyText")}</TableCell>
              <TableCell align="center">{i18n.t("reportsTicket.grid.read")}</TableCell>
              <TableCell align="center">{"Criado em"}</TableCell>
              <TableCell align="center">{"Categoria"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell align="center">{report.ticketId}</TableCell>
                  <TableCell align="center">{report.id}</TableCell>
                  <TableCell align="center">{report.body}</TableCell>
                  <TableCell align="center">{report.read ? "SIM" : "NÃO"}</TableCell>
                  <TableCell align="center">{format(parseISO(report.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell align="center">{ticket.category ? ticket.category.name : ""}</TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ReportsTicket;
