import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
  } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import IntlCurrencyInput from "react-intl-currency-input"

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

const ProductModal = ({ open, onClose, productId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [name, setName] = useState("");
	const [monthlyFee, setMonthlyFee] = useState(0.0);
	const [triggerFee, setTriggerFee] = useState(0.0);
	const [monthlyInterestRate, setMonthlyInterestRate] = useState(0.0);
	const [penaltyMount, setPenaltyMount] = useState(0.0);
	const [receivedMessageFee, setReceivedMessageFee] = useState(0.0); 
	const [sentMessageFee, setSentMessageFee] = useState(0.0);
	
	const handleClose = () => {
		setName("");
		setMonthlyFee(0.0);
		setTriggerFee(0.0);
		setMonthlyInterestRate(0.0);
		setPenaltyMount(0.0);
		setReceivedMessageFee(0.0);
		setSentMessageFee(0.0);
		onClose();
	};

	const handleNameChange = (e) =>{
		setName(e.target.value);
	};

	const handleMonthyFee = (e, value) =>{
		e.preventDefault();
		setMonthlyFee(value);
	};

	const handleTriggerFee = (e, value) =>{
		e.preventDefault();
		setTriggerFee(value);
	};

	const handleMonthlyInterestRate = (e, value) =>{
		e.preventDefault();
		setMonthlyInterestRate(value);
	};

	const handlePenaltyMount = (e, value) =>{
		e.preventDefault();
		setPenaltyMount(value);
	};

	const handleReceivedMessageFee = (e, value) =>{
		e.preventDefault();
		setReceivedMessageFee(value);
	};

	const handleSentMessageFee = (e, value) =>{
		e.preventDefault();
		setSentMessageFee(value);
	};

	useEffect(() => {
		const fetchProduct = async () => {
			if (!productId) return;
			try {
				const { data } = await api.get(`/products/${productId}`);
				setName(data.name);
				setMonthlyFee(data.monthlyFee || 0.0);
				setTriggerFee(data.triggerFee || 0.0);
				setMonthlyInterestRate(data.monthlyInterestRate || 0.0);
				setPenaltyMount(data.penaltyMount || 0.0);
				setReceivedMessageFee(data.receivedMessageFee || 0.0);
				setSentMessageFee(data.sentMessageFee || 0.0);
			} catch (err) {
				toastError(err);
			}
		}
		fetchProduct();
	}, [open, productId])

	const handleSubmit = async () => {
		const productData = {
			name: name,
			monthlyFee: monthlyFee,
			triggerFee: triggerFee,
			monthlyInterestRate: monthlyInterestRate,
			penaltyMount: penaltyMount,
			receivedMessageFee: receivedMessageFee,
			sentMessageFee: sentMessageFee
		};

		 try {
            if (productId) {
                await api.put(`/products/${productId}`, productData);
                toast.success(i18n.t("product.confirmation.edited"));
            } else {
                await api.post("/products/", productData);
                toast.success(i18n.t("product.confirmation.created"));
            }
            } catch (err) {
                toastError(err);
        }
        handleClose();
	};

	const currencyConfig = {
		locale: "pt-BR",
		formats: {
			number: {
			BRL: {
				style: "currency",
				currency: "BRL",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			},
			},
		},
	};

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
					{ productId
					 ? `${i18n.t("product.productModal.edited")}`
					 : `${i18n.t("product.productModal.created")}`
					}
				</DialogTitle>
				<DialogContent dividers>
				<div className={classes.multFieldLine}>
                  <TextField

					as={TextField}
                    name="name"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("product.productModal.productName")}
                    fullWidth
					value={name}
					onChange={handleNameChange}
                  />
                </div>
					<Typography variant="subtitle1">{i18n.t("product.productModal.monthValue")}</Typography>
					<IntlCurrencyInput
						name="monthlyFee"
						value={monthlyFee}
						onChange={handleMonthyFee}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
					/>
					<Typography variant="subtitle1">{i18n.t("product.productModal.shotsValue")}</Typography>
					<IntlCurrencyInput
						name="triggerFee"
						value={triggerFee}
						onChange={handleTriggerFee}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
					/>
					<Typography variant="subtitle1">{i18n.t("product.productModal.interestRate")}</Typography>
                  	<IntlCurrencyInput
						name="monthlyInterestRate"
						value={monthlyInterestRate}
						onChange={handleMonthlyInterestRate}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
                  />
					<Typography variant="subtitle1">{i18n.t("product.productModal.penaltyMount")}</Typography>
                 	<IntlCurrencyInput
						name="penaltyMount"
						value={penaltyMount}
						onChange={handlePenaltyMount}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
                  	/>
					<Typography variant="subtitle1">{"Valor por Mensagem Recebida"}</Typography>
                 	<IntlCurrencyInput
						name="receivedMessageFee"
						value={receivedMessageFee}
						onChange={handleReceivedMessageFee}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
                  	/>
					<Typography variant="subtitle1">{"Valor por Mensagem Enviada"}</Typography>
                 	<IntlCurrencyInput
						name="sentMessageFee"
						value={sentMessageFee}
						onChange={handleSentMessageFee}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
                  	/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("product.productModal.cancel")}
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ productId
						 ? `${i18n.t("product.productModal.save")}`
						 : `${i18n.t("product.productModal.created")}`
						}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ProductModal;
