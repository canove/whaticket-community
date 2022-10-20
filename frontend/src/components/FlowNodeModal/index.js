import React, { useEffect, useState } from "react";
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
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

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
    display: 'flex',
    flexWrap: 'wrap',
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
  }
}));

const FlowNodeModal = ({ open, onClose, flowId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [name, setName] = useState("");
    const [status, setStatus] = useState("active");

    useEffect(() => {
      setName("");
      setStatus("active");

      const fetchFlow = async () => {
        try {
          const { data } = await api.get(`/flows/${flowId}`);
          setName(data.name)
          setStatus(data.status);
        } catch (err) {
          toastError(err);
        }
      };
      if(flowId){
        fetchFlow();
      };
    }, [open, flowId]);

    const handleClose = () => {
      setName("");
      setStatus("active");

      onClose();
    };

    const handleNameChange = (e) => {
      setName(e.target.value);
    };

    const handleStatusChange = (e) => {
      setStatus(e.target.value);
    }

    const handleSubmit = async () => {
      const flowData = {
          name: name,
          status: status,
          type: "bits"
      };

      try {
        if (flowId) {
          await api.put(`/flows/${flowId}`, flowData);
          toast.success(i18n.t("flows.confirmation.edit"));
        } else {
          await api.post(`/flows/`, flowData);
          toast.success(i18n.t("flows.confirmation.create"));
        }
      } catch (err) {
        toastError(err);
      }

      handleClose();
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
          <DialogTitle id="form-dialog-title">
            { flowId
              ? `${i18n.t("flows.flowsModal.edit")}`
              : `${i18n.t("flows.flowsModal.add")}`
            }
          </DialogTitle>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("flows.flowsModal.name")}
                    autoFocus
                    value={name}
                    name="name"
                    onChange={(e) => { handleNameChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.selectStyle}>
                    <FormControl
                      variant="outlined"
                      margin="normal"
                      fullWidth
                    >
                      <InputLabel id="status-select-label">
                        Status
                      </InputLabel>
                      <Select
                        labelId="status-select-label"
                        id="status-select"
                        value={status}
                        label="Status"
                        onChange={handleStatusChange}
                        style={{width: "100%"}}
                        variant="outlined"
                      >
                        <MenuItem value={"active"}>Ativo</MenuItem>
                        <MenuItem value={"inactive"}>Inativo</MenuItem>
                      </Select>
                  </FormControl>
                </div>
              </DialogContent>
              <DialogActions>
              <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("flows.flowsModal.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={handleSubmit}
                >
                   { flowId
                    ? `${i18n.t("flows.flowsModal.save")}`
                    : `${i18n.t("flows.flowsModal.create")}`}
                </Button>
              </DialogActions>
          </Dialog>
      </div>
    );
};

export default FlowNodeModal;
