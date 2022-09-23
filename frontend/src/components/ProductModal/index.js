import React, { useState, useEffect, useContext, } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
	InputAdornment,
	IconButton
  } from '@material-ui/core';

import { Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import { useTranslation } from "react-i18next";
import Autocomplete from "@material-ui/lab/Autocomplete";
import ConfirmationModal from "../ConfirmationModal";

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

	const handleMonthyFee = (e) =>{
		setMonthlyFee(e.target.value);
	};

	const handleTriggerFee = (e) =>{
		setTriggerFee(e.target.value);
	};

	const handleMonthlyInterestRate = (e) =>{
		setMonthlyInterestRate(e.target.value);
	};

	const handlePenaltyMount = (e) =>{
		setPenaltyMount(e.target.value);
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
				<div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    name="monthlyFee"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("Valor Mensal")}
                    fullWidth
					value={monthlyFee}
					onChange={handleMonthyFee}
                  />
                </div>
				<div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    name="triggerFee"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("Valor custo disparo")}
                    fullWidth
					value={triggerFee}
					onChange={handleTriggerFee}
                  />
                </div>
				<div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    name="monthlyInterestRate"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("Taxa juros Mensal")}
                    fullWidth
					value={monthlyInterestRate}
					onChange={handleMonthlyInterestRate}
                  />
                </div>
				<div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    name="penaltyMount"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("Multa Atraso")}
                    fullWidth
					value={penaltyMount}
					onChange={handlePenaltyMount}
                  />
                </div>
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
