import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	DialogActions,
	CircularProgress,
	TextField,
	Switch,
	FormControlLabel,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { useTranslation } from "react-i18next";

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input/input'

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

const TransferContactModal = ({ open, onClose, selectedWhatsapps }) => {
	const { i18n } = useTranslation();
	const classes = useStyles();

    const [whatsapps, setWhatsapps] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [whatsappsId, setWhatsappsId] = useState([]);
    const [companyId, setCompanyId] = useState("");

    useEffect(() => {
        const fetchWhats = async () => {
            try {
                const { data } = await api.get("/whatsapp/listAll/", {
                    params: { all: true }
                });
                setWhatsapps(data.whatsapps);
            } catch (err) {
                toastError(err);
            }
        }

        const fetchCompanies = async () => {
            try {
                const { data } = await api.get("/company");
                setCompanies(data.companies);
            } catch (err) {
                toastError(err);
            }
        }

        fetchWhats();
        fetchCompanies();

        if (selectedWhatsapps) {
            setWhatsappsId(selectedWhatsapps);
        } else {
            setWhatsappsId([]);
        }
    }, [open]);

    const handleWhatsappsChange = (e) => {
        const value = e.target.value;
        setWhatsappsId(typeof value === 'string' ? value.split(',') : value,);
    }

    const handleCompanyChange = (e) => {
        setCompanyId(e.target.value);
    }

    const handleClose = () => {
        setWhatsappsId([]);
        setCompanyId("");

        onClose();
    };

    const handleSubmit = async () => {
        const transferData = {
            whatsapps: whatsappsId,
            company: companyId
        }

        try {
            api.put('/whatsapp/transfer/', transferData);
        } catch (err) {
            toastError(err);
        }

        handleClose();
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
				<DialogTitle>
					Transfer Contacts
				</DialogTitle>
                <DialogContent dividers>
                    <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    >
                        <InputLabel id="whatsapps-select-label">Whatsapps</InputLabel>
                        <Select
                            labelId="whatsapps-select-label"
                            id="whatsapps-select"
                            label="Whatsapps"
                            value={whatsappsId}
                            onChange={(e) => { handleWhatsappsChange(e) } }
                            multiple
                            style={{ width: "100%" }}
                            variant="outlined"
                        >
                            {whatsapps && whatsapps.map((whats) => {
                                return (
                                    <MenuItem key={whats.id} value={whats.id}>
                                        {whats.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    >
                        <InputLabel id="companies-select-label">Empresas</InputLabel>
                        <Select
                            labelId="companies-select-label"
                            id="companies-select"
                            label="Empresas"
                            value={companyId}
                            onChange={(e) => { handleCompanyChange(e) } }
                            style={{ width: "100%" }}
                            variant="outlined"
                        >
                            {companies && companies.map((company) => {
                                return (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
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
						Transferir
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default TransferContactModal;
