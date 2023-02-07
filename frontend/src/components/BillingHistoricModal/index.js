import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TableBody,
	Table,
	TableHead,
	TableRow,
	TableCell,
	Typography,
	TableContainer,
	Paper,
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

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
	const [billing, setBilling] = useState(null);
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

		const fetchBilling = async () => {
			try {
				const { data } = await api.get(`/billings/${billingId}`);
				setBilling(data);
			} catch (err) {
				toastError(err);
			}
		}

		if (billingId) {
			fetchBillingsHistoric();
			fetchBilling();
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
					totalValue: historic.triggerFee * (historic.quantity - historic.usedGraceTriggers),
					totalTrigger: historic.quantity,
					totalGraceTriggers: historic.usedGraceTriggers
				})
			} else {
				const index = dates.indexOf(date);
				daily[index] = {
					...daily[index],
					totalValue: daily[index].totalValue + (historic.triggerFee * (historic.quantity - historic.usedGraceTriggers)),
					totalTrigger: daily[index].totalTrigger + historic.quantity,
					totalGraceTriggers: daily[index].totalGraceTriggers + historic.usedGraceTriggers
				}
			}
		})

		setDailyBillings(daily);
	}, [billingsHistoric])

	const handleClose = () => {
		onClose();
		setBillingHistoric([]);
		setBilling(null);
	};

	const formatDate = (date) => {
        if (date) {
            return format(parseISO(date), "dd/MM/yyyy");
        }

        return date;
    }

	const formatToBRL = (quantity) => {
        let money = quantity.toFixed(2);

        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
    }

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{i18n.t("payments.modal.title")}
				</DialogTitle>
				<DialogContent dividers>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell align="center">{i18n.t("payments.modal.date")}</TableCell>
									<TableCell align="center">{i18n.t("payments.modal.value")}</TableCell>
									<TableCell align="center">{i18n.t("payments.modal.shots")}</TableCell>
									<TableCell align="center">{i18n.t("payments.modal.freeShots")}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{ dailyBillings && dailyBillings.map((dailyBilling, index) => {
									return (
										<TableRow key={index}>
											<TableCell align="center">{formatDate(dailyBilling.createdAt)}</TableCell>
											<TableCell align="center">{formatToBRL(dailyBilling.totalValue)}</TableCell>
											<TableCell align="center">{dailyBilling.totalTrigger}</TableCell>
											<TableCell align="center">{dailyBilling.totalGraceTriggers}</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</TableContainer>
					{billing &&
						<>
							<Typography style={{ marginTop: "10px" }}>Total: {formatToBRL(billing.totalTriggerValue)} [Disparos] + {formatToBRL(billing.totalMonthValue)} [Mensalidade]</Typography>
							<Typography>Total: {formatToBRL(billing.totalTriggerValue + billing.totalMonthValue)}</Typography>
						</>
					}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("payments.modal.closed")}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default BillingHistoricModal;
