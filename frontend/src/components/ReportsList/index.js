import React from "react";
import { TableCell, TableRow } from "@material-ui/core";

const ReportsList = (props) => {

    const readFormat = (read) => {
        if (read === 0) {
            return "Não";
        } else if (read === 1) {
            return "Sim";
        }
    }

    return (
        reports.map(report => {
            <TableRow>
                <TableCell align="center">{report.messageId}</TableCell>
                <TableCell align="center">{report.messageBody}</TableCell>
                <TableCell align="center">{readFormat(report.read)}</TableCell>
                <TableCell align="center">{report.mediaURL}</TableCell>
                <TableCell align="center">{report.ticketID}</TableCell>
                <TableCell align="center">{report.date}</TableCell>
            </TableRow>
        })
    )
}

export default ReportsList;