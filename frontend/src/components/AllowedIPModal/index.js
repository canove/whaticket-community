import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
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
	MenuItem,
	FormControl,
	Select,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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
}));

const AllowedIPModal = ({ open, onClose, allowedIP, index, saveIP }) => {
	const { i18n } = useTranslation();
	const classes = useStyles();

	const [ip, setIP] = useState("");

	useEffect(() => {
		const getAllowedIP = () => {
			if (!allowedIP) return;

			setIP(allowedIP);
		}

		getAllowedIP();
	}, [open, allowedIP]);

	const handleClose = () => {
		setIP("");
		onClose();
	};

	const handleSaveAllowedIP = () => {
		saveIP(ip.trim(), index);

		handleClose();
	}

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					{allowedIP
						? 'Editar'
						: 'Criar'
                    }
				</DialogTitle>
				<DialogContent dividers>
					<div>
						<TextField
							label={"IP"}
							fullWidth
							name="ip"
							value={ip}
							onChange={(e) => setIP(e.target.value)}
							variant="outlined"
							margin="dense"
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
						type="submit"
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
						onClick={handleSaveAllowedIP}
					>
						{allowedIP
							? 'Salvar'
							: 'Adicionar'
                        }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default AllowedIPModal;
