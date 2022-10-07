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
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";


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

const ProductModal = ({ open, onClose, pricingId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [company, setCompany] = useState("");
	const [product, setProduct] = useState("");
	const [gracePeriod, setGracePeriod] = useState("");
	const [graceTrigger, setGraceTrigger] = useState("");

	const [companies, setCompanies] = useState([]);
	const [products, setProducts] = useState([]);

	const [disableButton, setDisableButton] = useState(false);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		const fetchCompanies = async () => {
			try {
				const { data } = await api.get('/company/');
				setCompanies(data.companies);
			} catch (err) {
				toastError(err);
			}
		}

		const fetchProducts = async () => {
			try {
				const { data } = await api.get('/products/');
				setProducts(data);
			} catch (err) {
				toastError(err);
			}
		}

		const fetchPricing = async () => {
			try {
				const { data } = await api.get(`/pricings/${pricingId}`);
				setCompany(data.companyId);
				setProduct(data.productId);
				setGracePeriod(data.gracePeriod);
				setGraceTrigger(data.graceTrigger);
			} catch (err) {
				toastError(err);
			}
		}

		fetchCompanies();
		fetchProducts();

		if (pricingId) {
			fetchPricing();
		}
	}, [open, pricingId])

	useEffect(() => {
		if (company && product && typeof gracePeriod === "number" && typeof graceTrigger === "number") {
			setDisableButton(false);
		} else {
			setDisableButton(true);
		}
	}, [company, product, gracePeriod, graceTrigger])

	const handleClose = () => {
		onClose();
		setCompany("");
		setProduct("");
		setGracePeriod("");
		setGraceTrigger("");
	};

	const handleSubmit = async () => {
		const pricingData = {
			companyId: company,
			productId: product,
			gracePeriod,
			graceTrigger
		};

		if (pricingId) {
			setConfirmModalOpen(true);
		} else {
			try {
				await api.post('/pricings/', pricingData);
				toast.success(i18n.t("pricing.confirmation.create"));
			} catch (err) {
				toastError(err);
			}
			handleClose();
		}
	};

	const handleEdit = async () => {
		const pricingData = {
			companyId: company,
			productId: product,
			gracePeriod,
			graceTrigger
		};

		try {
			await api.put(`/pricings/${pricingId}`, pricingData);
			toast.success(i18n.t("pricing.confirmation.edit"));
		} catch (err) {
			toastError(err);
		}

		handleClose();
	}

	const handleCompanyChange = (e) => {
		setCompany(e.target.value);
	}

	const handleProductChange = (e) => {
		setProduct(e.target.value);
	}

	const handleGracePeriodChange = (e) => {
		setGracePeriod(e.target.value === '' ? '' : Number(e.target.value));
	}

	const handleGraceTriggerChange = (e) => {
		setGraceTrigger(e.target.value === '' ? '' : Number(e.target.value));
	}

	return (
		<div className={classes.root}>
			<ConfirmationModal
				title={i18n.t("pricing.confirmation.titleEdit")}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleEdit}
			>
				{i18n.t("pricing.confirmation.confirmEdit")}
			</ConfirmationModal>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ pricingId
					 ? `${i18n.t("pricing.pricingModal.edited")}`
					 : `${i18n.t("pricing.pricingModal.created")}`
					}
				</DialogTitle>
				<DialogContent dividers>
					<div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<InputLabel id="company-select-label">
								{i18n.t("pricing.pricingModal.company")}
							</InputLabel>
							<Select
								labelId="company-select-label"
								label="Empresa"
								id="company-select"
								value={company}
								onChange={handleCompanyChange}
								fullWidth
							>
								{ companies && companies.map(company => {
									return (
										<MenuItem key={company.id} value={company.id}>{ company.name }</MenuItem>
									)
								})}
							</Select>
						</FormControl>
                    </div>
					<div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<InputLabel id="product-select-label">
								{i18n.t("pricing.pricingModal.product")}
							</InputLabel>
							<Select
								labelId="product-select-label"
								label="Empresa"
								id="product-select"
								value={product}
								onChange={handleProductChange}
								fullWidth
							>
								{ products && products.map(product => {
									return (
										<MenuItem key={product.id} value={product.id}>{ product.name }</MenuItem>
									)
								})}
							</Select>
						</FormControl>
                    </div>
					<div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								id="grace-days-number"
								label={i18n.t("pricing.pricingModal.graceDays")}
								type="number"
								variant="outlined"
								value={gracePeriod}
								onChange={handleGracePeriodChange}
								fullWidth
								inputProps={{
									step: 1,
									min: 0,
									type: 'number',
								}}
							/>
						</FormControl>
					</div>
					<div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								id="grace-triggers-number"
								label={i18n.t("pricing.pricingModal.lackOfShots")}
								type="number"
								variant="outlined"
								value={graceTrigger}
								onChange={handleGraceTriggerChange}
								fullWidth
								inputProps={{
									step: 1,
									min: 0,
									type: 'number',
								}}
							/>
						</FormControl>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("pricing.pricingModal.cancel")}
					</Button>
					<Button
                        onClick={handleSubmit}
						disabled={disableButton}
						color="primary"
						variant="contained"
					>
						{ pricingId
						 ? `${i18n.t("pricing.pricingModal.save")}`
						 : `${i18n.t("pricing.pricingModal.created")}`
						}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ProductModal;
