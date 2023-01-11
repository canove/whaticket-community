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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/officialWhatsappReports", {
          params: { pageNumber, limit: "10" }
        });
        setReports(data.reports);
        setCount(data.count);
      } catch (err) {
        toastError(err);
      }
    };

    fetchReports();
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

    let reports = []

    try {
      const { data } = await api.get("/officialWhatsappReports", {
        params: { pageNumber, limit: "-1" }
      });

      reports = data.reports;
    } catch (err) {
      toastError(err);
      setCreatingXLSX(false);
      return;
    }

    reports.forEach(report => {
      const row = [
        report.msgWhatsId,
        report.whatsapp.name,
        report.phoneNumber,
        "MOBILE",
        format(parseISO(report.createdAt), "dd/MM/yy HH:mm"),
        format(parseISO(report.updatedAt), "dd/MM/yy HH:mm"),
        report.id,
        getStatus(report),
        "direction",
        "session",
        report.messageData.body,
        format(parseISO(report.messageData.createdAt), "dd/MM/yy HH:mm"),
        format(parseISO(report.messageData.updatedAt), "dd/MM/yy HH:mm"),
        report.messageData.mediaType,
        report.messageData.mediaUrl,
        report.var1,
        report.var2,
        report.var3,
        report.var4,
        report.var5
      ]

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

    saveAs(new Blob([buf], { type: "application/octet-stream" }), "report.xlsx");

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

  const getStatus = (report) => {
    if (report.errorAt) return "FAILED";
    if (report.sentAt) return "SENT";
    if (report.deliveredAt) return "DELIVERED";
    if (report.readAt) return "READ";

    return "";
  };

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
            {/*
                "msgWhatsId":"wamid.HBgMNTU0MTk4ODg2MzE5FQIAERgSODI4NjE4QkVBNUU1ODhEMEEyAA==",         # id_session
                "var1":null,                                                                           # wallet_number / wallet / job_id / contaCartao
                "var2":"",                                                                             # wallet_number / wallet / job_id / contaCartao
                "var3":"",                                                                             # wallet_number / wallet / job_id / contaCartao
                "var4":"",                                                                             # wallet_number / wallet / job_id / contaCartao
                "var5":"",                                                                             # wallet_number / wallet / job_id / contaCartao
                "whatsappId":999,
                "phoneNumber":"41998886319",                                                           # client_phone_number
                "createdAt":"2022-12-19T15:01:21.000Z",                                                # create_at_session
                "updatedAt":"2022-12-19T15:01:21.000Z",                                                # update_at_session
                "id":1,                                                                                # external_id
                "readAt":"2022-12-19T15:01:21.000Z",                                                   # status: read
                "deliveredAt":"2022-12-19T15:01:21.000Z",                                              # status: delivered
                "sentAt":"2022-12-19T15:01:21.000Z",                                                   # status: sent
                "errorAt":null,                                                                        # status: failed
                "whatsapp.name":"5511965577444",                                                       # phone_number
                "messageData.body":"Olá {{name}}, aqui é a Tati da Tricard.",                          # content
                "messageData.createdAt":"2022-12-20T17:09:30.267Z",                                    # create_at_message
                "messageData.updatedAt":"2022-12-16T17:09:30.267Z",                                    # update_at_message
                "messageData.mediaType":null,                                                          # type
                "messageData.mediaUrl":null,                                                           # media_link
                "messageData.ticketId":5
            */}
            <>
              {reports &&
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell align="center">{report.msgWhatsId}</TableCell>
                    <TableCell align="center">{report.whatsapp.name}</TableCell>
                    <TableCell align="center">{report.phoneNumber}</TableCell>
                    <TableCell align="center">{"MOBILE"}</TableCell>
                    <TableCell align="center">
                      {format(parseISO(report.createdAt), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell align="center">
                      {format(parseISO(report.updatedAt), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell align="center">{report.id}</TableCell>
                    <TableCell align="center">{getStatus(report)}</TableCell>
                    <TableCell align="center">{"direction"}</TableCell>
                    <TableCell align="center">{"session"}</TableCell>
                    <TableCell align="center">
                      {report.messageData.body}
                    </TableCell>
                    <TableCell align="center">
                      {format(
                        parseISO(report.messageData.createdAt),
                        "dd/MM/yy HH:mm"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {format(
                        parseISO(report.messageData.updatedAt),
                        "dd/MM/yy HH:mm"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {report.messageData.mediaType}
                    </TableCell>
                    <TableCell align="center">
                      {report.messageData.mediaUrl}
                    </TableCell>
                    <TableCell align="center">{report.var1}</TableCell>
                    <TableCell align="center">{report.var2}</TableCell>
                    <TableCell align="center">{report.var3}</TableCell>
                    <TableCell align="center">{report.var4}</TableCell>
                    <TableCell align="center">{report.var5}</TableCell>
                  </TableRow>
                ))}
              {/* {loading && <TableRowSkeleton columns={4} />} */}
            </>
          </TableBody>
        </Table>
        <div
					style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}
				>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber - 1) }}
						disabled={ pageNumber === 1}
					>
						{i18n.t("officialConnections.previousPage")}
					</Button>
					<Typography
						style={{ display: "inline-block", fontSize: "1.25rem" }}
					>
						{ pageNumber } / { Math.ceil(count / 10) }
					</Typography>
					<Button
						variant="outlined"
						onClick={() => { setPageNumber(prevPageNumber => prevPageNumber + 1) }}
						disabled={ pageNumber >= Math.ceil(count / 10) }
					>
						{i18n.t("officialConnections.nextPage")}
					</Button>
				</div>
      </Paper>
    </MainContainer>
  );
};

export default OfficialWhatsappReport;
