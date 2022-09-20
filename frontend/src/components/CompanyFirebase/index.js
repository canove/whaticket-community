import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@material-ui/core";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	btnWrapper: {
		position: "relative",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		marginBottom: 20,
		marginTop: 20,
		alignItems: "center",
	},

	buttonRed: {
		color: red[300],
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},

	form: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},

	formTitle: {
		marginRight: 10,
	},

	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
}));

const CompanyFirebase = ({ open, onClose, companyId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();
	const { user } = useContext(AuthContext);

	const [connected, setConnected] = useState(false);
	const [isFull, setIsFull] = useState(false);
	const [newService, setNewService] = useState("");
	const [openServiceModal, setOpenServiceModal] = useState(false);
	const [services, setServices] = useState([]);

	useEffect(() => {
		const fetchServices = async () => {
			try {
				const { data } = await api.get(`/firebase/company/${companyId}`);
				setServices(data);
			} catch (err) {
				toastError(err);
			}
		}
		fetchServices();
	}, [companyId])

	const handleClose = () => {
		setConnected(false);
		setIsFull(false);
		setNewService("");
		onClose();
	};

	const handleSubmit = async () => {
		const companyFirebaseBody = { connected, isFull, newService }
		try {
			await api.post(`/firebase/company/${companyId}`, companyFirebaseBody);
		} catch (err) {
			toastError(err);
		}
		handleClose();
	}

	const handleOpenServiceModal = () => {
		setOpenServiceModal(true);
	}

	const handleCloseServiceModal = () => {
		setOpenServiceModal(false);
	}

	const handleServiceChange = (e) => {
		setNewService(e.target.value);
	}

	const addService = () => {
		handleSubmit();
		handleCloseServiceModal();
	}

	const optionsTranslation = (option) => {
		if (option === true) {
			return "Sim";
		}

		if (option === false) {
			return "Não";
		}

		return option;
	}

	return (
		<div className={classes.root}>
			<div>
				<Dialog open={openServiceModal} onClose={handleCloseServiceModal}>
				<DialogTitle>Adicione um Service:</DialogTitle>
				<DialogContent>
					<TextField
						variant="outlined"
						style={{width:"100%"}}
						onChange={(e) => (handleServiceChange(e))}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseServiceModal} color="primary">
						Cancel
					</Button>
					<Button onClick={(e) => {addService(e)}} color="primary">
						Ok
					</Button>
				</DialogActions>
				</Dialog>
			</div>
			<Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
					Firebase Config
				</DialogTitle>
                <DialogContent dividers>
				<Paper
					className={classes.mainPaper}
					variant="outlined"
				>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>
									Company ID
								</TableCell>
								<TableCell>
									Connected
								</TableCell>
								<TableCell>
									Is Full
								</TableCell>
								<TableCell>
									Service
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{ services && services.map((service, index) => (
								<TableRow key={index}>
									<TableCell>
										Company ID
									</TableCell>
									<TableCell>
										Connected
									</TableCell>
									<TableCell>
										Is Full
									</TableCell>
									<TableCell>
										Service
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Paper>
					{/* <div className={classes.form}>
						<Typography variant="subtitle1" gutterBottom displayInline className={classes.formTitle}>
							CompanyID: 
						</Typography>
						<TextField
							variant="outlined"
							style={{width:"50%"}}
							value={companyId}
							disabled
						/>
					</div>
					<div className={classes.form}>
						<Typography variant="subtitle1" gutterBottom displayInline className={classes.formTitle}>
							Connected: 
						</Typography>
						<TextField
							variant="outlined"
							style={{width:"50%"}}
							value={connected}
							disabled
						/>
					</div>
					<div className={classes.form}>
						<Typography variant="subtitle1" gutterBottom displayInline className={classes.formTitle}>
							isFull: 
						</Typography>
						<TextField
							variant="outlined"
							style={{width:"50%"}}
							value={isFull}
							disabled
						/>
					</div>
					<div className={classes.form}>
						<Typography variant="subtitle1" gutterBottom displayInline className={classes.formTitle}>
							Service: 
						</Typography>
						<TextField
							variant="outlined"
							style={{width:"50%"}}
							value={service}
							disabled
						/>
					</div> */}
                </DialogContent>
				<DialogActions>
					<Button
						color="secondary"
						variant="outlined"
						onClick={handleClose}
					>
						Cancelar
					</Button>
					<Button
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
						onClick={handleOpenServiceModal}
					>
						Adicionar Service
					</Button>
					<Button
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
						onClick={handleClose}
					>
						Criar
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default CompanyFirebase;