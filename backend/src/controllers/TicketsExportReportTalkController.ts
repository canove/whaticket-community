import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Message from "../models/Message";

var fs = require("fs");
var pdf = require("pdf-creator-node");
var pdf2base64 = require('pdf-to-base64');

type IndexQuery = {
    userId: Number;
    initialDate: string;
    finalDate: string;
}

export const index = async (req: Request, res: Response) => {
    const { userId="", initialDate="", finalDate="" } = req.query as unknown as IndexQuery;

    const reports = await Message.sequelize?.query(`
        select 
	        msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.read
        from 
	        whaticket.Messages as msg
        inner join 
	        whaticket.Tickets as tickets on msg.ticketId = tickets.id
        where 
	        tickets.userId = ${userId}
        and 
            msg.createdAt >= '${initialDate} dd/MM/yy HH:mm'
        and 
	        msg.createdAt <= '${finalDate} dd/MM/yy HH:mm'
    `,
    { type: QueryTypes.SELECT }
    );

    var html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>PDF - Ticket Report</title>
        </head>
        <body>
            <h1>Tickets Report</h1>
            <h2>User ID: ${userId}</h2>
            <h2>Initial Date: ${initialDate}</h2>
            <h2>Final Date: ${finalDate}</h2>
            <table style="border: 1px solid black; border-collapse: collapse;">
                <thead>
                    <tr>
                        <td style="border: 1px solid black">ID</td>
                        <td style="border: 1px solid black">Body</td>
                        <td style="border: 1px solid black">Read</td>
                        <td style="border: 1px solid black">Media URL</td>
                        <td style="border: 1px solid black">Ticket ID</td>
                        <td style="border: 1px solid black">Created At</td>
                    <tr>
                </thead>
                <tbody>
                    {{#each reports}}
                    <tr>
                        <td style="border: 1px solid black">{{this.id}}</td>
                        <td style="border: 1px solid black">{{this.body}}</td>
                        <td style="border: 1px solid black">{{this.read}}</td>
                        <td style="border: 1px solid black">{{this.mediaUrl}}</td>
                        <td style="border: 1px solid black">{{this.ticketId}}</td>
                        <td style="border: 1px solid black">{{this.createdAt}}</td>
                    <tr>
                    {{/each}}
                </tbody>
            </table>
        </body>
        </html>
    `;

    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        footer: {
            height: "28mm",
            contents: {
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
            }
        }
    };

    var documento = {
        html: html,
        data: {
          reports: reports,
        },
        path: "./src/downloads/output.pdf",
        type: "",
    };

    await pdf.create(documento, options);

    pdf2base64("./src/downloads/output.pdf").then((pdfBase: Response) => {
        return res.status(200).json(pdfBase);
    })

    fs.unlink('./src/downloads/output.pdf', (err: Error) => {
        if (err) {
            throw err;
        }
    });

}
