import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
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

const TemplateButtonsTable = ({ buttons }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const getButtonInfo = (button) => {
		if (button.type === "quickReplyButton") return button.buttonId;
		if (button.type === "callButton") return button.phoneNumber;
		if (button.type === "urlButton") return button.url;

		return "";
	}

	return (
		<TableContainer component={Paper} className={classes.root}>
            { buttons &&
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{i18n.t("templatesData.grid.buttons")}</TableCell>
							<TableCell align="center">{"Tipo"}</TableCell>
							<TableCell align="center">{"Extra"}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { buttons && buttons.map((button) => {
                            return (
                                <TableRow key={button.id}>
                                    <TableCell align="center">{button.text}</TableCell>
									<TableCell align="center">{button.type}</TableCell>
									<TableCell align="center">{getButtonInfo(button)}</TableCell>
                                </TableRow>
                              );
                        }) }
                    </TableBody>
                </Table>
            }
		</TableContainer>
	);
};

export default TemplateButtonsTable;