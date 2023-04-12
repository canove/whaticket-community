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

const CategoryReport = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const [name, setName] = useState("");
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");

  const [pdf, setPDF] = useState("");
  const [creatingPDF, setCreatingPDF] = useState(false);

  const [csv, setCSV] = useState("");
  const [creatingCSV, setCreatingCSV] = useState(false);

  const filterReports = async () => {
    setPDF("");
    setCSV("");

    await fetchReports();
  }

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/category/count", {
        params: { name, initialDate, finalDate }
      });
      setReports(data);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const createPDF = async () => {
    try {
      const { data } = await api.get('/category/exportPDF', {
        params: { name, initialDate, finalDate }
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
      const { data } = await api.get('/category/exportCSV', {
        params: { name, initialDate, finalDate }
      });
    
      setCSV(data);
      return data;
    } catch (err) {
      toastError(err);
    }

    return null;
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

    const encodedUri = encodeURI(newCSV ? newCSV : csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);

    link.click();
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("categoryReport.title")}</Title>
        <MainHeaderButtonsWrapper>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <TextField
              style={{ marginLeft: "8px" }}
              placeholder={i18n.t("categoryReport.table.name")}
              type="search"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              style={{ marginLeft: "8px" }}
              onChange={(e) => { setInitialDate(e.target.value) }}
              label={i18n.t("extra.initialDate")}
              InputLabelProps={{ shrink: true, required: true }}
              type="date"
              value={initialDate}
            />
            <TextField
              style={{ marginLeft: "8px" }}
              onChange={(e) => { setFinalDate(e.target.value) }}
              label={i18n.t("extra.finalDate")}
              InputLabelProps={{ shrink: true, required: true }}
              type="date"
              value={finalDate}
            />
            <Button
              style={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={ filterReports }
            >
              {i18n.t("extra.filter")}
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={downloadPDF}
              disabled={creatingPDF}
            >
              {i18n.t("extra.exportPDF")}
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={downloadCSV}
              disabled={creatingCSV}
            >
              {i18n.t("extra.exportCSV")}
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("categoryReport.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("categoryReport.table.quantity")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell align="center">{report.name}</TableCell>
                  <TableCell align="center">{report.ticketCount}</TableCell>
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

export default CategoryReport;
