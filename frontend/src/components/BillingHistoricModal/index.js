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
		const loadHistoric = () => {
			if (!billingsHistoric) return;

			const dates = [];
			const daily = [];

			for (const historic of billingsHistoric) {
				const date = format(parseISO(historic.fromDate), "dd/MM/yyyy");

				if (dates.indexOf(date) === -1) {
					dates.push(date);

					const triggerValue = historic.triggerFee * (historic.quantity - historic.usedGraceTriggers);
					const sentMessageValue = historic.sentMessageFee * historic.sentMessageQuantity;
					const receivedMessageValue = historic.receivedMessageFee * historic.receivedMessageQuantity;
					const inboundSessionValue = historic.inboundSessionFee * historic.inboundSessionQuantity;
					const outboundSessionValue = historic.outboundSessionFee * historic.outboundSessionQuantity;
					const extraTicketValue = historic.extraTicketFee * historic.extraTicketQuantity;

					const totalValue = triggerValue + sentMessageValue + receivedMessageValue + inboundSessionValue + outboundSessionValue + extraTicketValue;

					const info = {
						...historic,
						totalValue: totalValue,
						totalTrigger: historic.quantity,
						totalSentMessage: historic.sentMessageQuantity,
						totalReceivedMessage: historic.receivedMessageQuantity,
						totalGraceTriggers: historic.usedGraceTriggers,
						totalInboundSession: historic.inboundSessionQuantity,
						totalOutboundSession: historic.outboundSessionQuantity,
						totalExtraTickets: historic.extraTicketQuantity,
					}

					daily.push(info);
				} else {
					const index = dates.indexOf(date);

					const triggerValue = historic.triggerFee * (historic.quantity - historic.usedGraceTriggers);
					const sentMessageValue = historic.sentMessageFee * historic.sentMessageQuantity;
					const receivedMessageValue = historic.receivedMessageFee * historic.receivedMessageQuantity;
					const inboundSessionValue = historic.inboundSessionFee * historic.inboundSessionQuantity;
					const outboundSessionValue = historic.outboundSessionFee * historic.outboundSessionQuantity;
					const extraTicketValue = historic.extraTicketFee * historic.extraTicketQuantity;

					const totalValue = daily[index].totalValue + triggerValue + sentMessageValue + receivedMessageValue + inboundSessionValue + outboundSessionValue + extraTicketValue;

					const info = {
						...daily[index],
						totalValue: totalValue,
						totalTrigger: daily[index].totalTrigger + historic.quantity,
						totalSentMessage: daily[index].totalSentMessage + historic.sentMessageQuantity,
						totalReceivedMessage: daily[index].totalReceivedMessage + historic.receivedMessageQuantity,
						totalGraceTriggers: daily[index].totalGraceTriggers + historic.usedGraceTriggers,
						totalInboundSession: daily[index].totalInboundSession + historic.inboundSessionQuantity,
						totalOutboundSession: daily[index].totalOutboundSession + historic.outboundSessionQuantity,
						totalExtraTickets: daily[index].totalExtraTickets + historic.extraTicketQuantity,
					}

					daily[index] = info;
				}
			}

			setDailyBillings(daily);
		}

		loadHistoric();
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
        if (!quantity) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);

        let money = quantity.toFixed(2);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
    }

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
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
									<TableCell align="center">{"Mensagens Recebidas"}</TableCell>
									<TableCell align="center">{"Mensagens Enviadas"}</TableCell>
									<TableCell align="center">{"Sessão (Inbound)"}</TableCell>
									<TableCell align="center">{"Sessão (Outbound)"}</TableCell>
									<TableCell align="center">{"Tickets Extras"}</TableCell>	
								</TableRow>
							</TableHead>
							<TableBody>
								{ dailyBillings && dailyBillings.map((dailyBilling, index) => {
									return (
										<TableRow key={index}>
											<TableCell align="center">{formatDate(dailyBilling.fromDate)}</TableCell>
											<TableCell align="center">{formatToBRL(dailyBilling.totalValue)}</TableCell>
											<TableCell align="center">{dailyBilling.totalTrigger}</TableCell>
											<TableCell align="center">{dailyBilling.totalGraceTriggers}</TableCell>
											<TableCell align="center">{dailyBilling.totalReceivedMessage}</TableCell>
											<TableCell align="center">{dailyBilling.totalSentMessage}</TableCell>
											<TableCell align="center">{dailyBilling.totalInboundSession}</TableCell>
											<TableCell align="center">{dailyBilling.totalOutboundSession}</TableCell>
											<TableCell align="center">{dailyBilling.totalExtraTickets}</TableCell>	
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</TableContainer>
					{billing &&
						<pre>
							Mensalidade: {formatToBRL(billing.totalMonthValue)}
							<br />
							Disparos: {dailyBillings.reduce((accumulator, bill) => {
                    			const value = (bill.totalTrigger - bill.totalGraceTriggers);
                    			return accumulator + value;
                  			}, 0)} ({formatToBRL(billing.totalTriggerValue)}) 
							<br />
							Mensagens Recebidas: {dailyBillings.reduce((accumulator, bill) => {
                    			const value = (bill.totalReceivedMessage);
                    			return accumulator + value;
                  			}, 0)} ({formatToBRL(billing.totalReceivedMessageValue)}) 
							<br />
							Mensagens Enviadas: {dailyBillings.reduce((accumulator, bill) => {
                    			const value = (bill.totalSentMessage);
                    			return accumulator + value;
                  			}, 0)} ({formatToBRL(billing.totalSentMessageValue)})
							<br />
							Usuários Extras: {formatToBRL(billing.totalExtraUserValue)}
							<br />
							Whatsapps: {formatToBRL(billing.totalConnectedWhatsappsValue)}
							<br />
							<br />
							Total: {formatToBRL(billing.totalValue)}
						</pre>
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
