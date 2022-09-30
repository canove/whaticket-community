import React, { useState, useEffect, useContext, } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";

import OndemandVideoIcon from '@material-ui/icons/OndemandVideo';
import DescriptionIcon from '@material-ui/icons/Description';

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
        display: "flex",
        marginTop: 10,
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},

	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

const TemplateTable = ({ body }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

    const [bodyObject, setBodyObject] = useState(null);

    useEffect(() => {
        setBodyObject(JSON.parse(body))
    }, [body])

    const Body = ({ body }) => {  
        const value = body.value;
  
        if (body.type === "text") {
            return <TableCell align="center">{value}</TableCell>;
        }
  
        if (body.type === "contact") {
            return <TableCell align="center">{body.name}: {value}</TableCell>;
        }
  
        if (body.type === "image") {
            if (typeof value !== 'string') {
                return <TableCell align="center">{value.name}</TableCell>;
            } else {
                return <TableCell align="center"><img style={{display: "block", margin: "auto", maxWidth: "100px"}} src={value} /></TableCell>
            }
        }
  
        if (body.type === "video") {
            if (typeof value !== 'string') {
                return <TableCell align="center">{value.name}</TableCell>;
            } else {
                return <TableCell align="center"><a style={{display: "block", margin: "auto"}} href={value} target='_blank'><OndemandVideoIcon fontSize="large"/></a></TableCell>;
            }
        }
  
        if (body.type === "audio") {
            if (typeof value !== 'string') {
                return <TableCell align="center">{value.name}</TableCell>;
            } else {
                return <TableCell align="center"><audio controls><source src={value} type="audio/ogg"></source></audio></TableCell>;
            }
        }
  
        if (body.type === "file") {
            if (typeof value !== 'string') {
                return <TableCell align="center">{value.name}</TableCell>
            } else {
                return <TableCell align="center"><a style={{display: "block", margin: "auto"}} href={value} target='_blank'><DescriptionIcon fontSize="large"/></a></TableCell>;
            }
        }
  
        return "";
      }

	return (
		<TableContainer component={Paper}>
            { body && 
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Ordem</TableCell>
                            <TableCell align="center">Tipo</TableCell>
                            <TableCell align="center">Valor</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { bodyObject && bodyObject.map((item, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{item.type}</TableCell>
                                    <Body body={item} />
                                </TableRow>
                              );
                        }) }
                    </TableBody>
                </Table>
            }      
		</TableContainer>
	);
};

export default TemplateTable;