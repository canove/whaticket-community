import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
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

  container: {
    display: "flex",
    flexWrap: "wrap",
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
    alignItems: "center",
  },

  selectStyle: {
    display: "flex",
    alignItems: "center",
  },
}));

const BindCallbackModal = ({ open, onClose, connectionFile }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const [messageCallbackUrl, setMessageCallbackUrl] = useState("");
  const [statusCallbackUrl, setStatusCallbackUrl] = useState("");
  const [callbackAuthorization, setCallbackAuthorization] = useState("");

  const handleClose = () => {
    onClose();
    setMessageCallbackUrl("");
    setStatusCallbackUrl("");
    setCallbackAuthorization("");
  };

  const handleSubmit = async () => {
    const body = { 
      messageCallbackUrl,
      statusCallbackUrl,
      callbackAuthorization,
      connectionFileId: connectionFile.id
    };

    try {
      await api.post("/connectionFiles/callback/", body);
      toast.success("Callbacks alterados com sucesso.");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">Trocar callback de todos números da categoria.</DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <Typography variant="subtitle1">
              Categoria: {connectionFile?.name}
            </Typography>
          </div>
          <div className={classes.multFieldLine}>
            <TextField
							label="Message Callback URL"
							name="messageCallbackUrl"
							variant="outlined"
							margin="dense"
              value={messageCallbackUrl}
              onChange={(e) => setMessageCallbackUrl(e.target.value)}
							fullWidth
						/>
					</div>
					<div className={classes.multFieldLine}>
            <TextField
							label="Status Callback URL"
							name="statusCallbackUrl"
							variant="outlined"
							margin="dense"
              value={statusCallbackUrl}
              onChange={(e) => setStatusCallbackUrl(e.target.value)}
							fullWidth
						/>
					</div>
					<div className={classes.multFieldLine}>
						<TextField
							label="Callback Authorization"
							name="callbackAuthorization"
							variant="outlined"
							margin="dense"
              value={callbackAuthorization}
              onChange={(e) => setCallbackAuthorization(e.target.value)}
							fullWidth
						/>
					</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {"Cancelar"}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
            onClick={handleSubmit}
          >
            Vincular
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BindCallbackModal;
