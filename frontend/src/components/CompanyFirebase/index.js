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
import { IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@material-ui/core";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';

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

	const [openServiceModal, setOpenServiceModal] = useState(false);
	const [newService, setNewService] = useState("");
	const [services, setServices] = useState([]);
	const [docId, setDocId] = useState("");

	useEffect(() => {
		const fetchServices = async () => {
			if (companyId) {
				try {
					const { data } = await api.get(`/firebase/company/${companyId}`);
					setServices(data);
				} catch (err) {
					toastError(err);
				}
			}
		}
		fetchServices();
	}, [companyId, services])

	const handleClose = () => {
		setNewService("");
		onClose();
	};

	const handleSubmitService = async () => {
		try {
			await api.post(`/firebase/company/${companyId}`, { newService, docId });
			setServices(prevServices => [...prevServices]);
			if (docId) {
				toast.success("Service editado com sucesso.");
			} else {
				toast.success("Service criado com sucesso.");
			}
		} catch (err) {
			toastError(err);
		}

		handleCloseServiceModal();
	}

	const handleOpenServiceModal = () => {
		setOpenServiceModal(true);
	}

	const handleCloseServiceModal = () => {
		setNewService("");
		setDocId("");
		setOpenServiceModal(false);
	}

	const handleServiceChange = (e) => {
		setNewService(e.target.value);
	}

	const handleEditService = (service, docId) => {
		setNewService(service);
		setDocId(docId);
		setOpenServiceModal(true);
	}

	const getIsFullTranslation = (isFull) => {
		if (isFull === true) {
			return "Sim";
		}

		if (isFull === false) {
			return "Não";
		}

		return null;
	}

	const getConnectedTranslation = (connected) => {
		if (connected === true) {
			return <CheckCircleIcon style={{ color: green[500] }} />;
		}

		if (connected === false) {
			return <CancelIcon style={{ color: red[500] }} />;
		}

		return null;
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
						value={newService}
						onChange={(e) => (handleServiceChange(e))}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseServiceModal} color="primary">
						Cancel
					</Button>
					<Button onClick={(e) => {handleSubmitService(e)}} color="primary">
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
								<TableCell>
									Edit
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{ services && services.map((service, index) => (
								<TableRow key={index}>
									<TableCell>
										{ service.data.companyId }
									</TableCell>
									<TableCell>
										{ getConnectedTranslation(service.data.connected) }
									</TableCell>
									<TableCell>
										{ getIsFullTranslation(service.data.isFull) }
									</TableCell>
									<TableCell>
										{ service.data.service }
									</TableCell>
									<TableCell>
										<IconButton
											size="small"
											onClick={() => handleEditService(service.data.service, service.id)}
										>
											<EditIcon />
										</IconButton>
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
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default CompanyFirebase;
