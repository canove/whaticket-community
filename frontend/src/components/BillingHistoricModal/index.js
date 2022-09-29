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
	TableBody,
	Table,
	TableHead,
	TableRow,
	TableCell,
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
}));

const BillingHistoricModal = ({ open, onClose, billingId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [billingsHistoric, setBillingHistoric] = useState([]);
	const [dailyBillings, setDailyBillings] = useState([]);

	useEffect(() => {
		const fetchBillingsHistoric = async () => {
			try {
				const { data } = await api.get(`/billingControls/${billingId}`);
				setBillingHistoric(data);
			} catch (err) {
				toastError(err);
			}
		}

		if (billingId) {
			fetchBillingsHistoric();
		}
	}, [open, billingId])

	useEffect(() => {
		const dates = [];
		const daily = [];
		billingsHistoric.forEach(historic => {
			const date = format(parseISO(historic.createdAt), "dd/MM/yyyy");
			if (dates.indexOf(date) === -1) {
				dates.push(date);
				daily.push({
					...historic, 
					totalValue: historic.triggerFee * historic.quantity,
					totalTrigger: historic.quantity
				})
			} else {
				const index = dates.indexOf(date);
				daily[index] = { 
					...daily[index], 
					totalValue: daily[index].totalValue + (historic.triggerFee * historic.quantity),
					totalTrigger: daily[index].totalTrigger + historic.quantity
				}
			}
		})
		setDailyBillings(daily);
	}, [billingsHistoric])

	const handleClose = () => {
		onClose();
	};

	const formatDate = (date) => {
        if (date) {
            return format(parseISO(date), "dd/MM/yyyy");
        }

        return date;
    }

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					Historico do Preço
				</DialogTitle>
				<DialogContent dividers>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell align="center">Data</TableCell>
								<TableCell align="center">Valor</TableCell>
								<TableCell align="center">Disparos</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{ dailyBillings && dailyBillings.map((dailyBilling, index) => {
								return (
									<TableRow key={index}>
										<TableCell align="center">{formatDate(dailyBilling.createdAt)}</TableCell>
										<TableCell align="center">{dailyBilling.totalValue}</TableCell>
										<TableCell align="center">{dailyBilling.totalTrigger}</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
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

export default BillingHistoricModal;
