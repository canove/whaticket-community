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
import XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Typography } from "@material-ui/core";

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

const OfficialWhatsappReport = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  const [reports, setReports] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [count, setCount] = useState(0);
  const [creatingXLSX, setCreatingXLSX] = useState(false);
  const [loading, setLoading] = useState(false);

  const filterReports = async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/officialWhatsappReports", {
        params: { pageNumber, limit: "10" },
      });
      setReports(data.reports);
      setCount(data.count);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (count > 0) filterReports();
  }, [pageNumber]);

  const createExcel = async () => {
    setCreatingXLSX(true);

    let wb = XLSX.utils.book_new();

    wb.Props = {
      Title: "XLSX Report",
      Subject: "Report",
      Author: "BITS",
      CreatedDate: new Date(),
    };

    wb.SheetNames.push("Report Sheet");

    let ws_data = [
      [
        "id_session",
        "phone_number",
        "client_phone_number",
        "destination_number_type",
        "create_at_session",
        "update_at_session",
        "external_id",
        "status",
        "direction",
        "session",
        "content",
        "create_at_message",
        "update_at_message",
        "type",
        "media_link",
        "var1",
        "var2",
        "var3",
        "var4",
        "var5",
      ],
    ];

    let reports = [];

    try {
      const { data } = await api.get("/officialWhatsappReports", {
        params: { pageNumber, limit: "-1" },
      });

      reports = data.reports;
    } catch (err) {
      toastError(err);
      setCreatingXLSX(false);
      return;
    }

    reports.forEach((report) => {
      const create_at_session = report.create_at_session
        ? format(parseISO(report.create_at_session), "dd/MM/yy HH:mm")
        : "";
      const update_at_session = report.update_at_session
        ? format(parseISO(report.update_at_session), "dd/MM/yy HH:mm")
        : "";

      const create_at_message = report.create_at_message
        ? format(parseISO(report.create_at_message), "dd/MM/yy HH:mm")
        : "";
      const update_at_message = report.update_at_message
        ? format(parseISO(report.update_at_message), "dd/MM/yy HH:mm")
        : "";

      const row = [
        report.id_session,
        report.phone_number,
        report.client_phone_number,
        report.destination_number_type,
        create_at_session,
        update_at_session,
        report.external_id,
        report.status,
        report.direction,
        report.session,
        report.content,
        create_at_message,
        update_at_message,
        report.type,
        report.media_link,
        report.var1,
        report.var2,
        report.var3,
        report.var4,
        report.var5,
      ];

      ws_data.push(row);
    });

    let ws = XLSX.utils.aoa_to_sheet(ws_data);

    wb.Sheets["Report Sheet"] = ws;

    let wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    exportExcel(wbout);
  };

  const exportExcel = (s) => {
    let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    let view = new Uint8Array(buf); //create uint8array as viewer

    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet

    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      "report.xlsx"
    );

    setCreatingXLSX(false);
  };

  // const [loading, setLoading] = useState(false);
  // const [reports, setReports] = useState([]);
  // const [tickets, setTickets] = useState([]);
  // const [ticketId, setTicketId] = useState();
  // const [disableButton, setDisableButton] = useState(true);
  // const [pdf, setPdf] = useState();

  // const filterReports = async () => {
  //   setDisableButton(true);
  //   await fetchReports(ticketId);
  //   await createPdf();
  //   setDisableButton(false);
  // }

  // const createPdf = async () => {
  //   if (!ticketId) {
  //     toast.error(i18n.t("reportsTicket.errors.toastErr"));
  //   } else {
  //     try {
  //       const { data } = await api.get(`/tickets-export-report?ticketId=${ticketId}`);
  //       setPdf(data);
  //     } catch (err) {
  //       toastError(err)
  //     }
  //   }
  // }

  // const downloadPdf = () => {
  //   const linkSource = `data:application/pdf;base64,${pdf}`;
  //   const downloadLink = document.createElement("a");
  //   const fileName = `report.pdf`;
  //   downloadLink.href = linkSource;
  //   downloadLink.download = fileName;
  //   downloadLink.click();
  // }

  // useEffect(() => {
  //   setLoading(true);
  //   const delayDebounceFn = setTimeout(() => {
  //     const fetchTickets = async () => {
  //       try {
  //         const { data } = await api.get("/tickets")
  //         setTickets(data.tickets)
  //         setLoading(false)
  //       } catch (err) {
  //         setLoading(false)
  //         toastError(err)
  //       }
  //     }
  //     fetchTickets()
  //   }, 500)
  //   return () => clearTimeout(delayDebounceFn)
  // }, [])

  // const fetchReports = async (ticketId) => {
  //   if (!ticketId) {
  //     toast.error(i18n.t("reportsTicket.errors.toastErr"));
  //   } else {
  //     try {
  //       setLoading(true);
  //       const { data } = await api.get(`tickets-report?ticketId=${ticketId}`);
  //       setReports(data);
  //       setLoading(false);
  //     } catch (err) {
  //       toastError(err);
  //     }
  //   }
  // };

  // const handleSelectOption = (e, newValue) => {
  //   setTicketId(newValue);
  // };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Relatório de Whatsapp Oficial</Title>
        <MainHeaderButtonsWrapper>
          {/* <Autocomplete
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
            onClick={ downloadPdf }
            disabled={ disableButton }
          >
            {i18n.t("reportsTicket.buttons.exportPdf")}
          </Button> */}
          <Button
            variant="contained"
            color="primary"
            onClick={filterReports}
            disabled={loading}
          >
            Filtrar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={createExcel}
            disabled={creatingXLSX}
          >
            Exportar XLSX
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">id_session</TableCell>
              <TableCell align="center">phone_number</TableCell>
              <TableCell align="center">client_phone_number</TableCell>
              <TableCell align="center">destination_number_type</TableCell>
              <TableCell align="center">create_at_session</TableCell>
              <TableCell align="center">update_at_session</TableCell>
              <TableCell align="center">external_id</TableCell>
              <TableCell align="center">status</TableCell>
              <TableCell align="center">direction</TableCell>
              <TableCell align="center">session</TableCell>
              <TableCell align="center">content</TableCell>
              <TableCell align="center">create_at_message</TableCell>
              <TableCell align="center">update_at_message</TableCell>
              <TableCell align="center">type</TableCell>
              <TableCell align="center">media_link</TableCell>
              <TableCell align="center">var1</TableCell>
              <TableCell align="center">var2</TableCell>
              <TableCell align="center">var3</TableCell>
              <TableCell align="center">var4</TableCell>
              <TableCell align="center">var5</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {reports &&
                reports.map((report) => (
                  <TableRow key={report.id_session}>
                    <TableCell align="center">{report.id_session}</TableCell>
                    <TableCell align="center">{report.phone_number}</TableCell>
                    <TableCell align="center">
                      {report.client_phone_number}
                    </TableCell>
                    <TableCell align="center">
                      {report.destination_number_type}
                    </TableCell>
                    <TableCell align="center">
                      {report.create_at_session
                        ? format(
                            parseISO(report.create_at_session),
                            "dd/MM/yy HH:mm"
                          )
                        : ""}
                    </TableCell>
                    <TableCell align="center">
                      {report.update_at_session
                        ? format(
                            parseISO(report.update_at_session),
                            "dd/MM/yy HH:mm"
                          )
                        : ""}
                    </TableCell>
                    <TableCell align="center">{report.external_id}</TableCell>
                    <TableCell align="center">{report.status}</TableCell>
                    <TableCell align="center">{report.direction}</TableCell>
                    <TableCell align="center">{report.session}</TableCell>
                    <TableCell align="center">{report.content}</TableCell>
                    <TableCell align="center">
                      {report.create_at_message
                        ? format(
                            parseISO(report.create_at_message),
                            "dd/MM/yy HH:mm"
                          )
                        : ""}
                    </TableCell>
                    <TableCell align="center">
                      {report.update_at_message
                        ? format(
                            parseISO(report.update_at_message),
                            "dd/MM/yy HH:mm"
                          )
                        : ""}
                    </TableCell>
                    <TableCell align="center">{report.type}</TableCell>
                    <TableCell align="center">{report.media_link}</TableCell>
                    <TableCell align="center">{report.var1}</TableCell>
                    <TableCell align="center">{report.var2}</TableCell>
                    <TableCell align="center">{report.var3}</TableCell>
                    <TableCell align="center">{report.var4}</TableCell>
                    <TableCell align="center">{report.var5}</TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton columns={20} />}
            </>
          </TableBody>
        </Table>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "1rem",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setPageNumber((prevPageNumber) => prevPageNumber - 1);
            }}
            disabled={pageNumber === 1}
          >
            {i18n.t("officialConnections.previousPage")}
          </Button>
          <Typography style={{ display: "inline-block", fontSize: "1.25rem" }}>
            {pageNumber} / {Math.ceil(count / 10)}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setPageNumber((prevPageNumber) => prevPageNumber + 1);
            }}
            disabled={pageNumber >= Math.ceil(count / 10)}
          >
            {i18n.t("officialConnections.nextPage")}
          </Button>
        </div>
      </Paper>
    </MainContainer>
  );
};

export default OfficialWhatsappReport;
