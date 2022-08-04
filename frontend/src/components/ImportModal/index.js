import React, { useState } from "react";


import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { useTranslation } from "react-i18next";

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

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const ImportModal = ({ open, onClose }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

    const [files, setFiles] = useState([]);

	const handleClose = () => {
		onClose();
	};

    const handleFile = (e) => {
        setFiles(Array.from(e.target.files));
    }

	return (
		<div className={classes.root}>
			<Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
					{i18n.t('importModal.title')}
				</DialogTitle>
                <DialogContent dividers>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        {i18n.t('importModal.buttons.uploadFile')}
                        <input
                            type="file"
                            onChange={handleFile}
                            hidden
                        />
                    </Button>
                    <Typography variant="subtitle1" gutterBottom>
                        {files.length > 0 ? `${i18n.t('importModal.form.uploadedFile')}: ${files.map((file) => file.name)}` : i18n.t('importModal.form.noFile')}
					</Typography>
                </DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t('importModal.buttons.cancel')}
					</Button>
					<Button
						type="submit"
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
					>
						{i18n.t('importModal.buttons.import')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ImportModal;
