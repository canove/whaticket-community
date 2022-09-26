import React, { useState, useEffect } from "react";
import * as Yup from "yup";
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
	const [monthlyFee, setMonthlyFee] = useState("");
	const [triggerFee, setTriggerFee] = useState("");
	const [monthlyInterestRate, setMonthlyInterestRate] = useState("");
	const [penaltyMount, setPenaltyMount] = useState("");

	const handleClose = () => {
		setName("");
		setMonthlyFee("");
		setTriggerFee("");
		setMonthlyInterestRate("");
		setPenaltyMount("");
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

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { data } = await api.get(`/products/${productId}`);
				setName(data.name)
				setMonthlyFee(data.monthlyFee)
				setTriggerFee(data.triggerFee)
				setMonthlyInterestRate(data.monthlyInterestRate)
				setPenaltyMount(data.penaltyMount)
			} catch (err) {
				toastError(err);
			}
		}
		if (productId) {
			fetchProduct();
		}
	}, [open, productId])


	const handleSubmit = async () => {
		const productData = {
			name: name,
			monthlyFee: monthlyFee,
			triggerFee: triggerFee,
			monthlyInterestRate: monthlyInterestRate,
			penaltyMount: penaltyMount,
		};

		 try {
            if (productId) {
                await api.put(`/products/${productId}`, productData);
                toast.success("Produto editado com sucesso!");
            } else {
                await api.post("/products/", productData);
                toast.success("Produto adicionado com sucesso!");
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
					{ productId ? 'Editar' : 'Criar' }
				</DialogTitle>
				<DialogContent dividers>
				<div className={classes.multFieldLine}>
                  <TextField

					as={TextField}
                    name="name"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("Nome do produto")}
                    fullWidth
					value={name}
					onChange={handleNameChange}
                  />
                </div>
					<Typography variant="subtitle1">Valor Mensal</Typography>
					<IntlCurrencyInput
						name="monthlyFee"
						value={monthlyFee}
						onChange={handleMonthyFee}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
					/>
					<Typography variant="subtitle1">Valor do disparo</Typography>
					<IntlCurrencyInput
						name="triggerFee"
						value={triggerFee}
						onChange={handleTriggerFee}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
					/>
					<Typography variant="subtitle1">Taxa de Juros</Typography>
                  	<IntlCurrencyInput
						name="monthlyInterestRate"
						value={monthlyInterestRate}
						onChange={handleMonthlyInterestRate}
						config={currencyConfig}
						currency="BRL"
						style={{width:"100%", padding:"10px", fontSize:"16px"}}
                  />
					<Typography variant="subtitle1">Multa atraso</Typography>
                 	<IntlCurrencyInput
						name="penaltyMount"
						value={penaltyMount}
						onChange={handlePenaltyMount}
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
						Cancelar
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ productId ? 'Editar' : 'Criar' }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ProductModal;
