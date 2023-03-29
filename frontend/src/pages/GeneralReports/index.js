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

const GeneralReports = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const [disableButton, setDisableButton] = useState(false);
  const [pdf, setPdf] = useState();

  const [companies, setCompanies] = useState([]);

  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [company, setCompany] = useState("");

  const filterReports = async () => {
    await fetchReports();
  }

  const createPdf = async () => {
    try {
      const { data } = await api.get("/generalReport/pdf", {
        params: { initialDate, finalDate, company }
      });

      setPdf(data);
      return data;
    } catch (err) {
      toastError(err);
    }
    return null;
  }

  const downloadPdf = async () => {
    let newPDF = null;

    if (!pdf) {
      setDisableButton(true);
      newPDF = await createPdf();
      setDisableButton(false);
    }

    const linkSource = `data:application/pdf;base64,${newPDF ? newPDF : pdf}`;
    const downloadLink = document.createElement("a");
    const fileName = `report.pdf`;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  useEffect(() => {
    const fetchCompanies = async () => {
        try {
            const { data } = await api.get("/company");
            setCompanies(data.companies);
        } catch (err) {
            toastError(err);
        }
    }

    fetchCompanies();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setReports([]);
    try {
      const { data } = await api.get("/generalReport/list", {
        params: { initialDate, finalDate, company }
      });

      setReports(data);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleCompanyChange = (_, newValue) => {
    if (newValue) {
      setCompany(newValue.id);
    } else {
      setCompany("");
    }
  };

  const renderOptionLabel = option => {
    return option.name;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Relatório Geral</Title>
        <MainHeaderButtonsWrapper>
          <Autocomplete
            style={{ marginLeft: "10px" }}
            onChange={(e, newValue) => handleCompanyChange(e, newValue)}
            className={classes.root}
            options={companies}
            getOptionLabel={renderOptionLabel}
            renderInput={(params) =>
              <TextField
                {...params}
                label={"Empresas"}
                InputLabelProps={{ required: true}}
              />
            }
          />
          <TextField
              style={{ marginLeft: "10px" }}
              onChange={(e) => { setInitialDate(e.target.value) }}
              label={i18n.t("reports.form.initialDate")}
              InputLabelProps={{ shrink: true, required: true }}
              type="date"
          />
          <TextField
              style={{ marginLeft: "10px" }}
              onChange={(e) => { setFinalDate(e.target.value) }}
              label={i18n.t("reports.form.finalDate")}
              InputLabelProps={{ shrink: true, required: true }}
              type="date"
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
            onClick={ downloadPdf }
            disabled={ disableButton }
          >
            {i18n.t("reportsTicket.buttons.exportPdf")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{"Nome da Empresa"}</TableCell>
              <TableCell align="center">{"Importados"}</TableCell>
              <TableCell align="center">{"Enviados"}</TableCell>
              <TableCell align="center">{"Entregues"}</TableCell>
              <TableCell align="center">{"Lidos"}</TableCell>
              <TableCell align="center">{"Erros"}</TableCell>
              <TableCell align="center">{"Blacklist"}</TableCell>
              <TableCell align="center">{"Interações"}</TableCell>
              <TableCell align="center">{"Sem Whatsapp"}</TableCell>
              <TableCell align="center">{"Mensagens Trafegadas Enviadas"}</TableCell>
              <TableCell align="center">{"Mensagens Trafegadas Recebidas"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports.map((report) => (
                <TableRow key={report.companyId}>
                  <TableCell align="center">{report.company.name || ""}</TableCell>
                  <TableCell align="center">{report.total || 0}</TableCell>
                  <TableCell align="center">{report.sent || 0}</TableCell>
                  <TableCell align="center">{report.delivered || 0}</TableCell>
                  <TableCell align="center">{report.read || 0}</TableCell>
                  <TableCell align="center">{report.error || 0}</TableCell>
                  <TableCell align="center">{report.blacklist || 0}</TableCell>
                  <TableCell align="center">{report.interaction || 0}</TableCell>
                  <TableCell align="center">{report.noWhats || 0}</TableCell>
                  <TableCell align="center">{report.sentMessages || 0}</TableCell>
                  <TableCell align="center">{report.receivedMessages || 0}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell align="center">{"TOTAL"}</TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.total ? parseInt(report.total) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.sent ? parseInt(report.sent) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.delivered ? parseInt(report.delivered) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.read ? parseInt(report.read) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.error ? parseInt(report.error) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.blacklist ? parseInt(report.blacklist) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.interaction ? parseInt(report.interaction) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.noWhats ? parseInt(report.noWhats) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.sentMessages ? parseInt(report.sentMessages) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
                <TableCell align="center">
                  {reports && reports.reduce((accumulator, report) => {
                    const value = report.receivedMessages ? parseInt(report.receivedMessages) : 0;

                    return accumulator + value;
                  }, 0)}
                </TableCell>
              </TableRow>
              {loading && <TableRowSkeleton columns={10} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default GeneralReports;
