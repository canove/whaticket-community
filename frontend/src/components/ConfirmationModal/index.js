import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import { i18n } from "../../translate/i18n";

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	return (
        <Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
		>
            <DialogTitle id="confirm-dialog">{title}</DialogTitle>
            <DialogContent dividers>
				<Typography>{children}</Typography>
			</DialogContent>
            <DialogActions>
				<Button variant="contained" onClick={() => onClose(false)}>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					color="secondary"
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;
