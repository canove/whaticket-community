import React, { useState, useEffect } from "react";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from '@material-ui/core/InputLabel';
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import StoreIcon from "@material-ui/icons/Store";
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { i18n } from "../../translate/i18n";
import useCompanies from '../../hooks/useCompanies';
import usePlans from '../../hooks/usePlans';
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import { isEqual } from 'lodash'

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(2),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	}
}));

const FormCompany = () => {
	const classes = useStyles();
	const { getPlanList } = usePlans()
    const { save: saveCompany } = useCompanies()
	const [company, setCompany] = useState({ name: "", planId: "", token: "" });
	const [plans, setPlans] = useState([])

	useEffect(() => {
		const fetchData = async () => {
			const list = await getPlanList()
			setPlans(list);
		}
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChangeInput = e => {
		setCompany({ ...company, [e.target.name]: e.target.value });
	};

	const handlSubmit = async e => {
		e.preventDefault();
		try {
			await saveCompany(company)
			setCompany({ name: "", planId: "", token: "" })
			toast.success(i18n.t("companies.form.success"));
		} catch (e) {
			toastError(e)
		}
	};

	const renderPlanField = () => {
		if (plans.length) {
			return <>
				<Grid item>
					<FormControl fullWidth variant="outlined">
						<InputLabel>Plano</InputLabel>
						<Select 
							required
							id="planId"
							label={i18n.t("companies.form.plan")}
							name="planId"
							value={company.planId}
							onChange={handleChangeInput}
							autoComplete="plan"
						>
							<MenuItem value={""}>&nbsp;</MenuItem>
							{ plans.map((plan, index) => {
								return <MenuItem value={plan.id} key={index}>{ plan.name }</MenuItem>
							})}
						</Select>
					</FormControl>
				</Grid>
			</>
		}
	}

	const renderNameField = () => {
		if (plans.length && !isEqual(company.planId, "")) {
			return <>
				<Grid item>
					<TextField
						variant="outlined"
						required
						fullWidth
						id="name"
						label={i18n.t("companies.form.name")}
						name="name"
						value={company.name}
						onChange={handleChangeInput}
						autoComplete="name"
						autoFocus
					/>
				</Grid>
			</>
		}
	}

	const renderTokenField = () => {
		if (plans.length && !isEqual(company.planId, "")) {
			return <>
				<Grid item>
					<TextField
						variant="outlined"
						required
						fullWidth
						id="token"
						label={i18n.t("companies.form.token")}
						name="token"
						value={company.token}
						onChange={handleChangeInput}
						autoComplete="token"
						autoFocus
					/>
				</Grid>
			</>
		}
	}

	const renderSubmitButton = () => {
		if (plans.length && !isEqual(company.planId, "")) {
			return <>
				<Button
					type="submit"
					fullWidth
					variant="contained"
					color="primary"
					className={classes.submit}
				>
					{i18n.t("companies.form.submit")}
				</Button>
			</>
		}
	}

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<StoreIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					{i18n.t("companies.title")}
				</Typography>
				<form className={classes.form} noValidate onSubmit={handlSubmit}>
					<Grid container direction="column" spacing={2}>
						{ renderPlanField() }
						{ renderNameField() }
						{ renderTokenField() }
					</Grid>
					{ renderSubmitButton() }
				</form>
			</div>
		</Container>
	);
};

export default FormCompany;
