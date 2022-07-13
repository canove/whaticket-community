import React from "react";
import { TableCell, TableRow } from "@material-ui/core";

const ReportsList = (props) => {
    const reports = [{
        messageId: "3A8B598BA08CDF62A7F1",
        messageBody: "1657643375820.jpeg",
        read: 1,
        mediaURL: "1657643375820.jpeg",
        ticketID: 6,
        initialDate: "2022-07-12 13:29:35.892000",
        finalDate: "2022-07-12 13:35:36.977000",
    },
    {
        messageId: "D5CAF3E2DFEDCC27491FD8B4F8E63C9D",
        messageBody: "Manda msg pra mim testar aqui 🥹",
        read: 0,
        mediaURL: null,
        ticketID: 5,
        initialDate: "2022-07-12 12:33:15.818000",
        finalDate: "2022-07-12 12:34:21.380000",
    }];

    const readFormat = (read) => {
        if (read === 0) {
            return "Não";
        } else if (read === 1) {
            return "Sim";
        }
    }
    
    const dateFormat = (date, hour = true) => {
        if (hour) {
                        //DAY               //MONTH             //YEAR              //HOUR+MINUTE
            return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)} - ${date.slice(11, 16)}`;
        } else {
            return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}}`;
        }     
    }

    const filtrar = (report) => {
        let initialDateForm = dateFormat(props.initialDate, false);
        let finalDateForm = dateFormat(props.finalDate, false);

        let initialDateMessage = dateFormat(report.initialDate, false);
        let finalDateMessage = dateFormat(report.finalDate, false);

        if (initialDateMessage === initialDateForm && finalDateMessage === finalDateForm) {
            return (
                <TableRow>
                    <TableCell align="center">{report.messageId}</TableCell>
                    <TableCell align="center">{report.messageBody}</TableCell>
                    <TableCell align="center">{readFormat(report.read)}</TableCell>
                    <TableCell align="center">{report.mediaURL}</TableCell>
                    <TableCell align="center">{report.ticketID}</TableCell>
                    <TableCell align="center">{dateFormat(report.initialDate)}</TableCell>
                    <TableCell align="center">{dateFormat(report.finalDate)}</TableCell>
                </TableRow>
            )
        }
    }

    return (
        reports.map(report => { return filtrar(report) })
    )
}

export default ReportsList;