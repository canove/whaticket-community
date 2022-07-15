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
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketId, setTicketId] = useState();

  const filterReports = () => {
    fetchReports(ticketId)
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
        <Title>{i18n.t("Relatório do Ticket")}</Title>
        <MainHeaderButtonsWrapper>
          <Autocomplete
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            className={classes.root}
            options={tickets.map(ticket => ((ticket.id).toString()))}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("Id Ticket")}
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
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("reportsTicket.table.messageId")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("reportsTicket.table.messageBody")}
              </TableCell>
              <TableCell align="center">{i18n.t("reportsTicket.table.read")}</TableCell>
              <TableCell align="center">
                {i18n.t("reportsTicket.table.ticketId")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports.map((reportsTicket) => (
                <TableRow key={reportsTicket.id}>
                  <TableCell align="center">{reportsTicket.id}</TableCell>
                  <TableCell align="center">{reportsTicket.body}</TableCell>
                  <TableCell align="center">{reportsTicket.read}</TableCell>
                  <TableCell align="center">{reportsTicket.ticketId}</TableCell>
                </TableRow>
              ))}
              {loading}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ReportsTicket;
