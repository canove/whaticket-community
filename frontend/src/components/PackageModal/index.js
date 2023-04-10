import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
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

const PackageModal = ({ open, onClose, packageId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [name, setName] = useState("");
	const [maxUsers, setMaxUsers] = useState(0);
	const [monthlyFee, setMonthlyFee] = useState(0.0);
	const [extraUserPrice, setExtraUserPrice] = useState(0.0);
	const [maxTicketsByMonth, setMaxTicketsByMonth] = useState(0);
	const [extraTicketPrice, setExtraTicketPrice] = useState(0.0);
	const [maxWhatsapps, setMaxWhatsapps] = useState(0);
	const [whatsappMonthlyPrice, setWhatsappMonthlyPrice] = useState(0.0);
	
	const handleClose = () => {
		setName("");
		setMaxUsers(0);
		setMonthlyFee(0.0);
		setExtraUserPrice(0.0);
		setMaxTicketsByMonth(0);
		setExtraTicketPrice(0.0);
		setMaxWhatsapps(0);
		setWhatsappMonthlyPrice(0.0);
		onClose();
	};

	useEffect(() => {
		const fetchPackage = async () => {
			if (!packageId) return;
			try {
				const { data } = await api.get(`/packages/${packageId}`);
				setName(data.name);
				setMaxUsers(data.maxUsers);
				setMonthlyFee(data.monthlyFee || 0.0);
				setExtraUserPrice(data.extraUserPrice || 0.0);
				setMaxTicketsByMonth(data.maxTicketsByMonth);
				setExtraTicketPrice(data.extraTicketPrice || 0.0);
				setMaxWhatsapps(data.maxWhatsapps);
				setWhatsappMonthlyPrice(data.whatsappMonthlyPrice || 0.0);
			} catch (err) {
				toastError(err);
			}
		}

		fetchPackage();
	}, [open, packageId])

	const handleSubmit = async () => {
		const packageData = {
			name: name,
			maxUsers: maxUsers,
			extraUserPrice: extraUserPrice,
			maxTicketsByMonth: maxTicketsByMonth,
			extraTicketPrice: extraTicketPrice,
			maxWhatsapps: maxWhatsapps,
			whatsappMonthlyPrice: whatsappMonthlyPrice
		};

		 try {
            if (packageId) {
                await api.put(`/packages/${packageId}`, packageData);
                toast.success('Pacote salvo com sucesso.');
            } else {
                await api.post("/packages/", packageData);
                toast.success('Pacote criado com sucesso.');
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
					{ packageId
					 ? 'Editar Pacote'
					 : 'Criar Pacote'
					}
				</DialogTitle>
				<DialogContent dividers>
				<div className={classes.multFieldLine}>
					<TextField
						name="name"
						variant="outlined"
						margin="dense"
						label={"Nome"}
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
                </div>
				<div>
					<FormControl
						variant="outlined"
						margin="dense"
						fullWidth
					>
						<TextField
							name="maxUsers"
							label={"Máx. Usuários"}
							type="number"
							variant="outlined"
							value={maxUsers}
							onChange={(e) => setMaxUsers(e.target.value)}
							fullWidth
							inputProps={{
								step: 1,
								min: 0,
								type: 'number',
							}}
						/>
					</FormControl>
				</div>
				<div>
					<FormControl
						variant="outlined"
						margin="dense"
						fullWidth
					>
						<TextField
							name="maxTicketsByMonth"
							label={"Máx. Tickets por Mês"}
							type="number"
							variant="outlined"
							value={maxTicketsByMonth}
							onChange={(e) => setMaxTicketsByMonth(e.target.value)}
							fullWidth
							inputProps={{
								step: 1,
								min: 0,
								type: 'number',
							}}
						/>
					</FormControl>
				</div>
				<div>
					<FormControl
						variant="outlined"
						margin="dense"
						fullWidth
					>
						<TextField
							name="maxWhatsapps"
							label={"Máx. Whatsapps"}
							type="number"
							variant="outlined"
							value={maxWhatsapps}
							onChange={(e) => setMaxWhatsapps(e.target.value)}
							fullWidth
							inputProps={{
								step: 1,
								min: 0,
								type: 'number',
							}}
						/>
					</FormControl>
				</div>
				<div>
					<Typography variant="subtitle1">{"Mensalidade"}</Typography>
					<IntlCurrencyInput
						name="monthlyFee"
						value={monthlyFee}
						onChange={(e, value) =>{
							e.preventDefault();
							setMonthlyFee(value);
						}}
						config={currencyConfig}
						currency="BRL"
						style={{ width:"100%", padding:"10px", fontSize:"16px" }}
					/>
				</div>
				<div>
					<Typography variant="subtitle1">{"Preço por Usuário Extra"}</Typography>
					<IntlCurrencyInput
						name="extraUserPrice"
						value={extraUserPrice}
						onChange={(e, value) =>{
							e.preventDefault();
							setExtraUserPrice(value);
						}}
						config={currencyConfig}
						currency="BRL"
						style={{ width:"100%", padding:"10px", fontSize:"16px" }}
					/>
				</div>
				<div>
					<Typography variant="subtitle1">{"Preço por Ticket Extra"}</Typography>
					<IntlCurrencyInput
						name="extraTicketPrice"
						value={extraTicketPrice}
						onChange={(e, value) =>{
							e.preventDefault();
							setExtraTicketPrice(value);
						}}
						config={currencyConfig}
						currency="BRL"
						style={{ width:"100%", padding:"10px", fontSize:"16px" }}
					/>
				</div>
				<div>
					<Typography variant="subtitle1">{"Mensalidade por Número Conectado"}</Typography>
					<IntlCurrencyInput
						name="whatsappMonthlyPrice"
						value={whatsappMonthlyPrice}
						onChange={(e, value) =>{
							e.preventDefault();
							setWhatsappMonthlyPrice(value);
						}}
						config={currencyConfig}
						currency="BRL"
						style={{ width:"100%", padding:"10px", fontSize:"16px" }}
					/>
				</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{'Cancelar'}
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ packageId
						 ? 'Salvar'
						 : 'Criar'
						}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default PackageModal;
