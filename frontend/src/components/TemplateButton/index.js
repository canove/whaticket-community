import React, { useState, useEffect } from "react";
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

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input/input'

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
        display: "flex",
        marginTop: 10,
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

const TemplateButton = ({ open, onClose, button, index, handleButtonsChange }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

    const [text, setText] = useState("");

    useEffect(() => {
        if (button) setText(button.text);
    }, [open, button])

	const handleClose = () => {
		onClose();
        setText("");
	};

	const handleSubmit = async () => {
        handleButtonsChange(text, index);

		handleClose();
	};

    const handleTextChange = (e) => {
        setText(e.target.value);
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
				<DialogTitle id="form-dialog-title">
					{ button
                     ? `${i18n.t("templatesData.buttomModal.edit")}`
                     : `${i18n.t("templatesData.buttomModal.create")}`
                    }
				</DialogTitle>
				<DialogContent dividers>
                    <div className={classes.root}>
                        <FormControl
                            variant="outlined"
                            margin="dense"
                            fullWidth
						>
                           <TextField
                                label={i18n.t("templatesData.buttomModal.text")}
                                variant="outlined"
                                value={text}
                                onChange={handleTextChange}
                                fullWidth
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
						{i18n.t("templatesData.buttomModal.cancel")}
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ button
                         ? `${i18n.t("templatesData.buttomModal.save")}`
                         : `${i18n.t("templatesData.buttomModal.create")}`
                        }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default TemplateButton;