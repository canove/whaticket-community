import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

const ConfirmationModal = ({ title, children, open, setOpen, onConfirm }) => {
	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			aria-labelledby="confirm-dialog"
		>
			<DialogTitle id="confirm-dialog">{title}</DialogTitle>
			<DialogContent dividers>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={() => setOpen(false)}
					color="secondary"
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						setOpen(false);
						onConfirm();
					}}
					color="default"
				>
					Confirmar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
