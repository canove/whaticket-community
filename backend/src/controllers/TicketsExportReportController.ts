import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Message from "../database/models/Message";

var fs = require("fs");
var pdf = require("pdf-creator-node");
var pdf2base64 = require('pdf-to-base64');

type IndexQuery = {
    ticketId: Number;
}

export const index = async (req: Request, res: Response) => {
    const { ticketId } = req.query as unknown as IndexQuery;

    const reports = await Message.sequelize?.query(`
        select
            msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.read
        from
            whaticket.Messages as msg
        inner join
            whaticket.Tickets as ticket
        on
            msg.ticketId = ticket.id
        where
            ticket.id = ${ticketId}
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
            <h2>Ticket ID: ${ticketId}</h2>
            <table style="border: 1px solid black; border-collapse: collapse;">
                <thead>
                    <tr>
                        <td style="border: 1px solid black">ID</td>
                        <td style="border: 1px solid black">Body</td>
                        <td style="border: 1px solid black">Media URL</td>
                        <td style="border: 1px solid black">Created At</td>
                        <td style="border: 1px solid black">Read</td>
                    <tr>
                </thead>
                <tbody>
                    {{#each reports}}
                    <tr>
                        <td style="border: 1px solid black">{{this.id}}</td>
                        <td style="border: 1px solid black">{{this.body}}</td>
                        <td style="border: 1px solid black">{{this.mediaUrl}}</td>
                        <td style="border: 1px solid black">{{this.createdAt}}</td>
                        <td style="border: 1px solid black">{{this.read}}</td>
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
