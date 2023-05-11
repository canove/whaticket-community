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

const BindFlowModal = ({ open, onClose, connectionFile }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const [flows, setFlows] = useState([]);
  const [flowId, setFlowId] = useState("");

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const { data } = await api.get("/flows", {
          params: { type: "bits" },
        });
        setFlows(data);
      } catch (err) {
        toastError(err);
      }
    };

    fetchFlows();
  }, [open]);

  const handleClose = () => {
    onClose();
    setFlowId("");
  };

  const handleSubmit = async () => {
    const body = { 
      flowId: flowId,
      connectionFileId: connectionFile.id
    };

    try {
      await api.post("/connectionFiles/bind/", body);
      toast.success("Fluxos alterados com sucesso.");
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
        <DialogTitle id="form-dialog-title">Vincular Números da Categoria com Fluxo</DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <Typography variant="subtitle1">
              Categoria: {connectionFile?.name}
            </Typography>
          </div>
          <div className={classes.multFieldLine}>
            <FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<InputLabel>Fluxo</InputLabel>
							<Select
								value={flowId}
								onChange={(e) => { setFlowId(e.target.value) }}
								label="Fluxo"
							>
								<MenuItem value={null}>Nenhum</MenuItem>
								{ flows && flows.map(flow => {
									return (
										<MenuItem value={flow.id} key={flow.id}>{flow.name}</MenuItem>
									)
								}) }
							</Select>
						</FormControl>
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

export default BindFlowModal;
