import React, { useState } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Typography,
} from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import QueueSelectSingle from "../QueueSelectSingle";

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

const BindQueueModal = ({ open, onClose, connectionFile }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const [queueId, setQueueId] = useState("");

  const handleClose = () => {
    onClose();
    setQueueId("");
  };

  const handleSubmit = async () => {
    const body = { 
      queueId,
      connectionFileId: connectionFile.id
    };

    try {
      await api.post("/connectionFiles/bind-queue/", body);
      toast.success("Filas alteradas com sucesso.");
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
        <DialogTitle id="form-dialog-title">Vincular Números da Categoria com Fila</DialogTitle>
        <DialogContent dividers>
          <div>
            <Typography variant="subtitle1">
              Categoria: {connectionFile?.name}
            </Typography>
          </div>
          <div>
            <QueueSelectSingle
							label={"Fila"}
							selectedQueue={queueId}
							onChange={value => setQueueId(value)}
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

export default BindQueueModal;
