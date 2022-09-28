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
	Paper,
	Typography,
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { format, parseISO } from "date-fns";


const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
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
	paper: {
		flex: 1,
		padding: theme.spacing(2),
		marginBottom: 15,
		marginRight: 15,
		marginLeft: 15,
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	main: {
		display: "flex",
	},
}));

const SystemChangeJSONModal = ({ open, onClose, historic }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [updatedJSON, setUpdatedJSON] = useState(null);
	const [currentJSON, setCurrentJSON] = useState(null);

	useEffect(() => {
		if (historic) {
			setUpdatedJSON(JSON.parse(historic.updatedJSON));
			if (historic.currentJSON) {
				setCurrentJSON(JSON.parse(historic.currentJSON));
			}
		}
	}, [open, historic])

	const handleClose = () => {
		onClose();
		setUpdatedJSON(null);
		setCurrentJSON(null);
	};

	const formatDate = (date) => {
        if (date) {
            return format(parseISO(date), "dd/MM/yyyy HH:mm");
        }

        return date;
    }

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="lg"
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ historic && `${historic.user.name} - ${formatDate(historic.createdAt)}` }
				</DialogTitle>
				<DialogContent dividers>
					<div className={classes.main}>
							{ updatedJSON && 
								<Paper className={classes.paper} variant="outlined">
									<Typography>Updated:</Typography>
									<div className={classes.item}>
										<pre>
											{ JSON.stringify(updatedJSON, null, 2) }
										</pre>
									</div>
								</Paper>
							}
							{ currentJSON && 
								<Paper className={classes.paper} variant="outlined">
									<Typography>Current:</Typography>
									<div className={classes.item}>
										<pre>
											{ JSON.stringify(currentJSON, null, 2) }
										</pre>
									</div>
								</Paper>
							}
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						Fechar
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default SystemChangeJSONModal;
