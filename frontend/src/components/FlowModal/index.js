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

const FlowModal = ({ open, onClose, flowId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [name, setName] = useState("");
    const [status, setStatus] = useState("active");
    const [projectId, setProjectId] = useState("");
    const [agentId, setAgentId] = useState("");
    const [location, setLocation] = useState("");
    const [useExternalAccount, setUseExternalAccount] = useState(false);
    const [clientEmail, setClientEmail] = useState("");
    const [privateKey, setPrivateKey] = useState("");

    useEffect(() => {
      setName("");
      setStatus("active");
      setProjectId("");
      setAgentId("");
      setLocation("");
      setClientEmail("");
      setPrivateKey("");
      setUseExternalAccount(false);

      const fetchFlow = async () => {
        try {
          const { data } = await api.get(`/flows/${flowId}`);
          setName(data.name)
          setStatus(data.status);
          setProjectId(data.projectId);
          setAgentId(data.agentId);
          setLocation(data.location);
          setClientEmail(data.clientEmail);
          setPrivateKey(data.privateKey);

          if (data.clientEmail && data.privateKey) {
            setUseExternalAccount(true);
          }
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
      setProjectId("");
      setAgentId("");
      setLocation("");
      setClientEmail("");
      setPrivateKey("");
      setUseExternalAccount(false);
      onClose();
    };

    const handleNameChange = (e) => {
      setName(e.target.value);
    };

    const handleStatusChange = (e) => {
      setStatus(e.target.value);
    }

    const handleProjectIdChange = (e) => {
      setProjectId(e.target.value);
    };

    const handleAgentIdChange = (e) => {
      setAgentId(e.target.value);
    };

    const handleLocationChange = (e) => {
      setLocation(e.target.value);
    };

    const handleClientEmailChange = (e) => {
      setClientEmail(e.target.value);
    };

    const handlePrivateKeyChange = (e) => {
      setPrivateKey(e.target.value);
    };

    const handleUseExternalAccountChange = (e) => {
      setUseExternalAccount(e.target.checked);
    }

    const handleSubmit = async () => {
      if (useExternalAccount === true && (!clientEmail || !privateKey)) {
        toast.error("Email e Chave Privada são obrigatórios!");
        return false;
      }

      const flowData = {
          name: name,
          status: status,
          projectId: projectId,
          agentId: agentId,
          location: location,
          clientEmail: useExternalAccount ? clientEmail : "",
          privateKey: useExternalAccount ? privateKey : "",
          type: "dialogflow"
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
                <div className={classes.multFieldLine}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={useExternalAccount}
                        onChange={handleUseExternalAccountChange}
                        name="useExternalAccount"
                        color="primary"
                      />
                    }
                    label="Usar conta externa"
                  />
                </div>
                { useExternalAccount &&
                  <>
                    <div className={classes.multFieldLine}>
                      <TextField
                        as={TextField}
                        label="Email do Cliente"
                        value={clientEmail}
                        name="clientEmail"
                        onChange={(e) => { handleClientEmailChange(e) }}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                      />
                    </div>
                    <div className={classes.multFieldLine}>
                      <TextField
                        as={TextField}
                        label="Chave Privada"
                        value={privateKey}
                        name="privateKey"
                        onChange={(e) => { handlePrivateKeyChange(e) }}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                      />
                    </div>
                  </>
                }
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label="ID do Projeto"
                    value={projectId}
                    name="projectId"
                    onChange={(e) => { handleProjectIdChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label="ID do Agente"
                    value={agentId}
                    name="agentId"
                    onChange={(e) => { handleAgentIdChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label="Local"
                    value={location}
                    name="location"
                    onChange={(e) => { handleLocationChange(e) }}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
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

export default FlowModal;
