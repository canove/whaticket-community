import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton
} from '@material-ui/core';
import {
    Edit as EditIcon,
    DeleteOutline as DeleteOutlineIcon
} from "@material-ui/icons";

import TableRowSkeleton from "../../components/TableRowSkeleton";

function QuickMessagesTable(props) {
    const { messages, showLoading, editMessage, deleteMessage, readOnly } = props
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([])

    useEffect(() => {
        if (Array.isArray(messages)) {
            setRows(messages)
        }
        if (showLoading !== undefined) {
            setLoading(showLoading)    
        }
    }, [messages, showLoading])

    const handleEdit = (message) => {
        editMessage(message)
    }

    const handleDelete = (message) => {
        deleteMessage(message)
    }

    const renderRows = () => {
        return rows.map((message) => {
            return (
                <TableRow key={message.id}>
                    <TableCell align="center">{message.shortcode}</TableCell>
                    <TableCell align="left">{message.message}</TableCell>
                    { !readOnly ? (
                        <TableCell align="center">
                            <IconButton
                                size="small"
                                onClick={() => handleEdit(message)}
                            >
                                <EditIcon />
                            </IconButton>

                            <IconButton
                                size="small"
                                onClick={() => handleDelete(message)}
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </TableCell>
                    ) : null}
                </TableRow>
            )
        })
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell align="center">Atalho</TableCell>
                    <TableCell align="left">Mensagem</TableCell>
                    { !readOnly ? (
                        <TableCell align="center">Ações</TableCell>
                    ) : null}
                </TableRow>
            </TableHead>
            <TableBody>
                {loading ? <TableRowSkeleton columns={readOnly ? 2 : 3} /> : renderRows()}
            </TableBody>
        </Table>
    )
}

QuickMessagesTable.propTypes = {
    messages: PropTypes.array.isRequired,
    showLoading: PropTypes.bool,
    editMessage: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired
}

export default QuickMessagesTable;