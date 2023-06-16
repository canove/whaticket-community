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
import useWhatsApps2 from "../../hooks/useWhatsApps2";

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

const BindTemplateModal = ({ open, onClose, templateId }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const [connections, setConnections] = useState([]);
  const [openConnectionsSelect, setOpenConnectionsSelect] = useState(false);

  const [selectedOfficialWhats, setSelectedOfficialWhats] = useState("");
  const [officialWhatsapps, setOfficialWhatsapps] = useState([]);
  const [template, setTemplate] = useState(null);
  const [templateStatuses, setTemplateStatuses] = useState([]);

  const { whatsapps } = useWhatsApps2({
    official: true,
    officialWhatsappId: selectedOfficialWhats,
    limit: -1,
  });

  useEffect(() => {
    const fetchOfficialWhats = async () => {
      try {
        const { data } = await api.get("/officialWhatsapps");
        setOfficialWhatsapps(data);
      } catch (err) {
        toastError(err);
      }
    };

    const fetchTemplate = async () => {
      if (!templateId) return;

      try {
        const { data } = await api.get(`/whatsappTemplate/show/${templateId}`);
        setTemplate(prevTemplate => ({
          ...prevTemplate,
          name: data.name,
          category: data.category,
          body: data.body,
          footer: data.footer,
          header: data.header ? JSON.parse(data.header) : null,
          mapping: Object.keys(JSON.parse(data.mapping)).length > 0 ? JSON.parse(data.mapping) : null
        }));

        setTemplateStatuses(data.officialTemplatesStatus);
      } catch (err) {
        toastError(err);
      }
    }

    fetchTemplate();
    fetchOfficialWhats();
  }, [open, templateId]);

  const handleClose = () => {
    onClose();
    setSelectedOfficialWhats("");
    setConnections([]);
    setTemplate(null);
    setTemplateStatuses([]);
  };

  const handleSubmit = async () => {
    const body = {
      whatsappIds: connections,
      templateId: templateId,
      officialWhatsappId: selectedOfficialWhats
    };

    try {
      await api.post("/whatsappTemplate/bind", body);
      toast.success("Vinculando números...");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleConnectionsChange = (e) => {
    const value = e.target.value;
    const allIndex = value.indexOf("all");

    if (allIndex !== -1 && allIndex === value.length - 1) {
      setConnections([]);

      const allConnections = ["all"];

      setConnections(allConnections);
      setOpenConnectionsSelect(false);
    } else {
      if ((allIndex || allIndex === 0) && allIndex !== -1) {
        value.splice(allIndex, 1);
      }
      setConnections(typeof value === "string" ? value.split(",") : value);
    }
  };

  const handleOpenConnectionsSelect = () => {
    setOpenConnectionsSelect(true);
  };

  const handleCloseConnectionsSelect = () => {
    setOpenConnectionsSelect(false);
  };

  const handleOffConnectionChange = (e) => {
    setSelectedOfficialWhats(e.target.value);
    setConnections([]);
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
        <DialogTitle id="form-dialog-title">Vincular Números</DialogTitle>
        <DialogContent dividers>
          <div className={classes.multFieldLine}>
            <Typography variant="subtitle1">
              Template: {template?.name}
            </Typography>
          </div>
          <div className={classes.multFieldLine}>
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="off-connection-type-select-label">
                Conexões
              </InputLabel>
              <Select
                labelId="off-connection-type-select-label"
                id="connection-type-select"
                value={selectedOfficialWhats}
                label="Conexões"
                onChange={handleOffConnectionChange}
                style={{ width: "100%" }}
                variant="outlined"
              >
                {officialWhatsapps.map((officialWhats) => (
                  <MenuItem key={officialWhats.id} value={officialWhats.id}>
                    {officialWhats.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {selectedOfficialWhats && (
            <div className={classes.multFieldLine}>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="connections-select-label">Telefones</InputLabel>
                <Select
                  variant="outlined"
                  labelId="connections-select-label"
                  id="connections-select"
                  value={connections}
                  label="Telefones"
                  onChange={handleConnectionsChange}
                  multiple
                  open={openConnectionsSelect}
                  onOpen={handleOpenConnectionsSelect}
                  onClose={handleCloseConnectionsSelect}
                  style={{ width: "100%" }}
                >
                  <MenuItem value={"all"}>
                    {i18n.t("importModal.form.all")}
                  </MenuItem>
                  {whatsapps.map((whats) => (
                    <MenuItem value={whats.id} key={whats.id}>
                      {whats.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
          <div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", borderRadius: "5px", padding: "5px", margin: "10px 0"}}>
            <Typography style={{ fontWeight: "bold" }}>
              Números com esse template:
            </Typography>
            { templateStatuses.length > 0 && templateStatuses.map(templateStatus => {
              const whats = templateStatus.whatsapp ? templateStatus.whatsapp.name : null;
              if (!whats) return null;
              return (
                <Typography key={templateStatus.id}>
                  - {whats}
                </Typography>
              )
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {i18n.t("flows.flowsModal.cancel")}
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

export default BindTemplateModal;
